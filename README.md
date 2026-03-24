# ClassifyPro: The Smart School Monitoring Ecosystem

**Total Visibility. Absolute Accountability. Zero Paperwork.**

## 📌 Problem Statement
Many school owners face recurring challenges with:

- Teacher absenteeism and late arrivals.
- Grading mistakes and delayed result compilation.
- Limited real-time operational visibility.
- Paper-based registers that are easy to manipulate.

ClassifyPro digitizes daily school operations so principals can monitor attendance, class activity, and academic reporting in real time.

## 🚀 Core Product Features

### 1) Anti-Cheat Attendance (Geo-Fencing + QR Validation)
- **Geo-fence enforcement:** Teachers can clock in only when physically within the school boundary.
- **Classroom proof-of-presence:** Each classroom has a unique QR code that must be scanned for attendance validation.
- **Optional selfie verification:** Adds identity assurance during check-in.

### 2) Live Principal Dashboard
- **Real-time class status:**
  - Green = Teaching
  - Yellow = Late
  - Red = Empty
- **Instant lateness alerts:** Principal receives a notification when a teacher is 10+ minutes late.
- **Staff trend analytics:** Weekly/monthly attendance insights per teacher.

### 3) Automated Result Engine
- **Digital grading input:** Teachers enter scores directly in-app.
- **Auto-calculation pipeline:** Automatic totals, averages, and rankings.
- **PDF report generation:** One-click report cards shareable via WhatsApp or Email.

### 4) Parent Connectivity
- **Digital student profile:** Every student has an app-managed identity record.
- **Attendance notifications:** Parents can be informed when their child arrives at or leaves school.

## 💡 Value Proposition
- **Cost-effective:** Free-first onboarding with optional paid cloud features.
- **Built for local realities:** Designed for Nigerian school operations and curriculum workflows.
- **Execution-focused team:** Built by Estech Solutions to solve practical education administration problems.

---

# ClassifyPro – Technical Architecture & Developer Guide

## 🏗 Architecture Overview
ClassifyPro is a mobile-first, real-time school monitoring platform with a decoupled architecture:

1. **Mobile client (React Native/Expo):** User-facing application for principals, teachers, and school workflows.
2. **Serverless backend (Supabase + PostgreSQL + PostGIS):** Authentication, data storage, real-time events, and geospatial validation.

This architecture aims to deliver near-instant sync, anti-cheat attendance checks, and low infrastructure overhead.

## 💻 Tech Stack

### Mobile Client
- **Framework:** React Native (Expo)
- **State Management:** Zustand or React Context
- **Device APIs:**
  - `expo-camera` for QR scanning
  - `expo-location` for high-accuracy GPS collection

### Backend (BaaS)
- **Core platform:** Supabase
- **Database:** PostgreSQL
- **Spatial support:** PostGIS (`geography(POINT, 4326)`)
- **Authentication:** Supabase Auth
  - Principal: Email/Password
  - Teacher: Magic link or PIN-based login
- **Realtime sync:** Supabase Realtime (WebSocket subscriptions)

### Deployment & Distribution
- **Landing/download portal:** Vercel (Next.js or static HTML/Tailwind)
- **APK hosting:** GitHub Releases

## ⚙️ Core Technical Flows

### 1) Geo-Fenced Authentication Flow
1. Teacher taps **Clock In**.
2. Client retrieves GPS coordinates via `expo-location`.
3. Client calls Supabase RPC for server-side attendance validation.
4. PostgreSQL/PostGIS checks radius using `ST_DWithin` against school location.
5. If within radius (e.g., 50m), app proceeds to classroom QR scan.
6. If outside radius, attendance transaction is rejected at DB/RPC level.

### 2) Real-Time Dashboard Sync Flow
1. Successful scan inserts a row into `attendance_logs`.
2. Supabase Realtime captures the INSERT event.
3. Principal dashboard subscriber (filtered by `school_id`) receives the event.
4. UI state updates immediately (no manual refresh required).

## 🗄️ Initial Database Schema (Supabase)

### `schools`
- `id` UUID (PK)
- `name` Text
- `location` Geography(Point, 4326)
- `created_at` Timestamptz

### `users` (extends Supabase Auth)
- `id` UUID (PK/FK to auth user)
- `role` Enum (`principal`, `teacher`)
- `school_id` UUID (FK → schools.id)

### `classrooms`
- `id` UUID (PK)
- `school_id` UUID (FK → schools.id)
- `name` Text
- `qr_token` Text/UUID

### `attendance_logs`
- `id` UUID (PK)
- `teacher_id` UUID (FK → users.id)
- `classroom_id` UUID (FK → classrooms.id)
- `status` Enum (`on_time`, `late`)
- `clock_in_time` Timestamptz
- `verified_location` Geography(Point, 4326)

## 📥 Beta Onboarding Flow
1. Open the project download page (Vercel URL).
2. Tap **Download for Android**.
3. Install APK (ensure unknown-source install is enabled on the device).
4. Register school profile.
5. Add teachers and classrooms to begin monitoring.

## 🔒 Security & Integrity Notes
- Geofence checks should run server-side via RPC to prevent client tampering.
- QR tokens should be rotated or signed periodically.
- Row-level security (RLS) policies should isolate each school tenant.
- Audit trails should capture attendance edits and administrative overrides.

## 📈 Suggested Next Engineering Milestones
- Add offline queue + retry for unreliable network conditions.
- Introduce tamper-resistant device attestation checks.
- Build report card templates by school type/curriculum.
- Add observability dashboards for attendance anomalies.

## 👨‍💻 Development Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Android Studio emulator or physical Android device with Expo Go

### Setup
```bash
npm install
npm run start
```

### Current Build Scope
The repository now includes a starter Expo + React Native codebase with:
- A principal dashboard prototype with classroom status cards.
- A teacher clock-in prototype screen (mock QR token flow).
- Zustand stores for auth/session and attendance state.
- Supabase client bootstrap file and environment variable mapping.

Environment variables (create `.env`):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
