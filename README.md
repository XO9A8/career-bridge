# CareerBridge – AI-Powered Career Platform

> A comprehensive career development platform helping students and fresh graduates discover their perfect career path through intelligent job matching, personalized learning recommendations, and progress tracking.

## 🌟 Overview

CareerBridge connects job seekers with opportunities that match their skills and career goals. Built with modern technologies, the platform offers:

- **Smart Job Matching** - Get personalized job recommendations with detailed match scores
- **AI Career Assistant** - Generate professional summaries, improve project descriptions, get profile tips
- **CV Management** - Upload, generate, and export professional CVs as PDF
- **Skill Gap Analysis** - Discover what skills you need and get learning recommendations
- **Career Roadmaps** - AI-generated personalized learning paths with timelines
- **Progress Tracking** - Monitor your job applications and learning journey
- **Multiple Login Options** - Sign in with email, Google, or GitHub
- **Beautiful Interface** - Modern dark/light themes with smooth animations

### 🎯 Who Is This For?
- 🎓 **Students** seeking internships and career guidance
- 👨‍💼 **Fresh Graduates** starting their professional journey
- 📈 **Career Changers** exploring new opportunities
- 💼 **Job Seekers** looking for their next role

## ✨ Key Features

### 🔐 Authentication
- Email and password login
- Google OAuth integration
- GitHub OAuth integration
- Secure JWT-based sessions

### 💼 Job Search
- Personalized job recommendations with match scores
- Search and filter by location, type, and experience level
- View detailed job descriptions, requirements, and benefits
- Track your applications

### 📚 Learning
- Discover courses and tutorials based on your skill gaps
- Track your learning progress
- Get recommendations tailored to your career goals
- Filter by cost (free/paid) and skills

### 📊 Career Development
- Analyze skill gaps for target roles
- See which skills employers are looking for
- Get a match percentage for different job positions
- Track your improvement over time
- **AI-powered career roadmaps** with personalized learning paths
- Project suggestions to build your portfolio
- Job application timing guidance

### 🤖 AI-Powered CV/Profile Assistant
- **Professional Summary Generator** - Create compelling CV summaries instantly
- **Project Description Enhancer** - Transform basic descriptions into impactful bullet points
- **LinkedIn/Portfolio Tips** - Get 5 personalized improvement suggestions
- **CV Export & Print** - Generate clean, professional CV layouts (PDF-ready)
- **Career Mentor Chatbot** - Ask career questions and get expert advice
- **Smart Skill Extraction** - Upload CV and automatically extract skills

### 🎨 Modern Experience
- Clean, intuitive interface with dark/light themes
- Smooth animations and transitions
- Mobile-responsive design
- Fast and reliable performance

## 🛠️ Technology Stack

**Backend:**
- Rust with Axum framework
- PostgreSQL database
- JWT authentication

**Frontend:**
- Next.js 15 with React 19
- TypeScript
- Tailwind CSS
- Radix UI components

> For detailed technical information, see [Backend Documentation](backend/README.md) and [Frontend Documentation](frontend/README.md).

## ⚡ Quick Start

### Prerequisites
- Rust 1.70+ ([Install](https://rustup.rs/))
- Node.js 18+ ([Install](https://nodejs.org/))
- PostgreSQL 14+ ([Install](https://www.postgresql.org/download/))

### Setup Instructions

**1. Clone the Repository**
```bash
git clone https://github.com/tamim2763/career-bridge.git
cd career-bridge
```

**2. Set Up Backend** (See [detailed backend setup](backend/README.md))
```bash
cd backend

# Create database
createdb -U postgres career_bridge

# Apply schema and seed data
psql -U postgres -d career_bridge -f schema.sql
psql -U postgres -d career_bridge -f seed_data.sql

# Create .env file with required environment variables
# See "Environment Variables & API Keys" section below for details
# Minimum required: DATABASE_URL, JWT_SECRET, FRONTEND_URL

# Then start the server
cargo run
```

Backend runs at: `http://localhost:3000`

**3. Set Up Frontend** (See [detailed frontend setup](frontend/README.md))
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3001`

> **Note:** Both servers must run simultaneously for the application to work properly.

### Quick Test
Visit `http://localhost:3001` to explore the application, or test the API:
```bash
curl http://localhost:3000/
```

## 🔐 Environment Variables & API Keys

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

#### Required Variables

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/career_bridge

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production-minimum-32-characters

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=http://localhost:3001
```

#### Optional Variables (for enhanced features)

```env
# Server Configuration
PORT=3000
RUST_ENV=development
RUST_LOG=info

# OAuth Authentication (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:3000/api/auth/google/callback

# OAuth Authentication (GitHub)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://127.0.0.1:3000/api/auth/github/callback

# AI Services (Optional - for AI-powered features)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3000/api
```

### How to Obtain API Keys

#### 1. Database (PostgreSQL)

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib
# macOS: brew install postgresql@14
# Windows: Download from postgresql.org

# Create database
createdb -U postgres career_bridge

# Update DATABASE_URL
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/career_bridge
```

**Option B: Cloud Database (Railway, Supabase, Neon)**
- Sign up at [Railway](https://railway.app), [Supabase](https://supabase.com), or [Neon](https://neon.tech)
- Create a PostgreSQL database
- Copy the connection string to `DATABASE_URL`

#### 2. JWT Secret

Generate a secure random string (minimum 32 characters):

```bash
# Linux/macOS
openssl rand -base64 32

# Or use an online generator
# https://generate-secret.vercel.app/32
```

#### 3. Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://127.0.0.1:3000/api/auth/google/callback`
7. Copy `Client ID` and `Client Secret` to `.env`

#### 4. GitHub OAuth (Optional)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: CareerBridge
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://127.0.0.1:3000/api/auth/github/callback`
4. Copy `Client ID` and generate `Client Secret`
5. Add to `.env` file

#### 5. Google Gemini API (Optional - for AI features)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Get API Key**
3. Create a new API key or use existing
4. Copy to `GEMINI_API_KEY` in `.env`

**Features enabled:**
- Professional CV summary generation
- Project description enhancement
- Profile improvement suggestions
- Career roadmap generation
- Career mentor chatbot
- Skill extraction from CV

#### 6. Groq API (Optional - AI fallback)

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up and navigate to **API Keys**
3. Create a new API key
4. Copy to `GROQ_API_KEY` in `.env`

**Note:** Groq is used as a fallback if Gemini API fails. The system automatically switches between providers.

#### 7. Hugging Face API (Optional - for AI job matching explanations)

1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up and navigate to **Settings** → **Access Tokens**
3. Create a new token with **Read** permissions
4. Copy to `HUGGINGFACE_API_KEY` in `.env`

**Features enabled:**
- AI-generated job match explanations
- Enhanced match analysis with strengths and improvement areas

**Note:** If not provided, the system falls back to heuristic explanations.

### Environment Variables Summary

| Variable | Required | Purpose | Where to Get |
|----------|----------|---------|--------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection | Local installation or cloud provider |
| `JWT_SECRET` | ✅ | Token signing | Generate with `openssl rand -base64 32` |
| `FRONTEND_URL` | ✅ | CORS configuration | Your frontend URL |
| `PORT` | ❌ | Server port (default: 3000) | Optional override |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/) |
| `GITHUB_CLIENT_ID` | ❌ | GitHub OAuth | [GitHub Developer Settings](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | ❌ | GitHub OAuth | [GitHub Developer Settings](https://github.com/settings/developers) |
| `GEMINI_API_KEY` | ❌ | AI features (primary) | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `GROQ_API_KEY` | ❌ | AI features (fallback) | [Groq Console](https://console.groq.com/) |
| `HUGGINGFACE_API_KEY` | ❌ | AI job matching | [Hugging Face](https://huggingface.co/settings/tokens) |

### Frontend Variables

| Variable | Required | Purpose | Default |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | ❌ | Backend API endpoint | `http://127.0.0.1:3000/api` |

## 📁 Project Structure

```
career-bridge/
├── backend/                    # Rust API server
│   ├── src/                   # Source code
│   ├── schema.sql             # Database schema
│   ├── seed_data.sql          # Sample data
│   └── README.md              # Backend documentation
│
├── frontend/                   # Next.js application
│   ├── src/                   # Source code
│   │   ├── app/              # Pages and routes
│   │   ├── components/       # React components
│   │   └── lib/              # Utilities
│   └── README.md              # Frontend documentation
│
├── LICENSE
└── README.md                   # This file
```

### Main Pages

| Page | Description |
|------|-------------|
| **Landing** (`/`) | Hero section, features, testimonials |
| **Dashboard** (`/dashboard`) | Personalized job and learning recommendations |
| **Jobs** (`/jobs`) | Search and browse job listings |
| **Resources** (`/resources`) | Learning materials and courses |
| **Profile** (`/profile`) | Manage your profile and CV |
| **Login/Register** | Authentication pages |

> For detailed architecture, see [Backend README](backend/README.md) and [Frontend README](frontend/README.md).

## 📚 Documentation

### Core Documentation
- **[Backend README](backend/README.md)** - API documentation, database schema, setup guide
- **[Frontend README](frontend/README.md)** - Component architecture, UI system, development guide
- **[API Tests](backend/api_tests.http)** - Interactive API examples

### Additional Resources
- Database schema details in [Backend README](backend/README.md)
- Component library in [Frontend README](frontend/README.md)
- OAuth setup instructions in [Backend README](backend/README.md)

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push and create a Pull Request

For coding standards and detailed guidelines, see the respective README files in `backend/` and `frontend/`.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the From_Los_Santosh Team**

🚀 Empowering careers through technology

</div>

