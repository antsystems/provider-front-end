'use client'

import { useState, useEffect } from 'react'
import { Doctor, DoctorsApiFilters } from '@/types/doctors'
import { DoctorsTable } from '@/components/tables/DoctorsTable'
import { doctorsApi } from '@/services/doctorsApi'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw, Filter, Download, Users, Upload } from 'lucide-react'
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


export default function DoctorsPage() {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]) // All doctors from API
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]) // Filtered results
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{
    specialty_name?: string
    department_name?: string
    status?: 'active' | 'inactive'
    search?: string
  }>({})
  const debouncedSearch = useDebounce(filters.search, 300)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
 
  const fetchAllDoctors = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all doctors without any filters
      const response = await doctorsApi.getDoctors()
      setAllDoctors(response.doctors)
      setFilteredDoctors(response.doctors) // Initially show all

      toast.success(`${response.pagination.total_items} doctors loaded successfully`)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch doctors'
      console.error('Failed to fetch doctors:', error)
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
      const [specialtiesResponse, departmentsResponse] = await Promise.all([
        doctorsApi.getAvailableSpecialties(),
        doctorsApi.getAvailableDepartments()
      ])
  // Normalize and deduplicate specialties and departments to avoid duplicate keys
  const specialtiesList: string[] = specialtiesResponse.specialty_names ?? []
  const dedupedSpecialties = Array.from(new Set(specialtiesList.map(s => (s || '').trim()).filter(Boolean)))
  setSpecialties(dedupedSpecialties)

  const depList: string[] = departmentsResponse.department_names ?? []
  const dedupedDepartments = Array.from(new Set(depList.map(d => (d || '').trim()).filter(Boolean)))
  setDepartments(dedupedDepartments)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    } finally {
      setIsLoadingOptions(false)
    }
  }

  // Client-side filtering logic
  const applyFilters = () => {
    let filtered = [...allDoctors]

    // Apply specialty filter
    if (filters.specialty_name && filters.specialty_name !== 'all') {
      filtered = filtered.filter(doctor =>
        doctor.specialty_name?.toLowerCase().includes(filters.specialty_name!.toLowerCase())
      )
    }

    // Apply department filter
    if (filters.department_name && filters.department_name !== 'all') {
      filtered = filtered.filter(doctor =>
        doctor.department_name?.toLowerCase().includes(filters.department_name!.toLowerCase())
      )
    }

    // Apply status filter
    if (filters.status) {
      const isActive = filters.status === 'active' ? 1 : 0
      filtered = filtered.filter(doctor => doctor.IsActive === isActive)
    }

    // Apply search filter (using debounced value)
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      filtered = filtered.filter(doctor =>
        doctor.doctor_name?.toLowerCase().includes(searchLower) ||
        doctor.email?.toLowerCase().includes(searchLower) ||
        doctor.contact_number?.toLowerCase().includes(searchLower) ||
        doctor.phone_number?.toLowerCase().includes(searchLower) ||
        doctor.specialty_name?.toLowerCase().includes(searchLower) ||
        doctor.department_name?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredDoctors(filtered)
  }

  // Apply filters whenever filters or allDoctors change
  // Use debounced search for better performance
  useEffect(() => {
    applyFilters()
  }, [filters.specialty_name, filters.department_name, filters.status, debouncedSearch, allDoctors])

  // Initial load
  useEffect(() => {
    fetchAllDoctors()
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

  const handleExportDoctors = () => {
    try {
      // Export filtered results
      const headers = ['Doctor ID', 'Doctor Name', 'Email', 'Contact Number', 'Specialty', 'Department', 'Status']
      const csvContent = [
        headers.join(','),
        ...filteredDoctors.map(doctor => [
          doctor.doctor_id,
          `"${doctor.doctor_name}"`,
          doctor.email,
          doctor.contact_number || doctor.phone_number || '',
          `"${doctor.specialty_name}"`,
          `"${doctor.department_name}"`,
          doctor.IsActive === 1 ? 'Active' : 'Inactive'
        ].join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `doctors_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${filteredDoctors.length} doctors to CSV`)
    } catch (error) {
      toast.error('Failed to export doctors')
    }
  }

  const handleRefresh = () => {
    fetchAllDoctors()
  }

  const handleDoctorUpdate = (updatedDoctor: Doctor) => {
    // Update local state without API call
    setAllDoctors(prev =>
      prev.map(doctor =>
        doctor.doctor_id === updatedDoctor.doctor_id ? updatedDoctor : doctor
      )
    )
  }

  const handleDoctorDelete = (doctorId: string) => {
    // Update local state after delete
    setAllDoctors(prev => prev.filter(doctor => doctor.doctor_id !== doctorId))
  }

  const handleDoctorCreate = () => {
    // Refresh data after create
    fetchAllDoctors()
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-gray-600">Manage and view all doctors in the system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportDoctors} variant="outline" className="gap-2">
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
        {loading ? (
          <StatsCardSkeleton count={4} />
        ) : (
          <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDoctors.length}</div>
            {filteredDoctors.length !== allDoctors.length && (
              <div className="text-xs text-muted-foreground">of {allDoctors.length} total</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredDoctors.filter(d => d.IsActive === 1).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specialties</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{specialties.length}</div>
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
          <CardDescription>Filter doctors by specialty, department, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search doctors..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full"
            />
            <Select
              value={filters.specialty_name || 'all'}
              onValueChange={(value) => handleFilterChange({ specialty_name: value === 'all' ? undefined : value })}
              disabled={isLoadingOptions}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty, i) => (
                  <SelectItem key={`${specialty}-${i}`} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.department_name || 'all'}
              onValueChange={(value) => handleFilterChange({ department_name: value === 'all' ? undefined : value })}
              disabled={isLoadingOptions}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department, i) => (
                  <SelectItem key={`${department}-${i}`} value={department}>
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

      <DoctorsTable
        doctors={filteredDoctors}
        loading={loading}
        onUpdate={handleDoctorUpdate}
        onDelete={handleDoctorDelete}
        onRefresh={handleDoctorCreate}
      />

     
    </div>
  )
}