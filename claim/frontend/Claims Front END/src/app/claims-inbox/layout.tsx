import MainLayout from '@/components/layout/MainLayout'
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute'

export default function ClaimsInboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </RoleProtectedRoute>
  )
}
