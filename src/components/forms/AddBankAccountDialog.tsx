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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreateBankAccountRequest, Bank } from '@/types/bankAccounts'
import { bankAccountsApi } from '@/services/bankAccountsApi'
import { Building2, AlertTriangle, Loader2, ChevronsUpDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  bank_id: z.string().min(1, 'Please select a bank'),
  bank_account_number: z.string().min(1, 'Account number is required').regex(/^\d+$/, 'Account number must contain only digits'),
  ifsc_code: z.string().optional(),
  branch: z.string().optional(),
  remarks: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddBankAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddBankAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddBankAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBanks, setIsLoadingBanks] = useState(false)
  const [availableBanks, setAvailableBanks] = useState<Bank[]>([])
  const [openBank, setOpenBank] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank_id: '',
      bank_account_number: '',
      ifsc_code: '',
      branch: '',
      remarks: '',
    },
  })

  // Fetch available banks
  const fetchAvailableBanks = async () => {
    try {
      setIsLoadingBanks(true)
      const response = await bankAccountsApi.getAvailableBanks()
      const banks = response?.banks || []
      setAvailableBanks(banks)
    } catch (error) {
      console.error('Error fetching available banks:', error)
      toast.error('Failed to load available banks')
    } finally {
      setIsLoadingBanks(false)
    }
  }

  useEffect(() => {
    if (open && availableBanks.length === 0) {
      fetchAvailableBanks()
    }
  }, [open])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const selectedBank = availableBanks.find(b => b.id === data.bank_id)
      if (!selectedBank) {
        throw new Error('Selected bank not found')
      }

      const accountData: CreateBankAccountRequest = {
        bank_id: data.bank_id,
        bank_account_number: data.bank_account_number,
        ifsc_code: data.ifsc_code?.trim() || undefined,
        branch: data.branch?.trim() || undefined,
        remarks: data.remarks?.trim() || undefined,
      }

      const response = await bankAccountsApi.createBankAccount(accountData)

      if (response?.bank_account) {
        toast.success(`Bank account "${data.bank_account_number}" created successfully for ${selectedBank.bank_name}`)
      } else {
        toast.success(`Bank account created successfully`)
      }

      // Reset form and close dialog after successful creation
      form.reset()
      onSuccess?.()
      handleClose()

    } catch (error) {
      console.error('Error creating bank account:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create bank account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Add Bank Account
          </DialogTitle>
          <DialogDescription>
            Create a new bank account for your hospital. Select a bank and enter the account details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bank_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Bank *</FormLabel>
                  <Popover open={openBank} onOpenChange={setOpenBank} modal={false}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openBank}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoadingBanks}
                        >
                          {isLoadingBanks ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading banks...
                            </div>
                          ) : field.value ? (
                            availableBanks.find((bank) => bank.id === field.value)?.bank_name || "Select bank"
                          ) : (
                            "Select a bank..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] p-0" 
                      align="start" 
                      side="bottom"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <Command shouldFilter={true} className="rounded-lg border-none shadow-none">
                        <CommandInput placeholder="Search banks..." className="h-10" />
                        <div
                          className="max-h-[300px] overflow-y-auto overflow-x-hidden"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          <CommandList className="max-h-none overflow-visible">
                            <CommandEmpty>
                              {isLoadingBanks ? "Loading banks..." : availableBanks.length === 0 ? "No banks available." : "No bank found."}
                            </CommandEmpty>
                            <CommandGroup className="overflow-visible p-2">
                              {availableBanks.map((bank) => (
                                <CommandItem
                                  value={bank.bank_name}
                                  key={bank.id}
                                  onSelect={() => {
                                    form.setValue("bank_id", bank.id)
                                    setOpenBank(false)
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      bank.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{bank.bank_name}</span>
                                    {bank.bank_code && (
                                      <span className="text-xs text-muted-foreground">
                                        Code: {bank.bank_code}
                                      </span>
                                    )}
                                  </div>
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

            {availableBanks.length === 0 && !isLoadingBanks && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No banks available. Please contact support.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || availableBanks.length === 0}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
