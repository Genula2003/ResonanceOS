🚀 ResonanceOS

ResonanceOS is an offline-first Student Trajectory & Intervention Operating System built with Tauri, Rust, SQLite, and React.

It goes beyond traditional school management systems by modeling students as dynamic state vectors, detecting instability early, and recommending optimized interventions using a deterministic trajectory engine.

🧠 Core Concept

ResonanceOS models each student using a structured state vector:

E — Engagement

M — Mastery

S — Stability

P — Support

L — Load

The system:

Detects phase shifts in learning behavior

Computes a 0 to 100 risk score

Recommends minimal-cost interventions

Enforces strict role-based access control

Separates academic and financial data securely

🏗 Architecture
🎨 Frontend

React + TypeScript + Vite

TailwindCSS + shadcn/ui

Role-aware routing

Desktop UI powered by Tauri

🦀 Backend

Rust with Tauri v2

SQLite local database

SQLx migrations

RBAC middleware

Deterministic trajectory engine

Audit logging

Secure photo storage

🔐 Roles & Access Control
Role	Access
Admin	Full system access
Teacher	Academic modules (attendance, assessments, notes, interventions)
Finance	Fee plans, invoices, payments (no academic data access)

RBAC is enforced at the backend command level, not just hidden in the UI.

✨ Key Features

Student trajectory modeling

Phase-change early warning detection

Minimal-lever intervention recommendations

Attendance and assessment tracking

Finance module with late-fee logic

Secure student and staff photo storage

CSV import and export with validation

Full audit logging

Backup and restore support

Fully offline desktop operation

🚀 Getting Started
Install dependencies
npm install
Run in development mode
npm run tauri dev
Build production app
npm run tauri build
🧪 Demo Accounts

Seeded in development mode:

Admin
admin@local / Admin123!

Teacher
teacher@local / Teacher123!

Finance
finance@local / Finance123!

🗄 Database

SQLite database stored in OS AppData directory

Automatic migrations

Backup before schema changes

Manual export and import support

📸 Photo Storage

Photos stored in OS AppData directory

student_photos folder

staff_photos folder

Database stores only file paths

No image blobs stored in SQLite

🧮 Trajectory Engine

The system computes:

Rolling attendance trends

Score volatility

Submission entropy

Phase instability signals

Risk score from 0 to 100

Performance band from A to F

Optimized intervention recommendations

All calculations are deterministic and transparent.

🛠 Tech Stack

Tauri v2

Rust

SQLite

React

TypeScript

TailwindCSS

Vite

📜 License

MIT License
