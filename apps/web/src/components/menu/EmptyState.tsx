/**
 * EmptyState component displays a user-friendly message when categories have no items.
 * 
 * Provides clear feedback to users when menu categories are empty or when
 * no menu data is available.
 * 
 * @example
 * ```tsx
 * <EmptyState 
 *   categoryName="Appetizers"
 *   message="No appetizers are currently available"
 *   className="py-8"
 * />
 * ```
 */

interface EmptyStateProps {
  /** Category name for the empty state */
  categoryName: string
  /** Custom message to display */
  message?: string
  /** Additional CSS classes */
  className?: string
}

export function EmptyState({
  categoryName,
  message,
  className = ''
}: EmptyStateProps) {
  const defaultMessage = `No items are currently available in ${categoryName}. Please check other categories or try again later.`
  const displayMessage = message || defaultMessage

  return (
    <div 
      className={`empty-state text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Empty state icon */}
      <div className="mx-auto w-24 h-24 mb-6 flex items-center justify-center">
        <svg
          className="w-16 h-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Empty state content */}
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Items Available
        </h3>
        
        <p className="text-gray-600 text-sm mb-6">
          {displayMessage}
        </p>

        {/* Helpful suggestions */}
        <div className="space-y-2 text-sm text-gray-500">
          <p>You can:</p>
          <ul className="list-disc list-inside space-y-1 text-left">
            <li>Browse other menu categories</li>
            <li>Check back later for new items</li>
            <li>Contact the restaurant for special requests</li>
          </ul>
        </div>
      </div>

      {/* Decorative element */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}
