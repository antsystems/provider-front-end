/**
 * API Error Handler
 *
 * Centralized error handling for all API calls with retry logic,
 * error parsing, and user feedback.
 */

import { toast } from 'sonner'
import {
  AppError,
  parseHttpError,
  parseNetworkError,
  parseError,
  getUserFriendlyMessage,
  shouldLogout,
  isRetryableError,
  logError,
} from './errors'

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

interface RetryConfig {
  maxRetries: number
  retryDelay: number // milliseconds
  retryableStatusCodes: number[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}

// ============================================================================
// API CALL WRAPPER
// ============================================================================

interface ApiCallOptions {
  showToast?: boolean
  retryConfig?: Partial<RetryConfig>
  onError?: (error: AppError) => void
  context?: Record<string, any>
}

/**
 * Wrapper for API calls with error handling and retry logic
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  options: ApiCallOptions = {}
): Promise<T> {
  const {
    showToast = true,
    retryConfig = {},
    onError,
    context = {},
  } = options

  const config: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...retryConfig,
  }

  let lastError: AppError | null = null
  let attempt = 0

  while (attempt <= config.maxRetries) {
    try {
      const result = await apiCall()
      return result
    } catch (error) {
      attempt++
      lastError = parseError(error)

      // Log the error
      logError(lastError, { ...context, attempt })

      // If it's the last attempt or error is not retryable, handle and throw
      if (attempt > config.maxRetries || !isRetryableError(lastError)) {
        handleError(lastError, showToast)

        // Call custom error handler if provided
        if (onError) {
          onError(lastError)
        }

        throw lastError
      }

      // Wait before retrying (exponential backoff)
      await delay(config.retryDelay * attempt)
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError
}

/**
 * Wrapper for fetch API calls with enhanced error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {},
  apiCallOptions: ApiCallOptions = {}
): Promise<T> {
  return handleApiCall(async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Try to parse response body
      let responseData: any
      const contentType = response.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        try {
          responseData = await response.json()
        } catch {
          responseData = null
        }
      } else {
        try {
          responseData = await response.text()
        } catch {
          responseData = null
        }
      }

      // Check if response is ok
      if (!response.ok) {
        throw parseHttpError(response, responseData)
      }

      return responseData as T
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw parseNetworkError(error)
      }

      // Re-throw if already parsed
      if (error instanceof AppError) {
        throw error
      }

      // Parse network errors
      throw parseNetworkError(error as Error)
    }
  }, apiCallOptions)
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle error with user feedback
 */
function handleError(error: AppError, showToast: boolean) {
  const userMessage = getUserFriendlyMessage(error)

  // Show toast notification
  if (showToast) {
    if (error.severity === 'critical' || error.severity === 'high') {
      toast.error(userMessage, {
        description: error.message !== userMessage ? error.message : undefined,
        duration: 5000,
      })
    } else {
      toast.warning(userMessage, {
        duration: 3000,
      })
    }
  }

  // Handle authentication errors (logout)
  if (shouldLogout(error)) {
    handleAuthenticationError()
  }
}

/**
 * Handle authentication errors
 */
function handleAuthenticationError() {
  // Clear auth data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpiry')

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/login'
    }, 1500)
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Delay utility for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create auth headers helper
 */
export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { type ApiCallOptions, type RetryConfig }
