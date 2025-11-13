"use client"

import { ExternalLink, DollarSign } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ResourceCardProps {
  id: string
  title: string
  platform: string
  cost: "Free" | "Paid"
  price?: string
  skills: string[]
  url: string
  description?: string
}

export default function ResourceCard({
  title,
  platform,
  cost,
  price,
  skills,
  url,
  description,
}: ResourceCardProps) {
  return (
    <motion.div
      className="rounded-xl p-6 border border-purple-200/50 dark:border-purple-500/30 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 hover:border-purple-400 dark:hover:border-purple-400 transition-all duration-300 group h-full flex flex-col shadow-sm hover:shadow-md"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex flex-col space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-purple-400 transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">{platform}</p>
          </div>
          <Badge
            variant={cost === "Free" ? "default" : "secondary"}
            className={`text-xs font-medium px-3 py-1 shrink-0 ${
              cost === "Free"
                ? "border border-green-500/50 dark:border-green-500/30 bg-green-100/50 dark:bg-green-500/20 text-green-700 dark:text-green-300"
                : "border border-blue-500/50 dark:border-blue-500/30 bg-blue-100/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
            }`}
          >
            {cost}
          </Badge>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 3).map((skill, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs px-2 py-1 border-purple-200/50 dark:border-white/20 bg-white/50 dark:bg-white/5 hover:border-purple-400 dark:hover:border-purple-400 transition-colors"
            >
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge
              variant="outline"
              className="text-xs px-2 py-1 border-purple-200/50 dark:border-white/20 bg-white/50 dark:bg-white/5"
            >
              +{skills.length - 3} more
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button
          asChild
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-purple-500/50 transition-all duration-300 mt-auto"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <span>Visit Resource</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>
    </motion.div>
  )
}