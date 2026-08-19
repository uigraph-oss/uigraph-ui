# uigraph-ui

[![license](https://img.shields.io/badge/license-BUSL--1.1-blue)](LICENSE)

Web application for [UIGraph](https://uigraph.app) — visualize architecture, manage service catalogs, edit diagrams and system maps, and collaborate on technical documentation.

**Product overview for AI assistants:** [uigraph.app/llms.txt](https://uigraph.app/llms.txt)

Built with React, TypeScript, Vite, and [React Flow](https://reactflow.dev/). Uses GraphQL via [uigraph-graphql](https://github.com/uigraph-oss/uigraph-graphql) and the [@uigraph/sdk](https://github.com/uigraph-oss/uigraph-sdk) for diagram conversion and schema parsing.

## Features

### Core platform

- **System maps** — multi-frame architecture maps with focal points linking UI to backend
- **Service catalog** — services, API groups, endpoints, dependencies, tests, and docs
- **Diagram editor** — React Flow canvas with Mermaid import/export, C4 model, sequence diagrams, sub-diagrams, AI beautify
- **Documentation** — global and per-service rich-text docs
- **CLI sync** — keep maps in sync via `uigraph sync` in CI/CD
- **Database schemas** — SQL/NoSQL import with ERD visualization and version comparison
- **Test packs** — test cases linked to services and UI screens
- **GitHub import** — guided wizard to connect repos and sync artifacts
- **Organization dependency graph** — cross-service call chains
- **Catalog manager** — reusable typed components across maps and diagrams
- **Figma import** — frames linked to system context
- **MCP server** — expose system context to Claude, Cursor, and other AI agents

### Enterprise

- **Assist** — in-app AI chat over organization system knowledge
- **ML Studio** — models, experiments, runs, deployments, and findings
- **Insights** — AI tool cost savings and agent session analytics
- **Costs & Infra** — cloud resource and cost mapping with AWS, GCP, and Azure connections
- **SSO & RBAC** — SAML, OAuth/OIDC, role mappings, audit logs
- **Self-hosting** — full stack via [uigraph-deploy](https://github.com/uigraph-oss/uigraph-deploy)

## Local development

The fastest way to run locally is through [uigraph-deploy](../uigraph-deploy):

```bash
cd ../uigraph-deploy
make docker-up
```

The UI is available at `http://localhost:3000`.

To run the Vite dev server standalone (requires API and GraphQL running):

```bash
pnpm install
pnpm dev
```

Vite proxies API requests to `VITE_API_TARGET` (default `http://localhost:8080`) and GraphQL to `VITE_GRAPHQL_TARGET` (default `http://localhost:8090`) so session cookies remain same-origin during local development.

## Scripts

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `pnpm dev`       | Start Vite dev server with GraphQL codegen watch |
| `pnpm build`     | Production build                                 |
| `pnpm preview`   | Preview production build on port 3000            |
| `pnpm test`      | Run tests                                        |
| `pnpm typecheck` | TypeScript check                                 |
| `pnpm lint`      | ESLint                                           |

## License

This project is licensed under the [Business Source License 1.1](LICENSE) (BUSL-1.1).

- **Source available today** — you can read, modify, and redistribute the code under the terms of the license.
- **Non-production use** — free for development, testing, evaluation, and internal proof-of-concept.
- **Production use** — requires a commercial license from UiGraph. Production use means any use that supports the ongoing operation of your business or organization.
- **Future open source** — each version automatically converts to [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) four years after it is first published under BUSL.

BUSL is not an OSI-approved open source license during the initial term. For commercial licensing questions, open an issue or contact the maintainers.

## Related projects

- [uigraph-api](https://github.com/uigraph-oss/uigraph-api) — backend API
- [uigraph-graphql](https://github.com/uigraph-oss/uigraph-graphql) — GraphQL BFF
- [uigraph-gateway](https://github.com/uigraph-oss/uigraph-gateway) — CLI sync API
- [uigraph-mcp](https://github.com/uigraph-oss/uigraph-mcp) — MCP server for AI assistants
- [uigraph-sdk](https://github.com/uigraph-oss/uigraph-sdk) — TypeScript SDK
- [uigraph-deploy](https://github.com/uigraph-oss/uigraph-deploy) — self-hosted deployment
