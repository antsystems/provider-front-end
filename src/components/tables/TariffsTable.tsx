'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, FileText, Calendar, IndianRupee, Plus, Upload } from 'lucide-react'
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
import { Tariff } from '@/types/tariffs'

interface TariffsTableProps {
  tariffs: Tariff[]
  loading?: boolean
  onView?: (tariff: Tariff) => void
  onAddClick?: () => void
  onBulkUploadClick?: () => void
}

export function TariffsTable({
  tariffs,
  loading,
  onView,
  onAddClick,
  onBulkUploadClick
}: TariffsTableProps) {

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'dd MMM yyyy')
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
    )
  }

  const columns: ColumnDef<Tariff>[] = [
    {
      accessorKey: 'tariff_id',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 hover:bg-transparent"
        >
          Tariff ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">{row.getValue('tariff_id')}</div>
      ),
      meta: {
        displayName: 'Tariff ID'
      }
    },
    {
      accessorKey: 'tariff_name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 hover:bg-transparent"
        >
          Tariff Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-primary/10">
            <FileText className="h-3 w-3 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">
              {row.getValue('tariff_name')}
            </div>
            {row.original.document_name && (
              <div className="text-xs text-muted-foreground">{row.original.document_name}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Created by: {row.original.created_by_name || 'Unknown'}
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'tariff_start_date',
      header: 'Valid Period',
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {formatDate(row.getValue('tariff_start_date'))}
          </div>
          {row.original.tariff_end_date && (
            <div className="text-xs text-muted-foreground">
              to {formatDate(row.original.tariff_end_date)}
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'line_items',
      header: 'Line Items',
      cell: ({ row }) => {
        const lineItems = row.getValue('line_items') as any[]
        return <Badge variant="outline">{lineItems?.length || 0} items</Badge>
      }
    },
    {
      accessorKey: 'payer_mappings',
      header: 'Payer Mappings',
      cell: ({ row }) => {
        const payerMappings = row.getValue('payer_mappings') as any[]
        return <Badge variant="outline">{payerMappings?.length || 0} mappings</Badge>
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status'))
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const tariff = row.original
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tariff.tariff_id)}>
                Copy Tariff ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tariff.tariff_name)}>
                Copy Tariff Name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onView?.(tariff)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View/Edit
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
          <p className="text-gray-500">Loading tariffs...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with Add Tariff Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={onAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Tariff
            </Button>
            <Button onClick={onBulkUploadClick} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={tariffs}
          searchKey="tariff_name"
          searchPlaceholder="Search by tariff name..."
          showColumnToggle={true}
          showPagination={true}
          loading={loading}
          initialColumnVisibility={{
            tariff_id: false
          }}
        />
      </div>
    </>
  )
}

export default TariffsTable
