use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDate;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Role {
    Admin,
    Teacher,
    ManagementFinance,
}

impl ToString for Role {
    fn to_string(&self) -> String {
        match self {
            Role::Admin => "ADMIN".to_string(),
            Role::Teacher => "TEACHER".to_string(),
            Role::ManagementFinance => "MANAGEMENT_FINANCE".to_string(),
        }
    }
}

impl From<String> for Role {
    fn from(s: String) -> Self {
        match s.as_str() {
            "ADMIN" => Role::Admin,
            "TEACHER" => Role::Teacher,
            "MANAGEMENT_FINANCE" => Role::ManagementFinance,
            _ => Role::Teacher, 
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub email: String,
    pub password_hash: String,
    pub role: String, 
    pub active: bool,
    pub created_at: chrono::NaiveDateTime,
    pub last_login_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Student {
    pub id: String,
    pub full_name: String,
    pub student_code: String,
    pub class_id: String,
    pub photo_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StudentFinanceProfile {
    pub id: String,
    pub full_name: String,
    pub student_code: String,
    pub class_name: String, 
    pub photo_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StudentEducationProfile {
    pub id: String,
    pub full_name: String,
    pub student_code: String,
    pub class_name: String,
    pub date_of_birth: Option<NaiveDate>,
    pub gender: Option<String>,
    pub address: Option<String>,
    pub guardian_name: Option<String>,
    pub guardian_contact: Option<String>,
    pub emergency_contact: Option<String>,
    pub photo_path: Option<String>,
    pub enrollment_date: NaiveDate,
    pub status: String,
}
