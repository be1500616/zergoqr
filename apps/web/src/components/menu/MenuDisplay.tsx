/**
 * MenuDisplay is the main container component for the menu category display feature.
 * 
 * This component orchestrates the menu display with mobile optimization,
 * performance tracking, and responsive design. It serves as the entry point
 * for the complete menu category navigation system.
 * 
 * @example
 * ```tsx
 * <MenuDisplay 
 *   restaurantId="restaurant-123"
 *   initialCategoryId="appetizers"
 * />
 * ```
 */

'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { MenuCategoryWithItems } from '@/lib/types/menu'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MenuCategoryList } from './MenuCategoryList'

interface MenuDisplayProps {
  /** Restaurant ID to load menu for */
  restaurantId: string
  /** Initial category to display */
  initialCategoryId?: string
  /** Menu categories data (can be passed from server) */
  categories?: MenuCategoryWithItems[]
  /** Loading state */
  isLoading?: boolean
}

export function MenuDisplay({
  restaurantId,
  initialCategoryId,
  categories: initialCategories,
  isLoading: initialLoading = false
}: MenuDisplayProps) {
  const [categories, setCategories] = useState<MenuCategoryWithItems[]>(initialCategories || [])
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(initialCategoryId)
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Navigation state tracking to prevent intersection observer conflicts
  const isNavigatingRef = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Mobile detection for optimized interactions
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  // Load menu data if not provided
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      return // Data already provided
    }

    const loadMenuData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch menu data from API
        const response = await fetch(`/api/restaurants/${restaurantId}/menu`)
        
        if (!response.ok) {
          throw new Error(`Failed to load menu: ${response.statusText}`)
        }

        const data = await response.json()
        setCategories(data.categories || [])

        // Set initial active category if not specified
        if (!initialCategoryId && data.categories && data.categories.length > 0) {
          const firstActiveCategory = data.categories.find((cat: MenuCategoryWithItems) => 
            cat.isActive && cat.menuItems && cat.menuItems.length > 0
          )
          if (firstActiveCategory) {
            setActiveCategoryId(firstActiveCategory.id)
          }
        }

      } catch (err) {
        console.error('Error loading menu data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load menu')
      } finally {
        setIsLoading(false)
      }
    }

    loadMenuData()
  }, [restaurantId, initialCategoryId, initialCategories])

  // Handle category change with performance optimization and state synchronization
  const handleCategoryChange = useCallback((categoryId: string, isManualNavigation = false) => {
    // Skip if currently navigating manually and this is a scroll-based update
    if (isNavigatingRef.current && !isManualNavigation) {
      return
    }

    // Clear any existing timeout to prevent race conditions
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }

    // Set navigation flag to prevent intersection observer conflicts
    if (isManualNavigation) {
      isNavigatingRef.current = true
    }

    // Debounce rapid category changes
    debounceTimeoutRef.current = setTimeout(() => {
      // Start transition for smooth visual updates
      if (isManualNavigation) {
        setIsTransitioning(true)

        // Clear any existing transition timeout
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current)
        }
      }

      setActiveCategoryId(categoryId)

      // Reset navigation flag and transition state after update
      if (isManualNavigation) {
        // Allow intersection observer to resume after scrolling completes
        setTimeout(() => {
          isNavigatingRef.current = false
        }, 150)

        // End transition state after a brief delay for smooth visual feedback
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false)
        }, 300)
      }

      // Track category view for analytics
      if (typeof window !== 'undefined') {
        const event = {
          type: 'category_view',
          categoryId,
          timestamp: Date.now(),
          isMobile,
          restaurantId,
          isManualNavigation
        }

        // Store for analytics (can be sent to tracking service)
        const events = JSON.parse(sessionStorage.getItem('menuEvents') || '[]')
        events.push(event)
        sessionStorage.setItem('menuEvents', JSON.stringify(events))
      }

      debounceTimeoutRef.current = null
    }, isManualNavigation ? 0 : 50) // Immediate for manual navigation, debounced for scroll
  }, [isMobile, restaurantId])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
    }
  }, [])

  // Performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor performance metrics
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name.includes('category') && entry.duration > 200) {
            console.warn(`Performance warning: ${entry.name} took ${entry.duration}ms`)
          }
        })
      })

      observer.observe({ entryTypes: ['measure'] })

      return () => observer.disconnect()
    }

    // Return empty cleanup function for the else case
    return () => {}
  }, [])

  // Error state
  if (error) {
    return (
      <div className="menu-display-error p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Menu
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`
        menu-display w-full min-h-screen
        ${isMobile ? 'px-0' : 'px-4'}
        ${isTablet ? 'max-w-6xl mx-auto' : 'max-w-7xl mx-auto'}
      `}
    >
      {/* Performance optimization: Preload critical resources */}
      {categories.length > 0 && (
        <link
          rel="preload"
          as="image"
          href={categories[0]?.imageUrl}
          key={`preload-${categories[0]?.id}`}
        />
      )}

      {/* Main menu content */}
      <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-95' : 'opacity-100'}`}>
        <MenuCategoryList
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategoryChange={handleCategoryChange}
          showCategoryImages={!isMobile} // Hide images on mobile for performance
          isLoading={isLoading}
        />
      </div>

      {/* Mobile-specific optimizations */}
      {isMobile && (
        <div className="sr-only" aria-live="polite">
          Menu optimized for mobile viewing
        </div>
      )}
    </div>
  )
}
