'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PayerAffiliation, UpdatePayerAffiliationRequest, PAYER_AFFILIATION_STATUS_OPTIONS } from '@/types/payerAffiliations'
import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import { Building, Calendar, User, Mail, Code, Tag, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status is required',
  }),
})

type FormData = z.infer<typeof formSchema>

interface PayerAffiliationDetailsDialogProps {
  affiliation?: PayerAffiliation
  onUpdate?: (affiliation: PayerAffiliation) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PayerAffiliationDetailsDialog({
  affiliation,
  onUpdate,
  open,
  onOpenChange,
}: PayerAffiliationDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'active',
    },
  })

  useEffect(() => {
    if (affiliation) {
      form.reset({
        status: affiliation.status,
      })
    }
  }, [affiliation, form])

  const onSubmit = async (data: FormData) => {
    if (!affiliation) return

    setIsLoading(true)

    try {
      const updateData: UpdatePayerAffiliationRequest = {
        status: data.status,
      }

      const response = await payerAffiliationsApi.updatePayerAffiliation(affiliation.id, updateData)

      // Update the affiliation object with new data
      const updatedAffiliation: PayerAffiliation = {
        ...affiliation,
        status: response.affiliation.status as 'active' | 'inactive',
        updated_on: response.affiliation.updated_on,
      }

      onUpdate?.(updatedAffiliation)
      setIsEditing(false)
      toast.success('Payer affiliation updated successfully')

    } catch (error) {
      console.error('Error updating payer affiliation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update payer affiliation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsEditing(false)
    if (affiliation) {
      form.reset({
        status: affiliation.status,
      })
    }
    onOpenChange(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'dd-MM-yyyy HH:mm:ss')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = PAYER_AFFILIATION_STATUS_OPTIONS.find(opt => opt.value === status)
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{statusConfig?.label || status}</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{statusConfig?.label || status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPayerTypeBadge = (payerType: string) => {
    const typeColors = {
      'TPA': 'bg-blue-50 text-blue-700',
      'Insurance': 'bg-purple-50 text-purple-700',
      'Government': 'bg-green-50 text-green-700',
      'Corporate': 'bg-orange-50 text-orange-700',
      'Other': 'bg-gray-50 text-gray-700'
    }

    return (
      <Badge variant="outline" className={typeColors[payerType as keyof typeof typeColors] || 'bg-gray-50 text-gray-700'}>
        {payerType}
      </Badge>
    )
  }

  if (!affiliation) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Payer Affiliation Details
          </DialogTitle>
          <DialogDescription>
            View and manage payer affiliation information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium border-b pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code className="h-4 w-4" />
                  Affiliation ID
                </div>
                <div className="font-mono text-sm">{affiliation.id}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  Payer Name
                </div>
                <div className="font-medium">{affiliation.payer_name}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Payer Code
                </div>
                <div className="font-mono text-sm">{affiliation.payer_code}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Payer Type
                </div>
                <div>{getPayerTypeBadge(affiliation.payer_type)}</div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="space-y-4">
            <h4 className="font-medium border-b pb-2">Status Management</h4>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYER_AFFILIATION_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-muted-foreground">{option.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('status') === 'inactive' && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warning:</strong> Setting the affiliation to inactive will prevent it from being used for claims processing.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading} size="sm">
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Current Status</div>
                  <div>{getStatusBadge(affiliation.status)}</div>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                  Edit Status
                </Button>
              </div>
            )}
          </div>

          {/* Audit Information */}
          <div className="space-y-4">
            <h4 className="font-medium border-b pb-2">Audit Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Created By
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">{affiliation.created_by_email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created On
                </div>
                <div className="text-sm">{formatDate(affiliation.created_on)}</div>
              </div>

              {affiliation.updated_on && (
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Last Updated
                  </div>
                  <div className="text-sm">{formatDate(affiliation.updated_on)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}