'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import { specialtyAffiliationsApi } from '@/services/specialtyAffiliationsApi'
import { Specialty } from '@/types/specialtyAffiliations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Stethoscope, Search, CheckCircle2, Circle, RotateCcw, ListFilter, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { StatsCardSkeleton } from '@/components/ui/card-skeleton'
import { SpecialtyMultiSelect } from '@/components/specialty/SpecialtyMultiSelect'
import { VirtualizedSpecialtyList } from '@/components/specialty/VirtualizedSpecialtyList'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function SpecialtiesPage() {
  const { user } = useAuth()
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set())
  const [initialSelectedSpecialties, setInitialSelectedSpecialties] = useState<Set<string>>(new Set())
  const [specialtyToRemove, setSpecialtyToRemove] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)

  const fetchSpecialties = async () => {
    try {
      setLoading(true)
      const response = await specialtyAffiliationsApi.getAvailableSpecialties()
      setSpecialties(response.specialties)
    } catch (error) {
      console.error('Error fetching available specialties:', error)
      toast.error('Failed to load available specialties')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentAffiliation = async () => {
    try {
      const response = await specialtyAffiliationsApi.getSpecialtyAffiliation()

      // Check if we have an affiliation
      if (response.affiliation && response.affiliation.affiliated_specialties) {
        const affiliatedIds = response.affiliation.affiliated_specialties.map(
          s => s.specialty_id
        )
        const affiliatedSet = new Set(affiliatedIds)
        setSelectedSpecialties(affiliatedSet)
        setInitialSelectedSpecialties(affiliatedSet)
      } else if (response.affiliated_specialties) {
        // Fallback for alternative response structure
        const affiliatedIds = response.affiliated_specialties.map(s => s.specialty_id)
        const affiliatedSet = new Set(affiliatedIds)
        setSelectedSpecialties(affiliatedSet)
        setInitialSelectedSpecialties(affiliatedSet)
      }
    } catch (error) {
      console.error('Error fetching current affiliation:', error)
      // Don't show error toast as it's normal to not have an affiliation yet
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSpecialties(), fetchCurrentAffiliation()])
    }
    loadData()
  }, [])

  // Filter specialties based on search query
  const filteredSpecialties = useMemo(() => {
    if (!searchQuery) return specialties

    const query = searchQuery.toLowerCase()
    return specialties.filter(specialty =>
      specialty.specialty_name?.toLowerCase().includes(query) ||
      specialty.specialty_code?.toLowerCase().includes(query) ||
      specialty.description?.toLowerCase().includes(query)
    )
  }, [specialties, searchQuery])

  // Get selected specialties with full details
  const selectedSpecialtiesWithDetails = useMemo(() => {
    return specialties.filter(s => selectedSpecialties.has(s.specialty_id))
  }, [specialties, selectedSpecialties])

  // Check if there are changes from initial state
  const hasChanges = useMemo(() => {
    if (selectedSpecialties.size !== initialSelectedSpecialties.size) return true

    for (const id of selectedSpecialties) {
      if (!initialSelectedSpecialties.has(id)) return true
    }
    return false
  }, [selectedSpecialties, initialSelectedSpecialties])

  const toggleSpecialty = (specialtyId: string) => {
    const newSelected = new Set(selectedSpecialties)
    if (newSelected.has(specialtyId)) {
      newSelected.delete(specialtyId)
    } else {
      newSelected.add(specialtyId)
    }
    setSelectedSpecialties(newSelected)
  }

  const selectAll = () => {
    const allIds = new Set(filteredSpecialties.map(s => s.specialty_id))
    setSelectedSpecialties(allIds)
  }

  const deselectAll = () => {
    setSelectedSpecialties(new Set())
  }

  const handleSave = async () => {
    if (selectedSpecialties.size === 0) {
      toast.error('Please select at least one specialty')
      return
    }

    try {
      setSaving(true)
      
      // Calculate which specialties to add and remove
      const toAdd = Array.from(selectedSpecialties).filter(
        id => !initialSelectedSpecialties.has(id)
      )
      const toRemove = Array.from(initialSelectedSpecialties).filter(
        id => !selectedSpecialties.has(id)
      )

      let successMessage = ''

      // If no initial selection, use createOrUpdate to set all at once
      if (initialSelectedSpecialties.size === 0) {
        const response = await specialtyAffiliationsApi.createOrUpdateSpecialtyAffiliation({
          specialty_ids: Array.from(selectedSpecialties)
        })
        successMessage = `Successfully affiliated with ${response.affiliation.specialty_count} specialties`
      } else {
        // Otherwise, add new ones and remove old ones
        const promises = []
        
        if (toAdd.length > 0) {
          promises.push(
            specialtyAffiliationsApi.addSpecialties({
              specialty_ids: toAdd
            })
          )
        }
        
        // Remove specialties one by one
        toRemove.forEach(id => {
          promises.push(specialtyAffiliationsApi.removeSpecialty(id))
        })

        await Promise.all(promises)
        
        const addedMsg = toAdd.length > 0 ? `Added ${toAdd.length}` : ''
        const removedMsg = toRemove.length > 0 ? `Removed ${toRemove.length}` : ''
        const separator = addedMsg && removedMsg ? ', ' : ''
        successMessage = `Successfully updated: ${addedMsg}${separator}${removedMsg} specialties`
      }

      toast.success(successMessage)

      // Update initial state to match current selection
      setInitialSelectedSpecialties(new Set(selectedSpecialties))
    } catch (error: any) {
      console.error('Error saving specialty affiliation:', error)
      toast.error(error.message || 'Failed to save specialty affiliation')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveSpecialty = async () => {
    if (!specialtyToRemove) return

    try {
      setRemoving(true)
      const response = await specialtyAffiliationsApi.removeSpecialty(specialtyToRemove)

      toast.success(`Specialty removed. ${response.remaining_specialties} remaining.`)

      // Remove from selected set
      const newSelected = new Set(selectedSpecialties)
      newSelected.delete(specialtyToRemove)
      setSelectedSpecialties(newSelected)
      setInitialSelectedSpecialties(newSelected)

      setSpecialtyToRemove(null)
    } catch (error: any) {
      console.error('Error removing specialty:', error)
      toast.error(error.message || 'Failed to remove specialty')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Specialty Affiliations</h1>
            <p className="text-muted-foreground mt-1">
              Select medical specialties that your hospital provides
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await Promise.all([fetchSpecialties(), fetchCurrentAffiliation()])
              }}
              disabled={loading || saving}
              className="gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {user?.role === 'hospital_admin' && (
              <Button
                onClick={handleSave}
                disabled={!hasChanges || selectedSpecialties.size === 0 || saving}
                className="gap-2"
              >
                <CheckCircle2 className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : `Save Selection (${selectedSpecialties.size})`}
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <StatsCardSkeleton count={3} />
          ) : (
            <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Specialties</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{specialties.length}</div>
              <p className="text-xs text-muted-foreground">
                Available specialties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{selectedSpecialties.size}</div>
              <p className="text-xs text-muted-foreground">
                Specialties selected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredSpecialties.length}</div>
              <p className="text-xs text-muted-foreground">
                Matching your search
              </p>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Quick Select with Combobox */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ListFilter className="h-5 w-5" />
              Quick Select
            </CardTitle>
            <CardDescription>Use the dropdown to quickly search and select multiple specialties</CardDescription>
          </CardHeader>
          <CardContent>
            <SpecialtyMultiSelect
              specialties={specialties}
              selectedIds={selectedSpecialties}
              onSelectionChange={setSelectedSpecialties}
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* Specialties Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all">
              All Specialties ({filteredSpecialties.length})
            </TabsTrigger>
            <TabsTrigger value="selected">
              Selected ({selectedSpecialties.size})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Specialties (Virtualized)</CardTitle>
                    <CardDescription>
                      Scroll through all specialties - only visible items are rendered for performance
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAll}
                      disabled={filteredSpecialties.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deselectAll}
                      disabled={selectedSpecialties.size === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search specialties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {loading ? (
                  <div className="text-center py-12">
                    <RotateCcw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Loading specialties...</p>
                  </div>
                ) : filteredSpecialties.length === 0 ? (
                  <div className="text-center py-12">
                    <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mt-4">
                      {searchQuery ? 'No specialties match your search' : 'No specialties available'}
                    </p>
                  </div>
                ) : (
                  <VirtualizedSpecialtyList
                    specialties={filteredSpecialties}
                    selectedIds={selectedSpecialties}
                    onToggle={toggleSpecialty}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selected" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Selected Specialties</CardTitle>
                <CardDescription>
                  Specialties you have selected for your hospital
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSpecialtiesWithDetails.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mt-4">
                      No specialties selected yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Switch to &quot;All Specialties&quot; tab to select specialties
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedSpecialtiesWithDetails.map((specialty) => (
                      <div
                        key={specialty.specialty_id}
                        className="p-4 rounded-lg border-2 border-primary bg-primary/5 shadow-sm transition-all relative group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-foreground">
                                {specialty.specialty_name}
                              </h3>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {specialty.specialty_code}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {specialty.description}
                            </p>
                          </div>
                        </div>
                        {user?.role === 'hospital_admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setSpecialtyToRemove(specialty.specialty_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Remove Confirmation Dialog */}
        <AlertDialog open={!!specialtyToRemove} onOpenChange={(open) => !open && setSpecialtyToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Specialty?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the specialty from your hospital&apos;s affiliation. You can add it back later if needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveSpecialty}
                disabled={removing}
                className="bg-destructive hover:bg-destructive/90"
              >
                {removing ? 'Removing...' : 'Remove'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}
