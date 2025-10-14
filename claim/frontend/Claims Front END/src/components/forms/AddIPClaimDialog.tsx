'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/lib/toast'
import { claimsApi } from '@/services/claimsApi'
import type { ClaimFormData } from '@/types/claims'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

interface AddIPClaimDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const initialFormData: ClaimFormData = {
  // Patient Details
  patient_name: '',
  age: '',
  age_unit: 'YRS',
  gender: '',
  id_card_type: '',
  id_card_number: '',
  patient_contact_number: '',
  patient_email_id: '',
  beneficiary_type: '',
  relationship: '',

  // Payer Details
  payer_patient_id: '',
  authorization_number: '',
  total_authorized_amount: '',
  payer_type: '',
  payer_name: '',
  insurer_name: '',
  policy_number: '',
  sponsorer_corporate_name: '',
  sponsorer_employee_id: '',
  sponsorer_employee_name: '',

  // Provider Details
  patient_registration_number: '',
  specialty: '',
  doctor: '',
  treatment_line: '',
  claim_type: 'INPATIENT',
  service_start_date: '',
  service_end_date: '',
  inpatient_number: '',
  admission_type: '',
  hospitalization_type: '',
  ward_type: '',
  final_diagnosis: '',
  icd_10_code: '',
  treatment_done: '',
  pcs_code: '',

  // Bill Details
  bill_number: '',
  bill_date: '',
  security_deposit: '',
  total_bill_amount: '',
  patient_discount_amount: '',
  amount_paid_by_patient: '',
  total_patient_paid_amount: '',
  amount_charged_to_payer: '',
  mou_discount_amount: '',
  claimed_amount: '',
  submission_remarks: ''
}

export function AddIPClaimDialog({ open, onOpenChange, onSuccess }: AddIPClaimDialogProps) {
  const [formData, setFormData] = useState<ClaimFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('patient')

  const handleChange = (field: keyof ClaimFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-calculations for bill amounts
      const totalBill = parseFloat(updated.total_bill_amount) || 0
      const patientDiscount = parseFloat(updated.patient_discount_amount) || 0
      const amountPaidByPatient = parseFloat(updated.amount_paid_by_patient) || 0
      
      // Rule 1: Total Patient Paid = Patient Discount + Amount Paid By Patient
      if (field === 'patient_discount_amount' || field === 'amount_paid_by_patient') {
        const totalPatientPaid = patientDiscount + amountPaidByPatient
        updated.total_patient_paid_amount = totalPatientPaid.toString()
      }
      
      // Rule 2: Amount Charged to Payer = Total Bill - Total Patient Paid
      if (field === 'total_bill_amount' || field === 'patient_discount_amount' || field === 'amount_paid_by_patient' || field === 'total_patient_paid_amount') {
        const totalPatientPaid = parseFloat(updated.total_patient_paid_amount) || 0
        updated.amount_charged_to_payer = (totalBill - totalPatientPaid).toString()
      }
      
      // Rule 3: Claimed Amount = Amount Charged to Payer - MOU Discount
      const amountChargedToPayer = parseFloat(updated.amount_charged_to_payer) || 0
      const mouDiscountAmount = parseFloat(updated.mou_discount_amount) || 0
      updated.claimed_amount = (amountChargedToPayer - mouDiscountAmount).toFixed(2)
      
      return updated
    })
    
    // Auto-reset relationship when beneficiary type changes
    if (field === 'beneficiary_type') {
      setFormData(prev => ({ ...prev, relationship: '' }))
    }
  }

  const getRelationshipOptions = () => {
    if (formData.beneficiary_type === 'SELF' || formData.beneficiary_type === 'SELF (Individual Policy)') {
      return ['SELF']
    } else if (formData.beneficiary_type === 'DEPENDANT') {
      return ['SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'OTHER']
    }
    return ['SELF', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'OTHER']
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await claimsApi.submitClaim(formData)
      
      toast.success('Claim Submitted Successfully', {
        description: `Claim ID: ${result.claim_id}`,
      })

      setFormData(initialFormData)
      setCurrentTab('patient')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to Submit Claim', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit IP Claim</DialogTitle>
          <DialogDescription>
            Fill in all required fields to submit a new inpatient claim
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="patient">1. Patient</TabsTrigger>
              <TabsTrigger value="payer">2. Payer</TabsTrigger>
              <TabsTrigger value="provider">3. Provider</TabsTrigger>
              <TabsTrigger value="bill">4. Bill</TabsTrigger>
            </TabsList>

            {/* Patient Details Tab */}
            <TabsContent value="patient" className="space-y-4">
              <Card>
                <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="patient_name">
                      Patient Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="patient_name"
                      value={formData.patient_name}
                      onChange={(e) => handleChange('patient_name', e.target.value)}
                      required
                      placeholder="Enter patient full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Age <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
                        required
                        placeholder="Age"
                        className="flex-1"
                      />
                      <Select
                        value={formData.age_unit}
                        onValueChange={(value) => handleChange('age_unit', value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAYS">Days</SelectItem>
                          <SelectItem value="MONTHS">Months</SelectItem>
                          <SelectItem value="YRS">Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER/NA">Other/NA</SelectItem>
                        <SelectItem value="Not Available">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>ID Card Type <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.id_card_type}
                      onValueChange={(value) => handleChange('id_card_type', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID Card Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AADHAR CARD">Aadhar Card</SelectItem>
                        <SelectItem value="VOTERS ID CARD">Voters ID Card</SelectItem>
                        <SelectItem value="PASSPORT">Passport</SelectItem>
                        <SelectItem value="PAN CARD">PAN Card</SelectItem>
                        <SelectItem value="RATION CARD">Ration Card</SelectItem>
                        <SelectItem value="EMPLOYEE ID CARD">Employee ID Card</SelectItem>
                        <SelectItem value="Driving License">Driving License</SelectItem>
                        <SelectItem value="State Govt ID">State Govt ID</SelectItem>
                        <SelectItem value="Central Govt ID">Central Govt ID</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id_card_number">ID Card Number</Label>
                    <Input
                      id="id_card_number"
                      value={formData.id_card_number}
                      onChange={(e) => handleChange('id_card_number', e.target.value)}
                      placeholder="Enter ID card number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient_contact_number">Contact Number</Label>
                    <Input
                      id="patient_contact_number"
                      type="tel"
                      value={formData.patient_contact_number}
                      onChange={(e) => handleChange('patient_contact_number', e.target.value)}
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient_email_id">Email ID</Label>
                    <Input
                      id="patient_email_id"
                      type="email"
                      value={formData.patient_email_id}
                      onChange={(e) => handleChange('patient_email_id', e.target.value)}
                      placeholder="patient@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Beneficiary Type <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.beneficiary_type}
                      onValueChange={(value) => handleChange('beneficiary_type', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Beneficiary Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SELF">Self</SelectItem>
                        <SelectItem value="DEPENDANT">Dependant</SelectItem>
                        <SelectItem value="SELF (Individual Policy)">Self (Individual Policy)</SelectItem>
                        <SelectItem value="Not Available">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Relationship <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => handleChange('relationship', value)}
                      required
                      disabled={!formData.beneficiary_type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {getRelationshipOptions().map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!formData.beneficiary_type && (
                      <p className="text-sm text-muted-foreground">Select beneficiary type first</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="button" onClick={() => setCurrentTab('payer')}>
                  Next →
                </Button>
              </div>
            </TabsContent>

            {/* Payer Details Tab - Similar structure */}
            <TabsContent value="payer" className="space-y-4">
              <Card>
                <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                  {/* Add all payer fields here - similar to patient */}
                  <div className="space-y-2 col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Payer details section - Add all required payer fields
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentTab('patient')}>
                  ← Back
                </Button>
                <Button type="button" onClick={() => setCurrentTab('provider')}>
                  Next →
                </Button>
              </div>
            </TabsContent>

            {/* Provider & Bill tabs - similar structure */}
            
            <TabsContent value="provider" className="space-y-4">
              <Card>
                <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                  <div className="space-y-2 col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Provider details section - Add all required provider fields
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentTab('payer')}>
                  ← Back
                </Button>
                <Button type="button" onClick={() => setCurrentTab('bill')}>
                  Next →
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bill" className="space-y-4">
              <Card>
                <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                  <div className="space-y-2 col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Bill details section - Add all required bill fields
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentTab('provider')}>
                  ← Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Claim'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}
