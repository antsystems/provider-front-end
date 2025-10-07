'use client'

import { useState } from 'react'
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
  FileText,
  Calendar,
  IndianRupee,
  Building,
  User,
  MapPin,
  X,
} from 'lucide-react'
import { Tariff } from '@/types/tariffs'

interface TariffDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tariff: Tariff
  onUpdate?: () => void
}

export default function TariffDetailsDialog({
  open,
  onOpenChange,
  tariff,
  onUpdate,
}: TariffDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                {tariff.tariff_name}
              </DialogTitle>
              <DialogDescription className="mt-2">
                <div className="font-mono text-sm">{tariff.tariff_id}</div>
              </DialogDescription>
            </div>
            {getStatusBadge(tariff.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
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

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Line Items ({tariff.line_items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tariff.line_items.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No line items found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-sm">Code</th>
                        <th className="text-left py-2 px-3 font-medium text-sm">Item</th>
                        <th className="text-left py-2 px-3 font-medium text-sm">Description</th>
                        <th className="text-right py-2 px-3 font-medium text-sm">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tariff.line_items.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-3 font-mono text-sm">{item.code}</td>
                          <td className="py-2 px-3 font-medium">{item.line_item}</td>
                          <td className="py-2 px-3 text-sm text-muted-foreground">
                            {item.description || '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payer Mappings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Payer Mappings ({tariff.payer_mappings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tariff.payer_mappings.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No payer mappings found
                </div>
              ) : (
                <div className="space-y-3">
                  {tariff.payer_mappings.map((mapping) => (
                    <div
                      key={mapping.payer_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{mapping.payer_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {mapping.payer_id} | Type: {mapping.payer_type}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Mapped: {formatDate(mapping.mapped_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{mapping.payer_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>Edit Tariff</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}