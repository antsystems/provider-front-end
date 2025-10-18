'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, Users, Mail, Phone, User, Trash2, Plus, Upload } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { Staff } from '@/types/staff'
import { staffApi } from '@/services/staffApi'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import StaffDetailsDialog from '@/components/forms/StaffDetailsDialog'
import AddStaffDialog from '@/components/forms/AddStaffDialog'
import BulkUploadStaffDialog from '@/components/forms/BulkUploadStaffDialog'
import { toast } from 'sonner'

interface StaffTableProps {
  staff: Staff[]
  loading?: boolean
  onView?: (staff: Staff) => void
  onUpdate?: (staff: Staff) => void
  onDelete?: (staffId: string) => void
  onRefresh?: () => void
}

export function StaffTable({ staff, loading, onView, onUpdate, onDelete, onRefresh }: StaffTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const confirmDialog = useConfirmDialog()

  const handleViewStaff = (staff: Staff) => {
    setEditingStaff(staff)
    setIsDialogOpen(true)
    onView?.(staff)
  }

  const handleUpdateStaff = (updatedStaff: Staff) => {
    onUpdate?.(updatedStaff)
    onRefresh?.()
  }

  const handleDeleteStaff = async (staffId: string) => {
    const staffMember = staff.find(s => s.staff_id === staffId)
    const staffName = staffMember ? `${staffMember.staff_name}` : 'this staff member'

    confirmDialog.open({
      title: 'Delete Staff Member',
      description: `Are you sure you want to delete ${staffName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await staffApi.deleteStaff(staffId)
          toast.success('Staff member deleted successfully')
          onDelete?.(staffId)
          onRefresh?.()
        } catch (error) {
          console.error('Error deleting staff member:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to delete staff member')
        }
      }
    })
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return

    confirmDialog.open({
      title: 'Delete Staff Members',
      description: `Are you sure you want to delete ${selectedRows.length} staff member(s)? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await Promise.all(selectedRows.map(id => staffApi.deleteStaff(id)))
          toast.success(`${selectedRows.length} staff member(s) deleted successfully`)
          setSelectedRows([])
          onRefresh?.()
        } catch (error) {
          console.error('Error deleting staff members:', error)
          toast.error('Failed to delete some staff members')
        }
      }
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingStaff(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'dd-MM-yyyy HH:mm:ss')
  }

  const columns: ColumnDef<Staff>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
          }}
          onChange={(e) => {
            table.toggleAllPageRowsSelected(!!e.target.checked)
            if (e.target.checked) {
              setSelectedRows(table.getRowModel().rows.map(r => r.original.staff_id))
            } else setSelectedRows([])
          }}
          className="w-4 h-4 rounded border border-border"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.original.staff_id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedRows(prev => [...prev, row.original.staff_id])
            else setSelectedRows(prev => prev.filter(id => id !== row.original.staff_id))
          }}
          className="w-4 h-4 rounded border border-border"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'staff_id',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          Staff ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono text-sm font-medium">{row.getValue('staff_id')}</div>,
      meta: {
        displayName: 'Staff ID'
      }
    },
    {
      accessorKey: 'staff_name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors">
          Staff Member
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-primary/10">
            <Users className="h-3 w-3 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">
              {row.getValue('staff_name')}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {row.original.email}
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'department_name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors">
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          {row.getValue('department_name')}
        </Badge>
      )
    },
    {
      accessorKey: 'contact_number',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors">
          Contact
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3 text-gray-400" />
          {row.getValue('contact_number')}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge
            variant={status === 'active' ? 'default' : 'secondary'}
            className={status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
          >
            {status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'UpdatedTime',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors">
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const updatedTime = row.getValue('UpdatedTime') as string
        return <div className="text-muted-foreground text-sm">{formatDate(updatedTime)}</div>
      },
      meta: {
        displayName: 'Last Updated'
      }
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const staff = row.original
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
                onClick={() => navigator.clipboard.writeText(staff.staff_id)}
                className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                Copy Staff ID
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleViewStaff(staff)} 
                className="flex items-center gap-2 hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                <Eye className="h-4 w-4" />
                View/Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteStaff(staff.staff_id)}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading staff...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Bulk Actions Bar */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedRows.length}</Badge>
              <span className="text-sm font-medium">staff member(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedRows([])}>
                Clear Selection
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={staff}
          searchKey="staff_name"
          searchPlaceholder="Search by staff name..."
          showColumnToggle={true}
          showPagination={true}
          loading={loading}
          initialColumnVisibility={{
            staff_id: false,
            experience_years: false,
            updated_at: false
          }}
          actionButton={
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Staff Member
                </Button>
                <Button onClick={() => setIsBulkUploadOpen(true)} variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Bulk Upload
                </Button>
              </div>
            </div>
          }
        />
      </div>

      {/* Staff Details Dialog */}
      <StaffDetailsDialog
        staff={editingStaff || undefined}
        onUpdate={handleUpdateStaff}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      {/* Add Staff Dialog */}
      <AddStaffDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={onRefresh}
      />

      {/* Bulk Upload Staff Dialog */}
      <BulkUploadStaffDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onSuccess={onRefresh}
      />
    </>
  )
}

export default StaffTable