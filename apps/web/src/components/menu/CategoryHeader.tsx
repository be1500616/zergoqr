/**
 * CategoryHeader component displays the header for each menu category.
 * 
 * Supports optional category images and provides a consistent visual
 * hierarchy for menu organization.
 * 
 * @example
 * ```tsx
 * <CategoryHeader 
 *   category={categoryData}
 *   showImage={true}
 *   className="mb-6"
 * />
 * ```
 */

import Image from 'next/image'
import type { CategoryHeaderProps } from '@/lib/types/menu'

export function CategoryHeader({
  category,
  showImage = true,
  className = ''
}: CategoryHeaderProps) {
  const hasImage = showImage && category.imageUrl

  return (
    <header 
      className={`category-header ${className}`}
      role="banner"
      aria-labelledby={`category-${category.id}-heading`}
    >
      {hasImage && (
        <div className="category-image-container relative w-full h-48 md:h-64 mb-4 rounded-lg overflow-hidden">
          <Image
            src={category.imageUrl!}
            alt={`${category.name} category`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={category.sortOrder === 0 ? true : undefined} // Prioritize first category image
          />
          
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          
          {/* Category title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
            <h2 
              id={`category-${category.id}-heading`}
              className="text-2xl md:text-3xl font-bold text-white mb-2"
            >
              {category.name}
            </h2>
            {category.description && (
              <p className="text-white/90 text-sm md:text-base">
                {category.description}
              </p>
            )}
          </div>
        </div>
      )}

      {!hasImage && (
        <div className="category-text-header">
          <h2 
            id={`category-${category.id}-heading`}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          >
            {category.name}
          </h2>
          {category.description && (
            <p className="text-gray-600 text-sm md:text-base mb-4">
              {category.description}
            </p>
          )}
          
          {/* Decorative line */}
          <div className="w-16 h-1 bg-orange-500 rounded-full mb-6" />
        </div>
      )}
    </header>
  )
}
