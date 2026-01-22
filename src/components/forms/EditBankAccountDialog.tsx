'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { BankAccount, UpdateBankAccountRequest } from '@/types/bankAccounts'
import { bankAccountsApi } from '@/services/bankAccountsApi'
import { Building2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  bank_account_number: z.string().min(1, 'Account number is required').regex(/^\d+$/, 'Account number must contain only digits'),
  ifsc_code: z.string().optional(),
  branch: z.string().optional(),
  remarks: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditBankAccountDialogProps {
  account: BankAccount | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (account: BankAccount) => void
}

export default function EditBankAccountDialog({
  account,
  open,
  onOpenChange,
  onUpdate,
}: EditBankAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank_account_number: account?.bank_account_number || '',
      ifsc_code: account?.ifsc_code || '',
      branch: account?.branch || '',
      remarks: account?.remarks || '',
    },
  })

  // Update form when account changes
  useEffect(() => {
    if (account) {
      form.reset({
        bank_account_number: account.bank_account_number,
        ifsc_code: account.ifsc_code || '',
        branch: account.branch || '',
        remarks: account.remarks || '',
      })
    }
  }, [account, form])

  const onSubmit = async (data: FormData) => {
    if (!account) return

    setIsLoading(true)

    try {
      const updateData: UpdateBankAccountRequest = {
        bank_account_number: data.bank_account_number,
        ifsc_code: data.ifsc_code?.trim() || undefined,
        branch: data.branch?.trim() || undefined,
        remarks: data.remarks?.trim() || undefined,
      }

      const response = await bankAccountsApi.updateBankAccount(
        account.bank_account_number,
        updateData
      )

      if (response?.bank_account) {
        toast.success(`Bank account updated successfully`)
        onUpdate?.(response.bank_account)
        handleClose()
      } else {
        toast.success(`Bank account updated successfully`)
        handleClose()
      }

    } catch (error) {
      console.error('Error updating bank account:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update bank account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Edit Bank Account
          </DialogTitle>
          <DialogDescription>
            Update the bank account details for {account.bank_name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Bank Name</FormLabel>
              <Input
                value={account.bank_name}
                disabled
                className="bg-muted"
              />
              <FormDescription>
                Bank name cannot be changed. To change the bank, delete this account and create a new one.
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="bank_account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter account number (digits only)"
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
              name="ifsc_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter IFSC code (optional)"
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
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter branch name (optional)"
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
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter any remarks (optional)"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
