/**
 * Menu demo page to test the Menu Category Display and Navigation feature.
 *
 * This page demonstrates the complete menu system with sample data.
 */

'use client'

import { MenuDisplay } from '@/components/menu/MenuDisplay'
import type { MenuCategoryWithItems } from '@/lib/types/menu'

// Sample data for testing
const sampleMenuData: MenuCategoryWithItems[] = [
  {
    id: 'appetizers',
    restaurantId: 'demo-restaurant',
    name: 'Appetizers',
    description: 'Start your meal with our delicious appetizers',
    sortOrder: 1,
    isActive: true,
    imageUrl: '/images/appetizers.jpg',
    menuItems: [
      {
        id: 'spring-rolls',
        categoryId: 'appetizers',
        name: 'Vegetable Spring Rolls',
        description: 'Crispy spring rolls filled with fresh vegetables and served with sweet chili sauce',
        price: 25000, // ₹250
        isVegetarian: true,
        isAvailable: true,
        sortOrder: 1,
        spiceLevel: 1,
        prepTime: 15,
        dietaryInfo: ['Vegan', 'Gluten-Free']
      },
      {
        id: 'chicken-wings',
        categoryId: 'appetizers',
        name: 'Buffalo Chicken Wings',
        description: 'Spicy buffalo wings served with blue cheese dip and celery sticks',
        price: 35000, // ₹350
        isVegetarian: false,
        isAvailable: true,
        sortOrder: 2,
        spiceLevel: 4,
        prepTime: 20
      },
      {
        id: 'samosas',
        categoryId: 'appetizers',
        name: 'Punjabi Samosas',
        description: 'Traditional deep-fried pastries filled with spiced potatoes and peas',
        price: 18000, // ₹180
        isVegetarian: true,
        isAvailable: true,
        sortOrder: 3,
        spiceLevel: 2,
        prepTime: 10
      }
    ]
  },
  {
    id: 'main-course',
    restaurantId: 'demo-restaurant',
    name: 'Main Course',
    description: 'Hearty main dishes to satisfy your hunger',
    sortOrder: 2,
    isActive: true,
    menuItems: [
      {
        id: 'butter-chicken',
        categoryId: 'main-course',
        name: 'Butter Chicken',
        description: 'Tender chicken pieces in a rich, creamy tomato-based curry sauce',
        price: 45000, // ₹450
        isVegetarian: false,
        isAvailable: true,
        sortOrder: 1,
        spiceLevel: 2,
        prepTime: 25,
        dietaryInfo: ['Contains Dairy']
      },
      {
        id: 'paneer-tikka-masala',
        categoryId: 'main-course',
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese cubes in a spiced tomato and onion gravy',
        price: 38000, // ₹380
        isVegetarian: true,
        isAvailable: true,
        sortOrder: 2,
        spiceLevel: 3,
        prepTime: 30,
        dietaryInfo: ['Contains Dairy', 'Vegetarian']
      },
      {
        id: 'fish-curry',
        categoryId: 'main-course',
        name: 'Kerala Fish Curry',
        description: 'Fresh fish cooked in coconut milk with traditional Kerala spices',
        price: 55000, // ₹550
        isVegetarian: false,
        isAvailable: false, // Unavailable for testing
        sortOrder: 3,
        spiceLevel: 3,
        prepTime: 35,
        dietaryInfo: ['Contains Fish', 'Dairy-Free']
      }
    ]
  },
  {
    id: 'desserts',
    restaurantId: 'demo-restaurant',
    name: 'Desserts',
    description: 'Sweet endings to your perfect meal',
    sortOrder: 3,
    isActive: true,
    menuItems: [
      {
        id: 'gulab-jamun',
        categoryId: 'desserts',
        name: 'Gulab Jamun',
        description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
        price: 15000, // ₹150
        isVegetarian: true,
        isAvailable: true,
        sortOrder: 1,
        prepTime: 5,
        dietaryInfo: ['Contains Dairy', 'Vegetarian']
      },
      {
        id: 'kulfi',
        categoryId: 'desserts',
        name: 'Malai Kulfi',
        description: 'Traditional Indian ice cream made with condensed milk and cardamom',
        price: 12000, // ₹120
        isVegetarian: true,
        isAvailable: true,
        sortOrder: 2,
        prepTime: 2,
        dietaryInfo: ['Contains Dairy', 'Vegetarian']
      }
    ]
  },
  {
    id: 'beverages',
    restaurantId: 'demo-restaurant',
    name: 'Beverages',
    description: 'Refreshing drinks to complement your meal',
    sortOrder: 4,
    isActive: true,
    menuItems: [] // Empty category for testing
  }
]

export default function MenuPage() {
  const handleCategoryChange = (categoryId: string) => {
    console.log('Category changed to:', categoryId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Menu Category Display Demo
          </h1>
          <p className="text-gray-600 mt-2">
            Demonstrating the complete menu category navigation system
          </p>
        </div>
      </header>

      {/* Menu Display */}
      <main className="py-8">
        <MenuDisplay
          restaurantId="demo-restaurant"
          categories={sampleMenuData}
          initialCategoryId="appetizers"
          onCategoryChange={handleCategoryChange}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>Menu Category Display and Navigation - Story 1.2a Implementation</p>
            <p className="text-sm mt-2">
              Features: Category navigation, smooth scrolling, mobile optimization, 
              performance tracking, empty state handling
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
