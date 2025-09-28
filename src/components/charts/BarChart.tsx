"use client"

import React from 'react'
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const data = [
  { provider: 'Dr. Smith', approved: 45, pending: 12, rejected: 3 },
  { provider: 'Dr. Johnson', approved: 38, pending: 8, rejected: 5 },
  { provider: 'Dr. Brown', approved: 52, pending: 15, rejected: 2 },
  { provider: 'Dr. Lee', approved: 41, pending: 9, rejected: 4 },
  { provider: 'Dr. Wilson', approved: 35, pending: 11, rejected: 6 },
  { provider: 'Dr. Davis', approved: 48, pending: 7, rejected: 1 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, item: any) => sum + item.value, 0)

    return (
      <div className="glass-card border-0 shadow-lg p-4 rounded-xl">
        <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium capitalize text-foreground">
                  {entry.dataKey}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {entry.value}
              </span>
            </div>
          ))}
          <div className="border-t pt-1 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-sm font-semibold text-foreground">{total}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function BarChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id="approvedBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 76%, 44%)" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="hsl(142, 76%, 44%)" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="pendingBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="rejectedBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 90%, 65%)" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="hsl(0, 90%, 65%)" stopOpacity={0.7}/>
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.3}
            vertical={false}
          />

          <XAxis
            dataKey="provider"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 11,
              fontWeight: 500
            }}
            angle={-45}
            textAnchor="end"
            height={60}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 12,
              fontWeight: 500
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: 500
            }}
            iconType="rect"
          />

          <Bar
            dataKey="approved"
            fill="url(#approvedBar)"
            radius={[2, 2, 0, 0]}
            name="Approved"
          />
          <Bar
            dataKey="pending"
            fill="url(#pendingBar)"
            radius={[2, 2, 0, 0]}
            name="Pending"
          />
          <Bar
            dataKey="rejected"
            fill="url(#rejectedBar)"
            radius={[2, 2, 0, 0]}
            name="Rejected"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}