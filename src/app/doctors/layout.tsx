import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function DoctorsLayout({
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