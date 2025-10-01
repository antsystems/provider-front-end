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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BulkAffiliatePayersRequest,
  AvailablePayer,
  BulkAffiliatePayersResponse
} from '@/types/payerAffiliations'
import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import {
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Filter,
  Loader2,
  Search
} from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  selectedPayerIds: z.array(z.string()).min(1, 'Please select at least one payer'),
})

type FormData = z.infer<typeof formSchema>

interface BulkAffiliatePayersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function BulkAffiliatePayersDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkAffiliatePayersDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPayers, setIsLoadingPayers] = useState(false)
  const [availablePayers, setAvailablePayers] = useState<AvailablePayer[]>([])
  const [filteredPayers, setFilteredPayers] = useState<AvailablePayer[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [results, setResults] = useState<BulkAffiliatePayersResponse | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedPayerIds: [],
    },
  })

  const selectedPayerIds = form.watch('selectedPayerIds')

  // Fetch available payers
  const fetchAvailablePayers = async () => {
    try {
      setIsLoadingPayers(true)
      const response = await payerAffiliationsApi.getAvailablePayers()
      setAvailablePayers(response.available_payers.filter(p => p.status === 'active'))
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

  // Filter payers by type and search query
  useEffect(() => {
    let filtered = availablePayers

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(payer => payer.type === typeFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(payer =>
        payer.name.toLowerCase().includes(query) ||
        payer.code.toLowerCase().includes(query) ||
        payer.type.toLowerCase().includes(query)
      )
    }

    setFilteredPayers(filtered)
  }, [availablePayers, typeFilter, searchQuery])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allPayerIds = filteredPayers.map(payer => payer.id)
      form.setValue('selectedPayerIds', allPayerIds)
    } else {
      form.setValue('selectedPayerIds', [])
    }
  }

  const handlePayerSelect = (payerId: string, checked: boolean) => {
    const currentSelected = form.getValues('selectedPayerIds')
    if (checked) {
      form.setValue('selectedPayerIds', [...currentSelected, payerId])
    } else {
      form.setValue('selectedPayerIds', currentSelected.filter(id => id !== payerId))
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setResults(null)

    try {
      const selectedPayers = availablePayers.filter(payer =>
        data.selectedPayerIds.includes(payer.id)
      )

      const bulkData: BulkAffiliatePayersRequest = {
        payer_names: selectedPayers.map(payer => payer.name)
      }

      const response = await payerAffiliationsApi.bulkAffiliatePayersWithNewMethod(bulkData)

      setResults(response)

      if (response.failed_affiliations.length === 0) {
        toast.success(`Successfully affiliated ${response.successful_affiliations.length} payer(s)`)
        onSuccess?.()
      } else {
        toast.warning(`${response.successful_affiliations.length} successful, ${response.failed_affiliations.length} failed`)
      }

    } catch (error) {
      console.error('Error bulk affiliating payers:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to affiliate payers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setResults(null)
    setTypeFilter('all')
    setSearchQuery('')
    onOpenChange(false)
  }

  const handleContinue = () => {
    setResults(null)
    form.reset()
    setSearchQuery('')
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

  const uniquePayerTypes = [...new Set(availablePayers.map(p => p.type))]
  const isAllSelected = filteredPayers.length > 0 && filteredPayers.every(payer => selectedPayerIds.includes(payer.id))
  const isSomeSelected = filteredPayers.some(payer => selectedPayerIds.includes(payer.id))

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Bulk Affiliate Payers
          </DialogTitle>
          <DialogDescription>
            Select multiple payers to affiliate with your hospital at once. Only Hospital Admins can perform this action.
          </DialogDescription>
        </DialogHeader>

        {results ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Bulk affiliation completed!</strong> {results.successful_affiliations.length} successful, {results.failed_affiliations.length} failed.
              </AlertDescription>
            </Alert>

            {/* Successful Affiliations */}
            {results.successful_affiliations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Successful Affiliations ({results.successful_affiliations.length})</span>
                </div>
                <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {results.successful_affiliations.map((affiliation, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{affiliation.payer_name}</span>
                      <div className="flex items-center gap-2">
                        {getPayerTypeBadge(affiliation.payer_type)}
                        <span className="font-mono text-xs text-muted-foreground">
                          {affiliation.affiliation_id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Affiliations */}
            {results.failed_affiliations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Failed Affiliations ({results.failed_affiliations.length})</span>
                </div>
                <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {results.failed_affiliations.map((failure, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{failure.payer_name}</div>
                      <div className="text-red-600 text-xs">{failure.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleContinue}>
                Affiliate More
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
                    Selected payers will be affiliated with your hospital for claims processing.
                  </AlertDescription>
                </Alert>

                {/* Search and Filter */}
                <div className="space-y-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, code, or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Type Filter */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <label className="text-sm font-medium">Filter by Type:</label>
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {uniquePayerTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Badge variant="secondary">
                      {filteredPayers.length} payers
                    </Badge>
                  </div>
                </div>

                {/* Payer Selection */}
                <FormField
                  control={form.control}
                  name="selectedPayerIds"
                  render={() => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Available Payers *</FormLabel>
                        {filteredPayers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                              onCheckedChange={handleSelectAll}
                            />
                            <label className="text-sm">Select All ({filteredPayers.length})</label>
                          </div>
                        )}
                      </div>

                      {isLoadingPayers ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading payers...</span>
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                          {filteredPayers.map((payer) => (
                            <FormField
                              key={payer.id}
                              control={form.control}
                              name="selectedPayerIds"
                              render={() => (
                                <FormItem>
                                  <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50">
                                    <div className="flex items-center gap-3">
                                      <FormControl>
                                        <Checkbox
                                          checked={selectedPayerIds.includes(payer.id)}
                                          onCheckedChange={(checked) =>
                                            handlePayerSelect(payer.id, checked as boolean)
                                          }
                                        />
                                      </FormControl>
                                      <div>
                                        <div className="font-medium">{payer.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                          Code: {payer.code}
                                        </div>
                                      </div>
                                    </div>
                                    {getPayerTypeBadge(payer.type)}
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}

                          {filteredPayers.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                              No payers found for the selected type
                            </div>
                          )}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedPayerIds.length > 0 && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{selectedPayerIds.length} payer(s) selected</span>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || selectedPayerIds.length === 0}
                >
                  {isLoading ? 'Affiliating...' : `Affiliate ${selectedPayerIds.length} Payer(s)`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}