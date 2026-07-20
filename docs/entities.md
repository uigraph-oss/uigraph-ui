Model
└── Version
├── Experiment
│ └── Run
│ ├── Artifact
│ └── Metrics
│
├── Dataset
│
├── Evaluation
│ └── Metrics
│
├── Deployment
│
├── Findings
│
└── Decisions

## Model

```text
- Name
- Description
- Owner
- Status
- Domain
- Problem Type
- Tags
- Created At
- Updated At
```

---

## Version

```text
- Version
- Display Name
- Description
- Status
- Stage
- Release Notes
- Created At
- Released At
```

---

## Experiment

```text
- Name
- Description
- Goal
- Hypothesis
- Owner
- Status
- Started At
- Ended At
```

---

## Run

```text
- Name
- Status
- Started At
- Ended At
- Duration
- Trigger
- Environment
- Notes
```

---

## Dataset

```text
- Name
- Version
- Description
- Source
- Type
- Size
- Schema
- License
- Created At
```

---

## Evaluation

```text
- Name
- Type
- Description
- Summary
- Evaluated At
- Evaluator
```

Examples of `Type`:

- Offline Benchmark
- Online A/B Test
- Human Review
- Production Monitoring

---

## Metric

```text
- Name
- Value
- Unit
- Direction
- Category
- Measured At
```

Examples:

- Accuracy
- Latency
- Cost
- BLEU
- ROUGE
- NDCG
- CTR

---

## Deployment

```text
- Name
- Environment
- Status
- Endpoint
- Region
- Deployed At
- Rolled Back At
```

---

## Artifact

```text
- Name
- Type
- Description
- URI
- Size
- Format
- Created At
```

Examples:

- Model checkpoint
- Confusion matrix
- Notebook
- Plot
- ONNX
- GGUF

---

## Finding

```text
- Title
- Summary
- Description
- Severity
- Source
- Author
- Created At
```

Examples:

- "CTR dropped for new users."
- "Hallucinations increased with long context."

---

## Decision

```text
- Title
- Decision
- Reason
- Impact
- Decision Maker
- Decided At
```
