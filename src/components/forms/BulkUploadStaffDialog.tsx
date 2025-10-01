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
import { staffApi } from '@/services/staffApi'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface BulkUploadStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface PreviewStaff {
  staff_name: string
  contact_number: string
  email: string
  department_name: string
  designation?: string
  qualification?: string
  experience_years?: number
}

export default function BulkUploadStaffDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkUploadStaffDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<PreviewStaff[]>([])
  const [uploadResult, setUploadResult] = useState<{
    successful: number
    failed: number
    message?: string
    created_staff?: string[]
    errors?: Array<{ row: number; error: string }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): PreviewStaff[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const items: PreviewStaff[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length >= 4) {
        // Map CSV columns to staff fields
        const staff: PreviewStaff = {
          staff_name: values[0] || '',
          contact_number: values[1] || '',
          email: values[2] || '',
          department_name: values[3] || '',
          designation: values[4] || undefined,
          qualification: values[5] || undefined,
          experience_years: values[6] ? parseInt(values[6]) : undefined,
        }
        items.push(staff)
      }
    }

    return items
  }

  const parseJSON = (text: string): PreviewStaff[] => {
    try {
      const data = JSON.parse(text)
      const items: PreviewStaff[] = []

      if (Array.isArray(data)) {
        data.forEach((staff: any) => {
          items.push({
            staff_name: staff.staff_name || staff.name || '',
            contact_number: staff.contact_number || staff.phone_number || staff.phone || '',
            email: staff.email || '',
            department_name: staff.department_name || staff.department || '',
            designation: staff.designation || undefined,
            qualification: staff.qualification || undefined,
            experience_years: staff.experience_years || staff.experience || undefined,
          })
        })
      }

      return items
    } catch (error) {
      console.error('Error parsing JSON:', error)
      return []
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel']
      const isCSV = file.name.endsWith('.csv')
      const isJSON = file.name.endsWith('.json')

      if (!validTypes.includes(file.type) && !isCSV && !isJSON) {
        toast.error('Please select a CSV or JSON file')
        return
      }

      setSelectedFile(file)
      setUploadResult(null)

      // Parse file for preview
      try {
        const text = await file.text()
        let parsedItems: PreviewStaff[] = []

        if (isCSV) {
          parsedItems = parseCSV(text)
        } else if (isJSON) {
          parsedItems = parseJSON(text)
        }

        setPreviewData(parsedItems)

        if (parsedItems.length === 0) {
          toast.warning('No valid entries found in the file')
        } else {
          toast.success(`Found ${parsedItems.length} staff members in the file`)
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
      const result = await staffApi.bulkUploadStaff(selectedFile)

      setUploadResult({
        successful: result.successful || 0,
        failed: result.failed || 0,
        message: result.message,
        created_staff: result.created_staff,
        errors: result.errors,
      })

      // Trigger refresh in parent component
      onSuccess?.()

      // Show success/warning based on errors
      if (!result.errors || result.errors.length === 0) {
        toast.success(result.message || 'Upload completed successfully!')
        setTimeout(() => {
          onOpenChange(false)
          handleReset()
        }, 3000)
      } else {
        toast.warning('Upload completed with some errors')
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
    // Create CSV content with headers and example rows
    const csvContent = `staff_name,contact_number,email,department_name,designation,qualification,experience_years
John Doe,9876543210,john.doe@hospital.com,Cardiology,Senior Nurse,B.Sc Nursing,5
Jane Smith,9876543211,jane.smith@hospital.com,Emergency,Staff Nurse,B.Sc Nursing,3
Dr. Michael Johnson,9876543212,michael.j@hospital.com,Orthopedics,Consultant,MBBS MS Orthopedics,10
Sarah Wilson,9876543213,sarah.w@hospital.com,Administration,Admin Officer,MBA,7
Robert Brown,9876543214,robert.b@hospital.com,Laboratory,Lab Technician,B.Sc MLT,4`

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'staff_bulk_upload_template.csv')
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Template downloaded! Fill in your staff data.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk Upload Staff Members
          </DialogTitle>
          <DialogDescription>
            Upload multiple staff members from CSV or JSON file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Format Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Supported Formats:</h4>
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
                  <p className="font-medium text-primary">CSV Format:</p>
                  <code className="block bg-muted p-2 rounded mt-1 text-xs">
                    staff_name,contact_number,email,department_name,designation,qualification,experience_years
                    <br />
                    John Doe,9876543210,john.doe@hospital.com,Cardiology,Senior Nurse,B.Sc Nursing,5
                    <br />
                    Jane Smith,9876543211,jane.smith@hospital.com,Emergency,Staff Nurse,B.Sc Nursing,3
                  </code>
                </div>

                <div>
                  <p className="font-medium text-primary">JSON Format:</p>
                  <code className="block bg-muted p-2 rounded mt-1 text-xs">
                    [
                    <br />
                    &nbsp;&nbsp;&#123;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"staff_name": "John Doe",
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"contact_number": "9876543210",
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"email": "john.doe@hospital.com",
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"department_name": "Cardiology"
                    <br />
                    &nbsp;&nbsp;&#125;
                    <br />
                    ]
                  </code>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>Required fields:</strong> staff_name, contact_number, email, department_name
                      <br />
                      <strong>Optional:</strong> designation, qualification, experience_years
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
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
                id="bulk-upload-staff-file"
              />
              <label htmlFor="bulk-upload-staff-file">
                <Button type="button" variant="outline" asChild>
                  <span>
                    <FileText className="mr-2 h-4 w-4" />
                    Choose File
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
                            <th className="text-left py-2 px-3 font-medium">Staff Name</th>
                            <th className="text-left py-2 px-3 font-medium">Contact</th>
                            <th className="text-left py-2 px-3 font-medium">Email</th>
                            <th className="text-left py-2 px-3 font-medium">Department</th>
                            <th className="text-left py-2 px-3 font-medium">Designation</th>
                            <th className="text-left py-2 px-3 font-medium">Experience</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((staff, index) => (
                            <tr key={index} className="border-t hover:bg-muted/50">
                              <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                              <td className="py-2 px-3 font-medium">{staff.staff_name}</td>
                              <td className="py-2 px-3 font-mono text-xs">{staff.contact_number}</td>
                              <td className="py-2 px-3 text-xs">{staff.email}</td>
                              <td className="py-2 px-3">{staff.department_name}</td>
                              <td className="py-2 px-3 text-muted-foreground text-xs">
                                {staff.designation || '-'}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {staff.experience_years || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Group by department summary */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        previewData.reduce((acc, staff) => {
                          acc[staff.department_name] = (acc[staff.department_name] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([deptName, count]) => (
                        <div
                          key={deptName}
                          className="text-xs px-2 py-1 bg-primary/10 rounded"
                        >
                          <span className="font-medium">{deptName}:</span> {count} staff
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

                    {/* Created Staff */}
                    {uploadResult.created_staff && uploadResult.created_staff.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Created Staff IDs:</p>
                        <div className="flex flex-wrap gap-2">
                          {uploadResult.created_staff.map((staffId, index) => (
                            <div
                              key={index}
                              className="px-3 py-1.5 bg-primary/10 text-primary rounded-md font-mono text-sm"
                            >
                              {staffId}
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