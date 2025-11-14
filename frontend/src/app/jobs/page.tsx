"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Navbar from "@/components/Navbar"
import JobCard from "@/components/JobCard"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { jobsApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Lazy load heavy components
const JobDetailsModal = dynamic(() => import("@/components/JobDetailsModal"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32" />,
});

export default function JobsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        console.log('Fetching job recommendations...')
        const jobsData = await jobsApi.getRecommendations({ limit: 50 })
        console.log('Received jobs data:', jobsData)
        
        if (!jobsData || jobsData.length === 0) {
          console.warn('No jobs returned from API')
          setAllJobs([])
          toast.error('No jobs available at the moment. Please check back later or complete your profile for better matches.')
          return
        }
        
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
            responsibilities: item.job.responsibilities || [],
            requirements: item.job.requirements || [],
            benefits: item.job.benefits || [],
            matchScore: item.match_score ?? null,
            matchedSkills: item.matched_skills || [],
            missingSkills: item.missing_skills || [],
            matchExplanation: item.match_explanation || null,
            strengths: item.strengths || [],
            improvementAreas: item.improvement_areas || [],
            experienceAlignment: item.experience_alignment ?? null,
            trackAlignment: item.track_alignment ?? null,
            skillOverlap: item.skill_overlap ?? null,
            platformLinks: item.platform_links || null,
          }
        })

        console.log('Transformed jobs:', transformedJobs.length)
        setAllJobs(transformedJobs)
      } catch (err: any) {
        console.error('Error loading jobs:', err)
        if (err.message.includes('Session expired')) {
          toast.error('Session expired. Please login again.')
          router.push('/login')
        } else if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
          toast.error('Unable to connect to server. Please ensure the backend is running.')
        } else {
          toast.error('Failed to load jobs: ' + err.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadJobs()
  }, [router])

  const handleViewJobDetails = (jobId: string) => {
    const job = allJobs.find(j => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setModalOpen(true)
    }
  }

  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesLocation = locationFilter === "all" || 
                           (locationFilter === "remote" && job.location.toLowerCase().includes("remote")) ||
                           (locationFilter === "onsite" && !job.location.toLowerCase().includes("remote"))
    
    const matchesType = typeFilter === "all" || job.type.toLowerCase() === typeFilter.toLowerCase()
    
    return matchesSearch && matchesLocation && matchesType
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">Explore Jobs</h1>
          <p className="text-muted-foreground">
            Find your perfect opportunity from {allJobs.length} available positions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-effect rounded-xl p-6 mb-8 border border-gray-200 dark:border-white/10">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-[14px] w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-effect border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 h-12"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="relative flex-shrink-0 w-full md:w-auto">
              <Filter className="absolute left-3 top-[12px] w-3.5 h-3.5 text-muted-foreground z-10 pointer-events-none" />
              <Select value={locationFilter} onValueChange={setLocationFilter}>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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
            Showing <span className="text-foreground font-medium">{filteredJobs.length}</span> results
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
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
              No jobs found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
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
