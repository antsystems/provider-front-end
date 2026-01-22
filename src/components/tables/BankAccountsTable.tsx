'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, Plus, Trash2, Edit, Building2 } from 'lucide-react'
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
import { BankAccount } from '@/types/bankAccounts'
import { bankAccountsApi } from '@/services/bankAccountsApi'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import AddBankAccountDialog from '@/components/forms/AddBankAccountDialog'
import EditBankAccountDialog from '@/components/forms/EditBankAccountDialog'
import { toast } from 'sonner'

interface BankAccountsTableProps {
  bankAccounts: BankAccount[]
  loading?: boolean
  onView?: (account: BankAccount) => void
  onUpdate?: (account: BankAccount) => void
  onRefresh?: () => void
}

export function BankAccountsTable({ bankAccounts, loading, onView, onUpdate, onRefresh }: BankAccountsTableProps) {
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const confirmDialog = useConfirmDialog()

  const handleViewAccount = (account: BankAccount) => {
    setEditingAccount(account)
    setIsEditDialogOpen(true)
    onView?.(account)
  }

  const handleUpdateAccount = (updatedAccount: BankAccount) => {
    onUpdate?.(updatedAccount)
    onRefresh?.()
  }

  const handleDeleteAccount = async (account: BankAccount, bankName: string) => {
    const accountNumber = account.bank_account_number || account.account_number || '';
    confirmDialog.open({
      title: 'Delete Bank Account',
      description: `Are you sure you want to delete the account "${accountNumber}" for "${bankName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await bankAccountsApi.deleteBankAccount(accountNumber)
          toast.success(`Bank account "${accountNumber}" deleted successfully`)
          onRefresh?.()
        } catch (error) {
          console.error('Error deleting bank account:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to delete bank account')
        }
      }
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) {
      setEditingAccount(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'dd-MM-yyyy HH:mm')
  }

  const columns: ColumnDef<BankAccount>[] = [
    {
      accessorKey: 'bank_name',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} 
          className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          Bank Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{row.getValue('bank_name')}</div>
        </div>
      )
    },
    {
      accessorKey: 'bank_account_number',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} 
          className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          Account Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const account = row.original;
        const accountNumber = account.bank_account_number || account.account_number || '';
        return <div className="font-mono text-sm font-medium">{accountNumber}</div>
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => {
        const createdAt = row.getValue('created_at') as string | undefined
        return <div className="text-muted-foreground text-sm">{formatDate(createdAt)}</div>
      }
    },
    {
      accessorKey: 'created_by_email',
      header: 'Created By',
      cell: ({ row }) => {
        const email = row.getValue('created_by_email') as string | undefined
        return email ? <div className="text-sm text-muted-foreground">{email}</div> : <div>—</div>
      }
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const account = row.original

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
                onClick={() => navigator.clipboard.writeText(account.bank_account_number || account.account_number || '')}
                className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                Copy Account Number
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(account.bank_name)}
                className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                Copy Bank Name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleViewAccount(account)} 
                className="flex items-center gap-2 hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                <Eye className="h-4 w-4" />
                View/Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteAccount(account, account.bank_name)}
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
          <p className="text-gray-500">Loading bank accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={bankAccounts}
          searchKey="bank_name"
          searchPlaceholder="Search by account number or bank name..."
          showColumnToggle={true}
          showPagination={true}
          loading={loading}
          initialColumnVisibility={{
            created_at: false,
            created_by_email: false,
          }}
          actionButton={  
            <div className="flex items-center justify-between">
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Bank Account
              </Button>
            </div>
          }
        />
      </div>

      {/* Edit Account Dialog */}
      <EditBankAccountDialog
        account={editingAccount || undefined}
        onUpdate={handleUpdateAccount}
        open={isEditDialogOpen}
        onOpenChange={handleDialogClose}
      />

      {/* Add Account Dialog */}
      <AddBankAccountDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  )
}

export default BankAccountsTable
