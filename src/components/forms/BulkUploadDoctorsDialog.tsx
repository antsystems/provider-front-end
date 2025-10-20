'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { doctorsApi } from '@/services/doctorsApi'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface BulkUploadDoctorsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface PreviewDoctor {
  doctor_name: string
  specialty_name: string
  contact_number: string
  email: string
  department_name: string
  qualification?: string
}

export default function BulkUploadDoctorsDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkUploadDoctorsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<PreviewDoctor[]>([])
  const [uploadResult, setUploadResult] = useState<{
    successful: number
    failed: number
    message?: string
    created_doctors?: string[]
    errors?: Array<{ row: number; error: string }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): PreviewDoctor[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const items: PreviewDoctor[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length >= 5) {
        // Map CSV columns to doctor fields according to the template
        const doctor: PreviewDoctor = {
          doctor_name: values[0] || '',
          specialty_name: values[1] || '',
          contact_number: values[2] || '',
          email: values[3] || '',
          department_name: values[4] || '',
          qualification: values[5] || undefined,
        }
        items.push(doctor)
      }
    }

    return items
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel']
      const isCSV = file.name.endsWith('.csv')

      if (!validTypes.includes(file.type) && !isCSV) {
        toast.error('Please select a CSV file')
        return
      }

      setSelectedFile(file)
      setUploadResult(null)

      // Parse file for preview
      try {
        const text = await file.text()
        const parsedItems: PreviewDoctor[] = parseCSV(text)

        setPreviewData(parsedItems)

        if (parsedItems.length === 0) {
          toast.warning('No valid entries found in the file')
        } else {
          toast.success(`Found ${parsedItems.length} doctors in the file`)
        }
      } catch (error) {
        console.error('Error reading file:', error)
        toast.error('Failed to read file. Please check the format.')
        setPreviewData([])
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    setIsLoading(true)
    try {
      toast.info('Starting bulk upload... This may take a few moments.')
      
      const result = await doctorsApi.bulkUploadDoctors(selectedFile)

      setUploadResult({
        successful: result.successful || 0,
        failed: result.failed || 0,
        message: result.message,
        created_doctors: result.created_doctors,
        errors: result.errors,
      })

      // Trigger refresh in parent component
      onSuccess?.()

      // Show success/warning based on errors
      if (result.failed === 0) {
        toast.success(`Successfully uploaded ${result.successful} doctors!`)
        setTimeout(() => {
          onOpenChange(false)
          handleReset()
        }, 3000)
      } else if (result.successful > 0) {
        toast.warning(`Upload completed: ${result.successful} successful, ${result.failed} failed`)
      } else {
        toast.error('Upload failed for all doctors. Please check the errors below.')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewData([])
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancel = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleDownloadTemplate = () => {
    // Create CSV content with headers and example rows according to the specified template
    // Note: Qualification is required by the backend API
    const csvContent = `doctor_name,specialty_name,contact_number,email,department_name,qualification
Dr. John Smith,Cardiology,9876543210,john.smith@hospital.com,Cardiology,MBBS MD Cardiology
Dr. Sarah Johnson,Neurology,9876543211,sarah.j@hospital.com,Neurology,MBBS DM Neurology
Dr. Michael Brown,Orthopedics,9876543212,michael.b@hospital.com,Orthopedics,MBBS MS Orthopedics
Dr. Emily Davis,Pediatrics,9876543213,emily.d@hospital.com,Pediatrics,MBBS DCH Pediatrics
Dr. Robert Wilson,Internal Medicine,9876543214,robert.w@hospital.com,Internal Medicine,MBBS MD Medicine`

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'doctors_bulk_upload_template.csv')
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Template downloaded! Fill in your doctor data.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk Upload Doctors
          </DialogTitle>
          <DialogDescription>
            Upload multiple doctors from CSV file using the specified template format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Format Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">CSV Template Format:</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV Template
                </Button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-primary">Required CSV Headers:</p>
                  <code className="block bg-muted p-2 rounded mt-1 text-xs">
                    doctor_name,specialty_name,contact_number,email,department_name,qualification
                    <br />
                    Dr. John Smith,Cardiology,9876543210,john.smith@hospital.com,Cardiology,MBBS MD Cardiology
                    <br />
                    Dr. Sarah Johnson,Neurology,9876543211,sarah.j@hospital.com,Neurology,MBBS DM Neurology
                  </code>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>Required fields:</strong> doctor_name, specialty_name, contact_number, email, department_name, qualification
                      <br />
                      <strong>Note:</strong> All fields are required by the backend API
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="bulk-upload-doctors-file"
              />
              <label htmlFor="bulk-upload-doctors-file">
                <Button type="button" variant="outline" asChild>
                  <span>
                    <FileText className="mr-2 h-4 w-4" />
                    Choose CSV File
                  </span>
                </Button>
              </label>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-muted-foreground">
                    ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* Preview Table */}
            {previewData.length > 0 && !uploadResult && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Preview ({previewData.length} entries)</h4>
                    </div>

                    <div className="max-h-64 overflow-auto scrollbar-hide border rounded">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left py-2 px-3 font-medium">#</th>
                            <th className="text-left py-2 px-3 font-medium">Doctor Name</th>
                            <th className="text-left py-2 px-3 font-medium">Specialty</th>
                            <th className="text-left py-2 px-3 font-medium">Contact</th>
                            <th className="text-left py-2 px-3 font-medium">Email</th>
                            <th className="text-left py-2 px-3 font-medium">Department</th>
                            <th className="text-left py-2 px-3 font-medium">Qualification</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((doctor, index) => (
                            <tr key={index} className="border-t hover:bg-muted/50">
                              <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                              <td className="py-2 px-3 font-medium">{doctor.doctor_name}</td>
                              <td className="py-2 px-3">{doctor.specialty_name}</td>
                              <td className="py-2 px-3 font-mono text-xs">{doctor.contact_number}</td>
                              <td className="py-2 px-3 text-xs">{doctor.email}</td>
                              <td className="py-2 px-3">{doctor.department_name}</td>
                              <td className="py-2 px-3 text-muted-foreground text-xs">
                                {doctor.qualification || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Group by specialty summary */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        previewData.reduce((acc, doctor) => {
                          acc[doctor.specialty_name] = (acc[doctor.specialty_name] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([specialtyName, count]) => (
                        <div
                          key={specialtyName}
                          className="text-xs px-2 py-1 bg-primary/10 rounded"
                        >
                          <span className="font-medium">{specialtyName}:</span> {count} doctors
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {(!uploadResult.errors || uploadResult.errors.length === 0) ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <h4 className="font-medium">Upload Results</h4>
                    </div>

                    {/* Success Message */}
                    {uploadResult.message && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {uploadResult.message}
                        </p>
                      </div>
                    )}

                    {/* Created Doctors */}
                    {uploadResult.created_doctors && uploadResult.created_doctors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Created Doctor IDs:</p>
                        <div className="flex flex-wrap gap-2">
                          {uploadResult.created_doctors.map((doctorId, index) => (
                            <div
                              key={index}
                              className="px-3 py-1.5 bg-primary/10 text-primary rounded-md font-mono text-sm"
                            >
                              {doctorId}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats if available */}
                    {(uploadResult.successful > 0 || uploadResult.failed > 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                              Successful
                            </p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {uploadResult.successful}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">
                              Failed
                            </p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                              {uploadResult.failed}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Details */}
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Errors:</p>
                        <div className="max-h-40 overflow-y-auto scrollbar-hide space-y-1">
                          {uploadResult.errors.map((error, index) => (
                            <div
                              key={index}
                              className="text-xs p-2 bg-red-50 dark:bg-red-950 rounded"
                            >
                              <span className="font-medium">Row {error.row}:</span> {error.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {uploadResult ? 'Close' : 'Cancel'}
            </Button>
            {!uploadResult && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Uploading...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
