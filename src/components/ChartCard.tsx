"use client"

import React from 'react'
import SimpleLineChart from './SimpleLineChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

export default function ChartCard() {
  const currentMonth = "Dec"
  const currentReimbursements = 165
  const previousReimbursements = 185
  const reimbursementsChange = ((currentReimbursements - previousReimbursements) / previousReimbursements * 100).toFixed(1)
  const isPositive = parseFloat(reimbursementsChange) > 0

  const currentAmount = 72000
  const previousAmount = 89000
  const amountChange = ((currentAmount - previousAmount) / previousAmount * 100).toFixed(1)
  const isAmountPositive = parseFloat(amountChange) > 0

  return (
    <Card className="glass-card border-0 shadow-sm hover-lift transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Reimbursements Overview
            </CardTitle>
            <p className="text-muted-foreground">
              Monthly reimbursement trends and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Reimbursement Count</div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">{currentReimbursements}</span>
                <Badge
                  variant={isPositive ? "default" : "secondary"}
                  className={`text-xs flex items-center gap-1 ${
                    isPositive ? "text-accent-foreground bg-accent" : "text-destructive bg-destructive/10"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(parseFloat(reimbursementsChange))}%
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Amount</div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">
                  ${(currentAmount / 1000).toFixed(0)}k
                </span>
                <Badge
                  variant={isAmountPositive ? "default" : "secondary"}
                  className={`text-xs flex items-center gap-1 ${
                    isAmountPositive ? "text-accent-foreground bg-accent" : "text-destructive bg-destructive/10"
                  }`}
                >
                  {isAmountPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(parseFloat(amountChange))}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <SimpleLineChart />
      </CardContent>
    </Card>
  )
}
