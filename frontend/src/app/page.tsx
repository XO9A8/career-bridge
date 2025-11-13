"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Briefcase, Target, BookOpen, TrendingUp, Sparkles, ArrowRight, CheckCircle } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"

// Lazy load heavy components
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32" />, // Placeholder to prevent layout shift
});
const TestimonialScroll = dynamic(() => import("@/components/TestimonialScroll"), {
  loading: () => <div className="h-64" />, // Placeholder to prevent layout shift
});

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-white/20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">CareerBridge</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button asChild variant="ghost" className="rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 font-medium">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-medium">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 glass-effect px-4 py-2 rounded-full border border-white/20 animate-glow">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">AI-Powered Career Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Your Journey to
              <br />
              <span className="text-gradient">Career Success</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover your perfect career path with AI-powered recommendations, curated job opportunities, and personalized learning resources.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300 h-14 px-8 text-lg group">
                  <Link href="/register">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button asChild size="lg" variant="outline" className="rounded-xl border-2 border-gray-300 dark:border-white/30 hover:border-gray-400 dark:hover:border-white/50 hover:bg-gray-50 dark:hover:bg-white/5 h-14 px-8 text-lg font-medium transition-all duration-300">
                  <Link href="/demo">View Demo</Link>
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">10K+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Resources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              CareerBridge provides comprehensive tools to help you navigate your career journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <motion.div
              className="rounded-xl p-6 border border-blue-200/50 dark:border-blue-500/30 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 group shadow-sm hover:shadow-md"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Career Roadmap</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized career paths based on your skills and aspirations
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="rounded-xl p-6 border border-purple-200/50 dark:border-purple-500/30 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 hover:border-purple-400 dark:hover:border-purple-400 transition-all duration-300 group shadow-sm hover:shadow-md"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 dark:bg-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Job Matching</h3>
              <p className="text-sm text-muted-foreground">
                Discover opportunities that match your profile and interests
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="rounded-xl p-6 border border-pink-200/50 dark:border-pink-500/30 bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/30 dark:to-pink-900/20 hover:border-pink-400 dark:hover:border-pink-400 transition-all duration-300 group shadow-sm hover:shadow-md"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 dark:bg-pink-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Learning Resources</h3>
              <p className="text-sm text-muted-foreground">
                Access curated courses and materials to boost your skills
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="rounded-xl p-6 border border-green-200/50 dark:border-green-500/30 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 hover:border-green-400 dark:hover:border-green-400 transition-all duration-300 group shadow-sm hover:shadow-md"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-12 h-12 rounded-lg bg-green-500/20 dark:bg-green-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your growth and achievements along the way
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How CareerBridge Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to kickstart your career journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              className="text-center space-y-4 rounded-xl p-8 border border-blue-200/50 dark:border-blue-500/30 bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/40 dark:to-blue-900/20 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto text-2xl font-bold text-white shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Share your education, skills, and career interests to get started
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="text-center space-y-4 rounded-xl p-8 border border-purple-200/50 dark:border-purple-500/30 bg-gradient-to-br from-purple-50/80 to-white dark:from-purple-950/40 dark:to-purple-900/20 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto text-2xl font-bold text-white shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground">Get AI Recommendations</h3>
              <p className="text-muted-foreground">
                Receive personalized job matches and learning paths tailored for you
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="text-center space-y-4 rounded-xl p-8 border border-pink-200/50 dark:border-pink-500/30 bg-gradient-to-br from-pink-50/80 to-white dark:from-pink-950/40 dark:to-pink-900/20 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-blue-600 flex items-center justify-center mx-auto text-2xl font-bold text-white shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground">Achieve Your Goals</h3>
              <p className="text-muted-foreground">
                Apply for jobs, learn new skills, and track your career progress
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialScroll />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="rounded-2xl p-12 border border-blue-200/50 dark:border-blue-500/30 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 text-center space-y-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to Build Your Future?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students and graduates who are already using CareerBridge to achieve their career goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300 h-14 px-8 text-lg animate-glow group">
                  <Link href="/register">
                    Join CareerBridge Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}