// API utility for CareerBridge backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3000/api';

// Get headers with authentication token
const getHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// API Response types
export interface RegisterResponse {
  message: string;
  token: string;
  user_id: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    profile_completed: boolean;
    experience_level: string | null;
    preferred_track: string | null;
    skills: string[];
    projects: string[];
    target_roles: string[];
    avatar_url: string | null;
  };
}

export interface ProfileResponse {
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

export interface JobRecommendation {
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
    responsibilities: string[];
    requirements: string[];
    benefits: string[];
  };
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
}

export interface LearningRecommendation {
  resource: {
    id: number;
    title: string;
    platform: string;
    url: string;
    related_skills: string[];
    cost: 'free' | 'paid';
  };
  relevance_score: number;
  new_skills: string[];
}

export interface SkillGapAnalysis {
  user_skills: string[];
  target_role: string;
  required_skills: string[];
  skill_gaps: string[];
  matching_skills: string[];
  match_percentage: number;
  recommended_resources: {
    id: number;
    title: string;
    platform: string;
    url: string;
    related_skills: string[];
    cost: 'free' | 'paid';
  }[];
}

// Authentication APIs
export const authApi = {
  // Register new user
  register: async (fullName: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed. Please try again.';
      try {
        const error = await response.json();
        const rawError = error.error || error.message || '';
        
        // Parse validation errors (e.g., "password: Password must be at least 8 characters long")
        if (rawError.includes('password') && rawError.includes('8 characters')) {
          errorMessage = 'Password must be at least 8 characters long';
        } else if (rawError.includes('password') && rawError.includes('characters')) {
          errorMessage = 'Password does not meet requirements';
        } else if (rawError.includes('Email already exists') || (rawError.includes('email') && rawError.includes('exists'))) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (rawError.includes('email') && (rawError.includes('invalid') || rawError.includes('format'))) {
          errorMessage = 'Please enter a valid email address';
        } else if (rawError.includes('name') || rawError.includes('full_name')) {
          errorMessage = 'Please enter your full name';
        } else if (rawError) {
          // Use the error message if it's already user-friendly
          errorMessage = rawError;
        }
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  // Login user
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Invalid email or password. Please try again.';
      try {
        const error = await response.json();
        const rawError = error.error || error.message || '';
        
        // Map common login errors to user-friendly messages
        if (rawError.includes('Invalid password') || rawError.includes('password')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (rawError.includes('Unauthorized') || response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (rawError.includes('User not found') || rawError.includes('email')) {
          errorMessage = 'No account found with this email address. Please sign up instead.';
        } else if (rawError && !rawError.includes('Unauthorized')) {
          // Use the error message if it's already user-friendly
          errorMessage = rawError;
        }
      } catch {
        if (response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  // OAuth login - redirect to provider
  oauthLogin: (provider: 'google' | 'github') => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  },
};

// Profile APIs
export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<ProfileResponse> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: getHeaders(token),
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }

    return await response.json();
  },

  // Complete profile (onboarding)
  completeProfile: async (data: {
    education_level: string;
    experience_level: 'fresher' | 'junior' | 'mid';
    preferred_track: 'web_development' | 'data' | 'design' | 'marketing';
    skills: string[];
    projects: string[];
    target_roles: string[];
  }): Promise<{ message: string }> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/profile/complete`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to complete profile');
    }

    return await response.json();
  },

  // Update profile
  updateProfile: async (updates: {
    full_name?: string;
    education_level?: string;
    experience_level?: 'fresher' | 'junior' | 'mid';
    skills?: string[];
    projects?: string[];
    target_roles?: string[];
    raw_cv_text?: string;
  }): Promise<{ message: string; updated_fields: string[] }> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    return await response.json();
  },

  // Upload CV/Resume (PDF)
  uploadCV: async (file: File): Promise<{ message: string; extracted_length: number }> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('cv_file', file);

    const response = await fetch(`${API_BASE_URL}/profile/cv/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload CV');
    }

    return await response.json();
  },
};

// Jobs APIs
export const jobsApi = {
  // Get job recommendations
  getRecommendations: async (filters?: {
    experience_level?: 'fresher' | 'junior' | 'mid';
    job_type?: 'internship' | 'part_time' | 'full_time' | 'freelance';
    limit?: number;
  }): Promise<JobRecommendation[]> => {
    const token = getToken();
    const params = new URLSearchParams();
    
    if (filters?.experience_level) {
      params.append('experience_level', filters.experience_level);
    }
    if (filters?.job_type) {
      params.append('job_type', filters.job_type);
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const url = `${API_BASE_URL}/jobs/recommendations${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(token),
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch job recommendations');
    }

    return await response.json();
  },
};

// External Jobs APIs (NGO, Government, Local Boards)
export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  posted_date: string;
  source: string;
  job_type: string | null;
  experience_level: string | null;
  skills: string[];
  salary: string | null;
}

export const externalJobsApi = {
  // Get all external jobs
  getAll: async (): Promise<ExternalJob[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/jobs/external`, {
      headers: getHeaders(token),
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch external jobs');
    }

    return await response.json();
  },

  // Get NGO jobs from ReliefWeb
  getNGO: async (): Promise<ExternalJob[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/jobs/ngo`, {
      headers: getHeaders(token),
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch NGO jobs');
    }

    return await response.json();
  },

  // Get government portal jobs
  getGovt: async (): Promise<ExternalJob[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/jobs/govt`, {
      headers: getHeaders(token),
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch government jobs');
    }

    return await response.json();
  },

  // Get local job board listings
  getLocal: async (): Promise<ExternalJob[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/jobs/local`, {
      headers: getHeaders(token),
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch local jobs');
    }

    return await response.json();
  },
};

// Learning Resources APIs
export const learningApi = {
  // Get learning resource recommendations
  getRecommendations: async (): Promise<LearningRecommendation[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/learning/recommendations`, {
      headers: getHeaders(token),
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch learning recommendations');
    }

    return await response.json();
  },

  // Analyze skill gap for a target role
  analyzeSkillGap: async (targetRole: string): Promise<SkillGapAnalysis> => {
    const token = getToken();
    // URL encode the target role for the path parameter
    const encodedRole = encodeURIComponent(targetRole);
    const response = await fetch(`${API_BASE_URL}/skill-gap/${encodedRole}`, {
      headers: getHeaders(token),
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze skill gap');
    }

    return await response.json();
  },
};

// Application APIs
export const applicationsApi = {
  // Create application
  create: async (jobId: number, notes?: string): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ job_id: jobId, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create application');
    }

    return await response.json();
  },

  // Get user applications
  getAll: async (): Promise<any[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/applications`, {
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch applications');
    }

    return await response.json();
  },

  // Update application
  update: async (applicationId: number, updates: { status?: string; notes?: string }): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update application');
    }

    return await response.json();
  },
};

// Progress APIs
export const progressApi = {
  // Start learning resource
  start: async (resourceId: number): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/progress/resource/${resourceId}/start`, {
      method: 'POST',
      headers: getHeaders(token),
    });

    if (response.status === 409) {
      throw new Error('You already started this resource');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start resource');
    }

    return await response.json();
  },

  // Update progress
  update: async (resourceId: number, completionPercentage: number): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/progress/resource/${resourceId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ completion_percentage: completionPercentage }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update progress');
    }

    return await response.json();
  },

  // Get all progress
  getAll: async (): Promise<any[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/progress`, {
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch progress');
    }

    return await response.json();
  },
};

// AI APIs
export const aiApi = {
  // Extract skills from CV text
  extractSkills: async (cvText: string, provider: 'gemini' | 'groq' = 'gemini', updateProfile: boolean = true): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/extract-skills`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        cv_text: cvText,
        provider,
        update_profile: updateProfile
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract skills');
    }

    return await response.json();
  },

  // Generate career roadmap with enhanced parameters
  generateRoadmap: async (
    targetRole: string, 
    timeframeMonths: number = 6,
    learningHoursPerWeek: number = 10,
    includeCurrentSkills: boolean = true, 
    provider: 'gemini' | 'groq' = 'gemini'
  ): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/roadmap`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        target_role: targetRole,
        timeframe_months: timeframeMonths,
        learning_hours_per_week: learningHoursPerWeek,
        include_current_skills: includeCurrentSkills,
        provider
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate roadmap');
    }

    return await response.json();
  },

  // Get all saved roadmaps
  getRoadmaps: async (): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/roadmaps`, {
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch roadmaps');
    }

    return await response.json();
  },

  // Get specific roadmap by ID
  getRoadmapById: async (id: number): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/roadmaps/${id}`, {
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch roadmap');
    }

    return await response.json();
  },

  // Delete roadmap
  deleteRoadmap: async (id: number): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/roadmaps/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete roadmap');
    }

    return await response.json();
  },

  // Update roadmap progress
  updateRoadmapProgress: async (
    id: number, 
    progressPercentage?: number,
    completedPhases?: number[],
    notes?: string
  ): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/roadmaps/${id}/progress`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({
        progress_percentage: progressPercentage,
        completed_phases: completedPhases,
        notes: notes
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update roadmap progress');
    }

    return await response.json();
  },

  // Ask career mentor a question
  askMentor: async (question: string, provider: 'gemini' | 'groq' = 'gemini'): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/ask-mentor`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        question,
        provider
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get answer');
    }

    return await response.json();
  },

  // Enhanced career mentor with intelligent context awareness
  enhancedAskMentor: async (
    question: string,
    options: {
      provider?: 'gemini' | 'groq';
      includeSkillGap?: boolean;
      includeMarketAnalysis?: boolean;
      includeCvData?: boolean;
      targetRole?: string;
    } = {}
  ): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/enhanced-mentor`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        question,
        provider: options.provider || 'gemini',
        include_skill_gap: options.includeSkillGap || false,
        include_market_analysis: options.includeMarketAnalysis || false,
        include_cv_data: options.includeCvData || false,
        target_role: options.targetRole
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get answer');
    }

    return await response.json();
  },

  // Generate professional summary
  generateSummary: async (provider: 'gemini' | 'groq' = 'gemini'): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/generate-summary`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ provider }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate summary');
    }

    return await response.json();
  },

  // Improve project descriptions
  improveProjects: async (projects: string[], provider: 'gemini' | 'groq' = 'gemini'): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/improve-projects`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        projects,
        provider
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to improve projects');
    }

    return await response.json();
  },

  // Get profile improvement suggestions
  getProfileSuggestions: async (platform: string = 'linkedin', provider: 'gemini' | 'groq' = 'gemini'): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/profile-suggestions`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        platform,
        provider
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get suggestions');
    }

    return await response.json();
  },
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Utility function to logout
export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  window.location.href = '/login';
};

