import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['hospital_admin', 'rm', 'rp']}>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  )
}