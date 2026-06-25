# uigraph-ui

[![license](https://img.shields.io/badge/license-BUSL--1.1-blue)](LICENSE)

Web application for [UiGraph](https://github.com/uigraph-oss) — visualize architecture, manage service catalogs, edit diagrams and system maps, and collaborate on technical documentation.

Built with React, TypeScript, Vite, and [React Flow](https://reactflow.dev/). Uses GraphQL via [uigraph-graphql](https://github.com/uigraph-oss/uigraph-graphql) and the [@uigraph/sdk](https://github.com/uigraph-oss/uigraph-sdk) for diagram conversion and schema parsing.

## Features

- **Diagram editor** — interactive React Flow canvas with Mermaid import
- **System maps** — multi-frame architecture maps with focal points
- **Service catalog** — services, API groups, endpoints, and database schemas
- **Documentation** — global and per-service docs with rich text editing
- **Organizations** — multi-tenant workspaces with RBAC
- **SSO** — OAuth/OIDC and SAML provider management

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

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server with GraphQL codegen watch |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build on port 3000 |
| `pnpm test` | Run tests |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |

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
- [uigraph-scripts](https://github.com/uigraph-oss/uigraph-scripts) — database seed utilities
