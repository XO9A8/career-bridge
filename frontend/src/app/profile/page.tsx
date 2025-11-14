"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { profileApi } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CVUpload } from "@/components/CVUpload"

// Lazy load Footer
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32" />,
});
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, GraduationCap, Briefcase, Target, X, Plus, Save, FileText, Download } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    education: "",
    experience: "",
    track: "",
  })

  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingCV, setIsGeneratingCV] = useState(false)

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileApi.getProfile()

        // Map API values to frontend values
        const experienceMap: Record<string, string> = {
          'fresher': 'fresher',
          'junior': 'junior',
          'mid': 'mid',
        }

        const trackMap: Record<string, string> = {
          'web_development': 'software-dev',
          'data': 'data-science',
          'design': 'design',
          'marketing': 'marketing',
        }

        setFormData({
          name: profile.full_name || "",
          email: profile.email || "",
          education: profile.education_level || "",
          experience: profile.experience_level ? experienceMap[profile.experience_level] || 'fresher' : 'fresher',
          track: profile.preferred_track ? trackMap[profile.preferred_track] || 'software-dev' : 'software-dev',
        })

        setSkills(profile.skills || [])
      } catch (err: any) {
        if (err.message.includes('Session expired')) {
          router.push('/login')
        } else {
          toast.error('Failed to load profile')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Map frontend values to API values
      const experienceLevelMap: Record<string, 'fresher' | 'junior' | 'mid'> = {
        'fresher': 'fresher',
        'junior': 'junior',
        'mid': 'mid',
        'senior': 'mid',
      }

      const trackMap: Record<string, 'web_development' | 'data' | 'design' | 'marketing'> = {
        'software-dev': 'web_development',
        'data-science': 'data',
        'design': 'design',
        'marketing': 'marketing',
        'business': 'web_development',
      }

      const updates: any = {
        full_name: formData.name,
        education_level: formData.education,
        skills: skills,
      }

      if (formData.experience) {
        updates.experience_level = experienceLevelMap[formData.experience] || 'fresher'
      }

      // Note: preferred_track update might need to be handled separately if API doesn't support it in PUT
      // For now, we'll skip it as it's typically set during onboarding

      await profileApi.updateProfile(updates)
      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateCV = async () => {
    setIsGeneratingCV(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error('Please log in to generate CV')
        router.push('/login')
        return
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3000/api';
      const response = await fetch(`${API_BASE_URL}/profile/generate-cv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate CV')
      }

      // Get the PDF blob
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV_${formData.name.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('CV downloaded successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate CV')
    } finally {
      setIsGeneratingCV(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and career preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <motion.div
              className="rounded-xl p-6 border border-gray-200 dark:border-white/20 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30 shadow-sm dark:shadow-md"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Personal Information
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className="glass-effect border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="glass-effect border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 h-12"
                  />
                </div>
              </div>
            </motion.div>

            {/* Career Information */}
            <motion.div
              className="rounded-xl p-6 border border-gray-200 dark:border-white/20 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30 shadow-sm dark:shadow-md"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Career Information
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="education" className="text-foreground">Education Level</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <Select value={formData.education} onValueChange={(value) => updateFormData("education", value)}>
                      <SelectTrigger className="pl-10 glass-effect border-gray-300 dark:border-white/10 h-12">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-white/10">
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-foreground">Experience Level</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <Select value={formData.experience} onValueChange={(value) => updateFormData("experience", value)}>
                      <SelectTrigger className="pl-10 glass-effect border-gray-300 dark:border-white/10 h-12">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-white/10">
                        <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
                        <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                        <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="track" className="text-foreground">Preferred Career Track</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <Select value={formData.track} onValueChange={(value) => updateFormData("track", value)}>
                      <SelectTrigger className="pl-10 glass-effect border-gray-300 dark:border-white/10 h-12">
                        <SelectValue placeholder="Select career track" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-white/10">
                        <SelectItem value="software-dev">Software Development</SelectItem>
                        <SelectItem value="data-science">Data Science</SelectItem>
                        <SelectItem value="design">UI/UX Design</SelectItem>
                        <SelectItem value="marketing">Digital Marketing</SelectItem>
                        <SelectItem value="business">Business Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CV Section */}
            <motion.div
              className="rounded-xl p-6 border border-gray-200 dark:border-white/20 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30 shadow-sm dark:shadow-md"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                CV / Resume
              </h2>

              <CVUpload
                onUploadSuccess={() => {
                  toast.success('CV uploaded successfully!')
                }}
              />
            </motion.div>

            {/* CV Generation Section */}
            <motion.div
              className="rounded-xl p-6 border border-gray-200 dark:border-white/20 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30 shadow-sm dark:shadow-md"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                Auto-Generate CV
              </h2>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate a professional CV based on your profile information. The CV will be automatically formatted and ready to download as a PDF.
                </p>

                <Button
                  onClick={handleGenerateCV}
                  disabled={isGeneratingCV}
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                >
                  {isGeneratingCV ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Generating CV...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate & Download CV
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Skills Section - Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="rounded-xl p-6 border border-gray-200 dark:border-white/20 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30 shadow-sm dark:shadow-md"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Skills
              </h2>

              {/* Add Skill Input */}
              <div className="space-y-3 mb-6">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    className="glass-effect border-gray-300 dark:border-white/10 focus:border-purple-500 dark:focus:border-purple-500 h-10"
                  />
                  <Button
                    onClick={addSkill}
                    size="icon"
                    className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add skills relevant to your career goals
                </p>
              </div>

              {/* Skills List */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3 py-1.5 border-purple-400/30 hover:border-purple-400 transition-colors group"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No skills added yet. Add some skills to get started!
                  </p>
                )}
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full mt-6 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
