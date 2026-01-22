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
import { Building2, AlertTriangle, Loader2, ChevronsUpDown, Check, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

const formSchema = z.object({
  bank_name: z.string().min(1, 'Please select a bank'),
  bank_account_number: z.string().min(1, 'Account number is required').regex(/^\d+$/, 'Account number must contain only digits'),
  ifsc_code: z.string().min(1, 'IFSC code is required').regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  branch: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
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
  const [isValidatingIFSC, setIsValidatingIFSC] = useState(false)
  const [ifscValidated, setIfscValidated] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank_name: '',
      bank_account_number: '',
      ifsc_code: '',
      branch: '',
      address: '',
      city: '',
      district: '',
      state: '',
    },
  })

  const ifscCode = form.watch('ifsc_code')
  const debouncedIFSC = useDebounce(ifscCode?.toUpperCase().trim(), 500)

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

  // Auto-validate IFSC code when user types
  useEffect(() => {
    if (!debouncedIFSC || debouncedIFSC.length < 11) {
      setIfscValidated(false)
      form.setValue('branch', '')
      form.setValue('address', '')
      form.setValue('city', '')
      form.setValue('district', '')
      form.setValue('state', '')
      return
    }

    // Check if IFSC format is valid before calling API
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(debouncedIFSC)) {
      setIfscValidated(false)
      return
    }

    const validateIFSC = async () => {
      try {
        setIsValidatingIFSC(true)
        setIfscValidated(false)
        const response = await bankAccountsApi.validateIFSC(debouncedIFSC)
        
        if (response.valid) {
          form.setValue('branch', response.branch || '')
          form.setValue('address', response.address || '')
          form.setValue('city', response.city || '')
          form.setValue('district', response.district || '')
          form.setValue('state', response.state || '')
          setIfscValidated(true)
          toast.success('IFSC code validated - branch details auto-filled')
        } else {
          form.setValue('branch', '')
          form.setValue('address', '')
          form.setValue('city', '')
          form.setValue('district', '')
          form.setValue('state', '')
          setIfscValidated(false)
          toast.error(response.error || 'Invalid IFSC code')
        }
      } catch (error) {
        form.setValue('branch', '')
        form.setValue('address', '')
        form.setValue('city', '')
        form.setValue('district', '')
        form.setValue('state', '')
        setIfscValidated(false)
        console.error('Error validating IFSC:', error)
      } finally {
        setIsValidatingIFSC(false)
      }
    }

    validateIFSC()
  }, [debouncedIFSC, form])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const accountData: CreateBankAccountRequest = {
        bank_name: data.bank_name,
        bank_account_number: data.bank_account_number,
        ifsc_code: data.ifsc_code.toUpperCase().trim(),
      }

      const response = await bankAccountsApi.createBankAccount(accountData)

      if (response?.bank_account) {
        toast.success(`Bank account "${data.bank_account_number}" created successfully`)
      } else {
        toast.success(`Bank account created successfully`)
      }

      // Reset form and close dialog after successful creation
      form.reset()
      setIfscValidated(false)
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
    setIfscValidated(false)
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
            Select a bank, enter account number and IFSC code. Branch details will be auto-filled from IFSC.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Bank Name *</FormLabel>
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
                            availableBanks.find((bank) => bank.bank_name === field.value)?.bank_name || field.value
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
                                    form.setValue("bank_name", bank.bank_name)
                                    setOpenBank(false)
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      bank.bank_name === field.value ? "opacity-100" : "opacity-0"
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
                  <FormLabel>IFSC Code *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter IFSC code (e.g., HDFC0001234)"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().trim()
                          field.onChange(value)
                        }}
                        disabled={isLoading}
                        className="uppercase"
                        maxLength={11}
                      />
                      {isValidatingIFSC && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {ifscValidated && !isValidatingIFSC && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter 11-character IFSC code. Branch details will be auto-filled.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('branch') && (
              <div className="space-y-2">
                <FormLabel>Branch</FormLabel>
                <Input
                  value={form.watch('branch')}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>
                  Auto-filled from IFSC code
                </FormDescription>
              </div>
            )}

            {form.watch('address') && (
              <div className="space-y-2">
                <FormLabel>Address</FormLabel>
                <Input
                  value={form.watch('address')}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>
                  Auto-filled from IFSC code
                </FormDescription>
              </div>
            )}

            {form.watch('city') && (
              <div className="space-y-2">
                <FormLabel>City</FormLabel>
                <Input
                  value={form.watch('city')}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>
                  Auto-filled from IFSC code
                </FormDescription>
              </div>
            )}

            {form.watch('state') && (
              <div className="space-y-2">
                <FormLabel>State</FormLabel>
                <Input
                  value={form.watch('state')}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>
                  Auto-filled from IFSC code
                </FormDescription>
              </div>
            )}

            {!ifscValidated && form.watch('ifsc_code') && form.watch('ifsc_code').length === 11 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Invalid IFSC code. Please check and try again.
                </AlertDescription>
              </Alert>
            )}

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
              <Button type="submit" disabled={isLoading || availableBanks.length === 0 || !ifscValidated}>
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
