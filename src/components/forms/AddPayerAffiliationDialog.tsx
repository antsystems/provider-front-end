'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { CreatePayerAffiliationRequest, AvailablePayer } from '@/types/payerAffiliations'
import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import { Building, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  payer_id: z.string().min(1, 'Please select a payer'),
})

type FormData = z.infer<typeof formSchema>

interface AddPayerAffiliationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddPayerAffiliationDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddPayerAffiliationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPayers, setIsLoadingPayers] = useState(false)
  const [availablePayers, setAvailablePayers] = useState<AvailablePayer[]>([])
  const [createdAffiliation, setCreatedAffiliation] = useState<{
    id: string
    payer_name: string
    payer_type: string
    payer_code: string
  } | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payer_id: '',
    },
  })

  // Fetch available payers
  const fetchAvailablePayers = async () => {
    try {
      setIsLoadingPayers(true)
      const response = await payerAffiliationsApi.getAvailablePayers()
      setAvailablePayers(response.payers.filter(p => p.status === 'active'))
    } catch (error) {
      console.error('Error fetching available payers:', error)
      toast.error('Failed to load available payers')
    } finally {
      setIsLoadingPayers(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchAvailablePayers()
    }
  }, [open])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setCreatedAffiliation(null)

    try {
      const selectedPayer = availablePayers.find(p => p.id === data.payer_id)
      if (!selectedPayer) {
        throw new Error('Selected payer not found')
      }

      const affiliationData: CreatePayerAffiliationRequest = {
        payer_name: selectedPayer.name,
      }

      const response = await payerAffiliationsApi.createPayerAffiliation(affiliationData)

      setCreatedAffiliation(response.affiliation)
      toast.success(`Payer affiliation with "${response.affiliation.payer_name}" created successfully`)

      // Reset form after successful creation
      form.reset()
      onSuccess?.()

    } catch (error) {
      console.error('Error creating payer affiliation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create payer affiliation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setCreatedAffiliation(null)
    onOpenChange(false)
  }

  const handleContinue = () => {
    setCreatedAffiliation(null)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Add Payer Affiliation
          </DialogTitle>
          <DialogDescription>
            Create a new payer affiliation for your hospital. Only Hospital Admins can perform this action.
          </DialogDescription>
        </DialogHeader>

        {createdAffiliation ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Success!</strong> Payer affiliation created successfully.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 border rounded-lg bg-green-50/50">
              <h4 className="font-medium text-green-800">Affiliation Details:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Affiliation ID:</span>
                  <div className="font-mono font-medium">{createdAffiliation.id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Payer Name:</span>
                  <div className="font-medium">{createdAffiliation.payer_name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Payer Type:</span>
                  <div className="font-medium">{createdAffiliation.payer_type}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Payer Code:</span>
                  <div className="font-mono font-medium">{createdAffiliation.payer_code}</div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleContinue}>
                Create Another
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> Only Hospital Admins can create payer affiliations.
                    The payer must exist in the system before creating an affiliation.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="payer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Payer *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading || isLoadingPayers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              isLoadingPayers
                                ? "Loading payers..."
                                : "Select a payer to affiliate with"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingPayers ? (
                            <SelectItem value="" disabled>
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading payers...
                              </div>
                            </SelectItem>
                          ) : availablePayers.length === 0 ? (
                            <SelectItem value="" disabled>
                              No payers available
                            </SelectItem>
                          ) : (
                            availablePayers.map((payer) => (
                              <SelectItem key={payer.id} value={payer.id}>
                                <div>
                                  <div className="font-medium">{payer.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {payer.type} • Code: {payer.code}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Affiliation'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}