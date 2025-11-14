"use client"

import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { aiApi, profileApi } from "@/lib/api"
import { toast } from "sonner"
import { Bot, Send, Lightbulb, User, Upload, FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"

// Lazy load Footer
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32" />,
});

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  disclaimer?: string
}

export default function MentorPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('mentorChatHistory')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch (error) {
        console.error('Failed to load chat history:', error)
        // If loading fails, start with welcome message
        setMessages([{
          id: '1',
          role: 'assistant',
          content: "Hi! I'm **CareerBot**, your AI Career Mentor aligned with UN Sustainable Development Goal 8 (Decent Work and Economic Growth).\n\nI'm here to help you with:\n- **Skill Gap Analysis** - Ask about your skill match percentage for any role\n- **Market Trends** - Get insights on in-demand skills and technologies\n- **CV Analysis** - Extract and analyze skills from your CV\n- **Career Planning** - Personalized guidance based on your profile\n- **Learning Paths** - Recommendations on what to learn next\n\n**Smart Features:**\n✨ I automatically analyze your skill gaps when you ask about specific roles\n📊 I provide real market data from our job database\n🎯 I give you actionable insights based on your current skills\n\n**Important:** My responses are suggestions and guidance based on current industry trends and best practices. Actual outcomes depend on your individual circumstances, effort, and market conditions.\n\nHow can I support your career journey today?",
          timestamp: new Date(),
          disclaimer: "All guidance provided is for informational purposes and should be considered as suggestions, not guarantees."
        }])
      }
    } else {
      // No saved history, show welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hi! I'm **CareerBot**, your AI Career Mentor aligned with UN Sustainable Development Goal 8 (Decent Work and Economic Growth).\n\nI'm here to help you with:\n- **Skill Gap Analysis** - Ask about your skill match percentage for any role\n- **Market Trends** - Get insights on in-demand skills and technologies\n- **CV Analysis** - Extract and analyze skills from your CV\n- **Career Planning** - Personalized guidance based on your profile\n- **Learning Paths** - Recommendations on what to learn next\n\n**Smart Features:**\n✨ I automatically analyze your skill gaps when you ask about specific roles\n📊 I provide real market data from our job database\n🎯 I give you actionable insights based on your current skills\n\n**Important:** My responses are suggestions and guidance based on current industry trends and best practices. Actual outcomes depend on your individual circumstances, effort, and market conditions.\n\nHow can I support your career journey today?",
        timestamp: new Date(),
        disclaimer: "All guidance provided is for informational purposes and should be considered as suggestions, not guarantees."
      }])
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mentorChatHistory', JSON.stringify(messages))
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const suggestedQuestions = [
    "What's my skill gap percentage for Full Stack Developer?",
    "What skills are trending in the market right now?",
    "Which skills should I learn based on market demand?",
    "What percentage of skills do I have for Backend Developer?",
    "Show me available job roles in the database",
  ]

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const question = input
    setInput("")
    setLoading(true)

    try {
      // Intelligent keyword detection to determine what context to include
      const lowerQuestion = question.toLowerCase()
      
      // Detect if user is asking about skill gaps, skills to learn, or percentages
      const isSkillGapQuery = 
        lowerQuestion.includes('skill gap') ||
        lowerQuestion.includes('skills gap') ||
        lowerQuestion.includes('what skills') ||
        lowerQuestion.includes('which skills') ||
        lowerQuestion.includes('skills do i need') ||
        lowerQuestion.includes('skills should i') ||
        lowerQuestion.includes('missing skills') ||
        lowerQuestion.includes('percentage') ||
        lowerQuestion.includes('how ready') ||
        lowerQuestion.includes('am i ready') ||
        lowerQuestion.includes('match') ||
        lowerQuestion.includes('match score') ||
        lowerQuestion.includes('skill match') ||
        lowerQuestion.includes('for the role') ||
        lowerQuestion.includes('for a role')

      // Detect if user is asking about market trends or job market
      const isMarketQuery = 
        lowerQuestion.includes('market') ||
        lowerQuestion.includes('trend') ||
        lowerQuestion.includes('in demand') ||
        lowerQuestion.includes('popular') ||
        lowerQuestion.includes('hiring') ||
        lowerQuestion.includes('companies looking') ||
        lowerQuestion.includes('most needed') ||
        lowerQuestion.includes('hot skill') ||
        lowerQuestion.includes('what\'s trending') ||
        lowerQuestion.includes('how many jobs') ||
        lowerQuestion.includes('database') ||
        lowerQuestion.includes('statistics') ||
        lowerQuestion.includes('job count')

      // Detect if user is asking about CV or wants CV analysis
      const isCvQuery = 
        lowerQuestion.includes('cv') ||
        lowerQuestion.includes('resume') ||
        lowerQuestion.includes('extract') ||
        lowerQuestion.includes('analyze my') ||
        lowerQuestion.includes('upload')

      // Detect if user is pasting CV text (long text with career-related keywords)
      const isPastingCV = question.length > 500 && 
                         (lowerQuestion.includes('experience') || 
                          lowerQuestion.includes('education') ||
                          lowerQuestion.includes('skills') ||
                          lowerQuestion.includes('project'))

      // If user is pasting CV text, extract skills from it
      if (isPastingCV) {
        const processingMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '🔍 I see you\'ve shared your CV/resume text! Let me analyze it and extract your skills...',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, processingMsg])

        try {
          const extractResult = await aiApi.extractSkills(question, 'gemini', true)
          const technicalSkills = extractResult.extracted_data?.technical_skills || []
          const roles = extractResult.extracted_data?.roles || []

          const skillsMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `🎉 **Skills Extracted & Profile Updated!**\n\n**Technical Skills Found (${technicalSkills.length}):**\n${technicalSkills.map((s: any) => typeof s === 'string' ? `- ${s}` : `- ${s.name || 'Unknown'}`).join('\n') || '- None found'}\n\n**Roles Identified (${roles.length}):**\n${roles.map((r: string) => `- ${r}`).join('\n') || '- None found'}\n\n✨ Your profile has been automatically updated!\n\n**Try asking:**\n- "What's my skill match for Data Analyst?"\n- "What skills are trending in the market?"`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, skillsMessage])
          
          setLoading(false)
          return
        } catch (error: any) {
          console.error('CV extraction error:', error)
          // Fall through to normal question handling
        }
      }

      // Detect if asking about database statistics (always use market analysis for these)
      const isStatsQuery = 
        lowerQuestion.includes('how many') ||
        lowerQuestion.includes('total') ||
        (lowerQuestion.includes('database') && (lowerQuestion.includes('job') || lowerQuestion.includes('resource')))

      // Use market analysis for both trend queries and stats queries
      const shouldIncludeMarket = isMarketQuery || isStatsQuery

      // Detect target role from question
      const roleKeywords = ['developer', 'engineer', 'designer', 'analyst', 'manager', 'architect']
      let targetRole: string | undefined
      for (const keyword of roleKeywords) {
        if (lowerQuestion.includes(keyword)) {
          // Extract the role phrase (e.g., "full stack developer")
          const roleMatch = question.match(new RegExp(`[\\w\\s]*${keyword}[\\w\\s]*`, 'i'))
          if (roleMatch) {
            targetRole = roleMatch[0].trim()
            break
          }
        }
      }

      // Use enhanced mentor if any intelligent features are needed
      const useEnhanced = isSkillGapQuery || shouldIncludeMarket || isCvQuery

      let result
      if (useEnhanced) {
        result = await aiApi.enhancedAskMentor(question, {
          provider: 'gemini',
          includeSkillGap: isSkillGapQuery,
          includeMarketAnalysis: shouldIncludeMarket,
          includeCvData: isCvQuery,
          targetRole: targetRole
        })
      } else {
        result = await aiApi.askMentor(question, 'gemini')
      }
      
      // Extract answer from response - handle both simple and nested structures
      let answerData: string
      if (typeof result.answer === 'string') {
        answerData = result.answer
      } else if (result.answer?.answer) {
        answerData = typeof result.answer.answer === 'string' 
          ? result.answer.answer 
          : JSON.stringify(result.answer.answer)
      } else if (result.answer?.content) {
        answerData = typeof result.answer.content === 'string'
          ? result.answer.content
          : JSON.stringify(result.answer.content)
      } else if (result.response) {
        answerData = typeof result.response === 'string'
          ? result.response
          : JSON.stringify(result.response)
      } else if (typeof result.answer === 'object') {
        // If answer is an object, try to extract text content or stringify
        answerData = JSON.stringify(result.answer, null, 2)
      } else {
        answerData = 'I apologize, but I could not generate a response.'
      }
      
      const disclaimer = result.answer?.disclaimer || result.disclaimer || undefined
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answerData,
        timestamp: new Date(),
        disclaimer: disclaimer
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      if (err.message.includes('Session expired')) {
        router.push('/login')
      } else {
        toast.error('Failed to get response')
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Step 1: Upload PDF and extract text using the backend PDF extraction
      const uploadResult = await profileApi.uploadCV(file)
      
      console.log('Upload result:', uploadResult)
      
      const uploadMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ **CV Uploaded Successfully!**\n\nExtracted ${uploadResult.extracted_length} characters from your PDF. Now analyzing skills with AI...`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, uploadMessage])

      // Step 2: Small delay to ensure database update completes
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 3: Get the updated profile which now contains raw_cv_text
      const profile = await profileApi.getProfile()
      
      console.log('Profile raw_cv_text length:', profile.raw_cv_text?.length || 0)
      console.log('Profile raw_cv_text preview:', profile.raw_cv_text?.substring(0, 200))
      
      if (!profile.raw_cv_text || profile.raw_cv_text.trim().length === 0) {
        // If extraction failed, provide more helpful message
        const errorMsg = `No text could be extracted from the PDF. This could mean:\n- The PDF is image-based (scanned) rather than text-based\n- The PDF is corrupted or encrypted\n- The file doesn't contain readable text\n\nPlease try:\n1. Using a text-based PDF (not a scanned image)\n2. Converting your CV to a fresh PDF\n3. Copying and pasting the text directly into the chat`
        throw new Error(errorMsg)
      }

      // Step 4: Extract skills using AI and update profile
      const extractResult = await aiApi.extractSkills(profile.raw_cv_text, 'gemini', true)

      const technicalSkills = extractResult.extracted_data?.technical_skills || []
      const roles = extractResult.extracted_data?.roles || []

      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `🎉 **Skills Extracted & Profile Updated!**\n\n**Technical Skills Found (${technicalSkills.length}):**\n${technicalSkills.map((s: any) => typeof s === 'string' ? `- ${s}` : `- ${s.name || 'Unknown'}`).join('\n') || '- None found'}\n\n**Roles Identified (${roles.length}):**\n${roles.map((r: string) => `- ${r}`).join('\n') || '- None found'}\n\n✨ Your profile has been automatically updated with these skills!\n\n**Try asking:**\n- "What's my skill match for Data Analyst?"\n- "What skills should I learn next?"`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])

      toast.success('CV analyzed and profile updated!')
    } catch (error: any) {
      console.error('CV upload error:', error)
      toast.error(error.message || 'Failed to process CV')
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Sorry, I encountered an error processing your CV: ${error.message}\n\nPlease make sure your CV is a valid PDF file and try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const clearChatHistory = () => {
    if (confirm('Are you sure you want to clear your chat history?')) {
      localStorage.removeItem('mentorChatHistory')
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Chat history cleared! How can I help you today?",
        timestamp: new Date()
      }])
      toast.success('Chat history cleared')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gradient mb-2 flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-400" />
            CareerBot - AI Career Mentor
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground mb-3">
              Get personalized career advice powered by AI, focused on youth employment, Decent Work and Economic Growth
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChatHistory}
              className="border-white/10 hover:bg-red-500/10 hover:border-red-500/30 text-red-400"
            >
              Clear History
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            <Card className="flex-1 flex flex-col glass-effect border-white/10">
              <CardContent className="flex-1 flex flex-col p-4">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                            : 'glass-effect border border-white/10'
                        }`}
                      >
                        <div className="prose prose-invert">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        {message.disclaimer && message.role === 'assistant' && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-yellow-400 flex items-start gap-2">
                              <span className="flex-shrink-0">⚠️</span>
                              <span className="italic">{message.disclaimer}</span>
                            </p>
                          </div>
                        )}
                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'opacity-70' : 'text-muted-foreground'}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="glass-effect border border-white/10 rounded-lg p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={triggerFileUpload}
                    disabled={loading || uploading}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                    title="Upload CV (PDF)"
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                  <Input
                    placeholder="Ask me about your career..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={loading || uploading}
                    className="flex-1 glass-effect border-white/10"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || loading || uploading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggested Questions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Click to ask or upload</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full text-left justify-start h-auto py-3 px-3 border-white/10 hover:bg-white/5 gap-2"
                  onClick={triggerFileUpload}
                  disabled={uploading || loading}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Upload CV to Extract Skills</span>
                </Button>
                {suggestedQuestions.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-3 px-3 whitespace-normal border-white/10 hover:bg-white/5"
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={loading || uploading}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

