# 🏢 Dayflow — Human Resource Management System (HRMS)

> A modern, full-stack Human Resource Management System built for seamless employee lifecycle management, attendance tracking, leave workflows, payroll processing, and organizational analytics.

---

## 🌟 Overview

**Dayflow** is an end-to-end HRMS platform engineered with clean architecture, strict TypeScript typing, role-based access control, and a responsive user interface. It simplifies HR administration while providing employees with an intuitive self-service portal.

---

## ✨ Key Features

### 🔐 1. Authentication & Security
- **Role-Based Access Control (RBAC)**: Distinct portals and guarded routes for `ADMIN` and `EMPLOYEE`.
- **JWT Authentication**: Short-lived Access Tokens (15m) paired with rotating Refresh Tokens (7d) stored in `httpOnly` secure cookies.
- **Email Verification**: Token-based email verification flow during onboarding.
- **Security Guardrails**: Helmet security headers, CORS origin restrictions, Zod schema request validation, bcrypt password hashing, and rate limiting.

### 👤 2. Employee Profile & Document Hub
- **Self-Service Profile**: Employees can view their job details and update personal contact details (phone, address).
- **Admin Management**: Admins have full access to edit employee departments, designations, joining dates, and personal data.
- **Media & Document Uploads**: Profile picture uploads and file management (PDF, JPG, PNG) powered by Multer.

### ⏰ 3. Attendance Management
- **One-Click Check-In / Check-Out**: Quick time logging from employee dashboard or attendance view.
- **Automatic Status Calculation**: Auto-detects half-day if working duration is under 4 hours.
- **Automated Daily Absenteeism**: Background cron job (`node-cron`) automatically marks employees absent at the end of the day if no check-in occurred.
- **Admin Attendance Viewer**: Date-range filtering and real-time attendance logs across the entire workforce.

### 🏖️ 4. Leave Management Workflow
- **Leave Applications**: Apply for `PAID`, `SICK`, or `UNPAID` leaves with date range picking and reason specification.
- **Overlap Prevention**: Enforces business logic preventing overlapping leave requests.
- **Approval Queue**: Admins can approve or reject pending leaves with optional remarks.
- **Automatic Attendance Integration**: Approved leaves automatically populate employee attendance records as `ON_LEAVE` (excluding weekends).

### 💰 5. Payroll & Salary Slips
- **Salary Structures**: Admin-configurable basic salary, HRA, allowances, and deductions per employee.
- **Batch Payroll Generation**: Automatic monthly payroll calculation and disbursement tracking.
- **Dynamic PDF Salary Slips**: Server-side PDF generation using `PDFKit` with direct download capabilities.

### 📊 6. Analytics, Reports & Notifications
- **Admin Analytics Dashboard**: High-level metrics for employee counts, daily attendance rate, pending leave backlog, and monthly payroll expenses.
- **Exportable Reports**: Generate and download attendance reports in CSV format.
- **In-App & Email Notifications**: Real-time event notifications for leave approvals, rejections, and administrative announcements.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query (React Query), React Router v7, React Icons, React Hot Toast |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod, PDFKit, node-cron, Multer, bcryptjs, jsonwebtoken |
| **Database & DevOps** | PostgreSQL 15, Docker & Docker Compose |
| **Testing** | Jest, Supertest, Vitest, React Testing Library |

---

## 📁 Repository Structure

```text
human-management-system/
├── client/                     # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                # Axios client & interceptors
│   │   ├── components/         # Reusable UI library, guards, & layouts
│   │   ├── contexts/           # AuthContext & state providers
│   │   ├── pages/              # Auth, Dashboard, Profile, Attendance, Leave, Payroll, Reports
│   │   └── types/              # Frontend TypeScript definitions
│   └── vite.config.ts          # Vite configuration with API proxies
├── server/                     # Express Backend (Prisma ORM)
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (PostgreSQL)
│   ├── src/
│   │   ├── config/             # Environment & DB configurations
│   │   ├── controllers/        # Express HTTP controllers
│   │   ├── middleware/         # Auth, Role, Upload, Validation, Error Handling
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic layer
│   │   ├── utils/              # JWT, Hash, Email, PDF helpers
│   │   └── server.ts           # Server entrypoint & cron setup
├── docker-compose.yml          # Local PostgreSQL container definition
├── package.json                # Root npm workspaces configuration
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (v9+)
- [Docker](https://www.docker.com/) & Docker Compose (for running PostgreSQL locally)

---

### Step 1: Clone and Install Dependencies

Clone the repository and install all dependencies for both `client` and `server` workspaces:

```bash
# Clone the repository
git clone <repository-url>
cd human-management-system-

# Install root & workspace dependencies
npm install
```

---

### Step 2: Configure Environment Variables

Create `.env` file in the root and in `server/` (or copy from `.env.example`):

```bash
cp .env.example .env
cp .env.example server/.env
```

**Default `.env` configuration:**
```env
# Database
DATABASE_URL=postgresql://dayflow:dayflow@localhost:5432/dayflow

# JWT Secrets
JWT_ACCESS_SECRET=super-secret-access-key-change-in-prod
JWT_REFRESH_SECRET=super-secret-refresh-key-change-in-prod
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server & Client
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Email (Logs to console in development)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@dayflow.local
```

---

### Step 3: Start Database & Run Migrations

Start the local PostgreSQL container via Docker Compose:

```bash
# Start PostgreSQL container in background
docker compose up -d
```

Generate Prisma client and apply database migrations:

```bash
# Run migrations inside server workspace
npm run migrate --workspace=server

# (Optional) Open Prisma Studio to inspect the database
npm run studio --workspace=server
```

---

### Step 4: Run the Application

You can run both the frontend and backend servers concurrently or in separate terminals.

#### Option A: Running separately

```bash
# Terminal 1: Backend API (http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend App (http://localhost:5173)
npm run dev:client
```

#### Option B: From within individual directories

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser to access Dayflow.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | Public |
| `POST` | `/api/auth/signin` | Sign in & receive tokens | Public |
| `POST` | `/api/auth/refresh` | Refresh access token | Public (Cookie) |
| `GET` | `/api/auth/verify-email/:token` | Verify email address | Public |
| `GET` | `/api/auth/me` | Get current user info | Authenticated |
| `GET` | `/api/profile/me` | Get current profile | Authenticated |
| `PUT` | `/api/profile/me` | Update personal profile | Authenticated |
| `POST` | `/api/profile/me/picture` | Upload profile picture | Authenticated |
| `POST` | `/api/profile/me/documents` | Upload user document | Authenticated |
| `POST` | `/api/attendance/check-in` | Check in for today | Employee |
| `POST` | `/api/attendance/check-out` | Check out for today | Employee |
| `GET` | `/api/attendance/me` | View personal attendance | Employee |
| `GET` | `/api/attendance/all` | View all attendance records | Admin |
| `POST` | `/api/leave` | Apply for leave | Employee |
| `GET` | `/api/leave/me` | View personal leave requests | Employee |
| `PUT` | `/api/leave/:id/approve` | Approve leave request | Admin |
| `PUT` | `/api/leave/:id/reject` | Reject leave request | Admin |
| `GET` | `/api/payroll/me` | View personal payroll history | Employee |
| `GET` | `/api/payroll/slip/:id` | Download salary slip PDF | Authenticated |
| `POST` | `/api/payroll/generate` | Batch generate monthly payroll | Admin |
| `PUT` | `/api/payroll/salary-structure/:userId` | Configure employee salary structure | Admin |
| `GET` | `/api/reports/attendance` | Attendance analytics summary | Admin |
| `GET` | `/api/reports/attendance/export` | Download attendance CSV | Admin |
| `GET` | `/api/notifications` | Get user notifications | Authenticated |

---

## 🧪 Testing & Code Quality

```bash
# Run server test suite
npm run test --workspace=server

# Run TypeScript typechecks
npm run typecheck

# Build both client and server for production
npm run build
```

---

## 📄 License

This project is licensed under the MIT License.