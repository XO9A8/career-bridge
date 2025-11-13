"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { profileApi } from "@/lib/api"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token')
        const isNewUser = searchParams.get('new_user') === 'true'

        if (!token) {
          toast.error('Authentication failed. No token received.')
          router.push('/login')
          return
        }

        // Store token
        localStorage.setItem('authToken', token)

        // Get user ID from profile
        try {
          const profile = await profileApi.getProfile()
          localStorage.setItem('userId', profile.id)
        } catch (err) {
          // If profile fetch fails, continue anyway
          console.error('Failed to fetch profile:', err)
        }

        toast.success('Successfully authenticated!')

        // Redirect based on user status
        if (isNewUser) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      } catch (err: any) {
        toast.error(err.message || 'Authentication failed. Please try again.')
        router.push('/login')
      } finally {
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-muted-foreground">
          {isProcessing ? 'Completing authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}

