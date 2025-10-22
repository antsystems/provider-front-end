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
import { CreateStaffRequest } from '@/types/staff'
import { staffApi } from '@/services/staffApi'
import { Users, Mail, Phone, Building, ChevronsUpDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const createStaffSchema = z.object({
  staff_name: z.string().min(2, 'Staff name must be at least 2 characters'),
  contact_number: z.string().min(10, 'Contact number must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  department_name: z.string().min(1, 'Department is required'),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  experience_years: z.number().min(0, 'Experience must be 0 or more').optional(),
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
  const [departments, setDepartments] = useState<Array<string>>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [openDepartment, setOpenDepartment] = useState(false)

  const form = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      staff_name: '',
      contact_number: '',
      email: '',
      department_name: '',
      designation: '',
      qualification: '',
      experience_years: 0,
    },
  })

  useEffect(() => {
    const fetchOptions = async () => {
      if (!open) return

      setIsLoadingOptions(true)
      try {
        const response = await staffApi.getAvailableDepartments()
        setDepartments(response.department_names || [])
      } catch (error) {
        console.error('Error fetching available departments:', error)
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
        designation: values.designation || undefined,
        qualification: values.qualification || undefined,
        experience_years: values.experience_years || undefined,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
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
                            <Input {...field} placeholder="+91-9876543210" className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Department & Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Professional Information
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="department_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Department *</FormLabel>
                      <Popover open={openDepartment} onOpenChange={setOpenDepartment} modal={false}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openDepartment}
                              disabled={isLoadingOptions}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value || (isLoadingOptions ? "Loading..." : "Select a department")}
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
                                  {departments.map((department) => (
                                    <CommandItem
                                      value={department}
                                      key={department}
                                      onSelect={() => {
                                        form.setValue("department_name", department)
                                        setOpenDepartment(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          department === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {department}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Senior Nurse, Lab Technician" />
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
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="0"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. B.Sc Nursing, DMLT, MSW" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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