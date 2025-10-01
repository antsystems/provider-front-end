import { NextRequest, NextResponse } from 'next/server';
import { DoctorsResponse } from '@/types/doctors';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

interface ErrorResponse {
  error: string;
  message: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<DoctorsResponse | ErrorResponse>> {
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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const specialty_name = searchParams.get('specialty_name');
    const department_name = searchParams.get('department_name');
    const status = searchParams.get('status');

    // Build query string for external API
    const queryParams = new URLSearchParams();
    if (specialty_name) queryParams.set('specialty_name', specialty_name);
    if (department_name) queryParams.set('department_name', department_name);
    if (status) queryParams.set('status', status);

    const queryString = queryParams.toString();
    const apiUrl = `https://provider-4.onrender.com/api/doctors${queryString ? '?' + queryString : ''}`;

    // Make request to external API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch doctors' }));
      return NextResponse.json(
        {
          error: 'DOCTORS_FETCH_FAILED',
          message: errorData.message || 'Failed to fetch doctors'
        },
        { status: response.status, headers: corsHeaders }
      );
    }

    const data: DoctorsResponse = await response.json();

    return NextResponse.json(data, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Doctors API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}