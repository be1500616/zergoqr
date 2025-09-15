/**
 * CategoryNavigation component provides smooth scrolling navigation between menu categories.
 * 
 * Features horizontal scrolling pills/tabs with active indicators and touch-friendly
 * mobile interactions.
 * 
 * @example
 * ```tsx
 * <CategoryNavigation 
 *   categories={navigationCategories}
 *   activeCategoryId={activeId}
 *   onCategorySelect={handleSelect}
 *   isMobile={isMobileDevice}
 * />
 * ```
 */

'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import type { CategoryNavigationProps } from '@/lib/types/menu'

export function CategoryNavigation({
  categories,
  activeCategoryId,
  onCategorySelect,
  isMobile = false,
  className = ''
}: CategoryNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const activeButtonRef = useRef<HTMLButtonElement>(null)
  const performanceTrackingRef = useRef<number | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showLeftShadow, setShowLeftShadow] = useState(false)
  const [showRightShadow, setShowRightShadow] = useState(false)

  // Check scroll position to show/hide shadows with debouncing
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    const leftShadow = scrollLeft > 0
    const rightShadow = scrollLeft < scrollWidth - clientWidth - 1

    // Batch state updates to prevent race conditions
    setShowLeftShadow(prev => prev !== leftShadow ? leftShadow : prev)
    setShowRightShadow(prev => prev !== rightShadow ? rightShadow : prev)
  }, [])

  // Scroll active category into view with debouncing
  useEffect(() => {
    // Clear any pending scroll operations
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Debounce scroll operations to prevent conflicts
    scrollTimeoutRef.current = setTimeout(() => {
      if (activeButtonRef.current && scrollContainerRef.current) {
        const button = activeButtonRef.current
        const container = scrollContainerRef.current

        const buttonRect = button.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        // Check if button is outside visible area
        if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
          button.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          })
        }
      }
    }, 50) // 50ms debounce
  }, [activeCategoryId])

  // Set up scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollPosition()
    container.addEventListener('scroll', checkScrollPosition, { passive: true })

    return () => {
      container.removeEventListener('scroll', checkScrollPosition)
    }
  }, [checkScrollPosition])

  // Cleanup performance tracking and scroll timeouts on unmount
  useEffect(() => {
    return () => {
      if (performanceTrackingRef.current) {
        cancelAnimationFrame(performanceTrackingRef.current)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Handle category selection with performance tracking
  const handleCategoryClick = useCallback((categoryId: string) => {
    const startTime = performance.now()

    // Cancel any pending performance tracking
    if (performanceTrackingRef.current) {
      cancelAnimationFrame(performanceTrackingRef.current)
    }

    onCategorySelect(categoryId)

    // Track navigation performance with cleanup
    performanceTrackingRef.current = requestAnimationFrame(() => {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (duration > 200) {
        console.warn(`Category navigation took ${duration}ms, exceeding 200ms target`)
      }

      performanceTrackingRef.current = null
    })
  }, [onCategorySelect])

  // Memoize categories to prevent unnecessary re-renders
  const memoizedCategories = useMemo(() => categories, [categories])

  if (memoizedCategories.length === 0) {
    return null
  }

  return (
    <nav 
      className={`category-navigation relative ${className}`}
      role="navigation"
      aria-label="Menu categories"
    >
      {/* Left shadow indicator */}
      {showLeftShadow && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide space-x-2 py-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {memoizedCategories.map((category) => {
          const isActive = category.id === activeCategoryId
          const hasItems = category.itemCount > 0
          
          return (
            <button
              key={category.id}
              ref={isActive ? activeButtonRef : null}
              onClick={() => handleCategoryClick(category.id)}
              disabled={!hasItems}
              data-testid={`nav-${category.id}`}
              className={`
                category-nav-button
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                ${isMobile ? 'min-h-[44px] px-6' : 'min-h-[36px]'}
                ${isActive
                  ? 'bg-orange-500 text-white shadow-md transform scale-105'
                  : hasItems
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
                ${isMobile ? 'active:scale-95' : 'hover:scale-105'}
              `}
              aria-pressed={isActive}
              aria-describedby={`category-${category.id}-count`}
            >
              <span className="whitespace-nowrap">
                {category.name}
                {hasItems && (
                  <span 
                    id={`category-${category.id}-count`}
                    className={`
                      ml-2 px-2 py-0.5 rounded-full text-xs
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}
                    aria-label={`${category.itemCount} items`}
                  >
                    {category.itemCount}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Right shadow indicator */}
      {showRightShadow && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Mobile scroll hint */}
      {isMobile && memoizedCategories.length > 3 && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Swipe to see more categories
        </div>
      )}
    </nav>
  )
}
