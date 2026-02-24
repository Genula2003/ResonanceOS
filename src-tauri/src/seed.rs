use crate::db::DbPool;
use bcrypt::{hash, DEFAULT_COST};

pub async fn seed_database(pool: &DbPool) -> Result<(), Box<dyn std::error::Error>> {
    // Check if users exist
    let user_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(pool)
        .await?;

    if user_count > 0 {
        return Ok(());
    }

    println!("Seeding database with demo data...");

    // 1. Seed Users
    let password = "password"; // Default for all demo users
    let hashed = hash(password, DEFAULT_COST)?;

    sqlx::query(
        r#"
        INSERT INTO users (id, email, password_hash, role, active)
        VALUES 
        ('user_admin', 'admin@local', ?, 'ADMIN', 1),
        ('user_teacher', 'teacher@local', ?, 'TEACHER', 1),
        ('user_finance', 'finance@local', ?, 'MANAGEMENT_FINANCE', 1)
        "#
    )
    .bind(&hashed)
    .bind(&hashed)
    .bind(&hashed)
    .execute(pool)
    .await?;

    // 2. Seed Campus & Core
    sqlx::query("INSERT INTO campuses (id, name) VALUES ('campus_01', 'Resonance Academy')")
        .execute(pool).await?;

    sqlx::query("INSERT INTO classes (id, campus_id, name, grade, section) VALUES ('class_10a', 'campus_01', '10-A', '10', 'A')")
        .execute(pool).await?;

    sqlx::query("INSERT INTO subjects (id, name, code) VALUES ('subj_math', 'Mathematics', 'MATH101'), ('subj_sci', 'Science', 'SCI101')")
        .execute(pool).await?;

    // 3. Seed Students (20 students)
    for i in 1..=20 {
        let id = format!("student_{:02}", i);
        let code = format!("ST{:03}", i);
        let name = format!("Student {}", i);
        sqlx::query(
            r#"
            INSERT INTO students (id, campus_id, class_id, student_code, full_name, enrollment_date, status)
            VALUES (?, 'campus_01', 'class_10a', ?, ?, '2024-01-01', 'ACTIVE')
            "#
        )
        .bind(&id)
        .bind(&code)
        .bind(&name)
        .execute(pool)
        .await?;
        
        // Seed some attendance
        sqlx::query(
            "INSERT INTO attendance_records (id, student_id, class_id, date, status, recorded_by_user_id) VALUES (?, ?, 'class_10a', '2024-01-10', 'PRESENT', 'user_teacher')"
        )
        .bind(format!("att_{}_1", i))
        .bind(&id)
        .execute(pool).await?;
        
        // Seed assessments
        sqlx::query(
            "INSERT INTO assessments (id, student_id, subject_id, class_id, type, title, date, max_score, score, recorded_by_user_id) VALUES (?, ?, 'subj_math', 'class_10a', 'QUIZ', 'Algebra Quiz', '2024-01-15', 100, 85, 'user_teacher')"
        )
        .bind(format!("score_{}_1", i))
        .bind(&id)
        .execute(pool).await?;
    }

    // 4. Seed Staff
    sqlx::query(
        r#"
        INSERT INTO staff (id, staff_code, full_name, campus_email, position_title, hire_date, status)
        VALUES ('staff_01', 'T001', 'John Doe', 'john@local', 'Senior Teacher', '2020-01-01', 'ACTIVE')
        "#
    ).execute(pool).await?;

    // 5. Seed Finance (Fee Plan + Invoices)
    sqlx::query(
        r#"
        INSERT INTO fee_plans (id, name, amount, frequency, active)
        VALUES ('plan_tuition_2024', 'Tuition 2024', 5000, 'TERM', 1)
        "#
    ).execute(pool).await?;

    // Invoice for Student 01
    sqlx::query(
        r#"
        INSERT INTO invoices (id, student_id, fee_plan_id, due_date, base_amount, total_amount, status)
        VALUES ('inv_01', 'student_01', 'plan_tuition_2024', '2024-02-01', 5000, 5000, 'ISSUED')
        "#
    ).execute(pool).await?;

    println!("Database seeded successfully.");
    Ok(())
}
