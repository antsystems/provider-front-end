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

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  access_token: string;
  user: {
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
}

interface ErrorResponse {
  error: string;
  message: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse | ErrorResponse>> {
  try {
    const body: LoginRequest = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Email and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Make request to external API
    const response = await fetch('https://provider-3.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      return NextResponse.json(
        {
          error: 'AUTHENTICATION_FAILED',
          message: errorData.message || 'Invalid credentials'
        },
        { status: response.status, headers: corsHeaders }
      );
    }

    const data: LoginResponse = await response.json();

    return NextResponse.json(data, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}