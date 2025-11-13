"use client"

import { X, MapPin, Briefcase, Clock, Building2, DollarSign, Users, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface JobDetailsModalProps {
  open: boolean
  onClose: () => void
  job: {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary?: string
    experience: string
    skills: string[]
    postedDate: string
    description: string
    responsibilities: string[]
    requirements: string[]
    benefits?: string[]
  } | null
}

export default function JobDetailsModal({ open, onClose, job }: JobDetailsModalProps) {
  if (!job) return null

  const handleSaveJob = () => {
    // Placeholder for save functionality
    alert(`Job "${job.title}" saved!`)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-white/10 max-w-3xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <DialogTitle className="text-2xl font-bold text-gradient">
                    {job.title}
                  </DialogTitle>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="text-lg font-medium text-foreground">{job.company}</span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="glass-effect text-sm font-medium px-4 py-2 border border-blue-500/30"
                >
                  {job.type}
                </Badge>
              </div>
            </DialogHeader>

            {/* Key Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 glass-effect rounded-lg p-3">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{job.location}</p>
                </div>
              </div>

              {job.salary && (
                <div className="flex items-center space-x-3 glass-effect rounded-lg p-3">
                  <DollarSign className="w-5 h-5 text-green-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Salary</p>
                    <p className="text-sm font-medium">{job.salary}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 glass-effect rounded-lg p-3">
                <Users className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="text-sm font-medium">{job.experience}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 glass-effect rounded-lg p-3">
                <Clock className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Posted</p>
                  <p className="text-sm font-medium">{job.postedDate}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-sm px-3 py-1 border-blue-400/30 hover:border-blue-400 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Job Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Responsibilities</h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleSaveJob}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300 animate-glow"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save Job
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-lg border-white/20 hover:bg-white/5"
              >
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}