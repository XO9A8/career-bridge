# API Integration Guide

> Complete guide for frontend developers to integrate with CareerBridge API

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Authentication Flow](#authentication-flow)
- [API Endpoints Reference](#api-endpoints-reference)
- [Error Handling](#error-handling)
- [Frontend Integration Examples](#frontend-integration-examples)
- [Best Practices](#best-practices)

## Quick Start

### Base Configuration

```javascript
const API_BASE_URL = 'http://127.0.0.1:3000/api';

// Add token to requests
const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});
```

### Response Format

All successful responses return JSON with appropriate HTTP status codes:
- `200 OK` - Successful GET/PUT requests
- `201 Created` - Successful POST requests
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server errors

## Authentication Flow

### 1. OAuth Login (Recommended)

**Google Login**
```javascript
// Redirect user to OAuth endpoint
window.location.href = `${API_BASE_URL}/auth/google`;

// After OAuth, user is redirected to:
// http://localhost:5173/auth/callback?token=<JWT>&new_user=<true|false>

// Handle callback in your frontend
const handleOAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const isNewUser = params.get('new_user') === 'true';
  
  // Store token
  localStorage.setItem('authToken', token);
  
  // Redirect based on user status
  if (isNewUser) {
    router.push('/onboarding'); // Prompt to complete profile
  } else {
    router.push('/dashboard');
  }
};
```

**GitHub Login**
```javascript
// Same flow as Google
window.location.href = `${API_BASE_URL}/auth/github`;
```

**What the API Does:**
- Redirects to OAuth provider (Google/GitHub)
- Exchanges authorization code for user info
- Creates new account or links to existing account
- Generates JWT token
- Redirects to frontend with token and user status

**What Frontend Receives:**
- `token`: JWT token (24-hour validity)
- `new_user`: Boolean indicating if profile completion needed

### 2. Traditional Registration

**Endpoint:** `POST /api/register`

**What the API Expects:**
```typescript
interface RegisterRequest {
  full_name: string;    // User's full name
  email: string;        // Valid email address
  password: string;     // Minimum 8 characters
}
```

**What the API Does:**
- Validates email format and uniqueness
- Hashes password with Argon2
- Creates user account with `profile_completed: false`
- Generates JWT token immediately
- Returns token and user ID

**What Frontend Receives:**
```typescript
interface RegisterResponse {
  message: string;           // "User registered successfully"
  token: string;             // JWT token for immediate login
  user_id: string;           // UUID of created user
}
```

**Frontend Implementation:**
```javascript
const register = async (fullName, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    
    // Store token immediately
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userId', data.user_id);
    
    // Redirect to profile completion
    router.push('/onboarding');
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    // Show user-friendly error
    if (error.message.includes('email already exists')) {
      alert('This email is already registered. Please login instead.');
    }
    throw error;
  }
};
```

### 3. Login

**Endpoint:** `POST /api/login`

**What the API Expects:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**What the API Does:**
- Validates credentials
- Verifies password hash
- Generates fresh JWT token
- Returns user profile data

**What Frontend Receives:**
```typescript
interface LoginResponse {
  token: string;              // JWT token
  user: {
    id: string;               // User UUID
    full_name: string;
    email: string;
    profile_completed: boolean;  // KEY: Check this flag!
    experience_level: string | null;
    preferred_track: string | null;
    skills: string[];
    projects: string[];
    target_roles: string[];
    avatar_url: string | null;  // From OAuth
  }
}
```

**Frontend Implementation:**
```javascript
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  
  const data = await response.json();
  
  // Store token
  localStorage.setItem('authToken', data.token);
  
  // Check if profile is completed
  if (!data.user.profile_completed) {
    router.push('/onboarding');
  } else {
    router.push('/dashboard');
  }
  
  return data;
};
```

## API Endpoints Reference

### Profile Management

#### Get Profile
**Endpoint:** `GET /api/profile`  
**Authentication:** Required

**What the API Does:**
- Fetches complete user profile from database
- Returns all fields including completion status

**What Frontend Receives:**
```typescript
interface ProfileResponse {
  id: string;
  full_name: string;
  email: string;
  profile_completed: boolean;
  education_level: string | null;
  experience_level: 'fresher' | 'junior' | 'mid' | null;
  preferred_track: 'web_development' | 'data' | 'design' | 'marketing' | null;
  skills: string[];
  projects: string[];
  target_roles: string[];
  raw_cv_text: string | null;
  oauth_provider: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
```

**Frontend Implementation:**
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: getHeaders(token)
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('authToken');
    router.push('/login');
    return;
  }
  
  return await response.json();
};
```

#### Complete Profile (Onboarding)
**Endpoint:** `POST /api/profile/complete`  
**Authentication:** Required

**What the API Expects:**
```typescript
interface CompleteProfileRequest {
  education_level: string;
  experience_level: 'fresher' | 'junior' | 'mid';  // Case-insensitive
  preferred_track: 'web_development' | 'data' | 'design' | 'marketing';
  skills: string[];           // Array of skill names
  projects: string[];         // Array of project descriptions
  target_roles: string[];     // Array of desired job titles
}
```

**What the API Does:**
- Updates profile fields in database
- Sets `profile_completed: true`
- Returns success message

**What Frontend Receives:**
```typescript
interface CompleteProfileResponse {
  message: string;  // "Profile completed successfully"
}
```

**Frontend Implementation:**
```javascript
const completeProfile = async (profileData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/profile/complete`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      education_level: profileData.education,
      experience_level: profileData.experienceLevel.toLowerCase(),
      preferred_track: profileData.track,
      skills: profileData.skills,
      projects: profileData.projects,
      target_roles: profileData.targetRoles
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  // Profile completed - redirect to dashboard
  router.push('/dashboard');
};
```

#### Update Profile
**Endpoint:** `PUT /api/profile`  
**Authentication:** Required

**What the API Expects:**
```typescript
interface UpdateProfileRequest {
  full_name?: string;
  education_level?: string;
  experience_level?: 'fresher' | 'junior' | 'mid';
  skills?: string[];
  projects?: string[];
  target_roles?: string[];
  raw_cv_text?: string;
}
// All fields are optional - only send what changed
```

**What the API Does:**
- Updates only provided fields
- Maintains existing values for omitted fields
- Returns list of modified fields

**What Frontend Receives:**
```typescript
interface UpdateProfileResponse {
  message: string;           // "Profile updated successfully"
  updated_fields: string[];  // ["skills", "experience_level"]
}
```

**Frontend Implementation:**
```javascript
const updateProfile = async (updates) => {
  const token = localStorage.getItem('authToken');
  
  // Only send fields that changed
  const payload = {};
  if (updates.skills) payload.skills = updates.skills;
  if (updates.experienceLevel) payload.experience_level = updates.experienceLevel;
  
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  console.log('Updated fields:', data.updated_fields);
  
  return data;
};
```

### Job Recommendations

**Endpoint:** `GET /api/jobs/recommendations`  
**Authentication:** Required

**What the API Expects:**
```typescript
// Query parameters (all optional)
interface JobRecommendationsQuery {
  experience_level?: 'fresher' | 'junior' | 'mid';
  job_type?: 'internship' | 'part_time' | 'full_time' | 'freelance';
  limit?: number;  // Default: 10
}
```

**What the API Does:**
- Fetches user's skills from profile
- Compares with jobs in database
- Calculates match score: (matched_skills / required_skills) × 100
- Identifies matched and missing skills
- Sorts by match score (highest first)
- Applies filters if provided

**What Frontend Receives:**
```typescript
interface JobRecommendation {
  job: {
    id: number;
    job_title: string;
    company: string;
    location: string;
    job_description: string;
    required_skills: string[];
    experience_level: string;
    job_type: string;
    salary_min: number | null;
    salary_max: number | null;
  };
  match_score: number;         // 0-100 percentage
  matched_skills: string[];
  missing_skills: string[];
}
```

**Frontend Implementation:**
```javascript
const getJobRecommendations = async (filters = {}) => {
  const token = localStorage.getItem('authToken');
  
  // Build query string
  const params = new URLSearchParams();
  if (filters.experienceLevel) params.append('experience_level', filters.experienceLevel);
  if (filters.jobType) params.append('job_type', filters.jobType);
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  const url = `${API_BASE_URL}/jobs/recommendations?${params.toString()}`;
  const response = await fetch(url, {
    headers: getHeaders(token)
  });
  
  return await response.json();
};

// Display in UI
const displayJobs = (jobs) => {
  jobs.forEach(job => {
    console.log(`${job.job.job_title} at ${job.job.company}`);
    console.log(`Match: ${job.match_score}%`);
    console.log(`You have: ${job.matched_skills.join(', ')}`);
    console.log(`Need to learn: ${job.missing_skills.join(', ')}`);
    
    if (job.job.salary_min && job.job.salary_max) {
      console.log(`Salary: $${job.job.salary_min} - $${job.job.salary_max}`);
    }
  });
};
```

### Learning Resources

**Endpoint:** `GET /api/learning/recommendations`  
**Authentication:** Required

**What the API Expects:** No parameters required

**What the API Does:**
- Fetches user's current skills
- Finds learning resources that teach new skills
- Calculates relevance: (new_skills / total_skills) × 100
- Prioritizes resources teaching missing skills
- Returns sorted by relevance

**What Frontend Receives:**
```typescript
interface LearningRecommendation {
  resource: {
    id: number;
    title: string;
    platform: string;       // "Coursera", "Udemy", etc.
    url: string;
    related_skills: string[];
    cost: 'free' | 'paid';
  };
  relevance_score: number;  // 0-100 percentage
  new_skills: string[];     // Skills you don't have yet
}
```

**Frontend Implementation:**
```javascript
const getLearningRecommendations = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/learning/recommendations`, {
    headers: getHeaders(token)
  });
  
  return await response.json();
};

// Filter by cost
const getFreeResources = async () => {
  const resources = await getLearningRecommendations();
  return resources.filter(r => r.resource.cost === 'free');
};
```

### Skill Gap Analysis

**Endpoint:** `GET /api/skill-gap/{role}`  
**Authentication:** Required

**What the API Expects:**
```typescript
// URL parameter (URL-encoded)
role: string  // e.g., "Full Stack Developer", "Data Analyst"
```

**What the API Does:**
- Fetches all jobs matching the target role
- Aggregates required skills across jobs
- Compares with user's current skills
- Calculates match percentage
- Identifies specific gaps
- Recommends relevant learning resources

**What Frontend Receives:**
```typescript
interface SkillGapAnalysis {
  user_skills: string[];
  target_role: string;
  required_skills: string[];
  skill_gaps: string[];
  matching_skills: string[];
  match_percentage: number;  // 0-100
  recommended_resources: Array<{
    id: number;
    title: string;
    platform: string;
    url: string;
    related_skills: string[];
    cost: 'free' | 'paid';
  }>;
}
```

**Frontend Implementation:**
```javascript
const analyzeSkillGap = async (targetRole) => {
  const token = localStorage.getItem('authToken');
  
  // URL encode the role name
  const encodedRole = encodeURIComponent(targetRole);
  
  const response = await fetch(
    `${API_BASE_URL}/skill-gap/${encodedRole}`,
    { headers: getHeaders(token) }
  );
  
  return await response.json();
};

// Display skill gap visualization
const displaySkillGap = (analysis) => {
  console.log(`Target Role: ${analysis.target_role}`);
  console.log(`Match: ${analysis.match_percentage}%`);
  console.log(`You have: ${analysis.matching_skills.join(', ')}`);
  console.log(`Need to learn: ${analysis.skill_gaps.join(', ')}`);
  
  // Show recommended resources
  analysis.recommended_resources.forEach(resource => {
    console.log(`📚 ${resource.title} (${resource.platform}) - ${resource.cost}`);
  });
};
```

### Application Tracking

#### Create Application
**Endpoint:** `POST /api/applications`  
**Authentication:** Required

**What the API Expects:**
```typescript
interface CreateApplicationRequest {
  job_id: number;
  notes?: string;  // Optional initial notes
}
```

**What the API Does:**
- Creates application record with "applied" status
- Links to user and job
- Sets applied_at timestamp
- Returns created application

**What Frontend Receives:**
```typescript
interface Application {
  id: number;
  user_id: string;
  job_id: number;
  status: string;          // "applied" by default
  applied_at: string;      // ISO timestamp
  notes: string | null;
}
```

**Frontend Implementation:**
```javascript
const applyToJob = async (jobId, notes = '') => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      job_id: jobId,
      notes: notes
    })
  });
  
  const application = await response.json();
  
  // Show success message
  alert('Application submitted successfully!');
  
  return application;
};
```

#### Get Applications
**Endpoint:** `GET /api/applications`  
**Authentication:** Required

**What the API Does:**
- Fetches all user's applications
- Joins with jobs table for full details
- Returns chronological list

**What Frontend Receives:**
```typescript
interface ApplicationWithJob {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  location: string;
  status: string;
  applied_at: string;
  notes: string | null;
}
```

**Frontend Implementation:**
```javascript
const getMyApplications = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/applications`, {
    headers: getHeaders(token)
  });
  
  const applications = await response.json();
  
  // Group by status
  const grouped = applications.reduce((acc, app) => {
    if (!acc[app.status]) acc[app.status] = [];
    acc[app.status].push(app);
    return acc;
  }, {});
  
  return grouped;
};
```

#### Update Application
**Endpoint:** `PUT /api/applications/{id}`  
**Authentication:** Required

**What the API Expects:**
```typescript
interface UpdateApplicationRequest {
  status?: string;  // e.g., "interview_scheduled", "rejected", "offer_received"
  notes?: string;
}
```

**What the API Does:**
- Updates application fields
- Maintains timestamp integrity
- Returns updated application

**What Frontend Receives:**
```typescript
interface Application {
  id: number;
  user_id: string;
  job_id: number;
  status: string;
  applied_at: string;
  notes: string | null;
}
```

**Frontend Implementation:**
```javascript
const updateApplication = async (applicationId, updates) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(updates)
  });
  
  return await response.json();
};

// Example: Update status to interview scheduled
await updateApplication(1, {
  status: 'interview_scheduled',
  notes: 'Phone interview on Monday at 10am'
});
```

### Progress Tracking

#### Start Resource
**Endpoint:** `POST /api/progress/resource/{id}/start`  
**Authentication:** Required

**What the API Expects:**
```typescript
// URL parameter
resource_id: number
```

**What the API Does:**
- Creates progress record
- Sets completion_percentage to 0
- Records started_at timestamp
- Prevents duplicates (one progress per user per resource)

**What Frontend Receives:**
```typescript
interface Progress {
  id: number;
  user_id: string;
  resource_id: number;
  completion_percentage: number;  // 0
  started_at: string;
  completed_at: string | null;
}
```

**Frontend Implementation:**
```javascript
const startLearning = async (resourceId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(
    `${API_BASE_URL}/progress/resource/${resourceId}/start`,
    {
      method: 'POST',
      headers: getHeaders(token)
    }
  );
  
  if (response.status === 409) {
    alert('You already started this resource!');
    return;
  }
  
  return await response.json();
};
```

#### Update Progress
**Endpoint:** `PUT /api/progress/resource/{id}`  
**Authentication:** Required

**What the API Expects:**
```typescript
interface UpdateProgressRequest {
  completion_percentage: number;  // 0-100
}
```

**What the API Does:**
- Updates completion percentage
- Validates: 0 <= percentage <= 100
- Auto-sets completed_at when reaching 100%
- Logs milestone completions

**What Frontend Receives:**
```typescript
interface Progress {
  id: number;
  user_id: string;
  resource_id: number;
  completion_percentage: number;
  started_at: string;
  completed_at: string | null;  // Set when reaching 100%
}
```

**Frontend Implementation:**
```javascript
const updateProgress = async (resourceId, percentage) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(
    `${API_BASE_URL}/progress/resource/${resourceId}`,
    {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({
        completion_percentage: percentage
      })
    }
  );
  
  const progress = await response.json();
  
  // Celebrate completion!
  if (progress.completion_percentage === 100) {
    showConfetti();
    alert('🎉 Congratulations! Course completed!');
  }
  
  return progress;
};
```

#### Get Progress
**Endpoint:** `GET /api/progress`  
**Authentication:** Required

**What the API Does:**
- Fetches all user's progress records
- Joins with learning_resources table
- Returns enriched data

**What Frontend Receives:**
```typescript
interface ProgressWithResource {
  id: number;
  resource_id: number;
  title: string;              // Resource title
  platform: string;           // Resource platform
  completion_percentage: number;
  started_at: string;
  completed_at: string | null;
}
```

**Frontend Implementation:**
```javascript
const getMyProgress = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/progress`, {
    headers: getHeaders(token)
  });
  
  const progress = await response.json();
  
  // Calculate statistics
  const completed = progress.filter(p => p.completion_percentage === 100);
  const inProgress = progress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100);
  
  console.log(`Completed: ${completed.length}`);
  console.log(`In Progress: ${inProgress.length}`);
  
  return { all: progress, completed, inProgress };
};
```

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  error: string;  // User-friendly error message
}
```

### Common Error Scenarios

**401 Unauthorized - Token Issues**
```javascript
const handleApiCall = async (url, options) => {
  const response = await fetch(url, options);
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('authToken');
    router.push('/login');
    throw new Error('Session expired. Please login again.');
  }
  
  return response;
};
```

**400 Bad Request - Validation Errors**
```javascript
try {
  const response = await register(name, email, password);
} catch (error) {
  if (error.message.includes('email already exists')) {
    // Show specific error to user
    setError('email', 'This email is already registered');
  } else if (error.message.includes('password')) {
    setError('password', 'Password must be at least 8 characters');
  }
}
```

**404 Not Found**
```javascript
const getJobDetails = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  
  if (response.status === 404) {
    alert('Job not found. It may have been removed.');
    router.push('/jobs');
    return;
  }
  
  return await response.json();
};
```

## Frontend Integration Examples

### React Example

```javascript
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:3000/api';

// Custom hook for API calls
const useApi = () => {
  const token = localStorage.getItem('authToken');
  
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return await response.json();
  };
  
  return { apiCall };
};

// Dashboard component
const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiCall } = useApi();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile and jobs in parallel
        const [profileData, jobsData] = await Promise.all([
          apiCall('/profile'),
          apiCall('/jobs/recommendations?limit=5')
        ]);
        
        setProfile(profileData);
        setJobs(jobsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome, {profile.full_name}!</h1>
      <h2>Top Job Matches</h2>
      {jobs.map(job => (
        <JobCard key={job.job.id} job={job} />
      ))}
    </div>
  );
};
```

### Vue.js Example

```javascript
// api.js
export const api = {
  baseUrl: 'http://127.0.0.1:3000/api',
  
  getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },
  
  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
    return await response.json();
  },
  
  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return await response.json();
  }
};

// Component
export default {
  data() {
    return {
      jobs: [],
      loading: true
    };
  },
  
  async mounted() {
    try {
      this.jobs = await api.get('/jobs/recommendations');
    } catch (error) {
      this.$toast.error('Failed to load jobs');
    } finally {
      this.loading = false;
    }
  }
};
```

### Svelte Example

```javascript
<script>
  import { onMount } from 'svelte';
  
  const API_BASE_URL = 'http://127.0.0.1:3000/api';
  
  let profile = null;
  let applications = [];
  
  async function loadProfile() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    profile = await response.json();
  }
  
  async function loadApplications() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    applications = await response.json();
  }
  
  onMount(() => {
    loadProfile();
    loadApplications();
  });
</script>

{#if profile}
  <h1>{profile.full_name}'s Applications</h1>
  {#each applications as app}
    <div>
      <h3>{app.job_title} at {app.company}</h3>
      <p>Status: {app.status}</p>
    </div>
  {/each}
{/if}
```

## Best Practices

### 1. Token Management

```javascript
// Store token securely
const storeToken = (token) => {
  localStorage.setItem('authToken', token);
  // Set expiration reminder (24 hours)
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
  localStorage.setItem('tokenExpiry', expiresAt);
};

// Check token validity before requests
const isTokenValid = () => {
  const expiry = localStorage.getItem('tokenExpiry');
  return expiry && Date.now() < parseInt(expiry);
};

// Auto-refresh logic
const checkTokenExpiry = () => {
  if (!isTokenValid()) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    router.push('/login');
  }
};
```

### 2. Loading States

```javascript
const [loading, setLoading] = useState({
  profile: false,
  jobs: false,
  applications: false
});

const loadJobs = async () => {
  setLoading(prev => ({ ...prev, jobs: true }));
  try {
    const jobs = await apiCall('/jobs/recommendations');
    setJobs(jobs);
  } finally {
    setLoading(prev => ({ ...prev, jobs: false }));
  }
};
```

### 3. Error Boundaries

```javascript
const ErrorBoundary = ({ children }) => {
  const [error, setError] = useState(null);
  
  if (error) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }
  
  return children;
};
```

### 4. Optimistic Updates

```javascript
const updateApplicationStatus = async (id, status) => {
  // Update UI immediately
  setApplications(prev => 
    prev.map(app => 
      app.id === id ? { ...app, status } : app
    )
  );
  
  try {
    // Then update server
    await apiCall(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  } catch (error) {
    // Revert on error
    loadApplications();
    toast.error('Failed to update status');
  }
};
```

### 5. Caching Strategy

```javascript
const cache = new Map();

const cachedApiCall = async (endpoint, ttl = 60000) => {
  const cached = cache.get(endpoint);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await apiCall(endpoint);
  cache.set(endpoint, { data, timestamp: Date.now() });
  
  return data;
};
```

### 6. Progressive Enhancement

```javascript
// Check if profile is complete before showing advanced features
const canAccessFeature = (profile, feature) => {
  if (!profile.profile_completed) {
    router.push('/onboarding');
    return false;
  }
  return true;
};

// Show onboarding prompts
if (!profile.profile_completed) {
  showBanner('Complete your profile to get personalized recommendations!');
}
```

---

**Questions?** Open an issue or contact the backend team.

**API Version:** 0.1.0  
**Last Updated:** November 2025
