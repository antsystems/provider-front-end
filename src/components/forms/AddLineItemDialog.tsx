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
import { CreateLineItemRequest } from '@/types/tariffs'
import { tariffsApi } from '@/services/tariffsApi'
import { IndianRupee, FileText } from 'lucide-react'
import { toast } from 'sonner'

const lineItemSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  line_item: z.string().min(1, 'Line item name is required'),
  amount: z.number().min(0, 'Amount must be 0 or greater'),
  description: z.string().optional(),
})

type LineItemFormValues = z.infer<typeof lineItemSchema>

interface AddLineItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tariffId: string
  onSuccess?: () => void
}

export default function AddLineItemDialog({
  open,
  onOpenChange,
  tariffId,
  onSuccess,
}: AddLineItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LineItemFormValues>({
    resolver: zodResolver(lineItemSchema),
    defaultValues: {
      code: '',
      line_item: '',
      amount: 0,
      description: '',
    },
  })

  const onSubmit = async (values: LineItemFormValues) => {
    setIsLoading(true)
    try {
      const createData: CreateLineItemRequest = {
        code: values.code,
        line_item: values.line_item,
        amount: values.amount,
        description: values.description || undefined,
      }

      await tariffsApi.addLineItem(tariffId, createData)

      toast.success('Line item added successfully')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error adding line item:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add line item')
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Add Line Item
          </DialogTitle>
          <DialogDescription>
            Add a new line item to this tariff.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., C001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="line_item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Consultation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Line Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}