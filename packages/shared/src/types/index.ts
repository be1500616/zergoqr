// Common types for the application
export interface BaseEntity {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
