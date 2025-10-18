'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, FileText, Calendar, IndianRupee, Plus, Upload, Building2, Shield } from 'lucide-react'
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
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium">
            ● Active
          </Badge>
        )
      case 'inactive':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 border border-gray-200">
            ○ Inactive
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {status}
          </Badge>
        )
    }
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
      cell: ({ row }) => {
        const startDate = new Date(row.getValue('tariff_start_date'))
        const endDate = row.original.tariff_end_date ? new Date(row.original.tariff_end_date) : null
        const now = new Date()
        
        // Determine validity status
        let statusClass = ''
        let statusIcon = null
        
        if (!endDate) {
          // No end date - ongoing
          statusClass = startDate > now ? 'text-blue-600' : 'text-emerald-600'
          statusIcon = startDate > now ? '◆' : '●'
        } else if (now < startDate) {
          // Future tariff
          statusClass = 'text-blue-600'
          statusIcon = '◆'
        } else if (now > endDate) {
          // Expired tariff
          statusClass = 'text-gray-500'
          statusIcon = '○'
        } else {
          // Currently active
          statusClass = 'text-emerald-600'
          statusIcon = '●'
        }

        return (
          <div className="flex items-start gap-2">
            <div className={`${statusClass} mt-1`}>{statusIcon}</div>
            <div>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className={`h-3 w-3 ${statusClass}`} />
                {formatDate(row.getValue('tariff_start_date'))}
              </div>
              {row.original.tariff_end_date && (
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span className="opacity-50">until</span> {formatDate(row.original.tariff_end_date)}
                </div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'payer_mappings',
      header: 'Payer Mappings',
      cell: ({ row }) => {
        const payerMappings = row.getValue('payer_mappings') as any[]
        const tpaCount = payerMappings?.filter(p => p.payer_type === 'TPA').length || 0
        const insuranceCount = payerMappings?.filter(p => p.payer_type === 'Insurance Company').length || 0
        const otherCount = payerMappings?.filter(p => p.payer_type !== 'TPA' && p.payer_type !== 'Insurance Company').length || 0

        // Check if any TPA has affiliated insurance companies
        const hasTPARelationships = payerMappings?.some(p =>
          p.payer_type === 'TPA' &&
          p.affiliated_insurance_companies &&
          p.affiliated_insurance_companies.length > 0
        ) || false

        return (
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant="outline" 
              className={`text-xs font-medium ${payerMappings?.length ? 'bg-gray-50' : ''}`}
            >
              {payerMappings?.length || 0} total
            </Badge>
            {tpaCount > 0 && (
              <Badge 
                variant="default" 
                className="bg-blue-50 text-blue-700 border border-blue-200 text-xs flex items-center gap-1 font-medium"
              >
                <Building2 className="h-3 w-3" />
                {tpaCount} TPA{tpaCount > 1 ? 's' : ''}
              </Badge>
            )}
            {insuranceCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-violet-50 text-violet-700 border border-violet-200 text-xs flex items-center gap-1 font-medium"
              >
                <Shield className="h-3 w-3" />
                {insuranceCount} Ins
              </Badge>
            )}
            {otherCount > 0 && (
              <Badge 
                variant="outline" 
                className="bg-gray-50 text-gray-600 border border-gray-200 text-xs font-medium"
              >
                +{otherCount} other{otherCount > 1 ? 's' : ''}
              </Badge>
            )}
            {hasTPARelationships && (
              <Badge 
                variant="default" 
                className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium"
              >
                <Building2 className="h-3 w-3 mr-1" />
                TPA Links
              </Badge>
            )}
          </div>
        )
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
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/60 focus:bg-muted/60 transition-colors">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary group-focus:text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-0">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(tariff.tariff_id)}
                className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                Copy Tariff ID
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(tariff.tariff_name)}
                className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                Copy Tariff Name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onView?.(tariff)}
                className="flex items-center gap-2 hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
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
          actionButton={
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
          }
        />
      </div>
    </>
  )
}

export default TariffsTable
