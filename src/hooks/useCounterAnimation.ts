'use client'

import { useEffect, useState, useRef } from 'react'

export function useCounterAnimation(end: string, duration: number = 600, delay: number = 0) {
  const [count, setCount] = useState('0')
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<boolean>(false)

  useEffect(() => {
    // Extract numeric value from string (remove commas, currency symbols, etc.)
    const numericValue = parseFloat(end.replace(/[^\d.]/g, ''))

    if (isNaN(numericValue)) {
      setCount(end)
      return
    }

    // Prevent multiple animations
    if (ref.current) return
    ref.current = true

    // Add staggered delay to prevent simultaneous animations
    const delayTimeout = setTimeout(() => {
      setIsVisible(true)
      const startTime = Date.now()

      const timer = setInterval(() => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)

        // Use easeOutCubic for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const currentValue = numericValue * easeOutCubic

        // Format the value back to original format
        if (end.includes('₹') || end.includes('$')) {
          if (end.includes('M')) {
            setCount(`₹${(currentValue / 1000000).toFixed(1)}M`)
          } else if (end.includes('K')) {
            setCount(`₹${(currentValue / 1000).toFixed(1)}K`)
          } else {
            setCount(`₹${Math.round(currentValue)}`)
          }
        } else if (end.includes(',')) {
          setCount(Math.round(currentValue).toLocaleString())
        } else if (end.includes('days')) {
          setCount(`${currentValue.toFixed(1)} days`)
        } else {
          setCount(Math.round(currentValue).toString())
        }

        if (progress === 1) {
          clearInterval(timer)
          setCount(end) // Ensure final value is exact
        }
      }, 33) // 30fps instead of 60fps for better performance

      return () => clearInterval(timer)
    }, delay)

    return () => {
      clearTimeout(delayTimeout)
      ref.current = false
    }
  }, [end, duration, delay])

  return count
}