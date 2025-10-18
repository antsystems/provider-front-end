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
    return users.filter(user => selectedRows.includes(user.user_id || user.uid || ''))
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

  const getRoleBadge = (roles: string[] | string | undefined) => {
    let primaryRole: string
    
    if (Array.isArray(roles)) {
      primaryRole = roles[0] || 'user'
    } else {
      primaryRole = roles || 'user'
    }

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
              setSelectedRows(table.getRowModel().rows.map(r => r.original.user_id || r.original.uid || '').filter(Boolean))
            } else setSelectedRows([])
          }}
          className="w-4 h-4 rounded border border-border"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.original.user_id || row.original.uid || '')}
          onChange={(e) => {
            const userId = row.original.user_id || row.original.uid || '';
            if (e.target.checked) setSelectedRows(prev => [...prev, userId])
            else setSelectedRows(prev => prev.filter(id => id !== userId))
          }}
          className="w-4 h-4 rounded border border-border"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.auto_id || row.uid || row.firebase_uid,
      id: 'userId',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors">
          User ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const userId = row.original.auto_id || row.original.uid || row.original.firebase_uid;
        return <div className="font-mono text-sm font-medium">{userId || '—'}</div>
      },
      meta: {
        displayName: 'User ID'
      }
    },
    {
      accessorFn: (row) => row.name || row.displayName,
      id: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors">
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">
              {row.original.name || row.original.displayName || '—'}
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {row.original.email}
              </div>
              {row.original.employee_id && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Employee ID: {row.original.employee_id}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'roles',
      header: 'Role',
      cell: ({ row }) => {
        // Use type assertion to handle both array and string cases
        const roles = (row.getValue('roles') || row.original.role) as string[] | string;
        return getRoleBadge(roles);
      }
    },
    {
      accessorFn: (row) => row.phone_number || row.mobile,
      id: 'contact',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors">
          Contact
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const phone = row.original.phone_number || row.original.mobile
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
      accessorFn: (row) => row.updated_at || row.updatedAt || row.createdAt || row.created_at,
      id: 'lastUpdated',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors">
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const updatedTime = row.original.updated_at || row.original.updatedAt || row.original.createdAt || row.original.created_at || ''
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
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/60 focus:bg-muted/60 transition-colors">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary group-focus:text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-0">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {(user.user_id || user.uid) && (
                <DropdownMenuItem 
                  onClick={() => navigator.clipboard.writeText(user.user_id || user.uid || '')}
                  className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
                >
                  Copy User ID
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(user.email)}
                className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleViewUser(user)} 
                className="flex items-center gap-2 hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground">
                <Eye className="h-4 w-4" />
                View/Edit
              </DropdownMenuItem>
              {isPendingPassword && (user.user_id || user.uid) && (
                <DropdownMenuItem
                  onClick={() => handleResendPasswordEmail(user.user_id || user.uid || '', user.name || '', user.email)}
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
          searchPlaceholder="Search by name or email..."
          showColumnToggle={true}
          showPagination={true}
          loading={loading}
          initialColumnVisibility={{
            userId: false,
            updated_on: false
          }}
          actionButton={
            <div className="flex items-center justify-between">
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Hospital User
              </Button>
            </div>
          }
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