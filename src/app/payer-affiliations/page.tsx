'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import PayerAffiliationsTable from '@/components/tables/PayerAffiliationsTable'
import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import { PayerAffiliation, PAYER_AFFILIATION_STATUS_OPTIONS, PAYER_TYPES } from '@/types/payerAffiliations'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, FileText, TrendingUp, Download, Filter, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { StatsCardSkeleton } from '@/components/ui/card-skeleton'

export default function PayerAffiliationsPage() {
  const { user } = useAuth()
  const [affiliations, setAffiliations] = useState<PayerAffiliation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [payerTypeFilter, setPayerTypeFilter] = useState<string>('all')

  const fetchAffiliations = async () => {
    try {
      setLoading(true)
      const response = await payerAffiliationsApi.getPayerAffiliations()
      setAffiliations(response.affiliations)
    } catch (error) {
      console.error('Error fetching payer affiliations:', error)
      toast.error('Failed to load payer affiliations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAffiliations()
  }, [])

  // Client-side filtering
  const filteredAffiliations = useMemo(() => {
    return affiliations.filter(affiliation => {
      const statusMatch = statusFilter === 'all' || affiliation.status === statusFilter
      const typeMatch = payerTypeFilter === 'all' || affiliation.payer_type === payerTypeFilter
      return statusMatch && typeMatch
    })
  }, [affiliations, statusFilter, payerTypeFilter])

  // Statistics
  const stats = useMemo(() => {
    const totalAffiliations = affiliations.length
    const activeAffiliations = affiliations.filter(a => a.status === 'active').length
    const inactiveAffiliations = affiliations.filter(a => a.status === 'inactive').length

    const payerTypeBreakdown = PAYER_TYPES.reduce((acc, type) => {
      acc[type] = affiliations.filter(a => a.payer_type === type).length
      return acc
    }, {} as Record<string, number>)

    return {
      total: totalAffiliations,
      active: activeAffiliations,
      inactive: inactiveAffiliations,
      payerTypes: payerTypeBreakdown
    }
  }, [affiliations])

  const handleExport = () => {
    if (filteredAffiliations.length === 0) {
      toast.error('No data to export')
      return
    }

    const csvData = [
      ['ID', 'Payer Name', 'Payer Code', 'Payer Type', 'Status', 'Created By', 'Created On'].join(','),
      ...filteredAffiliations.map(affiliation => [
        affiliation.id,
        `"${affiliation.payer_name}"`,
        affiliation.payer_code,
        affiliation.payer_type,
        affiliation.status,
        affiliation.created_by_email,
        new Date(affiliation.created_on).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payer-affiliations-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast.success('Payer affiliations exported successfully')
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setPayerTypeFilter('all')
  }

  const hasActiveFilters = statusFilter !== 'all' || payerTypeFilter !== 'all'

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payer Affiliations</h1>
            <p className="text-muted-foreground mt-1">
              Manage hospital payer affiliations and insurance partnerships
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2"
              disabled={filteredAffiliations.length === 0}
            >
              <Download className="h-4 w-4" />
              Export ({filteredAffiliations.length})
            </Button>
            <Button
              variant="outline"
              onClick={fetchAffiliations}
              disabled={loading}
              className="gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <StatsCardSkeleton count={4} />
          ) : (
            <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Affiliations</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All payer affiliations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Affiliations</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Available for claims
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Affiliations</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Not available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payer Types</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.payerTypes)
                  .filter(([_, count]) => count > 0)
                  .slice(0, 2)
                  .map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Filter affiliations by status and payer type</CardDescription>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <Filter className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {PAYER_AFFILIATION_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payer Type</label>
                <Select value={payerTypeFilter} onValueChange={setPayerTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {PAYER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Results</label>
                <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md">
                  <Badge variant="secondary">
                    {filteredAffiliations.length} of {stats.total}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payer Affiliations</CardTitle>
            <CardDescription>
              {user?.role === 'hospital_admin'
                ? 'Manage all payer affiliations for your hospital'
                : 'View payer affiliations for your hospital'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayerAffiliationsTable
              affiliations={filteredAffiliations}
              loading={loading}
              onRefresh={fetchAffiliations}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}