"use client"

import React, { lazy, Suspense, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, BarChart3, TrendingUp, Target } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load chart components
const DonutChart = lazy(() => import('./charts/DonutChart'))
const BarChart = lazy(() => import('./charts/BarChart'))
const RadialChart = lazy(() => import('./charts/RadialChart'))

const ChartSkeleton = () => (
  <div className="h-64 w-full">
    <Skeleton className="h-full w-full rounded-lg" />
  </div>
)

const DashboardCharts = memo(function DashboardCharts() {
  return (
    <div className="space-y-8">
      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* Reimbursement Status Distribution */}
        <Card className="glass-card border-0 shadow-sm hover-lift transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Reimbursement Status
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution of reimbursement statuses
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <DonutChart />
            </Suspense>
          </CardContent>
        </Card>

        {/* Provider Performance */}
        <Card className="glass-card border-0 shadow-sm hover-lift transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Provider Performance
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Reimbursements by provider and status
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <BarChart />
            </Suspense>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="glass-card border-0 shadow-sm hover-lift transition-all duration-300 lg:col-span-2 xl:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Performance Metrics
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Key performance indicators
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Suspense fallback={<div className="h-24"><Skeleton className="h-full w-full rounded-lg" /></div>}>
                <RadialChart
                  title="Processing Rate"
                  value={847}
                  total={1000}
                  color="hsl(142, 76%, 44%)"
                  subtitle="Reimbursements processed this month"
                />
              </Suspense>
              <Suspense fallback={<div className="h-24"><Skeleton className="h-full w-full rounded-lg" /></div>}>
                <RadialChart
                  title="Approval Rate"
                  value={92}
                  total={100}
                  color="hsl(210, 70%, 58%)"
                  subtitle="Average approval percentage"
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export default DashboardCharts