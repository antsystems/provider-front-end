'use client';

import { BarChart3, Users, FileText, Download, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedStatCard } from '@/components/dashboard/AnimatedStatCard'
import { useMemo, useEffect, useState } from 'react'
import { hospitalSummaryApi } from '@/services/hospitalSummaryApi'

export default function Dashboard() {
  // State for hospital summary
  const [summary, setSummary] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    hospitalSummaryApi
      .getHospitalSummary()
      .then((res) => {
        if (!mounted) return
        if (res && res.summary) {
          setSummary(res.summary)
        } else {
          setError('Invalid response from server')
        }
      })
      .catch((err: any) => {
        if (!mounted) return
        setError(err?.message || 'Failed to load hospital summary')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const hospitalInfo = useMemo(() => {
    if (!summary) return null
    const hospital = summary.hospital || {}
    return {
      name: hospital.hospital_name || hospital.hospital_code || 'Hospital',
      id: hospital.hospital_id || '-',
      code: hospital.hospital_code || '-',
      city: hospital.city || '-',
      email: hospital.email || '-',
      phone: hospital.phone || '-',
    }
  }, [summary])

  const stats = useMemo(() => {
    // Build a comprehensive list of items to display on the overview
    const s = summary ?? {}

    return [
      { title: 'Total Departments', value: String(s.total_departments ?? 0), icon: FileText, description: 'All departments' },
      { title: 'Total Doctors', value: String(s.total_doctors ?? 0), icon: Users, description: 'Registered doctors' },
      { title: 'Total Hospital Users', value: String(s.total_hospital_users ?? 0), icon: Users, description: 'System users' },
      { title: 'Total Payer Affiliations', value: String(s.total_payer_affiliations ?? 0), icon: BarChart3, description: 'Insurance partners' },
      { title: 'Total Staff', value: String(s.total_staff ?? 0), icon: Users, description: 'Staff members' },
      { title: 'Total Tariffs', value: String(s.total_tariffs ?? 0), icon: IndianRupee, description: 'Active tariffs' },
      { title: 'Total TDS Mappings', value: String(s.total_tds_mappings ?? 0), icon: BarChart3, description: 'Tax mappings' },
    ]
  }, [summary])



  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-lg">Loading hospital summary…</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Hospital Overview</h1>
          {hospitalInfo && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{hospitalInfo.name}</span>
              <span>•</span>
              <span>ID: {hospitalInfo.id}</span>
              <span>•</span>
              <span>Code: {hospitalInfo.code}</span>
              {hospitalInfo.city !== '-' && (
                <>
                  <span>•</span>
                  <span>{hospitalInfo.city}</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <AnimatedStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={<stat.icon className="h-5 w-5 text-primary" />}
            index={index}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/doctors">
              <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                <Users className="mr-3 h-4 w-4" />
                <span className="text-sm">Doctors</span>
              </Button>
            </Link>
            <Link href="/staff">
              <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                <Users className="mr-3 h-4 w-4" />
                <span className="text-sm">Staff</span>
              </Button>
            </Link>
            <Link href="/departments">
              <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                <FileText className="mr-3 h-4 w-4" />
                <span className="text-sm">Departments</span>
              </Button>
            </Link>
            <Link href="/tariffs">
              <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                <IndianRupee className="mr-3 h-4 w-4" />
                <span className="text-sm">Tariffs</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}