import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface PayerAffiliationsLayoutProps {
  children: React.ReactNode
}

export default function PayerAffiliationsLayout({ children }: PayerAffiliationsLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={['hospital_admin', 'hospital_user']}>
      {children}
    </ProtectedRoute>
  )
}