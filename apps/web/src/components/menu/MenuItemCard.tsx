/**
 * MenuItemCard component displays individual menu items within categories.
 * 
 * Shows item details including name, description, price, dietary information,
 * and provides add-to-cart functionality.
 * 
 * @example
 * ```tsx
 * <MenuItemCard 
 *   item={menuItem}
 *   onAddToCart={handleAddToCart}
 *   className="menu-item-card"
 * />
 * ```
 */

import Image from 'next/image'
import type { MenuItem } from '@/lib/types/menu'

interface MenuItemCardProps {
  /** Menu item data to display */
  item: MenuItem
  /** Callback when item is added to cart */
  onAddToCart?: (item: MenuItem) => void
  /** Additional CSS classes */
  className?: string
}

export function MenuItemCard({
  item,
  onAddToCart,
  className = ''
}: MenuItemCardProps) {
  // Format price in INR
  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toFixed(0)}`
  }

  // Get spice level indicator
  const getSpiceIndicator = (level?: number) => {
    if (!level) return null
    
    const spiceIcons = Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-xs ${i < level ? 'text-red-500' : 'text-gray-300'}`}
        aria-hidden="true"
      >
        🌶️
      </span>
    ))
    
    return (
      <div className="flex items-center space-x-1" title={`Spice level: ${level}/5`}>
        {spiceIcons}
      </div>
    )
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (onAddToCart && item.isAvailable) {
      onAddToCart(item)
    }
  }

  return (
    <article 
      className={`
        menu-item-card bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md transition-shadow duration-200
        ${!item.isAvailable ? 'opacity-60' : ''}
        ${className}
      `}
      aria-labelledby={`item-${item.id}-name`}
    >
      {/* Item Image */}
      {item.imageUrl && (
        <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Vegetarian/Non-vegetarian indicator */}
          <div className="absolute top-3 left-3">
            <div 
              className={`
                w-4 h-4 rounded-sm border-2 flex items-center justify-center
                ${item.isVegetarian 
                  ? 'border-green-600 bg-white' 
                  : 'border-red-600 bg-white'
                }
              `}
              title={item.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
              aria-label={item.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
            >
              <div 
                className={`
                  w-2 h-2 rounded-full
                  ${item.isVegetarian ? 'bg-green-600' : 'bg-red-600'}
                `}
              />
            </div>
          </div>

          {/* Availability overlay - only show for items with images */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>
      )}

      {/* Item Content */}
      <div className="p-4">
        {/* Item Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 
              id={`item-${item.id}-name`}
              className="text-lg font-semibold text-gray-900 mb-1"
            >
              {item.name}
            </h3>
            
            {/* Vegetarian indicator for items without images */}
            {!item.imageUrl && (
              <div 
                className={`
                  inline-flex items-center justify-center w-4 h-4 rounded-sm border-2 mb-2
                  ${item.isVegetarian 
                    ? 'border-green-600' 
                    : 'border-red-600'
                  }
                `}
                title={item.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
                aria-label={item.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
              >
                <div 
                  className={`
                    w-2 h-2 rounded-full
                    ${item.isVegetarian ? 'bg-green-600' : 'bg-red-600'}
                  `}
                />
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {formatPrice(item.price)}
            </div>
            {item.prepTime && (
              <div className="text-xs text-gray-500">
                {item.prepTime} min
              </div>
            )}
          </div>
        </div>

        {/* Item Description */}
        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Item Details */}
        <div className="flex items-center justify-between mb-4">
          {/* Spice Level */}
          {item.spiceLevel && getSpiceIndicator(item.spiceLevel)}
          
          {/* Dietary Info */}
          {item.dietaryInfo && item.dietaryInfo.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.dietaryInfo.slice(0, 2).map((info, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {info}
                </span>
              ))}
              {item.dietaryInfo.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{item.dietaryInfo.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!item.isAvailable}
          className={`
            w-full py-2 px-4 rounded-lg font-medium text-sm
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            ${item.isAvailable
              ? 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
          aria-label={`Add ${item.name} to cart for ${formatPrice(item.price)}`}
        >
          {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </article>
  )
}
