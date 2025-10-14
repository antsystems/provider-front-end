'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ClaimsTable from '@/components/tables/ClaimsTable'
import { ClaimDetailsDialog } from '@/components/forms/ClaimDetailsDialog'
import { claimsApi } from '@/services/claimsApi'
import type { Claim } from '@/types/claims'
import { toast } from '@/lib/toast'
import { Inbox, Search, Filter, RefreshCw } from 'lucide-react'

export default function ClaimsInboxPage() {
  const { user } = useAuth()
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  
  // Get hospital ID from logged-in user
  const hospitalId = (user as any)?.hospital_id || 
                     (user as any)?.entity_assignments?.hospitals?.[0]?.id || 
                     null

  useEffect(() => {
    if (user) {
      fetchClaims()
    }
  }, [user, statusFilter, typeFilter])

  const fetchClaims = async () => {
    try {
      setLoading(true)
      
      // Check if user has a hospital assigned
      if (!hospitalId) {
        toast.error('No hospital assigned', {
          description: 'Please contact administrator to assign a hospital to your account'
        })
        setLoading(false)
        return
      }
      
      const params: any = {
        hospital_id: hospitalId,
        limit: 100
      }
      
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.claim_type = typeFilter
      
      const response = await claimsApi.getClaimsList(params)
      
      if (response.success) {
        setClaims(response.claims || [])
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
      toast.error('Failed to load claims', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (claimId: string) => {
    setSelectedClaimId(claimId)
    setDetailsDialogOpen(true)
  }

  const handleDelete = async (claimId: string) => {
    if (!confirm('Are you sure you want to delete this claim?')) return
    
    try {
      await claimsApi.deleteClaim(claimId)
      toast.success('Claim deleted successfully')
      fetchClaims() // Refresh list
    } catch (error) {
      toast.error('Failed to delete claim', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  const filteredClaims = claims.filter(claim => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    const patientName = claim.patient_details?.patient_name || claim.patient_name || ''
    return (
      claim.claim_id?.toLowerCase().includes(search) ||
      patientName.toLowerCase().includes(search)
    )
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Claims Inbox</h1>
            <p className="text-muted-foreground">View and manage submitted claims</p>
          </div>
          <Button onClick={fetchClaims} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Hospital Info */}
        {user && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3">
              <div className="flex items-center gap-2 text-sm">
                <Inbox className="h-4 w-4 text-primary" />
                <span className="font-medium">Viewing claims for:</span>
                <span className="text-muted-foreground">
                  {(user as any)?.hospital_name || 
                   (user as any)?.entity_assignments?.hospitals?.[0]?.name || 
                   'Unknown Hospital'}
                </span>
                <span className="ml-auto text-muted-foreground">
                  Total Claims: <strong>{filteredClaims.length}</strong>
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search and filter claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Claim ID or Patient Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter || 'all'} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="settled">Settled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Claim Type</label>
              <Select value={typeFilter || 'all'} onValueChange={(val) => setTypeFilter(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INPATIENT">Inpatient</SelectItem>
                  <SelectItem value="DIALYSIS">Dialysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims List</CardTitle>
          <CardDescription>
            {loading ? 'Loading claims...' : `Showing ${filteredClaims.length} claim(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading claims...</p>
            </div>
          ) : (
            <ClaimsTable
              claims={filteredClaims}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Claim Details Dialog */}
      <ClaimDetailsDialog
        claimId={selectedClaimId}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  )
}
