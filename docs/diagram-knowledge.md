# Diagram Knowledge (React Flow Core + Embedding Text Spec)

This is the Layer 1 source-of-truth concept adapted to React Flow core data.

Input to Layer 1 is only:

- `nodes[]`
- `edges[]`

Vector text is generated deterministically from these arrays and graph topology derived from them.

## 1) Internal Graph Contract from React Flow

Normalize editor state into an internal graph once.

### Node mapping

- `id`: `node.id`
- `name`: `node.data.name` -> `node.data.label` -> `node.id`
- `type`: semantic node type from `node.type` / `node.data.type`
- `shape`: `node.data.shape` if available (`rectangle`, `diamond`, `unknown`)
- `dbConfig`: optional (`service`, `database`, `tableName`, `env`) from `node.data`
- `inEdges[]`, `outEdges[]`: filled from edge adjacency

### Edge mapping

- `key`: `source-target` (or include edge id when parallel edges are allowed)
- `source`: `edge.source`
- `target`: `edge.target`
- `label`: normalized edge label from `edge.label` / `edge.data.label`
- `isBackEdge`: computed later (default `false`)

### Graph-level fields

- `diagramId`, `diagramName`
- `nodes`, `edges`
- `backEdgeKeys`

## 2) Enrichment Rules

After normalization, compute topology semantics.

### Node roles

- `database`: data store node type
- `start`: `inEdges.length === 0`
- `terminal`: `outEdges.length === 0`
- `decision`: `shape === diamond` or decision node type
- `action`: default

### Back-edge detection

Run DFS with white/gray/black coloring.

- edge to gray node -> mark as `isBackEdge = true`
- add edge key to `backEdgeKeys`

### Path discovery

- seed from start nodes
- DFS on forward edges only (skip back-edges)
- max depth cap to prevent blowup
- emit separate cycle chunk for each back-edge
- classify path by labels:
  - contains `No`/`Failure` -> `failure`
  - otherwise contains `Yes`/`Success` -> `happy`
  - otherwise -> `neutral`

## 3) How Vector Text Is Generated

This is the embedding text (`chunk.text`) generation logic per chunk type.

### A) Node text generation

Generate one chunk per node.

#### Action/start/terminal node text

Sentence assembly order:

1. Role sentence
   - start: `"{name}" is the starting point of the {diagramName} flow.`
   - terminal: `"{name}" is a terminal state in the {diagramName} flow.`
   - action: `"{name}" is an action step in the {diagramName} flow.`
2. Predecessor sentence (if any): `It follows: {predecessorNames}.`
3. Successor sentence (if any): `It leads to: {successorNames}.`
4. Terminal close (terminal only): `No further steps follow from this state.`

#### Decision node text (node chunk variant)

1. `"{name}" is a decision point in the {diagramName} flow.`
2. Input sentence: `It receives input from: {predecessorNames}.` (if any)
3. Outcome sentence built from all outgoing edges:
   - branch format: `"{labelOrDefault}" leads to "{targetName}"`
   - append ` (loops back)` when edge is back-edge
   - final sentence: `Outcomes: {branch1}; {branch2}; ... .`

#### Database node text (node chunk variant)

If `dbConfig` exists:

- `The "{tableName}" table is a database node in the {diagramName} flow.`
- `It is owned by service {service}`
- `and belongs to database {database} (environment: {env}).`
- `It stores the primary data records for this flow.`

If missing config:

- `"{name}" is a database node referenced in the {diagramName} flow. No configuration details are available.`

### B) Edge text generation

Generate one chunk per edge.

Priority order:

1. **Back-edge**
   - `This is a retry loop in the {diagramName} flow.`
   - `When "{srcName}" ({label}) completes, the flow returns to "{dstName}" for another attempt.`
2. **Labeled edge from decision source**
   - `When "{srcName}" evaluates to "{label}", the {diagramName} flow moves to "{dstName}".`
3. **Labeled edge from non-decision source**
   - `After "{srcName}" with outcome "{label}", the {diagramName} flow proceeds to "{dstName}".`
4. **Unlabeled sequential edge**
   - `In the {diagramName} flow, "{srcName}" is directly followed by "{dstName}".`

### C) Decision text generation

Generate one chunk per decision node to keep all branches in one retrieval hit.

Sentence assembly:

1. `"{decisionName}" is a decision point in the {diagramName} flow.`
2. `It is reached from: {predecessorNames}.` (if any)
3. `It has {n} possible outcome(s):`
4. Branch list:
   - `"{label}" -> "{targetName}"`
   - append ` (loops back to an earlier step)` when branch edge is back-edge

### D) Path text generation

Generate one chunk per discovered route plus one chunk per cycle edge.

#### Route path chunk

1. `This is a {pathType} path in the {diagramName} flow.`
2. `Route: {nodeName1 -> nodeName2 -> ...}.`
3. `Step by step: "A" (Yes) -> "B"; "B" -> "C"; ... .`
4. If last node is terminal: `The path ends at the "{terminalName}" state.`

#### Cycle path chunk

1. `The {diagramName} flow contains a retry loop.`
2. `After "{sourceName}" ({label}), the flow loops back to "{targetName}".`
3. `This represents a repeated attempt ... before proceeding to the next stage.`

### E) Schema-link text generation

Generate one chunk per database node.

If columns are available:

- include inline list: `Columns: colA (type), colB (type), ... .`

If columns are not available:

- include: `Column-level detail is available via the service registry.`

Base sentences:

- `The "{tableName}" table is the database backing for the {diagramName} flow.`
- `It is owned by service {service}`
- `within database {database} (environment: {env}).`

## 4) Chunk Payload Sent to Embedding Pipeline

Each generated chunk has:

- `chunkId` (deterministic)
- `chunkType`
- `diagramId`, `diagramName`
- `nodeIds`
- `text` (this is the exact vector text input)
- `metadata` (structured retrieval fields)
- `sourceFiles` (logical sources)
- `generatedAt`

Only `text` is embedded. `metadata` is stored for filtering/reranking.

## 5) Deterministic Chunk IDs

Stable format:

- `diagram:{diagramId}:node:{nodeId}`
- `diagram:{diagramId}:edge:{source}-{target}`
- `diagram:{diagramId}:decision:{nodeId}`
- `diagram:{diagramId}:path:{stableHash(nodeIdSequence)}`
- `diagram:{diagramId}:schema_link:{nodeId}`

Deterministic IDs guarantee clean upsert/tombstone behavior during re-indexing.

## 6) Embedding Quality Rules

- Use human-readable node names in text; IDs stay in metadata.
- Keep each chunk single-intent (node vs edge vs decision vs path vs schema).
- Explicitly include relationship verbs (`follows`, `leads to`, `loops back`, `outcomes`).
- Never include unsupported facts.
- Do not depend on visual-only layout details for semantic text.

## 7) Final Operational Flow

**React Flow nodes/edges -> normalize -> enrich -> generate chunk text -> dedupe by chunkId -> embed text -> upsert vectors with metadata**

This is the exact path from authored graph to vector knowledge.
