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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Department, UpdateDepartmentRequest, DEPARTMENT_TYPE_OPTIONS, DEPARTMENT_STATUS_OPTIONS } from '@/types/departments'
import { departmentsApi } from '@/services/departmentsApi'
import { Building2, Mail, Phone, Calendar, User } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  department_name: z.string().min(1, 'Department name is required'),
  department_type: z.enum(['CLINICAL', 'NON-CLINICAL', 'SUPPORTIVE', 'AUXILIARY']),
  point_of_contact: z.string().min(1, 'Point of contact is required'),
  phone_no: z.string().min(10, 'Phone number must be at least 10 digits'),
  email_id: z.string().email('Invalid email address'),
  status: z.enum(['active', 'inactive']),
})

type FormData = z.infer<typeof formSchema>

interface DepartmentDetailsDialogProps {
  department?: Department
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (department: Department) => void
}

export default function DepartmentDetailsDialog({
  department,
  open,
  onOpenChange,
  onUpdate,
}: DepartmentDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department_name: '',
      department_type: 'CLINICAL',
      point_of_contact: '',
      phone_no: '',
      email_id: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (department) {
      form.reset({
        department_name: department.department_name,
        department_type: department.department_type,
        point_of_contact: department.point_of_contact,
        phone_no: department.phone_no,
        email_id: department.email_id,
        status: department.status,
      })
    }
  }, [department, form])

  const onSubmit = async (data: FormData) => {
    if (!department) return

    setIsLoading(true)

    try {
      const updateData: UpdateDepartmentRequest = {
        department_name: data.department_name,
        department_type: data.department_type,
        point_of_contact: data.point_of_contact,
        phone_no: data.phone_no,
        email_id: data.email_id,
        status: data.status,
      }

      const response = await departmentsApi.updateDepartment(department.id, updateData)

      toast.success(`Department "${response.department.department_name}" updated successfully`)
      onUpdate?.(response.department)
      setIsEditing(false)
      handleClose()
    } catch (error) {
      console.error('Error updating department:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update department')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsEditing(false)
    onOpenChange(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'dd MMM yyyy, HH:mm:ss')
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

  if (!department) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Department Details
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit department information' : 'View department information and metadata'}
          </DialogDescription>
        </DialogHeader>

        {!isEditing ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department ID</label>
                  <div className="font-mono text-sm mt-1">{department.department_id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(department.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Department Name</label>
                <div className="text-lg font-semibold mt-1">{department.department_name}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Department Type</label>
                <div className="mt-1">{getDepartmentTypeBadge(department.department_type)}</div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Contact Information</h3>

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Point of Contact:</span>
                  <span className="font-medium">{department.point_of_contact}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{department.phone_no}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{department.email_id}</span>
                </div>
              </div>

              <Separator />

              {/* Hospital Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Hospital Information</h3>

                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Hospital:</span>
                  <span className="font-medium">{department.hospital_name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Hospital ID:</span>
                  <span className="font-mono text-xs">{department.hospital_id}</span>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Metadata</h3>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created On</span>
                    </div>
                    <div className="font-medium mt-1">{formatDate(department.created_at)}</div>
                    <div className="text-xs text-muted-foreground">by {department.created_by}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Last Updated</span>
                    </div>
                    <div className="font-medium mt-1">{formatDate(department.updated_at)}</div>
                    <div className="text-xs text-muted-foreground">by {department.updated_by}</div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Edit Department
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPARTMENT_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="point_of_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Point of Contact *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPARTMENT_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}