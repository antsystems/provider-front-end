"use client"

import React, { memo, useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = {
  Approved: 'hsl(142, 76%, 44%)',
  Pending: 'hsl(45, 93%, 47%)',
  Rejected: 'hsl(0, 90%, 65%)',
  'Under Review': 'hsl(210, 70%, 58%)',
}

const CustomTooltip = memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="glass-card border-0 shadow-sm p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: COLORS[data.name as keyof typeof COLORS] }}
          />
          <span className="text-sm font-semibold text-foreground">{data.name}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {data.count} reimbursements ({data.value}%)
        </p>
      </div>
    )
  }
  return null
})

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold drop-shadow-none"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const DonutChart = memo(function DonutChart() {
  const data = useMemo(() => [
    { name: 'Approved', value: 65, count: 1850 },
    { name: 'Pending', value: 20, count: 570 },
    { name: 'Rejected', value: 12, count: 342 },
    { name: 'Under Review', value: 3, count: 85 },
  ], [])

  const memoizedCells = useMemo(() =>
    data.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={COLORS[entry.name as keyof typeof COLORS]}
      />
    )), [data]
  )

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={2}
            stroke="hsl(var(--background))"
          >
            {memoizedCells}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: 500
            }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
})

export default DonutChart