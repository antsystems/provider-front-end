'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CreateTariffRequest, BulkCreatePayerMappingsRequest } from '@/types/tariffs'
import { AvailablePayer } from '@/types/payerAffiliations'
import { tariffsApi } from '@/services/tariffsApi'
import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import { FileText, Calendar, Plus, Trash2, IndianRupee, Info, Building2 } from 'lucide-react'
import { toast } from 'sonner'

const lineItemSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  line_item: z.string().min(1, 'Line item name is required'),
  amount: z.number().min(0, 'Amount must be 0 or greater'),
  description: z.string().optional(),
})

const createTariffSchema = z.object({
  tariff_name: z.string().min(2, 'Tariff name must be at least 2 characters'),
  tariff_id: z.string().min(1, 'Tariff ID is required'),
  tariff_start_date: z.string().min(1, 'Start date is required'),
  tariff_end_date: z.string().optional(),
  document_name: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  payer_ids: z.array(z.string()).optional(),
})

type CreateTariffFormValues = z.infer<typeof createTariffSchema>

interface AddTariffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddTariffDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTariffDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [availablePayers, setAvailablePayers] = useState<AvailablePayer[]>([])
  const [isLoadingPayers, setIsLoadingPayers] = useState(false)

  const form = useForm<CreateTariffFormValues>({
    resolver: zodResolver(createTariffSchema),
    defaultValues: {
      tariff_name: '',
      tariff_id: '',
      tariff_start_date: '',
      tariff_end_date: '',
      document_name: '',
      line_items: [
        {
          code: '',
          line_item: '',
          amount: 0,
          description: '',
        },
      ],
      payer_ids: [],
    },
  })

  // Fetch available payers when dialog opens
  useEffect(() => {
    const fetchPayers = async () => {
      if (!open) return

      try {
        setIsLoadingPayers(true)
        const response = await payerAffiliationsApi.getActivePayerAffiliationsForMapping()
        setAvailablePayers(response.available_payers)
      } catch (error) {
        console.error('Error fetching payers:', error)
      } finally {
        setIsLoadingPayers(false)
      }
    }

    fetchPayers()
  }, [open])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'line_items',
  })

  const onSubmit = async (values: CreateTariffFormValues) => {
    setIsLoading(true)
    try {
      // Step 1: Create the tariff
      const createData: CreateTariffRequest = {
        tariff_name: values.tariff_name,
        tariff_id: values.tariff_id,
        tariff_start_date: values.tariff_start_date,
        tariff_end_date: values.tariff_end_date || undefined,
        document_name: values.document_name || undefined,
        line_items: values.line_items.map(item => ({
          code: item.code,
          line_item: item.line_item,
          amount: item.amount,
          description: item.description || undefined,
        })),
      }

      const tariffResponse = await tariffsApi.createTariff(createData)
      const createdTariffId = tariffResponse.tariff.tariff_id

      // Step 2: Add payer mappings if any were selected
      if (values.payer_ids && values.payer_ids.length > 0) {
        const selectedPayers = availablePayers.filter(p =>
          values.payer_ids!.includes(p.id)
        )

        const bulkData: BulkCreatePayerMappingsRequest = {
          payers: selectedPayers.map(p => ({
            payer_id: p.id, // Use actual payer_id (e.g., MV050925CORP002), not UUID
            payer_name: p.name,
            payer_type: p.type,
          })),
        }

        try {
          const payerResponse = await tariffsApi.bulkAddPayerMappings(createdTariffId, bulkData)
          toast.success(`Tariff created with ${payerResponse.successful} payer(s) mapped`, {
            description: `Tariff "${values.tariff_name}" has been created successfully`,
          })
        } catch (payerError) {
          // Tariff was created but payer mapping failed
          toast.warning('Tariff created, but payer mapping failed', {
            description: 'You can add payers manually in the edit dialog',
          })
        }
      } else {
        toast.success('Tariff created successfully', {
          description: `You can add payer mappings later in the edit dialog`,
        })
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating tariff:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create tariff')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  const handleAddLineItem = () => {
    append({
      code: '',
      line_item: '',
      amount: 0,
      description: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Add New Tariff
          </DialogTitle>
          <DialogDescription>
            Create a new tariff with pricing line items for medical services.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tariff_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tariff Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., General Tariff" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tariff_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tariff ID *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., TAR_GENERAL_001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tariff_start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="date"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tariff_end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="date"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="document_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., General_Tariff_2025.pdf" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Line Items ({fields.length})
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLineItem}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Line Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Line Item {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`line_items.${index}.code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., C001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`line_items.${index}.line_item`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Consultation" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`line_items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-10"
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`line_items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payer Mappings (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Payer Mappings (Optional)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select payers to map to this tariff. You can also add more payers later.
                </p>
              </CardHeader>
              <CardContent>
                {isLoadingPayers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : availablePayers.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No payers available. Set up payer affiliations first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <FormField
                    control={form.control}
                    name="payer_ids"
                    render={() => (
                      <FormItem>
                        <ScrollArea className="h-[200px] rounded-md border p-4">
                          <div className="space-y-2">
                            {availablePayers.map((payer) => (
                              <FormField
                                key={payer.id}
                                control={form.control}
                                name="payer_ids"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={payer.id}
                                      className="flex flex-row items-start space-x-3 space-y-0 p-2 hover:bg-muted/50 rounded-md"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(payer.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), payer.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== payer.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <div className="flex-1">
                                        <FormLabel className="text-sm font-medium cursor-pointer">
                                          {payer.name}
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                          {payer.type} • {payer.code}
                                        </p>
                                      </div>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                        <FormMessage />
                        {form.watch('payer_ids') && form.watch('payer_ids')!.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {form.watch('payer_ids')!.length} payer(s) selected
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Tariff'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}