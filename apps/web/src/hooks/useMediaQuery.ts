/**
 * useMediaQuery hook for responsive design and mobile detection.
 * 
 * Provides a React hook to detect media query matches with SSR safety
 * and performance optimization.
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
 * ```
 */

'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  // Initialize with false to prevent hydration mismatch
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return
    }

    // Create media query list
    const mediaQueryList = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQueryList.matches)

    // Define the event handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener
    mediaQueryList.addEventListener('change', handleChange)

    // Cleanup function
    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
