'use client'

import { useState } from 'react'
import { format } from 'date-fns'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HospitalUser, USER_STATUS_OPTIONS, UpdateUserStatusRequest } from '@/types/hospitalUsers'
import { hospitalUsersApi } from '@/services/hospitalUsersApi'
import { UserCheck, Mail, Phone, User, Building2, Calendar, Shield, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface HospitalUserDetailsDialogProps {
  user?: HospitalUser
  onUpdate?: (user: HospitalUser) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function HospitalUserDetailsDialog({
  user,
  onUpdate,
  open,
  onOpenChange,
}: HospitalUserDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, 'PPP p')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = USER_STATUS_OPTIONS.find(opt => opt.value === status)
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{statusConfig?.label || status}</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{statusConfig?.label || status}</Badge>
      case 'pending_password_set':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{statusConfig?.label || status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadges = (roles: string[]) => {
    const roleLabels = {
      'hospital_admin': 'Hospital Admin',
      'hospital_user': 'Hospital User',
      'rm': 'Regional Manager',
      'rp': 'Regional Partner'
    }

    return roles.map(role => (
      <Badge key={role} variant="outline" className="bg-blue-50 text-blue-700">
        {roleLabels[role as keyof typeof roleLabels] || role}
      </Badge>
    ))
  }

  const handleStatusUpdate = async () => {
    if (!user || !selectedStatus || selectedStatus === user.status) return

    setIsLoading(true)
    try {
      const updateData: UpdateUserStatusRequest = {
        status: selectedStatus as 'active' | 'inactive' | 'pending_password_set'
      }

      const response = await hospitalUsersApi.updateUserStatus(user.user_id, updateData)

      // Update the user object with new status and updated_on
      const updatedUser: HospitalUser = {
        ...user,
        status: updateData.status,
        updated_on: response.user.updated_on
      }

      toast.success(`User status updated to ${selectedStatus}`)
      onUpdate?.(updatedUser)
      setSelectedStatus('')
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update user status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendPasswordEmail = async () => {
    if (!user) return

    try {
      const response = await hospitalUsersApi.resendPasswordSetupEmail(user.user_id)
      if (response.email_sent) {
        toast.success(`Password setup email sent to ${user.email}`)
      } else {
        toast.error('Failed to send password setup email')
      }
    } catch (error) {
      console.error('Error resending password email:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to resend password setup email')
    }
  }

  if (!user) {
    return null
  }

  const isPendingPassword = user.status === 'pending_password_set'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Hospital User Details
          </DialogTitle>
          <DialogDescription>
            View and manage hospital user account information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - User Info */}
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">User ID: {user.user_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{user.hospital_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(user.status)}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1 flex-wrap">
                    {getRoleBadges(user.roles)}
                  </div>
                </div>
              </div>
            </div>

            {/* Firebase Auth Info */}
            {user.firebase_uid && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Firebase Authentication
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Firebase UID:</span>
                    <span className="font-mono text-xs">{user.firebase_uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auth Status:</span>
                    <span>{user.status === 'active' ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Record Information */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Record Information
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(user.created_on)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(user.updated_on)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By:</span>
                  <span>{user.created_by_email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">User Management</h4>

              {/* Status Update */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Update Status</label>
                <div className="flex gap-2">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={isLoading || !selectedStatus || selectedStatus === user.status}
                    size="sm"
                  >
                    {isLoading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current status: <strong>{USER_STATUS_OPTIONS.find(opt => opt.value === user.status)?.label}</strong>
                </p>
              </div>

              {/* Password Actions */}
              {isPendingPassword && (
                <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h5 className="font-medium text-yellow-800">Password Setup Required</h5>
                  <p className="text-sm text-yellow-700">
                    This user needs to set up their password to access the system.
                  </p>
                  <Button
                    onClick={handleResendPasswordEmail}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Resend Password Setup Email
                  </Button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-3">
                <h5 className="font-medium">Quick Actions</h5>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(user.email)}
                  >
                    Copy Email Address
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(user.user_id)}
                  >
                    Copy User ID
                  </Button>
                  {user.firebase_uid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(user.firebase_uid!)}
                    >
                      Copy Firebase UID
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}