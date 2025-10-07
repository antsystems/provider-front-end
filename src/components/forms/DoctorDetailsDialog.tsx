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
import { Doctor, UpdateDoctorRequest } from '@/types/doctors'
import { doctorsApi } from '@/services/doctorsApi'
import { Stethoscope, Mail, Phone, User, Building2, Calendar, IndianRupee, Clock, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

const doctorFormSchema = z.object({
  doctor_name: z.string().min(2, 'Doctor name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contact_number: z.string().min(10, 'Contact number must be at least 10 characters'),
  qualification: z.string().optional(),
  experience_years: z.number().min(0, 'Experience years must be 0 or greater').optional(),
  consultation_fee: z.number().min(0, 'Consultation fee must be 0 or greater').optional(),
  availability: z.string().optional(),
})

type DoctorFormValues = z.infer<typeof doctorFormSchema>

interface DoctorDetailsDialogProps {
  doctor?: Doctor
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (doctor: Doctor) => void
}

export default function DoctorDetailsDialog({
  doctor,
  open,
  onOpenChange,
  onUpdate,
}: DoctorDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      doctor_name: '',
      email: '',
      contact_number: '',
      qualification: '',
      experience_years: 0,
      consultation_fee: 0,
      availability: '',
    },
  })

  useEffect(() => {
    if (doctor) {
      form.reset({
        doctor_name: doctor.doctor_name || '',
        email: doctor.email || '',
        contact_number: doctor.contact_number || '',
        qualification: doctor.qualification || '',
        experience_years: doctor.experience_years || 0,
        consultation_fee: doctor.consultation_fee || 0,
        availability: doctor.availability || '',
      })
    }
  }, [doctor, form])

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'PPP p')
  }

  const onSubmit = async (values: DoctorFormValues) => {
    if (!doctor) return

    setIsLoading(true)
    try {
      const updateData: UpdateDoctorRequest = {
        doctor_name: values.doctor_name,
        email: values.email,
        contact_number: values.contact_number,
        qualification: values.qualification,
        experience_years: values.experience_years,
        consultation_fee: values.consultation_fee,
        availability: values.availability,
      }

      const response = await doctorsApi.updateDoctor(doctor.doctor_id, updateData)

      toast.success('Doctor updated successfully')
      onUpdate?.(response.doctor)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating doctor:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update doctor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (doctor) {
      form.reset({
        doctor_name: doctor.doctor_name || '',
        email: doctor.email || '',
        contact_number: doctor.phone_number || doctor.contact_number || '',
        qualification: doctor.qualification || '',
        experience_years: doctor.experience_years || 0,
        consultation_fee: doctor.consultation_fee || 0,
        availability: doctor.availability || '',
      })
    }
    setIsEditing(false)
  }

  if (!doctor) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Doctor Details
          </DialogTitle>
          <DialogDescription>
            View and edit doctor information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Doctor Info Card */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Stethoscope className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{doctor.doctor_name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {doctor.doctor_id}</p>
                </div>
              </div>
              <Badge
                variant={doctor.IsActive === 1 ? 'default' : 'secondary'}
                className={doctor.IsActive === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
              >
                {doctor.IsActive === 1 ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.phone_number || doctor.contact_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.qualification || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.experience_years ? `${doctor.experience_years} years` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.consultation_fee ? `₹${doctor.consultation_fee}` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.hospital_name || doctor.hospital_id}</span>
              </div>
            </div>

            {doctor.availability && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Availability:</span>
                <span className="ml-2">{doctor.availability}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Specialty:</span>
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  {doctor.specialty_name}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Department:</span>
                <span className="ml-2">{doctor.department_name}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Created</p>
                <p>{formatDate(doctor.CreatedDate)}</p>
                <p>by {doctor.CreatedByEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Last Updated</p>
                <p>{formatDate(doctor.UpdatedTime)}</p>
                <p>by {doctor.UpdatedByEmail}</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="doctor_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter doctor name" />
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
                          <Input {...field} type="email" placeholder="Enter email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter phone number" />
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
                          <Input {...field} placeholder="Enter qualification (optional)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Years</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Enter experience years"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
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
                          <Input
                            {...field}
                            type="number"
                            placeholder="Enter consultation fee"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
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
                        <Input {...field} placeholder="Enter availability schedule (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Edit Doctor
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}