//! Data models for the CareerBridge application.
//!
//! This module contains all database models, enums, and data structures
//! used throughout the application.

use serde::{Deserialize, Deserializer, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Custom deserializer for case-insensitive enum matching
fn deserialize_case_insensitive<'de, D, T>(deserializer: D) -> Result<T, D::Error>
where
    D: Deserializer<'de>,
    T: std::str::FromStr,
    T::Err: std::fmt::Display,
{
    let s = String::deserialize(deserializer)?;
    s.to_lowercase()
        .parse()
        .map_err(serde::de::Error::custom)
}

/// Experience level of a user or required for a job.
#[derive(Debug, Serialize, sqlx::Type)]
#[sqlx(type_name = "experience_level")]
#[sqlx(rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum ExperienceLevel {
    /// Entry-level with no prior experience
    Fresher,
    /// 1-3 years of experience
    Junior,
    /// 3-5 years of experience
    Mid,
}

impl std::str::FromStr for ExperienceLevel {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "fresher" => Ok(ExperienceLevel::Fresher),
            "junior" => Ok(ExperienceLevel::Junior),
            "mid" => Ok(ExperienceLevel::Mid),
            _ => Err(format!("Unknown experience level: {}", s)),
        }
    }
}

impl<'de> Deserialize<'de> for ExperienceLevel {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserialize_case_insensitive(deserializer)
    }
}

/// Career track or specialization path.
#[derive(Debug, Serialize, sqlx::Type)]
#[sqlx(type_name = "career_track")]
#[sqlx(rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum CareerTrack {
    /// Web development and engineering
    WebDevelopment,
    /// Data science and analytics
    Data,
    /// UI/UX and graphic design
    Design,
    /// Digital and content marketing
    Marketing,
}

impl std::str::FromStr for CareerTrack {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().replace('-', "_").replace(' ', "_").as_str() {
            "web_development" | "webdevelopment" => Ok(CareerTrack::WebDevelopment),
            "data" => Ok(CareerTrack::Data),
            "design" => Ok(CareerTrack::Design),
            "marketing" => Ok(CareerTrack::Marketing),
            _ => Err(format!("Unknown career track: {}", s)),
        }
    }
}

impl<'de> Deserialize<'de> for CareerTrack {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserialize_case_insensitive(deserializer)
    }
}

/// Type of job or employment arrangement.
#[derive(Debug, Serialize, sqlx::Type)]
#[sqlx(type_name = "job_type")]
#[sqlx(rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum JobType {
    /// Internship position
    Internship,
    /// Part-time employment
    PartTime,
    /// Full-time employment
    FullTime,
    /// Freelance or contract work
    Freelance,
}

impl std::str::FromStr for JobType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().replace('-', "_").replace(' ', "_").as_str() {
            "internship" => Ok(JobType::Internship),
            "part_time" | "parttime" => Ok(JobType::PartTime),
            "full_time" | "fulltime" => Ok(JobType::FullTime),
            "freelance" => Ok(JobType::Freelance),
            _ => Err(format!("Unknown job type: {}", s)),
        }
    }
}

impl<'de> Deserialize<'de> for JobType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserialize_case_insensitive(deserializer)
    }
}

/// Cost indicator for learning resources.
#[derive(Debug, Serialize, sqlx::Type)]
#[sqlx(type_name = "cost_indicator")]
#[sqlx(rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum CostIndicator {
    /// Free resource
    Free,
    /// Paid resource
    Paid,
}

impl std::str::FromStr for CostIndicator {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "free" => Ok(CostIndicator::Free),
            "paid" => Ok(CostIndicator::Paid),
            _ => Err(format!("Unknown cost indicator: {}", s)),
        }
    }
}

impl<'de> Deserialize<'de> for CostIndicator {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserialize_case_insensitive(deserializer)
    }
}

/// User account with profile and career information.
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct User {
    /// Unique user identifier
    pub id: Uuid,
    /// User's full name
    pub full_name: String,
    /// User's email address (unique)
    pub email: String,
    /// Educational background
    pub education_level: Option<String>,
    /// Current experience level (nullable until profile completion)
    #[sqlx(rename = "experience_level")]
    pub experience_level: Option<ExperienceLevel>,
    /// Preferred career track (nullable until profile completion)
    #[sqlx(rename = "preferred_track")]
    pub preferred_track: Option<CareerTrack>,
    /// Whether the user has completed their profile onboarding
    pub profile_completed: bool,
    /// List of skills the user possesses
    pub skills: Vec<String>,
    /// List of projects the user has completed
    pub projects: Vec<String>,
    /// Target job roles the user is interested in
    #[sqlx(rename = "target_roles")]
    pub target_roles: Vec<String>,
    /// Raw CV/resume text for analysis
    #[sqlx(rename = "raw_cv_text")]
    pub raw_cv_text: Option<String>,
    /// Hashed password (excluded from serialization)
    #[serde(skip_serializing)]
    pub password_hash: String,
}

/// Job listing with requirements and details.
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Job {
    /// Unique job identifier
    pub id: i32,
    /// Job title or position name
    #[sqlx(rename = "job_title")]
    pub job_title: String,
    /// Company offering the job
    pub company: String,
    /// Job location
    pub location: String,
    /// Detailed job description
    #[sqlx(rename = "job_description")]
    pub job_description: String,
    /// Skills required for the job
    #[sqlx(rename = "required_skills")]
    pub required_skills: Vec<String>,
    /// Required experience level
    #[sqlx(rename = "experience_level")]
    pub experience_level: ExperienceLevel,
    /// Type of employment
    #[sqlx(rename = "job_type")]
    pub job_type: JobType,
    /// Minimum salary offered in the range (optional, in local currency)
    #[sqlx(rename = "salary_min")]
    pub salary_min: Option<i32>,
    /// Maximum salary offered in the range (optional, in local currency)
    #[sqlx(rename = "salary_max")]
    pub salary_max: Option<i32>,
}

/// Learning resource for skill development.
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct LearningResource {
    /// Unique resource identifier
    pub id: i32,
    /// Resource title
    pub title: String,
    /// Platform hosting the resource (e.g., Coursera, Udemy)
    pub platform: String,
    /// URL to access the resource
    pub url: String,
    /// Skills taught by this resource
    #[sqlx(rename = "related_skills")]
    pub related_skills: Vec<String>,
    /// Whether the resource is free or paid
    #[sqlx(rename = "cost")]
    pub cost: CostIndicator,
}

/// Job application tracking information.
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct ApplicationTracking {
    /// Unique application identifier
    pub id: Option<i32>,
    /// User who submitted the application
    pub user_id: Uuid,
    /// Job being applied to
    pub job_id: i32,
    /// Application status (e.g., "applied", "interview", "rejected")
    pub status: String,
    /// Timestamp when application was submitted
    pub applied_at: Option<DateTime<Utc>>,
    /// Additional notes about the application
    pub notes: Option<String>,
}

/// User's progress through a learning resource.
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct UserProgress {
    /// Unique progress record identifier
    pub id: Option<i32>,
    /// User tracking progress
    pub user_id: Uuid,
    /// Learning resource being tracked
    pub resource_id: i32,
    /// Completion percentage (0-100)
    pub completion_percentage: Option<i32>,
    /// When user started the resource
    pub started_at: Option<DateTime<Utc>>,
    /// When user completed the resource
    pub completed_at: Option<DateTime<Utc>>,
}

/// User notification.
#[allow(dead_code)]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Notification {
    /// Unique notification identifier
    pub id: i32,
    /// User receiving the notification
    pub user_id: Uuid,
    /// Notification title
    pub title: String,
    /// Notification message content
    pub message: String,
    /// Type of notification (e.g., "job_match", "resource_recommendation")
    #[sqlx(rename = "type")]
    pub notification_type: String,
    /// Whether the notification has been read
    pub is_read: bool,
    /// When the notification was created
    pub created_at: DateTime<Utc>,
}

/// Skill assessment record.
#[allow(dead_code)]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct SkillAssessment {
    /// Unique assessment identifier
    pub id: i32,
    /// User being assessed
    pub user_id: Uuid,
    /// Name of the skill assessed
    pub skill_name: String,
    /// Proficiency level (typically 1-5)
    pub proficiency_level: i32,
    /// When the assessment was performed
    pub assessed_at: DateTime<Utc>,
}

/// OAuth provider user information.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OAuthUser {
    /// Provider's unique user ID
    pub id: String,
    /// User's email address
    pub email: String,
    /// User's full name
    pub name: String,
    /// User's avatar/profile picture URL
    pub avatar_url: Option<String>,
}

/// User with OAuth fields included.
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct UserWithOAuth {
    /// Unique user identifier
    pub id: Uuid,
    /// User's full name
    pub full_name: String,
    /// User's email address
    pub email: String,
    /// OAuth provider (google, github, or null)
    pub oauth_provider: Option<String>,
    /// Provider's unique user ID
    pub oauth_id: Option<String>,
    /// User's avatar URL from OAuth provider
    pub avatar_url: Option<String>,
    /// Educational background
    pub education_level: Option<String>,
    /// Current experience level
    pub experience_level: Option<ExperienceLevel>,
    /// Preferred career track
    pub preferred_track: Option<CareerTrack>,
    /// Whether the user has completed their profile
    pub profile_completed: bool,
    /// List of skills
    pub skills: Vec<String>,
    /// List of projects
    pub projects: Vec<String>,
    /// Target job roles
    pub target_roles: Vec<String>,
    /// Raw CV text
    pub raw_cv_text: Option<String>,
}
