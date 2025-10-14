import type {
  Claim,
  ClaimFormData,
  ClaimResponse,
  ClaimsListResponse,
  ClaimDetailsResponse,
  ClaimStatisticsResponse,
  ClaimsListParams
} from '@/types/claims'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const claimsApi = {
  /**
   * Submit a new IP claim
   */
  async submitClaim(formData: ClaimFormData): Promise<ClaimResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/claims/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim')
      }

      return data
    } catch (error) {
      console.error('Error submitting claim:', error)
      throw error
    }
  },

  /**
   * Get list of all claims with optional filters
   */
  async getClaimsList(params?: {
    hospital_id?: string
    status?: string
    claim_type?: string
    limit?: number
  }): Promise<ClaimsListResponse> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.hospital_id) queryParams.append('hospital_id', params.hospital_id)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.claim_type) queryParams.append('claim_type', params.claim_type)
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const url = `${API_BASE_URL}/api/v1/claims/${queryParams.toString() ? `?${queryParams}` : ''}`
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch claims')
      }

      return data
    } catch (error) {
      console.error('Error fetching claims:', error)
      throw error
    }
  },

  /**
   * Get claim details by ID
   */
  async getClaimDetails(claimId: string): Promise<ClaimDetailsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/claims/${claimId}`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch claim details')
      }

      return data
    } catch (error) {
      console.error('Error fetching claim details:', error)
      throw error
    }
  },

  /**
   * Update an existing claim
   */
  async updateClaim(claimId: string, updates: Partial<Claim>): Promise<ClaimResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/claims/${claimId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update claim')
      }

      return data
    } catch (error) {
      console.error('Error updating claim:', error)
      throw error
    }
  },

  /**
   * Update claim status
   */
  async updateClaimStatus(
    claimId: string,
    status: string,
    remarks?: string
  ): Promise<ClaimResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, remarks }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update claim status')
      }

      return data
    } catch (error) {
      console.error('Error updating claim status:', error)
      throw error
    }
  },

  /**
   * Delete a claim
   */
  async deleteClaim(claimId: string): Promise<ClaimResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/claims/${claimId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete claim')
      }

      return data
    } catch (error) {
      console.error('Error deleting claim:', error)
      throw error
    }
  },

  /**
   * Get claims statistics
   */
  async getClaimsStatistics(hospitalId?: string): Promise<ClaimStatisticsResponse> {
    try {
      const url = hospitalId 
        ? `${API_BASE_URL}/api/v1/claims/statistics?hospital_id=${hospitalId}`
        : `${API_BASE_URL}/api/v1/claims/statistics`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch statistics')
      }

      return data
    } catch (error) {
      console.error('Error fetching statistics:', error)
      throw error
    }
  },

  // Get inbox claims list (dedicated inbox endpoint)
  async getInboxClaims(params: ClaimsListParams = {}): Promise<ClaimsListResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.hospital_id) queryParams.append('hospital_id', params.hospital_id)
    if (params.status) queryParams.append('status', params.status)
    if (params.claim_type) queryParams.append('claim_type', params.claim_type)
    if (params.search) queryParams.append('search', params.search)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())
    
    const url = `${API_BASE_URL}/api/v1/inbox/claims${queryParams.toString() ? `?${queryParams}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(getAuthHeaders())
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch inbox claims: ${response.statusText}`)
    }

    return response.json()
  },

  // Get inbox statistics
  async getInboxStats(hospitalId?: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (hospitalId) queryParams.append('hospital_id', hospitalId)
    
    const url = `${API_BASE_URL}/api/v1/inbox/stats${queryParams.toString() ? `?${queryParams}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(getAuthHeaders())
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch inbox stats: ${response.statusText}`)
    }

    return response.json()
  },

}
