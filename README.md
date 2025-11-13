# CareerBridge – AI-Powered Career Platform

CareerBridge is a modern, feature-rich web application designed to help students and fresh graduates discover their perfect career path through AI-powered recommendations, curated job opportunities, and personalized learning resources.  
The interface features a sleek dark theme with glassmorphism effects, blue-purple gradient accents, and smooth animations to deliver a professional yet approachable experience.

## Highlights

- **Dynamic landing page** with hero section, feature showcase, how-it-works guide, and scrolling testimonials
- **Interactive dashboard** displaying personalized job recommendations, learning resources, and profile match indicators
- **Advanced jobs marketplace** with real-time search, location/type filters, and detailed job modal with full descriptions
- **Learning resources hub** featuring skill and cost-based filters, curated course cards, and direct platform links
- **Comprehensive profile management** for editing personal info, skills, career preferences, and CV content
- **Modern authentication** with split-screen login/register flows, Google OAuth integration, and gradient hero sections
- **Professional footer** inspired by industry leaders, with contact info, navigation links, and social media integration
- **Smooth animations** and polished hover states creating cohesive user experience across all pages

## Tech Stack

- **Next.js 15.3.5** with Turbopack for blazing-fast development
- **React 19** with client-side interactivity
- **Tailwind CSS 4** with custom glassmorphism and gradient utilities
- **Framer Motion** for smooth page transitions and animations
- **Radix UI** components for accessible, unstyled primitives
- **Lucide React** for beautiful, consistent iconography
- **TypeScript** for type-safe development
- Custom CSS animations for floating effects and infinite scrolling

## Quick Start

```bash
# Clone the repository
git clone https://github.com/tamim2763/career-bridge.git

# Navigate to frontend directory
cd career-bridge/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Navigate to `http://localhost:3001` to explore the application.

> **Note:** The frontend runs on port 3001, while the backend API runs on port 3000. Make sure both servers are running for the application to work properly.

## Project Structure

```
career-bridge/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/          # User dashboard with recommendations
│   │   │   ├── jobs/               # Job listings with search & filters
│   │   │   ├── resources/          # Learning resources catalog
│   │   │   ├── profile/            # User profile management
│   │   │   ├── login/              # Authentication - sign in
│   │   │   ├── register/           # Authentication - sign up
│   │   │   ├── onboarding/         # Multi-step onboarding flow
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── layout.tsx          # Root layout wrapper
│   │   │   ├── template.tsx        # Page transition wrapper
│   │   │   └── globals.css         # Global styles & animations
│   │   ├── components/
│   │   │   ├── ui/                 # Reusable UI components (Radix UI)
│   │   │   ├── Navbar.tsx          # Navigation component
│   │   │   ├── Footer.tsx          # Footer with links & contact
│   │   │   ├── TestimonialScroll.tsx  # Infinite scrolling testimonials
│   │   │   ├── OnboardingFlow.tsx  # Multi-step onboarding component
│   │   │   ├── PageTransition.tsx  # Framer Motion page transitions
│   │   │   ├── ThemeToggle.tsx     # Dark/light theme switcher
│   │   │   ├── ThemeProvider.tsx   # Theme context provider
│   │   │   ├── JobCard.tsx         # Job listing card
│   │   │   ├── ResourceCard.tsx    # Learning resource card
│   │   │   └── JobDetailsModal.tsx # Job details modal
│   │   └── lib/
│   │       └── utils.ts            # Utility functions
│   ├── public/                      # Static assets
│   ├── package.json
│   ├── next.config.ts
│   └── README.md
├── README.md
└── .gitignore
```

## Current Features

### **Landing Page**
- Engaging hero section with AI-powered platform messaging
- Feature cards showcasing AI Career Roadmap, Job Matching, Learning Resources, and Progress Tracking
- Step-by-step "How CareerBridge Works" guide
- Infinite scrolling testimonials from successful users
- Comprehensive footer with company info, navigation, and social links

### **Dashboard**
- Personalized user summary with education, track, and experience
- AI-powered job recommendations matched to user profile
- Curated learning resources tailored to career goals
- Interactive job details modal with full descriptions

### **Jobs Marketplace**
- Real-time search across jobs, companies, and skills
- Advanced filters (location: all/remote/onsite, type: full-time/part-time/contract/internship)
- Responsive job cards with salary, skills, and quick actions
- Detailed job modal with responsibilities, requirements, and benefits

### **Learning Resources**
- Skill-based and cost-based filtering (free/paid)
- Clean card layouts with platform badges
- Direct links to external learning platforms
- Responsive grid layout for optimal viewing

### **Profile Management**
- Editable personal information fields
- Dynamic skills management with add/remove functionality
- Career preferences (education, experience, track)
- CV/Resume file upload (PDF, DOC, DOCX) with file management

### **Authentication**
- Split-screen design with gradient hero sections
- Login page with email/password and "Remember me" option
- Register page with streamlined sign-up (name, email, password only)
- Multi-step onboarding flow after registration (education, experience, career track)
- Google OAuth integration with official branding
- Elegant "OR" divider for social auth options
- Mobile-responsive forms with validation

### **UI/UX Excellence**
- Consistent dark/light theme toggle with glassmorphism effects
- Blue-purple gradient accents throughout
- Smooth Framer Motion page transitions between routes
- Subtle hover and tap animations on buttons and cards
- Responsive design for all screen sizes
- Accessible components with proper ARIA labels

## Design System

- **Colors**: Dark background with blue (#3b82f6) to purple (#a855f7) gradients
- **Effects**: Glass morphism with backdrop blur, subtle borders, and glow effects
- **Typography**: Poppins for headings, Inter for body text
- **Animations**: Floating elements, infinite scroll, hover scale effects
- **Components**: Radix UI primitives with custom Tailwind styling

## Pages Overview

1. **Home (`/`)** – Landing page with hero, features, how-it-works, testimonials, and footer
2. **Dashboard (`/dashboard`)** – Personalized overview with job and resource recommendations
3. **Jobs (`/jobs`)** – Searchable job listings with advanced filters
4. **Resources (`/resources`)** – Curated learning materials with skill filters
5. **Profile (`/profile`)** – User profile editor with skills management and CV upload
6. **Login (`/login`)** – Sign in with email/password or Google OAuth
7. **Register (`/register`)** – Create account with name, email, and password
8. **Onboarding (`/onboarding`)** – Multi-step onboarding flow for education, experience, and career track

Each page features smooth client-side navigation and maintains state during demo interactions.

## Future Enhancements

- Backend integration with authentication API
- AI-powered career roadmap generation
- Real-time job matching algorithm
- Progress tracking and goal setting
- Social features (networking, mentorship)
- Resume builder and interview preparation tools

