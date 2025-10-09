'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TariffLineItem, UpdateLineItemRequest } from '@/types/tariffs'
import { tariffsApi } from '@/services/tariffsApi'
import { toast } from 'sonner'

interface EditLineItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tariffId: string
  lineItem: TariffLineItem | null
  onSuccess?: () => void
}

export default function EditLineItemDialog({
  open,
  onOpenChange,
  tariffId,
  lineItem,
  onSuccess,
}: EditLineItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateLineItemRequest>({
    code: '',
    line_item: '',
    amount: 0,
    description: '',
  })

  useEffect(() => {
    if (lineItem) {
      setFormData({
        code: lineItem.code || '',
        line_item: lineItem.line_item || '',
        amount: lineItem.amount || 0,
        description: lineItem.description || '',
      })
    }
  }, [lineItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!lineItem) return

    // Validation
    if (!formData.code?.trim()) {
      toast.error('Code is required')
      return
    }
    if (!formData.line_item?.trim()) {
      toast.error('Line item name is required')
      return
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    try {
      setLoading(true)

      // Only send changed fields
      const updateData: UpdateLineItemRequest = {}
      if (formData.code !== lineItem.code) updateData.code = formData.code
      if (formData.line_item !== lineItem.line_item) updateData.line_item = formData.line_item
      if (formData.amount !== lineItem.amount) updateData.amount = formData.amount
      if (formData.description !== lineItem.description) updateData.description = formData.description

      await tariffsApi.updateLineItem(tariffId, lineItem.id, updateData)

      toast.success('Line item updated successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error updating line item:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update line item')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (lineItem) {
      setFormData({
        code: lineItem.code || '',
        line_item: lineItem.line_item || '',
        amount: lineItem.amount || 0,
        description: lineItem.description || '',
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Line Item</DialogTitle>
          <DialogDescription>
            Update the details of this tariff line item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Code */}
            <div className="grid gap-2">
              <Label htmlFor="code">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="e.g., 101"
                value={formData.code || ''}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
            </div>

            {/* Line Item Name */}
            <div className="grid gap-2">
              <Label htmlFor="line_item">
                Line Item Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="line_item"
                placeholder="e.g., Consultation Fee"
                value={formData.line_item || ''}
                onChange={(e) =>
                  setFormData({ ...formData, line_item: e.target.value })
                }
                required
              />
            </div>

            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="amount">
                Amount (INR) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 500"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter description (optional)"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Line Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

