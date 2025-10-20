'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus,
  RefreshCw,
  Info,
  List
} from 'lucide-react'
import { toast } from 'sonner'
import { specialtyAffiliationsApi } from '@/services/specialtyAffiliationsApi'
import { doctorsApi } from '@/services/doctorsApi'

interface SpecialtyDebugDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SpecialtyInfo {
  availableSpecialties: any[]
  affiliatedSpecialties: any[]
  doctorsSpecialties: string[]
  searchResults: any[]
}

export default function SpecialtyDebugDialog({
  open,
  onOpenChange,
}: SpecialtyDebugDialogProps) {
  const [specialtyName, setSpecialtyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [specialtyInfo, setSpecialtyInfo] = useState<SpecialtyInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSpecialtyInfo = async () => {
    if (!specialtyName.trim()) {
      toast.error('Please enter a specialty name')
      return
    }

    setLoading(true)
    setError(null)
    setSpecialtyInfo(null)

    try {
      // Fetch all specialty information
      const [availableResponse, affiliatedResponse, doctorsSpecialtiesResponse] = await Promise.all([
        specialtyAffiliationsApi.getAvailableSpecialties(),
        specialtyAffiliationsApi.getAffiliatedSpecialtyNames(),
        doctorsApi.getAvailableSpecialties()
      ])

      const availableSpecialties = availableResponse.specialties || []
      const affiliatedSpecialties = affiliatedResponse.specialties || []
      const doctorsSpecialties = doctorsSpecialtiesResponse.specialty_names || []

      // Search for the specialty in different lists
      const searchTerm = specialtyName.trim().toLowerCase()
      const searchResults = availableSpecialties.filter(specialty => 
        specialty.specialty_name?.toLowerCase().includes(searchTerm) ||
        specialty.specialty_code?.toLowerCase().includes(searchTerm)
      )

      setSpecialtyInfo({
        availableSpecialties,
        affiliatedSpecialties,
        doctorsSpecialties,
        searchResults
      })

      if (searchResults.length === 0) {
        setError(`No specialties found matching "${specialtyName}"`)
      } else {
        toast.success(`Found ${searchResults.length} matching specialty(ies)`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch specialty information'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSpecialtyName('')
    setSpecialtyInfo(null)
    setError(null)
  }

  const getSpecialtyStatus = (specialtyName: string) => {
    const lowerName = specialtyName.toLowerCase()
    const trimmedName = specialtyName.trim().toLowerCase()
    
    const isAvailable = specialtyInfo?.availableSpecialties.some(s => 
      s.specialty_name?.toLowerCase() === lowerName ||
      s.specialty_name?.toLowerCase() === trimmedName
    )
    
    const isAffiliated = specialtyInfo?.affiliatedSpecialties.some(s => 
      s.specialty_name?.toLowerCase() === lowerName ||
      s.specialty_name?.toLowerCase() === trimmedName
    )
    
    const isInDoctorsList = specialtyInfo?.doctorsSpecialties.some(s => 
      s.toLowerCase() === lowerName ||
      s.toLowerCase() === trimmedName
    )

    return {
      isAvailable,
      isAffiliated,
      isInDoctorsList,
      needsAffiliation: isAvailable && !isAffiliated
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Specialty Debug Tool
          </DialogTitle>
          <DialogDescription>
            Debug specialty issues and check availability/affiliation status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Specialty</CardTitle>
              <CardDescription>
                Enter a specialty name to check its status and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="specialtyName">Specialty Name</Label>
                  <Input
                    id="specialtyName"
                    placeholder="e.g., General Medicine, Cardiology, Neurology"
                    value={specialtyName}
                    onChange={(e) => setSpecialtyName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchSpecialtyInfo()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchSpecialtyInfo} disabled={loading || !specialtyName.trim()}>
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Search Results */}
          {specialtyInfo && specialtyInfo.searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" />
                  Search Results ({specialtyInfo.searchResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {specialtyInfo.searchResults.map((specialty, index) => {
                  const status = getSpecialtyStatus(specialty.specialty_name)
                  
                  return (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{specialty.specialty_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Code: {specialty.specialty_code} | ID: {specialty.specialty_id}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {status.isAvailable && (
                            <Badge variant="default">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Available
                            </Badge>
                          )}
                          {status.isAffiliated && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Affiliated
                            </Badge>
                          )}
                          {status.isInDoctorsList && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              In Doctors List
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {status.needsAffiliation && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            This specialty is available but not affiliated with your hospital. 
                            You need to affiliate it before using it in doctor operations.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Specialty Lists Overview */}
          {specialtyInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Available Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{specialtyInfo.availableSpecialties.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total available in system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Affiliated Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{specialtyInfo.affiliatedSpecialties.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Affiliated with your hospital
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Doctors Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{specialtyInfo.doctorsSpecialties.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Available for doctor creation
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
