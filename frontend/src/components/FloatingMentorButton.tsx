"use client"

import { useState } from "react"
import { Bot, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/api"

export default function FloatingMentorButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  // Don't show on mentor page itself, login, register, or if not authenticated
  const shouldShow = pathname !== "/mentor" && 
                     pathname !== "/login" && 
                     pathname !== "/register" &&
                     pathname !== "/" &&
                     pathname !== "/demo" &&
                     isAuthenticated()

  if (!shouldShow) return null

  const handleClick = () => {
    router.push("/mentor")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        size="lg"
        className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group relative"
      >
        <Bot className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
        
        {/* Tooltip */}
        <div
          className={`absolute right-16 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-gray-900 dark:bg-gray-800 text-white text-sm font-medium whitespace-nowrap shadow-lg transition-all duration-200 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
          }`}
        >
          AI Career Mentor
          {/* Arrow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-800" />
        </div>

        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
      </Button>
    </div>
  )
}
