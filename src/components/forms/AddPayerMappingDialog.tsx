'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CreatePayerMappingRequest, AvailablePayer, BulkCreatePayerMappingsRequest } from '@/types/tariffs'
import { tariffsApi } from '@/services/tariffsApi'
import { MapPin, Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const payerMappingSchema = z.object({
  payer_ids: z.array(z.string()).min(1, 'Please select at least one payer'),
})

type PayerMappingFormValues = z.infer<typeof payerMappingSchema>

interface AddPayerMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tariffId: string
  onSuccess?: () => void
}

export default function AddPayerMappingDialog({
  open,
  onOpenChange,
  tariffId,
  onSuccess,
}: AddPayerMappingDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [availablePayers, setAvailablePayers] = useState<AvailablePayer[]>([])
  const [isLoadingPayers, setIsLoadingPayers] = useState(false)
  const [openPayerSelect, setOpenPayerSelect] = useState(false)

  const form = useForm<PayerMappingFormValues>({
    resolver: zodResolver(payerMappingSchema),
    defaultValues: {
      payer_ids: [],
    },
  })

  const selectedPayerIds = form.watch('payer_ids')

  useEffect(() => {
    const fetchPayers = async () => {
      if (!open) return

      try {
        setIsLoadingPayers(true)
        const response = await tariffsApi.getAvailablePayers()
        setAvailablePayers(response.payers.filter(p => p.status === 'active'))
      } catch (error) {
        console.error('Error fetching payers:', error)
        toast.error('Failed to load available payers')
      } finally {
        setIsLoadingPayers(false)
      }
    }

    fetchPayers()
  }, [open])

  const togglePayer = (payerId: string) => {
    const currentIds = form.getValues('payer_ids')
    if (currentIds.includes(payerId)) {
      form.setValue('payer_ids', currentIds.filter(id => id !== payerId))
    } else {
      form.setValue('payer_ids', [...currentIds, payerId])
    }
  }

  const onSubmit = async (values: PayerMappingFormValues) => {
    setIsLoading(true)
    try {
      const selectedPayers = availablePayers.filter(p => values.payer_ids.includes(p.payer_id))

      if (selectedPayers.length === 1) {
        // Single payer mapping
        const createData: CreatePayerMappingRequest = {
          payer_id: selectedPayers[0].payer_id,
          payer_name: selectedPayers[0].payer_name,
          payer_type: selectedPayers[0].payer_type,
        }

        await tariffsApi.addPayerMapping(tariffId, createData)
        toast.success('Payer mapped successfully')
      } else {
        // Bulk payer mapping
        const bulkData: BulkCreatePayerMappingsRequest = {
          payers: selectedPayers.map(p => ({
            payer_id: p.payer_id,
            payer_name: p.payer_name,
            payer_type: p.payer_type,
          })),
        }

        const response = await tariffsApi.bulkAddPayerMappings(tariffId, bulkData)
        toast.success(`${response.successful} payer(s) mapped successfully`)

        if (response.failed > 0) {
          toast.warning(`${response.failed} payer(s) failed to map`)
        }
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error mapping payers:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to map payers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Map Payers to Tariff
          </DialogTitle>
          <DialogDescription>
            Select one or more payers to map to this tariff.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Payer Selection */}
            <FormField
              control={form.control}
              name="payer_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Select Payers *</FormLabel>
                  {isLoadingPayers ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading payers...
                    </div>
                  ) : (
                    <div className="border rounded-lg p-3 max-h-64 overflow-y-auto scrollbar-hide space-y-2">
                      {availablePayers.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          No payers available
                        </div>
                      ) : (
                        availablePayers.map((payer) => (
                          <div
                            key={payer.payer_id}
                            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded"
                          >
                            <Checkbox
                              checked={selectedPayerIds.includes(payer.payer_id)}
                              onCheckedChange={() => togglePayer(payer.payer_id)}
                            />
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => togglePayer(payer.payer_id)}
                            >
                              <div className="font-medium">{payer.payer_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {payer.payer_type} • Code: {payer.payer_code}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  <FormMessage />
                  {selectedPayerIds.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {selectedPayerIds.length} payer(s) selected
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || selectedPayerIds.length === 0}>
                {isLoading ? 'Mapping...' : `Map ${selectedPayerIds.length} Payer(s)`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}