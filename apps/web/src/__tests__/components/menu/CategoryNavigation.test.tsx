/**
 * Unit tests for CategoryNavigation component.
 * 
 * Tests navigation functionality, mobile optimization, and performance.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { CategoryNavigation } from '@/components/menu/CategoryNavigation'
import type { CategoryNavigationItem } from '@/lib/types/menu'

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  }
})

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0))

// Test data
const mockCategories: CategoryNavigationItem[] = [
  {
    id: 'cat-1',
    name: 'Appetizers',
    isActive: true,
    itemCount: 5
  },
  {
    id: 'cat-2',
    name: 'Main Course',
    isActive: false,
    itemCount: 8
  },
  {
    id: 'cat-3',
    name: 'Desserts',
    isActive: false,
    itemCount: 0 // Empty category
  },
  {
    id: 'cat-4',
    name: 'Beverages',
    isActive: false,
    itemCount: 12
  }
]

describe('CategoryNavigation', () => {
  const defaultProps = {
    categories: mockCategories,
    activeCategoryId: 'cat-1',
    onCategorySelect: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all category navigation buttons', () => {
      render(<CategoryNavigation {...defaultProps} />)
      
      expect(screen.getByText('Appetizers')).toBeInTheDocument()
      expect(screen.getByText('Main Course')).toBeInTheDocument()
      expect(screen.getByText('Desserts')).toBeInTheDocument()
      expect(screen.getByText('Beverages')).toBeInTheDocument()
    })

    it('shows item counts for categories with items', () => {
      render(<CategoryNavigation {...defaultProps} />)
      
      expect(screen.getByText('5')).toBeInTheDocument() // Appetizers count
      expect(screen.getByText('8')).toBeInTheDocument() // Main Course count
      expect(screen.getByText('12')).toBeInTheDocument() // Beverages count
    })

    it('does not render when no categories provided', () => {
      render(<CategoryNavigation {...defaultProps} categories={[]} />)
      
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })
  })

  describe('Active State', () => {
    it('highlights the active category', () => {
      render(<CategoryNavigation {...defaultProps} />)
      
      const activeButton = screen.getByText('Appetizers').closest('button')
      expect(activeButton).toHaveClass('bg-orange-500', 'text-white')
      expect(activeButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('does not highlight inactive categories', () => {
      render(<CategoryNavigation {...defaultProps} />)
      
      const inactiveButton = screen.getByText('Main Course').closest('button')
      expect(inactiveButton).not.toHaveClass('bg-orange-500')
      expect(inactiveButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Empty Categories', () => {
    it('disables buttons for categories with no items', () => {
      render(<CategoryNavigation {...defaultProps} />)
      
      const emptyButton = screen.getByText('Desserts').closest('button')
      expect(emptyButton).toBeDisabled()
      expect(emptyButton).toHaveClass('cursor-not-allowed')
    })

    it('enables buttons for categories with items', () => {
      render(<CategoryNavigation {...defaultProps} />)
      
      const buttonWithItems = screen.getByText('Main Course').closest('button')
      expect(buttonWithItems).not.toBeDisabled()
    })
  })

  describe('Navigation Interaction', () => {
    it('calls onCategorySelect when category is clicked', () => {
      const onCategorySelect = jest.fn()
      render(<CategoryNavigation {...defaultProps} onCategorySelect={onCategorySelect} />)
      
      fireEvent.click(screen.getByText('Main Course'))
      
      expect(onCategorySelect).toHaveBeenCalledWith('cat-2')
    })

    it('does not call onCategorySelect for disabled categories', () => {
      const onCategorySelect = jest.fn()
      render(<CategoryNavigation {...defaultProps} onCategorySelect={onCategorySelect} />)
      
      fireEvent.click(screen.getByText('Desserts'))
      
      expect(onCategorySelect).not.toHaveBeenCalled()
    })
  })

  describe('Mobile Optimization', () => {
    it('applies mobile-specific classes when isMobile is true', () => {
      render(<CategoryNavigation {...defaultProps} isMobile={true} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]', 'px-6')
      })
    })

    it('shows mobile scroll hint when there are many categories', () => {
      render(<CategoryNavigation {...defaultProps} isMobile={true} />)
      
      expect(screen.getByText('Swipe to see more categories')).toBeInTheDocument()
    })

    it('does not show scroll hint on desktop', () => {
      render(<CategoryNavigation {...defaultProps} isMobile={false} />)
      
      expect(screen.queryByText('Swipe to see more categories')).not.toBeInTheDocument()
    })

    it('does not show scroll hint when few categories on mobile', () => {
      const fewCategories = mockCategories.slice(0, 2)
      render(<CategoryNavigation {...defaultProps} categories={fewCategories} isMobile={true} />)
      
      expect(screen.queryByText('Swipe to see more categories')).not.toBeInTheDocument()
    })
  })

  describe('Performance Tracking', () => {
    it('tracks navigation performance', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const mockOnCategorySelect = jest.fn()

      // Store original performance.now
      const originalPerformanceNow = window.performance.now

      // Mock slow performance with specific timing
      let callCount = 0
      const mockPerformanceNow = jest.fn(() => {
        callCount++
        return callCount === 1 ? 0 : 250 // First call: 0ms, second call: 250ms
      })

      // Replace performance.now
      window.performance.now = mockPerformanceNow

      render(
        <CategoryNavigation
          {...defaultProps}
          onCategorySelect={mockOnCategorySelect}
        />
      )

      fireEvent.click(screen.getByText('Main Course'))

      // Verify the callback was called
      expect(mockOnCategorySelect).toHaveBeenCalledWith('cat-2')

      // Wait for requestAnimationFrame to complete
      await act(async () => {
        await new Promise(resolve => requestAnimationFrame(resolve))
      })

      // Verify performance tracking was called
      expect(mockPerformanceNow).toHaveBeenCalledTimes(2)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Category navigation took 250ms, exceeding 200ms target')
        )
      }, { timeout: 1000 })

      // Restore original performance.now
      window.performance.now = originalPerformanceNow
      consoleSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('has proper navigation role and label', () => {
      render(<CategoryNavigation {...defaultProps} />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Menu categories')
    })

    it('has proper ARIA attributes for buttons', () => {
      render(<CategoryNavigation {...defaultProps} />)
      
      const button = screen.getByText('Appetizers').closest('button')
      expect(button).toHaveAttribute('aria-pressed', 'true')
      expect(button).toHaveAttribute('aria-describedby', 'category-cat-1-count')
    })

    it('has proper focus management', () => {
      render(<CategoryNavigation {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-orange-500')
      })
    })
  })

  describe('Scroll Behavior', () => {
    it('sets up scroll event listeners', () => {
      const addEventListenerSpy = jest.spyOn(Element.prototype, 'addEventListener')
      
      render(<CategoryNavigation {...defaultProps} />)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      )
      
      addEventListenerSpy.mockRestore()
    })
  })
})
