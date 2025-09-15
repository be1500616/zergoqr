/**
 * MenuCategoryList component displays the complete menu organized by categories.
 * 
 * This is a Server Component that handles the main menu display with category
 * organization, smooth scrolling navigation, and performance optimization.
 * 
 * @example
 * ```tsx
 * <MenuCategoryList 
 *   categories={menuCategories}
 *   showCategoryImages={true}
 *   onCategoryChange={handleCategoryChange}
 * />
 * ```
 */

import type { MenuDisplayProps } from '@/lib/types/menu'
import { useCallback, useEffect, useRef } from 'react'
import { CategoryHeader } from './CategoryHeader'
import { CategoryNavigation } from './CategoryNavigation'
import { EmptyState } from './EmptyState'
import { MenuItemCard } from './MenuItemCard'

export function MenuCategoryList({
  categories,
  activeCategoryId,
  onCategoryChange,
  showCategoryImages = true,
  isLoading = false
}: MenuDisplayProps) {
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const activeCategoryRef = useRef<string | undefined>(activeCategoryId)

  // Keep ref in sync with prop
  useEffect(() => {
    activeCategoryRef.current = activeCategoryId
  }, [activeCategoryId])

  // Performance tracking for category switching
  const trackCategorySwitch = useCallback((categoryId: string, startTime: number) => {
    const switchTime = performance.now() - startTime
    
    // Log performance metrics (can be sent to analytics)
    if (switchTime > 200) {
      console.warn(`Category switch took ${switchTime}ms, exceeding 200ms target`)
    }
    
    // Store metrics for debugging
    if (typeof window !== 'undefined') {
      const metrics = {
        categoryId,
        switchTime,
        timestamp: Date.now()
      }
      
      // Store in sessionStorage for debugging
      const existingMetrics = JSON.parse(
        sessionStorage.getItem('categoryMetrics') || '[]'
      )
      existingMetrics.push(metrics)
      sessionStorage.setItem('categoryMetrics', JSON.stringify(existingMetrics))
    }
  }, [])

  // Smooth scroll to category
  const scrollToCategory = useCallback((categoryId: string) => {
    const startTime = performance.now()
    const element = categoryRefs.current[categoryId]
    
    if (element && containerRef.current) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
      
      // Track performance after scroll completes
      setTimeout(() => {
        trackCategorySwitch(categoryId, startTime)
      }, 100)
    }
  }, [trackCategorySwitch])

  // Handle category selection from navigation
  const handleCategorySelect = useCallback((categoryId: string) => {
    scrollToCategory(categoryId)
    onCategoryChange?.(categoryId, true) // Mark as manual navigation
  }, [scrollToCategory, onCategoryChange])

  // Set up intersection observer for active category detection
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Process entries to find the most visible category
        let mostVisibleEntry: IntersectionObserverEntry | null = null
        let maxRatio = 0

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            mostVisibleEntry = entry
            maxRatio = entry.intersectionRatio
          }
        })

        // Only update if we have a clearly visible category (>50% visible)
        if (mostVisibleEntry && maxRatio > 0.5) {
          const categoryId = (mostVisibleEntry.target as Element).getAttribute('data-category-id')
          if (categoryId && categoryId !== activeCategoryRef.current) {
            // Only trigger scroll-based updates (not manual navigation)
            onCategoryChange?.(categoryId, false)
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0.3, 0.5, 0.7] // Multiple thresholds for better accuracy
      }
    )

    // Observe all category sections
    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [onCategoryChange]) // Removed activeCategoryId dependency to prevent recreation

  // Filter out inactive categories and prepare navigation data
  const activeCategories = categories.filter(category => category.isActive)
  const navigationCategories = activeCategories.map(category => ({
    id: category.id,
    name: category.name,
    isActive: category.id === activeCategoryId,
    itemCount: category.menuItems?.filter(item => item.isAvailable).length || 0
  }))

  if (isLoading) {
    return (
      <div className="menu-category-list-loading">
        <div className="animate-pulse space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeCategories.length === 0) {
    return (
      <EmptyState 
        categoryName="Menu" 
        message="No menu categories are currently available. Please check back later."
        className="min-h-[400px] flex items-center justify-center"
      />
    )
  }

  return (
    <div className="menu-category-list w-full">
      {/* Category Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 mb-6">
        <CategoryNavigation
          categories={navigationCategories}
          activeCategoryId={activeCategoryId}
          onCategorySelect={handleCategorySelect}
          className="px-4 py-3"
        />
      </div>

      {/* Category Content */}
      <div 
        ref={containerRef}
        className="menu-categories-container space-y-12 px-4"
      >
        {activeCategories.map((category) => (
          <section
            key={category.id}
            ref={(el) => {
              categoryRefs.current[category.id] = el
            }}
            data-category-id={category.id}
            className="menu-category-section"
            aria-labelledby={`category-${category.id}-heading`}
          >
            {/* Category Header */}
            <CategoryHeader
              category={category}
              showImage={showCategoryImages}
              className="mb-6"
            />

            {/* Menu Items */}
            <div className="menu-items-grid">
              {category.menuItems && category.menuItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.menuItems
                    .filter(item => item.isAvailable)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        className="menu-item-card"
                      />
                    ))}
                </div>
              ) : (
                <EmptyState
                  categoryName={category.name}
                  message={`No items are currently available in ${category.name}. Please check other categories.`}
                  className="py-8"
                />
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
