'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import BankAccountsTable from '@/components/tables/BankAccountsTable'
import { bankAccountsApi } from '@/services/bankAccountsApi'
import { BankAccount } from '@/types/bankAccounts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CreditCard, TrendingUp, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { StatsCardSkeleton } from '@/components/ui/card-skeleton'

export default function BankAccountsPage() {
  const { user } = useAuth()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBankAccounts = async () => {
    try {
      setLoading(true)
      const response = await bankAccountsApi.getBankAccounts()
      setBankAccounts(response.bank_accounts || [])
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bank accounts'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  // Statistics
  const stats = useMemo(() => {
    const totalAccounts = bankAccounts.length
    const uniqueBanks = new Set(bankAccounts.map(acc => acc.bank_name)).size

    // Group by bank - count accounts per bank
    const accountsByBank = bankAccounts.reduce((acc, account) => {
      const bankName = account.bank_name
      if (!acc[bankName]) {
        acc[bankName] = 0
      }
      acc[bankName]++
      return acc
    }, {} as Record<string, number>)

    return {
      total: totalAccounts,
      uniqueBanks,
      accountsByBank
    }
  }, [bankAccounts])

  const handleRefresh = () => {
    fetchBankAccounts()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
            <p className="text-muted-foreground">
              Manage your hospital's bank accounts and payment information
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
            variant="outline"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <StatsCardSkeleton count={3} />
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    All bank accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Banks</CardTitle>
                  <Building2 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.uniqueBanks}</div>
                  <p className="text-xs text-muted-foreground">
                    Different banks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accounts by Bank</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.entries(stats.accountsByBank)
                      .slice(0, 3)
                      .map(([bankName, count]) => (
                        <div key={bankName} className="flex justify-between text-sm">
                          <span className="truncate">{bankName}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    {Object.keys(stats.accountsByBank).length > 3 && (
                      <div className="text-xs text-muted-foreground pt-1">
                        +{Object.keys(stats.accountsByBank).length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Table */}
        <BankAccountsTable
          bankAccounts={bankAccounts}
          loading={loading}
          onRefresh={handleRefresh}
        />
      </div>
    </MainLayout>
  )
}
