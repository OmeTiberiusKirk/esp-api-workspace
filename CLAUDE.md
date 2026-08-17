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

## 🚀 Repository Structure

An Nx Monorepo architecture containing NestJS Microservices:

- `apps/api-gateway`: HTTP Entry point, routing, rate-limiting, and microservice proxy.
- `apps/auth-service`: User registration and account creation (`reg` schema).
- `apps/master-service`: Master data and core business logic (`master` schema).
- `packages/shared`: Shared DTOs, interfaces, contracts, constants, and validation schemas.

---

## 🛠️ Common Commands (Nx CLI)

| Action         | Command                                                            |
| :------------- | :----------------------------------------------------------------- |
| **Serve App**  | `pnpm nx serve <app-name>` (e.g., `api-gateway`, `auth-service`)    |
| **Serve All**  | `pnpm nx run-many --target=serve --all`                            |
| **Build**      | `pnpm nx build <app-name>` \| `pnpm nx affected --target=build`    |
| **Test / E2E** | `pnpm nx test <app-name>` \| `pnpm nx e2e <app-name>-e2e`          |
| **Generate**   | `pnpm nx g @nx/nest:<module\|service> <name> --project=<app-name>` |
| **Lint**       | `pnpm nx lint <app-name>`                                          |

---

## 📐 Architecture & Coding Standards

### 1. NestJS & Microservice Rules

- **API Gateway:** Contains **ONLY** HTTP Endpoints. Proxies requests via `ClientProxy` (TCP/gRPC/Redis). **Direct DB access is STRICTLY FORBIDDEN.**
- **Microservices:** Communicate via `@MessagePattern()` or `@EventPattern()`. Do NOT expose public HTTP controllers (except health checks).
- **Response Format:** Standardize Gateway responses: `{ success: boolean, data: any, message?: string }`.

### 2. Database Strategy (Logical Separation)

- **Single PostgreSQL Instance:** Separated logically via schemas (`reg` schema for `auth-service`, `master` schema for `master-service`).
- **NO Cross-Schema JOINs & FKs:** Direct DB querying across schemas is forbidden. Save target IDs as primitive types (`UUID`/`BigInt`) without DB-level constraints.
- **Inter-service Data:** Fetch data from other domains via `@MessagePattern()`, never via direct SQL/Prisma joins.

### 3. Shared Library Conventions (`packages/shared`)

- **Shared DTOs & Validation:** Place all shared DTOs/Interfaces in `packages/shared`. Annotate DTOs directly with `class-validator` / `class-transformer`.
- **Message Contracts:** Store `@MessagePattern()` strings as constants in `packages/shared/src/pattern-contracts/`. Never hardcode strings in controllers.
- **Strict Entity Isolation:** DB Entities/Models belong ONLY in `apps/<service-name>`. **NEVER export/import DB Entities into `packages/shared`**. Map entities to Shared DTOs before responding.

### 4. Configuration & Environment Variables

- **No `process.env`:** Always use `@nestjs/config` with `joi` schema validation for type-safe config and fast-failing.
- **Centralized Schemas:** Place Joi validation schemas in `packages/shared/src/config/`.

```typescript
// packages/shared/src/config/auth-env.schema.ts
import * as Joi from 'joi';

export const authEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1d'),
  DATABASE_URL: Joi.string().uri().required(),
});
```
