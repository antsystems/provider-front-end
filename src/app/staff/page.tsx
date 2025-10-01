'use client'

import { useState, useEffect } from 'react'
import { Staff } from '@/types/staff'
import { StaffTable } from '@/components/tables/StaffTable'
import { staffApi } from '@/services/staffApi'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw, Filter, Download, Users, ChevronsUpDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function StaffPage() {
  const [allStaff, setAllStaff] = useState<Staff[]>([]) // All staff from API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState<{
    department_name?: string
    status?: 'active' | 'inactive'
    search?: string
  }>({})
  const [departments, setDepartments] = useState<string[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [openDepartment, setOpenDepartment] = useState(false)

  const fetchAllStaff = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch staff with pagination and filters
      const response = await staffApi.getStaff({
        page,
        limit: 100,
        department_name: filters.department_name,
        status: filters.status,
      })

      setAllStaff(response.staff)
      setCurrentPage(response.pagination.current_page)
      setTotalPages(response.pagination.total_pages)
      setTotalItems(response.pagination.total_items)

      toast.success(`${response.pagination.total_items} staff members loaded successfully`)

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
      const response = await staffApi.getAvailableDepartments()
      setDepartments(response.department_names || [])
    } catch (error) {
      console.error('Error fetching available departments:', error)
      toast.error('Failed to load departments')
    } finally {
      setIsLoadingOptions(false)
    }
  }

  // Get filtered staff for display (client-side search only)
  const getFilteredStaff = () => {
    if (!filters.search) return allStaff

    const searchLower = filters.search.toLowerCase()
    return allStaff.filter(staff =>
      staff.name?.toLowerCase().includes(searchLower) ||
      staff.email?.toLowerCase().includes(searchLower) ||
      staff.phone_number?.toLowerCase().includes(searchLower) ||
      staff.department?.toLowerCase().includes(searchLower) ||
      staff.designation?.toLowerCase().includes(searchLower) ||
      staff.staff_id?.toLowerCase().includes(searchLower)
    )
  }

  const filteredStaff = getFilteredStaff()

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Fetch staff on mount and when filters change
  useEffect(() => {
    fetchAllStaff(1)
  }, [filters.department_name, filters.status])

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleExportStaff = () => {
    try {
      // Export filtered results
      const headers = ['Staff ID', 'Name', 'Email', 'Phone Number', 'Department', 'Designation', 'Qualification', 'Experience (Years)', 'Status']
      const csvContent = [
        headers.join(','),
        ...filteredStaff.map(staff => [
          staff.staff_id,
          `"${staff.name}"`,
          staff.email,
          staff.phone_number,
          `"${staff.department}"`,
          `"${staff.designation}"`,
          `"${staff.qualification}"`,
          staff.experience_years,
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
    fetchAllStaff(currentPage)
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

            <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDepartment}
                  className="w-full justify-between"
                  disabled={isLoadingOptions}
                >
                  {filters.department_name
                    ? departments.find((dept) => dept === filters.department_name)
                    : isLoadingOptions ? "Loading..." : "Select Department"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search department..." />
                  <CommandList>
                    <CommandEmpty>No department found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          handleFilterChange({ department_name: undefined })
                          setOpenDepartment(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !filters.department_name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All Departments
                      </CommandItem>
                      {departments.map((department) => (
                        <CommandItem
                          key={department}
                          value={department}
                          onSelect={(currentValue) => {
                            handleFilterChange({ department_name: currentValue })
                            setOpenDepartment(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.department_name === department ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {department}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

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