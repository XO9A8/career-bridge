"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Navbar from "@/components/Navbar"
import ResourceCard from "@/components/ResourceCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedResources = filteredResources.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [costFilter, skillFilter, itemsPerPage])

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

          {/* Results count and items per page */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Showing <span className="text-foreground font-medium">{startIndex + 1}-{Math.min(endIndex, filteredResources.length)}</span> of <span className="text-foreground font-medium">{filteredResources.length}</span> resources
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Resources per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[80px] h-9 glass-effect border-gray-300 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect border-white/10">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedResources.map((resource) => (
                <ResourceCard key={resource.id} {...resource} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="glass-effect border-gray-300 dark:border-white/10 hover:bg-purple-500/10 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page 
                            ? "bg-purple-500 hover:bg-purple-600 text-white" 
                            : "glass-effect border-gray-300 dark:border-white/10 hover:bg-purple-500/10"
                          }
                        >
                          {page}
                        </Button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-muted-foreground">...</span>
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="glass-effect border-gray-300 dark:border-white/10 hover:bg-purple-500/10 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
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
