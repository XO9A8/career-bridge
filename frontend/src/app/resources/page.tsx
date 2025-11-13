"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Navbar from "@/components/Navbar"
import ResourceCard from "@/components/ResourceCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, BookOpen } from "lucide-react"
import { learningApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Lazy load Footer
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32" />,
});

export default function ResourcesPage() {
  const router = useRouter()
  const [costFilter, setCostFilter] = useState("all")
  const [skillFilter, setSkillFilter] = useState("all")
  const [allResources, setAllResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResources = async () => {
      try {
        const resourcesData = await learningApi.getRecommendations()
        
        // Transform resources data to match ResourceCard component
        const transformedResources = resourcesData.map((item: any) => ({
          id: item.resource.id.toString(),
          title: item.resource.title,
          platform: item.resource.platform,
          cost: item.resource.cost === 'free' ? 'Free' as const : 'Paid' as const,
          price: item.resource.cost === 'paid' ? "Check platform" : undefined,
          skills: item.resource.related_skills || [],
          url: item.resource.url,
          description: `Relevance: ${item.relevance_score}% - ${item.new_skills?.join(', ') || 'No new skills'}`,
        }))

        setAllResources(transformedResources)
      } catch (err: any) {
        if (err.message.includes('Session expired')) {
          router.push('/login')
        } else {
          toast.error('Failed to load learning resources')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadResources()
  }, [router])

  // Extract unique skills
  const allSkills = Array.from(new Set(allResources.flatMap((r: any) => r.skills))).sort()

  const filteredResources = allResources.filter((resource: any) => {
    const matchesCost = costFilter === "all" || 
                       (costFilter === "free" && resource.cost === "Free") ||
                       (costFilter === "paid" && resource.cost === "Paid")
    
    const matchesSkill = skillFilter === "all" || 
                        resource.skills.some((skill: string) => skill === skillFilter)
    
    return matchesCost && matchesSkill
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading resources...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2 leading-normal pb-2">Learning Resources</h1>
          <p className="text-muted-foreground">
            Curated courses and tutorials to boost your skills
          </p>
        </div>

        {/* Filters */}
        <div className="glass-effect rounded-xl p-6 mb-8 border border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-foreground">Filter Resources</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Cost Filter */}
            <div className="relative flex-shrink-0 w-full md:w-auto">
              <Filter className="absolute left-3 top-[12px] w-3.5 h-3.5 text-muted-foreground z-10 pointer-events-none" />
              <Select value={costFilter} onValueChange={setCostFilter}>
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
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="pl-9 pr-3 glass-effect border-gray-300 dark:border-white/10 h-12 w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Skill" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-white/10 max-h-[300px]">
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{filteredResources.length}</span> resources
          </div>
        </div>

        {/* Resources Grid */}
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
      </main>

      <Footer />
    </div>
  )
}
