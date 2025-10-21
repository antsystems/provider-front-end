import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ErrorBoundary } from '@/components/error-boundary'

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['hospital_admin', 'rm', 'rp']}>
      <MainLayout>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </MainLayout>
    </ProtectedRoute>
  )
}