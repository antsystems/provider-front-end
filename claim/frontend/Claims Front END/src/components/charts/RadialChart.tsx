"use client"

import React from 'react'
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

interface RadialChartProps {
  title: string
  value: number
  total: number
  color?: string
  subtitle?: string
}

export default function RadialChart({
  title,
  value,
  total,
  color = 'hsl(210, 70%, 58%)',
  subtitle
}: RadialChartProps) {
  const percentage = Math.round((value / total) * 100)
  const chartData = [{ name: title, value: percentage, fill: color }]

  return (
    <div className="w-full h-48 flex flex-col items-center">
      <div className="relative w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            barSize={12}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              dataKey="value"
              cornerRadius={6}
              fill={color}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Custom center label positioned absolutely */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-foreground">
            {percentage}%
          </div>
          <div className="text-sm text-muted-foreground">
            {value} of {total}
          </div>
        </div>
      </div>

      <div className="text-center space-y-1 mt-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  )
}