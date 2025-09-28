'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, Building, Mail, Plus, Trash2, Users } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { PayerAffiliation, PAYER_AFFILIATION_STATUS_OPTIONS } from '@/types/payerAffiliations'
import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import PayerAffiliationDetailsDialog from '@/components/forms/PayerAffiliationDetailsDialog'
import AddPayerAffiliationDialog from '@/components/forms/AddPayerAffiliationDialog'
import BulkAffiliatePayersDialog from '@/components/forms/BulkAffiliatePayersDialog'
import { toast } from 'sonner'

interface PayerAffiliationsTableProps {
  affiliations: PayerAffiliation[]
  loading?: boolean
  onView?: (affiliation: PayerAffiliation) => void
  onUpdate?: (affiliation: PayerAffiliation) => void
  onRefresh?: () => void
}

export function PayerAffiliationsTable({ affiliations, loading, onView, onUpdate, onRefresh }: PayerAffiliationsTableProps) {
  const [editingAffiliation, setEditingAffiliation] = useState<PayerAffiliation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)

  const handleViewAffiliation = (affiliation: PayerAffiliation) => {
    setEditingAffiliation(affiliation)
    setIsDialogOpen(true)
    onView?.(affiliation)
  }

  const handleUpdateAffiliation = (updatedAffiliation: PayerAffiliation) => {
    onUpdate?.(updatedAffiliation)
    onRefresh?.()
  }

  const handleDeleteAffiliation = async (affiliationId: string, payerName: string) => {
    if (!confirm(`Are you sure you want to delete the affiliation with "${payerName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await payerAffiliationsApi.deletePayerAffiliation(affiliationId)
      toast.success(`Payer affiliation with "${payerName}" deleted successfully`)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting payer affiliation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete payer affiliation')
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingAffiliation(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'dd-MM-yyyy HH:mm:ss')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = PAYER_AFFILIATION_STATUS_OPTIONS.find(opt => opt.value === status)
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{statusConfig?.label || status}</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{statusConfig?.label || status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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

  const columns: ColumnDef<PayerAffiliation>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          Affiliation ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono text-sm font-medium">{row.getValue('id')}</div>,
      meta: {
        displayName: 'Affiliation ID'
      }
    },
    {
      accessorKey: 'payer_name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          Payer Information
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-primary/10">
            <Building className="h-3 w-3 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">
              {row.getValue('payer_name')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Code: {row.original.payer_code}</span>
              {getPayerTypeBadge(row.original.payer_type)}
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status'))
    },
    {
      accessorKey: 'created_by_email',
      header: 'Created By',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3 text-gray-400" />
          {row.getValue('created_by_email')}
        </div>
      )
    },
    {
      accessorKey: 'created_on',
      header: 'Created On',
      cell: ({ row }) => {
        const createdTime = row.getValue('created_on') as string
        return <div className="text-muted-foreground">{formatDate(createdTime)}</div>
      },
      meta: {
        displayName: 'Created On'
      }
    },
    {
      accessorKey: 'updated_on',
      header: 'Last Updated',
      cell: ({ row }) => {
        const updatedTime = row.getValue('updated_on') as string
        return <div className="text-muted-foreground">{formatDate(updatedTime)}</div>
      },
      meta: {
        displayName: 'Last Updated'
      }
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const affiliation = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-0">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(affiliation.id)}>
                Copy Affiliation ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(affiliation.payer_name)}>
                Copy Payer Name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewAffiliation(affiliation)} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View/Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteAffiliation(affiliation.id, affiliation.payer_name)}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading payer affiliations...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with Add Affiliation Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Single Affiliation
            </Button>
            <Button onClick={() => setIsBulkDialogOpen(true)} variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Bulk Affiliate Payers
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={affiliations}
          searchKey="payer_name"
          searchPlaceholder="Search by payer name..."
          showColumnToggle={true}
          showPagination={true}
          initialColumnVisibility={{
            id: false,
            created_on: false,
            updated_on: false
          }}
        />
      </div>

      {/* Affiliation Details Dialog */}
      <PayerAffiliationDetailsDialog
        affiliation={editingAffiliation || undefined}
        onUpdate={handleUpdateAffiliation}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      {/* Add Affiliation Dialog */}
      <AddPayerAffiliationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={onRefresh}
      />

      {/* Bulk Affiliate Payers Dialog */}
      <BulkAffiliatePayersDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  )
}

export default PayerAffiliationsTable