'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreateStaffRequest } from '@/types/staff'
import { staffApi } from '@/services/staffApi'
import { Users, Mail, Phone, Building } from 'lucide-react'
import { toast } from 'sonner'

const createStaffSchema = z.object({
  staff_name: z.string().min(2, 'Staff name must be at least 2 characters'),
  contact_number: z.string().min(10, 'Contact number must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  department_name: z.string().min(1, 'Department is required'),
})

type CreateStaffFormValues = z.infer<typeof createStaffSchema>

interface AddStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddStaffDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddStaffDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<string[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  const form = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      staff_name: '',
      contact_number: '',
      email: '',
      department_name: '',
    },
  })

  useEffect(() => {
    const fetchOptions = async () => {
      if (!open) return

      setIsLoadingOptions(true)
      try {
        const departmentsResponse = await staffApi.getAvailableDepartments()
        setDepartments(departmentsResponse.departments)
      } catch (error) {
        console.error('Error fetching options:', error)
        toast.error('Failed to load departments')
      } finally {
        setIsLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [open])

  const onSubmit = async (values: CreateStaffFormValues) => {
    setIsLoading(true)
    try {
      const createData: CreateStaffRequest = {
        staff_name: values.staff_name,
        contact_number: values.contact_number,
        email: values.email,
        department_name: values.department_name,
      }

      await staffApi.createStaff(createData)

      toast.success('Staff member created successfully')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating staff member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create staff member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Add New Staff Member
          </DialogTitle>
          <DialogDescription>
            Create a new staff member profile with department information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="staff_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter staff member's full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input {...field} type="email" placeholder="staff@hospital.com" className="pl-10" />
                          </div>
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
                        <FormLabel>Contact Number *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input {...field} placeholder="+1-555-0123" className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Department
              </h3>

              <FormField
                control={form.control}
                name="department_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingOptions}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingOptions ? "Loading..." : "Select a department"} />
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
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Staff Member'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}