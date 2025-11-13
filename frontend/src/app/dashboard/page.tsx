"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Navbar from "@/components/Navbar"
import JobCard from "@/components/JobCard"
import ResourceCard from "@/components/ResourceCard"
import { GraduationCap, Briefcase, Target, TrendingUp } from "lucide-react"
import { profileApi, jobsApi, learningApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { generateResponsibilities, generateRequirements, generateBenefits } from "@/lib/jobUtils"

// Lazy load heavy components
const JobDetailsModal = dynamic(() => import("@/components/JobDetailsModal"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32" />,
});

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile and recommendations in parallel
        const [profileData, jobsData, resourcesData] = await Promise.all([
          profileApi.getProfile(),
          jobsApi.getRecommendations({ limit: 5 }),
          learningApi.getRecommendations(),
        ])

        setUser({
          name: profileData.full_name,
          education: profileData.education_level || "Not specified",
          track: profileData.preferred_track || "Not specified",
          experience: profileData.experience_level || "Not specified",
        })

        // Transform jobs data to match JobCard component
        const transformedJobs = jobsData.map((item: any) => {
          const skills = item.job.required_skills || []
          const experienceLevel = item.job.experience_level || "junior"
          
          return {
            id: item.job.id.toString(),
            title: item.job.job_title,
            company: item.job.company,
            location: item.job.location,
            type: item.job.job_type,
            skills: skills,
            postedDate: "Recently",
            salary: item.job.salary_min && item.job.salary_max 
              ? `$${item.job.salary_min}k - $${item.job.salary_max}k`
              : "Not specified",
            experience: experienceLevel,
            description: item.job.job_description || "",
            responsibilities: generateResponsibilities(item.job.job_title, skills, experienceLevel),
            requirements: generateRequirements(item.job.job_title, skills, experienceLevel),
            benefits: generateBenefits(item.job.job_type, item.job.location),
            matchScore: item.match_score,
            matchedSkills: item.matched_skills || [],
            missingSkills: item.missing_skills || [],
          }
        })

        // Transform resources data to match ResourceCard component
        const transformedResources = resourcesData.slice(0, 3).map((item: any) => ({
          id: item.resource.id.toString(),
          title: item.resource.title,
          platform: item.resource.platform,
          cost: item.resource.cost === 'free' ? 'Free' as const : 'Paid' as const,
          price: item.resource.cost === 'paid' ? "Check platform" : undefined,
          skills: item.resource.related_skills || [],
          url: item.resource.url,
          description: `Relevance: ${item.relevance_score}% - ${item.new_skills?.join(', ') || 'No new skills'}`,
        }))

        setJobs(transformedJobs)
        setResources(transformedResources)
      } catch (err: any) {
        if (err.message.includes('Session expired')) {
          router.push('/login')
        } else {
          toast.error('Failed to load dashboard data')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleViewJobDetails = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setModalOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* User Summary Card */}
        <div className="glass-effect rounded-2xl p-8 mb-8 border-glow-blue">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, <span className="text-gradient">{user?.name || 'User'}</span>!
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
                    <p className="text-sm font-medium text-foreground">{user?.education || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Career Track</p>
                    <p className="text-sm font-medium text-foreground">{user?.track || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-sm font-medium text-foreground">{user?.experience || 'Not specified'}</p>
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
          
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  onViewDetails={handleViewJobDetails}
                />
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-xl p-12 text-center border border-white/10">
              <p className="text-muted-foreground text-lg">
                No job recommendations available. Complete your profile to get personalized recommendations.
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
          
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} {...resource} />
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-xl p-12 text-center border border-white/10">
              <p className="text-muted-foreground text-lg">
                No learning resources available. Complete your profile to get personalized recommendations.
              </p>
            </div>
          )}
        </section>
      </main>

      <JobDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        job={selectedJob}
      />

      <Footer />
    </div>
  )
}
