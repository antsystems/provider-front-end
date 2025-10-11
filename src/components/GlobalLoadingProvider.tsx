'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingScreen from './LoadingScreen'

interface GlobalLoadingProviderProps {
  children: React.ReactNode
}

// Internal component that uses searchParams
function LoadingDetector({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Show loading immediately when route starts changing
    onLoadingChange(true)

    // Hide loading after a brief delay to show the transition
    const timer = setTimeout(() => {
      onLoadingChange(false)
    }, 400) // Slightly shorter for quicker feel

    return () => {
      clearTimeout(timer)
      onLoadingChange(false)
    }
  }, [pathname, searchParams, onLoadingChange])

  return null
}

export default function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Also handle initial page load
  useEffect(() => {
    setIsLoading(false)
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <LoadingDetector onLoadingChange={setIsLoading} />
      </Suspense>
      {isLoading && (
        <LoadingScreen isLoading={true} />
      )}
      {children}
    </>
  )
}