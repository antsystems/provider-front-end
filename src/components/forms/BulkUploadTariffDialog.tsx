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
import { tariffsApi } from '@/services/tariffsApi'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface BulkUploadTariffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface PreviewLineItem {
  tariff_name: string
  code: string
  line_item: string
  price: number
  description?: string
}

export default function BulkUploadTariffDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkUploadTariffDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<PreviewLineItem[]>([])
  const [uploadResult, setUploadResult] = useState<{
    successful: number
    failed: number
    message?: string
    created_tariffs?: string[]
    errors?: Array<{ row: number; error: string }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): PreviewLineItem[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const items: PreviewLineItem[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length >= 4) {
        items.push({
          tariff_name: values[0] || '',
          code: values[1] || '',
          line_item: values[2] || '',
          price: parseFloat(values[3]) || 0,
          description: values[4] || undefined,
        })
      }
    }

    return items
  }

  const parseJSON = (text: string): PreviewLineItem[] => {
    try {
      const data = JSON.parse(text)
      const items: PreviewLineItem[] = []

      if (Array.isArray(data)) {
        data.forEach((tariff: any) => {
          if (tariff.tariff_name && tariff.line_items) {
            tariff.line_items.forEach((item: any) => {
              items.push({
                tariff_name: tariff.tariff_name,
                code: item.code || '',
                line_item: item.line_item || '',
                price: item.amount || item.price || 0,
                description: item.description || undefined,
              })
            })
          }
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
        let parsedItems: PreviewLineItem[] = []

        if (isCSV) {
          parsedItems = parseCSV(text)
        } else if (isJSON) {
          parsedItems = parseJSON(text)
        }

        setPreviewData(parsedItems)

        if (parsedItems.length === 0) {
          toast.warning('No valid entries found in the file')
        } else {
          toast.success(`Found ${parsedItems.length} line items in the file`)
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
      const result = await tariffsApi.bulkUploadLineItems(selectedFile)

      setUploadResult({
        successful: result.successful || 0,
        failed: result.failed || 0,
        message: result.message,
        created_tariffs: result.created_tariffs,
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
    const csvContent = `tariff_name,code,line_item,price,description
Your Existing Tariff Name,C001,Consultation,500.00,General consultation
Your Existing Tariff Name,C002,Follow-up,300.00,Follow-up consultation
Your Existing Tariff Name,C003,Lab Test,150.00,Basic lab test
Another Existing Tariff,S001,Specialist Consultation,1000.00,Specialist visit
Another Existing Tariff,S002,Diagnostic Procedure,2500.00,Advanced diagnostic`

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'tariff_line_items_template.csv')
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Template downloaded! Replace tariff names with your existing tariff names.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk Upload Tariff Line Items
          </DialogTitle>
          <DialogDescription>
            Upload multiple line items to existing tariffs from CSV or JSON file
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
                    tariff_name,code,line_item,price,description
                    <br />
                    Test,C001,Consultation,500.00,General consultation
                    <br />
                    Test,C002,Follow-up,300.00,Follow-up consultation
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    * "Test" must be the name of an existing tariff in your system
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>Required fields:</strong> tariff_name, code, line_item, price/amount
                      <br />
                      <strong>Optional:</strong> description
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
                id="bulk-upload-file"
              />
              <label htmlFor="bulk-upload-file">
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

                    <div className="max-h-64 overflow-auto border rounded">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left py-2 px-3 font-medium">#</th>
                            <th className="text-left py-2 px-3 font-medium">Tariff Name</th>
                            <th className="text-left py-2 px-3 font-medium">Code</th>
                            <th className="text-left py-2 px-3 font-medium">Line Item</th>
                            <th className="text-right py-2 px-3 font-medium">Price</th>
                            <th className="text-left py-2 px-3 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((item, index) => (
                            <tr key={index} className="border-t hover:bg-muted/50">
                              <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                              <td className="py-2 px-3 font-medium">{item.tariff_name}</td>
                              <td className="py-2 px-3 font-mono text-xs">{item.code}</td>
                              <td className="py-2 px-3">{item.line_item}</td>
                              <td className="py-2 px-3 text-right font-mono">
                                {item.price.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground text-xs">
                                {item.description || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Group by tariff summary */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        previewData.reduce((acc, item) => {
                          acc[item.tariff_name] = (acc[item.tariff_name] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([tariffName, count]) => (
                        <div
                          key={tariffName}
                          className="text-xs px-2 py-1 bg-primary/10 rounded"
                        >
                          <span className="font-medium">{tariffName}:</span> {count} items
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

                    {/* Created/Updated Tariffs */}
                    {uploadResult.created_tariffs && uploadResult.created_tariffs.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Tariffs Updated:</p>
                        <div className="flex flex-wrap gap-2">
                          {uploadResult.created_tariffs.map((tariffId, index) => (
                            <div
                              key={index}
                              className="px-3 py-1.5 bg-primary/10 text-primary rounded-md font-mono text-sm"
                            >
                              {tariffId}
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
                        <div className="max-h-40 overflow-y-auto space-y-1">
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
