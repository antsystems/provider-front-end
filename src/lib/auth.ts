import { NextRequest } from 'next/server'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: string
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)

    if (!token) {
      return null
    }

    // In a real implementation, you would validate the token against your auth service
    // For this example, we'll use a simple mock validation
    if (token === 'valid-token') {
      return {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }
    }

    return null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export function createUnauthorizedResponse() {
  return Response.json(
    {
      success: false,
      error: 'Unauthorized. Please provide a valid Bearer token.'
    },
    { status: 401 }
  )
}