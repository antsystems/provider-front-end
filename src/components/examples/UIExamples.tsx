'use client'

/**
 * UI/UX Enhancement Examples
 *
 * This file demonstrates how to use the new UI components:
 * 1. Skeleton Loaders
 * 2. Empty States
 * 3. Enhanced Toasts
 * 4. Confirmation Dialogs
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'
import { StatCardsSkeleton, DetailCardSkeleton } from '@/components/skeletons/CardSkeleton'
import { EmptyState, EmptySearchResults } from '@/components/ui/empty-state'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/lib/toast'
import { FileText, Users, Search } from 'lucide-react'

export function UIExamplesPage() {
  const [showTableSkeleton, setShowTableSkeleton] = useState(false)
  const [showCardSkeleton, setShowCardSkeleton] = useState(false)
  const confirmDialog = useConfirmDialog()

  // Example 1: Using Enhanced Toasts
  const showToastExamples = () => {
    toast.success('Operation completed successfully!', {
      description: 'Your data has been saved.',
      duration: 3000,
    })

    setTimeout(() => {
      toast.error('Something went wrong!', {
        description: 'Please try again later.',
      })
    }, 1000)

    setTimeout(() => {
      toast.warning('Warning message', {
        description: 'This action requires your attention.',
      })
    }, 2000)

    setTimeout(() => {
      toast.info('Information', {
        description: 'Here is some useful information.',
      })
    }, 3000)
  }

  // Example 2: Using Toast with Action Button
  const showToastWithAction = () => {
    toast.success('Item deleted', {
      description: 'The item has been removed.',
      action: {
        label: 'Undo',
        onClick: () => {
          toast.info('Action restored!')
        },
      },
    })
  }

  // Example 3: Using Confirmation Dialog
  const showConfirmDialog = () => {
    confirmDialog.open({
      title: 'Delete this item?',
      description: 'This action cannot be undone. This will permanently delete the item.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success('Item deleted successfully')
      },
    })
  }

  // Example 4: Using Warning Confirmation
  const showWarningDialog = () => {
    confirmDialog.open({
      title: 'Are you sure?',
      description: 'This will affect multiple records. Please confirm this action.',
      confirmText: 'Continue',
      cancelText: 'Cancel',
      variant: 'warning',
      onConfirm: async () => {
        toast.success('Action completed')
      },
    })
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">UI/UX Enhancements</h1>
        <p className="text-muted-foreground">
          Examples of the new components and how to use them
        </p>
      </div>

      {/* Toast Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Enhanced Toasts</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={showToastExamples}>Show All Toast Types</Button>
          <Button onClick={showToastWithAction} variant="outline">
            Toast with Action
          </Button>
        </div>
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { toast } from '@/lib/toast'

// Success toast
toast.success('Success message', {
  description: 'Optional description',
  duration: 4000,
})

// Error toast
toast.error('Error message', {
  description: 'What went wrong',
})

// With action button
toast.success('Item deleted', {
  action: {
    label: 'Undo',
    onClick: () => handleUndo(),
  },
})`}
        </pre>
      </section>

      {/* Confirmation Dialog Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Confirmation Dialogs</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={showConfirmDialog} variant="destructive">
            Show Delete Confirmation
          </Button>
          <Button onClick={showWarningDialog} variant="outline">
            Show Warning Dialog
          </Button>
        </div>
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { useConfirmDialog } from '@/components/ui/confirm-dialog'

const confirmDialog = useConfirmDialog()

// Show confirmation
confirmDialog.open({
  title: 'Delete this item?',
  description: 'This action cannot be undone.',
  confirmText: 'Delete',
  variant: 'destructive',
  onConfirm: async () => {
    await deleteItem()
    toast.success('Deleted!')
  },
})

// Variants: 'default' | 'destructive' | 'warning' | 'info'`}
        </pre>
      </section>

      {/* Skeleton Loaders */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Skeleton Loaders</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setShowTableSkeleton(!showTableSkeleton)}>
            Toggle Table Skeleton
          </Button>
          <Button onClick={() => setShowCardSkeleton(!showCardSkeleton)} variant="outline">
            Toggle Card Skeleton
          </Button>
        </div>

        {showTableSkeleton && (
          <div>
            <h3 className="text-lg font-medium mb-4">Table Skeleton</h3>
            <TableSkeleton rows={5} columns={6} />
          </div>
        )}

        {showCardSkeleton && (
          <div>
            <h3 className="text-lg font-medium mb-4">Card Skeletons</h3>
            <StatCardsSkeleton count={4} />
          </div>
        )}

        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { TableSkeleton } from '@/components/skeletons/TableSkeleton'
import { StatCardsSkeleton } from '@/components/skeletons/CardSkeleton'

// Show while loading
{loading ? (
  <TableSkeleton rows={10} columns={6} />
) : (
  <YourTable data={data} />
)}`}
        </pre>
      </section>

      {/* Empty States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Empty States</h2>

        <div className="border rounded-lg">
          <h3 className="text-lg font-medium p-4 border-b">No Items</h3>
          <EmptyState
            icon={FileText}
            title="No documents found"
            description="Get started by creating your first document"
            action={{
              label: 'Create Document',
              onClick: () => toast.info('Create button clicked'),
            }}
          />
        </div>

        <div className="border rounded-lg">
          <h3 className="text-lg font-medium p-4 border-b">No Search Results</h3>
          <EmptySearchResults
            searchQuery="test query"
            onClearSearch={() => toast.info('Search cleared')}
          />
        </div>

        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { EmptyState, EmptySearchResults } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

// Empty state with action
<EmptyState
  icon={FileText}
  title="No items found"
  description="Start by adding your first item"
  action={{
    label: 'Add Item',
    onClick: handleAdd,
  }}
/>

// Search empty state
<EmptySearchResults
  searchQuery={query}
  onClearSearch={handleClear}
/>`}
        </pre>
      </section>
    </div>
  )
}
