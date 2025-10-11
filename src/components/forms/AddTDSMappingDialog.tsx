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
import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import { CreateTDSMappingRequest } from '@/types/tdsMapping'
import { useAuth } from '@/contexts/AuthContext'

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
  const { user } = useAuth()
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
      // Fetch only affiliated payers for the hospital
      const response = await payerAffiliationsApi.getActivePayerAffiliations()
      console.log('Fetched affiliated payers:', response.affiliations)
      
      // Extract payer names from affiliations
      const names = response.affiliations.map(affiliation => affiliation.payer_name)
      console.log('Available payer names for TDS mapping:', names)
      
      setPayerNames(names)
      
      if (names.length === 0) {
        toast.warning('No affiliated payers found. Please set up payer affiliations first in the Payer Affiliations page.')
      }
    } catch (error) {
      console.error('Error fetching affiliated payer names:', error)
      toast.error('Failed to load affiliated payers. Please ensure you have payer affiliations set up.')
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

      // Get hospital name from user context
      const hospitalName = user?.entity_assignments?.hospitals?.[0]?.name || user?.assignedEntity?.name || ''
      
      if (!hospitalName) {
        toast.error('Unable to determine hospital. Please ensure you are logged in properly.')
        setLoading(false)
        return
      }

      const payload: CreateTDSMappingRequest = {
        provider_name: hospitalName,
        payer_name: formData.payer_name,
        tds_percentage: formData.tds_percentage,
      }

      if (formData.effective_date) {
        payload.effective_date = formData.effective_date
      }
      if (formData.description?.trim()) {
        payload.description = formData.description
      }

      console.log('Creating TDS mapping with payload:', payload)

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
