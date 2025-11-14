"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { aiApi } from "@/lib/api"
import { toast } from "sonner"
import { Sparkles, Copy, Check, FileText, Lightbulb } from "lucide-react"

export function ProfileAssistant() {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [copiedSummary, setCopiedSummary] = useState(false)

  const handleGenerateSummary = async () => {
    setLoading(true)
    try {
      const result = await aiApi.generateSummary('gemini')
      const summaryText = result.summary?.content || result.summary || result.response
      setSummary(summaryText)
      toast.success('Summary generated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  const handleGetSuggestions = async () => {
    setLoading(true)
    try {
      const result = await aiApi.getProfileSuggestions('linkedin', 'gemini')
      const suggestionsList = result.suggestions?.suggestions || result.suggestions || []
      setSuggestions(Array.isArray(suggestionsList) ? suggestionsList : [])
      toast.success('Suggestions loaded!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to get suggestions')
    } finally {
      setLoading(false)
    }
  }

  const copySummary = () => {
    navigator.clipboard.writeText(summary)
    setCopiedSummary(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Professional Summary Generator */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Professional Summary Generator
          </CardTitle>
          <CardDescription>
            Generate a compelling professional summary for your CV or LinkedIn profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>

          {summary && (
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="min-h-[120px] pr-12 glass-effect border-white/10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={copySummary}
                >
                  {copiedSummary ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                You can edit the summary above before using it
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Improvement Suggestions */}
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            LinkedIn Profile Suggestions
          </CardTitle>
          <CardDescription>
            Get personalized tips to improve your professional profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGetSuggestions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Suggestions
              </>
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-3">
              {suggestions.map((suggestion: any, idx: number) => (
                <div
                  key={idx}
                  className="glass-effect rounded-lg p-4 border border-white/10"
                >
                  {suggestion.category && (
                    <Badge variant="outline" className="mb-2 border-purple-500/30">
                      {suggestion.category}
                    </Badge>
                  )}
                  <p className="text-sm text-foreground">{suggestion.suggestion || suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

