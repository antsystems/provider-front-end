'use client'

import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useCounterAnimation } from '@/hooks/useCounterAnimation'
import { ReactElement, memo } from 'react'

interface AnimatedStatCardProps {
  title: string
  value: string
  change: string
  changeType?: 'positive' | 'negative'
  icon: ReactElement
  index?: number
}

export const AnimatedStatCard = memo(function AnimatedStatCard({
  title,
  value,
  change,
  icon,
  index = 0
}: AnimatedStatCardProps) {
  // Stagger animations by 150ms for each card
  const animatedValue = useCounterAnimation(value, 800, index * 150)

  return (
    <Card className="glass-card hover-lift border-0 shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold animate-counter">{animatedValue}</p>
          </div>
          <div className="bg-primary/5 p-4 rounded-xl">
            {icon}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full">
            <TrendingUp className="h-3 w-3 text-accent" />
            <span className="text-sm text-accent font-semibold">{change}</span>
          </div>
          <span className="text-sm text-muted-foreground">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
})