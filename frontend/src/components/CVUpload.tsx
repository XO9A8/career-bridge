"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react'
import { profileApi, aiApi } from '@/lib/api'

interface CVUploadProps {
  onUploadSuccess?: () => void
}

export function CVUpload({ onUploadSuccess }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) {
      setFile(null)
      return
    }
    
    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Please select a PDF file' })
      setFile(null)
      return
    }
    
    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB' })
      setFile(null)
      return
    }
    
    setFile(selectedFile)
    setMessage(null)
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setMessage(null)
    
    try {
      const result = await profileApi.uploadCV(file)
      
      // Extract skills automatically if CV text was extracted
      try {
        // Get the profile to access raw_cv_text
        const profile = await profileApi.getProfile()
        if (profile.raw_cv_text) {
          const extractResult = await aiApi.extractSkills(
            profile.raw_cv_text, 
            'gemini', 
            true
          )
          
          const skillsCount = extractResult.extracted_data?.technical_skills?.length || 
                             extractResult.skills?.length || 0
          
          setMessage({ 
            type: 'success', 
            text: `CV uploaded successfully! Extracted ${skillsCount} skills automatically.` 
          })
        } else {
          setMessage({ 
            type: 'success', 
            text: `CV uploaded successfully! Extracted ${result.extracted_length} characters.` 
          })
        }
      } catch (extractError) {
        // If skill extraction fails, still show success for upload
        setMessage({ 
          type: 'success', 
          text: `CV uploaded successfully! Extracted ${result.extracted_length} characters.` 
        })
      }
      
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('cv-file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      // Callback for parent component
      onUploadSuccess?.()
    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed. Please try again.'
      setMessage({ 
        type: 'error', 
        text: errorMessage
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cv-file-input" className="block text-sm font-medium mb-2 text-foreground">
          Upload CV/Resume (PDF)
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              id="cv-file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="glass-effect border-white/10 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
            />
          </div>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload CV
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Maximum file size: 10MB. Only PDF files are supported.
        </p>
      </div>
      
      {file && !message && (
        <div className="glass-effect rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}
      
      {message && (
        <Alert 
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className={message.type === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-green-500/50 bg-green-500/10'}
        >
          <div className="flex items-start gap-2">
            {message.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            )}
            <AlertDescription className={message.type === 'error' ? 'text-red-200' : 'text-green-200'}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}
