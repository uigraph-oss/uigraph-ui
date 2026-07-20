UiGraph ML Studio — Data Science Experiment Tracking & Knowledge Sharing
1

# Product Requirements Document

2
3
**Author:** Head of Product
4
**Date:** June 27, 2026
5
**Status:** Draft v1.0
6
**Stakeholders:** Engineering, Data Science, Platform, ML Infra
7
8
---

9
10

## 1. Executive Summary

11
12
Today UiGraph captures architecture knowledge for software engineers:
services, APIs, diagrams, schemas. But data science teams —
increasingly embedded within the same engineering organizations —
have no equivalent home for their work. Their experiments live in
scattered notebooks, their results are shared as one-off Slack
messages, and their model decisions are invisible to the engineers
who deploy and maintain those models in production.
13
14
**UiGraph ML Studio** extends the platform with a first-class data
science layer: experiments, runs, findings, datasets, and model cards
— all attached to the same service graph engineers already use. The
context engine (vector search + MCP) ingests this new knowledge, so
any AI assistant can answer "what model does the recommendation
service use, how accurate is it, and what training data was it built
on?" — in a single query.
15
16
The result: a single platform where a data scientist's experimental
findings become part of the team's shared architecture intelligence,
discoverable by colleagues, AI assistants, and on-call engineers
alike.
17
18
---

19
20

## 2. Problem Statement

21
22

### 2.1 Who is affected

23
24
**Data Scientists** embedded in product or platform teams:
25

- Run dozens of experiments per feature — hyperparameter sweeps,
  architecture comparisons, dataset ablations
  26
- Share findings via ad-hoc Slack messages, Notion pages, or emails
  that are immediately lost
  27
- Have no way to link "I trained model v3 with dataset D on service
  S" to the production context of that service
  28
  29
  **ML Engineers / Platform Engineers:**
  30
- Deploy models built by data scientists but have no visibility into
  why a specific model was chosen
  31
- During incidents involving ML services, cannot quickly find "what
  model is running, when was it last retrained, what's its expected
  error rate?"
  32
- No connection between the ML pipeline diagram and the experiment
  that produced the deployed model
  33
  34
  **Engineering Leaders / CTOs:**
  35
- No portfolio view of ML experiments across teams
  36
- Cannot answer "which services have active experiments? which have
  stale models?"
  37
- AI investment decisions made on tribal knowledge
  38

39

### 2.2 Current pain points

40
41
| Pain | Evidence |
42
|---|---|
43
| Experiment results are ephemeral | Data scientists use W&B or
MLflow in isolation; results never surface to the wider team |
44
| Model decisions are undocumented | Engineers deploy models with no
record of why that model beat alternatives |
45
| No link between ML work and system architecture | The diagram of
the inference pipeline has no connection to the model it runs |
46
| AI assistants are blind to ML context | MCP server has no tools for
experiments, models, or datasets |
47
| Onboarding to ML services takes weeks | There is no "model card +
experiment history" equivalent to a README |
48
49

### 2.3 Why now

50
51

- LLMs and ML features are now present in the majority of product
  engineering orgs at 50+ engineers
  52
- UiGraph already has the vector search infrastructure, service
  catalog, and MCP server needed — this is an extension, not a new
  platform
  53
- The existing pattern (`service_docs`, `service_tests`,
  `service_dbs`) maps cleanly to `service_experiments` and
  `service_models`
  54
  55

---

56
57

## 3. Goals

58
59
| Goal | Metric |
60
|---|---|
61
| Give data scientists a structured place to record and share
experiments | ≥70% of ML-tagged services have at least one recorded
experiment within 60 days of launch |
62
| Connect model artifacts to the services that use them | Model card
linked to service for ≥80% of services with `type: ml-service` tag |
63
| Make ML context queryable via MCP | New MCP tools return complete
experiment context in <500ms |
64
| Surface ML findings in semantic search | Experiment and finding
chunks indexed in Qdrant alongside diagram knowledge |
65
66

### 3.1 Non-Goals

67
68

- **We are not building a training infrastructure** — UiGraph does
  not train models, run compute, or store model weights. It stores
  metadata and results.
  69
- **We are not replacing MLflow or W&B** — we integrate with them.
  Data scientists who prefer those tools sync results to UiGraph; they
  don't abandon their current workflow.
  70
- **We are not building a Jupyter notebook executor** — notebooks can
  be attached as assets but UiGraph does not run them.
  71
- **We are not building a data catalog** — dataset metadata is
  lightweight (schema, source, version, lineage pointer). Deep data
  cataloging (column-level lineage, data quality) is out of scope for
  v1.
  72
  73

---

74
75

## 4. User Personas

76
77

### Maya — Data Scientist, Mid-size Product Company

78

- Runs experiments in Jupyter, tracks metrics in W&B
  79
- Wants her findings ("model B is 12% better on long-tail queries,
  here's why") to be discoverable by the team after the sprint ends
  80
- Wants to link her work to the service in production
  81

82

### Arjun — ML Engineer

83

- Owns the inference service and the training pipeline
  84
- Needs to know: "what model is deployed, who built it, when was it
  trained, what's the baseline performance?"
  85
- During incidents: "is the performance degradation expected given
  the training distribution?"
  86
  87

### Priya — Platform Engineering Lead

88

- Runs a platform team serving 12 product teams, 4 of which have ML
  components
  89
- Wants documentation coverage for ML services to match engineering
  services
  90
- Wants the AI assistant (Claude Code + UiGraph MCP) to answer
  questions about ML services
  91
  92

---

93
94

## 5. Core Concepts

95
96

### 5.1 New Entities

97
98

```
99
Service (existing)
106
└── Findings            ← NEW — human-authored conclusions (the "so
what")
107
```

108
109

### 5.2 Concept Definitions

110
111
**Experiment** — a named research effort, analogous to a project or
hypothesis. E.g., "Improve recommendation recall for cold-start
users." An experiment belongs to a service and has many runs. It has
a hypothesis, a description, tags, and a status (active / concluded /
archived).
112
113
**Run** — a single execution of an experiment. Captures: parameters
(hyperparameters, config), metrics (time-series and scalar), dataset
reference, model architecture description, duration, and outcome
(success/failed/cancelled). Runs are immutable once completed.
114
115
**Artifact** — a file attached to a run: a trained model checkpoint
reference (pointer, not the weight file), a confusion matrix PNG, a
notebook HTML export, a SHAP values plot. Stored via MinIO/S3,
exactly like diagram thumbnails today.
116
117
**Model** — a promoted, named model artifact derived from a run. Has
a model card: description, task type, performance summary,
limitations, intended use, training data reference, and version
history. This is what gets deployed to production.
118
119
**Model Version** — a specific promoted build of a model. Linked to
the run that produced it. Has a `status` field: `candidate | staging
| production | retired`.
120
100
├── Experiments ← NEW — a research question / ML project
101
│ └── Runs ← NEW — a single execution (parameters + metrics)
102
│ └── Artifacts ← assets (model file ref, plots, notebooks)
103
├── Models ← NEW (extends existing llm_models concept to all model
types)
104
│ └── ModelVersions ← NEW — a promoted run becomes a model version
105
├── Datasets ← NEW — data sources used in experiments

121
**Dataset** — a versioned data source referenced by experiments.
Lightweight: name, version, source URI, row count, feature schema
(JSON), split info (train/val/test ratios), and lineage (upstream
dataset IDs). NOT the data itself.
122
123
**Finding** — a human-authored conclusion. The insight layer on top
of raw results. "Model B outperforms Model A by 12% on recall@10 for
cold-start users. The gain comes from the interaction features added
in dataset v3. Recommend promoting to production." Findings can
reference multiple runs, link to diagrams, and be attached to map
frames.
124
125

### 5.3 Entity Relationships

126
127

```
128
Service
140
└── can be pinned to Map Frame
141
```

142
143
---

144
145

## 6. Feature Specification

146
147

### Phase 0 — Core (Launch v1)

148
149

#### F1: Experiment + Run logging

150
151
**Data scientist creates an experiment:**
152

- Name, hypothesis (markdown), description, tags, linked service
  153
- Status: `active | concluded | archived`
  154
  155
  **Logging a run (via UI, REST API, or Python SDK):**
  156
- Parameters: arbitrary key-value JSON (`{"lr": 0.001, "batch_size":
32, "epochs": 50}`)
  157
- Metrics: scalar values OR time-series (`{"accuracy": 0.91, "f1":
0.87}` or `[{step: 1, loss: 0.8}, ...]`)
  158
- Dataset reference (optional): link to a Dataset entity
  159
- Model architecture description: free text or structured JSON
  160
- Duration, start time, end time
  161
- Status: `running | completed | failed | cancelled`
  162
- Tags for filtering
  163
  164
  **UI:**
  165
- Experiment list view under a service (tab alongside APIs, Diagrams,
  Docs)
  166
- Run comparison table: select 2–N runs, see parameters and metrics
  side by side
  129
  ├── has many Experiments
  130
  │ └── has many Runs
  131
  │ ├── references Dataset
  132
  │ ├── has many Artifacts
  133
  │ └── promotes to → ModelVersion
  134
  ├── has many Models (model card registry)
  135
  │ └── has many ModelVersions
  136
  │ └── linked to Run
  137
  ├── has many Datasets
  138
  └── has many Findings
  139
  ├── references many Runs

167

- Metric charts: line charts for time-series metrics, bar charts for
  scalar comparisons
  168
- Run detail page: all params, all metrics, all artifacts, linked
  dataset
  169
  170

#### F2: Model card

171
172
**Create a model card for a service:**
173

- Task type: classification / regression / ranking / generation /
  embedding / other
  174
- Description (markdown), intended use, limitations, known failure
  modes
  175
- Training data summary (free text + optional Dataset reference)
  176
- Performance summary (key metrics, test conditions)
  177
- Promote a run → creates a Model Version with `status: candidate`
  178
- Version lifecycle: `candidate → staging → production → retired`
  179
- Current production version surfaced prominently on service page
  180
  181

#### F3: Dataset registry

182
183
**Register a dataset:**
184

- Name, version (semver), source URI/description, row count
  185
- Feature schema: column names, types, descriptions (JSON)
  186
- Split info: train/val/test ratios and row counts
  187
- Lineage: parent dataset ID (for derived datasets)
  188
- Tags (e.g., `pii`, `augmented`, `external`)
  189
  190

#### F4: Findings

191
192
**Create a finding:**
193

- Title, body (rich markdown with inline metric references)
  194
- Status: `draft | published | superseded`
  195
- Link to 1-N runs (the evidence)
  196
- Link to a model version (what decision it supports)
  197
- Pin to a Map Frame (makes the finding visible in the visual system
  map)
  198
- Comments thread (existing comment system)
  199
  200
  **Published findings appear:**
  201
- On the service page (Findings tab)
  202
- In any map frame they're pinned to
  203
- In semantic search results
  204
  205

#### F5: Context engine indexing

206
207
All new entities generate text chunks for the vector embedding
pipeline, mirroring the existing diagram knowledge layer pattern:
208
209
| Chunk type | Text example |
210
|---|---|
211
| `experiment` | "The 'cold-start recall' experiment for
recommendation-service tests whether adding interaction features
improves recall@10 for new users. Status: concluded. 12 runs." |
212
| `run_summary` | "Run r-42 of 'cold-start recall' achieved
accuracy=0.91, recall@10=0.87 with lr=0.001, batch_size=32. Dataset:
user-interactions-v3. Duration: 4h 12m. Status: completed." |
213
| `model_card` | "The 'two-tower-v3' model for recommendation-service
is a ranking model. Intended use: product recommendations for logged-
in users. Known limitations: degrades for users with <5 interactions.
Production since 2026-05-01." |
214
| `finding` | "Finding: Two-tower architecture outperforms matrix
factorization by 12% on recall@10 for cold-start users. Evidence:
runs r-38, r-39, r-42. Decision: promote two-tower-v3 to production."
|
215
| `dataset` | "Dataset 'user-interactions-v3' used by recommendation-
service. 48M rows. Features: user_id, item_id, interaction_type,

timestamp, context_features (12 columns). Train/val/test: 80/10/10."
|
216
217
Chunk IDs follow the existing deterministic pattern:
218

```
219
experiment:{experimentId}
223
dataset:{datasetId}
224
```

225
226

#### F6: New MCP tools

227
228
Extend `uigraph-mcp` with 7 new tools:
229
230
| Tool | Description |
231
|---|---|
232
| `list_experiments` | List experiments for a service, with status
and run count |
233
| `get_experiment` | Full experiment detail: hypothesis, all runs
summary, best run |
234
| `get_run` | Single run: all parameters, all metrics, artifacts
list, dataset |
235
| `list_models` | List model cards for a service |
236
| `get_model_card` | Model card + all versions with status and linked
run |
237
| `list_datasets` | List datasets for a service |
238
| `list_findings` | List published findings for a service |
239
| `get_finding` | Finding body + linked runs + linked model version |
240
241
**Example MCP query flow:**
242

```
243
User: "What model is recommendation-service running in production?"
251
→ Returns: full finding with evidence runs and metric comparisons
252
```

253
254
---

255
256

### Phase 1 — Integrations

257
258

#### F7: Python SDK — `uigraph.experiment`

259
260
Thin Python client for logging directly from notebooks or training
scripts:
261
262

```python
263
import uigraph
220
experiment:{experimentId}:run:{runId}
221
service:{serviceId}:model:{modelId}
222
service:{serviceId}:finding:{findingId}
244
→ list_models(service="recommendation-service")
245
→ get_model_card(model="two-tower-v3")
246
→ Returns: task type, performance summary, production since date, training
dataset, limitations
247
248
User: "Why was two-tower chosen over matrix factorization?"
249
→ list_findings(service="recommendation-service")
250
→ get_finding(id="cold-start-recall-decision")
264

265
with uigraph.experiment("cold-start-recall", service="recommendation-
service") as run:
266
run.log_params({"lr": 0.001, "batch_size": 32})
267
for epoch in range(50):
268
loss = train_epoch()
269
run.log_metric("loss", loss, step=epoch)
270
run.log_metric("recall_at_10", evaluate())
271
run.log_artifact("confusion_matrix.png")
272
run.set_dataset("user-interactions-v3")
273
```

274
275
Backed by the REST API. No new server-side work required.
276
277

#### F8: MLflow sync bridge

278
279
A CLI tool / background job that reads from an MLflow tracking server
and syncs experiments and runs to UiGraph. Maps:
280

- MLflow `experiment` → UiGraph `Experiment`
  281
- MLflow `run` (with params + metrics) → UiGraph `Run`
  282
- MLflow `artifact` (plots) → UiGraph `Artifact`
  283
  284
  **Config:**
  285

```yaml
286
# uigraph.yml
287
mlflow:
288
tracking_uri: http://mlflow.internal:5000
289
experiment_filter: ["recommendation/*", "search/*"]
290
service_mapping:
291
"recommendation/cold-start": recommendation-service
292
"search/query-understanding": search-service
293
```

294
295

#### F9: Weights & Biases sync bridge

296
297
Same pattern as MLflow bridge. W&B project → Experiment, W&B run →
Run.
298
299

#### F10: Notebook attachment

300
301
Attach a rendered notebook (`.ipynb` or HTML export) to a run or
finding as an artifact. Render it inline in the UiGraph UI using a
lightweight notebook viewer (no execution — display only).
302
303
---

304
305

### Phase 2 — Intelligence Layer

306
307

#### F11: Experiment comparison view (AI-assisted)

308
309
Select 2-N runs → "Summarize differences" button → LLM (via existing
`internal/api/llm`) generates a plain-English comparison: "Run 42
outperformed Run 38 primarily due to the larger batch size and the
addition of context_features. The 3× longer training time yielded a
12% recall gain, suggesting the tradeoff is worthwhile."
310
311

#### F12: Finding suggestions

312
313
After an experiment concludes with a clear winning run, the system
suggests a draft finding:
314

- Auto-fills metrics comparison from run data
  315
- Pre-links the winning run as evidence
  316
- Data scientist edits and publishes — doesn't start from blank
  317
  318

#### F13: Experiment coverage in doc health score

319
320
Extend the documentation health score (from the agent catalog) to
include:

321

- ML-tagged services with no experiments: flag
  322
- Models with no model card: flag
  323
- Findings that reference superseded model versions: stale flag
  324
  325

#### F14: Gateway CLI sync for experiments

326
327
Extend `uigraph-gateway` with `/v1/sync/experiments` and
`/v1/sync/models` endpoints so the CLI can push experiment results
from CI (e.g., after a nightly retraining job).
328
329
---

330
331

## 7. User Flows

332
333

### Flow A: Data scientist logs an experiment

334
335

1. Opens service page for `recommendation-service`
   336
2. Clicks **Experiments** tab → **New Experiment**
   337
3. Enters: Name ("cold-start recall improvement"), Hypothesis, tags
   (`ranking`, `cold-start`)
   338
4. Saves — experiment is created with status `active`
   339
5. In notebook: `import uigraph; run = uigraph.start_run("cold-start-
recall-improvement")`
   340
6. After training: run completes, metrics appear in UiGraph run list
   341
7. After reviewing results: data scientist writes a **Finding** and
   publishes it
   342
8. Finding is pinned to the "Recommendation Service" Map Frame
   343
9. That frame now shows a "Findings" indicator in the system map
   344
   345

### Flow B: Engineer investigates ML service during incident

346
347

1. PagerDuty alert fires on `recommendation-service`
   348
2. Engineer asks Claude Code: "What model is recommendation-service
   running and what's its expected error rate?"
   349
3. MCP: `list_models` → `get_model_card(two-tower-v3)`
   350
4. Response: "two-tower-v3, ranking model, production since May 1.
   Known limitation: degrades for <5 interaction users. Expected
   recall@10: 0.87 on standard distribution."
   351
5. Engineer checks current traffic: high cold-start users → confirms
   the expected degradation
   352
6. Resolution in 8 minutes instead of 45
   353
   354

### Flow C: New data scientist onboards to a service

355
356

1. Opens `search-service` in UiGraph
   357
2. Sees: Experiments (3 active, 12 concluded), Models (current
   production: `bert-ranker-v4`), Findings (8 published)
   358
3. Reads model card: task, training data, known limitations
   359
4. Reads top finding: "Why we moved from BM25 to BERT for reranking"
   360
5. Understands the full context without scheduling a 1:1
   361
   362

---

363
364

## 8. Proposed Data Model (Schema sketch)

365
366

```sql
367
-- Experiments
368
CREATE TABLE experiments (
369
id          TEXT PRIMARY KEY,
370
org_id      TEXT NOT NULL REFERENCES orgs(id),
371
service_id  TEXT NOT NULL REFERENCES services(id),
372
name        TEXT NOT NULL,
373
slug        TEXT NOT NULL,
374
hypothesis  TEXT,
375
description TEXT,
376
status
TEXT NOT NULL DEFAULT 'active',
--
active|concluded|archived

377
tags        TEXT[] NOT NULL DEFAULT '{}',
378
created_by  TEXT NOT NULL,
379
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
380
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
382
);
384
-- Runs
385
CREATE TABLE experiment_runs (
386
id              TEXT PRIMARY KEY,
387
experiment_id   TEXT NOT NULL REFERENCES experiments(id),
388
name            TEXT,
389
status
TEXT NOT NULL DEFAULT 'running',
--
running|completed|failed|cancelled
390
parameters      JSONB NOT NULL DEFAULT '{}',
391
metrics         JSONB NOT NULL DEFAULT '{}',
-- scalar
metrics
392
dataset_id      TEXT REFERENCES datasets(id),
393
model_arch      TEXT,
394
started_at      TIMESTAMPTZ,
395
completed_at    TIMESTAMPTZ,
396
tags            TEXT[] NOT NULL DEFAULT '{}',
397
created_by      TEXT NOT NULL,
398
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
399
);
401
-- Time-series metrics
402
CREATE TABLE run_metric_series (
403
run_id      TEXT NOT NULL REFERENCES experiment_runs(id),
404
metric_name TEXT NOT NULL,
405
step        INT NOT NULL,
406
value
FLOAT NOT NULL,
407
logged_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
408
PRIMARY KEY (run_id, metric_name, step)
409
);
411
-- Models
412
CREATE TABLE service_models (
413
id                  TEXT PRIMARY KEY,
414
org_id              TEXT NOT NULL REFERENCES orgs(id),
415
service_id          TEXT NOT NULL REFERENCES services(id),
416
name                TEXT NOT NULL,
417
slug                TEXT NOT NULL,
418
task_type           TEXT NOT NULL,
--
classification|regression|ranking|generation|embedding|other
419
description         TEXT,
420
intended_use        TEXT,
421
limitations         TEXT,
422
created_by          TEXT NOT NULL,
423
created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
424
updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
426
);
428
CREATE TABLE model_versions (
429
id              TEXT PRIMARY KEY,
430
model_id        TEXT NOT NULL REFERENCES service_models(id),
431
version         TEXT NOT NULL,
432
status
TEXT NOT NULL DEFAULT 'candidate',
--
candidate|staging|production|retired
433
run_id          TEXT REFERENCES experiment_runs(id),
434
performance     JSONB NOT NULL DEFAULT '{}',
381
deleted_at  TIMESTAMPTZ
383
400
410
425
deleted_at          TIMESTAMPTZ
427

435
training_notes  TEXT,
436
promoted_at     TIMESTAMPTZ,
437
promoted_by     TEXT,
438
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
439
);
441
-- Datasets
442
CREATE TABLE datasets (
443
id          TEXT PRIMARY KEY,
444
org_id      TEXT NOT NULL REFERENCES orgs(id),
445
service_id  TEXT REFERENCES services(id),
446
name        TEXT NOT NULL,
447
version     TEXT NOT NULL,
448
source_uri  TEXT,
449
row_count   BIGINT,
450
feature_schema JSONB,
451
split_info  JSONB,
452
parent_id   TEXT REFERENCES datasets(id),
453
tags        TEXT[] NOT NULL DEFAULT '{}',
454
created_by  TEXT NOT NULL,
455
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
456
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
457
);
459
-- Findings
460
CREATE TABLE findings (
461
id          TEXT PRIMARY KEY,
462
org_id      TEXT NOT NULL REFERENCES orgs(id),
463
service_id  TEXT NOT NULL REFERENCES services(id),
464
title       TEXT NOT NULL,
465
body        TEXT,
466
status
TEXT NOT NULL DEFAULT 'draft',
--
draft|published|superseded
467
run_ids     TEXT[] NOT NULL DEFAULT '{}',
468
model_version_id TEXT REFERENCES model_versions(id),
469
frame_id    TEXT REFERENCES frames(id),
470
created_by  TEXT NOT NULL,
471
published_at TIMESTAMPTZ,
472
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
473
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
475
);
476
```

477
478
---

479
480

## 9. API Endpoints

481
482
Follows the existing pattern in `internal/api/catalog/` and
`internal/api/diagram/`.
483
484

```
485
GET    /api/v1/orgs/{orgID}/services/{serviceID}/experiments
440
458
474
deleted_at  TIMESTAMPTZ
486
POST   /api/v1/orgs/{orgID}/services/{serviceID}/experiments
487
GET    /api/v1/orgs/{orgID}/experiments/{experimentID}
488
PATCH  /api/v1/orgs/{orgID}/experiments/{experimentID}
489
DELETE /api/v1/orgs/{orgID}/experiments/{experimentID}
490
491
GET    /api/v1/orgs/{orgID}/experiments/{experimentID}/runs

512
POST   /api/v1/orgs/{orgID}/findings/{findingID}/publish
513
```

514
515
New scopes in `internal/authz/scope.go`:
516

```
517
experiments:read    experiments:write
520
findings:read       findings:write
521
```

522
523
---

524
525

## 10. UI Changes

526
527

### Service page — new tabs

528
Add alongside existing tabs (APIs, Diagrams, Docs, Tests):
529

- **Experiments** — list with status badges, run count, latest metric
  highlight
  530
- **Models** — model card list, production version prominently shown
  531
- **Datasets** — dataset registry
  532
- **Findings** — published findings, pinned first
  533
  534

### Experiments tab

535

- Table: name, status, #runs, best metric, last activity, author
  536
- Click → Experiment detail page
  537
- Runs table with inline metric sparklines
  538
- "Compare runs" multi-select
  539
- Run detail panel (params + metrics side-by-side)
  540
  492
  POST /api/v1/orgs/{orgID}/experiments/{experimentID}/runs
  493
  GET /api/v1/orgs/{orgID}/runs/{runID}
  494
  PATCH /api/v1/orgs/{orgID}/runs/{runID}
  495
  POST /api/v1/orgs/{orgID}/runs/{runID}/metrics (batch log time-
  series)
  496
  POST /api/v1/orgs/{orgID}/runs/{runID}/artifacts (upload)
  497
  498
  GET /api/v1/orgs/{orgID}/services/{serviceID}/models
  499
  POST /api/v1/orgs/{orgID}/services/{serviceID}/models
  500
  GET /api/v1/orgs/{orgID}/models/{modelID}
  501
  POST /api/v1/orgs/{orgID}/models/{modelID}/versions
  502
  PATCH /api/v1/orgs/{orgID}/model-versions/{versionID} (status transitions)
  503
  504
  GET /api/v1/orgs/{orgID}/datasets
  505
  POST /api/v1/orgs/{orgID}/datasets
  506
  GET /api/v1/orgs/{orgID}/datasets/{datasetID}
  507
  508
  GET /api/v1/orgs/{orgID}/services/{serviceID}/findings
  509
  POST /api/v1/orgs/{orgID}/services/{serviceID}/findings
  510
  GET /api/v1/orgs/{orgID}/findings/{findingID}
  511
  PATCH /api/v1/orgs/{orgID}/findings/{findingID}
  518
  models:read models:write
  519
  datasets:read datasets:write

541

### Model card page

542

- Hero: task type, current production version, promoted date
  543
- Performance summary card with key metrics
  544
- Version history timeline
  545
- Linked finding (why this version was promoted)
  546
- Training dataset card
  547
  548

### Map frame integration

549

- Frames with linked findings show a "Findings" chip in the frame
  header
  550
- Click → side panel with the finding text and linked evidence
  551
  552

### Global search

553

- Experiments, runs, findings, and models are first-class search
  results
  554
- Semantic search ("what experiments improved cold-start
  performance?") powered by vector chunks
  555
  556

---

557
558

## 11. Integration Architecture

559
560

```
561
Data Scientist's Notebook / Training Script
580
Qdrant
581
```

582
583
---

584
562
│
563
├── uigraph Python SDK ──────────────────────────────────┐
564
│ │
565
├── MLflow sync bridge ──── reads MLflow tracking server ─┤
566
│ │
567
└── W&B sync bridge ──── reads W&B API ───────────────┘
568
│
569
uigraph-gateway
570
/v1/sync/experiments
571
│
572
uigraph-api
573
(stores in
Postgres)
574
│
575
┌──────────┴────────────┐
576
│
│
577
Vector pipeline
uigraph-mcp
578
(chunk + embed) (new
MCP tools)
579
│

585

## 12. Success Metrics

586
587
| Metric | 30-day | 90-day |
588
|---|---|---|
589
| ML-tagged services with ≥1 experiment | 40% | 70% |
590
| Published findings created | 50 | 300 |
591
| Model cards created | 30 | 150 |
592
| MCP `get_model_card` / `get_finding` calls/week | 200 | 1,000 |
593
| Time-to-context for ML service incidents (self-reported) | Baseline
-30% | Baseline -60% |
594
| Python SDK weekly active installs | 50 | 500 |
595
596
---

597
598

## 13. Phasing

599
600
| Phase | Timeline | Scope |
601
|---|---|---|
602
| **P0 — Core** | Weeks 1–8 | Experiments + Runs + Model cards +
Findings + MCP tools + Vector indexing |
603
| **P1 — Integrations** | Weeks 9–16 | Python SDK + MLflow bridge +
W&B bridge + Notebook attachment |
604
| **P2 — Intelligence** | Weeks 17–24 | AI run comparison + Finding
suggestions + Coverage scoring + Gateway CLI sync |
605
606

### P0 Engineering breakdown (8 weeks)

607
608
| Task | Owner | Weeks |
609
|---|---|---|
610
| DB migrations (experiments, runs, metrics, models, datasets,
findings) | Backend | 1–2 |
611
| REST API handlers (follows `internal/api/catalog` pattern) |
Backend | 2–4 |
612
| RBAC scopes | Backend | 2 |
613
| Vector chunk generation + embedding pipeline | Backend/ML Infra |
3–5 |
614
| MCP tools (7 new tools in `uigraph-mcp`) | Backend | 4–6 |
615
| UI: Service page tabs (Experiments, Models, Findings) | Frontend |
3–7 |
616
| UI: Run comparison view + metric charts | Frontend | 5–8 |
617
| UI: Model card page + version timeline | Frontend | 5–8 |
618
| GraphQL schema extension | Backend | 4–6 |
619
| Gateway sync endpoints | Backend | 6–8 |
620
621
---

622
623

## 14. Open Questions

624
625
| # | Question | Owner | Due |
626
|---|---|---|---|
627
| 1 | Does `0029_llm_models.sql` cover any of the service_models
schema? Audit before adding new migration. | Backend Lead | Sprint 1
|
628
| 2 | Do we want to store time-series metric data in Postgres
(`run_metric_series`) or offload to a time-series store (InfluxDB,
TimescaleDB)? At 50K runs/org, Postgres is fine; at 1M runs it
becomes a concern. | Arch | Sprint 1 |
629
| 3 | Should Findings be a top-level entity (accessible across
services) or always service-scoped? Product instinct: service-scoped
for v1, cross-service in v2. | PM | Sprint 0 |
630
| 4 | Which embedding model do we use for experiment text chunks?
Same as diagrams (Ollama/Bedrock)? Or a different model better suited
for scientific text? | ML Infra | Sprint 2 |
631
| 5 | Should model weights/checkpoints be stored in MinIO/S3 (via
UiGraph) or just referenced by URI? Recommendation: URI reference
only for v1. | Arch | Sprint 1 |

632
