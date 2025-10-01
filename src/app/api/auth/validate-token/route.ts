import { NextRequest, NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

interface TokenValidationResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    roles: string[];
    status: string;
    entity_assignments: {
      hospitals: Array<{
        id: string;
        name: string;
      }>;
    };
  };
  message?: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<TokenValidationResponse | ErrorResponse>> {
  try {
    // Extract authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authorization token required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Make request to external API
    const response = await fetch('https://provider-4.onrender.com/api/auth/validate-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          {
            valid: false,
            message: 'Token is invalid or expired'
          },
          { status: 200, headers: corsHeaders }
        );
      }

      const errorData = await response.json().catch(() => ({ message: 'Token validation failed' }));
      return NextResponse.json(
        {
          error: 'VALIDATION_FAILED',
          message: errorData.message || 'Token validation failed'
        },
        { status: response.status, headers: corsHeaders }
      );
    }

    const data: TokenValidationResponse = await response.json();

    return NextResponse.json(data, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Token validation API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}