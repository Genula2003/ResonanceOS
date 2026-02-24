🚀 ResonanceOS

ResonanceOS is an offline-first Student Trajectory & Intervention Operating System built with Tauri + Rust + SQLite + React.

It goes beyond traditional school management systems by modeling students as dynamic state vectors, detecting instability early, and recommending optimized interventions using a deterministic trajectory engine.

🧠 Core Concept

ResonanceOS models each student using a structured state vector:
E — Engagement
M — Mastery
S — Stability
P — Support
L — Load

The system:
-Detects phase shifts in learning behavior
-Computes a 0–100 risk score
-Recommends minimal-cost interventions
-Enforces strict role-based access control
-Separates academic and financial data securely

🏗 Architecture
-Frontend
-React + TypeScript + Vite
-TailwindCSS + shadcn/ui
-Role-aware routing
-Offline-capable desktop UI
-Backend
-Rust (Tauri v2)
-SQLite (local database)
-SQLx migrations
-RBAC middleware
-Deterministic trajectory engine
-Audit logging
-Photo storage pipeline

🔐 Roles & Access Control
Role	              -  Access
Admin	              -  Full system access
Teacher  	          -  Student academic data (attendance, assessments, notes, interventions)
Management/Finance	-  Fee plans, invoices, payments (no access to sensitive academic data)

RBAC is enforced at the backend command level — not just UI hiding.

📊 Key Features

📈 Student trajectory modeling
⚠ Phase-change early warning detection
🎯 Minimal-lever intervention recommendations
📚 Attendance & assessment tracking
💰 Finance module with late fee logic
🖼 Secure student/staff photo storage
📂 CSV import/export with validation
📝 Audit logging system
🔄 Backup & restore support
💾 Fully offline desktop operation

🚀 Getting Started
1. Install dependencies
        npm install
2. Run in development mode
        npm run tauri dev
3. Build production app
        npm run tauri build
   
🧪 Demo Accounts
(Seeded in development mode)

admin@local / Admin123!

teacher@local / Teacher123!

finance@local / Finance123!

🗄 Database

SQLite database stored in OS AppData directory

Automatic migrations

Backup before schema changes

Manual export/import support

📸 Photo Storage

Photos are stored securely in:

AppData/
  student_photos/
  staff_photos/

The database stores only file paths — not image blobs.

🧮 Trajectory Engine

The system computes:
-Rolling attendance trends
-Score volatility
-Submission entropy
-Phase instability signals
-Risk score (0–100)
-Performance band (A–F)
-Optimized intervention recommendation
-All calculations are deterministic and transparent.

📦 Tech Stack
Tauri v2
Rust
SQLite (SQLx)
React
TypeScript
TailwindCSS

Vite

📜 License

Apache 2.0 License

🌍 Vision

ResonanceOS is designed as a learning dynamics operating system — not just a record-keeping tool.

It provides schools with structural insight into student progression, stability, and leverage — helping leadership intervene earlier and more intelligently.
