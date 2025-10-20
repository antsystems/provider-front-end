# Error Handling Guide

This guide explains how to use the centralized error handling system in the application.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Error Types](#error-types)
3. [Usage in API Services](#usage-in-api-services)
4. [Usage in Components](#usage-in-components)
5. [Error Boundaries](#error-boundaries)
6. [Best Practices](#best-practices)

---

## Overview

The application uses a centralized error handling system with:

- **Custom error classes** for different error types
- **API error handler** with automatic retry logic
- **Error boundaries** for React component errors
- **User-friendly error messages** and toast notifications
- **Automatic logging** (development console + production error tracking)

**Key Files:**
- `/src/lib/errors.ts` - Error types and utilities
- `/src/lib/api-error-handler.ts` - API call wrapper with retry logic
- `/src/components/error-boundary.tsx` - React error boundary components

---

## Error Types

### Available Error Classes

```typescript
import {
  AppError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ServerError,
  TimeoutError
} from '@/lib/errors'
```

### Error Properties

All errors extend `AppError` with:
- `type` - Error type enum
- `severity` - LOW, MEDIUM, HIGH, CRITICAL
- `statusCode` - HTTP status code (if applicable)
- `message` - Error message
- `timestamp` - When error occurred
- `context` - Additional error context

---

## Usage in API Services

### Method 1: Using `fetchWithErrorHandling` (Recommended)

**Example: Update staffApi.ts**

```typescript
import { fetchWithErrorHandling, getAuthHeaders } from '@/lib/api-error-handler'

class StaffApiService {
  private baseUrl = 'https://provider-4.onrender.com/api'

  async getStaff(filters: StaffApiFilters = {}): Promise<StaffResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', filters.page.toString())
    if (filters.limit) params.set('limit', filters.limit.toString())

    const url = `${this.baseUrl}/staff${params.toString() ? '?' + params.toString() : ''}`

    return fetchWithErrorHandling<StaffResponse>(
      url,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      },
      {
        showToast: true,  // Show error toast to user
        retryConfig: {
          maxRetries: 2,  // Retry twice on failure
        },
        context: {
          operation: 'getStaff',
          filters,
        },
      }
    )
  }

  async createStaff(staffData: CreateStaffRequest): Promise<SingleStaffResponse> {
    return fetchWithErrorHandling<SingleStaffResponse>(
      `${this.baseUrl}/staff`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(staffData),
      },
      {
        showToast: true,
        context: { operation: 'createStaff' },
      }
    )
  }
}
```

**Benefits:**
- ✅ Automatic error parsing and typing
- ✅ Built-in retry logic for network errors
- ✅ Auto logout on 401 errors
- ✅ User-friendly toast notifications
- ✅ Error logging to console/tracking service
- ✅ Timeout handling (30s default)

### Method 2: Using `handleApiCall` Wrapper

For more complex API calls or when using axios:

```typescript
import { handleApiCall } from '@/lib/api-error-handler'
import axios from 'axios'

async getBulkData(): Promise<BulkDataResponse> {
  return handleApiCall(
    async () => {
      const response = await axios.get(`${this.baseUrl}/bulk-data`)
      return response.data
    },
    {
      showToast: true,
      retryConfig: { maxRetries: 3 },
      onError: (error) => {
        // Custom error handling
        console.log('Custom handler:', error)
      },
    }
  )
}
```

### Method 3: Manual Error Handling

When you need full control:

```typescript
import { parseError, logError, getUserFriendlyMessage } from '@/lib/errors'
import { toast } from 'sonner'

async customApiCall(): Promise<Data> {
  try {
    const response = await fetch(url, options)
    // ... handle response
    return data
  } catch (error) {
    const appError = parseError(error)
    logError(appError, { context: 'customApiCall' })

    const userMessage = getUserFriendlyMessage(appError)
    toast.error(userMessage)

    throw appError
  }
}
```

---

## Usage in Components

### Handling API Errors in Forms

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { AppError } from '@/lib/errors'

export function CreateStaffForm() {
  const [loading, setLoading] = useState(false)
  const form = useForm()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await staffApi.createStaff(data)
      toast.success('Staff member created successfully')
      // Reset form, close dialog, etc.
    } catch (error) {
      // Error already logged and shown to user via toast
      // Optional: add form-specific error handling
      if (error instanceof AppError && error.type === 'VALIDATION_ERROR') {
        // Handle validation errors
        const validationError = error as ValidationError
        validationError.errors.forEach(({ field, message }) => {
          form.setError(field, { message })
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  )
}
```

### Silent Error Handling (No Toast)

```typescript
async loadData() {
  try {
    const data = await fetchWithErrorHandling(
      url,
      options,
      { showToast: false }  // Don't show toast
    )
    return data
  } catch (error) {
    // Handle error silently or with custom UI
    setErrorMessage(error.message)
  }
}
```

---

## Error Boundaries

### Full-Page Error Boundary

Wrap your entire app or major sections:

```typescript
// src/app/layout.tsx
import { ErrorBoundary } from '@/components/error-boundary'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

### Component-Level Error Boundary

For specific components that might fail:

```typescript
import { CompactErrorBoundary } from '@/components/error-boundary'

export function Dashboard() {
  return (
    <div>
      <CompactErrorBoundary>
        <StaffTable />
      </CompactErrorBoundary>

      <CompactErrorBoundary>
        <DepartmentsList />
      </CompactErrorBoundary>
    </div>
  )
}
```

### Custom Error Boundary Fallback

```typescript
<ErrorBoundary
  fallback={
    <div className="p-4 text-center">
      <p>Could not load staff data</p>
      <Button onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  }
  onError={(error, errorInfo) => {
    // Custom error handling
    console.log('Component error:', error)
  }}
>
  <StaffDataTable />
</ErrorBoundary>
```

---

## Best Practices

### ✅ DO

1. **Use `fetchWithErrorHandling` for all API calls**
   ```typescript
   return fetchWithErrorHandling(url, options)
   ```

2. **Add context to errors**
   ```typescript
   fetchWithErrorHandling(url, options, {
     context: { userId, operation: 'updateProfile' }
   })
   ```

3. **Wrap components with error boundaries**
   ```typescript
   <ErrorBoundary>
     <YourComponent />
   </ErrorBoundary>
   ```

4. **Use specific error types**
   ```typescript
   throw new ValidationError('Invalid email', [
     { field: 'email', message: 'Must be valid email' }
   ])
   ```

5. **Let errors propagate** - Don't catch and swallow errors unnecessarily

### ❌ DON'T

1. **Don't use console.error in production**
   ```typescript
   // ❌ Bad
   console.error('Failed to load data:', error)

   // ✅ Good
   logError(appError, context)
   ```

2. **Don't show technical errors to users**
   ```typescript
   // ❌ Bad
   toast.error(`HTTP 500: Internal Server Error at /api/v1/users`)

   // ✅ Good
   const userMessage = getUserFriendlyMessage(error)
   toast.error(userMessage)
   ```

3. **Don't retry on non-retryable errors**
   ```typescript
   // ❌ Bad - retrying on 400 validation error

   // ✅ Good - system automatically identifies retryable errors
   ```

4. **Don't create bare try-catch blocks**
   ```typescript
   // ❌ Bad
   try {
     await apiCall()
   } catch (error) {
     // Silent failure
   }

   // ✅ Good
   return handleApiCall(() => apiCall(), options)
   ```

---

## Migration Checklist

To update existing services to use the new error handling:

- [ ] Import `fetchWithErrorHandling` and `getAuthHeaders`
- [ ] Replace fetch calls with `fetchWithErrorHandling`
- [ ] Remove manual try-catch blocks (they're handled automatically)
- [ ] Remove console.error statements
- [ ] Add error boundaries to component trees
- [ ] Test error scenarios (network offline, 401, 500, etc.)

---

## Example: Complete Migration

**Before:**
```typescript
async getStaff(): Promise<StaffResponse> {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${this.baseUrl}/staff`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch staff:', error)
    throw error
  }
}
```

**After:**
```typescript
import { fetchWithErrorHandling, getAuthHeaders } from '@/lib/api-error-handler'

async getStaff(): Promise<StaffResponse> {
  return fetchWithErrorHandling<StaffResponse>(
    `${this.baseUrl}/staff`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    },
    {
      showToast: true,
      context: { operation: 'getStaff' },
    }
  )
}
```

**Benefits:**
- 80% less code
- Automatic retry on network errors
- Better error messages
- Consistent error handling
- Automatic logging
- Type-safe errors

---

## Testing Error Scenarios

```typescript
// Test network error
navigator.onLine = false
await staffApi.getStaff() // Will show "Connection problem" message

// Test 401 error
// Server returns 401 → Auto logout + redirect to /login

// Test 500 error with retry
// Server returns 500 → Auto retry 3 times → Show error message

// Test validation error
// Server returns 400 with field errors → Show specific field errors
```

---

## Need Help?

- Check `/src/lib/errors.ts` for all error types
- Check `/src/lib/api-error-handler.ts` for API utilities
- Check `/src/components/error-boundary.tsx` for React error boundaries
