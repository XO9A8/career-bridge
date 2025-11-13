"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import JobCard from "@/components/JobCard"
import ResourceCard from "@/components/ResourceCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Briefcase, Target, TrendingUp, ArrowRight, Sparkles, Search, Filter, BookOpen } from "lucide-react"

// Lazy load heavy components
const JobDetailsModal = dynamic(() => import("@/components/JobDetailsModal"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32" />,
});

// Mock data for demo
const mockUser = {
  name: "Alex Johnson",
  education: "Bachelor's Degree in Computer Science",
  track: "Web Development",
  experience: "Junior",
}

const mockJobs = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Tech Corp",
    location: "Remote",
    type: "Full-time",
    salary: "$60k - $80k",
    experience: "Junior",
    skills: ["React", "TypeScript", "CSS", "HTML"],
    postedDate: "2 days ago",
    description: "We are seeking a talented Frontend Developer to join our dynamic team. You will be responsible for building responsive web applications using modern JavaScript frameworks. This role offers the opportunity to work on cutting-edge projects and collaborate with a team of experienced developers.",
    responsibilities: [
      "Develop and maintain responsive web applications using React and TypeScript",
      "Collaborate with designers to implement pixel-perfect UI components",
      "Optimize applications for maximum speed and scalability",
      "Write clean, maintainable, and well-documented code",
      "Participate in code reviews and team meetings"
    ],
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "2+ years of experience with React and TypeScript",
      "Strong understanding of CSS and modern styling approaches",
      "Experience with version control systems (Git)",
      "Excellent problem-solving and communication skills"
    ],
    benefits: [
      "Competitive salary and benefits package",
      "Remote work flexibility",
      "Professional development opportunities",
      "Health insurance and retirement plans",
      "Flexible working hours"
    ],
  },
  {
    id: "2",
    title: "Junior Software Engineer",
    company: "StartupXYZ",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$70k - $90k",
    experience: "Junior",
    skills: ["JavaScript", "Node.js", "PostgreSQL", "Express"],
    postedDate: "5 days ago",
    description: "Join our fast-growing startup as a Junior Software Engineer. You'll work on building scalable backend systems and APIs that power our platform. This is an excellent opportunity to grow your skills while working on exciting projects.",
    responsibilities: [
      "Design and develop RESTful APIs using Node.js and Express",
      "Work with PostgreSQL databases to design efficient schemas",
      "Implement authentication and authorization systems",
      "Write unit and integration tests",
      "Collaborate with frontend developers to integrate APIs"
    ],
    requirements: [
      "Bachelor's degree in Computer Science or equivalent experience",
      "1+ years of experience with Node.js and JavaScript",
      "Knowledge of SQL and database design",
      "Understanding of REST API principles",
      "Strong analytical and debugging skills"
    ],
    benefits: [
      "Equity participation",
      "Health, dental, and vision insurance",
      "Flexible PTO policy",
      "Learning and development budget",
      "Modern office space in downtown SF"
    ],
  },
  {
    id: "3",
    title: "React Developer",
    company: "Digital Solutions",
    location: "New York, NY",
    type: "Full-time",
    salary: "$65k - $85k",
    experience: "Junior",
    skills: ["React", "Redux", "Jest", "TypeScript"],
    postedDate: "1 week ago",
    description: "Digital Solutions is looking for a skilled React Developer to join our client-facing team. You'll work on building sophisticated web applications for our enterprise clients using the latest React ecosystem tools.",
    responsibilities: [
      "Build complex React applications using Redux for state management",
      "Write comprehensive tests using Jest and React Testing Library",
      "Implement responsive designs that work across all devices",
      "Work closely with UX designers to create intuitive interfaces",
      "Mentor junior developers and share knowledge"
    ],
    requirements: [
      "3+ years of professional React development experience",
      "Proficiency with Redux and state management patterns",
      "Experience with TypeScript in production applications",
      "Strong testing practices and TDD experience",
      "Excellent communication and teamwork skills"
    ],
    benefits: [
      "Competitive compensation package",
      "Comprehensive health benefits",
      "401(k) with company matching",
      "Professional development and training",
      "Work-life balance initiatives"
    ],
  },
  {
    id: "4",
    title: "Full Stack Developer",
    company: "Innovation Labs",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$75k - $95k",
    experience: "Mid",
    skills: ["React", "Node.js", "MongoDB", "Express"],
    postedDate: "3 days ago",
    description: "Innovation Labs seeks a Full Stack Developer to work on our next-generation platform. You'll be involved in both frontend and backend development, working with modern technologies to deliver exceptional user experiences.",
    responsibilities: [
      "Develop full-stack features from database to UI",
      "Design and implement RESTful APIs",
      "Build responsive React components",
      "Optimize database queries and application performance",
      "Deploy applications to cloud infrastructure"
    ],
    requirements: [
      "Bachelor's degree in Computer Science",
      "3+ years of full-stack development experience",
      "Strong proficiency in React, Node.js, and MongoDB",
      "Experience with cloud platforms (AWS, Azure, or GCP)",
      "Understanding of DevOps practices"
    ],
    benefits: [
      "Competitive salary and equity",
      "Full health coverage",
      "Unlimited vacation policy",
      "Remote work options",
      "Annual tech conference attendance"
    ],
  },
  {
    id: "5",
    title: "Web Developer",
    company: "Creative Agency",
    location: "Remote",
    type: "Full-time",
    salary: "$55k - $75k",
    experience: "Junior",
    skills: ["HTML", "CSS", "JavaScript", "Vue.js"],
    postedDate: "1 day ago",
    description: "Creative Agency is hiring a Web Developer to create beautiful, functional websites for our diverse client base. You'll work on projects ranging from small business sites to large e-commerce platforms.",
    responsibilities: [
      "Build responsive websites using HTML, CSS, and JavaScript",
      "Develop interactive features using Vue.js framework",
      "Collaborate with designers to bring mockups to life",
      "Ensure cross-browser compatibility",
      "Optimize websites for performance and SEO"
    ],
    requirements: [
      "2+ years of web development experience",
      "Strong HTML, CSS, and JavaScript skills",
      "Experience with Vue.js or similar frameworks",
      "Understanding of responsive design principles",
      "Portfolio demonstrating web development skills"
    ],
    benefits: [
      "Flexible remote work",
      "Health insurance",
      "Professional development opportunities",
      "Creative and collaborative environment",
      "Competitive salary"
    ],
  },
]

const mockResources = [
  {
    id: "1",
    title: "Complete React Developer Course",
    platform: "Udemy",
    skills: ["React", "JavaScript", "Hooks"],
    cost: "Paid" as const,
    url: "https://www.udemy.com",
    description: "Master React from basics to advanced concepts",
  },
  {
    id: "2",
    title: "TypeScript Handbook",
    platform: "TypeScript Official",
    skills: ["TypeScript", "JavaScript"],
    cost: "Free" as const,
    url: "https://www.typescriptlang.org",
    description: "Comprehensive guide to TypeScript",
  },
  {
    id: "3",
    title: "Node.js Best Practices",
    platform: "GitHub",
    skills: ["Node.js", "Backend"],
    cost: "Free" as const,
    url: "https://github.com",
    description: "Learn Node.js best practices and patterns",
  },
  {
    id: "4",
    title: "Advanced CSS Techniques",
    platform: "CSS-Tricks",
    skills: ["CSS", "Design"],
    cost: "Free" as const,
    url: "https://css-tricks.com",
    description: "Advanced CSS techniques and modern layouts",
  },
  {
    id: "5",
    title: "Full Stack Web Development",
    platform: "Coursera",
    skills: ["React", "Node.js", "MongoDB"],
    cost: "Paid" as const,
    url: "https://www.coursera.org",
    description: "Complete full-stack development course",
  },
  {
    id: "6",
    title: "JavaScript Algorithms and Data Structures",
    platform: "freeCodeCamp",
    skills: ["JavaScript", "Algorithms"],
    cost: "Free" as const,
    url: "https://www.freecodecamp.org",
    description: "Master JavaScript algorithms and data structures",
  },
]

export default function DemoPage() {
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  
  // Job filters
  const [jobSearchQuery, setJobSearchQuery] = useState("")
  const [jobLocationFilter, setJobLocationFilter] = useState("all")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")
  
  // Resource filters
  const [resourceCostFilter, setResourceCostFilter] = useState("all")
  const [resourceSkillFilter, setResourceSkillFilter] = useState("all")

  const handleViewJobDetails = (jobId: string) => {
    const job = mockJobs.find(j => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setModalOpen(true)
    }
  }

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const matchesSearch = jobSearchQuery === "" ||
        job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        job.skills.some((skill: string) => skill.toLowerCase().includes(jobSearchQuery.toLowerCase()))
      
      const matchesLocation = jobLocationFilter === "all" ||
        (jobLocationFilter === "remote" && job.location.toLowerCase().includes("remote")) ||
        (jobLocationFilter === "onsite" && !job.location.toLowerCase().includes("remote"))
      
      const matchesType = jobTypeFilter === "all" ||
        job.type.toLowerCase() === jobTypeFilter.toLowerCase()
      
      return matchesSearch && matchesLocation && matchesType
    })
  }, [jobSearchQuery, jobLocationFilter, jobTypeFilter])

  // Extract unique skills from resources
  const allResourceSkills = useMemo(() => {
    return Array.from(new Set(mockResources.flatMap(r => r.skills))).sort()
  }, [])

  // Filter resources
  const filteredResources = useMemo(() => {
    return mockResources.filter(resource => {
      const matchesCost = resourceCostFilter === "all" ||
        (resourceCostFilter === "free" && resource.cost === "Free") ||
        (resourceCostFilter === "paid" && resource.cost === "Paid")
      
      const matchesSkill = resourceSkillFilter === "all" ||
        resource.skills.some((skill: string) => skill === resourceSkillFilter)
      
      return matchesCost && matchesSkill
    })
  }, [resourceCostFilter, resourceSkillFilter])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content - Navbar is now h-20 (80px) on demo page, use pt-24 to match dashboard spacing */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* User Summary Card */}
        <div className="glass-effect rounded-2xl p-8 mb-8 border-glow-blue">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome, <span className="text-gradient">{mockUser.name}</span>!
                </h1>
                <p className="text-muted-foreground">Here's your career dashboard overview</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Education</p>
                    <p className="text-sm font-medium text-foreground">{mockUser.education}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Career Track</p>
                    <p className="text-sm font-medium text-foreground">{mockUser.track}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-sm font-medium text-foreground">{mockUser.experience}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">85%</p>
                  <p className="text-xs text-muted-foreground">Profile Match</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Jobs Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recommended Jobs</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Jobs matched to your skills and interests
              </p>
            </div>
          </div>

          {/* Search and Filters for Jobs */}
          <div className="glass-effect rounded-xl p-6 mb-6 border border-gray-200 dark:border-white/10">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-[14px] w-5 h-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search jobs, companies, skills..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="pl-10 glass-effect border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 h-12"
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div className="relative flex-shrink-0 w-full md:w-auto">
                <Filter className="absolute left-3 top-[12px] w-3.5 h-3.5 text-muted-foreground z-10 pointer-events-none" />
                <Select value={jobLocationFilter} onValueChange={setJobLocationFilter}>
                  <SelectTrigger className="pl-9 pr-3 glass-effect border-gray-300 dark:border-white/10 h-12 w-full md:w-[180px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10">
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="relative flex-shrink-0 w-full md:w-auto">
                <Filter className="absolute left-3 top-[12px] w-3.5 h-3.5 text-muted-foreground z-10 pointer-events-none" />
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger className="pl-9 pr-3 glass-effect border-gray-300 dark:border-white/10 h-12 w-full md:w-[180px]">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredJobs.length}</span> of <span className="text-foreground font-medium">{mockJobs.length}</span> jobs
            </div>
          </div>
          
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  type={job.type}
                  skills={job.skills}
                  postedDate={job.postedDate}
                  onViewDetails={handleViewJobDetails}
                />
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-xl p-12 text-center border border-white/10">
              <p className="text-muted-foreground text-lg">
                No jobs found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </section>

        {/* Learning Resources Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Learning Resources</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Curated resources to boost your skills
              </p>
            </div>
          </div>

          {/* Filters for Resources */}
          <div className="glass-effect rounded-xl p-6 mb-6 border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-foreground">Filter Resources</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              {/* Cost Filter */}
              <div className="relative flex-shrink-0 w-full md:w-auto">
                <Filter className="absolute left-3 top-[12px] w-3.5 h-3.5 text-muted-foreground z-10 pointer-events-none" />
                <Select value={resourceCostFilter} onValueChange={setResourceCostFilter}>
                  <SelectTrigger className="pl-9 pr-3 glass-effect border-gray-300 dark:border-white/10 h-12 w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Cost" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10">
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="free">Free Only</SelectItem>
                    <SelectItem value="paid">Paid Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skill Filter */}
              <div className="relative flex-shrink-0 w-full md:w-auto">
                <Filter className="absolute left-3 top-[12px] w-3.5 h-3.5 text-muted-foreground z-10 pointer-events-none" />
                <Select value={resourceSkillFilter} onValueChange={setResourceSkillFilter}>
                  <SelectTrigger className="pl-9 pr-3 glass-effect border-gray-300 dark:border-white/10 h-12 w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Skill" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 max-h-[300px]">
                    <SelectItem value="all">All Skills</SelectItem>
                    {allResourceSkills.map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredResources.length}</span> of <span className="text-foreground font-medium">{mockResources.length}</span> resources
            </div>
          </div>
          
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} {...resource} />
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-xl p-12 text-center border border-white/10">
              <p className="text-muted-foreground text-lg">
                No resources found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-500/30 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Experience the Full Platform?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create your account to get personalized job recommendations, track your learning progress, and unlock your career potential.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                <Link href="/register">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <JobDetailsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedJob(null)
        }}
        job={selectedJob}
      />

      <Footer />
    </div>
  )
}

