CREATE TABLE IF NOT EXISTS fee_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('MONTHLY', 'TERM', 'ONE_TIME')),
    due_day_of_month INTEGER,
    late_fee_type TEXT NOT NULL CHECK (late_fee_type IN ('NONE', 'FLAT', 'DAILY_PERCENT')),
    late_fee_value REAL NOT NULL DEFAULT 0,
    grace_days INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS student_fee_links (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    fee_plan_id TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('NONE', 'FLAT', 'PERCENT')),
    discount_value REAL NOT NULL DEFAULT 0,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(fee_plan_id) REFERENCES fee_plans(id)
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    fee_plan_id TEXT, -- nullable if ad-hoc invoice
    period_start DATE,
    period_end DATE,
    due_date DATE NOT NULL,
    base_amount REAL NOT NULL,
    discount_amount REAL NOT NULL DEFAULT 0,
    late_fee_amount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(fee_plan_id) REFERENCES fee_plans(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    amount REAL NOT NULL,
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method TEXT NOT NULL CHECK (method IN ('CASH', 'BANK', 'CARD', 'OTHER')),
    reference TEXT,
    notes TEXT,
    created_by_user_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(invoice_id) REFERENCES invoices(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
);
