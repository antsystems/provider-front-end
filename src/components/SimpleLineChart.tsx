"use client"

import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from 'recharts'

const sampleData = [
  { month: 'Jan', claims: 120, amount: 45000 },
  { month: 'Feb', claims: 98, amount: 38000 },
  { month: 'Mar', claims: 150, amount: 62000 },
  { month: 'Apr', claims: 110, amount: 40000 },
  { month: 'May', claims: 170, amount: 78000 },
  { month: 'Jun', claims: 140, amount: 64000 },
  { month: 'Jul', claims: 190, amount: 92000 },
  { month: 'Aug', claims: 175, amount: 86000 },
  { month: 'Sep', claims: 200, amount: 98000 },
  { month: 'Oct', claims: 220, amount: 105000 },
  { month: 'Nov', claims: 185, amount: 89000 },
  { month: 'Dec', claims: 165, amount: 72000 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border-0 shadow-lg p-4 rounded-xl">
        <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium capitalize text-foreground">
              {entry.dataKey}:
            </span>
            <span className="text-sm font-semibold text-foreground">
              {entry.dataKey === 'amount'
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(entry.value)
                : new Intl.NumberFormat('en-US').format(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const CustomDot = (props: any) => {
  const { cx, cy, fill } = props
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      stroke="hsl(var(--background))"
      strokeWidth={2}
      className="drop-shadow-sm"
    />
  )
}

export default function SimpleLineChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={sampleData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="claimsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(210, 70%, 58%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(210, 70%, 58%)" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 76%, 44%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(142, 76%, 44%)" stopOpacity={0.05}/>
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.3}
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 12,
              fontWeight: 500
            }}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 12,
              fontWeight: 500
            }}
            tickFormatter={(value) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
            }
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: 500
            }}
            iconType="circle"
          />

          <Area
            type="monotone"
            dataKey="claims"
            stroke="hsl(210, 70%, 58%)"
            strokeWidth={3}
            fill="url(#claimsGradient)"
            fillOpacity={1}
            dot={<CustomDot />}
            activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            name="Claims Count"
          />

          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(142, 76%, 44%)"
            strokeWidth={3}
            fill="url(#amountGradient)"
            fillOpacity={1}
            dot={<CustomDot />}
            activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            name="Claims Amount ($)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
