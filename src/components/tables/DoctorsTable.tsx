'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, Stethoscope, Mail, Phone, User, Trash2, Plus, Upload } from 'lucide-react'
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
import { Doctor } from '@/types/doctors'
import { doctorsApi } from '@/services/doctorsApi'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import DoctorDetailsDialog from '@/components/forms/DoctorDetailsDialog'
import AddDoctorDialog from '@/components/forms/AddDoctorDialog'
import BulkUploadDoctorsDialog from '@/components/forms/BulkUploadDoctorsDialog'
import { toast } from 'sonner'

interface DoctorsTableProps {
  doctors: Doctor[]
  loading?: boolean
  onView?: (doctor: Doctor) => void
  onUpdate?: (doctor: Doctor) => void
  onDelete?: (doctorId: string) => void
  onRefresh?: () => void
}

export function DoctorsTable({ doctors, loading, onView, onUpdate, onDelete, onRefresh }: DoctorsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
   const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false)

  const confirmDialog = useConfirmDialog()

  const handleViewDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setIsDialogOpen(true)
    onView?.(doctor)
  }

  const handleUpdateDoctor = (updatedDoctor: Doctor) => {
    onUpdate?.(updatedDoctor)
    onRefresh?.()
  }

  const handleDeleteDoctor = async (doctorId: string) => {
    const doctor = doctors.find(d => d.doctor_id === doctorId)
    const doctorName = doctor ? `${doctor.doctor_name}` : 'this doctor'

    confirmDialog.open({
      title: 'Delete Doctor',
      description: `Are you sure you want to delete ${doctorName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await doctorsApi.deleteDoctor(doctorId)
          toast.success('Doctor deleted successfully')
          onDelete?.(doctorId)
          onRefresh?.()
        } catch (error) {
          console.error('Error deleting doctor:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to delete doctor')
        }
      }
    })
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return

    confirmDialog.open({
      title: 'Delete Doctors',
      description: `Are you sure you want to delete ${selectedRows.length} doctor(s)? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await Promise.all(selectedRows.map(id => doctorsApi.deleteDoctor(id)))
          toast.success(`${selectedRows.length} doctor(s) deleted successfully`)
          setSelectedRows([])
          onRefresh?.()
        } catch (error) {
          console.error('Error deleting doctors:', error)
          toast.error('Failed to delete some doctors')
        }
      }
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingDoctor(null)
    }
  }

  const handleBulkUploadSuccess = () => {
    // Refresh data after bulk upload
    onRefresh?.()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'dd-MM-yyyy HH:mm:ss')
  }

  const columns: ColumnDef<Doctor>[] = [
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
              setSelectedRows(table.getRowModel().rows.map(r => r.original.doctor_id))
            } else setSelectedRows([])
          }}
          className="w-4 h-4 rounded border border-border"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.original.doctor_id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedRows(prev => [...prev, row.original.doctor_id])
            else setSelectedRows(prev => prev.filter(id => id !== row.original.doctor_id))
          }}
          className="w-4 h-4 rounded border border-border"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'doctor_id',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          Doctor ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono text-sm font-medium">{row.getValue('doctor_id')}</div>,
      meta: {
        displayName: 'Doctor ID'
      }
    },
    {
      accessorKey: 'doctor_name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          Doctor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-primary/10">
            <Stethoscope className="h-3 w-3 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">
              {row.getValue('doctor_name')}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {row.original.email}
            </div>
            <div className="text-xs text-muted-foreground">
              Added by: {row.original.CreatedByEmail || 'Unknown'}
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'specialty_name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 hover:bg-transparent">
          Specialty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {row.getValue('specialty_name')}
        </Badge>
      )
    },
    {
      accessorKey: 'department_name',
      header: 'Department',
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue('department_name')}</div>
      )
    },
    {
      accessorKey: 'doctor_code',
      header: 'Doctor Code',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-gray-400" />
          {row.getValue('doctor_code') || 'N/A'}
        </div>
      ),
      meta: {
        displayName: 'Doctor Code'
      }
    },
    {
      accessorKey: 'contact_number',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3 text-gray-400" />
          {row.getValue('contact_number')}
        </div>
      )
    },
    {
      accessorKey: 'IsActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('IsActive') as number
        return (
          <Badge
            variant={isActive === 1 ? 'default' : 'secondary'}
            className={isActive === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
          >
            {isActive === 1 ? 'Active' : 'Inactive'}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'UpdatedTime',
      header: 'Last Updated',
      cell: ({ row }) => {
        const updatedTime = row.getValue('UpdatedTime') as string
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
        const doctor = row.original
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
                onClick={() => navigator.clipboard.writeText(doctor.doctor_id)}
                className="hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                Copy Doctor ID
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleViewDoctor(doctor)} 
                className="flex items-center gap-2 hover:bg-muted/50 focus:bg-muted/50 hover:text-foreground focus:text-foreground"
              >
                <Eye className="h-4 w-4" />
                View/Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteDoctor(doctor.doctor_id)}
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
          <p className="text-gray-500">Loading doctors...</p>
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
              <span className="text-sm font-medium">doctor(s) selected</span>
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
          data={doctors}
          searchKey="doctor_name"
          searchPlaceholder="Search by doctor name..."
          showColumnToggle={true}
          showPagination={true}
          loading={loading}
          initialColumnVisibility={{
            doctor_id: false,
            doctor_code: false,
            UpdatedTime: false
          }}
          actionButton={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Doctor
                </Button>
                <Button onClick={() => setBulkUploadDialogOpen(true)} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Bulk Upload
                </Button>
              </div>
            </div>
          }
        />
      </div>

      {/* Doctor Details Dialog */}
      <DoctorDetailsDialog
        doctor={editingDoctor || undefined}
        onUpdate={handleUpdateDoctor}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      {/* Add Doctor Dialog */}
      <AddDoctorDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={onRefresh}
      />

       {/* Bulk Upload Dialog */}
      <BulkUploadDoctorsDialog
        open={bulkUploadDialogOpen}
        onOpenChange={setBulkUploadDialogOpen}
        onSuccess={handleBulkUploadSuccess}
      />
    </>
  )
}

export default DoctorsTable