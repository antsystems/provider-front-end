/**
 * Centralized Error Handling Utilities
 *
 * This module provides standardized error types and handling utilities
 * for the entire application.
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  SERVER = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly statusCode?: number
  public readonly isOperational: boolean
  public readonly timestamp: Date
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    this.type = type
    this.severity = severity
    this.statusCode = statusCode
    this.isOperational = true
    this.timestamp = new Date()
    this.context = context

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
    }
  }
}

/**
 * Network Error - Connection issues, timeouts, etc.
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred', context?: Record<string, any>) {
    super(message, ErrorType.NETWORK, ErrorSeverity.HIGH, undefined, context)
  }
}

/**
 * Authentication Error - Login failures, token issues
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, ErrorType.AUTHENTICATION, ErrorSeverity.HIGH, 401, context)
  }
}

/**
 * Authorization Error - Permission denied
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(message, ErrorType.AUTHORIZATION, ErrorSeverity.MEDIUM, 403, context)
  }
}

/**
 * Validation Error - Invalid input data
 */
export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>

  constructor(
    message: string = 'Validation failed',
    errors: Array<{ field: string; message: string }> = [],
    context?: Record<string, any>
  ) {
    super(message, ErrorType.VALIDATION, ErrorSeverity.LOW, 400, context)
    this.errors = errors
  }
}

/**
 * Not Found Error - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', context?: Record<string, any>) {
    super(`${resource} not found`, ErrorType.NOT_FOUND, ErrorSeverity.LOW, 404, context)
  }
}

/**
 * Server Error - Internal server errors
 */
export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', context?: Record<string, any>) {
    super(message, ErrorType.SERVER, ErrorSeverity.CRITICAL, 500, context)
  }
}

/**
 * Timeout Error - Request timeout
 */
export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout', context?: Record<string, any>) {
    super(message, ErrorType.TIMEOUT, ErrorSeverity.MEDIUM, 408, context)
  }
}

// ============================================================================
// ERROR PARSING AND TRANSFORMATION
// ============================================================================

/**
 * Parse HTTP Response Error
 */
export function parseHttpError(response: Response, responseData?: any): AppError {
  const status = response.status
  const url = response.url
  const method = response.type || 'unknown'

  const context = {
    url,
    method,
    status,
    responseData,
  }

  // Authentication errors
  if (status === 401) {
    return new AuthenticationError(
      responseData?.error || responseData?.message || 'Authentication required',
      context
    )
  }

  // Authorization errors
  if (status === 403) {
    return new AuthorizationError(
      responseData?.error || responseData?.message || 'Access denied',
      context
    )
  }

  // Not found errors
  if (status === 404) {
    return new NotFoundError(
      responseData?.resource || 'Resource',
      context
    )
  }

  // Validation errors
  if (status === 400 || status === 422) {
    return new ValidationError(
      responseData?.error || responseData?.message || 'Validation failed',
      responseData?.errors || [],
      context
    )
  }

  // Timeout errors
  if (status === 408 || status === 504) {
    return new TimeoutError(
      responseData?.error || responseData?.message || 'Request timeout',
      context
    )
  }

  // Server errors
  if (status >= 500) {
    return new ServerError(
      responseData?.error || responseData?.message || 'Internal server error',
      context
    )
  }

  // Generic error for other status codes
  return new AppError(
    responseData?.error || responseData?.message || `HTTP Error ${status}`,
    ErrorType.UNKNOWN,
    ErrorSeverity.MEDIUM,
    status,
    context
  )
}

/**
 * Parse Network/Fetch Error
 */
export function parseNetworkError(error: Error): AppError {
  if (error.name === 'AbortError' || error.message.includes('aborted')) {
    return new AppError('Request was cancelled', ErrorType.NETWORK, ErrorSeverity.LOW)
  }

  if (error.message.includes('timeout') || error.name === 'TimeoutError') {
    return new TimeoutError('Request timeout - please try again')
  }

  if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
    return new NetworkError('Unable to connect to server. Please check your internet connection.')
  }

  return new NetworkError(error.message || 'Network error occurred')
}

/**
 * Parse Unknown Error
 */
export function parseError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error
  }

  // Standard Error
  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorType.UNKNOWN,
      ErrorSeverity.MEDIUM,
      undefined,
      { originalError: error.name }
    )
  }

  // String error
  if (typeof error === 'string') {
    return new AppError(error, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM)
  }

  // Object with message
  if (error && typeof error === 'object' && 'message' in error) {
    return new AppError(
      String((error as any).message),
      ErrorType.UNKNOWN,
      ErrorSeverity.MEDIUM
    )
  }

  // Unknown error
  return new AppError('An unknown error occurred', ErrorType.UNKNOWN, ErrorSeverity.MEDIUM)
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Connection problem. Please check your internet and try again.'

    case ErrorType.AUTHENTICATION:
      return 'Your session has expired. Please log in again.'

    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.'

    case ErrorType.VALIDATION:
      return error.message || 'Please check your input and try again.'

    case ErrorType.NOT_FOUND:
      return error.message || 'The requested item was not found.'

    case ErrorType.TIMEOUT:
      return 'The request took too long. Please try again.'

    case ErrorType.SERVER:
      return 'Something went wrong on our end. Please try again later.'

    default:
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Determine if error should trigger logout
 */
export function shouldLogout(error: AppError): boolean {
  return error.type === ErrorType.AUTHENTICATION && error.statusCode === 401
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return (
    error.type === ErrorType.NETWORK ||
    error.type === ErrorType.TIMEOUT ||
    (error.type === ErrorType.SERVER && error.statusCode !== 500)
  )
}

/**
 * Log error (can be extended to send to error tracking service)
 */
export function logError(error: AppError, additionalContext?: Record<string, any>) {
  const errorLog = {
    ...error.toJSON(),
    additionalContext,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  }

  // Development: Log to console
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ${error.severity.toUpperCase()} ERROR: ${error.type}`)
    console.error('Message:', error.message)
    console.error('Details:', errorLog)
    console.error('Stack:', error.stack)
    console.groupEnd()
  }

  // Production: Send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production' && error.severity !== ErrorSeverity.LOW) {
    // TODO: Integrate with Sentry or similar service
    // Sentry.captureException(error, { extra: errorLog })
  }

  return errorLog
}
