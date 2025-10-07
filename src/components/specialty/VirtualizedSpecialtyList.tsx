'use client'

import * as React from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Specialty } from '@/types/specialtyAffiliations'

interface VirtualizedSpecialtyListProps {
  specialties: Specialty[]
  selectedIds: Set<string>
  onToggle: (specialtyId: string) => void
}

export function VirtualizedSpecialtyList({
  specialties,
  selectedIds,
  onToggle,
}: VirtualizedSpecialtyListProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 30 })

  const ITEM_HEIGHT = 100 // Approximate height of each card
  const ITEMS_PER_ROW = 3
  const BUFFER = 10 // Extra items to render for smooth scrolling

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight

      const startRow = Math.floor(scrollTop / ITEM_HEIGHT)
      const endRow = Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT)

      const start = Math.max(0, (startRow - BUFFER) * ITEMS_PER_ROW)
      const end = Math.min(specialties.length, (endRow + BUFFER) * ITEMS_PER_ROW)

      setVisibleRange({ start, end })
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll)
  }, [specialties.length])

  const totalHeight = Math.ceil(specialties.length / ITEMS_PER_ROW) * ITEM_HEIGHT
  const offsetY = Math.floor(visibleRange.start / ITEMS_PER_ROW) * ITEM_HEIGHT
  const visibleItems = specialties.slice(visibleRange.start, visibleRange.end)

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto"
      style={{ height: '600px', position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {visibleItems.map((specialty) => {
            const isSelected = selectedIds.has(specialty.specialty_id)
            return (
              <div
                key={specialty.specialty_id}
                onClick={() => onToggle(specialty.specialty_id)}
                className={`
                  p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:shadow-sm'
                  }
                `}
                style={{ height: ITEM_HEIGHT - 16 }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm">
                        {specialty.specialty_name}
                      </h3>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {specialty.specialty_code}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {specialty.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
