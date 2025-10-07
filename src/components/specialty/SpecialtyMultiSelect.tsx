'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { Specialty } from '@/types/specialtyAffiliations'

interface SpecialtyMultiSelectProps {
  specialties: Specialty[]
  selectedIds: Set<string>
  onSelectionChange: (selectedIds: Set<string>) => void
  disabled?: boolean
}

export function SpecialtyMultiSelect({
  specialties,
  selectedIds,
  onSelectionChange,
  disabled = false,
}: SpecialtyMultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedSpecialties = React.useMemo(
    () => specialties.filter((s) => selectedIds.has(s.specialty_id)),
    [specialties, selectedIds]
  )

  const toggleSpecialty = (specialtyId: string) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(specialtyId)) {
      newSelection.delete(specialtyId)
    } else {
      newSelection.add(specialtyId)
    }
    onSelectionChange(newSelection)
  }

  const removeSpecialty = (specialtyId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelection = new Set(selectedIds)
    newSelection.delete(specialtyId)
    onSelectionChange(newSelection)
  }

  const clearAll = () => {
    onSelectionChange(new Set())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-[60px] h-auto"
          disabled={disabled}
        >
          <div className="flex gap-2 flex-wrap flex-1 items-center">
            {selectedSpecialties.length === 0 ? (
              <span className="text-muted-foreground">Select specialties...</span>
            ) : (
              <>
                {selectedSpecialties.slice(0, 3).map((specialty) => (
                  <Badge
                    key={specialty.specialty_id}
                    variant="secondary"
                    className="gap-1"
                  >
                    {specialty.specialty_name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => removeSpecialty(specialty.specialty_id, e)}
                    />
                  </Badge>
                ))}
                {selectedSpecialties.length > 3 && (
                  <Badge variant="secondary">
                    +{selectedSpecialties.length - 3} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="Search specialties..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No specialty found.</CommandEmpty>
            <CommandGroup>
              {specialties.map((specialty) => {
                const isSelected = selectedIds.has(specialty.specialty_id)
                return (
                  <CommandItem
                    key={specialty.specialty_id}
                    value={specialty.specialty_name}
                    onSelect={() => toggleSpecialty(specialty.specialty_id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{specialty.specialty_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {specialty.specialty_code}
                      </div>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-2 border-t">
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
