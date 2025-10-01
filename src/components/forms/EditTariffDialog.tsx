'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  FileText,
  Calendar,
  DollarSign,
  Building,
  User,
  MapPin,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react'
import { Tariff } from '@/types/tariffs'
import { tariffsApi } from '@/services/tariffsApi'
import { toast } from 'sonner'
import AddLineItemDialog from './AddLineItemDialog'
import AddPayerMappingDialog from './AddPayerMappingDialog'

interface EditTariffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tariff: Tariff
  onUpdate?: () => void
}

export default function EditTariffDialog({
  open,
  onOpenChange,
  tariff: initialTariff,
  onUpdate,
}: EditTariffDialogProps) {
  const [tariff, setTariff] = useState(initialTariff)
  const [addLineItemOpen, setAddLineItemOpen] = useState(false)
  const [addPayerMappingOpen, setAddPayerMappingOpen] = useState(false)
  const [deletingLineItem, setDeletingLineItem] = useState<string | null>(null)
  const [deletingPayer, setDeletingPayer] = useState<string | null>(null)

  useEffect(() => {
    setTariff(initialTariff)
  }, [initialTariff])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-500">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const handleDeleteLineItem = async (lineItemId: string) => {
    if (!confirm('Are you sure you want to delete this line item?')) return

    try {
      setDeletingLineItem(lineItemId)
      await tariffsApi.deleteLineItem(tariff.id, lineItemId)
      toast.success('Line item deleted successfully')

      // Refresh tariff data
      const response = await tariffsApi.getTariffById(tariff.tariff_id)
      setTariff(response.tariff)
      onUpdate?.()
    } catch (error) {
      console.error('Error deleting line item:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete line item')
    } finally {
      setDeletingLineItem(null)
    }
  }

  const handleDeletePayerMapping = async (payerId: string) => {
    if (!confirm('Are you sure you want to remove this payer mapping?')) return

    try {
      setDeletingPayer(payerId)
      await tariffsApi.deletePayerMapping(tariff.id, payerId)
      toast.success('Payer mapping removed successfully')

      // Refresh tariff data
      const response = await tariffsApi.getTariffById(tariff.tariff_id)
      setTariff(response.tariff)
      onUpdate?.()
    } catch (error) {
      console.error('Error removing payer mapping:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove payer mapping')
    } finally {
      setDeletingPayer(null)
    }
  }

  const handleLineItemAdded = async () => {
    // Refresh tariff data
    const response = await tariffsApi.getTariffById(tariff.tariff_id)
    setTariff(response.tariff)
    onUpdate?.()
  }

  const handlePayerMappingAdded = async () => {
    // Refresh tariff data
    const response = await tariffsApi.getTariffById(tariff.tariff_id)
    setTariff(response.tariff)
    onUpdate?.()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6 text-primary" />
                  {tariff.tariff_name}
                </DialogTitle>
                <DialogDescription className="mt-2 font-mono text-sm">
                  {tariff.tariff_id}
                </DialogDescription>
              </div>
              {getStatusBadge(tariff.status)}
            </div>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Basic Info</TabsTrigger>
              <TabsTrigger value="lineitems">
                Line Items ({tariff.line_items.length})
              </TabsTrigger>
              <TabsTrigger value="payers">
                Payers ({tariff.payer_mappings.length})
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Hospital</div>
                      <div className="font-medium">{tariff.hospital_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Hospital ID</div>
                      <div className="font-mono text-sm">{tariff.hospital_id}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Start Date</div>
                      <div className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(tariff.tariff_start_date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">End Date</div>
                      <div className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {tariff.tariff_end_date ? formatDate(tariff.tariff_end_date) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {tariff.document_name && (
                    <div>
                      <div className="text-sm text-muted-foreground">Document</div>
                      <div className="font-medium">{tariff.document_name}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Created By</div>
                      <div className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {tariff.created_by}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Created At</div>
                      <div className="text-sm">{formatDate(tariff.created_at)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Line Items Tab */}
            <TabsContent value="lineitems" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Line Items ({tariff.line_items.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setAddLineItemOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Line Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {tariff.line_items.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-20" />
                      <p>No line items found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setAddLineItemOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Line Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tariff.line_items.map((item, index) => (
                        <div
                          key={item.id || `line-item-${index}`}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono">
                                {item.code}
                              </Badge>
                              <div>
                                <div className="font-medium">{item.line_item}</div>
                                {item.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-semibold text-lg">
                                {formatCurrency(item.price)}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLineItem(item.id)}
                              disabled={deletingLineItem === item.id}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payer Mappings Tab */}
            <TabsContent value="payers" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Payer Mappings ({tariff.payer_mappings.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setAddPayerMappingOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Map Payers
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {tariff.payer_mappings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MapPin className="mx-auto h-12 w-12 mb-4 opacity-20" />
                      <p>No payer mappings found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setAddPayerMappingOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Map First Payer
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tariff.payer_mappings.map((mapping) => (
                        <div
                          key={`${mapping.payer_id}-${mapping.id}`}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{mapping.payer_name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {mapping.payer_id}
                            </div>
                            {(mapping.effective_from || mapping.effective_to) && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {mapping.effective_from && `From: ${formatDate(mapping.effective_from)}`}
                                {mapping.effective_to && ` - To: ${formatDate(mapping.effective_to)}`}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              {mapping.mapped_price && (
                                <div className="font-semibold text-lg">
                                  {formatCurrency(mapping.mapped_price)}
                                </div>
                              )}
                              {getStatusBadge(mapping.status)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePayerMapping(mapping.payer_id)}
                              disabled={deletingPayer === mapping.payer_id}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Line Item Dialog */}
      <AddLineItemDialog
        open={addLineItemOpen}
        onOpenChange={setAddLineItemOpen}
        tariffId={tariff.tariff_id}
        onSuccess={handleLineItemAdded}
      />

      {/* Add Payer Mapping Dialog */}
      <AddPayerMappingDialog
        open={addPayerMappingOpen}
        onOpenChange={setAddPayerMappingOpen}
        tariffId={tariff.tariff_id}
        onSuccess={handlePayerMappingAdded}
      />
    </>
  )
}