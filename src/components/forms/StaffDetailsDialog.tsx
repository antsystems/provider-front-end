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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { Users, Mail, Phone, User, Building2, Calendar, ChevronsUpDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const staffFormSchema = z.object({
  name: z.string().min(2, 'Staff name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 characters'),
  department_id: z.string().min(1, 'Department is required'),
  designation: z.string().min(2, 'Designation is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  experience_years: z.number().min(0, 'Experience must be 0 or more'),
  status: z.enum(['active', 'inactive']).optional(),
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
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [openDepartment, setOpenDepartment] = useState(false)

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      department_id: '',
      designation: '',
      qualification: '',
      experience_years: 0,
      status: 'active',
    },
  })

  useEffect(() => {
    if (staff) {
      form.reset({
        name: staff.staff_name || '',
        email: staff.email || '',
        phone_number: staff.contact_number || '',
        department_id: staff.department_name || '', // Use department_name since API only returns names
        designation: staff.designation || '',
        qualification: staff.qualification || '',
        experience_years: staff.experience_years || 0,
        status: staff.status || 'active',
      })
    }
  }, [staff, form])

  useEffect(() => {
    const fetchOptions = async () => {
      if (!open) return

      setIsLoadingOptions(true)
      try {
        const departmentsResponse = await staffApi.getAvailableDepartments()
        // API returns { department_names: string[] }
        const departmentNames = departmentsResponse.department_names || []
        // Create department objects with name as both id and name for compatibility
        const deptList = departmentNames.map(name => ({ id: name, name })).sort((a, b) => a.name.localeCompare(b.name))
        setDepartments(deptList)
      } catch (error) {
        console.error('Error fetching departments:', error)
        toast.error('Failed to load departments')
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
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        department_name: values.department_id, // Send as department_name
        designation: values.designation,
        qualification: values.qualification,
        experience_years: values.experience_years,
        status: values.status,
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
        name: staff.staff_name || '',
        email: staff.email || '',
        phone_number: staff.contact_number || '',
        department_id: staff.department_name || '', // Use department_name
        designation: staff.designation || '',
        qualification: staff.qualification || '',
        experience_years: staff.experience_years || 0,
        status: staff.status || 'active',
      })
    }
    setIsEditing(false)
  }

  if (!staff) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.contact_number}</span>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{staff.department_name}</span>
                  </div>
                  {staff.designation && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.designation}</span>
                  </div>
                  )}
                  {staff.qualification && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Qualification:</span> {staff.qualification}
                  </div>
                  )}
                  {staff.experience_years !== undefined && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Experience:</span> {staff.experience_years} years
                  </div>
                  )}
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
                  <span>{formatDate(staff.CreatedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(staff.UpdatedTime || staff.EditedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By:</span>
                  <span className="truncate">{staff.CreatedByEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated By:</span>
                  <span className="truncate">{staff.UpdatedByEmail || staff.EditedByEmail}</span>
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
                  name="name"
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
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Department</FormLabel>
                      <Popover open={openDepartment} onOpenChange={setOpenDepartment} modal={false}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openDepartment}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={!isEditing || isLoadingOptions}
                            >
                              {field.value || (isLoadingOptions ? "Loading departments..." : "Select department")}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search department..." />
                            <div className="max-h-[200px] overflow-y-auto overflow-x-hidden" onWheel={(e) => e.stopPropagation()}>
                              <CommandList className="max-h-none overflow-visible">
                                <CommandEmpty>No department found.</CommandEmpty>
                                <CommandGroup>
                                  {departments.map((dept) => (
                                    <CommandItem
                                      key={dept.name}
                                      value={dept.name}
                                      onSelect={() => {
                                        field.onChange(dept.name)
                                        setOpenDepartment(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === dept.name ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {dept.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </div>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (Years)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" disabled={!isEditing} onChange={(e) => field.onChange(parseInt(e.target.value))} />
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
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
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