'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, Building2, Mail, Phone, Plus, Trash2 } from 'lucide-react'
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
import { Department, DEPARTMENT_STATUS_OPTIONS, DEPARTMENT_TYPE_OPTIONS } from '@/types/departments'
import { departmentsApi } from '@/services/departmentsApi'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import DepartmentDetailsDialog from '@/components/forms/DepartmentDetailsDialog'
import AddDepartmentDialog from '@/components/forms/AddDepartmentDialog'
import { toast } from 'sonner'

interface DepartmentsTableProps {
  departments: Department[]
  loading?: boolean
  onView?: (department: Department) => void
  onUpdate?: (department: Department) => void
  onRefresh?: () => void
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    onPageChange: (page: number) => void
  }
}

export function DepartmentsTable({
  departments,
  loading,
  onView,
  onUpdate,
  onRefresh,
  pagination
}: DepartmentsTableProps) {
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const confirmDialog = useConfirmDialog()

  const handleViewDepartment = (department: Department) => {
    setEditingDepartment(department)
    setIsDialogOpen(true)
    onView?.(department)
  }

  const handleUpdateDepartment = (updatedDepartment: Department) => {
    onUpdate?.(updatedDepartment)
    onRefresh?.()
  }

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    confirmDialog.open({
      title: 'Delete Department',
      description: `Are you sure you want to delete "${departmentName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await departmentsApi.deleteDepartment(departmentId)
          toast.success(`Department "${departmentName}" deleted successfully`)
          onRefresh?.()
        } catch (error) {
          console.error('Error deleting department:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to delete department')
        }
      }
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingDepartment(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'dd-MM-yyyy HH:mm:ss')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = DEPARTMENT_STATUS_OPTIONS.find(opt => opt.value === status)
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{statusConfig?.label || status}</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{statusConfig?.label || status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDepartmentTypeBadge = (departmentType: string) => {
    const typeConfig = DEPARTMENT_TYPE_OPTIONS.find(opt => opt.value === departmentType)
    const typeColors = {
      'CLINICAL': 'bg-blue-50 text-blue-700',
      'NON-CLINICAL': 'bg-purple-50 text-purple-700',
      'SUPPORTIVE': 'bg-green-50 text-green-700',
      'AUXILIARY': 'bg-orange-50 text-orange-700',
    }

    return (
      <Badge variant="outline" className={typeColors[departmentType as keyof typeof typeColors] || 'bg-gray-50 text-gray-700'}>
        {typeConfig?.label || departmentType}
      </Badge>
    )
  }

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'department_id',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          Department ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono text-sm font-medium">{row.getValue('department_id')}</div>,
      meta: {
        displayName: 'Department ID'
      }
    },
    {
      accessorKey: 'department_name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          Department Information
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-primary/10">
            <Building2 className="h-3 w-3 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">
              {row.getValue('department_name')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Type: {getDepartmentTypeBadge(row.original.department_type)}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'point_of_contact',
      header: 'Contact Person',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('point_of_contact')}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{row.original.phone_no}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{row.original.email_id}</span>
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
      accessorKey: 'created_at',
      header: 'Created On',
      cell: ({ row }) => {
        const createdTime = row.getValue('created_at') as string
        return <div className="text-muted-foreground">{formatDate(createdTime)}</div>
      },
      meta: {
        displayName: 'Created On'
      }
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Updated',
      cell: ({ row }) => {
        const updatedTime = row.getValue('updated_at') as string
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
        const department = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(department.id)}>
                Copy Department ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(department.department_name)}>
                Copy Department Name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewDepartment(department)} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View/Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteDepartment(department.id, department.department_name)}
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
          <p className="text-gray-500">Loading departments...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with Add Department Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={departments}
          searchKey="department_name"
          searchPlaceholder="Search by department name..."
          showColumnToggle={true}
          showPagination={true}
          initialColumnVisibility={{
            department_id: false,
            created_at: false,
            updated_at: false
          }}
        />

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total items)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Department Details Dialog */}
      <DepartmentDetailsDialog
        department={editingDepartment || undefined}
        onUpdate={handleUpdateDepartment}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      {/* Add Department Dialog */}
      <AddDepartmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  )
}

export default DepartmentsTable