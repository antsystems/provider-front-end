'use client';

import { BarChart3, Users, FileText, DollarSign, Clock, CheckCircle, XCircle, Download, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedStatCard } from '@/components/dashboard/AnimatedStatCard'
import ChartCard from '@/components/ChartCard'
import DashboardCharts from '@/components/DashboardCharts'
import { useMemo, useCallback, useEffect, useState } from 'react'
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

  const stats = useMemo(() => {
    // Build a comprehensive list of items to display on the overview
    const s = summary ?? {}

    return [
      { title: 'Total Departments', value: String(s.total_departments ?? '-'), icon: FileText, change: '', changeType: 'positive' as const },
      { title: 'Total Doctors', value: String(s.total_doctors ?? '-'), icon: Users, change: '', changeType: 'positive' as const },
      { title: 'Total Hospital Users', value: String(s.total_hospital_users ?? '-'), icon: Users, change: '', changeType: 'positive' as const },
      { title: 'Total Payer Affiliations', value: String(s.total_payer_affiliations ?? '-'), icon: BarChart3, change: '', changeType: 'positive' as const },
      { title: 'Total Staff', value: String(s.total_staff ?? '-'), icon: Users, change: '', changeType: 'positive' as const },
      { title: 'Total Tariffs', value: String(s.total_tariffs ?? '-'), icon: DollarSign, change: '', changeType: 'positive' as const },
      { title: 'Total TDS Mappings', value: String(s.total_tds_mappings ?? '-'), icon: BarChart3, change: '', changeType: 'positive' as const },
    ]
  }, [summary])

  const recentActivities = useMemo(() => [
    {
      id: 'PROV-001',
      name: 'Dr. Smith',
      type: 'Cardiology',
      facility: 'City Hospital',
      status: 'active',
      date: '2024-01-15',
    },
    {
      id: 'PROV-002',
      name: 'Dr. Johnson',
      type: 'Neurology',
      facility: 'Medical Center',
      status: 'pending',
      date: '2024-01-14',
    },
    {
      id: 'PROV-003',
      name: 'Dr. Brown',
      type: 'Orthopedics',
      facility: 'Specialist Clinic',
      status: 'inactive',
      date: '2024-01-14',
    },
    {
      id: 'PROV-004',
      name: 'Dr. Lee',
      type: 'Pediatrics',
      facility: 'Children Hospital',
      status: 'active',
      date: '2024-01-13',
    },
  ], [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-accent" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }, [])

  const getStatusVariant = useCallback((status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'destructive'
      default:
        return 'secondary'
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Hospital Overview</h1>
          <p className="text-muted-foreground text-lg">
            {loading ? 'Loading hospital summary…' : error ? `Error: ${error}` : (
              <>
                {summary?.hospital_name ? `Overview for ${summary.hospital_name}` : `Overview for ${summary?.hospital_id ?? 'your hospital'}`}
                <span className="block text-sm text-muted-foreground mt-1">Hospital ID: {summary?.hospital_id ?? '-'}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hover-lift">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Link href="/providers/new">
            <Button className="floating-action hover-lift">
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <AnimatedStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={<stat.icon className="h-7 w-7 text-primary" />}
            index={index}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Provider Activities */}
        <Card className="lg:col-span-2 glass-card border-0 shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Recent Provider Activities</CardTitle>
              <Button variant="ghost" size="sm" className="hover-lift text-primary">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl hover-lift cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className={`status-indicator status-${activity.status} pl-4`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      {activity.id} - {activity.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.type} - {activity.facility}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <p className="font-bold text-lg">{activity.date}</p>
                  <Badge
                    variant={getStatusVariant(activity.status)}
                    className="capitalize text-xs font-medium px-3 py-1"
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card border-0 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/doctors">
              <Button variant="ghost" className="w-full justify-start h-auto p-5 hover-lift bg-muted/30 rounded-xl">
                <Users className="mr-4 h-5 w-5 text-primary" />
                <span className="font-medium">View Doctors</span>
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start h-auto p-5 hover-lift bg-muted/30 rounded-xl">
              <FileText className="mr-4 h-5 w-5 text-primary" />
              <span className="font-medium">Add New Provider</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-auto p-5 hover-lift bg-muted/30 rounded-xl">
              <BarChart3 className="mr-4 h-5 w-5 text-primary" />
              <span className="font-medium">Generate Report</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Provider Network Overview Chart */}
      <ChartCard />

      {/* Additional Charts */}
      <DashboardCharts />

      {/* Recent Provider Activities Table Preview */}
      <Card className="glass-card border-0 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">Provider Network Overview</CardTitle>
              <p className="text-muted-foreground mt-2">
                Latest provider activities and network status updates
              </p>
            </div>
            <Link href="/providers">
              <Button variant="outline" className="hover-lift">
                View All Providers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}