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
import { CreateDoctorRequest } from '@/types/doctors'
import { doctorsApi } from '@/services/doctorsApi'
import { departmentsApi } from '@/services/departmentsApi'
import { Stethoscope, Mail, Phone, GraduationCap, Clock, IndianRupee, Users, Building, ChevronsUpDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const createDoctorSchema = z.object({
  doctor_name: z.string().min(2, 'Doctor name must be at least 2 characters'),
  specialty_name: z.string().min(1, 'Specialty is required'),
  department_name: z.string().min(1, 'Department is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  contact_number: z.string().min(10, 'Contact number must be at least 10 characters').optional().or(z.literal('')),
  qualification: z.string().optional(),
  experience_years: z.number().min(0, 'Experience years must be 0 or greater').optional(),
  consultation_fee: z.number().min(0, 'Consultation fee must be 0 or greater').optional(),
  availability: z.string().optional(),
})

type CreateDoctorFormValues = z.infer<typeof createDoctorSchema>

interface AddDoctorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddDoctorDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddDoctorDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [openSpecialty, setOpenSpecialty] = useState(false)
  const [openDepartment, setOpenDepartment] = useState(false)

  const form = useForm<CreateDoctorFormValues>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      doctor_name: '',
      specialty_name: '',
      department_name: '',
      email: '',
      contact_number: '',
      qualification: '',
      experience_years: 0,
      consultation_fee: 0,
      availability: '',
    },
  })

  useEffect(() => {
    const fetchOptions = async () => {
      if (!open) return

      setIsLoadingOptions(true)
      try {
        const [specialtiesResponse, departmentsResponse] = await Promise.all([
          doctorsApi.getAvailableSpecialties(),
          departmentsApi.getActiveDepartments()
        ])

    // Normalize and deduplicate specialties
    const specialtiesList: string[] = specialtiesResponse.specialty_names ?? []
    const dedupedSpecialties = Array.from(new Set(specialtiesList.map(s => (s || '').trim()).filter(Boolean)))
    setSpecialties(dedupedSpecialties)

    // Filter to show only CLINICAL departments
    const clinicalDepartments = departmentsResponse.departments
      .filter(dept => dept.department_type === 'CLINICAL' && dept.status === 'active')
      .map(dept => dept.department_name)
    const dedupedDepartments = Array.from(new Set(clinicalDepartments.map(d => (d || '').trim()).filter(Boolean)))
    setDepartments(dedupedDepartments)
      } catch (error) {
        console.error('Error fetching options:', error)
        toast.error('Failed to load specialties and departments')
      } finally {
        setIsLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [open])

  const onSubmit = async (values: CreateDoctorFormValues) => {
    setIsLoading(true)
    try {
      const createData: CreateDoctorRequest = {
        doctor_name: values.doctor_name,
        specialty_name: values.specialty_name,
        department_name: values.department_name,
        email: values.email || undefined,
        contact_number: values.contact_number || undefined,
        qualification: values.qualification || undefined,
        experience_years: values.experience_years || undefined,
        consultation_fee: values.consultation_fee || undefined,
        availability: values.availability || undefined,
      }

      await doctorsApi.createDoctor(createData)

      toast.success('Doctor created successfully')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating doctor:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create doctor')
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
            <Stethoscope className="h-5 w-5 text-primary" />
            Add New Doctor
          </DialogTitle>
          <DialogDescription>
            Create a new doctor profile with specialty and department information. Only CLINICAL departments are shown as doctors can only be assigned to clinical departments.
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
                  name="doctor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter doctor's full name" />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input {...field} type="email" placeholder="doctor@hospital.com" className="pl-10" />
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
                        <FormLabel>Contact Number</FormLabel>
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

            {/* Department & Specialty */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Department & Specialty
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specialty_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Specialty *</FormLabel>
                      <Popover open={openSpecialty} onOpenChange={setOpenSpecialty}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openSpecialty}
                              disabled={isLoadingOptions}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value || (isLoadingOptions ? "Loading..." : "Select specialty")}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search specialty..." />
                            <CommandList>
                              <CommandEmpty>No specialty found.</CommandEmpty>
                              <CommandGroup>
                                {specialties.map((specialty) => (
                                  <CommandItem
                                    value={specialty}
                                    key={specialty}
                                    onSelect={() => {
                                      form.setValue("specialty_name", specialty)
                                      setOpenSpecialty(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        specialty === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {specialty}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Department *</FormLabel>
                      <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
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
                              {field.value || (isLoadingOptions ? "Loading..." : "Select department")}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search department..." />
                            <CommandList>
                              <CommandEmpty>
                                {departments.length === 0 
                                  ? "No CLINICAL departments found. Please create a CLINICAL department first." 
                                  : "No department found."}
                              </CommandEmpty>
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
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Professional Details
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., MD, MBBS, FACC" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Years</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              {...field}
                              type="number"
                              placeholder="0"
                              className="pl-10"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consultation_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fee</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              {...field}
                              type="number"
                              placeholder="500"
                              className="pl-10"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Monday-Friday 9AM-5PM" />
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
                {isLoading ? 'Creating...' : 'Create Doctor'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}