/**
 * Menu-related TypeScript types for the ZERGO QR restaurant ordering system.
 * 
 * These types define the structure for menu categories, items, and related data
 * used throughout the menu display and navigation components.
 */

export interface MenuCategory {
  /** Unique identifier for the category */
  id: string
  /** Restaurant this category belongs to */
  restaurantId: string
  /** Display name of the category */
  name: string
  /** Optional description of the category */
  description?: string
  /** Sort order for category display */
  sortOrder: number
  /** Whether the category is currently active/available */
  isActive: boolean
  /** Optional header image URL for the category */
  imageUrl?: string
  /** Menu items in this category */
  menuItems?: MenuItem[]
}

export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string
  /** Category this item belongs to */
  categoryId: string
  /** Display name of the item */
  name: string
  /** Description of the item */
  description?: string
  /** Price in smallest currency unit (paise for INR) */
  price: number
  /** Whether the item is vegetarian */
  isVegetarian: boolean
  /** Whether the item is currently available */
  isAvailable: boolean
  /** Sort order within the category */
  sortOrder: number
  /** Optional image URL for the item */
  imageUrl?: string
  /** Dietary restrictions and allergen information */
  dietaryInfo?: string[]
  /** Spice level (1-5 scale) */
  spiceLevel?: number
  /** Preparation time in minutes */
  prepTime?: number
}

export interface MenuCategoryWithItems extends MenuCategory {
  /** Menu items in this category (required for display) */
  menuItems: MenuItem[]
}

export interface CategoryNavigationItem {
  /** Category ID for navigation */
  id: string
  /** Display name for navigation */
  name: string
  /** Whether this category is currently active/visible */
  isActive: boolean
  /** Number of available items in this category */
  itemCount: number
}

export interface MenuDisplayProps {
  /** List of categories with their items */
  categories: MenuCategoryWithItems[]
  /** Currently active/visible category ID */
  activeCategoryId?: string
  /** Callback when category becomes active */
  onCategoryChange?: (categoryId: string, isManualNavigation?: boolean) => void
  /** Whether to show category images */
  showCategoryImages?: boolean
  /** Loading state */
  isLoading?: boolean
}

export interface CategoryHeaderProps {
  /** Category data to display */
  category: MenuCategory
  /** Whether to show the category image */
  showImage?: boolean
  /** Additional CSS classes */
  className?: string
}

export interface CategoryNavigationProps {
  /** List of categories for navigation */
  categories: CategoryNavigationItem[]
  /** Currently active category ID */
  activeCategoryId?: string
  /** Callback when category is selected */
  onCategorySelect: (categoryId: string) => void
  /** Whether navigation is in mobile mode */
  isMobile?: boolean
  /** Additional CSS classes */
  className?: string
}

export interface EmptyStateProps {
  /** Category name for the empty state */
  categoryName: string
  /** Custom message to display */
  message?: string
  /** Additional CSS classes */
  className?: string
}

/** Utility type for category filtering */
export type CategoryFilter = 'all' | 'available' | 'vegetarian'

/** Performance tracking for category switching */
export interface CategorySwitchMetrics {
  /** Category ID that was switched to */
  categoryId: string
  /** Time taken for the switch in milliseconds */
  switchTime: number
  /** Timestamp of the switch */
  timestamp: number
}
