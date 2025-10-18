'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  IndianRupee,
  Filter,
} from 'lucide-react'
import { tariffsApi } from '@/services/tariffsApi'
import { Tariff } from '@/types/tariffs'
import { toast } from 'sonner'
import EditTariffDialog from '@/components/forms/EditTariffDialog'
import AddTariffDialog from '@/components/forms/AddTariffDialog'
import BulkUploadTariffDialog from '@/components/forms/BulkUploadTariffDialog'
import { StatsCardSkeleton } from '@/components/ui/card-skeleton'
import { TariffsTable } from '@/components/tables/TariffsTable'

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [loading, setLoading] = useState(true)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [payerFilter, setPayerFilter] = useState<string>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchTariffs = async (page = 1) => {
    try {
      setLoading(true)
      const response = await tariffsApi.getTariffs({
        page,
        limit: 50,
        include_inactive: includeInactive,
      })

      setTariffs(response.tariffs)
      setCurrentPage(response.pagination.current_page)
      setTotalPages(response.pagination.total_pages)
      setTotalItems(response.pagination.total_items)
    } catch (error) {
      console.error('Error fetching tariffs:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load tariffs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTariffs(currentPage)
  }, [includeInactive])

  const handleViewDetails = (tariff: Tariff) => {
    setSelectedTariff(tariff)
    setDetailsDialogOpen(true)
  }

  // Get unique payer entries from tariff payer mappings
  const uniquePayers = Array.from(
    new Map(
      tariffs.flatMap(tariff =>
        // Filter out any mappings with missing id or name
        tariff.payer_mappings
          .filter(mapping => mapping?.payer_id && mapping?.payer_name)
          .map(mapping => [
            mapping.payer_id,
            { id: mapping.payer_id, name: mapping.payer_name }
          ])
      )
    ).values()
  ).sort((a, b) => {
    // Provide safe fallback for sort comparison
    const nameA = a?.name || ''
    const nameB = b?.name || ''
    return nameA.localeCompare(nameB)
  })

  const filteredTariffs = tariffs.filter(tariff => {
    // Status filter
    if (statusFilter !== 'all' && tariff.status !== statusFilter) {
      return false
    }

    // Payer filter
    if (payerFilter !== 'all') {
      const hasMatchingPayer = tariff.payer_mappings.some(
        mapping => mapping.payer_name === payerFilter
      )
      if (!hasMatchingPayer) return false
    }

    return true
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Tariff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage hospital tariffs, pricing, and payer mappings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loading ? (
            <StatsCardSkeleton count={4} />
          ) : (
            <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tariffs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tariffs</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tariffs.filter(t => t.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Line Items</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tariffs.reduce((sum, t) => sum + t.line_items.length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payer Mappings</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tariffs.reduce((sum, t) => sum + t.payer_mappings.length, 0)}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter tariffs by status, payer, or include inactive tariffs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status Filter</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payer Filter</label>
                  <Select value={payerFilter} onValueChange={setPayerFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All payers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payers</SelectItem>
                      {uniquePayers.map((payer) => (
                        <SelectItem key={payer.id} value={payer.name}>
                          {payer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Include Inactive</label>
                  <Button
                    variant={includeInactive ? 'default' : 'outline'}
                    onClick={() => setIncludeInactive(!includeInactive)}
                    className="w-full justify-start"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {includeInactive ? 'All Status' : 'Active Only'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Results</label>
                  <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md">
                    <Badge variant="secondary">
                      {filteredTariffs.length} of {totalItems}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(statusFilter !== 'all' || payerFilter !== 'all') && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all')
                      setPayerFilter('all')
                    }}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tariffs Table */}
       
        <TariffsTable
          tariffs={filteredTariffs}
          loading={loading}
          onView={handleViewDetails}
          onAddClick={() => setAddDialogOpen(true)}
          onBulkUploadClick={() => setBulkUploadDialogOpen(true)}
        />
          
        {/* Bulk Upload Dialog */}
        <BulkUploadTariffDialog
          open={bulkUploadDialogOpen}
          onOpenChange={setBulkUploadDialogOpen}
          onSuccess={() => fetchTariffs(1)}
        />

        {/* Add Tariff Dialog */}
        <AddTariffDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={() => fetchTariffs(1)}
        />

        {/* Edit Tariff Dialog */}
        {selectedTariff && (
          <EditTariffDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            tariff={selectedTariff}
            onUpdate={fetchTariffs}
          />
        )}
      </div>
    </MainLayout>
  )
}