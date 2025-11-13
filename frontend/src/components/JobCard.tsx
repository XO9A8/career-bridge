"use client"

import { MapPin, Briefcase, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  type: string
  skills: string[]
  postedDate: string
  onViewDetails: (id: string) => void
}

export default function JobCard({
  id,
  title,
  company,
  location,
  type,
  skills,
  postedDate,
  onViewDetails,
}: JobCardProps) {
  return (
    <motion.div
      className="rounded-xl p-6 border border-blue-200/50 dark:border-blue-500/30 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 group shadow-sm hover:shadow-md h-full flex flex-col"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex flex-col space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">{company}</p>
          </div>
          <Badge
            variant="secondary"
            className="text-xs font-medium px-3 py-1 border border-blue-500/50 dark:border-blue-500/30 bg-blue-100/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
          >
            {type}
          </Badge>
        </div>

        {/* Location and Time */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{postedDate}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 4).map((skill, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs px-2 py-1 border-blue-200/50 dark:border-white/20 bg-white/50 dark:bg-white/5 hover:border-blue-400 dark:hover:border-blue-400 transition-colors"
            >
              {skill}
            </Badge>
          ))}
          {skills.length > 4 && (
            <Badge
              variant="outline"
              className="text-xs px-2 py-1 border-blue-200/50 dark:border-white/20 bg-white/50 dark:bg-white/5"
            >
              +{skills.length - 4} more
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onViewDetails(id)}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
        >
          View Details
        </Button>
      </div>
    </motion.div>
  )
}