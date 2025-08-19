# Copilot Instructions for Leave Management App

## Project Architecture

This is a **Turbo monorepo** with two main apps:
- `apps/backend/` - Cloudflare Workers API with Hono + OpenAPI
- `apps/web/` - React Router v7 frontend with Vite + TailwindCSS

## Development Workflow

**Start development:**
```bash
pnpm dev  # Runs turbo dev with TUI interface
```

**Backend-specific commands:**
```bash
cd apps/backend
pnpm db:generate    # Generate Drizzle migrations 
pnpm db:deploy      # Apply migrations to database
pnpm db:start       # Start local Supabase instance
pnpm dev            # Start Wrangler dev server on :8787
```

**Frontend-specific commands:**
```bash
cd apps/web  
pnpm api:generate   # Generate TypeScript types from backend OpenAPI spec
pnpm dev            # Start React Router dev server on :5173
```

## Key Patterns & Conventions

### Backend Architecture (apps/backend/)

**API Structure:**
- All endpoints use OpenAPI 3.1 via `@hono/zod-openapi`
- Endpoints are modular files in `src/endpoints/` (e.g., `auth.ts`)
- Main router in `src/index.ts` mounts endpoint modules with `app.route()`
- Swagger UI available at `/api` route when running locally

**Authentication:**
- JWT-based API keys using `@tsndr/cloudflare-worker-jwt`
- API key passed via `x-api-key` header (see `ApiKeyHeaderSchema`)
- Auth utilities in `src/features/auth.ts` with `createApiKey()` and `getUserFromApiKey()`

**Database Pattern:**
- Drizzle ORM with PostgreSQL, schemas in `src/features/db/schema.ts`
- Common fields pattern: `CommonRows` object with `isActive`, `createdAt`, `updatedAt`
- Connection via `connectDb({ env: c.env })` pattern in endpoints
- Unique indexes with `isActive` filtering (e.g., user email uniqueness)

**Error Handling:**
- Centralized error codes in `src/utils/error.ts` (e.g., `ErrorCodes.EMAIL_ALREADY_IN_USE`)
- Consistent response structure with `{ ok: boolean, ...}` pattern
- OpenAPI error responses via `getOpenApiClientErrorResponse()` utilities

### Frontend Architecture (apps/web/)

**Routing:**
- React Router v7 with file-based routing config in `app/routes.ts`
- Layout-based structure: `layouts/auth.tsx` for login, `layouts/main.tsx` for dashboard
- Route protection handled via layouts

**API Integration:**
- Type-safe API client using `openapi-fetch` in `app/lib/api/client.ts`
- Auto-generated types from backend OpenAPI spec via `pnpm api:generate`
- Base URL configured via `VITE_BACKEND_BASE_URL` environment variable

**UI Components:**
- Radix UI primitives with custom styling in `app/components/ui/`
- TailwindCSS v4 for styling with `class-variance-authority` for component variants
- Lucide React icons throughout the application

## Database Migrations

**Creating new migrations:**
1. Update schema in `apps/backend/src/features/db/schema.ts`
2. Run `pnpm db:generate` to create migration files
3. Run `pnpm db:deploy` to apply to database
4. Migration files stored in `apps/backend/migrations/`

## Deployment

**Backend:** Cloudflare Workers via `wrangler deploy`
**Frontend:** Cloudflare Pages via `pnpm deploy` (builds then deploys)

## Environment Setup

- Backend requires `.env` with `DATABASE_URL` and `JWT_SECRET`
- Frontend requires `VITE_BACKEND_BASE_URL` for API communication
- Use `dotenv-cli` for environment variable loading in backend scripts

## Important Files

- `apps/backend/src/features/db/schema.ts` - Database schema definitions
- `apps/backend/src/utils/openapi.ts` - OpenAPI response helpers
- `apps/web/app/routes.ts` - Application routing configuration
- `turbo.json` - Monorepo task configuration
