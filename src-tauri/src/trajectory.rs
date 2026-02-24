use crate::db::DbPool;
use crate::models::{Role};
use crate::auth::check_auth;
use tauri::State;
use serde::{Serialize, Deserialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize)]
pub struct TrajectoryState {
    pub E: f64, // Engagement
    pub M: f64, // Mastery
    pub S: f64, // Stability
    pub P: f64, // Support
    pub L: f64, // Load
    pub W: f64, // Phase Warning
    pub risk: i32, // 0-100
    pub performance_band: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InterventionRecommendation {
    pub action_key: String,
    pub name: String,
    pub cost: i32,
    pub predicted_risk_drop: i32,
    pub rationale: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TrajectoryResult {
    pub state: TrajectoryState,
    pub recommendations: Vec<InterventionRecommendation>,
}

#[derive(FromRow)]
struct InputData {
    att_present: i32,
    att_late: i32,
    att_total: i32,
    avg_score: Option<f64>,
    score_trend: Option<f64>,
    missing_assignments: i32,
    days_since_submit: Option<i32>,
}

#[derive(FromRow)]
struct AttendanceStats {
    total: i32,
    present: Option<i32>,
    late: Option<i32>,
}

#[derive(FromRow)]
struct ScoreStats {
    avg_score: Option<f64>,
}

// Math logic isolated for unit testing (mocking inputs)
fn compute_state_vector(data: &InputData) -> TrajectoryState {
    // 1. Engagement (E)
    // Formula: 0.55*att_rate + 0.25*(1-miss_rate) + 0.20*recency
    let att_rate = if data.att_total > 0 {
        (data.att_present as f64 + 0.5 * data.att_late as f64) / data.att_total as f64
    } else {
        0.5 // Default neutral if no data
    };

    let miss_rate = (data.missing_assignments as f64 / 10.0).min(1.0); // Cap at 1.0
    
    let days = data.days_since_submit.unwrap_or(30) as f64; // Default 30 days if never submitted
    let recency = (-days / 14.0).exp(); // Decay

    let E = 0.55 * att_rate + 0.25 * (1.0 - miss_rate) + 0.20 * recency;

    // 2. Mastery (M)
    let avg = data.avg_score.unwrap_or(60.0) / 100.0; // Normalize 0..1, default 60%
    let trend = data.score_trend.unwrap_or(0.0) / 100.0; // Normalize
    let M = (0.70 * avg + 0.30 * (avg + trend)).clamp(0.0, 1.0);

    // 3. Stability (S)
    // Simplified: High variance reduces stability.
    let att_volatility = if data.att_total > 5 && att_rate < 0.8 { 0.3 } else { 0.0 };
    let score_volatility = trend.abs();
    let S = (1.0 - (0.6 * att_volatility + 0.4 * score_volatility)).clamp(0.0, 1.0);

    // 4. Support (P) - Placeholder
    let P = 0.5; 

    // 5. Load (L) - Placeholder
    let L = 0.5;

    // 6. Phase Warning (W)
    let W = if att_rate < 0.6 || trend < -0.1 { 0.7 } else { 0.3 };

    // Risk Calculation
    // risk = 100 * clamp( 0.35*(1-E) + 0.30*(1-M) + 0.20*(1-S) + 0.15*W + 0.10*max(0, L-0.7), 0..1)
    let load_penalty = (L - 0.7f64).max(0.0f64);
    let raw_risk = 0.35*(1.0-E) + 0.30*(1.0-M) + 0.20*(1.0-S) + 0.15*W + 0.10*load_penalty;
    let risk = (raw_risk.clamp(0.0, 1.0) * 100.0).round() as i32;

    let performance_band = if M >= 0.85 { "A" } 
        else if M >= 0.75 { "B" }
        else if M >= 0.65 { "C" }
        else if M >= 0.50 { "D" }
        else { "F" };

    TrajectoryState {
        E: (E * 100.0).round() / 100.0,
        M: (M * 100.0).round() / 100.0,
        S: (S * 100.0).round() / 100.0,
        P: (P * 100.0_f64).round() / 100.0,
        L: (L * 100.0_f64).round() / 100.0,
        W: (W * 100.0).round() / 100.0,
        risk,
        performance_band: performance_band.to_string(),
    }
}

fn get_minimal_lever(state: &TrajectoryState) -> Vec<InterventionRecommendation> {
    // Determine weakest dimension
    let mut recommendations = Vec::new();

    if state.E < 0.6 {
        recommendations.push(InterventionRecommendation {
            action_key: "QuickCheckIn".to_string(),
            name: "Quick Check-in".to_string(),
            cost: 1,
            predicted_risk_drop: 5,
            rationale: "Engagement is critical. A quick check-in can boost connection.".to_string(),
        });
    }

    if state.M < 0.6 {
        recommendations.push(InterventionRecommendation {
            action_key: "Tutoring".to_string(),
            name: "Tutoring Session".to_string(),
            cost: 5,
            predicted_risk_drop: 15,
            rationale: "Mastery is low. Direct academic support is recommended.".to_string(),
        });
    }

    if state.risk > 65 {
        recommendations.push(InterventionRecommendation {
            action_key: "ParentCall".to_string(),
            name: "Parent Call".to_string(),
            cost: 3,
            predicted_risk_drop: 10,
            rationale: "High risk requires escalation to guardians.".to_string(),
        });
    }
    
    // Always provide at least one
    if recommendations.is_empty() {
        recommendations.push(InterventionRecommendation {
            action_key: "Monitor".to_string(),
            name: "Continue Monitoring".to_string(),
            cost: 0,
            predicted_risk_drop: 0,
            rationale: "Student is stable. No immediate action required.".to_string(),
        });
    }

    // Sort by cost efficiency (drop / cost)
    recommendations.sort_by(|a, b| {
        let eff_a = if a.cost > 0 { a.predicted_risk_drop as f64 / a.cost as f64 } else { 0.0 };
        let eff_b = if b.cost > 0 { b.predicted_risk_drop as f64 / b.cost as f64 } else { 0.0 };
        eff_b.partial_cmp(&eff_a).unwrap_or(std::cmp::Ordering::Equal)
    });

    recommendations
}

#[tauri::command]
pub async fn compute_trajectory(
    pool: State<'_, DbPool>,
    user_id: String,
    student_id: String
) -> Result<TrajectoryResult, String> {
    check_auth(&pool, &user_id, &[Role::Admin, Role::Teacher]).await?;

    let att_stats = sqlx::query_as::<_, AttendanceStats>(
        r#"
        SELECT 
            COUNT(*) as total, 
            SUM(CASE WHEN status='PRESENT' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN status='LATE' THEN 1 ELSE 0 END) as late
        FROM attendance_records 
        WHERE student_id = ?
        "#
    )
    .bind(&student_id)
    .fetch_one(&*pool)
    .await
    .map_err(|e| e.to_string())?;
    
    let score_stats = sqlx::query_as::<_, ScoreStats>(
        "SELECT AVG(score/max_score*100) as avg_score FROM assessments WHERE student_id = ?"
    )
    .bind(&student_id)
    .fetch_one(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    let input = InputData {
        att_total: att_stats.total,
        att_present: att_stats.present.unwrap_or(0),
        att_late: att_stats.late.unwrap_or(0),
        avg_score: score_stats.avg_score,
        score_trend: Some(0.0), // Needs time series query
        missing_assignments: 0, // Needs assignments query
        days_since_submit: Some(5), // Needs submissions query
    };

    let state = compute_state_vector(&input);
    let recommendations = get_minimal_lever(&state);

    Ok(TrajectoryResult {
        state,
        recommendations,
    })
}
