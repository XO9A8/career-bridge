# CareerBridge – AI-Powered Career Platform

> A comprehensive career development platform helping students and fresh graduates discover their perfect career path through intelligent job matching, personalized learning recommendations, and progress tracking.

## 🌟 Overview

CareerBridge connects job seekers with opportunities that match their skills and career goals. Built with modern technologies, the platform offers:

- **Smart Job Matching** - Get personalized job recommendations based on your skills and experience
- **Skill Gap Analysis** - Discover what skills you need and get learning recommendations
- **Progress Tracking** - Monitor your job applications and learning journey
- **Multiple Login Options** - Sign in with email, Google, or GitHub
- **Beautiful Interface** - Modern dark theme with smooth animations

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

# Configure .env file with database and OAuth credentials
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

