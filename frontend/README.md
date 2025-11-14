# CareerBridge Frontend

A modern, feature-rich Next.js application built with React 19 and TypeScript, providing an intuitive interface for career development and job searching.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Navigate to `http://localhost:3001` to view the application.

> **Note:** The frontend runs on port 3001, while the backend API runs on port 3000. Make sure both servers are running for full functionality.

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.3.5** with App Router and Turbopack for blazing-fast development
- **React 19** with modern hooks and server components
- **TypeScript** for type-safe development

### UI & Styling
- **Tailwind CSS 4** with custom configuration and typography plugin
- **Radix UI** - Comprehensive component library (50+ pre-built components)
- **shadcn/ui** component architecture
- **Framer Motion 12** for advanced animations and page transitions
- **Lucide React** - Beautiful icon library
- **React Icons** - Additional icon sets

### Forms & Validation
- **React Hook Form** - Performant form management
- **Zod 4** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation integration

### 3D Graphics & Visualization
- **Three.js** - 3D graphics rendering
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for React Three Fiber
- **three-globe** - Interactive 3D globe visualizations
- **Cobe** - Lightweight globe component

### Animations & Effects
- **Framer Motion** - Production-ready motion library
- **@tsparticles** - Particle animations
- **Simplex Noise** - Noise generation for visual effects

### UI Components & Utilities
- **Embla Carousel** with autoplay and auto-scroll
- **React Dropzone** - Drag & drop file uploads
- **React Day Picker** - Date selection
- **React Fast Marquee** - Smooth scrolling text
- **Recharts** - Data visualization charts
- **Sonner** - Toast notifications
- **Vaul** - Drawer component
- **CMDK** - Command palette

### Authentication & Database
- **Better Auth 1.3** - Modern authentication solution
- **Drizzle ORM** - TypeScript ORM
- **@libsql/client** - LibSQL database client
- **bcrypt** - Password hashing

### Developer Experience
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **next-themes** - Theme management

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── template.tsx       # Template wrapper
│   │   ├── global-error.tsx   # Global error boundary
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── jobs/              # Job search & details
│   │   ├── profile/           # User profile management
│   │   ├── resources/         # Learning resources
│   │   ├── onboarding/        # New user onboarding
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── demo/              # Demo/preview pages
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components (50+)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (and many more)
│   │   │
│   │   ├── ClientComponents.tsx      # Client-side component wrapper
│   │   ├── ErrorReporter.tsx        # Error tracking
│   │   ├── Footer.tsx               # Site footer
│   │   ├── Navbar.tsx               # Navigation bar
│   │   ├── JobCard.tsx              # Job listing card
│   │   ├── JobDetailsModal.tsx      # Job details popup
│   │   ├── ResourceCard.tsx         # Learning resource card
│   │   ├── OnboardingFlow.tsx       # Multi-step onboarding
│   │   ├── TestimonialScroll.tsx    # Testimonial carousel
│   │   ├── ThemeProvider.tsx        # Theme context
│   │   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   │   └── PageTransition.tsx       # Page transition effects
│   │
│   ├── lib/                   # Utilities and helpers
│   │   ├── api.ts            # API client functions
│   │   ├── utils.ts          # General utilities
│   │   ├── jobUtils.ts       # Job-related utilities
│   │   └── hooks/            # Custom React hooks
│   │
│   ├── hooks/                 # Additional hooks
│   │   └── use-mobile.ts     # Mobile detection hook
│   │
│   ├── assets/                # Static assets (images, fonts)
│   ├── visual-edits/          # Visual editing tools
│   ├── App.jsx                # Legacy app component
│   ├── App.css                # Legacy app styles
│   ├── main.jsx               # Legacy entry point
│   └── index.css              # Global styles
│
├── public/                    # Static files served directly
├── components.json            # shadcn/ui configuration
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.mjs         # PostCSS configuration
├── eslint.config.js           # ESLint configuration
├── vite.config.js             # Vite configuration (legacy)
└── package.json               # Project dependencies

```

## 🎯 Available Scripts

```bash
npm run dev       # Start development server with Turbopack (port 3001)
npm run build     # Create optimized production build
npm start         # Start production server (port 3001)
npm run lint      # Run ESLint code quality checks
```

## 🎨 Key Features

### 🏠 Landing & Discovery
- Dynamic hero section with 3D graphics and animations
- Animated testimonial carousel
- Interactive job search preview
- Smooth scroll effects and particle backgrounds

### 👤 Authentication & Onboarding
- Email/password authentication with bcrypt
- Google OAuth integration
- Multi-step onboarding flow for new users
- Profile setup with skill selection
- CV/Resume file upload with drag & drop

### 💼 Job Management
- Advanced job search with multiple filters
- Real-time job recommendations
- Interactive job cards with quick actions
- Detailed job view modal
- Application tracking system
- Save/bookmark favorite jobs

### 📊 Dashboard
- Personalized job recommendations
- Application status tracking
- Progress visualization with charts
- Activity timeline
- Quick actions and shortcuts

### 📚 Learning Resources
- Curated learning materials catalog
- Category-based filtering
- Resource cards with metadata
- Progress tracking for courses
- Bookmarking system

### 👥 Profile Management
- Comprehensive profile editor
- Skills and experience management
- CV upload and management
- Profile visibility settings
- Account preferences

### 🎨 UI/UX Features
- Dark/light theme toggle with persistence
- Smooth Framer Motion page transitions
- Responsive design (mobile, tablet, desktop)
- Glassmorphism effects
- Toast notifications (Sonner)
- Loading states and skeletons
- Error boundaries and fallbacks
- Command palette (⌘K)
- Accessible components (ARIA compliant)

## ⚙️ Configuration

### Next.js Configuration
- Turbopack enabled for faster development
- Image optimization for all remote sources
- TypeScript and ESLint build error handling
- Bundle optimization for common packages
- Compression enabled
- React Strict Mode enabled

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🏗️ Build Optimizations

- Tree-shaking for unused code removal
- Code splitting for optimal loading
- Image optimization with Next.js Image
- Package import optimization for:
  - `lucide-react`
  - `@radix-ui/react-select`
  - `@radix-ui/react-dialog`
  - `framer-motion`

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔗 Related Documentation

- [Backend README](../backend/README.md)
- [Root Project README](../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

