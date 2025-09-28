import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function HospitalUsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['hospital_admin']}>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  )
}