"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import dynamic from "next/dynamic"
import { profileApi } from "@/lib/api"
import { toast } from "sonner"

// Lazy load OnboardingFlow
const OnboardingFlow = dynamic(() => import("@/components/OnboardingFlow"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  ),
});

export default function OnboardingPage() {
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async (data: { education: string; experience: string; track: string }) => {
    setIsCompleting(true)
    
    try {
      // Map frontend values to API values
      const experienceLevelMap: Record<string, 'fresher' | 'junior' | 'mid'> = {
        'fresher': 'fresher',
        'junior': 'junior',
        'mid': 'mid',
        'senior': 'mid', // Map senior to mid as API only accepts fresher, junior, mid
      }

      const trackMap: Record<string, 'web_development' | 'data' | 'design' | 'marketing'> = {
        'software-dev': 'web_development',
        'data-science': 'data',
        'design': 'design',
        'marketing': 'marketing',
        'business': 'web_development', // Map business to web_development
      }

      await profileApi.completeProfile({
        education_level: data.education,
        experience_level: experienceLevelMap[data.experience] || 'fresher',
        preferred_track: trackMap[data.track] || 'web_development',
        skills: [], // Empty initially, can be added in profile page
        projects: [], // Empty initially, can be added in profile page
        target_roles: [], // Empty initially, can be added in profile page
      })

      toast.success('Profile completed successfully!')
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete profile. Please try again.')
    } finally {
      setIsCompleting(false)
    }
  }

  return <OnboardingFlow onComplete={handleComplete} />
}

