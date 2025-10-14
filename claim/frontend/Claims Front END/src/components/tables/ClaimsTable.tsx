'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Trash2 } from 'lucide-react'
import type { Claim } from '@/types/claims'

interface ClaimsTableProps {
  claims: any[] // Accept full claim objects
  onViewDetails?: (claimId: string) => void
  onDelete?: (claimId: string) => void
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-100'
    case 'settled':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatAmount = (amount: number) => {
  if (!amount) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

export default function ClaimsTable({ claims, onViewDetails, onDelete }: ClaimsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Claim ID</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Claim Type</TableHead>
            <TableHead>Claimed Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No claims found
              </TableCell>
            </TableRow>
          ) : (
            claims.map((claim) => (
              <TableRow key={claim.claim_id}>
                <TableCell className="font-mono text-sm">
                  {claim.claim_id?.substring(0, 8)}...
                </TableCell>
                <TableCell className="font-medium">
                  {claim.patient_details?.patient_name || claim.patient_name || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {claim.provider_details?.claim_type || claim.claim_type || '-'}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatAmount(claim.bill_details?.claimed_amount || claim.claimed_amount || 0)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(claim.claim_status)}>
                    {claim.claim_status || 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(claim.submission_date)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(claim.claim_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(claim.claim_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
