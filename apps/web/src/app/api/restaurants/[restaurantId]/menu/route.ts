/**
 * API route for fetching restaurant menu data organized by categories.
 * 
 * Provides menu categories with their associated items, properly sorted
 * and filtered for display in the menu category navigation system.
 * 
 * @route GET /api/restaurants/[restaurantId]/menu
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@zergoqr/db'
import type { MenuCategoryWithItems } from '@/lib/types/menu'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params

    // Validate restaurant ID
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Fetch menu categories with their items
    const categories = await prisma.menuCategory.findMany({
      where: {
        restaurantId: restaurantId,
        isActive: true
      },
      include: {
        menuItems: {
          where: {
            isAvailable: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    // Transform data to match our TypeScript interfaces
    const transformedCategories: MenuCategoryWithItems[] = categories.map(category => ({
      id: category.id,
      restaurantId: category.restaurantId,
      name: category.name,
      description: category.description || undefined,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      imageUrl: category.imageUrl || undefined,
      menuItems: category.menuItems.map(item => ({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description || undefined,
        price: item.price,
        isVegetarian: item.isVegetarian,
        isAvailable: item.isAvailable,
        sortOrder: item.sortOrder,
        imageUrl: item.imageUrl || undefined,
        dietaryInfo: item.dietaryInfo ? JSON.parse(item.dietaryInfo) : undefined,
        spiceLevel: item.spiceLevel || undefined,
        prepTime: item.prepTime || undefined
      }))
    }))

    // Filter out categories with no available items
    const categoriesWithItems = transformedCategories.filter(
      category => category.menuItems.length > 0
    )

    // Add performance headers
    const response = NextResponse.json({
      categories: categoriesWithItems,
      totalCategories: categoriesWithItems.length,
      totalItems: categoriesWithItems.reduce(
        (total, category) => total + category.menuItems.length,
        0
      ),
      lastUpdated: new Date().toISOString()
    })

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
    
    return response

  } catch (error) {
    console.error('Error fetching menu data:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch menu data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
