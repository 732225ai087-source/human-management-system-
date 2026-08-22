# Dayflow HRMS — Assumptions & Requirements Log

## Assumptions Made During Development

### Phase 0 — Setup
- Using npm workspaces (not pnpm/yarn) for monorepo management
- PostgreSQL 15 via Docker for local development
- Node.js 18+ required

### Open Questions Resolved
1. **Email provider**: Console log in dev; nodemailer structure ready for prod
2. **File storage**: Local filesystem with `/uploads` directory
3. **Payroll calculation**: Admin manages salary structures; payroll generated from them
4. **Leave balance**: Tracked with configurable defaults (12 paid, 6 sick per year)
5. **Multi-tenant**: Single company (no tenant model)
