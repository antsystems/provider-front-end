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
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
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
  const confirmDialog = useConfirmDialog()

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
    confirmDialog.open({
      title: 'Delete Payer Affiliation',
      description: `Are you sure you want to delete the affiliation with "${payerName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await payerAffiliationsApi.deletePayerAffiliation(affiliationId)
          toast.success(`Payer affiliation with "${payerName}" deleted successfully`)
          onRefresh?.()
        } catch (error) {
          console.error('Error deleting payer affiliation:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to delete payer affiliation')
        }
      }
    })
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
      'Insurance Company': 'bg-purple-50 text-purple-700',
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
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} 
          className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors"
        >
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
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} 
          className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          Payer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">
              {row.getValue('payer_name')}
            </div>
            <div className="text-sm text-muted-foreground">
              Code: {row.original.payer_code}
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'payer_type',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} 
          className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          Payer Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => getPayerTypeBadge(row.getValue('payer_type'))
    },
    {
      accessorKey: 'payer_id',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} 
          className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          Payer ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue('payer_id')}</div>
      )
    },
    {
      accessorKey: 'affiliated_by_email',
      header: 'Affiliated By',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3 text-gray-400" />
          {row.getValue('affiliated_by_email')}
        </div>
      )
    },
    {
      accessorKey: 'affiliated_at',
      header: 'Affiliated On',
      cell: ({ row }) => {
        const affiliatedTime = row.getValue('affiliated_at') as string
        return <div className="text-muted-foreground">{formatDate(affiliatedTime)}</div>
      },
      meta: {
        displayName: 'Affiliated On'
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
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/60 focus:bg-muted/60 transition-colors">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary group-focus:text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-0">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(affiliation.id)}
                className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                Copy Affiliation ID
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(affiliation.payer_name)}
                className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                Copy Payer Name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleViewAffiliation(affiliation)} 
                className="flex items-center gap-2 hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                <Eye className="h-4 w-4" />
                View/Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteAffiliation(affiliation.id, affiliation.payer_name)}
                className="flex items-center gap-2 text-red-600 hover:text-red-600 focus:text-red-600 hover:bg-red-50/50 focus:bg-red-50/50"
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

        <DataTable
          columns={columns}
          data={affiliations}
          searchKey="payer_name"
          searchPlaceholder="Search by payer name..."
          showColumnToggle={true}
          showPagination={true}
          loading={loading}
          initialColumnVisibility={{
            id: false,
            created_on: false,
            affiliated_at: false,
          }}
          actionButton={  
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
          }
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