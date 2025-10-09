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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { tdsMappingApi } from '@/services/tdsMappingApi'
import { TDSMapping, UpdateTDSMappingRequest } from '@/types/tdsMapping'

interface EditTDSMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapping: TDSMapping
  onSuccess?: () => void
}

export default function EditTDSMappingDialog({
  open,
  onOpenChange,
  mapping,
  onSuccess,
}: EditTDSMappingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateTDSMappingRequest>({
    tds_percentage: mapping.tds_percentage,
    effective_date: mapping.effective_date || '',
    description: mapping.description || '',
    status: mapping.status,
  })

  useEffect(() => {
    setFormData({
      tds_percentage: mapping.tds_percentage,
      effective_date: mapping.effective_date || '',
      description: mapping.description || '',
      status: mapping.status,
    })
  }, [mapping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.tds_percentage && (formData.tds_percentage <= 0 || formData.tds_percentage > 100)) {
      toast.error('TDS percentage must be between 0 and 100')
      return
    }

    try {
      setLoading(true)

      const payload: UpdateTDSMappingRequest = {}

      if (formData.tds_percentage !== mapping.tds_percentage) {
        payload.tds_percentage = formData.tds_percentage
      }
      if (formData.effective_date && formData.effective_date !== mapping.effective_date) {
        payload.effective_date = formData.effective_date
      }
      if (formData.description !== mapping.description) {
        payload.description = formData.description
      }
      if (formData.status !== mapping.status) {
        payload.status = formData.status
      }

      await tdsMappingApi.updateTDSMapping(mapping.id, payload)

      toast.success('TDS mapping updated successfully')
      onOpenChange(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating TDS mapping:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update TDS mapping')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      tds_percentage: mapping.tds_percentage,
      effective_date: mapping.effective_date || '',
      description: mapping.description || '',
      status: mapping.status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit TDS Mapping</DialogTitle>
          <DialogDescription>
            Update TDS mapping for {mapping.payer_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Payer (Read-only) */}
            <div className="grid gap-2">
              <Label>Payer</Label>
              <Input value={mapping.payer_name} disabled />
            </div>

            {/* TDS Percentage */}
            <div className="grid gap-2">
              <Label htmlFor="tds_percentage">
                TDS Percentage <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tds_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Enter TDS percentage"
                value={formData.tds_percentage || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tds_percentage: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            {/* Effective Date */}
            <div className="grid gap-2">
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) =>
                  setFormData({ ...formData, effective_date: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
              {loading ? 'Updating...' : 'Update TDS Mapping'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
