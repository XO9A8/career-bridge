"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Navbar from "@/components/Navbar"
import ResourceCard from "@/components/ResourceCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Target, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  TrendingUp,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { learningApi, profileApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"

// Lazy load Footer
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32" />,
});

export default function SkillGapPage() {
  const router = useRouter()
  const [targetRole, setTargetRole] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [suggestedRoles, setSuggestedRoles] = useState<string[]>([])

  const handleAnalyze = async (role?: string) => {
    const roleToAnalyze = role || targetRole.trim()
    if (!roleToAnalyze) {
      toast.error('Please enter a target role')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await learningApi.analyzeSkillGap(roleToAnalyze)
      setAnalysis(result)
      toast.success(`Analysis complete! Match: ${result.match_percentage.toFixed(1)}%`)
    } catch (err: any) {
      if (err.message.includes('Session expired')) {
        router.push('/login')
      } else {
        toast.error(err.message || 'Failed to analyze skill gap')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleQuickAnalyze = (role: string) => {
    setTargetRole(role)
    // Small delay to update input, then analyze
    setTimeout(() => {
      handleAnalyze(role)
    }, 100)
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileApi.getProfile()
        setUserProfile(profile)
        
        // Extract suggested roles from user's target_roles or generate from profile
        if (profile.target_roles && profile.target_roles.length > 0) {
          setSuggestedRoles(profile.target_roles)
        } else {
          // Generate suggestions based on preferred track
          const trackSuggestions: Record<string, string[]> = {
            web_development: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "React Developer", "Node.js Developer"],
            data: ["Data Analyst", "Data Scientist", "Data Engineer", "Machine Learning Engineer"],
            design: ["UI Designer", "UX Designer", "Product Designer", "Graphic Designer"],
            marketing: ["Digital Marketer", "SEO Specialist", "Content Marketer", "Social Media Manager"]
          }
          setSuggestedRoles(trackSuggestions[profile.preferred_track || 'web_development'] || [])
        }
      } catch (err: any) {
        if (err.message.includes('Session expired')) {
          router.push('/login')
        }
      }
    }
    loadProfile()

    // Check for role parameter in URL (from job details modal)
    const params = new URLSearchParams(window.location.search)
    const roleParam = params.get('role')
    if (roleParam) {
      const decodedRole = decodeURIComponent(roleParam)
      setTargetRole(decodedRole)
      // Auto-analyze after a short delay to allow state to update
      setTimeout(() => {
        handleAnalyze(decodedRole)
      }, 500)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2 leading-normal">Skill Gap Analysis</h1>
              <p className="text-muted-foreground">
                Discover what skills you need to land your dream job
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8 border border-gray-200 dark:border-white/20 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30 shadow-sm dark:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" />
              Analyze Your Skills
            </CardTitle>
            <CardDescription>
              Enter a job title or role to see how your skills compare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="e.g., Frontend Developer, Data Scientist, Full Stack Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                className="flex-1 border-gray-300 dark:border-white/10 h-12"
              />
              <Button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzing || !targetRole.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-purple-500/50 transition-all duration-300 h-12 px-8"
              >
                {isAnalyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {/* Suggested Roles */}
            {suggestedRoles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Quick analyze:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedRoles.map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAnalyze(role)}
                      className="border-gray-300 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Match Score Card */}
            <Card className="border border-gray-200 dark:border-white/20 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30 shadow-sm dark:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Skill Match Score
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Target Role: <span className="font-semibold text-foreground">{analysis.target_role}</span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gradient">
                      {analysis.match_percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {analysis.matching_skills.length} / {analysis.required_skills.length} skills
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={analysis.match_percentage} 
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground mt-3">
                  {analysis.required_skills.length === 0 
                    ? "⚠️ We couldn't find enough data for this role to calculate a score."
                    : analysis.match_percentage >= 70 
                    ? "🎉 Great match! You're well-prepared for this role."
                    : analysis.match_percentage >= 40
                    ? "📈 Good progress! Focus on the missing skills below."
                    : "🎯 Start learning the recommended skills to close the gap."
                  }
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Matching Skills */}
              <Card className="border border-green-200/50 dark:border-green-500/30 bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/30 dark:to-green-900/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    Skills You Have ({analysis.matching_skills.length})
                  </CardTitle>
                  <CardDescription>
                    These skills match the requirements for {analysis.target_role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.matching_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.matching_skills.map((skill: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/50 px-3 py-1"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      <span>No matching skills found</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skill Gaps */}
              <Card className="border border-orange-200/50 dark:border-orange-500/30 bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/30 dark:to-orange-900/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <XCircle className="w-5 h-5" />
                    Skills to Learn ({analysis.skill_gaps.length})
                  </CardTitle>
                  <CardDescription>
                    Focus on these skills to improve your match score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.skill_gaps.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.skill_gaps.map((skill: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-orange-100/50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/50 px-3 py-1"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : analysis.required_skills.length > 0 ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Perfect match! You have all required skills.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>No data found for this role. Try a different job title.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recommended Learning Resources */}
            {analysis.recommended_resources && analysis.recommended_resources.length > 0 && (
              <Card className="border border-blue-200/50 dark:border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <BookOpen className="w-5 h-5" />
                    Recommended Learning Resources ({analysis.recommended_resources.length})
                  </CardTitle>
                  <CardDescription>
                    These resources can help you learn the missing skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.recommended_resources.map((resource: any) => (
                      <ResourceCard
                        key={resource.id}
                        id={resource.id.toString()}
                        title={resource.title}
                        platform={resource.platform}
                        cost={resource.cost === 'free' ? 'Free' : 'Paid'}
                        skills={resource.related_skills || []}
                        url={resource.url}
                        description={`Covers: ${resource.related_skills?.slice(0, 3).join(', ') || 'Various skills'}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!analysis && !isAnalyzing && (
          <Card className="border border-gray-200 dark:border-white/20 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30 shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ready to Analyze Your Skills?
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a job title above to see how your current skills compare to the requirements and get personalized learning recommendations.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}

