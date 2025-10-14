'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useCounterAnimation } from '@/hooks/useCounterAnimation'
import { ReactElement, memo } from 'react'

interface AnimatedStatCardProps {
  title: string
  value: string
  icon: ReactElement
  index?: number
  description?: string
}

export const AnimatedStatCard = memo(function AnimatedStatCard({
  title,
  value,
  icon,
  index = 0,
  description
}: AnimatedStatCardProps) {
  // Stagger animations by 150ms for each card
  const animatedValue = useCounterAnimation(value, 800, index * 150)

  return (
    <Card className="glass-card hover-lift border-0 shadow-none">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold animate-counter">{animatedValue}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="bg-primary/5 p-4 rounded-xl">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})