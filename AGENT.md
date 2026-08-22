# Dayflow — Human Resource Management System

> **Source of Truth** for tech stack, folder structure, data models,
> conventions, and phased roadmap. Do not deviate without stating why.

---

## §1 Overview

Dayflow is a full-stack HRMS covering authentication, employee profiles,
attendance tracking, leave management, payroll, notifications, and
reporting. Two roles: **Employee** and **Admin**.

---

## §2 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| State / Data | React Context (auth), TanStack Query (server state) |
| Routing | React Router v6 |
| Backend | Express.js + TypeScript |
| ORM | Prisma (PostgreSQL) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Zod (shared between client/server where possible) |
| PDF Generation | `@react-pdf/renderer` or `pdfkit` |
| File Upload | Multer |
| Email (dev) | Console log (nodemailer optional for prod) |
| Scheduling | node-cron |
| Testing | Vitest (client), Jest + Supertest (server) |
| Containerization | Docker + docker-compose (Postgres, optional app) |
| CI | GitHub Actions — lint, typecheck, test on push |

---

## §3 Monorepo Layout

```
dayflow/
├── client/                 # Vite + React + TS
│   ├── public/
│   ├── src/
│   │   ├── api/            # Axios instance, API call functions
│   │   ├── components/     # Reusable UI components
│   │   │   ├── common/     # Button, Input, Modal, Card, etc.
│   │   │   ├── layout/     # Sidebar, Header, Footer
│   │   │   └── guards/     # AuthGuard, RoleGuard
│   │   ├── contexts/       # AuthContext, NotificationContext
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Route-level components
│   │   │   ├── auth/       # Login, Signup, VerifyEmail
│   │   │   ├── dashboard/  # EmployeeDashboard, AdminDashboard
│   │   │   ├── profile/    # ProfileView, ProfileEdit
│   │   │   ├── attendance/ # AttendanceView, AttendanceAdmin
│   │   │   ├── leave/      # LeaveApply, LeaveHistory, LeaveApprovals
│   │   │   ├── payroll/    # PayrollView, PayrollAdmin
│   │   │   └── reports/    # ReportsAdmin
│   │   ├── types/          # Shared TS types/interfaces
│   │   ├── utils/          # Helpers, formatters
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
├── server/                 # Express + TS
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/         # env, constants
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # auth, role, error, validation, rate-limit
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helpers (jwt, hash, email, pdf)
│   │   ├── validators/     # Zod schemas
│   │   ├── jobs/           # Scheduled tasks (cron)
│   │   ├── types/          # TS types
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Entry point
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── tsconfig.json
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── AGENT.md
├── GEMINI.md
└── docs/
    └── requirements.md     # Assumptions log
```

---

## §4 Data Models (Prisma)

```prisma
enum Role {
  EMPLOYEE
  ADMIN
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  HALF_DAY
  ON_LEAVE
}

enum LeaveType {
  PAID
  SICK
  UNPAID
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
}

enum NotificationType {
  LEAVE_APPROVED
  LEAVE_REJECTED
  LEAVE_APPLIED
  REMINDER
  GENERAL
}

model User {
  id              String   @id @default(uuid())
  employeeId      String   @unique          // e.g. EMP-001
  email           String   @unique
  password        String                    // bcrypt hash
  role            Role     @default(EMPLOYEE)
  isEmailVerified Boolean  @default(false)
  emailVerifyToken String?
  refreshToken    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  profile       Profile?
  attendance    Attendance[]
  leaveRequests LeaveRequest[]
  payroll       Payroll[]
  notifications Notification[]
}

model Profile {
  id            String   @id @default(uuid())
  userId        String   @unique
  firstName     String
  lastName      String
  phone         String?
  address       String?
  dateOfBirth   DateTime?
  department    String?
  designation   String?
  dateOfJoining DateTime?
  profilePicUrl String?
  documents     Document[]
  user          User     @relation(fields: [userId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Document {
  id          String   @id @default(uuid())
  profileId   String
  name        String
  fileUrl     String
  fileType    String
  profile     Profile  @relation(fields: [profileId], references: [id])
  uploadedAt  DateTime @default(now())
}

model Attendance {
  id        String           @id @default(uuid())
  userId    String
  date      DateTime         @db.Date
  checkIn   DateTime?
  checkOut  DateTime?
  status    AttendanceStatus @default(PRESENT)
  user      User             @relation(fields: [userId], references: [id])
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@unique([userId, date])
}

model LeaveRequest {
  id          String      @id @default(uuid())
  userId      String
  leaveType   LeaveType
  startDate   DateTime    @db.Date
  endDate     DateTime    @db.Date
  reason      String?
  status      LeaveStatus @default(PENDING)
  adminRemarks String?
  reviewedBy  String?     // Admin user ID
  reviewedAt  DateTime?
  user        User        @relation(fields: [userId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Payroll {
  id            String   @id @default(uuid())
  userId        String
  month         Int                          // 1-12
  year          Int
  basicSalary   Float
  hra           Float    @default(0)
  allowances    Float    @default(0)
  deductions    Float    @default(0)
  netSalary     Float
  paidOn        DateTime?
  salarySlipUrl String?
  user          User     @relation(fields: [userId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, month, year])
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  user      User             @relation(fields: [userId], references: [id])
  createdAt DateTime         @default(now())
}

model SalaryStructure {
  id          String   @id @default(uuid())
  userId      String   @unique
  basicSalary Float
  hra         Float    @default(0)
  allowances  Float    @default(0)
  deductions  Float    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## §5 API Response Format

Every API response follows this shape:

```ts
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

---

## §6 Auth & Security Conventions

- Passwords: bcrypt, never logged or returned in responses.
- JWT access token: 15 min expiry, sent in `Authorization: Bearer` header.
- JWT refresh token: 7 day expiry, stored in httpOnly cookie.
- Every protected route has `authGuard` middleware.
- Role-restricted routes additionally have `roleGuard("ADMIN")`.
- Rate limiting on auth routes (express-rate-limit).
- Input sanitization via Zod validation on all request bodies.
- No secrets in code — only placeholders in `.env.example`.

---

## §7 Non-Negotiables

1. Every API response follows `{ success, data?, message?, error? }`.
2. Every protected route has both `authGuard` and `roleGuard` where relevant.
3. Every Prisma schema change goes through a migration.
4. Passwords are always hashed (bcrypt), never logged or returned.
5. No secrets committed — only placeholders in `.env.example`.
6. Conventional Commits for every commit.

---

## §8 Phased Roadmap

### Phase 0 — Setup
- [ ] Scaffold monorepo (client + server directories)
- [ ] Initialize client: Vite + React + TS + Tailwind
- [ ] Initialize server: Express + TS + Prisma
- [ ] docker-compose for local Postgres
- [ ] `.env.example` with all variables
- [ ] Basic CI config (lint/typecheck/test on push)
- [ ] `README.md` with setup instructions

### Phase 1 — Auth & Roles
- [ ] Prisma User model + migration
- [ ] Sign Up (Employee ID, Email, Password, Role)
- [ ] Password strength validation
- [ ] Email verification (token-based, console log in dev)
- [ ] Sign In with clear error messages
- [ ] JWT access + refresh tokens
- [ ] Auth middleware (authGuard)
- [ ] Role middleware (roleGuard)
- [ ] Client auth pages (Login, Signup)
- [ ] Client auth context + protected routes
- [ ] Redirect to correct dashboard by role after login

### Phase 2 — Dashboards
- [ ] Employee dashboard: quick-access cards (Profile, Attendance, Leave, Logout)
- [ ] Employee dashboard: recent activity/alerts section
- [ ] Admin dashboard: employee list
- [ ] Admin dashboard: attendance records overview
- [ ] Admin dashboard: leave approvals overview
- [ ] Admin dashboard: ability to switch between employee views

### Phase 3 — Profile Management
- [ ] Profile model + migration
- [ ] Document model + migration
- [ ] Full profile view (personal, job, salary, documents, picture)
- [ ] Employee edit: address, phone, profile picture only
- [ ] Admin edit: all fields on any employee
- [ ] Document upload endpoint + UI
- [ ] Profile picture upload endpoint + UI

### Phase 4 — Attendance
- [ ] Attendance model + migration
- [ ] Check-in / check-out endpoints
- [ ] Daily and weekly views
- [ ] Status types: Present, Absent, Half-day, On Leave
- [ ] Employees see only their own records
- [ ] Admins see everyone's records
- [ ] Scheduled job: auto-mark Absent for no check-in by EOD

### Phase 5 — Leave Management
- [ ] LeaveRequest model + migration
- [ ] Apply for leave (type, date range, remarks)
- [ ] Status lifecycle: Pending → Approved/Rejected
- [ ] Admin approval screen with comments
- [ ] Approved leave auto-creates attendance records (ON_LEAVE)

### Phase 6 — Payroll
- [ ] Payroll + SalaryStructure models + migrations
- [ ] Read-only payroll view for employees
- [ ] Admin: view all payroll, update salary structures
- [ ] Generate downloadable salary slip (PDF)

### Phase 7 — Notifications & Reports
- [ ] Notification model + migration
- [ ] In-app notifications (bell icon, mark as read)
- [ ] Email notifications for leave approval/rejection (console in dev)
- [ ] Admin analytics dashboard (attendance %, leave trends)
- [ ] Exportable reports: CSV and PDF (salary slips, attendance sheets)

### Phase 8 — Polish & Deploy
- [ ] Full responsive pass (mobile, tablet, desktop)
- [ ] Error boundaries on all pages
- [ ] Rate limiting on auth routes
- [ ] Input sanitization audit
- [ ] RBAC audit: confirm every endpoint has proper role guards
- [ ] Production Dockerfile for client and server
- [ ] Production docker-compose

---

## §9 Open Questions

1. **Email provider**: Should we integrate a real email provider (SendGrid, Resend) or is console logging sufficient for this phase?
   → *Default assumption:* Console log in dev; nodemailer stub ready for prod.

2. **File storage**: Local filesystem or cloud (S3/GCS)?
   → *Default assumption:* Local filesystem with `/uploads` directory, easily swappable.

3. **Payroll calculation**: Manual entry by Admin or auto-calculated from salary structure?
   → *Default assumption:* Admin enters/updates salary structure; payroll records are generated from it.

4. **Leave balance tracking**: Should we track leave balances (e.g., 12 paid, 6 sick per year)?
   → *Default assumption:* Yes, with configurable defaults.

5. **Multi-tenant**: Single company or multi-tenant?
   → *Default assumption:* Single company (no tenant model).
