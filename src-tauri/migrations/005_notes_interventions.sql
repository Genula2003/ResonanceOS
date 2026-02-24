CREATE TABLE IF NOT EXISTS student_notes (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    created_by_user_id TEXT NOT NULL,
    note_text TEXT NOT NULL,
    tags_json TEXT, -- array of strings
    is_pinned BOOLEAN NOT NULL DEFAULT 0,
    follow_up_date DATE,
    visibility TEXT NOT NULL CHECK (visibility IN ('TEACHERS_ONLY', 'ADMIN_ONLY')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS interventions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    created_by_user_id TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PARENT_CALL', 'TUTORING', 'COUNSELING', 'DEADLINE_CHANGE', 'OTHER')),
    notes TEXT,
    outcome_status TEXT NOT NULL CHECK (outcome_status IN ('PLANNED', 'DONE')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id)
);
