export interface PatientDetails {
  patient_name: string
  age: number
  age_unit: 'DAYS' | 'MONTHS' | 'YRS'
  gender: 'MALE' | 'FEMALE' | 'OTHER/NA' | 'Not Available'
  id_card_type: string
  id_card_number?: string
  patient_contact_number?: string
  patient_email_id?: string
  beneficiary_type: 'SELF' | 'DEPENDANT' | 'SELF (Individual Policy)' | 'Not Available'
  relationship: string
}

export interface PayerDetails {
  payer_patient_id: string
  authorization_number: string
  total_authorized_amount: number
  payer_type: 'CENTRAL GOVERNMENT' | 'INSURANCE COMPANY' | 'CORPORATE' | 'TPA' | 'STATE GOVERNMENT' | 'INTERNATIONAL'
  payer_name: string
  insurer_name: string
  policy_number?: string
  sponsorer_corporate_name: string
  sponsorer_employee_id?: string
  sponsorer_employee_name?: string
}

export interface ProviderDetails {
  patient_registration_number: string
  specialty: string
  doctor: string
  treatment_line: 'MEDICAL' | 'SURGICAL'
  claim_type: 'INPATIENT' | 'DIALYSIS'
  service_start_date: string
  service_end_date: string
  inpatient_number: string
  admission_type: 'PLANNED' | 'EMERGENCY' | 'CASHLESS' | 'REIMBURSEMENT'
  hospitalization_type: 'DAYCARE' | 'NON DAYCARE'
  ward_type: string
  final_diagnosis: string
  icd_10_code?: string
  treatment_done: string
  pcs_code?: string
}

export interface BillDetails {
  bill_number: string
  bill_date: string
  security_deposit?: number
  total_bill_amount: number
  patient_discount_amount?: number
  amount_paid_by_patient?: number
  total_patient_paid_amount?: number
  amount_charged_to_payer?: number
  mou_discount_amount?: number
  claimed_amount: number
  submission_remarks?: string
}

export interface Claim {
  claim_id: string
  claim_status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'settled' | 'pending'
  submission_date?: string
  created_at?: string
  updated_at?: string
  patient_details: PatientDetails
  payer_details: PayerDetails
  provider_details: ProviderDetails
  bill_details: BillDetails
  hospital_id: string
  submitted_by?: string
  submitted_by_email?: string
  
  // Module visibility flags
  show_in_claims: boolean
  show_in_preauth: boolean
  show_in_reimb: boolean
  
  // Source module tracking
  created_in_module?: 'claims' | 'preauth' | 'reimb'
}

export interface ClaimFormData {
  // Patient Details
  patient_name: string
  age: string
  age_unit: 'DAYS' | 'MONTHS' | 'YRS'
  gender: string
  id_card_type: string
  id_card_number: string
  patient_contact_number: string
  patient_email_id: string
  beneficiary_type: string
  relationship: string

  // Payer Details
  payer_patient_id: string
  authorization_number: string
  total_authorized_amount: string
  payer_type: string
  payer_name: string
  insurer_name: string
  policy_number: string
  sponsorer_corporate_name: string
  sponsorer_employee_id: string
  sponsorer_employee_name: string

  // Provider Details
  patient_registration_number: string
  specialty: string
  doctor: string
  treatment_line: string
  claim_type: string
  service_start_date: string
  service_end_date: string
  inpatient_number: string
  admission_type: string
  hospitalization_type: string
  ward_type: string
  final_diagnosis: string
  icd_10_code: string
  treatment_done: string
  pcs_code: string

  // Bill Details
  bill_number: string
  bill_date: string
  security_deposit: string
  total_bill_amount: string
  patient_discount_amount: string
  amount_paid_by_patient: string
  total_patient_paid_amount: string
  amount_charged_to_payer: string
  mou_discount_amount: string
  claimed_amount: string
  submission_remarks: string
}

export interface ClaimListItem {
  claim_id: string
  claim_status: string
  patient_name: string
  claim_type: string
  claimed_amount: number
  submission_date: string
  hospital_id: string
}

export interface ClaimStatistics {
  total_claims: number
  total_claimed_amount: number
  claims_by_status: Record<string, number>
  claims_by_type: Record<string, number>
}

export interface ClaimResponse {
  success: boolean
  message?: string
  claim_id?: string
  claim_status?: string
  submission_date?: string
  error?: string
}

export interface ClaimsListResponse {
  success: boolean
  total_claims: number
  claims: ClaimListItem[]
}

export interface ClaimDetailsResponse {
  success: boolean
  claim: Claim
}

export interface ClaimStatisticsResponse {
  success: boolean
  statistics: ClaimStatistics
}

export interface ClaimsListParams {
  hospital_id?: string
  status?: string
  claim_type?: string
  search?: string
  limit?: number
  offset?: number
}
