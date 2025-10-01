'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreateDepartmentRequest, DEPARTMENT_TYPE_OPTIONS } from '@/types/departments'
import { departmentsApi } from '@/services/departmentsApi'
import { Building2, AlertTriangle, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

const staffMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  qualification: z.string().optional(),
  experience_years: z.coerce.number().min(0).optional(),
})

const formSchema = z.object({
  department_type: z.enum(['CLINICAL', 'NON-CLINICAL', 'SUPPORTIVE', 'AUXILIARY']),
  department_id: z.string().min(1, 'Department ID is required'),
  department_name: z.string().min(1, 'Department name is required'),
  point_of_contact: z.string().min(1, 'Point of contact is required'),
  phone_no: z.string().min(10, 'Phone number must be at least 10 digits'),
  email_id: z.string().email('Invalid email address'),
  staff_members: z.array(staffMemberSchema).optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddDepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddDepartmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddDepartmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showStaffSection, setShowStaffSection] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department_type: 'CLINICAL',
      department_id: '',
      department_name: '',
      point_of_contact: '',
      phone_no: '',
      email_id: '',
      staff_members: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'staff_members',
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const departmentData: CreateDepartmentRequest = {
        department_type: data.department_type,
        department_id: data.department_id,
        department_name: data.department_name,
        point_of_contact: data.point_of_contact,
        phone_no: data.phone_no,
        email_id: data.email_id,
        staff_members: data.staff_members && data.staff_members.length > 0 ? data.staff_members : undefined,
      }

      const response = await departmentsApi.createDepartment(departmentData)

      const staffCount = response.staff_created || response.staff_count || 0
      if (staffCount > 0) {
        toast.success(`Department "${response.department.department_name}" created successfully with ${staffCount} staff member(s)`)
      } else {
        toast.success(`Department "${response.department.department_name}" created successfully`)
      }

      form.reset()
      setShowStaffSection(false)
      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Error creating department:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create department')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setShowStaffSection(false)
    onOpenChange(false)
  }

  const addStaffMember = () => {
    append({
      name: '',
      designation: '',
      email: '',
      phone_number: '',
      qualification: '',
      experience_years: undefined,
    })
    setShowStaffSection(true)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Add New Department
          </DialogTitle>
          <DialogDescription>
            Create a new department for your hospital. You can optionally add staff members during creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Only Hospital Admins can create departments. All required fields must be filled.
                </AlertDescription>
              </Alert>

              {/* Department Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <SelectValue placeholder="Select department type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPARTMENT_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
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
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department ID *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., DEPT_CARDIOLOGY_001"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>Unique identifier for the department</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Cardiology Department"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
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
                        <Input
                          placeholder="e.g., Dr. John Smith"
                          {...field}
                          disabled={isLoading}
                        />
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
                        <Input
                          placeholder="+91-9876543211"
                          {...field}
                          disabled={isLoading}
                        />
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
                        <Input
                          type="email"
                          placeholder="department@hospital.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Staff Members Section */}
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Staff Members (Optional)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Add staff members to be automatically linked to this department
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStaffMember}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Staff
                  </Button>
                </div>

                {fields.length > 0 && (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Staff Member {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`staff_members.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Dr. Jane Doe" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`staff_members.${index}.designation`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Designation *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Senior Cardiologist" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`staff_members.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="jane.doe@hospital.com" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`staff_members.${index}.phone_number`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number *</FormLabel>
                                <FormControl>
                                  <Input placeholder="+91-9876543212" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`staff_members.${index}.qualification`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Qualification</FormLabel>
                                <FormControl>
                                  <Input placeholder="MD Cardiology" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`staff_members.${index}.experience_years`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Experience (Years)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="10" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}