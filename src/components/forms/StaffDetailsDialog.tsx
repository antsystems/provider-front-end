'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Staff, UpdateStaffRequest } from '@/types/staff'
import { staffApi } from '@/services/staffApi'
import { Users, Mail, Phone, User, Building2, Calendar } from 'lucide-react'
import { toast } from 'sonner'

const staffFormSchema = z.object({
  staff_name: z.string().min(2, 'Staff name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contact_number: z.string().min(10, 'Contact number must be at least 10 characters'),
  department_name: z.string().min(1, 'Department is required'),
})

type StaffFormValues = z.infer<typeof staffFormSchema>

interface StaffDetailsDialogProps {
  staff?: Staff
  onUpdate?: (staff: Staff) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function StaffDetailsDialog({
  staff,
  onUpdate,
  open,
  onOpenChange,
}: StaffDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [departments, setDepartments] = useState<string[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      staff_name: '',
      email: '',
      contact_number: '',
      department_name: '',
    },
  })

  useEffect(() => {
    if (staff) {
      form.reset({
        staff_name: staff.staff_name || '',
        email: staff.email || '',
        contact_number: staff.contact_number || '',
        department_name: staff.department_name || '',
      })
    }
  }, [staff, form])

  useEffect(() => {
    const fetchOptions = async () => {
      if (!open) return

      setIsLoadingOptions(true)
      try {
        const departmentsResponse = await staffApi.getAvailableDepartments()
        setDepartments(departmentsResponse.departments)
      } catch (error) {
        console.error('Error fetching options:', error)
      } finally {
        setIsLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [open])

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'PPP p')
  }

  const onSubmit = async (values: StaffFormValues) => {
    if (!staff) return

    setIsLoading(true)
    try {
      const updateData: UpdateStaffRequest = {
        staff_name: values.staff_name,
        email: values.email,
        contact_number: values.contact_number,
        department_name: values.department_name,
      }

      const response = await staffApi.updateStaff(staff.staff_id, updateData)

      toast.success('Staff member updated successfully')
      onUpdate?.(response.staff)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating staff member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update staff member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (staff) {
      form.reset({
        staff_name: staff.staff_name || '',
        email: staff.email || '',
        contact_number: staff.contact_number || '',
        department_name: staff.department_name || '',
      })
    }
    setIsEditing(false)
  }

  if (!staff) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Staff Member Details
          </DialogTitle>
          <DialogDescription>
            View and manage staff member information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-100">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{staff.staff_name}</h3>
                  <p className="text-sm text-muted-foreground">Staff ID: {staff.staff_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.contact_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.department_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={staff.status === 'active' ? 'default' : 'secondary'}
                    className={staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  >
                    {staff.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Record Information
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(staff.created_on)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(staff.updated_on)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By:</span>
                  <span>{staff.created_by_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hospital:</span>
                  <span>{staff.hospital_name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Edit Information</h4>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Edit Details
                </Button>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="staff_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!isEditing || isLoadingOptions}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments?.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Staff Member'}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}