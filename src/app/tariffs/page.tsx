'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  FileText,
  Calendar,
  IndianRupee,
  Filter,
  Eye,
  Upload
} from 'lucide-react'
import { tariffsApi } from '@/services/tariffsApi'
import { Tariff } from '@/types/tariffs'
import { toast } from 'sonner'
import EditTariffDialog from '@/components/forms/EditTariffDialog'
import AddTariffDialog from '@/components/forms/AddTariffDialog'
import BulkUploadTariffDialog from '@/components/forms/BulkUploadTariffDialog'

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false)

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

  const filteredTariffs = tariffs.filter(tariff => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      tariff.tariff_name.toLowerCase().includes(query) ||
      tariff.tariff_id.toLowerCase().includes(query) ||
      tariff.hospital_name.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-500">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tariff Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage hospital tariffs, pricing, and payer mappings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBulkUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tariff
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tariff name, ID, or hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={includeInactive ? 'default' : 'outline'}
                  onClick={() => setIncludeInactive(!includeInactive)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {includeInactive ? 'All Status' : 'Active Only'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tariffs Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading tariffs...</p>
              </div>
            ) : filteredTariffs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tariffs found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search' : 'Get started by adding a new tariff'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Tariff ID</th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Valid Period</th>
                      <th className="text-left py-3 px-4 font-medium">Line Items</th>
                      <th className="text-left py-3 px-4 font-medium">Payer Mappings</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTariffs.map((tariff) => (
                      <tr key={tariff.tariff_id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm">{tariff.tariff_id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{tariff.tariff_name}</div>
                          {tariff.document_name && (
                            <div className="text-xs text-muted-foreground">{tariff.document_name}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            Created by: {tariff.created_by_name || 'Unknown'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(tariff.tariff_start_date)}
                          </div>
                          {tariff.tariff_end_date && (
                            <div className="text-xs text-muted-foreground">
                              to {formatDate(tariff.tariff_end_date)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{tariff.line_items.length} items</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{tariff.payer_mappings.length} mappings</Badge>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(tariff.status)}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(tariff)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredTariffs.length} of {totalItems} tariffs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => fetchTariffs(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => fetchTariffs(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => fetchTariffs(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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