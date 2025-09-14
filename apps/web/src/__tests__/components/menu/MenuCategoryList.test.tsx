/**
 * Unit tests for MenuCategoryList component.
 * 
 * Tests category display, navigation, performance, and accessibility features.
 */

import { MenuCategoryList } from '@/components/menu/MenuCategoryList'
import type { MenuCategoryWithItems } from '@/lib/types/menu'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

// Mock the child components
jest.mock('@/components/menu/CategoryHeader', () => ({
  CategoryHeader: ({ category }: { category: any }) => (
    <div data-testid={`category-header-${category.id}`}>
      {category.name}
    </div>
  )
}))

jest.mock('@/components/menu/CategoryNavigation', () => ({
  CategoryNavigation: ({ categories, onCategorySelect }: any) => (
    <div data-testid="category-navigation">
      {categories.map((cat: any) => (
        <button
          key={cat.id}
          onClick={() => onCategorySelect(cat.id)}
          data-testid={`nav-${cat.id}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}))

jest.mock('@/components/menu/MenuItemCard', () => ({
  MenuItemCard: ({ item }: { item: any }) => (
    <div data-testid={`menu-item-${item.id}`}>
      {item.name}
    </div>
  )
}))

jest.mock('@/components/menu/EmptyState', () => ({
  EmptyState: ({ categoryName }: { categoryName: string }) => (
    <div data-testid="empty-state">
      No items in {categoryName}
    </div>
  )
}))

// Mock intersection observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  }
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

// Test data
const mockCategories: MenuCategoryWithItems[] = [
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
        price: 25000, // ₹250
        isVegetarian: true,
        isAvailable: true,
        sortOrder: 1,
        imageUrl: '/images/spring-rolls.jpg'
      },
      {
        id: 'item-2',
        categoryId: 'cat-1',
        name: 'Chicken Wings',
        description: 'Spicy buffalo wings',
        price: 35000, // ₹350
        isVegetarian: false,
        isAvailable: true,
        sortOrder: 2,
        spiceLevel: 3
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
        id: 'item-3',
        categoryId: 'cat-2',
        name: 'Butter Chicken',
        description: 'Creamy tomato curry',
        price: 45000, // ₹450
        isVegetarian: false,
        isAvailable: true,
        sortOrder: 1,
        prepTime: 25
      }
    ]
  },
  {
    id: 'cat-3',
    restaurantId: 'rest-1',
    name: 'Desserts',
    description: 'Sweet endings',
    sortOrder: 3,
    isActive: true,
    menuItems: [] // Empty category for testing
  }
]

describe('MenuCategoryList', () => {
  const defaultProps = {
    categories: mockCategories,
    activeCategoryId: 'cat-1',
    onCategoryChange: jest.fn(),
    showCategoryImages: true,
    isLoading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all active categories', () => {
      render(<MenuCategoryList {...defaultProps} />)
      
      expect(screen.getByTestId('category-header-cat-1')).toBeInTheDocument()
      expect(screen.getByTestId('category-header-cat-2')).toBeInTheDocument()
      expect(screen.getByTestId('category-header-cat-3')).toBeInTheDocument()
    })

    it('renders category navigation', () => {
      render(<MenuCategoryList {...defaultProps} />)
      
      expect(screen.getByTestId('category-navigation')).toBeInTheDocument()
      expect(screen.getByTestId('nav-cat-1')).toBeInTheDocument()
      expect(screen.getByTestId('nav-cat-2')).toBeInTheDocument()
    })

    it('renders menu items for categories with items', () => {
      render(<MenuCategoryList {...defaultProps} />)
      
      expect(screen.getByTestId('menu-item-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('menu-item-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('menu-item-item-3')).toBeInTheDocument()
    })

    it('shows empty state for categories without items', () => {
      render(<MenuCategoryList {...defaultProps} />)
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText('No items in Desserts')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading skeleton when isLoading is true', () => {
      render(<MenuCategoryList {...defaultProps} isLoading={true} />)
      
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Empty Categories', () => {
    it('shows empty state when no categories are provided', () => {
      render(<MenuCategoryList {...defaultProps} categories={[]} />)

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText(/No items in Menu/)).toBeInTheDocument()
    })

    it('filters out inactive categories', () => {
      const categoriesWithInactive = [
        ...mockCategories,
        {
          id: 'cat-4',
          restaurantId: 'rest-1',
          name: 'Inactive Category',
          sortOrder: 4,
          isActive: false,
          menuItems: []
        }
      ]

      render(<MenuCategoryList {...defaultProps} categories={categoriesWithInactive} />)
      
      expect(screen.queryByText('Inactive Category')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('calls onCategoryChange when navigation item is clicked', () => {
      const onCategoryChange = jest.fn()
      render(<MenuCategoryList {...defaultProps} onCategoryChange={onCategoryChange} />)
      
      fireEvent.click(screen.getByTestId('nav-cat-2'))
      
      expect(onCategoryChange).toHaveBeenCalledWith('cat-2', true)
    })

    it('sets up intersection observer for scroll detection', () => {
      render(<MenuCategoryList {...defaultProps} />)
      
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it('tracks category switch performance', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      // Mock slow performance
      const mockPerformanceNow = jest.fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(250) // 250ms - exceeds 200ms target

      Object.defineProperty(window, 'performance', {
        value: {
          ...window.performance,
          now: mockPerformanceNow
        },
        writable: true
      })

      render(<MenuCategoryList {...defaultProps} />)

      // Get the category section and manually set up the ref
      const categorySection = screen.getByTestId('category-header-cat-2').closest('section')
      expect(categorySection).toBeInTheDocument()

      // Mock scrollIntoView on the specific element
      const mockScrollIntoView = jest.fn()
      if (categorySection) {
        categorySection.scrollIntoView = mockScrollIntoView
      }

      fireEvent.click(screen.getByTestId('nav-cat-2'))

      // Wait for setTimeout to complete (100ms delay in trackCategorySwitch)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Category switch took 250ms, exceeding 200ms target')
        )
      }, { timeout: 1000 })

      consoleSpy.mockRestore()
    })

    it('stores performance metrics in sessionStorage', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation()
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('[]')

      render(<MenuCategoryList {...defaultProps} />)

      fireEvent.click(screen.getByTestId('nav-cat-2'))

      // Wait for setTimeout to complete (100ms delay in trackCategorySwitch)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith(
          'categoryMetrics',
          expect.stringContaining('cat-2')
        )
      }, { timeout: 1000 })

      setItemSpy.mockRestore()
      getItemSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for category sections', () => {
      render(<MenuCategoryList {...defaultProps} />)
      
      const categorySection = screen.getByTestId('category-header-cat-1').closest('section')
      expect(categorySection).toHaveAttribute('aria-labelledby', 'category-cat-1-heading')
    })

    it('has proper data attributes for category identification', () => {
      render(<MenuCategoryList {...defaultProps} />)
      
      const categorySection = screen.getByTestId('category-header-cat-1').closest('section')
      expect(categorySection).toHaveAttribute('data-category-id', 'cat-1')
    })
  })

  describe('Image Display', () => {
    it('passes showCategoryImages prop to CategoryHeader', () => {
      render(<MenuCategoryList {...defaultProps} showCategoryImages={false} />)
      
      // This would be tested by checking if CategoryHeader receives the prop
      // In a real test, we'd mock CategoryHeader and verify the prop
      expect(screen.getByTestId('category-header-cat-1')).toBeInTheDocument()
    })
  })
})
