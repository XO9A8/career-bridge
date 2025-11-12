use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Skill {
    pub id: Uuid,
    pub name: String,
    pub category: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct UserSkill {
    pub id: Uuid,
    pub user_id: Uuid,
    pub skill_id: Uuid,
    pub proficiency_level: String, // beginner, intermediate, advanced, expert
    pub years_of_experience: Option<i32>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserSkillWithDetails {
    pub id: Uuid,
    pub skill_id: Uuid,
    pub skill_name: String,
    pub category: String,
    pub proficiency_level: String,
    pub years_of_experience: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct AddUserSkillRequest {
    pub skill_id: Uuid,
    pub proficiency_level: String,
    pub years_of_experience: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSkillRequest {
    pub name: String,
    pub category: String,
    pub description: Option<String>,
}
