'use client'

import { useState } from 'react'

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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HospitalUser, USER_STATUS_OPTIONS, BulkUpdateStatusRequest } from '@/types/hospitalUsers'
import { hospitalUsersApi } from '@/services/hospitalUsersApi'
import { Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface BulkUpdateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUsers: HospitalUser[]
  onSuccess?: () => void
}

export default function BulkUpdateStatusDialog({
  open,
  onOpenChange,
  selectedUsers,
  onSuccess,
}: BulkUpdateStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [results, setResults] = useState<{
    successful: { user_id: string; status: string }[]
    failed: { user_id: string; error: string }[]
    total: number
  } | null>(null)

  const handleBulkUpdate = async () => {
    if (!selectedStatus || selectedUsers.length === 0) return

    setIsLoading(true)
    setResults(null)

    try {
      const bulkData: BulkUpdateStatusRequest = {
        user_ids: selectedUsers.map(user => user.user_id),
        status: selectedStatus as 'active' | 'inactive' | 'pending_password_set'
      }

      const response = await hospitalUsersApi.bulkUpdateUserStatus(bulkData)

      setResults({
        successful: response.successful_updates,
        failed: response.failed_updates,
        total: response.total_processed
      })

      if (response.failed_updates.length === 0) {
        toast.success(`Successfully updated ${response.successful_updates.length} user(s)`)
        onSuccess?.()
      } else {
        toast.warning(`Updated ${response.successful_updates.length} user(s), ${response.failed_updates.length} failed`)
      }

    } catch (error) {
      console.error('Error bulk updating users:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update user status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedStatus('')
    setResults(null)
    onOpenChange(false)
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

  const getUserByIdFromSelected = (userId: string) => {
    return selectedUsers.find(user => user.user_id === userId)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Bulk Update User Status
          </DialogTitle>
          <DialogDescription>
            Update the status of {selectedUsers.length} selected user(s) at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Users List */}
          <div className="space-y-3">
            <h4 className="font-medium">Selected Users ({selectedUsers.length})</h4>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
              {selectedUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{user.name}</span>
                    <span className="text-muted-foreground ml-2">({user.email})</span>
                  </div>
                  {getStatusBadge(user.status)}
                </div>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          {!results && (
            <div className="space-y-3">
              <label className="text-sm font-medium">New Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status for all selected users" />
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
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-4">
              <h4 className="font-medium">Update Results</h4>

              {/* Summary */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Processed {results.total} user(s): {results.successful.length} successful, {results.failed.length} failed
                </AlertDescription>
              </Alert>

              {/* Successful Updates */}
              {results.successful.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Successful Updates ({results.successful.length})</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-1">
                    {results.successful.map((update) => {
                      const user = getUserByIdFromSelected(update.user_id)
                      return (
                        <div key={update.user_id} className="flex items-center justify-between text-sm">
                          <span>{user?.name || update.user_id}</span>
                          {getStatusBadge(update.status)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Failed Updates */}
              {results.failed.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Failed Updates ({results.failed.length})</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-1">
                    {results.failed.map((failure) => {
                      const user = getUserByIdFromSelected(failure.user_id)
                      return (
                        <div key={failure.user_id} className="text-sm">
                          <div className="font-medium">{user?.name || failure.user_id}</div>
                          <div className="text-red-600 text-xs">{failure.error}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning for certain status changes */}
          {selectedStatus === 'inactive' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Setting users to inactive will prevent them from logging into the system.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              {results ? 'Close' : 'Cancel'}
            </Button>
            {!results && (
              <Button
                onClick={handleBulkUpdate}
                disabled={isLoading || !selectedStatus || selectedUsers.length === 0}
              >
                {isLoading ? 'Updating...' : `Update ${selectedUsers.length} User(s)`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}