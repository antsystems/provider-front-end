'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import DepartmentsTable from '@/components/tables/DepartmentsTable'
import { departmentsApi } from '@/services/departmentsApi'
import { Department, DEPARTMENT_TYPE_OPTIONS, DEPARTMENT_STATUS_OPTIONS } from '@/types/departments'
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
import { Building2, FileText, TrendingUp, Download, Filter, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

export default function DepartmentsPage() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchDepartments = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await departmentsApi.getDepartments({
        page,
        limit: 50,
        include_inactive: includeInactive,
      })
      setDepartments(response.departments)
      setCurrentPage(response.pagination.current_page)
      setTotalPages(response.pagination.total_pages)
      setTotalItems(response.pagination.total_items)
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments(1)
  }, [includeInactive])

  // Client-side filtering
  const filteredDepartments = useMemo(() => {
    return departments.filter(department => {
      const statusMatch = statusFilter === 'all' || department.status === statusFilter
      const typeMatch = typeFilter === 'all' || department.department_type === typeFilter
      return statusMatch && typeMatch
    })
  }, [departments, statusFilter, typeFilter])

  // Statistics
  const stats = useMemo(() => {
    const totalDepartments = departments.length
    const activeDepartments = departments.filter(d => d.status === 'active').length
    const inactiveDepartments = departments.filter(d => d.status === 'inactive').length

    const typeBreakdown = DEPARTMENT_TYPE_OPTIONS.reduce((acc, type) => {
      acc[type.value] = departments.filter(d => d.department_type === type.value).length
      return acc
    }, {} as Record<string, number>)

    return {
      total: totalDepartments,
      active: activeDepartments,
      inactive: inactiveDepartments,
      types: typeBreakdown
    }
  }, [departments])

  const handleExport = () => {
    if (filteredDepartments.length === 0) {
      toast.error('No data to export')
      return
    }

    const csvData = [
      ['ID', 'Department Name', 'Type', 'Contact Person', 'Phone', 'Email', 'Status', 'Created On'].join(','),
      ...filteredDepartments.map(dept => [
        dept.department_id,
        `"${dept.department_name}"`,
        dept.department_type,
        `"${dept.point_of_contact}"`,
        dept.phone_no,
        dept.email_id,
        dept.status,
        new Date(dept.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `departments-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast.success('Departments exported successfully')
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setTypeFilter('all')
    setIncludeInactive(false)
  }

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || includeInactive

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Departments</h1>
            <p className="text-muted-foreground mt-1">
              Manage hospital departments and their staff members
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2"
              disabled={filteredDepartments.length === 0}
            >
              <Download className="h-4 w-4" />
              Export ({filteredDepartments.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => fetchDepartments(currentPage)}
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All departments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Departments</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Not operational
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Filter departments by status and type</CardDescription>
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
                    {DEPARTMENT_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {DEPARTMENT_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Include Inactive</label>
                <Select
                  value={includeInactive ? 'yes' : 'no'}
                  onValueChange={(value) => setIncludeInactive(value === 'yes')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Results</label>
                <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md">
                  <Badge variant="secondary">
                    {filteredDepartments.length} of {stats.total}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>
              {user?.role === 'hospital_admin'
                ? 'Manage all departments for your hospital'
                : 'View departments for your hospital'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentsTable
              departments={filteredDepartments}
              loading={loading}
              onRefresh={() => fetchDepartments(currentPage)}
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                onPageChange: fetchDepartments,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}