'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook for mobile detection
 * Returns true for devices with screen width <= 1024px (includes iPads)
 * Uses the same logic as the sidebar component for consistency
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      // Include iPad in mobile detection (iPad width is typically 768px-1024px)
      setIsMobile(window.innerWidth < 900)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}