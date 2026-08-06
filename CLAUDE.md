<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Claude Code Guidelines - Nx Monorepo (NestJS Microservices)

## 🚀 Architecture Overview

This repository is an Nx Monorepo containing NestJS Microservices:

- `apps/api-gateway`: Entry point, routing, rate limiting, and HTTP-to-gRPC/TCP proxying.
- `apps/auth-service`: Authentication, authorization, token issuance, and user session state.
- `apps/master-service`: Master data management and core domain business logic.
- `packages/shared`: Shared DTOs, interfaces, constants, and utilities.

---

## 🛠️ Common Commands (Nx CLI)

### Development

- Run API Gateway: `pnpm nx serve api-gateway`
- Run Auth Service: `pnpm nx serve auth-service`
- Run Master Service: `pnpm nx serve master-service`
- Run All Apps: `pnpm nx run-many --target=serve --all`

### Build & Test

- Build a service: `pnpm nx build <app-name>`
- Build all affected: `pnpm nx affected --target=build`
- Run unit tests: `pnpm nx test <app-name>`
- Run end-to-end tests: `pnpm nx e2e <app-name>-e2e`

### Code Generation & Maintenance

- Generate NestJS Module: `pnpm nx g @nx/nest:module <module-name> --project=<app-name>`
- Generate NestJS Service: `pnpm nx g @nx/nest:service <module-name> --project=<app-name>`
- Lint check: `pnpm nx lint <app-name>`

---

## 📐 Coding & Architectural Standards

### NestJS & Microservice Rules

1. **API Gateway Responsibility:**
   - HTTP Endpoints defined ONLY in `api-gateway`.
   - Forward requests to microservices using NestJS `ClientProxy` (TCP/gRPC/Redis).
   - Direct database access is Strictly FORBIDDEN in `api-gateway`.

2. **Microservices (Auth & Master):**
   - Communicate via `@MessagePattern()` or `@EventPattern()`.
   - Do NOT expose public HTTP controllers unless required for health checks.
   - Each service MUST own its database/schema (Database per Service pattern).

3. **Shared Code (`packages/shared`):**
   - Place common interfaces, DTO contracts, and microservice event patterns in `libs/`.
   - Do NOT import service-specific logic into `packages/shared`.

### Code Style

- Use TypeScript strict mode.
- Use NestJS built-in decorators for DTO validation (`class-validator`, `class-transformer`).
- Standard response structure for Gateway: `{ success: boolean, data: any, message?: string }`.
