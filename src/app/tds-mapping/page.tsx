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
  Filter,
  Percent,
  Building,
  IndianRupee,
  Calendar,
  User,
  Edit2,
  Trash2
} from 'lucide-react'
import { tdsMappingApi } from '@/services/tdsMappingApi'
import { TDSMapping, Pagination } from '@/types/tdsMapping'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import AddTDSMappingDialog from '@/components/forms/AddTDSMappingDialog'
import EditTDSMappingDialog from '@/components/forms/EditTDSMappingDialog'
import { StatsCardSkeleton } from '@/components/ui/card-skeleton'

export default function TDSMappingPage() {
  const [tdsMappings, setTdsMappings] = useState<TDSMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedMapping, setSelectedMapping] = useState<TDSMapping | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const confirmDialog = useConfirmDialog()

  const fetchTDSMappings = async (page = 1) => {
    try {
      setLoading(true)
      const params: any = {
        page,
        per_page: 50
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await tdsMappingApi.getTDSMappings(params)
      setTdsMappings(response.tds_mappings)
      setPagination(response.pagination)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching TDS mappings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load TDS mappings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTDSMappings(1)
  }, [statusFilter])

  const filteredTdsMappings = tdsMappings.filter(mapping => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      mapping.provider_name.toLowerCase().includes(query) ||
      mapping.payer_name.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-500">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const handleEdit = (mapping: TDSMapping) => {
    setSelectedMapping(mapping)
    setEditDialogOpen(true)
  }

  const handleDelete = async (mappingId: string) => {
    confirmDialog.open({
      title: 'Delete TDS Mapping',
      description: 'Are you sure you want to delete this TDS mapping? This will set its status to inactive.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          setDeletingId(mappingId)
          await tdsMappingApi.deleteTDSMapping(mappingId)
          toast.success('TDS mapping deleted successfully')
          fetchTDSMappings(currentPage)
        } catch (error) {
          console.error('Error deleting TDS mapping:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to delete TDS mapping')
        } finally {
          setDeletingId(null)
        }
      }
    })
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Percent className="h-8 w-8 text-primary" />
              TDS Mapping
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage Tax Deducted at Source mappings for providers and payers
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-5 w-5" />
            Add TDS Mapping
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loading ? (
            <StatsCardSkeleton count={4} />
          ) : (
            <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mappings</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tdsMappings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <IndianRupee className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tdsMappings.filter(m => m.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tdsMappings.filter(m => m.status === 'inactive').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg TDS %</CardTitle>
              <Percent className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tdsMappings.length > 0
                  ? (tdsMappings.reduce((sum, m) => sum + m.tds_percentage, 0) / tdsMappings.length).toFixed(2)
                  : '0.00'}%
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by provider or payer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* TDS Mappings List */}
        {loading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        ) : filteredTdsMappings.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No TDS mappings found</p>
                <p className="text-sm">Get started by adding your first TDS mapping</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTdsMappings.map((mapping) => (
              <Card key={mapping.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Provider and Payer */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Provider</div>
                            <div className="font-semibold">{mapping.provider_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Payer</div>
                            <div className="font-semibold">{mapping.payer_name}</div>
                          </div>
                        </div>
                      </div>

                      {/* TDS Percentage */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-primary" />
                          <div>
                            <div className="text-xs text-muted-foreground">TDS Percentage</div>
                            <div className="text-lg font-bold text-primary">{mapping.tds_percentage}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Effective Date */}
                      {mapping.effective_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Effective Date</div>
                            <div className="font-medium">{formatDate(mapping.effective_date)}</div>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {mapping.description && (
                        <div className="text-sm text-muted-foreground">
                          {mapping.description}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Created by: {mapping.created_by_email}
                        </div>
                        <div>•</div>
                        <div>Created: {formatDate(mapping.created_on)}</div>
                        {mapping.updated_on !== mapping.created_on && (
                          <>
                            <div>•</div>
                            <div>Updated: {formatDate(mapping.updated_on)}</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {getStatusBadge(mapping.status)}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(mapping)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(mapping.id)}
                          disabled={deletingId === mapping.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add TDS Mapping Dialog */}
      <AddTDSMappingDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => fetchTDSMappings(currentPage)}
      />

      {/* Edit TDS Mapping Dialog */}
      {selectedMapping && (
        <EditTDSMappingDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          mapping={selectedMapping}
          onSuccess={() => fetchTDSMappings(currentPage)}
        />
      )}
    </MainLayout>
  )
}
