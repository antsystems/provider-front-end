'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface LoadingScreenProps {
  isLoading?: boolean
}

export default function LoadingScreen({ isLoading = false }: LoadingScreenProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 flex items-center justify-center">
            <Image
              src="/assets/logo.png"
              alt="Medvere Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>

        {/* Loading text */}
        <p className="text-sm text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  )
}

// Hook for detecting route changes
export function useRouteLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Show loading when route starts changing
    setIsLoading(true)

    // Hide loading after a short delay to ensure smooth transition
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 500) // Adjust timing as needed

    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  return isLoading
}