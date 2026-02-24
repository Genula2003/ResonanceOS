CREATE TABLE IF NOT EXISTS state_snapshots (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    E REAL NOT NULL,
    M REAL NOT NULL,
    S REAL NOT NULL,
    P REAL NOT NULL,
    L REAL NOT NULL,
    W REAL NOT NULL,
    risk_0_100 INTEGER NOT NULL,
    performance_band TEXT,
    inputs_json TEXT,
    computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS intervention_catalog (
    action_key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cost INTEGER NOT NULL,
    delta_json TEXT NOT NULL, -- e.g., {"E": 0.05, "S": 0.02}
    description TEXT
);

CREATE TABLE IF NOT EXISTS recommendation_snapshots (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    action_key TEXT NOT NULL,
    cost INTEGER NOT NULL,
    predicted_risk_drop INTEGER NOT NULL,
    predicted_state_json TEXT NOT NULL,
    rationale_text TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(action_key) REFERENCES intervention_catalog(action_key)
);
