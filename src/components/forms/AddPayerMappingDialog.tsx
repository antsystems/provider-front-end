'use client'

import { useState, useEffect, useCallback } from 'react'
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
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatePayerMappingRequest, BulkCreatePayerMappingsRequest, BulkPayerMappingItem } from '@/types/tariffs'
import { AvailablePayer as PayerAffiliationPayer } from '@/types/payerAffiliations'
import { tariffsApi } from '@/services/tariffsApi'
import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import { MapPin, Building2, Shield, Info } from 'lucide-react'
import { toast } from 'sonner'
import TPARelationshipSelector from './TPARelationshipSelector'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

const payerMappingSchema = z.object({
  payer_ids: z.array(z.string()).min(1, 'Please select at least one payer'),
  enable_tpa_relationships: z.boolean(),
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
  const [availablePayers, setAvailablePayers] = useState<PayerAffiliationPayer[]>([])
  const [isLoadingPayers, setIsLoadingPayers] = useState(false)
  const [tpaRelationships, setTpaRelationships] = useState<Map<string, BulkPayerMappingItem>>(new Map())
  const [affiliatedPayerNames, setAffiliatedPayerNames] = useState<string[]>([])
  const [hasShownAffiliationWarning, setHasShownAffiliationWarning] = useState(false)

  const form = useForm<PayerMappingFormValues>({
    resolver: zodResolver(payerMappingSchema),
    defaultValues: {
      payer_ids: [],
      enable_tpa_relationships: false,
    },
  })

  const selectedPayerIds = form.watch('payer_ids')
  const enableTpaRelationships = form.watch('enable_tpa_relationships')

  // Separate TPAs from other payers
  const tpaPayers = availablePayers.filter(p => p.type === 'TPA')
  const insuranceCompanies = availablePayers.filter(p => p.type === 'Insurance Company')
  const otherPayers = availablePayers.filter(p => p.type !== 'TPA' && p.type !== 'Insurance Company')

  const selectedTPAs = tpaPayers.filter(p => selectedPayerIds.includes(p.auto_id || p.id))
  const selectedOtherPayers = [...insuranceCompanies, ...otherPayers].filter(p => selectedPayerIds.includes(p.auto_id || p.id))

  useEffect(() => {
    const fetchPayers = async () => {
      if (!open) return

      try {
        setIsLoadingPayers(true)
        // Fetch available payers and affiliated list
        const response = await payerAffiliationsApi.getActivePayerAffiliationsForMapping()

        // Show all available payers (not just affiliated ones)
        setAvailablePayers(response.available_payers)
        setAffiliatedPayerNames(response.affiliated_payers)

        // Show info message if no affiliations exist (only once)
        if (response.affiliated_payers.length === 0 && !hasShownAffiliationWarning) {
          setHasShownAffiliationWarning(true)
          toast.info('No payer affiliations found. Consider setting up affiliations in the Payer Affiliations section.', {
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error fetching payers:', error)
        toast.error('Failed to load payers.')
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
      // Remove TPA relationship if exists
      setTpaRelationships(prev => {
        const newMap = new Map(prev)
        newMap.delete(payerId)
        return newMap
      })
    } else {
      form.setValue('payer_ids', [...currentIds, payerId])
    }
  }

  const handleTpaRelationshipChange = useCallback((tpaData: BulkPayerMappingItem) => {
    console.log('handleTpaRelationshipChange called with:', JSON.stringify(tpaData, null, 2))
    setTpaRelationships(prev => {
      const newMap = new Map(prev)
      newMap.set(tpaData.payer_id, tpaData)
      console.log('Updated tpaRelationships map, size:', newMap.size, 'keys:', Array.from(newMap.keys()))
      return newMap
    })
  }, [])

  const onSubmit = async (values: PayerMappingFormValues) => {
    setIsLoading(true)
    try {
      if (values.enable_tpa_relationships && selectedTPAs.length > 0) {
        // Use TPA relationships endpoint
        const payersWithRelationships: BulkPayerMappingItem[] = []

        console.log('=== TPA Relationships Map Debug ===')
        console.log('Map size:', tpaRelationships.size)
        console.log('Map keys:', Array.from(tpaRelationships.keys()))
        console.log('Map values:', Array.from(tpaRelationships.values()))

        // Add TPAs with their relationships
        selectedTPAs.forEach(tpa => {
          const tpaId = tpa.auto_id || tpa.id
          console.log('Looking up TPA with id:', tpaId, 'auto_id:', tpa.auto_id, 'id:', tpa.id)
          const tpaRelationship = tpaRelationships.get(tpaId)
          console.log('Found relationship:', tpaRelationship)

          if (tpaRelationship) {
            payersWithRelationships.push(tpaRelationship)
          } else {
            console.warn('No relationship found for TPA:', tpaId, '- using empty array')
            // TPA without relationships
            payersWithRelationships.push({
              payer_id: tpaId,
              payer_name: tpa.name,
              payer_type: tpa.type,
              affiliated_insurance_companies: [],
            })
          }
        })

        // Add other payers (non-TPA)
        selectedOtherPayers.forEach(payer => {
          payersWithRelationships.push({
            payer_id: payer.auto_id || payer.id,
            payer_name: payer.name,
            payer_type: payer.type,
          })
        })

        const requestPayload = {
          payers: payersWithRelationships,
        }

        // Log the JSON structure for debugging
        console.log('TPA Relationships Payload:', JSON.stringify(requestPayload, null, 2))

        const response = await tariffsApi.bulkAddPayerMappingsWithRelationships(tariffId, requestPayload)

        toast.success(`Successfully mapped payers with TPA relationships`, {
          description: `${response.summary.total_added} total payer(s) added: ${response.summary.tpas_added} TPA(s), ${response.summary.insurance_companies_added} insurance companies, ${response.summary.other_payers_added} others`,
        })
      } else {
        // Use regular bulk mapping endpoint
        const selectedPayers = availablePayers.filter(p => values.payer_ids.includes(p.auto_id || p.id))

        if (selectedPayers.length === 1) {
          // Single payer mapping
          const payer = selectedPayers[0]
          const createData: CreatePayerMappingRequest = {
            payer_id: payer.auto_id || payer.id,
            payer_name: payer.name,
            payer_type: payer.type,
          }

          await tariffsApi.addPayerMapping(tariffId, createData)
          toast.success('Payer mapped successfully')
        } else {
          // Bulk payer mapping
          const bulkData: BulkCreatePayerMappingsRequest = {
            payers: selectedPayers.map(p => ({
              payer_id: p.auto_id || p.id,
              payer_name: p.name,
              payer_type: p.type,
            })),
          }

          const response = await tariffsApi.bulkAddPayerMappings(tariffId, bulkData)
          toast.success(`${response.successful} payer(s) mapped successfully`)

          if (response.failed > 0) {
            toast.warning(`${response.failed} payer(s) failed to map`)
          }
        }
      }

      form.reset()
      setTpaRelationships(new Map())
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
    setTpaRelationships(new Map())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Map Payers to Tariff
          </DialogTitle>
          <DialogDescription>
            Select payers to map to this tariff. Enable TPA relationships to automatically include managed insurance companies.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(90vh-120px)]">
            {/* Scrollable content area */}
            <ScrollArea className="flex-1 overflow-y-auto pr-4">
              <div className="space-y-4 pb-4">
                {/* Enable TPA Relationships Toggle */}
                <FormField
                  control={form.control}
                  name="enable_tpa_relationships"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Enable TPA Relationships
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Automatically include insurance companies managed by selected TPAs
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {enableTpaRelationships && selectedTPAs.length > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Expand each TPA below to select which insurance companies it manages. The system will automatically create mappings for both the TPA and its affiliated insurance companies.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Payer Selection */}
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">
                      All ({availablePayers.length})
                    </TabsTrigger>
                    <TabsTrigger value="tpa">
                      TPAs ({tpaPayers.length})
                    </TabsTrigger>
                    <TabsTrigger value="insurance">
                      Insurance ({insuranceCompanies.length})
                    </TabsTrigger>
                    <TabsTrigger value="other">
                      Others ({otherPayers.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <PayerSelectionList
                        payers={availablePayers}
                        selectedIds={selectedPayerIds}
                        onToggle={togglePayer}
                        isLoading={isLoadingPayers}
                        affiliatedNames={affiliatedPayerNames}
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="tpa" className="mt-4">
                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <PayerSelectionList
                        payers={tpaPayers}
                        selectedIds={selectedPayerIds}
                        onToggle={togglePayer}
                        isLoading={isLoadingPayers}
                        affiliatedNames={affiliatedPayerNames}
                      />
                    </ScrollArea>
                  </TabsContent>

        
                  <TabsContent value="insurance" className="mt-4">
                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <PayerSelectionList
                        payers={insuranceCompanies}
                        selectedIds={selectedPayerIds}
                        onToggle={togglePayer}
                        isLoading={isLoadingPayers}
                        affiliatedNames={affiliatedPayerNames}
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="other" className="mt-4">
                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <PayerSelectionList
                        payers={otherPayers}
                        selectedIds={selectedPayerIds}
                        onToggle={togglePayer}
                        isLoading={isLoadingPayers}
                        affiliatedNames={affiliatedPayerNames}
                      />
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                {selectedPayerIds.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {selectedPayerIds.length} payer(s) selected
                  </div>
                )}

                {/* TPA Relationships Section */}
                {enableTpaRelationships && selectedTPAs.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Configure TPA Relationships
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Select insurance companies managed by each TPA. These will be automatically mapped to the tariff.
                      </p>
                      <div className="space-y-3">
                        {selectedTPAs.map(tpa => (
                          <TPARelationshipSelector
                            key={tpa.auto_id || tpa.id}
                            tpa={tpa}
                            availableInsuranceCompanies={insuranceCompanies}
                            onChange={handleTpaRelationshipChange}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Fixed footer buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t mt-2 bg-background">
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

// Helper component for payer selection list
function PayerSelectionList({
  payers,
  selectedIds,
  onToggle,
  isLoading,
  affiliatedNames = [],
}: {
  payers: PayerAffiliationPayer[]
  selectedIds: string[]
  onToggle: (id: string) => void
  isLoading: boolean
  affiliatedNames?: string[]
}) {
  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading payers...
      </div>
    )
  }

  if (payers.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No payers available in this category
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {payers.map((payer) => {
        const payerId = payer.auto_id || payer.id
        const isAffiliated = affiliatedNames.includes(payer.name)
        return (
          <div
            key={payerId}
            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded"
          >
            <Checkbox
              checked={selectedIds.includes(payerId)}
              onCheckedChange={() => onToggle(payerId)}
            />
            <div
              className="flex-1 cursor-pointer"
              onClick={() => onToggle(payerId)}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{payer.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {payer.type}
                </Badge>
                {isAffiliated && (
                  <Badge variant="default" className="text-xs bg-green-500">
                    Affiliated
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Code: {payer.code}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
