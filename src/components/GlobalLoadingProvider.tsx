'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingScreen from './LoadingScreen'

interface GlobalLoadingProviderProps {
  children: React.ReactNode
}

function LoadingHandler({ children }: GlobalLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Show loading immediately when route starts changing
    setIsLoading(true)

    // Hide loading after a brief delay to show the transition
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 400) // Slightly shorter for quicker feel

    return () => {
      clearTimeout(timer)
      setIsLoading(false)
    }
  }, [pathname, searchParams])

  // Also handle initial page load
  useEffect(() => {
    setIsLoading(false)
  }, [])

  return (
    <>
      {isLoading && (
        <LoadingScreen isLoading={true} />
      )}
      {children}
    </>
  )
}

export default function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  return (
    <Suspense fallback={<LoadingScreen isLoading={true} />}>
      <LoadingHandler>{children}</LoadingHandler>
    </Suspense>
  )
}