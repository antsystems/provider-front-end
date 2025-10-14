'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { claimsApi } from '@/services/claimsApi'
import { User, CreditCard, Hospital, DollarSign, Calendar, FileText } from 'lucide-react'

interface ClaimDetailsDialogProps {
  claimId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClaimDetailsDialog({ claimId, open, onOpenChange }: ClaimDetailsDialogProps) {
  const [claim, setClaim] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (claimId && open) {
      fetchClaimDetails()
    }
  }, [claimId, open])

  const fetchClaimDetails = async () => {
    if (!claimId) return
    
    try {
      setLoading(true)
      console.log('Fetching details for claim:', claimId)
      const response = await claimsApi.getClaimDetails(claimId)
      console.log('Claim details response:', response)
      if (response.success) {
        setClaim(response.claim)
        console.log('Claim data loaded:', response.claim)
      }
    } catch (error) {
      console.error('Error fetching claim details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    if (!amount) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (!claim && !loading) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Claim Details
          </DialogTitle>
          <DialogDescription>
            Claim ID: {claimId}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading claim details...</p>
          </div>
        ) : claim ? (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className="text-base px-4 py-1">
                Status: {claim.claim_status || 'Pending'}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Submitted: {formatDate(claim.submission_date)}
              </div>
            </div>

            {/* Patient Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="font-medium">{claim.patient_details?.patient_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{claim.patient_details?.age} {claim.patient_details?.age_unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{claim.patient_details?.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Card Type</p>
                  <p className="font-medium">{claim.patient_details?.id_card_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Card Number</p>
                  <p className="font-medium">{claim.patient_details?.id_card_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{claim.patient_details?.patient_contact_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{claim.patient_details?.patient_email_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Beneficiary Type</p>
                  <p className="font-medium">{claim.patient_details?.beneficiary_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Relationship</p>
                  <p className="font-medium">{claim.patient_details?.relationship || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Payer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payer Patient ID</p>
                  <p className="font-medium">{claim.payer_details?.payer_patient_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Authorization Number</p>
                  <p className="font-medium">{claim.payer_details?.authorization_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Authorized Amount</p>
                  <p className="font-medium">{formatAmount(claim.payer_details?.total_authorized_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payer Type</p>
                  <p className="font-medium">{claim.payer_details?.payer_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payer Name</p>
                  <p className="font-medium">{claim.payer_details?.payer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Insurer Name</p>
                  <p className="font-medium">{claim.payer_details?.insurer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Policy Number</p>
                  <p className="font-medium">{claim.payer_details?.policy_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Corporate Name</p>
                  <p className="font-medium">{claim.payer_details?.sponsorer_corporate_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{claim.payer_details?.sponsorer_employee_id || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Provider Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hospital className="h-5 w-5" />
                  Provider Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-medium">{claim.provider_details?.patient_registration_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialty</p>
                  <p className="font-medium">{claim.provider_details?.specialty || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{claim.provider_details?.doctor || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Treatment Line</p>
                  <p className="font-medium">{claim.provider_details?.treatment_line || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Claim Type</p>
                  <p className="font-medium">{claim.provider_details?.claim_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Start Date</p>
                  <p className="font-medium">{formatDate(claim.provider_details?.service_start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service End Date</p>
                  <p className="font-medium">{formatDate(claim.provider_details?.service_end_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">InPatient Number</p>
                  <p className="font-medium">{claim.provider_details?.inpatient_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission Type</p>
                  <p className="font-medium">{claim.provider_details?.admission_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hospitalization Type</p>
                  <p className="font-medium">{claim.provider_details?.hospitalization_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ward Type</p>
                  <p className="font-medium">{claim.provider_details?.ward_type || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Final Diagnosis</p>
                  <p className="font-medium">{claim.provider_details?.final_diagnosis || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ICD-10 Code</p>
                  <p className="font-medium">{claim.provider_details?.icd_10_code || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Treatment Done</p>
                  <p className="font-medium">{claim.provider_details?.treatment_done || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PCS Code</p>
                  <p className="font-medium">{claim.provider_details?.pcs_code || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Bill Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Bill Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bill Number</p>
                  <p className="font-medium">{claim.bill_details?.bill_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bill Date</p>
                  <p className="font-medium">{formatDate(claim.bill_details?.bill_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Security Deposit</p>
                  <p className="font-medium">{formatAmount(claim.bill_details?.security_deposit || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bill Amount</p>
                  <p className="font-semibold text-lg">{formatAmount(claim.bill_details?.total_bill_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient Discount</p>
                  <p className="font-medium">{formatAmount(claim.bill_details?.patient_discount_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid by Patient</p>
                  <p className="font-medium">{formatAmount(claim.bill_details?.amount_paid_by_patient || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Patient Paid</p>
                  <p className="font-medium">{formatAmount(claim.bill_details?.total_patient_paid_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Charged to Payer</p>
                  <p className="font-medium">{formatAmount(claim.bill_details?.amount_charged_to_payer || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">MOU Discount</p>
                  <p className="font-medium">{formatAmount(claim.bill_details?.mou_discount_amount || 0)}</p>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm text-muted-foreground">Claimed Amount</p>
                  <p className="font-bold text-2xl text-primary">{formatAmount(claim.bill_details?.claimed_amount || 0)}</p>
                </div>
                {claim.bill_details?.submission_remarks && (
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-muted-foreground">Submission Remarks</p>
                    <p className="font-medium mt-1 p-3 bg-muted rounded-md">{claim.bill_details.submission_remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No claim details available
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
