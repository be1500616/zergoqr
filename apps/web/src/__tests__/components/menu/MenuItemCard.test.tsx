/**
 * Unit tests for MenuItemCard component.
 * 
 * Tests item display, pricing, dietary information, and cart functionality.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import type { MenuItem } from '@/lib/types/menu'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, ...props }: any) => (
    <img src={src} alt={alt} data-fill={fill} {...props} />
  )
}))

// Test data
const mockMenuItem: MenuItem = {
  id: 'item-1',
  categoryId: 'cat-1',
  name: 'Butter Chicken',
  description: 'Creamy tomato-based curry with tender chicken pieces',
  price: 45000, // ₹450
  isVegetarian: false,
  isAvailable: true,
  sortOrder: 1,
  imageUrl: '/images/butter-chicken.jpg',
  dietaryInfo: ['Dairy', 'Gluten-Free'],
  spiceLevel: 3,
  prepTime: 25
}

const mockVegMenuItem: MenuItem = {
  id: 'item-2',
  categoryId: 'cat-1',
  name: 'Paneer Tikka',
  description: 'Grilled cottage cheese with spices',
  price: 35000, // ₹350
  isVegetarian: true,
  isAvailable: true,
  sortOrder: 2,
  spiceLevel: 2
}

const mockUnavailableItem: MenuItem = {
  id: 'item-3',
  categoryId: 'cat-1',
  name: 'Fish Curry',
  description: 'Traditional fish curry',
  price: 55000, // ₹550
  isVegetarian: false,
  isAvailable: false,
  sortOrder: 3
}

describe('MenuItemCard', () => {
  const defaultProps = {
    item: mockMenuItem,
    onAddToCart: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders item name and description', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      expect(screen.getByText('Butter Chicken')).toBeInTheDocument()
      expect(screen.getByText('Creamy tomato-based curry with tender chicken pieces')).toBeInTheDocument()
    })

    it('renders formatted price', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      expect(screen.getByText('₹450')).toBeInTheDocument()
    })

    it('renders preparation time when available', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      expect(screen.getByText('25 min')).toBeInTheDocument()
    })

    it('renders item image when available', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      const image = screen.getByAltText('Butter Chicken')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', '/images/butter-chicken.jpg')
    })
  })

  describe('Dietary Information', () => {
    it('shows vegetarian indicator for vegetarian items', () => {
      render(<MenuItemCard {...defaultProps} item={mockVegMenuItem} />)
      
      const vegIndicator = screen.getByTitle('Vegetarian')
      expect(vegIndicator).toBeInTheDocument()
      expect(vegIndicator.querySelector('.bg-green-600')).toBeInTheDocument()
    })

    it('shows non-vegetarian indicator for non-vegetarian items', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      const nonVegIndicator = screen.getByTitle('Non-vegetarian')
      expect(nonVegIndicator).toBeInTheDocument()
      expect(nonVegIndicator.querySelector('.bg-red-600')).toBeInTheDocument()
    })

    it('displays dietary information tags', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      expect(screen.getByText('Dairy')).toBeInTheDocument()
      expect(screen.getByText('Gluten-Free')).toBeInTheDocument()
    })

    it('limits dietary info display and shows count for excess', () => {
      const itemWithManyDietaryInfo = {
        ...mockMenuItem,
        dietaryInfo: ['Dairy', 'Gluten-Free', 'Nuts', 'Soy', 'Eggs']
      }
      
      render(<MenuItemCard {...defaultProps} item={itemWithManyDietaryInfo} />)
      
      expect(screen.getByText('Dairy')).toBeInTheDocument()
      expect(screen.getByText('Gluten-Free')).toBeInTheDocument()
      expect(screen.getByText('+3 more')).toBeInTheDocument()
    })
  })

  describe('Spice Level', () => {
    it('displays spice level indicators', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      const spiceContainer = screen.getByTitle('Spice level: 3/5')
      expect(spiceContainer).toBeInTheDocument()
      
      // Should have 5 chili icons total
      const chiliIcons = spiceContainer.querySelectorAll('span')
      expect(chiliIcons).toHaveLength(5)
    })

    it('does not show spice level when not available', () => {
      const itemWithoutSpice = { ...mockMenuItem, spiceLevel: undefined }
      render(<MenuItemCard {...defaultProps} item={itemWithoutSpice} />)
      
      expect(screen.queryByTitle(/Spice level/)).not.toBeInTheDocument()
    })
  })

  describe('Availability', () => {
    it('shows available items with enabled add to cart button', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      const addButton = screen.getByText('Add to Cart')
      expect(addButton).toBeInTheDocument()
      expect(addButton).not.toBeDisabled()
      expect(addButton).toHaveClass('bg-orange-500')
    })

    it('shows unavailable items with disabled button', () => {
      render(<MenuItemCard {...defaultProps} item={mockUnavailableItem} />)

      const unavailableButton = screen.getByText('Unavailable')
      expect(unavailableButton).toBeInTheDocument()
      expect(unavailableButton).toBeDisabled()
      expect(unavailableButton).toHaveClass('bg-gray-200')
    })

    it('applies opacity to unavailable items', () => {
      const { container } = render(<MenuItemCard {...defaultProps} item={mockUnavailableItem} />)
      
      const card = container.firstChild
      expect(card).toHaveClass('opacity-60')
    })
  })

  describe('Add to Cart Functionality', () => {
    it('calls onAddToCart when add button is clicked for available items', () => {
      const onAddToCart = jest.fn()
      render(<MenuItemCard {...defaultProps} onAddToCart={onAddToCart} />)
      
      fireEvent.click(screen.getByText('Add to Cart'))
      
      expect(onAddToCart).toHaveBeenCalledWith(mockMenuItem)
    })

    it('does not call onAddToCart for unavailable items', () => {
      const onAddToCart = jest.fn()
      render(<MenuItemCard {...defaultProps} item={mockUnavailableItem} onAddToCart={onAddToCart} />)
      
      fireEvent.click(screen.getByText('Unavailable'))
      
      expect(onAddToCart).not.toHaveBeenCalled()
    })

    it('does not call onAddToCart when callback is not provided', () => {
      render(<MenuItemCard item={mockMenuItem} />)
      
      const addButton = screen.getByText('Add to Cart')
      expect(() => fireEvent.click(addButton)).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for the card', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      const article = screen.getByRole('article')
      expect(article).toHaveAttribute('aria-labelledby', 'item-item-1-name')
    })

    it('has proper ARIA label for add to cart button', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      const addButton = screen.getByLabelText('Add Butter Chicken to cart for ₹450')
      expect(addButton).toBeInTheDocument()
    })

    it('has proper ARIA labels for dietary indicators', () => {
      render(<MenuItemCard {...defaultProps} />)
      
      const nonVegIndicator = screen.getByLabelText('Non-vegetarian')
      expect(nonVegIndicator).toBeInTheDocument()
    })
  })

  describe('Layout without Image', () => {
    it('renders properly when no image is provided', () => {
      const itemWithoutImage = { ...mockMenuItem, imageUrl: undefined }
      render(<MenuItemCard {...defaultProps} item={itemWithoutImage} />)
      
      expect(screen.getByText('Butter Chicken')).toBeInTheDocument()
      expect(screen.queryByAltText('Butter Chicken')).not.toBeInTheDocument()
      
      // Vegetarian indicator should still be visible
      expect(screen.getByTitle('Non-vegetarian')).toBeInTheDocument()
    })
  })

  describe('Price Formatting', () => {
    it('formats prices correctly for different amounts', () => {
      const expensiveItem = { ...mockMenuItem, price: 125000 } // ₹1250
      render(<MenuItemCard {...defaultProps} item={expensiveItem} />)
      
      expect(screen.getByText('₹1250')).toBeInTheDocument()
    })

    it('handles zero price', () => {
      const freeItem = { ...mockMenuItem, price: 0 }
      render(<MenuItemCard {...defaultProps} item={freeItem} />)
      
      expect(screen.getByText('₹0')).toBeInTheDocument()
    })
  })
})
