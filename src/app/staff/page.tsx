'use client'

import { useState, useEffect } from 'react'
import { Staff } from '@/types/staff'
import { StaffTable } from '@/components/tables/StaffTable'
import { staffApi } from '@/services/staffApi'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw, Filter, Download, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function StaffPage() {
  const [allStaff, setAllStaff] = useState<Staff[]>([]) // All staff from API
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]) // Filtered results
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{
    department_name?: string
    status?: 'active' | 'inactive'
    search?: string
  }>({})
  const [departments, setDepartments] = useState<string[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  const fetchAllStaff = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all staff without any filters
      const response = await staffApi.getStaff()
      setAllStaff(response.staff)
      setFilteredStaff(response.staff) // Initially show all

      toast.success(`${response.count} staff members loaded successfully`)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch staff'
      console.error('Failed to fetch staff:', error)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fetch filter options
  const fetchFilterOptions = async () => {
    setIsLoadingOptions(true)
    try {
      const departmentsResponse = await staffApi.getAvailableDepartments()
      setDepartments(departmentsResponse.departments)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    } finally {
      setIsLoadingOptions(false)
    }
  }

  // Client-side filtering logic
  const applyFilters = () => {
    let filtered = [...allStaff]

    // Apply department filter
    if (filters.department_name && filters.department_name !== 'all') {
      filtered = filtered.filter(staff =>
        staff.department_name?.toLowerCase().includes(filters.department_name!.toLowerCase())
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(staff => staff.status === filters.status)
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(staff =>
        staff.staff_name?.toLowerCase().includes(searchLower) ||
        staff.email?.toLowerCase().includes(searchLower) ||
        staff.contact_number?.toLowerCase().includes(searchLower) ||
        staff.department_name?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredStaff(filtered)
  }

  // Apply filters whenever filters or allStaff change
  useEffect(() => {
    applyFilters()
  }, [filters, allStaff])

  // Initial load
  useEffect(() => {
    fetchAllStaff()
    fetchFilterOptions()
  }, [])

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    // No API call needed - useEffect will handle filtering
  }

  const handleClearFilters = () => {
    setFilters({})
    // No API call needed - useEffect will handle filtering
  }

  const handleExportStaff = () => {
    try {
      // Export filtered results
      const headers = ['Staff ID', 'Staff Name', 'Email', 'Contact Number', 'Department', 'Status']
      const csvContent = [
        headers.join(','),
        ...filteredStaff.map(staff => [
          staff.staff_id,
          `"${staff.staff_name}"`,
          staff.email,
          staff.contact_number,
          `"${staff.department_name}"`,
          staff.status
        ].join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `staff_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${filteredStaff.length} staff members to CSV`)
    } catch (error) {
      toast.error('Failed to export staff')
    }
  }

  const handleRefresh = () => {
    fetchAllStaff()
  }

  const handleStaffUpdate = (updatedStaff: Staff) => {
    // Update local state without API call
    setAllStaff(prev =>
      prev.map(staff =>
        staff.staff_id === updatedStaff.staff_id ? updatedStaff : staff
      )
    )
  }

  const handleStaffDelete = (staffId: string) => {
    // Update local state after delete
    setAllStaff(prev => prev.filter(staff => staff.staff_id !== staffId))
  }

  const handleStaffCreate = () => {
    // Refresh data after create
    fetchAllStaff()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <p className="text-gray-600">Manage and view all staff members in the system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportStaff} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStaff.length}</div>
            {filteredStaff.length !== allStaff.length && (
              <div className="text-xs text-muted-foreground">of {allStaff.length} total</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredStaff.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredStaff.filter(s => s.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter staff by department, status, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search staff..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full"
            />

            <Select
              value={filters.department_name || 'all'}
              onValueChange={(value) => handleFilterChange({ department_name: value === 'all' ? undefined : value })}
              disabled={isLoadingOptions}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingOptions ? "Loading..." : "Select Department"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange({ status: value === 'all' ? undefined : value as 'active' | 'inactive' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleClearFilters} variant="outline" className="gap-2">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              onClick={handleRefresh}
              variant="link"
              className="p-0 h-auto ml-2 text-red-600"
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <StaffTable
        staff={filteredStaff}
        loading={loading}
        onUpdate={handleStaffUpdate}
        onDelete={handleStaffDelete}
        onRefresh={handleStaffCreate}
      />
    </div>
  )
}