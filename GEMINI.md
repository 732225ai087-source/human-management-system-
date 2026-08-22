# Dayflow HRMS — Gemini / AI Agent Guidelines

> Conventions, coding standards, and guardrails for any AI agent
> working on this codebase. Read `AGENT.md` for the full spec.

---

## Coding Standards

### TypeScript
- Strict mode enabled (`strict: true` in tsconfig).
- No `any` — use proper types or `unknown` + type narrowing.
- Prefer `interface` over `type` for object shapes.
- Use `const` by default; `let` only when reassignment is needed.
- Named exports preferred over default exports.

### React (Client)
- Functional components only.
- Use `React.FC` sparingly — prefer explicit prop typing.
- Custom hooks for shared logic — prefix with `use`.
- Use TanStack Query for all server state.
- Use React Context only for auth and global UI state.
- Loading, error, and empty states on every data-fetching page.
- No inline styles — use Tailwind classes.

### Express (Server)
- Controller → Service → Prisma pattern.
- Controllers handle HTTP concerns (req/res/status).
- Services handle business logic (no `req`/`res` objects).
- All request validation via Zod middleware.
- All errors flow through a central error handler.
- Consistent response shape: `{ success, data?, message?, error? }`.

### Prisma
- All schema changes through migrations (`npx prisma migrate dev`).
- Never edit migration files by hand.
- Use `@map` and `@@map` for snake_case DB columns if needed.
- Seed script in `prisma/seed.ts` for dev data.

### Testing
- Server: Jest + Supertest for integration, Jest for unit.
- Client: Vitest + React Testing Library.
- Test file naming: `*.test.ts` / `*.test.tsx`.
- Test the behavior, not the implementation.

---

## Commit Convention

```
<type>(<scope>): <description>

Types: feat, fix, refactor, test, docs, chore, ci, style
Scopes: auth, profile, attendance, leave, payroll, notify, report, setup
```

Examples:
- `feat(auth): implement JWT access and refresh token flow`
- `fix(attendance): correct auto-absent cron job timezone handling`
- `chore(setup): add docker-compose for local Postgres`

---

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `LoginPage.tsx`, `AttendanceCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useLeave.ts` |
| Utils/helpers | camelCase | `formatDate.ts`, `generatePdf.ts` |
| Routes/controllers | camelCase | `authRoutes.ts`, `authController.ts` |
| Types | PascalCase | `User.ts`, `ApiResponse.ts` |
| Tests | Match source + `.test` | `authController.test.ts` |

---

## Environment Variables

All defined in `.env.example` with placeholder values:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dayflow

# JWT
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Email (optional — logs to console in dev)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@dayflow.local
```

---

## Security Checklist

- [ ] All auth routes have rate limiting
- [ ] All protected routes use `authGuard`
- [ ] All admin routes use `roleGuard("ADMIN")`
- [ ] Passwords never appear in logs or API responses
- [ ] JWT secrets are in env vars, not in code
- [ ] File uploads validated for type and size
- [ ] SQL injection prevented by Prisma (parameterized queries)
- [ ] XSS prevented by React's default escaping + Zod sanitization
- [ ] CORS configured for allowed origins only

---

## AI Agent Rules

1. **Read AGENT.md first** — it has the full spec, models, and roadmap.
2. **Follow the folder structure** in AGENT.md §3 exactly.
3. **Backend before frontend** for each phase.
4. **Run lint + typecheck + tests** before moving to next phase.
5. **Conventional Commits** per phase or logical unit.
6. **Log assumptions** in `docs/requirements.md`.
7. **Never skip auth/role guards** — every endpoint must be protected.
8. **Never return passwords** in any API response.
9. **Migrations for every schema change** — no hand edits.
