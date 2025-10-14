'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isRoleAllowedForClaims, ALLOWED_CLAIMS_ROLES, BLOCKED_ROLES } from '@/types/roles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ShieldAlert } from 'lucide-react'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  blockAdmins?: boolean
}

export default function RoleProtectedRoute({ 
  children, 
  requiredRoles = ALLOWED_CLAIMS_ROLES,
  blockAdmins = true 
}: RoleProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      // Check user role from auth context
      const checkUserRole = () => {
        try {
          // Get user role from auth context
          const userRole = user.role?.toLowerCase() || ''
          
          console.log('Checking role access for:', userRole)
          
          // Check if admin and blocking admins
          if (blockAdmins && BLOCKED_ROLES.includes(userRole as any)) {
            console.log('Access denied - Admin role blocked')
            setHasAccess(false)
            return
          }

          // Check if role is allowed
          const allowed = isRoleAllowedForClaims(userRole)
          console.log('Role allowed for claims:', allowed)
          setHasAccess(allowed)
        } catch (error) {
          console.error('Error checking user role:', error)
          setHasAccess(false)
        }
      }

      checkUserRole()
    }
  }, [user, loading, router, requiredRoles, blockAdmins])

  if (loading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    const currentRole = user?.role || 'Unknown'
    
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-2xl mx-auto border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">Access Denied</CardTitle>
                <CardDescription>You don't have permission to access this module</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-sm">
                    The Claims Module is restricted to specific roles only.
                  </p>
                  <p className="text-sm">
                    <strong>Your current role:</strong> <span className="text-destructive font-semibold">{currentRole}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Only <strong>Hospital Users</strong>, <strong>Claim Processors</strong>, and <strong>Reconcilers</strong> can access this module.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Administrators do not have access to the Claims Module for security and separation of duties.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="font-semibold text-sm mb-2">Allowed Roles:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Hospital User - Submit and manage claims</li>
                <li>Claim Processor - Process and approve claims</li>
                <li>Reconciler - Reconcile and finalize claims</li>
              </ul>
            </div>

            <div className="pt-2">
              <h4 className="font-semibold text-sm mb-2 text-destructive">Blocked Roles:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Admin</li>
                <li>Super Admin</li>
                <li>System Admin</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => router.push('/dashboard')} variant="default">
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push('/profile')} variant="outline">
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
