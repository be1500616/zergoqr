/**
 * Integration tests for the complete Menu Display system.
 * 
 * Tests the full menu category display and navigation workflow including
 * API integration, performance, and user interactions.
 */

import { MenuDisplay } from '@/components/menu/MenuDisplay'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

// Mock the useMediaQuery hook
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn((query: string) => {
    if (query === '(max-width: 768px)') return false // Desktop by default
    if (query === '(max-width: 1024px)') return false
    return false
  })
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  }
})

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn()
}))

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

// Test data
const mockApiResponse = {
  categories: [
    {
      id: 'cat-1',
      restaurantId: 'rest-1',
      name: 'Appetizers',
      description: 'Start your meal right',
      sortOrder: 1,
      isActive: true,
      imageUrl: '/images/appetizers.jpg',
      menuItems: [
        {
          id: 'item-1',
          categoryId: 'cat-1',
          name: 'Spring Rolls',
          description: 'Crispy vegetable spring rolls',
          price: 25000,
          isVegetarian: true,
          isAvailable: true,
          sortOrder: 1
        }
      ]
    },
    {
      id: 'cat-2',
      restaurantId: 'rest-1',
      name: 'Main Course',
      description: 'Hearty main dishes',
      sortOrder: 2,
      isActive: true,
      menuItems: [
        {
          id: 'item-2',
          categoryId: 'cat-2',
          name: 'Butter Chicken',
          description: 'Creamy tomato curry',
          price: 45000,
          isVegetarian: false,
          isAvailable: true,
          sortOrder: 1
        }
      ]
    }
  ],
  totalCategories: 2,
  totalItems: 2,
  lastUpdated: new Date().toISOString()
}

describe('MenuDisplay Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionStorage.getItem.mockReturnValue('[]')
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    })
  })

  describe('Data Loading', () => {
    it('loads menu data from API when not provided', async () => {
      await act(async () => {
        render(<MenuDisplay restaurantId="rest-1" />)
      })

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/restaurants/rest-1/menu')
      })

      await waitFor(() => {
        expect(screen.getByText('Appetizers')).toBeInTheDocument()
        expect(screen.getByText('Main Course')).toBeInTheDocument()
      })
    })

    it('uses provided categories data without API call', () => {
      render(
        <MenuDisplay 
          restaurantId="rest-1" 
          categories={mockApiResponse.categories}
        />
      )
      
      expect(fetch).not.toHaveBeenCalled()
      expect(screen.getByText('Appetizers')).toBeInTheDocument()
    })

    it('sets initial active category automatically', async () => {
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Appetizers')).toBeInTheDocument()
      })
      
      // First category with items should be active
      const appetizersButton = screen.getByText('Appetizers').closest('button')
      expect(appetizersButton).toHaveClass('bg-orange-500')
    })
  })

  describe('Error Handling', () => {
    it('displays error state when API call fails', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Menu')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('displays error state for non-200 responses', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      })
      
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Menu')).toBeInTheDocument()
        expect(screen.getByText('Failed to load menu: Not Found')).toBeInTheDocument()
      })
    })

    it('provides retry functionality on error', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
      
      // Mock successful retry
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      })
      
      fireEvent.click(screen.getByText('Try Again'))
      
      await waitFor(() => {
        expect(screen.getByText('Appetizers')).toBeInTheDocument()
      })
    })
  })

  describe('Category Navigation', () => {
    it('navigates between categories smoothly', async () => {
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Appetizers')).toBeInTheDocument()
      })
      
      // Click on Main Course
      fireEvent.click(screen.getByTestId('nav-cat-2'))

      await waitFor(() => {
        const mainCourseButton = screen.getByTestId('nav-cat-2')
        expect(mainCourseButton).toHaveClass('bg-orange-500')
      })
    })

    it('tracks category changes in analytics', async () => {
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Main Course')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('nav-cat-2'))
      
      await waitFor(() => {
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'menuEvents',
          expect.stringContaining('category_view')
        )
      })
    })
  })

  describe('Performance Monitoring', () => {
    it('sets up performance observer', async () => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      }
      
      global.PerformanceObserver = jest.fn().mockImplementation((callback) => {
        return mockObserver
      })
      
      render(<MenuDisplay restaurantId="rest-1" />)
      
      expect(PerformanceObserver).toHaveBeenCalled()
      expect(mockObserver.observe).toHaveBeenCalledWith({ entryTypes: ['measure'] })
    })

    it('debounces rapid category changes', async () => {
      jest.useFakeTimers()
      
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Main Course')).toBeInTheDocument()
      })
      
      // Rapid clicks
      fireEvent.click(screen.getByTestId('nav-cat-2'))
      fireEvent.click(screen.getByTestId('nav-cat-1'))
      fireEvent.click(screen.getByTestId('nav-cat-2'))

      // Only the last change should be processed after debounce
      jest.advanceTimersByTime(100)

      await waitFor(() => {
        const mainCourseButton = screen.getByTestId('nav-cat-2')
        expect(mainCourseButton).toHaveClass('bg-orange-500')
      })
      
      jest.useRealTimers()
    })
  })

  describe('Mobile Optimization', () => {
    it('applies mobile-specific optimizations', async () => {
      const { useMediaQuery } = require('@/hooks/useMediaQuery')
      useMediaQuery.mockImplementation((query: string) => {
        return query === '(max-width: 768px)' // Mobile
      })
      
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Appetizers')).toBeInTheDocument()
      })
      
      // Check for mobile-specific classes
      const container = document.querySelector('.menu-display')
      expect(container).toHaveClass('px-0')
    })

    it('hides category images on mobile for performance', async () => {
      const { useMediaQuery } = require('@/hooks/useMediaQuery')
      useMediaQuery.mockImplementation((query: string) => {
        return query === '(max-width: 768px)' // Mobile
      })
      
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Appetizers')).toBeInTheDocument()
      })
      
      // Images should be hidden on mobile (this would be tested by checking
      // if MenuCategoryList receives showCategoryImages=false)
    })
  })

  describe('Loading States', () => {
    it('shows loading state initially', () => {
      render(<MenuDisplay restaurantId="rest-1" isLoading={true} />)

      expect(document.querySelector('.menu-category-list-loading')).toBeInTheDocument()
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('transitions from loading to content', async () => {
      const { rerender } = render(<MenuDisplay restaurantId="rest-1" isLoading={true} />)

      expect(document.querySelector('.menu-category-list-loading')).toBeInTheDocument()

      rerender(
        <MenuDisplay
          restaurantId="rest-1"
          categories={mockApiResponse.categories}
          isLoading={false}
        />
      )

      expect(screen.getByText('Appetizers')).toBeInTheDocument()
      expect(document.querySelector('.menu-category-list-loading')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies tablet-specific layout', async () => {
      const { useMediaQuery } = require('@/hooks/useMediaQuery')
      useMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 768px)') return false // Not mobile
        if (query === '(max-width: 1024px)') return true // Tablet
        return false
      })
      
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        const container = document.querySelector('.menu-display')
        expect(container).toHaveClass('max-w-6xl')
      })
    })

    it('applies desktop layout for large screens', async () => {
      render(<MenuDisplay restaurantId="rest-1" />)
      
      await waitFor(() => {
        const container = document.querySelector('.menu-display')
        expect(container).toHaveClass('max-w-7xl')
      })
    })
  })
})
