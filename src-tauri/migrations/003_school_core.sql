CREATE TABLE IF NOT EXISTS campuses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    homeroom_teacher_id TEXT,
    FOREIGN KEY(campus_id) REFERENCES campuses(id)
);

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    grade_level TEXT
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    student_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    preferred_name TEXT,
    gender TEXT,
    date_of_birth DATE,
    address TEXT, 
    guardian_name TEXT, 
    guardian_contact TEXT, 
    emergency_contact TEXT, 
    enrollment_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED')),
    photo_path TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campus_id) REFERENCES campuses(id),
    FOREIGN KEY(class_id) REFERENCES classes(id)
);

CREATE TABLE IF NOT EXISTS student_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    term TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    staff_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    campus_email TEXT UNIQUE NOT NULL,
    position_title TEXT NOT NULL,
    department TEXT,
    qualifications_json TEXT,
    hire_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    photo_path TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    FOREIGN KEY(staff_id) REFERENCES staff(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS staff_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('HOMEROOM', 'SUBJECT_TEACHER')),
    FOREIGN KEY(staff_id) REFERENCES staff(id),
    FOREIGN KEY(class_id) REFERENCES classes(id)
);
