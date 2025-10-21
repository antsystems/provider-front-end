'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { AvailablePayer } from '@/types/payerAffiliations'
import { BulkPayerMappingItem } from '@/types/tariffs'

interface TPARelationshipSelectorProps {
  tpa: AvailablePayer
  availableInsuranceCompanies: AvailablePayer[]
  onChange: (tpaWithRelationships: BulkPayerMappingItem) => void
  initialSelectedInsurances?: string[]
}

export default function TPARelationshipSelector({
  tpa,
  availableInsuranceCompanies,
  onChange,
  initialSelectedInsurances = [],
}: TPARelationshipSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>(initialSelectedInsurances)
  const insuranceMapRef = useRef<Map<string, AvailablePayer>>(new Map())

  // Build insurance map for fast lookup
  useEffect(() => {
    const newMap = new Map<string, AvailablePayer>()
    availableInsuranceCompanies.forEach(insurance => {
      const insuranceId = insurance.auto_id || insurance.id
      newMap.set(insuranceId, insurance)
    })
    insuranceMapRef.current = newMap
  }, [availableInsuranceCompanies])

  // Always notify parent about TPA relationships, even on initial mount with empty selection
  useEffect(() => {
    const tpaId = tpa.auto_id || tpa.id // Use auto_id if available, fallback to id
    const tpaWithRelationships: BulkPayerMappingItem = {
      payer_id: tpaId,
      payer_name: tpa.name,
      payer_type: tpa.type,
      affiliated_insurance_companies: selectedInsurances.map(id => {
        const insurance = insuranceMapRef.current.get(id)
        const insuranceId = insurance?.auto_id || insurance?.id || id
        return {
          payer_id: insuranceId,
          payer_name: insurance?.name || '',
        }
      }),
    }
    console.log('[TPARelationshipSelector] Calling onChange with:', tpaWithRelationships)
    onChange(tpaWithRelationships)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInsurances, tpa.auto_id, tpa.id]) // Depend on both auto_id and id

  const handleInsuranceToggle = (insuranceId: string) => {
    setSelectedInsurances(prev =>
      prev.includes(insuranceId)
        ? prev.filter(id => id !== insuranceId)
        : [...prev, insuranceId]
    )
  }

  const handleSelectAll = () => {
    const allIds = availableInsuranceCompanies.map(p => p.auto_id || p.id)
    setSelectedInsurances(allIds)
  }

  const handleDeselectAll = () => {
    setSelectedInsurances([])
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Building2 className="h-5 w-5 text-blue-500 mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base">{tpa.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  TPA
                </Badge>
                {selectedInsurances.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    {selectedInsurances.length} insurance{' '}
                    {selectedInsurances.length === 1 ? 'company' : 'companies'}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs mt-1">
                Code: {tpa.code}
                {!expanded && selectedInsurances.length > 0 && (
                  <span className="text-muted-foreground ml-2">
                    • Click to {expanded ? 'hide' : 'view/edit'} relationships
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Select Insurance Companies Managed by this TPA:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedInsurances.length === availableInsuranceCompanies.length}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedInsurances.length === 0}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            {availableInsuranceCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No insurance companies available to affiliate with this TPA.
              </p>
            ) : (
              <ScrollArea className="h-[200px] border rounded-md p-3">
                <div className="space-y-2">
                  {availableInsuranceCompanies.map(insurance => {
                    const insuranceId = insurance.auto_id || insurance.id // Use auto_id if available
                    const isSelected = selectedInsurances.includes(insuranceId)

                    return (
                      <div
                        key={insuranceId}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent"
                      >
                        <Checkbox
                          id={`insurance-${insuranceId}`}
                          checked={isSelected}
                          onCheckedChange={() => handleInsuranceToggle(insuranceId)}
                        />
                        <label
                          htmlFor={`insurance-${insuranceId}`}
                          className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span>{insurance.name}</span>
                            <Badge variant="secondary" className="text-xs ml-2">
                              {insurance.code}
                            </Badge>
                          </div>
                        </label>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
