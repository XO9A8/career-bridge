"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { aiApi } from "@/lib/api"
import { toast } from "sonner"
import { 
  Sparkles, 
  Download, 
  Trash2, 
  Plus, 
  Clock, 
  BookOpen, 
  Target,
  ChevronRight 
} from "lucide-react"

// Lazy load Footer
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32" />,
});

export default function RoadmapPage() {
  const router = useRouter()
  const [roadmaps, setRoadmaps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [techStack, setTechStack] = useState("")
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null)

  useEffect(() => {
    loadRoadmaps()
  }, [])

  const loadRoadmaps = async () => {
    try {
      const data = await aiApi.getRoadmaps()
      setRoadmaps(data.roadmaps || [])
      if (data.roadmaps && data.roadmaps.length > 0 && !selectedRoadmap) {
        setSelectedRoadmap(data.roadmaps[0])
      }
    } catch (err: any) {
      if (err.message.includes('Session expired')) {
        router.push('/login')
      } else {
        toast.error('Failed to load roadmaps')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!techStack.trim()) {
      toast.error('Please enter a tech stack or role')
      return
    }

    setGenerating(true)
    try {
      const result = await aiApi.generateRoadmap(techStack, true, 'gemini')
      toast.success('Roadmap generated successfully!')
      setTechStack("")
      await loadRoadmaps()
      
      // Auto-select the new roadmap
      if (result.roadmap_id) {
        const newRoadmap = await aiApi.getRoadmapById(result.roadmap_id)
        setSelectedRoadmap(newRoadmap.roadmap)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate roadmap')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this roadmap?')) return
    
    try {
      await aiApi.deleteRoadmap(id)
      toast.success('Roadmap deleted')
      setRoadmaps(roadmaps.filter(r => r.id !== id))
      if (selectedRoadmap?.id === id) {
        setSelectedRoadmap(roadmaps.find(r => r.id !== id) || null)
      }
    } catch (err: any) {
      toast.error('Failed to delete roadmap')
    }
  }

  const handleDownload = (roadmap: any) => {
    // Create downloadable text format
    let content = `${roadmap.title}\n`
    content += `Target Role: ${roadmap.target_role}\n`
    content += `Generated: ${new Date(roadmap.created_at).toLocaleDateString()}\n`
    content += `\n${'='.repeat(50)}\n\n`

    const data = roadmap.roadmap_data || roadmap.roadmap
    if (data && data.phases) {
      data.phases.forEach((phase: any, idx: number) => {
        content += `Phase ${idx + 1}: ${phase.title}\n`
        content += `Duration: ${phase.duration || 'N/A'}\n`
        content += `\nTopics:\n`
        if (phase.topics && Array.isArray(phase.topics)) {
          phase.topics.forEach((topic: string) => {
            content += `  • ${topic}\n`
          })
        }
        if (phase.resources && phase.resources.length > 0) {
          content += `\nResources:\n`
          phase.resources.forEach((resource: string) => {
            content += `  • ${resource}\n`
          })
        }
        content += `\n${'-'.repeat(50)}\n\n`
      })
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roadmap-${roadmap.target_role.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Roadmap downloaded!')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            AI Career Roadmaps
          </h1>
          <p className="text-muted-foreground">
            Generate personalized learning paths to achieve your career goals
          </p>
        </div>

        {/* Generate New Roadmap */}
        <Card className="mb-8 glass-effect border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Generate New Roadmap
            </CardTitle>
            <CardDescription>
              Enter your target role or tech stack (e.g., "Full Stack Developer", "DevOps Engineer")
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="e.g., Full Stack Web Development"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                className="flex-1 glass-effect border-white/10"
                disabled={generating}
              />
              <Button 
                onClick={handleGenerate}
                disabled={generating || !techStack.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roadmap List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Your Roadmaps ({roadmaps.length})</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : roadmaps.length === 0 ? (
                <Card className="p-6 text-center border-dashed glass-effect">
                  <p className="text-muted-foreground">No roadmaps yet. Generate your first one!</p>
                </Card>
              ) : (
                roadmaps.map((roadmap) => (
                  <Card 
                    key={roadmap.id}
                    className={`cursor-pointer transition-all hover:border-purple-500/50 glass-effect ${
                      selectedRoadmap?.id === roadmap.id ? 'border-purple-500 bg-purple-500/5' : 'border-white/10'
                    }`}
                    onClick={() => setSelectedRoadmap(roadmap)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{roadmap.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {new Date(roadmap.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(roadmap.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Roadmap Details */}
          <div className="lg:col-span-2">
            {selectedRoadmap ? (
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedRoadmap.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {selectedRoadmap.target_role}
                        </span>
                        <Badge variant="outline" className="border-purple-500/30">{selectedRoadmap.ai_provider}</Badge>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selectedRoadmap)}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const roadmapData = selectedRoadmap.roadmap_data || selectedRoadmap.roadmap
                    return roadmapData?.phases ? (
                      <div className="space-y-6">
                        {roadmapData.phases.map((phase: any, idx: number) => (
                          <div key={idx} className="border-l-2 border-purple-500 pl-6 pb-6 relative">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold">
                              {idx + 1}
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-2 text-foreground">{phase.title}</h3>
                            
                            {phase.duration && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Clock className="w-4 h-4" />
                                {phase.duration}
                              </div>
                            )}

                            {phase.topics && phase.topics.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-medium mb-2 flex items-center gap-2 text-foreground">
                                  <BookOpen className="w-4 h-4" />
                                  Topics to Learn
                                </h4>
                                <ul className="space-y-1">
                                  {phase.topics.map((topic: string, tIdx: number) => (
                                    <li key={tIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <ChevronRight className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                                      <span>{topic}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {phase.resources && phase.resources.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 text-foreground">Resources</h4>
                                <div className="flex flex-wrap gap-2">
                                  {phase.resources.map((resource: string, rIdx: number) => (
                                    <Badge key={rIdx} variant="secondary" className="border-purple-500/30">
                                      {resource}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No roadmap data available</p>
                    )
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center p-12 border-dashed glass-effect">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a roadmap to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

