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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  IndianRupee,
  Building,
  User,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Shield,
  X,
} from 'lucide-react'
import { Tariff } from '@/types/tariffs'
import { tariffsApi } from '@/services/tariffsApi'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
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
  const [editingLineItem, setEditingLineItem] = useState<any | null>(null)
  const [deletingLineItem, setDeletingLineItem] = useState<string | null>(null)
  const [deletingPayer, setDeletingPayer] = useState<string | null>(null)
  const [deletingTariff, setDeletingTariff] = useState(false)
  const confirmDialog = useConfirmDialog()

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
    confirmDialog.open({
      title: 'Delete Line Item',
      description: 'Are you sure you want to delete this line item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          setDeletingLineItem(lineItemId)
          await tariffsApi.deleteLineItem(tariff.tariff_id, lineItemId)
          toast.success('Line item deleted successfully')

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
    })
  }

  const handleDeletePayerMapping = async (payerId: string) => {
    confirmDialog.open({
      title: 'Remove Payer Mapping',
      description: 'Are you sure you want to remove this payer mapping? This action cannot be undone.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          setDeletingPayer(payerId)
          await tariffsApi.deletePayerMapping(tariff.tariff_id, payerId)
          toast.success('Payer mapping removed successfully')

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
    })
  }

  const handleLineItemAdded = async () => {
    const response = await tariffsApi.getTariffById(tariff.tariff_id)
    setTariff(response.tariff)
    onUpdate?.()
  }

  const handlePayerMappingAdded = async () => {
    const response = await tariffsApi.getTariffById(tariff.tariff_id)
    setTariff(response.tariff)
    onUpdate?.()
  }

  const handleLineItemUpdated = async () => {
    const response = await tariffsApi.getTariffById(tariff.tariff_id)
    setTariff(response.tariff)
    setEditingLineItem(null)
    onUpdate?.()
  }

  const handleDeleteTariff = async () => {
    confirmDialog.open({
      title: 'Delete Tariff',
      description: `Are you sure you want to delete the tariff "${tariff.tariff_name}"? This will permanently delete the tariff along with all its line items and payer mappings. This action cannot be undone.`,
      confirmText: 'Delete Tariff',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          setDeletingTariff(true)
          await tariffsApi.deleteTariff(tariff.tariff_id)
          toast.success(`Tariff "${tariff.tariff_name}" deleted successfully`)

          onOpenChange(false)
          onUpdate?.()
        } catch (error) {
          console.error('Error deleting tariff:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to delete tariff')
        } finally {
          setDeletingTariff(false)
        }
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <FileText className="h-6 w-6 text-primary" />
              {tariff.tariff_name}
              {getStatusBadge(tariff.status)}
            </DialogTitle>
            <DialogDescription className="mt-2 font-mono text-sm">
              {tariff.tariff_id}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">
                <Building className="h-4 w-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="lineitems">
                <IndianRupee className="h-4 w-4 mr-2" />
                Line Items ({tariff.line_items.length})
              </TabsTrigger>
              <TabsTrigger value="payers">
                <MapPin className="h-4 w-4 mr-2" />
                Payers ({tariff.payer_mappings.length})
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="info" className="space-y-4 mt-4">
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
            <TabsContent value="lineitems" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IndianRupee className="h-5 w-5" />
                      Line Items ({tariff.line_items.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setAddLineItemOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {tariff.line_items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <IndianRupee className="mx-auto h-12 w-12 mb-3 opacity-30" />
                      <p>No line items found</p>
                    </div>
                  ) : editingLineItem ? (
                    /* Edit Form */
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Edit2 className="h-4 w-4" />
                          Edit Line Item
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingLineItem(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          const updatedItem = {
                            ...editingLineItem,
                            code: formData.get('code') as string,
                            line_item: formData.get('line_item') as string,
                            amount: parseFloat(formData.get('amount') as string),
                            description: formData.get('description') as string,
                          }

                          try {
                            await tariffsApi.updateLineItem(
                              tariff.tariff_id,
                              editingLineItem.code,
                              updatedItem
                            )
                            toast.success('Line item updated successfully')
                            handleLineItemUpdated()
                          } catch (error) {
                            console.error('Error updating line item:', error)
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : 'Failed to update line item'
                            )
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="code">Code *</Label>
                            <Input
                              id="code"
                              name="code"
                              defaultValue={editingLineItem.code}
                              required
                              className="font-mono"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="line_item">Item Name *</Label>
                            <Input
                              id="line_item"
                              name="line_item"
                              defaultValue={editingLineItem.line_item}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (₹) *</Label>
                            <Input
                              id="amount"
                              name="amount"
                              type="number"
                              step="0.01"
                              defaultValue={editingLineItem.amount}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              name="description"
                              defaultValue={editingLineItem.description}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingLineItem(null)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Update</Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* Table View */
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium text-sm">Code</th>
                            <th className="text-left py-2 px-3 font-medium text-sm">Item</th>
                            <th className="text-left py-2 px-3 font-medium text-sm">Description</th>
                            <th className="text-right py-2 px-3 font-medium text-sm">Amount</th>
                            <th className="text-right py-2 px-3 font-medium text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tariff.line_items.map((item, index) => (
                            <tr key={item.id || index} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-3 font-mono text-sm">{item.code}</td>
                              <td className="py-2 px-3 font-medium">{item.line_item}</td>
                              <td className="py-2 px-3 text-sm text-muted-foreground">
                                {item.description || '-'}
                              </td>
                              <td className="py-2 px-3 text-right font-semibold">
                                {formatCurrency(item.amount)}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingLineItem(item)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLineItem(item.line_item)}
                                    disabled={deletingLineItem === item.id}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payer Mappings Tab */}
            <TabsContent value="payers" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Payer Mappings ({tariff.payer_mappings.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setAddPayerMappingOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Map Payers
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {tariff.payer_mappings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="mx-auto h-12 w-12 mb-3 opacity-30" />
                      <p>No payer mappings found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tariff.payer_mappings.map((mapping) => (
                        <div
                          key={mapping.payer_id}
                          className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {mapping.payer_type === 'TPA' && (
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                              )}
                              {mapping.payer_type === 'Insurance Company' && (
                                <Shield className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-medium">{mapping.payer_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {mapping.payer_type}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {mapping.payer_id}
                            </div>
                            {mapping.managed_by_tpa && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Managed by: {mapping.managed_by_tpa.payer_name}
                              </div>
                            )}
                            {mapping.affiliated_insurance_companies &&
                             mapping.affiliated_insurance_companies.length > 0 && (
                              <div className="mt-2 pl-4 border-l-2 space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Manages {mapping.affiliated_insurance_companies.length} insurance{' '}
                                  {mapping.affiliated_insurance_companies.length === 1 ? 'company' : 'companies'}
                                </div>
                                {mapping.affiliated_insurance_companies.map((ins) => (
                                  <div key={ins.payer_id} className="text-xs text-muted-foreground">
                                    • {ins.payer_name}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              Mapped: {formatDate(mapping.mapped_at)}
                            </div>
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
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-between gap-2 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDeleteTariff}
              disabled={deletingTariff}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deletingTariff ? 'Deleting...' : 'Delete Tariff'}
            </Button>
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
