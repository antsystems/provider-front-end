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
import { CreateTDSMappingRequest } from '@/types/tdsMapping'

interface AddTDSMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddTDSMappingDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTDSMappingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateTDSMappingRequest>({
    provider_name: '',
    payer_name: '',
    tds_percentage: 0,
    effective_date: '',
    description: '',
  })
  const [payerNames, setPayerNames] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (open) {
      fetchPayerNames()
    }
  }, [open])

  const fetchPayerNames = async () => {
    try {
      setLoadingData(true)
      const response = await tdsMappingApi.getPayerNames()
      setPayerNames(response.payer_names)
    } catch (error) {
      console.error('Error fetching payer names:', error)
      toast.error('Failed to fetch payer names')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.payer_name.trim()) {
      toast.error('Payer name is required')
      return
    }
    if (formData.tds_percentage <= 0 || formData.tds_percentage > 100) {
      toast.error('TDS percentage must be between 0 and 100')
      return
    }

    try {
      setLoading(true)

      const payload: CreateTDSMappingRequest = {
        provider_name: formData.provider_name,
        payer_name: formData.payer_name,
        tds_percentage: formData.tds_percentage,
      }

      if (formData.effective_date) {
        payload.effective_date = formData.effective_date
      }
      if (formData.description?.trim()) {
        payload.description = formData.description
      }

      await tdsMappingApi.createTDSMapping(payload)

      toast.success('TDS mapping created successfully')
      onOpenChange(false)

      // Reset form
      setFormData({
        provider_name: '',
        payer_name: '',
        tds_percentage: 0,
        effective_date: '',
        description: '',
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating TDS mapping:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create TDS mapping')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      provider_name: '',
      payer_name: '',
      tds_percentage: 0,
      effective_date: '',
      description: '',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add TDS Mapping</DialogTitle>
          <DialogDescription>
            Create a new TDS mapping for provider and payer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Payer Name */}
            <div className="grid gap-2">
              <Label htmlFor="payer_name">
                Payer Name <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.payer_name}
                onValueChange={(value) =>
                  setFormData({ ...formData, payer_name: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  {loadingData ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : payerNames.length === 0 ? (
                    <SelectItem value="empty" disabled>No payers found</SelectItem>
                  ) : (
                    payerNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
              {loading ? 'Creating...' : 'Create TDS Mapping'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
