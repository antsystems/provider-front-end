'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, UserCheck, Mail, Phone, User, Shield, Plus, RotateCcw } from 'lucide-react'
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
import { HospitalUser, USER_STATUS_OPTIONS } from '@/types/hospitalUsers'
import { hospitalUsersApi } from '@/services/hospitalUsersApi'
import HospitalUserDetailsDialog from '@/components/forms/HospitalUserDetailsDialog'
import AddHospitalUserDialog from '@/components/forms/AddHospitalUserDialog'
import BulkUpdateStatusDialog from '@/components/forms/BulkUpdateStatusDialog'
import { toast } from 'sonner'

interface HospitalUsersTableProps {
  users: HospitalUser[]
  loading?: boolean
  onView?: (user: HospitalUser) => void
  onUpdate?: (user: HospitalUser) => void
  onRefresh?: () => void
}

export function HospitalUsersTable({ users, loading, onView, onUpdate, onRefresh }: HospitalUsersTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [editingUser, setEditingUser] = useState<HospitalUser | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false)

  const handleViewUser = (user: HospitalUser) => {
    setEditingUser(user)
    setIsDialogOpen(true)
    onView?.(user)
  }

  const handleUpdateUser = (updatedUser: HospitalUser) => {
    onUpdate?.(updatedUser)
    onRefresh?.()
  }

  const handleResendPasswordEmail = async (userId: string, userName: string, userEmail: string) => {
    try {
      const response = await hospitalUsersApi.resendPasswordSetupEmail(userId)
      if (response.email_sent) {
        toast.success(`Password setup email sent to ${userEmail}`)
      } else {
        toast.error('Failed to send password setup email')
      }
    } catch (error) {
      console.error('Error resending password email:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to resend password setup email')
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingUser(null)
    }
  }

  const handleBulkUpdateSuccess = () => {
    setSelectedRows([])
    onRefresh?.()
    setIsBulkUpdateDialogOpen(false)
  }

  const getSelectedUsers = () => {
    return users.filter(user => selectedRows.includes(user.user_id))
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'dd-MM-yyyy HH:mm:ss')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = USER_STATUS_OPTIONS.find(opt => opt.value === status)
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{statusConfig?.label || status}</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{statusConfig?.label || status}</Badge>
      case 'pending_password_set':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{statusConfig?.label || status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (roles: string[]) => {
    const primaryRole = roles[0] || 'user'
    const roleLabels = {
      'hospital_admin': 'Admin',
      'hospital_user': 'User',
      'rm': 'Regional Manager',
      'rp': 'Regional Partner'
    }

    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        {roleLabels[primaryRole as keyof typeof roleLabels] || primaryRole}
      </Badge>
    )
  }

  const columns: ColumnDef<HospitalUser>[] = [
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
              setSelectedRows(table.getRowModel().rows.map(r => r.original.user_id))
            } else setSelectedRows([])
          }}
          className="w-4 h-4 rounded border border-border"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.original.user_id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedRows(prev => [...prev, row.original.user_id])
            else setSelectedRows(prev => prev.filter(id => id !== row.original.user_id))
          }}
          className="w-4 h-4 rounded border border-border"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'user_id',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          User ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono text-sm font-medium">{row.getValue('user_id')}</div>,
      meta: {
        displayName: 'User ID'
      }
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-primary/10">
            <UserCheck className="h-3 w-3 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">
              {row.getValue('name')}
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
      accessorKey: 'roles',
      header: 'Role',
      cell: ({ row }) => getRoleBadge(row.getValue('roles'))
    },
    {
      accessorKey: 'phone_number',
      header: 'Contact',
      cell: ({ row }) => {
        const phone = row.getValue('phone_number') as string
        return phone ? (
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3 text-gray-400" />
            {phone}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status'))
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
        const user = row.original
        const isPendingPassword = user.status === 'pending_password_set'

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.user_id)}>
                Copy User ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewUser(user)} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View/Edit
              </DropdownMenuItem>
              {isPendingPassword && (
                <DropdownMenuItem
                  onClick={() => handleResendPasswordEmail(user.user_id, user.name, user.email)}
                  className="flex items-center gap-2 text-blue-600 focus:text-blue-600"
                >
                  <RotateCcw className="h-4 w-4" />
                  Resend Password Email
                </DropdownMenuItem>
              )}
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
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with Add User Button */}
        <div className="flex items-center justify-between">
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Hospital User
          </Button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedRows.length}</Badge>
              <span className="text-sm font-medium">user(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedRows([])}>
                Clear Selection
              </Button>
              <Button
                size="sm"
                onClick={() => setIsBulkUpdateDialogOpen(true)}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                Update Status
              </Button>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={users}
          searchKey="name"
          searchPlaceholder="Search by user name..."
          showColumnToggle={true}
          showPagination={true}
          initialColumnVisibility={{
            user_id: false,
            updated_on: false
          }}
        />
      </div>

      {/* User Details Dialog */}
      <HospitalUserDetailsDialog
        user={editingUser || undefined}
        onUpdate={handleUpdateUser}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      {/* Add User Dialog */}
      <AddHospitalUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={onRefresh}
      />

      {/* Bulk Update Status Dialog */}
      <BulkUpdateStatusDialog
        open={isBulkUpdateDialogOpen}
        onOpenChange={setIsBulkUpdateDialogOpen}
        selectedUsers={getSelectedUsers()}
        onSuccess={handleBulkUpdateSuccess}
      />
    </>
  )
}

export default HospitalUsersTable