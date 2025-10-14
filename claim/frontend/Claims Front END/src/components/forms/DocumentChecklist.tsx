'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DocumentItem {
  id: string
  name: string
  required: boolean
  description: string
}

interface DocumentChecklistProps {
  payerName: string
  specialty: string
  onChecklistComplete: (isComplete: boolean) => void
  onDocumentsUploaded: (documents: any[]) => void
}

export default function DocumentChecklist({
  payerName,
  specialty,
  onChecklistComplete,
  onDocumentsUploaded
}: DocumentChecklistProps) {
  const [checklist, setChecklist] = useState<DocumentItem[]>([])
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [checklistLoading, setChecklistLoading] = useState(false)

  useEffect(() => {
    if (payerName && specialty) {
      fetchChecklist()
    }
  }, [payerName, specialty])

  useEffect(() => {
    // Check if all required documents are checked
    const requiredItems = checklist.filter(item => item.required)
    const checkedRequiredItems = requiredItems.filter(item => checkedItems.has(item.id))
    const isComplete = requiredItems.length > 0 && checkedRequiredItems.length === requiredItems.length
    
    onChecklistComplete(isComplete)
  }, [checklist, checkedItems, onChecklistComplete])

  const fetchChecklist = async () => {
    try {
      setChecklistLoading(true)
      const response = await fetch(
        `http://localhost:5002/api/v1/checklist/get-checklist-test?payer_name=${encodeURIComponent(payerName)}&specialty=${encodeURIComponent(specialty)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to access document checklist.')
        }
        throw new Error('Failed to fetch checklist')
      }

      const data = await response.json()
      setChecklist(data.checklist || [])
    } catch (error) {
      console.error('Error fetching checklist:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch document checklist'
      toast.error(errorMessage)
    } finally {
      setChecklistLoading(false)
    }
  }

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems)
    if (checked) {
      newCheckedItems.add(itemId)
    } else {
      newCheckedItems.delete(itemId)
    }
    setCheckedItems(newCheckedItems)
  }

  const handleFileUpload = async (itemId: string, file: File) => {
    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('claim_id', 'temp_claim_id') // This will be updated when claim is submitted
      formData.append('document_type', itemId)
      formData.append('document_name', file.name)

      const response = await fetch('http://localhost:5002/api/v1/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const data = await response.json()
      
      // Add to uploaded documents
      const newDocument = {
        document_id: data.document_id,
        document_type: itemId,
        document_name: file.name,
        download_url: data.download_url,
        uploaded_at: new Date().toISOString()
      }
      
      setUploadedDocuments(prev => [...prev, newDocument])
      onDocumentsUploaded([...uploadedDocuments, newDocument])
      
      // Auto-check the item when document is uploaded
      handleCheckboxChange(itemId, true)
      
      toast.success('Document uploaded successfully')
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  const getItemStatus = (item: DocumentItem) => {
    const isChecked = checkedItems.has(item.id)
    const isUploaded = uploadedDocuments.some(doc => doc.document_type === item.id)
    
    if (isUploaded) {
      return { status: 'uploaded', icon: CheckCircle, color: 'text-green-600' }
    } else if (isChecked) {
      return { status: 'checked', icon: CheckCircle, color: 'text-blue-600' }
    } else if (item.required) {
      return { status: 'required', icon: AlertCircle, color: 'text-red-600' }
    } else {
      return { status: 'optional', icon: FileText, color: 'text-gray-600' }
    }
  }

  const getCompletionStatus = () => {
    const requiredItems = checklist.filter(item => item.required)
    const completedRequired = requiredItems.filter(item => checkedItems.has(item.id))
    
    if (requiredItems.length === 0) return { percentage: 0, text: 'No requirements' }
    
    const percentage = Math.round((completedRequired.length / requiredItems.length) * 100)
    return { percentage, text: `${completedRequired.length}/${requiredItems.length} required documents` }
  }

  if (checklistLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p>Loading checklist...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const completionStatus = getCompletionStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Checklist
        </CardTitle>
        <div className="flex items-center gap-4">
          <Badge variant={completionStatus.percentage === 100 ? 'default' : 'secondary'}>
            {completionStatus.percentage}% Complete
          </Badge>
          <span className="text-sm text-muted-foreground">
            {completionStatus.text}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {checklist.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No specific checklist found for {payerName} - {specialty}. 
              Please contact your administrator to set up document requirements.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {checklist.map((item) => {
              const itemStatus = getItemStatus(item)
              const StatusIcon = itemStatus.icon
              
              return (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id={item.id}
                    checked={checkedItems.has(item.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                    disabled={loading}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <label htmlFor={item.id} className="font-medium cursor-pointer">
                        {item.name}
                      </label>
                      <StatusIcon className={`h-4 w-4 ${itemStatus.color}`} />
                      {item.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    
                    {/* File Upload Section */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id={`file-${item.id}`}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(item.id, file)
                          }
                        }}
                        className="hidden"
                        disabled={loading}
                      />
                      <label
                        htmlFor={`file-${item.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-primary/10 text-primary rounded-md hover:bg-primary/20 cursor-pointer transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Document
                      </label>
                      
                      {uploadedDocuments.find(doc => doc.document_type === item.id) && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Uploaded
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {completionStatus.percentage === 100 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All required documents have been checked. You can now submit the claim.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
