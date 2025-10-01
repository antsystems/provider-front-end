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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreatePayerAffiliationRequest, AvailablePayer } from '@/types/payerAffiliations'
import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import { Building, AlertTriangle, Loader2, ChevronsUpDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  payer_id: z.string().min(1, 'Please select a payer'),
})

type FormData = z.infer<typeof formSchema>

interface AddPayerAffiliationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddPayerAffiliationDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddPayerAffiliationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPayers, setIsLoadingPayers] = useState(false)
  const [availablePayers, setAvailablePayers] = useState<AvailablePayer[]>([])
  const [openPayer, setOpenPayer] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payer_id: '',
    },
  })

  // Fetch available payers
  const fetchAvailablePayers = async () => {
    try {
      setIsLoadingPayers(true)
      const response = await payerAffiliationsApi.getAvailablePayers()
      const payers = response?.available_payers || []
      setAvailablePayers(payers.filter(p => p.status === 'active'))
    } catch (error) {
      console.error('Error fetching available payers:', error)
      toast.error('Failed to load available payers')
    } finally {
      setIsLoadingPayers(false)
    }
  }

  useEffect(() => {
    if (open && availablePayers.length === 0) {
      fetchAvailablePayers()
    }
  }, [open])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const selectedPayer = availablePayers.find(p => p.id === data.payer_id)
      if (!selectedPayer) {
        throw new Error('Selected payer not found')
      }

      const affiliationData: CreatePayerAffiliationRequest = {
        payer_name: selectedPayer.name,
      }

      const response = await payerAffiliationsApi.createPayerAffiliation(affiliationData)

      if (response?.affiliation) {
        toast.success(`Payer affiliation with "${response.affiliation.payer_name}" created successfully`)
      } else {
        // Backend returned success but no affiliation data
        toast.success(`Payer affiliation created successfully`)
      }

      // Reset form and close dialog after successful creation
      form.reset()
      onSuccess?.()
      handleClose()

    } catch (error) {
      console.error('Error creating payer affiliation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create payer affiliation')
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Add Payer Affiliation
          </DialogTitle>
          <DialogDescription>
            Create a new payer affiliation for your hospital. Only Hospital Admins can perform this action.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Only Hospital Admins can create payer affiliations.
                  The payer must exist in the system before creating an affiliation.
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="payer_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Payer *</FormLabel>
                    <Popover open={openPayer} onOpenChange={setOpenPayer}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPayer}
                            disabled={isLoading || isLoadingPayers}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {isLoadingPayers ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading payers...
                              </div>
                            ) : field.value ? (
                              availablePayers.find((p) => p.id === field.value)?.name || "Select payer"
                            ) : (
                              "Select a payer to affiliate with"
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[450px] p-0">
                        <Command>
                          <CommandInput placeholder="Search payer..." />
                          <CommandList>
                            <CommandEmpty>
                              {availablePayers.length === 0 ? "No payers available." : "No payer found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {availablePayers.map((payer) => (
                                <CommandItem
                                  value={payer.name}
                                  key={payer.id}
                                  onSelect={() => {
                                    form.setValue("payer_id", payer.id)
                                    setOpenPayer(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      payer.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <div className="font-medium">{payer.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {payer.type} • Code: {payer.code}
                                    </div>
                                  </div>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Affiliation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}