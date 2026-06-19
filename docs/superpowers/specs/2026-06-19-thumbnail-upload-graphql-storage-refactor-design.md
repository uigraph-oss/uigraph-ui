# Design: Diagram Thumbnail Upload via GraphQL + Storage Backend Refactor

**Date:** 2026-06-19  
**Repos touched:** `uigraph-api`, `uigraph-graphql`, `uigraph-ui`

---

## Problem

Diagram thumbnail upload currently uses a direct REST multipart POST (`POST /api/v1/orgs/{orgID}/diagrams/{diagramID}/thumbnail`). This bypasses the GraphQL API layer that all other mutations use, sends file bytes through the backend server (inefficient), and ties the flow to REST. The storage layer (`storage/minio.go`) implements both MinIO and S3 support in a single file using the MinIO SDK, making it hard to add other cloud vendors (GCS, Azure Blob, etc.) cleanly.

## Goals

1. Move thumbnail upload to GraphQL + presigned PUT URL pattern (browser uploads directly to storage).
2. Refactor storage layer so each backend is a self-contained, independently-testable unit — adding a new vendor is just adding a new file.

---

## Part 1: Thumbnail Upload — Two-Step GraphQL Pattern

### Flow

```
Client                          uigraph-graphql         uigraph-api         Storage (S3/MinIO/…)
  │                                    │                     │                        │
  │─ prepareDiagramThumbnailUpload ───►│                     │                        │
  │                                    │─ POST /thumbnail/prepare ──►│                │
  │                                    │                     │─ PresignPutURL ────────►│
  │                                    │                     │◄── uploadUrl ──────────│
  │◄── { uploadUrl, assetId } ────────│◄── { uploadUrl, assetId } ──│                │
  │                                    │                     │                        │
  │─ PUT file bytes ──────────────────────────────────────────────────────────────────►│
  │                                    │                     │                        │
  │─ confirmDiagramThumbnailUpload ───►│                     │                        │
  │  (orgId, diagramId, contentHash)   │─ POST /thumbnail/confirm ──►│               │
  │                                    │                     │─ UpdateDiagram (DB) ──►│
  │◄── true ──────────────────────────│◄── 200 OK ──────────│                        │
```

### GraphQL Schema additions (`uigraph-graphql/internal/graph/schema/diagram.graphqls`)

```graphql
type DiagramThumbnailUpload {
    uploadUrl: String!
    assetId:   String!
}

extend type Mutation {
    prepareDiagramThumbnailUpload(orgId: ID!, diagramId: ID!): DiagramThumbnailUpload!
    confirmDiagramThumbnailUpload(orgId: ID!, diagramId: ID!, contentHash: String!): Boolean!
}
```

### uigraph-api — new REST endpoints

**File:** `internal/api/diagram/handler.go`  
Add `PresignPutURL` to the `objectStore` local interface:
```go
type objectStore interface {
    Upload(...)
    Download(...)
    PresignPutURL(ctx context.Context, key string) (string, error)  // new
}
```

**File:** `internal/api/diagram/diagram.go`  
Add two handlers:

- `PrepareThumbnailUpload` — `POST /api/v1/orgs/{orgID}/diagrams/{diagramID}/thumbnail/prepare`
  - Validates diagram exists and belongs to org
  - Computes deterministic asset key: `storage.AssetKey(storage.DiagramThumbnailAssetID(diagramID))`
  - Calls `h.storage.PresignPutURL(ctx, key)` → 15-min PUT URL
  - Returns `{ uploadUrl, assetId }`

- `ConfirmThumbnailUpload` — `POST /api/v1/orgs/{orgID}/diagrams/{diagramID}/thumbnail/confirm`
  - Body: `{ contentHash: string }`
  - Validates diagram, sets `PreviewAssetID` + `PreviewContentHash`, calls `UpdateDiagram`, clears cache key

Register both under scope `diagrams:write`. Keep the old `UpdateThumbnail` handler registered during transition, remove once frontend is cut over.

### uigraph-graphql — client + resolver additions

**File:** `internal/uigraphapi/diagram.go`  
Add two methods to `Client`:
```go
func (c *Client) PrepareDiagramThumbnailUpload(ctx, orgID, diagramID string) (*DiagramThumbnailUpload, error)
func (c *Client) ConfirmDiagramThumbnailUpload(ctx, orgID, diagramID, contentHash string) error
```
Where `DiagramThumbnailUpload` is a small struct `{ UploadURL, AssetID string }`.

**File:** `internal/graph/resolver.go`  
Add to `diagramClient` interface:
```go
PrepareDiagramThumbnailUpload(ctx, orgID, diagramID string) (*uigraphapi.DiagramThumbnailUpload, error)
ConfirmDiagramThumbnailUpload(ctx, orgID, diagramID, contentHash string) error
```

**File:** `internal/graph/diagram.resolvers.go`  
Add resolver methods `PrepareDiagramThumbnailUpload` and `ConfirmDiagramThumbnailUpload` — thin wrappers that call `r.DiagramAPI.*`.

Run `go generate ./...` after schema + resolver stubs to regenerate gqlgen code.

### uigraph-ui — frontend changes

**New file:** `src/features/diagram-portal/api/thumbnail-v2.ts`
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
  mutation ConfirmDiagramThumbnailUpload($orgId: ID!, $diagramId: ID!, $contentHash: String!) {
    confirmDiagramThumbnailUpload(orgId: $orgId, diagramId: $diagramId, contentHash: $contentHash)
  }
`)
```

**File:** `src/features/diagram-portal/hooks/use-diagram-mutation.ts`  
Replace `uploadThumbnailFile()`:
```ts
async function uploadThumbnailFile(orgId, diagramId, file, contentHash, apolloClient) {
  // 1. Get presigned PUT URL
  const { data } = await apolloClient.mutate({ mutation: PREPARE_DIAGRAM_THUMBNAIL_UPLOAD,
    variables: { orgId, diagramId } })
  const { uploadUrl } = data.prepareDiagramThumbnailUpload

  // 2. PUT directly to storage
  await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } })

  // 3. Confirm
  await apolloClient.mutate({ mutation: CONFIRM_DIAGRAM_THUMBNAIL_UPLOAD,
    variables: { orgId, diagramId, contentHash } })
}
```
Pass `clientV2` (already imported) as the Apollo client. The `contentHash` comes from `getThumbnailFile()` which already computes it for dedup.

Remove the old `axios.post(...)` to `/thumbnail` once the new flow is wired and tested.

---

## Part 2: Storage Layer — Pluggable Backend Architecture

### Current state
`storage/minio.go` contains `New()`, `newMinio()`, and `minioClient` — both MinIO and S3 paths share the same struct and the MinIO SDK.

### Target structure

```
internal/storage/
  storage.go     — Client interface + all key-builder functions (unchanged)
  new.go         — New(cfg Config) (Client, error) factory — routes to minio/s3/future
  minio.go       — minioClient struct, uses github.com/minio/minio-go/v7
  s3.go          — s3Client struct, uses github.com/aws/aws-sdk-go-v2/service/s3
```

**`Config` moves to `new.go`** (out of `minio.go` where it currently lives) since it's the factory's input, not the MinIO implementation's detail. The `Backend` discriminator field is already present (`"minio"` | `"s3"` | future values).

**`new.go`:**
```go
func New(cfg Config) (Client, error) {
    switch cfg.Backend {
    case "s3":
        return newS3Client(cfg)
    default: // "minio" and fallback
        return newMinioClient(cfg)
    }
}
```

**`minio.go`:**  
`minioClient` struct + `newMinioClient(cfg Config) (Client, error)`. Keeps MinIO-specific logic: public endpoint presigning, `SetBucketPolicy("")` for private bucket, `MakeBucketOptions{}`.

**`s3.go`:**  
`s3Client` struct using AWS SDK v2 (`github.com/aws/aws-sdk-go-v2`). Key differences from MinIO:
- `s3.New(cfg)` with `aws.Config` (region, credentials from `cfg.AccessKey`/`cfg.SecretKey`)
- `s3.PutObject` for Upload, `s3.GetObject` for Download, `s3.DeleteObject` for Delete
- `s3manager.Uploader` for Upload (handles multipart automatically)
- `s3.PresignClient` for `PresignURL` (GET) and `PresignPutObject` (PUT)
- `EnsureBucket`: `s3.HeadBucket` + `s3.CreateBucket` — no `SetBucketPolicy` call (S3 uses block-public-access config separately)
- No `PublicEndpoint` concept needed (presigned URLs go to `s3.amazonaws.com` or custom endpoint)

**Adding a future vendor (e.g. GCS):**  
Add `storage/gcs.go`, implement `Client`, add `case "gcs"` to `New()`. Zero changes to any caller.

### AWS SDK v2 dependency

Add to `uigraph-api/go.mod`:
```
github.com/aws/aws-sdk-go-v2           latest
github.com/aws/aws-sdk-go-v2/config    latest
github.com/aws/aws-sdk-go-v2/service/s3 latest
github.com/aws/aws-sdk-go-v2/credentials latest
```

---

## Verification

1. **Storage unit test**: Add `storage/s3_test.go` and `storage/minio_test.go` using localstack/MinIO test container or interface mocks to verify each backend's presign and upload paths independently.
2. **Backend integration**: `POST /thumbnail/prepare` returns a presigned URL (minio running locally); PUT to it succeeds; `POST /thumbnail/confirm` updates DB record — verify with `GET /diagrams/{id}` returning updated `previewAssetId` + `previewContentHash`.
3. **GraphQL layer**: `prepareDiagramThumbnailUpload` mutation returns `uploadUrl`; `confirmDiagramThumbnailUpload` returns `true`.
4. **Frontend E2E**: Open a diagram, publish a version — thumbnail appears on the dashboard diagram card within a few seconds.
5. **Backward compat**: Old REST `POST /thumbnail` endpoint still works during transition (remove after frontend cut-over is confirmed).
