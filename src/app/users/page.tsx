'use client'

import { useState, useEffect } from 'react'
import { HospitalUser, USER_ROLES, USER_STATUS_OPTIONS } from '@/types/hospitalUsers'
import { HospitalUsersTable } from '@/components/tables/HospitalUsersTable'
import { hospitalUsersApi } from '@/services/hospitalUsersApi'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw, Filter, Download, Users, UserCheck, Shield } from 'lucide-react'
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
import { StatsCardSkeleton } from '@/components/ui/card-skeleton'
import { useDebounce } from '@/hooks/useDebounce'

export default function HospitalUsersPage() {
  const [allUsers, setAllUsers] = useState<HospitalUser[]>([]) // All users from API
  const [filteredUsers, setFilteredUsers] = useState<HospitalUser[]>([]) // Filtered results
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{
    status?: 'active' | 'inactive' | 'pending_password_set'
    role?: string
    search?: string
  }>({})
  const debouncedSearch = useDebounce(filters.search, 300)

  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all users without any filters
      const response = await hospitalUsersApi.getHospitalUsers()
      setAllUsers(response.users)
      setFilteredUsers(response.users) // Initially show all

      toast.success(`${response.users.length} hospital users loaded successfully`)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hospital users'
      console.error('Failed to fetch hospital users:', error)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtering logic
  const applyFilters = () => {
    let filtered = [...allUsers]

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status)
    }

    // Apply role filter
    if (filters.role && filters.role !== 'all') {
      filtered = filtered.filter(user => 
        user.role === filters.role || user.roles?.includes(filters.role!)
      )
    }

    // Apply search filter (using debounced value)
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone_number?.toLowerCase().includes(searchLower) ||
        user.user_id?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredUsers(filtered)
  }

  // Apply filters whenever filters or allUsers change
  // Use debounced search for better performance
  useEffect(() => {
    applyFilters()
  }, [filters.status, filters.role, debouncedSearch, allUsers])

  // Initial load
  useEffect(() => {
    fetchAllUsers()
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

  const handleExportUsers = () => {
    try {
      // Export filtered results
      const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Hospital', 'Created On']
      const csvContent = [
        headers.join(','),
        ...filteredUsers.map(user => [
          user.user_id,
          `"${user.name}"`,
          user.email,
          user.phone_number || '',
          user.roles?.join(';') || user.role,
          user.status,
          `"${user.hospital_name}"`,
          user.created_on
        ].join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hospital_users_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${filteredUsers.length} hospital users to CSV`)
    } catch (error) {
      toast.error('Failed to export hospital users')
    }
  }

  const handleRefresh = () => {
    fetchAllUsers()
  }

  const handleUserUpdate = (updatedUser: HospitalUser) => {
    // Update local state without API call
    setAllUsers(prev =>
      prev.map(user =>
        user.user_id === updatedUser.user_id ? updatedUser : user
      )
    )
  }

  const handleUserCreate = () => {
    // Refresh data after create
    fetchAllUsers()
  }

  // Calculate role-based stats
  const getRoleStats = () => {
    const roleStats = USER_ROLES.reduce((acc, role) => {
      acc[role] = filteredUsers.filter(user => 
        user.role === role || user.roles?.includes(role)
      ).length
      return acc
    }, {} as Record<string, number>)
    return roleStats
  }

  const roleStats = getRoleStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Users</h1>
          <p className="text-gray-600">Manage hospital user accounts and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportUsers} variant="outline" className="gap-2">
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {loading ? (
          <StatsCardSkeleton count={5} />
        ) : (
          <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
            {filteredUsers.length !== allUsers.length && (
              <div className="text-xs text-muted-foreground">of {allUsers.length} total</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredUsers.filter(u => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Setup</CardTitle>
            <Shield className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredUsers.filter(u => u.status === 'pending_password_set').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {roleStats.hospital_admin || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredUsers.filter(u => u.status === 'inactive').length}
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
          <CardDescription>Filter users by status, role, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search users..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full"
            />

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange({ status: value === 'all' ? undefined : value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {USER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.role || 'all'}
              onValueChange={(value) => handleFilterChange({ role: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                <SelectItem value="hospital_user">Hospital User</SelectItem>
                <SelectItem value="rm">Regional Manager</SelectItem>
                <SelectItem value="rp">Regional Partner</SelectItem>
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

      <HospitalUsersTable
        users={filteredUsers}
        loading={loading}
        onUpdate={handleUserUpdate}
        onRefresh={handleUserCreate}
      />
    </div>
  )
}