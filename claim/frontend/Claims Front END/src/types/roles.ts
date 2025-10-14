/**
 * Role-based access control for Claims Module
 */

export type UserRole = 
  | 'hospital_user'
  | 'claim_processor'
  | 'reconciler'
  | 'admin'
  | 'super_admin'
  | 'system_admin'

export const ALLOWED_CLAIMS_ROLES: UserRole[] = [
  'hospital_user',
  'claim_processor',
  'reconciler'
]

export const BLOCKED_ROLES: string[] = [
  'admin',
  'super_admin',
  'system_admin',
  'hospital_admin',
  'rm',
  'rp',
  'employee'
]

export interface RolePermissions {
  can_submit_claim: boolean
  can_view_claims: boolean
  can_edit_claim: boolean
  can_delete_claim: boolean
  can_approve_claim: boolean
  can_reject_claim: boolean
  can_reconcile_claim: boolean
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  hospital_user: {
    can_submit_claim: true,
    can_view_claims: true,
    can_edit_claim: true,
    can_delete_claim: false,
    can_approve_claim: false,
    can_reject_claim: false,
    can_reconcile_claim: false
  },
  claim_processor: {
    can_submit_claim: true,
    can_view_claims: true,
    can_edit_claim: true,
    can_delete_claim: false,
    can_approve_claim: true,
    can_reject_claim: true,
    can_reconcile_claim: false
  },
  reconciler: {
    can_submit_claim: false,
    can_view_claims: true,
    can_edit_claim: true,
    can_delete_claim: false,
    can_approve_claim: false,
    can_reject_claim: false,
    can_reconcile_claim: true
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  hospital_user: 'Hospital User',
  claim_processor: 'Claim Processor',
  reconciler: 'Reconciler',
  admin: 'Administrator',
  super_admin: 'Super Administrator',
  system_admin: 'System Administrator'
}

export function isRoleAllowedForClaims(role: string): boolean {
  const roleLower = role.toLowerCase() as UserRole
  
  // Explicitly block admin roles
  if (BLOCKED_ROLES.includes(roleLower)) {
    return false
  }
  
  // Check if role is in allowed list
  return ALLOWED_CLAIMS_ROLES.includes(roleLower)
}

export function getUserPermissions(role: string): RolePermissions {
  return ROLE_PERMISSIONS[role.toLowerCase()] || {
    can_submit_claim: false,
    can_view_claims: false,
    can_edit_claim: false,
    can_delete_claim: false,
    can_approve_claim: false,
    can_reject_claim: false,
    can_reconcile_claim: false
  }
}

export function canUserPerformAction(role: string, action: keyof RolePermissions): boolean {
  const permissions = getUserPermissions(role)
  return permissions[action]
}
