# Thumbnail Upload via GraphQL + Storage Backend Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the REST multipart thumbnail upload with a GraphQL presigned-URL flow, and split the MinIO/S3 storage implementation into separate, independently-pluggable files.

**Architecture:** Two new REST endpoints in `uigraph-api` (prepare → presigned PUT URL, confirm → DB update) are exposed as two GraphQL mutations in `uigraph-graphql`; the frontend calls prepare, PUTs the file directly to storage, then calls confirm. The storage layer is split into `minio.go`, `s3.go`, and a factory `new.go` so adding future vendors requires only a new file.

**Tech Stack:** Go 1.25, `github.com/minio/minio-go/v7` (MinIO), `github.com/aws/aws-sdk-go-v2/service/s3` (S3), `github.com/99designs/gqlgen` v0.17.73, React/Apollo Client (frontend)

## Global Constraints

- Module `github.com/uigraph/app` = `uigraph-api` repo at `/uigraph-oss/uigraph-api`
- Module `github.com/uigraph/graphql` = `uigraph-graphql` repo at `/uigraph-oss/uigraph-graphql`
- Frontend root: `/uigraph-oss/uigraph-ui`
- GraphQL v2 imports use `@/api-v2` (per CLAUDE.md); filenames must be `*-v2.{ts,tsx}`
- gqlgen regeneration command: `go generate ./internal/graph/...` (run from `uigraph-graphql` root)
- Commit after every task

---

## File Map

| File | Action | Task |
|------|--------|------|
| `uigraph-api/internal/storage/minio.go` | Modify — remove `Config`, `New()`, `newMinio()`; rename constructor to `newMinioClient` | 1 |
| `uigraph-api/internal/storage/new.go` | Create — `Config` struct + `New()` factory | 1 |
| `uigraph-api/internal/storage/s3.go` | Create — `s3Client` implementing `Client` using AWS SDK v2 | 2 |
| `uigraph-api/go.mod` + `go.sum` | Modify — add AWS SDK v2 deps | 2 |
| `uigraph-api/internal/api/diagram/handler.go` | Modify — add `PresignPutURL` to `objectStore` interface; register two new routes | 3 |
| `uigraph-api/internal/api/diagram/diagram.go` | Modify — add `PrepareThumbnailUpload` + `ConfirmThumbnailUpload` handlers | 3 |
| `uigraph-api/internal/api/diagram/diagram_test.go` | Modify — add `presignPutURLFn` to `fakeObjectStore`; add tests for two new handlers | 3 |
| `uigraph-graphql/internal/uigraphapi/diagram.go` | Modify — add `DiagramThumbnailUpload` struct + two client methods | 4 |
| `uigraph-graphql/internal/graph/schema/diagram.graphqls` | Modify — add `DiagramThumbnailUpload` type + two mutations | 5 |
| `uigraph-graphql/internal/graph/resolver.go` | Modify — add two methods to `diagramClient` interface | 5 |
| `uigraph-graphql/internal/graph/generated/generated.go` | Regenerate via `go generate` | 5 |
| `uigraph-graphql/internal/graph/model/models_gen.go` | Regenerate via `go generate` | 5 |
| `uigraph-graphql/internal/graph/diagram.resolvers.go` | Modify — add two resolver methods | 5 |
| `uigraph-graphql/internal/graph/resolver_test.go` | Modify — add `fakeDiagramClient` thumbnail methods + resolver tests | 5 |
| `uigraph-ui/src/features/diagram-portal/api/thumbnail-v2.ts` | Create — two GraphQL mutations | 6 |
| `uigraph-ui/src/features/diagram-portal/hooks/use-diagram-mutation.ts` | Modify — replace `uploadThumbnailFile` REST call with GraphQL presigned flow | 6 |

---

## Task 1: Split `minio.go` into `minio.go` + `new.go`

No behavior change — pure reorganization. `Config` and `New()` move to `new.go`; `minio.go` keeps only the `minioClient` struct and its methods under a renamed private constructor.

**Files:**
- Modify: `uigraph-api/internal/storage/minio.go`
- Create: `uigraph-api/internal/storage/new.go`

**Interfaces:**
- Produces: `New(cfg Config) (Client, error)` in `new.go` — used by all callers (unchanged signature)
- Produces: `newMinioClient(cfg Config) (Client, error)` in `minio.go` — called only by `new.go`

- [ ] **Step 1: Create `new.go` with `Config` and factory**

File: `uigraph-api/internal/storage/new.go`
```go
package storage

import "fmt"

// Config is the minimal configuration needed to create a storage client.
type Config struct {
	Backend   string // "minio" | "s3"
	Endpoint  string
	Bucket    string
	AccessKey string
	SecretKey string
	Region    string
	// PublicEndpoint is the browser-reachable host used when signing presigned
	// GET/PUT URLs. When empty, Endpoint is used. Only relevant for MinIO.
	PublicEndpoint string
}

// New creates a storage Client for the given backend.
func New(cfg Config) (Client, error) {
	switch cfg.Backend {
	case "s3":
		return nil, fmt.Errorf("storage: s3 backend not yet implemented")
	default: // "minio" and anything else falls through to MinIO
		return newMinioClient(cfg)
	}
}
```

- [ ] **Step 2: Trim `minio.go` — remove `Config`, `New()`, `newMinio()`**

Replace the full contents of `uigraph-api/internal/storage/minio.go` with:

```go
package storage

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type minioClient struct {
	mc        *minio.Client
	presignMC *minio.Client
	bucket    string
	backend   string
}

// newMinioClient builds a Client backed by MinIO (or any S3-compatible endpoint
// that the MinIO SDK supports). Called by New() when Backend != "s3".
func newMinioClient(cfg Config) (Client, error) {
	mc, err := buildMinio(cfg.Endpoint, cfg)
	if err != nil {
		return nil, err
	}

	presignMC := mc
	if cfg.PublicEndpoint != "" {
		presignMC, err = buildMinio(cfg.PublicEndpoint, cfg)
		if err != nil {
			return nil, err
		}
	}

	return &minioClient{mc: mc, presignMC: presignMC, bucket: cfg.Bucket, backend: cfg.Backend}, nil
}

// buildMinio creates a raw minio.Client for the given endpoint.
func buildMinio(endpoint string, cfg Config) (*minio.Client, error) {
	secure := !strings.Contains(endpoint, "http://")
	host := strings.TrimPrefix(endpoint, "https://")
	host = strings.TrimPrefix(host, "http://")

	if cfg.Backend == "s3" && endpoint == "" {
		host = "s3.amazonaws.com"
		secure = true
	}

	return minio.New(host, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: secure,
		Region: cfg.Region,
	})
}

func (c *minioClient) EnsureBucket(ctx context.Context) error {
	exists, err := c.mc.BucketExists(ctx, c.bucket)
	if err != nil {
		return err
	}
	if !exists {
		if err := c.mc.MakeBucket(ctx, c.bucket, minio.MakeBucketOptions{}); err != nil {
			return err
		}
	}
	if c.backend == "minio" {
		if err := c.mc.SetBucketPolicy(ctx, c.bucket, ""); err != nil {
			return fmt.Errorf("storage: clear bucket policy: %w", err)
		}
	}
	return nil
}

func (c *minioClient) Upload(ctx context.Context, key, contentType string, r io.Reader, size int64) error {
	_, err := c.mc.PutObject(ctx, c.bucket, key, r, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	return err
}

func (c *minioClient) Download(ctx context.Context, key string) (io.ReadCloser, error) {
	return c.mc.GetObject(ctx, c.bucket, key, minio.GetObjectOptions{})
}

func (c *minioClient) Delete(ctx context.Context, key string) error {
	return c.mc.RemoveObject(ctx, c.bucket, key, minio.RemoveObjectOptions{})
}

func (c *minioClient) PresignURL(ctx context.Context, key string, ttl time.Duration) (string, error) {
	u, err := c.presignMC.PresignedGetObject(ctx, c.bucket, key, ttl, url.Values{})
	if err != nil {
		return "", err
	}
	return u.String(), nil
}

func (c *minioClient) PresignPutURL(ctx context.Context, key string) (string, error) {
	u, err := c.mc.PresignedPutObject(ctx, c.bucket, key, 15*time.Minute)
	if err != nil {
		return "", err
	}
	return u.String(), nil
}
```

- [ ] **Step 3: Verify it compiles**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-api
go build ./internal/storage/...
```
Expected: no output (clean build)

- [ ] **Step 4: Commit**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-api
git add internal/storage/minio.go internal/storage/new.go
git commit -m "refactor: split storage minio.go into minio.go + new.go factory"
```

---

## Task 2: Add S3 backend using AWS SDK v2

**Files:**
- Create: `uigraph-api/internal/storage/s3.go`
- Modify: `uigraph-api/go.mod`, `uigraph-api/go.sum`

**Interfaces:**
- Consumes: `Config` from `new.go` (Task 1)
- Produces: `newS3Client(cfg Config) (Client, error)` — called by `New()` in `new.go`

- [ ] **Step 1: Add AWS SDK v2 dependencies**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-api
go get github.com/aws/aws-sdk-go-v2/credentials@latest
go get github.com/aws/aws-sdk-go-v2/service/s3@latest
go mod tidy
```
Expected: `go.mod` and `go.sum` updated, no errors.

- [ ] **Step 2: Create `s3.go`**

File: `uigraph-api/internal/storage/s3.go`
```go
package storage

import (
	"context"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3types "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type s3Client struct {
	client  *s3.Client
	presign *s3.PresignClient
	bucket  string
	region  string
}

// newS3Client builds a Client backed by AWS S3 using the AWS SDK v2.
func newS3Client(cfg Config) (Client, error) {
	creds := credentials.NewStaticCredentialsProvider(cfg.AccessKey, cfg.SecretKey, "")
	awsCfg := aws.Config{
		Region:      cfg.Region,
		Credentials: creds,
	}

	opts := []func(*s3.Options){}
	if cfg.Endpoint != "" {
		awsCfg.BaseEndpoint = aws.String(cfg.Endpoint)
		// Path-style addressing is required for custom endpoints (e.g. localstack).
		opts = append(opts, func(o *s3.Options) { o.UsePathStyle = true })
	}

	client := s3.NewFromConfig(awsCfg, opts...)
	return &s3Client{
		client:  client,
		presign: s3.NewPresignClient(client),
		bucket:  cfg.Bucket,
		region:  cfg.Region,
	}, nil
}

func (c *s3Client) EnsureBucket(ctx context.Context) error {
	_, err := c.client.HeadBucket(ctx, &s3.HeadBucketInput{Bucket: aws.String(c.bucket)})
	if err == nil {
		return nil // already exists
	}
	input := &s3.CreateBucketInput{Bucket: aws.String(c.bucket)}
	// us-east-1 is the S3 default region; specifying it in CreateBucketConfiguration is an error.
	if c.region != "" && c.region != "us-east-1" {
		input.CreateBucketConfiguration = &s3types.CreateBucketConfiguration{
			LocationConstraint: s3types.BucketLocationConstraint(c.region),
		}
	}
	_, err = c.client.CreateBucket(ctx, input)
	return err
}

func (c *s3Client) Upload(ctx context.Context, key, contentType string, r io.Reader, size int64) error {
	input := &s3.PutObjectInput{
		Bucket:      aws.String(c.bucket),
		Key:         aws.String(key),
		Body:        r,
		ContentType: aws.String(contentType),
	}
	if size >= 0 {
		input.ContentLength = aws.Int64(size)
	}
	_, err := c.client.PutObject(ctx, input)
	return err
}

func (c *s3Client) Download(ctx context.Context, key string) (io.ReadCloser, error) {
	out, err := c.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	return out.Body, nil
}

func (c *s3Client) Delete(ctx context.Context, key string) error {
	_, err := c.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})
	return err
}

func (c *s3Client) PresignURL(ctx context.Context, key string, ttl time.Duration) (string, error) {
	req, err := c.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (c *s3Client) PresignPutURL(ctx context.Context, key string) (string, error) {
	req, err := c.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}
```

- [ ] **Step 3: Wire `newS3Client` into the factory in `new.go`**

Replace the `s3` case in `new.go`:
```go
case "s3":
    return newS3Client(cfg)
```

- [ ] **Step 4: Compile check**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-api
go build ./internal/storage/...
```
Expected: no output

- [ ] **Step 5: Verify compile-time interface satisfaction** (add to `s3.go`, then remove after check if preferred)

At the bottom of `s3.go`, temporarily add:
```go
var _ Client = (*s3Client)(nil)
```
Run `go build ./internal/storage/...`. If it passes, the interface is satisfied. Remove the line after confirming.

- [ ] **Step 6: Commit**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-api
git add internal/storage/s3.go internal/storage/new.go go.mod go.sum
git commit -m "feat: add S3 storage backend using AWS SDK v2"
```

---

## Task 3: New REST handlers — `PrepareThumbnailUpload` + `ConfirmThumbnailUpload`

**Files:**
- Modify: `uigraph-api/internal/api/diagram/handler.go`
- Modify: `uigraph-api/internal/api/diagram/diagram.go`
- Modify: `uigraph-api/internal/api/diagram/diagram_test.go`

**Interfaces:**
- Produces:
  - `POST /api/v1/orgs/{orgID}/diagrams/{diagramID}/thumbnail/prepare` → `{ "uploadUrl": string, "assetId": string }`
  - `POST /api/v1/orgs/{orgID}/diagrams/{diagramID}/thumbnail/confirm` body `{ "contentHash": string }` → `{ "ok": true }`

- [ ] **Step 1: Write failing tests first**

Add to the bottom of `uigraph-api/internal/api/diagram/diagram_test.go`:

```go
// ── PrepareThumbnailUpload ────────────────────────────────────────────────────

func TestPrepareThumbnailUpload_success(t *testing.T) {
	dg := &diagrampkg.Diagram{ID: "d1", OrgID: "org-1", Name: "Flow"}
	s := &fakeDiagramStore{
		getDiagramFn: func(_ context.Context, id string) (*diagrampkg.Diagram, error) {
			if id == "d1" {
				return dg, nil
			}
			return nil, nil
		},
	}
	st := &fakeObjectStore{
		presignPutURLFn: func(_ context.Context, key string) (string, error) {
			return "https://storage.example.com/put/" + key, nil
		},
	}
	h := New(s, st, nil)

	r := withAuth(newReq(http.MethodPost, "/api/v1/orgs/org-1/diagrams/d1/thumbnail/prepare", nil))
	r.SetPathValue("diagramID", "d1")
	w := httptest.NewRecorder()
	h.PrepareThumbnailUpload(w, r)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	var got map[string]string
	if err := json.NewDecoder(w.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	if got["uploadUrl"] == "" {
		t.Fatal("expected uploadUrl in response")
	}
	if got["assetId"] == "" {
		t.Fatal("expected assetId in response")
	}
}

func TestPrepareThumbnailUpload_unauthenticated_returns401(t *testing.T) {
	h := New(&fakeDiagramStore{}, &fakeObjectStore{}, nil)

	r := newReq(http.MethodPost, "/api/v1/orgs/org-1/diagrams/d1/thumbnail/prepare", nil)
	r.SetPathValue("diagramID", "d1")
	w := httptest.NewRecorder()
	h.PrepareThumbnailUpload(w, r)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

func TestPrepareThumbnailUpload_notFound_returns404(t *testing.T) {
	s := &fakeDiagramStore{
		getDiagramFn: func(_ context.Context, _ string) (*diagrampkg.Diagram, error) {
			return nil, nil
		},
	}
	h := New(s, &fakeObjectStore{}, nil)

	r := withAuth(newReq(http.MethodPost, "/api/v1/orgs/org-1/diagrams/missing/thumbnail/prepare", nil))
	r.SetPathValue("diagramID", "missing")
	w := httptest.NewRecorder()
	h.PrepareThumbnailUpload(w, r)

	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}

// ── ConfirmThumbnailUpload ────────────────────────────────────────────────────

func TestConfirmThumbnailUpload_success(t *testing.T) {
	dg := &diagrampkg.Diagram{ID: "d1", OrgID: "org-1", Name: "Flow"}
	var updatedDiagram diagrampkg.Diagram
	s := &fakeDiagramStore{
		getDiagramFn: func(_ context.Context, id string) (*diagrampkg.Diagram, error) {
			if id == "d1" {
				return dg, nil
			}
			return nil, nil
		},
		updateDiagramFn: func(_ context.Context, d diagrampkg.Diagram) error {
			updatedDiagram = d
			return nil
		},
	}
	h := New(s, &fakeObjectStore{}, nil)

	body, _ := json.Marshal(map[string]any{"contentHash": "abc123"})
	r := withAuth(newReq(http.MethodPost, "/api/v1/orgs/org-1/diagrams/d1/thumbnail/confirm", body))
	r.SetPathValue("diagramID", "d1")
	w := httptest.NewRecorder()
	h.ConfirmThumbnailUpload(w, r)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	if updatedDiagram.PreviewContentHash == nil || *updatedDiagram.PreviewContentHash != "abc123" {
		t.Fatalf("expected PreviewContentHash=abc123, got %v", updatedDiagram.PreviewContentHash)
	}
	if updatedDiagram.PreviewAssetID == nil {
		t.Fatal("expected PreviewAssetID to be set")
	}
}

func TestConfirmThumbnailUpload_missingHash_returns400(t *testing.T) {
	dg := &diagrampkg.Diagram{ID: "d1", OrgID: "org-1"}
	s := &fakeDiagramStore{
		getDiagramFn: func(_ context.Context, _ string) (*diagrampkg.Diagram, error) {
			return dg, nil
		},
	}
	h := New(s, &fakeObjectStore{}, nil)

	body, _ := json.Marshal(map[string]any{"contentHash": ""})
	r := withAuth(newReq(http.MethodPost, "/api/v1/orgs/org-1/diagrams/d1/thumbnail/confirm", body))
	r.SetPathValue("diagramID", "d1")
	w := httptest.NewRecorder()
	h.ConfirmThumbnailUpload(w, r)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestConfirmThumbnailUpload_unauthenticated_returns401(t *testing.T) {
	h := New(&fakeDiagramStore{}, &fakeObjectStore{}, nil)

	body, _ := json.Marshal(map[string]any{"contentHash": "abc"})
	r := newReq(http.MethodPost, "/api/v1/orgs/org-1/diagrams/d1/thumbnail/confirm", body)
	r.SetPathValue("diagramID", "d1")
	w := httptest.NewRecorder()
	h.ConfirmThumbnailUpload(w, r)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}
```

- [ ] **Step 2: Run tests — expect compile failure**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-api
go test ./internal/api/diagram/... 2>&1 | head -20
```
Expected: compile error — `fakeObjectStore` missing `presignPutURLFn`, `PrepareThumbnailUpload` and `ConfirmThumbnailUpload` undefined.

- [ ] **Step 3: Update `fakeObjectStore` in `diagram_test.go`**

Replace the existing `fakeObjectStore` definition (lines ~72–83):
```go
type fakeObjectStore struct {
	uploadFn        func(ctx context.Context, key, contentType string, body io.Reader, size int64) error
	downloadFn      func(ctx context.Context, key string) (io.ReadCloser, error)
	presignPutURLFn func(ctx context.Context, key string) (string, error)
}

func (f *fakeObjectStore) Upload(ctx context.Context, key, contentType string, body io.Reader, size int64) error {
	if f.uploadFn != nil {
		return f.uploadFn(ctx, key, contentType, body, size)
	}
	return nil
}
func (f *fakeObjectStore) Download(ctx context.Context, key string) (io.ReadCloser, error) {
	if f.downloadFn != nil {
		return f.downloadFn(ctx, key)
	}
	return nil, nil
}
func (f *fakeObjectStore) PresignPutURL(ctx context.Context, key string) (string, error) {
	if f.presignPutURLFn != nil {
		return f.presignPutURLFn(ctx, key)
	}
	return "https://presigned.example.com/" + key, nil
}
```

- [ ] **Step 4: Add `PresignPutURL` to the `objectStore` interface in `handler.go`**

In `uigraph-api/internal/api/diagram/handler.go`, replace the `objectStore` interface:
```go
// objectStore is the minimal storage interface this package needs.
type objectStore interface {
	Upload(ctx context.Context, key, contentType string, body io.Reader, size int64) error
	Download(ctx context.Context, key string) (io.ReadCloser, error)
	PresignPutURL(ctx context.Context, key string) (string, error)
}
```

- [ ] **Step 5: Register new routes in `handler.go`**

In the `Register` function, add after the existing thumbnail route:
```go
requireScope("diagrams:write", "POST", "/api/v1/orgs/{orgID}/diagrams/{diagramID}/thumbnail/prepare", h.PrepareThumbnailUpload)
requireScope("diagrams:write", "POST", "/api/v1/orgs/{orgID}/diagrams/{diagramID}/thumbnail/confirm", h.ConfirmThumbnailUpload)
```

- [ ] **Step 6: Add handler implementations to `diagram.go`**

Add at the end of `uigraph-api/internal/api/diagram/diagram.go` (before `sha256Hex`):
```go
func (h *Handler) PrepareThumbnailUpload(w http.ResponseWriter, r *http.Request) {
	diagramID := r.PathValue("diagramID")
	_, ok := authmw.PrincipalFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}

	dg, err := h.store.GetDiagram(r.Context(), diagramID)
	if err != nil {
		httputil.Error(w, r, err)
		return
	}
	if dg == nil || dg.DeletedAt != nil {
		httputil.Error(w, r, storepkg.ErrNotFound)
		return
	}

	assetID := storage.DiagramThumbnailAssetID(diagramID)
	uploadURL, err := h.storage.PresignPutURL(r.Context(), storage.AssetKey(assetID))
	if err != nil {
		httputil.Error(w, r, err)
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]any{
		"uploadUrl": uploadURL,
		"assetId":   assetID,
	})
}

func (h *Handler) ConfirmThumbnailUpload(w http.ResponseWriter, r *http.Request) {
	diagramID := r.PathValue("diagramID")
	p, ok := authmw.PrincipalFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}

	dg, err := h.store.GetDiagram(r.Context(), diagramID)
	if err != nil {
		httputil.Error(w, r, err)
		return
	}
	if dg == nil || dg.DeletedAt != nil {
		httputil.Error(w, r, storepkg.ErrNotFound)
		return
	}

	var body struct {
		ContentHash string `json:"contentHash"`
	}
	if err := httputil.Decode(r, &body); err != nil {
		httputil.BadRequest(w, "invalid request body")
		return
	}
	if body.ContentHash == "" {
		httputil.BadRequest(w, "contentHash is required")
		return
	}

	assetID := storage.DiagramThumbnailAssetID(diagramID)
	dg.PreviewAssetID = &assetID
	dg.PreviewContentHash = &body.ContentHash
	dg.UpdatedBy = &p.UserID
	if err := h.store.UpdateDiagram(r.Context(), *dg); err != nil {
		httputil.Error(w, r, err)
		return
	}

	if h.cache != nil {
		_ = h.cache.Del(r.Context(), cache.AssetURLKey(assetID))
	}

	httputil.JSON(w, http.StatusOK, map[string]any{"ok": true})
}
```

- [ ] **Step 7: Run tests — expect pass**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-api
go test ./internal/api/diagram/... -v 2>&1 | tail -20
```
Expected: all tests pass, `ok github.com/uigraph/app/internal/api/diagram`

- [ ] **Step 8: Build the whole api to catch any broken callers**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-api
go build ./...
```
Expected: no output

- [ ] **Step 9: Commit**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-api
git add internal/api/diagram/handler.go internal/api/diagram/diagram.go internal/api/diagram/diagram_test.go
git commit -m "feat: add PrepareThumbnailUpload and ConfirmThumbnailUpload REST handlers"
```

---

## Task 4: Add `DiagramThumbnailUpload` type and client methods to `uigraph-graphql`

**Files:**
- Modify: `uigraph-graphql/internal/uigraphapi/diagram.go`

**Interfaces:**
- Produces:
  - `type DiagramThumbnailUpload struct { UploadURL, AssetID string }`
  - `(*Client).PrepareDiagramThumbnailUpload(ctx, orgID, diagramID string) (*DiagramThumbnailUpload, error)`
  - `(*Client).ConfirmDiagramThumbnailUpload(ctx, orgID, diagramID, contentHash string) error`

- [ ] **Step 1: Add the struct and two client methods**

Append to the end of `uigraph-graphql/internal/uigraphapi/diagram.go`:
```go
// DiagramThumbnailUpload is the response from PrepareDiagramThumbnailUpload.
type DiagramThumbnailUpload struct {
	UploadURL string `json:"uploadUrl"`
	AssetID   string `json:"assetId"`
}

// PrepareDiagramThumbnailUpload calls POST /thumbnail/prepare and returns a
// presigned PUT URL plus the deterministic asset ID for the diagram thumbnail.
func (c *Client) PrepareDiagramThumbnailUpload(ctx context.Context, orgID, diagramID string) (*DiagramThumbnailUpload, error) {
	var out DiagramThumbnailUpload
	return &out, c.post(ctx, fmt.Sprintf("/api/v1/orgs/%s/diagrams/%s/thumbnail/prepare", orgID, diagramID), nil, &out)
}

// ConfirmDiagramThumbnailUpload calls POST /thumbnail/confirm after the client
// has uploaded the file directly to storage via the presigned PUT URL.
func (c *Client) ConfirmDiagramThumbnailUpload(ctx context.Context, orgID, diagramID, contentHash string) error {
	return c.post(ctx, fmt.Sprintf("/api/v1/orgs/%s/diagrams/%s/thumbnail/confirm", orgID, diagramID),
		map[string]any{"contentHash": contentHash}, nil)
}
```

- [ ] **Step 2: Compile check**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-graphql
go build ./internal/uigraphapi/...
```
Expected: no output

- [ ] **Step 3: Commit**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-graphql
git add internal/uigraphapi/diagram.go
git commit -m "feat: add DiagramThumbnailUpload type and prepare/confirm client methods"
```

---

## Task 5: GraphQL schema, gqlgen codegen, and resolvers

**Files:**
- Modify: `uigraph-graphql/internal/graph/schema/diagram.graphqls`
- Modify: `uigraph-graphql/internal/graph/resolver.go`
- Regenerate: `uigraph-graphql/internal/graph/generated/generated.go`, `uigraph-graphql/internal/graph/model/models_gen.go`
- Modify: `uigraph-graphql/internal/graph/diagram.resolvers.go`
- Modify: `uigraph-graphql/internal/graph/resolver_test.go`

**Interfaces:**
- Consumes: `uigraphapi.DiagramThumbnailUpload`, `(*Client).PrepareDiagramThumbnailUpload`, `(*Client).ConfirmDiagramThumbnailUpload` (Task 4)
- Produces:
  - GraphQL type `DiagramThumbnailUpload { uploadUrl: String!, assetId: String! }`
  - GraphQL mutation `prepareDiagramThumbnailUpload(orgId, diagramId)` → `DiagramThumbnailUpload!`
  - GraphQL mutation `confirmDiagramThumbnailUpload(orgId, diagramId, contentHash)` → `Boolean!`

- [ ] **Step 1: Write a failing resolver test first**

Add to `uigraph-graphql/internal/graph/resolver_test.go`. The existing file has `fakeAuthClient` and `fakeFolderClient`. There is no `fakeDiagramClient` yet — add it in full. Also add `"strings"` to the import block if it is not already there.

```go
// Add this full struct to resolver_test.go (no fakeDiagramClient exists yet):
type fakeDiagramClient struct {
	prepareThumbnailFn func(ctx context.Context, orgID, diagramID string) (*uigraphapi.DiagramThumbnailUpload, error)
	confirmThumbnailFn func(ctx context.Context, orgID, diagramID, hash string) error
}

func (f *fakeDiagramClient) ListDiagrams(_ context.Context, _, _ string) ([]uigraphapi.Diagram, error) {
	return nil, nil
}
func (f *fakeDiagramClient) GetDiagram(_ context.Context, _, _ string) (*uigraphapi.Diagram, error) {
	return nil, nil
}
func (f *fakeDiagramClient) GetDiagramContent(_ context.Context, _, _ string) (string, error) {
	return "", nil
}
func (f *fakeDiagramClient) CreateDiagram(_ context.Context, _ string, _ map[string]interface{}) (*uigraphapi.Diagram, error) {
	return nil, nil
}
func (f *fakeDiagramClient) UpdateDiagram(_ context.Context, _, _ string, _ map[string]interface{}) (*uigraphapi.Diagram, error) {
	return nil, nil
}
func (f *fakeDiagramClient) DeleteDiagram(_ context.Context, _, _ string) error { return nil }
func (f *fakeDiagramClient) ListDiagramImages(_ context.Context, _, _ string) ([]uigraphapi.DiagramImage, error) {
	return nil, nil
}
func (f *fakeDiagramClient) SyncDiagram(_ context.Context, _ string, _ map[string]interface{}) (map[string]interface{}, error) {
	return nil, nil
}
func (f *fakeDiagramClient) ListDiagramVersions(_ context.Context, _, _ string) ([]uigraphapi.DiagramVersion, error) {
	return nil, nil
}
func (f *fakeDiagramClient) CreateDiagramVersion(_ context.Context, _, _ string, _ map[string]interface{}) (*uigraphapi.DiagramVersion, error) {
	return nil, nil
}
func (f *fakeDiagramClient) GetDiagramVersionContent(_ context.Context, _, _, _ string) (string, error) {
	return "", nil
}
func (f *fakeDiagramClient) RestoreDiagramVersion(_ context.Context, _, _, _ string) (*uigraphapi.Diagram, error) {
	return nil, nil
}
func (f *fakeDiagramClient) PrepareDiagramThumbnailUpload(ctx context.Context, orgID, diagramID string) (*uigraphapi.DiagramThumbnailUpload, error) {
	if f.prepareThumbnailFn != nil {
		return f.prepareThumbnailFn(ctx, orgID, diagramID)
	}
	return &uigraphapi.DiagramThumbnailUpload{UploadURL: "https://storage.example.com/put", AssetID: "diagram_" + diagramID}, nil
}
func (f *fakeDiagramClient) ConfirmDiagramThumbnailUpload(ctx context.Context, orgID, diagramID, hash string) error {
	if f.confirmThumbnailFn != nil {
		return f.confirmThumbnailFn(ctx, orgID, diagramID, hash)
	}
	return nil
}

// Add these test functions:
func TestPrepareDiagramThumbnailUpload_returnsUploadURL(t *testing.T) {
	dc := &fakeDiagramClient{}
	r := &graph.Resolver{DiagramAPI: dc}
	srv := newTestServer(r)
	defer srv.Close()

	body := `{"query":"mutation { prepareDiagramThumbnailUpload(orgId:\"org-1\", diagramId:\"d1\") { uploadUrl assetId } }"}`
	resp, err := http.Post(srv.URL+"/query", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	var result struct {
		Data struct {
			PrepareDiagramThumbnailUpload struct {
				UploadURL string `json:"uploadUrl"`
				AssetID   string `json:"assetId"`
			} `json:"prepareDiagramThumbnailUpload"`
		} `json:"data"`
		Errors []struct{ Message string } `json:"errors"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	if len(result.Errors) > 0 {
		t.Fatalf("graphql errors: %v", result.Errors)
	}
	if result.Data.PrepareDiagramThumbnailUpload.UploadURL == "" {
		t.Fatal("expected uploadUrl")
	}
}

func TestConfirmDiagramThumbnailUpload_returnsTrue(t *testing.T) {
	dc := &fakeDiagramClient{}
	r := &graph.Resolver{DiagramAPI: dc}
	srv := newTestServer(r)
	defer srv.Close()

	body := `{"query":"mutation { confirmDiagramThumbnailUpload(orgId:\"org-1\", diagramId:\"d1\", contentHash:\"abc\") }"}`
	resp, err := http.Post(srv.URL+"/query", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ConfirmDiagramThumbnailUpload bool `json:"confirmDiagramThumbnailUpload"`
		} `json:"data"`
		Errors []struct{ Message string } `json:"errors"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	if len(result.Errors) > 0 {
		t.Fatalf("graphql errors: %v", result.Errors)
	}
	if !result.Data.ConfirmDiagramThumbnailUpload {
		t.Fatal("expected true")
	}
}
```

Also add `"strings"` to the imports in `resolver_test.go` if not already present.

- [ ] **Step 2: Run test — expect compile failure**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-graphql
go test ./internal/graph/... 2>&1 | head -15
```
Expected: compile error — `fakeDiagramClient` missing thumbnail methods (if it already existed), or `diagramClient` interface not yet updated.

- [ ] **Step 3: Update the GraphQL schema**

In `uigraph-graphql/internal/graph/schema/diagram.graphqls`, add the new type and extend the Mutation block.

Add the type **before** the first `extend type Query`:
```graphql
type DiagramThumbnailUpload {
    uploadUrl: String!
    assetId:   String!
}
```

Add two lines inside the existing `extend type Mutation { ... }` block:
```graphql
    prepareDiagramThumbnailUpload(orgId: ID!, diagramId: ID!):                      DiagramThumbnailUpload!
    confirmDiagramThumbnailUpload(orgId: ID!, diagramId: ID!, contentHash: String!): Boolean!
```

- [ ] **Step 4: Update the `diagramClient` interface in `resolver.go`**

Add to the `diagramClient` interface in `uigraph-graphql/internal/graph/resolver.go`:
```go
PrepareDiagramThumbnailUpload(ctx context.Context, orgID, diagramID string) (*uigraphapi.DiagramThumbnailUpload, error)
ConfirmDiagramThumbnailUpload(ctx context.Context, orgID, diagramID, contentHash string) error
```

- [ ] **Step 5: Run gqlgen codegen**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-graphql
go generate ./internal/graph/...
```
Expected: regenerates `generated/generated.go` and `model/models_gen.go`. The model will contain:
```go
type DiagramThumbnailUpload struct {
    UploadURL string `json:"uploadUrl"`
    AssetID   string `json:"assetId"`
}
```
gqlgen also stubs out the two new resolver methods at the bottom of `diagram.resolvers.go`.

- [ ] **Step 6: Implement the resolver stubs in `diagram.resolvers.go`**

gqlgen appends the two new stubs at the **bottom** of `diagram.resolvers.go`. They will look like:
```go
func (r *mutationResolver) PrepareDiagramThumbnailUpload(...) (*model.DiagramThumbnailUpload, error) {
    panic(fmt.Errorf("not implemented: PrepareDiagramThumbnailUpload"))
}
func (r *mutationResolver) ConfirmDiagramThumbnailUpload(...) (bool, error) {
    panic(fmt.Errorf("not implemented: ConfirmDiagramThumbnailUpload"))
}
```
Replace both stubs with:
```go
// PrepareDiagramThumbnailUpload is the resolver for prepareDiagramThumbnailUpload.
func (r *mutationResolver) PrepareDiagramThumbnailUpload(ctx context.Context, orgID string, diagramID string) (*model.DiagramThumbnailUpload, error) {
	out, err := r.DiagramAPI.PrepareDiagramThumbnailUpload(ctx, orgID, diagramID)
	if err != nil {
		return nil, err
	}
	return &model.DiagramThumbnailUpload{UploadURL: out.UploadURL, AssetID: out.AssetID}, nil
}

// ConfirmDiagramThumbnailUpload is the resolver for confirmDiagramThumbnailUpload.
func (r *mutationResolver) ConfirmDiagramThumbnailUpload(ctx context.Context, orgID string, diagramID string, contentHash string) (bool, error) {
	return true, r.DiagramAPI.ConfirmDiagramThumbnailUpload(ctx, orgID, diagramID, contentHash)
}
```

- [ ] **Step 7: Run all graphql tests**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-graphql
go test ./... 2>&1 | tail -20
```
Expected: all tests pass

- [ ] **Step 8: Commit**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-graphql
git add internal/graph/schema/diagram.graphqls \
        internal/graph/resolver.go \
        internal/graph/diagram.resolvers.go \
        internal/graph/generated/generated.go \
        internal/graph/model/models_gen.go \
        internal/graph/resolver_test.go
git commit -m "feat: add prepareDiagramThumbnailUpload and confirmDiagramThumbnailUpload GraphQL mutations"
```

---

## Task 6: Frontend — replace REST thumbnail upload with GraphQL presigned flow

**Files:**
- Create: `uigraph-ui/src/features/diagram-portal/api/thumbnail-v2.ts`
- Modify: `uigraph-ui/src/features/diagram-portal/hooks/use-diagram-mutation.ts`

**Interfaces:**
- Consumes: `clientV2` (already imported in `use-diagram-mutation.ts` via `@/api-v2/client`), `generateDiagramThumbnailFile` (already imported)
- The `contentHash` for the confirm call is the `updateHash` already computed in `getThumbnailFile()`

- [ ] **Step 1: Create the mutations file**

File: `uigraph-ui/src/features/diagram-portal/api/thumbnail-v2.ts`
```ts
import { graphql } from '@/api-v2'

export const PREPARE_DIAGRAM_THUMBNAIL_UPLOAD = graphql(`
  mutation PrepareDiagramThumbnailUpload($orgId: ID!, $diagramId: ID!) {
    prepareDiagramThumbnailUpload(orgId: $orgId, diagramId: $diagramId) {
      uploadUrl
      assetId
    }
  }
`)

export const CONFIRM_DIAGRAM_THUMBNAIL_UPLOAD = graphql(`
  mutation ConfirmDiagramThumbnailUpload(
    $orgId: ID!
    $diagramId: ID!
    $contentHash: String!
  ) {
    confirmDiagramThumbnailUpload(
      orgId: $orgId
      diagramId: $diagramId
      contentHash: $contentHash
    )
  }
`)
```

- [ ] **Step 2: Update `use-diagram-mutation.ts` — replace `uploadThumbnailFile`**

Add the two mutation imports at the top of the file alongside the existing imports:
```ts
import {
  CONFIRM_DIAGRAM_THUMBNAIL_UPLOAD,
  PREPARE_DIAGRAM_THUMBNAIL_UPLOAD,
} from '../api/thumbnail-v2'
```

Replace the entire `uploadThumbnailFile` function (currently lines ~244–257):
```ts
async function uploadThumbnailFile(
  orgId: string,
  diagramId: string,
  file: File,
  updateHash: string
) {
  const { data: prepareData } = await clientV2.mutate({
    mutation: PREPARE_DIAGRAM_THUMBNAIL_UPLOAD,
    variables: { orgId, diagramId },
  })

  const uploadUrl = prepareData?.prepareDiagramThumbnailUpload?.uploadUrl
  if (!uploadUrl) throw new Error('Failed to get thumbnail upload URL')

  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    withCredentials: false, // presigned URL — no cookies needed
  })

  await clientV2.mutate({
    mutation: CONFIRM_DIAGRAM_THUMBNAIL_UPLOAD,
    variables: { orgId, diagramId, contentHash: updateHash },
  })
}
```

- [ ] **Step 3: Update the call site to pass `updateHash`**

In `saveMetaData` (around line 145), the call to `uploadThumbnailFile` currently passes 3 args. Update it to pass `thumbnail.updateHash` as the 4th argument:
```ts
uploadThumbnailFile(
  organizationId,
  diagramId,
  thumbnail.thumbnailFile,
  thumbnail.updateHash   // ← new
)
  .then(() => {
    setLastUpdatedAt(Date.now())
    CACHED_THUMBNAIL_FILES.set(diagramId, thumbnail.updateHash)
  })
  .catch(() => {
    toast.error('Failed to upload diagram thumbnail. Please try again.')
  })
```

- [ ] **Step 4: Remove the unused `axios` direct REST call**

Confirm the old `axios.post(...)` to `/thumbnail` is no longer anywhere in `use-diagram-mutation.ts`. The new `axios.put` to the presigned URL is the only axios usage for thumbnails.

- [ ] **Step 5: TypeScript type check**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-ui
pnpm tsc --noEmit 2>&1 | head -20
```
Expected: no errors related to thumbnail files. (If the GraphQL codegen for the frontend hasn't been run yet, types for the new mutations may be missing — run `pnpm graphql-codegen` or equivalent if that's how types are generated in this repo.)

- [ ] **Step 6: Commit**

```bash
cd /Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-ui
git add src/features/diagram-portal/api/thumbnail-v2.ts \
        src/features/diagram-portal/hooks/use-diagram-mutation.ts
git commit -m "feat: migrate diagram thumbnail upload to GraphQL presigned URL flow"
```

---

## Post-Implementation Cleanup

Once all tasks are complete and the flow is confirmed working end-to-end:

- [ ] Remove the old `UpdateThumbnail` handler from `diagram.go` and its route registration in `handler.go`
- [ ] Remove the old `requireScope(... "/thumbnail", h.UpdateThumbnail)` line in `handler.go`
- [ ] Run full test suite: `go test ./...` in both `uigraph-api` and `uigraph-graphql`
- [ ] Commit: `"refactor: remove legacy REST thumbnail upload endpoint"`
