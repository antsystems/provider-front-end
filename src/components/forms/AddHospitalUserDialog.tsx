'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreateHospitalUserRequest } from '@/types/hospitalUsers'
import { hospitalUsersApi } from '@/services/hospitalUsersApi'
import { UserCheck, Mail, Phone, Shield, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().optional().or(z.literal('')),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

interface AddHospitalUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddHospitalUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddHospitalUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
    },
  })

  const onSubmit = async (values: CreateUserFormValues) => {
    setIsLoading(true)
    try {
      const createData: CreateHospitalUserRequest = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number || undefined,
      }

      const response = await hospitalUsersApi.createHospitalUser(createData)

      if (response.email_sent) {
        toast.success(`User "${response.user.name}" created successfully! Password setup email sent to ${response.user.email}`)
      } else {
        toast.success(`User "${response.user.name}" created successfully!`)
        toast.warning('Password setup email could not be sent. Please manually share login details.')
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating hospital user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create hospital user')
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
            <UserCheck className="h-5 w-5 text-primary" />
            Add New Hospital User
          </DialogTitle>
          <DialogDescription>
            Create a new hospital user account with Firebase authentication integration.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            A password setup email will be automatically sent to the user's email address after account creation.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                User Information
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter user's full name" />
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
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input {...field} type="email" placeholder="user@hospital.com" className="pl-10" />
                        </div>
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
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input {...field} placeholder="+1-555-0123 (optional)" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Account Details
              </h3>

              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Default Role:</strong> Hospital User</p>
                  <p><strong>Initial Status:</strong> Pending Password Setup</p>
                  <p><strong>Hospital:</strong> Current hospital (auto-assigned)</p>
                  <p><strong>Authentication:</strong> Firebase Auth integration</p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating User...' : 'Create Hospital User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}