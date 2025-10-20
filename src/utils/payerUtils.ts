import { payerAffiliationsApi } from '@/services/payerAffiliationsApi'
import { toast } from 'sonner'

/**
 * Utility functions for payer management and troubleshooting
 */

/**
 * Find a payer by ID and check if it's affiliated
 */
export async function findPayerById(payerId: string) {
  try {
    // Get all available payers
    const response = await payerAffiliationsApi.getAvailablePayers()
    const payer = response.available_payers.find(p => p.id === payerId || p.auto_id === payerId)
    
    if (!payer) {
      throw new Error(`Payer with ID ${payerId} not found in available payers`)
    }

    // Check if it's affiliated
    const isAffiliated = response.affiliated_payers.includes(payer.name)
    
    return {
      payer,
      isAffiliated,
      needsAffiliation: !isAffiliated
    }
  } catch (error) {
    console.error('Error finding payer:', error)
    throw error
  }
}

/**
 * Affiliate a payer by ID
 */
export async function affiliatePayerById(payerId: string) {
  try {
    const { payer, isAffiliated } = await findPayerById(payerId)
    
    if (isAffiliated) {
      toast.info(`Payer "${payer.name}" is already affiliated`)
      return { success: true, message: 'Already affiliated' }
    }

    // Create affiliation
    const response = await payerAffiliationsApi.createPayerAffiliation({
      payer_name: payer.name
    })

    toast.success(`Successfully affiliated payer "${payer.name}"`)
    return { success: true, response }
  } catch (error) {
    console.error('Error affiliating payer:', error)
    toast.error(`Failed to affiliate payer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    throw error
  }
}

/**
 * Debug payer affiliation status
 */
export async function debugPayerAffiliation(payerId: string) {
  try {
    const { payer, isAffiliated } = await findPayerById(payerId)
    
    console.log('Payer Debug Info:', {
      id: payerId,
      payer: {
        id: payer.id,
        auto_id: payer.auto_id,
        name: payer.name,
        type: payer.type,
        code: payer.code,
        status: payer.status
      },
      isAffiliated,
      needsAffiliation: !isAffiliated
    })

    return {
      payer,
      isAffiliated,
      needsAffiliation: !isAffiliated,
      debugInfo: {
        id: payerId,
        payerName: payer.name,
        payerType: payer.type,
        payerCode: payer.code,
        isAffiliated,
        needsAffiliation: !isAffiliated
      }
    }
  } catch (error) {
    console.error('Error debugging payer affiliation:', error)
    throw error
  }
}

/**
 * Get all unaffiliated payers
 */
export async function getUnaffiliatedPayers() {
  try {
    const response = await payerAffiliationsApi.getAvailablePayers()
    const unaffiliatedPayers = response.available_payers.filter(
      payer => !response.affiliated_payers.includes(payer.name) && payer.status === 'active'
    )
    
    return unaffiliatedPayers
  } catch (error) {
    console.error('Error getting unaffiliated payers:', error)
    throw error
  }
}
