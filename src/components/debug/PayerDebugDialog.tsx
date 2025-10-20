'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  UserPlus,
  RefreshCw,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { findPayerById, affiliatePayerById, debugPayerAffiliation, getUnaffiliatedPayers } from '@/utils/payerUtils'

interface PayerDebugDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PayerDebugInfo {
  payer: any
  isAffiliated: boolean
  needsAffiliation: boolean
  debugInfo: {
    id: string
    payerName: string
    payerType: string
    payerCode: string
    isAffiliated: boolean
    needsAffiliation: boolean
  }
}

export default function PayerDebugDialog({
  open,
  onOpenChange,
}: PayerDebugDialogProps) {
  const [payerId, setPayerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [affiliating, setAffiliating] = useState(false)
  const [debugInfo, setDebugInfo] = useState<PayerDebugInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!payerId.trim()) {
      toast.error('Please enter a payer ID')
      return
    }

    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      const result = await debugPayerAffiliation(payerId.trim())
      setDebugInfo(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to debug payer'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAffiliate = async () => {
    if (!debugInfo?.payer) return

    setAffiliating(true)
    try {
      await affiliatePayerById(payerId.trim())
      // Refresh debug info
      await handleSearch()
    } catch (error) {
      console.error('Error affiliating payer:', error)
    } finally {
      setAffiliating(false)
    }
  }

  const handleClear = () => {
    setPayerId('')
    setDebugInfo(null)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Payer Affiliation Debug Tool
          </DialogTitle>
          <DialogDescription>
            Debug payer affiliation issues and fix unaffiliated payers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Payer</CardTitle>
              <CardDescription>
                Enter a payer ID to check its affiliation status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="payerId">Payer ID</Label>
                  <Input
                    id="payerId"
                    placeholder="e.g., e7f7d1c6-fb50-4940-9fd1-66beb7794135"
                    value={payerId}
                    onChange={(e) => setPayerId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={loading || !payerId.trim()}>
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Debug Results */}
          {debugInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {debugInfo.isAffiliated ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Payer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payer Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Payer Name</Label>
                    <p className="text-sm">{debugInfo.payer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payer Type</Label>
                    <Badge variant="outline">{debugInfo.payer.type}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payer Code</Label>
                    <p className="text-sm font-mono">{debugInfo.payer.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={debugInfo.payer.status === 'active' ? 'default' : 'secondary'}>
                      {debugInfo.payer.status}
                    </Badge>
                  </div>
                </div>

                {/* Affiliation Status */}
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Affiliation Status</Label>
                    {debugInfo.isAffiliated ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Affiliated
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Not Affiliated
                      </Badge>
                    )}
                  </div>
                  
                  {debugInfo.needsAffiliation && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This payer needs to be affiliated with your hospital before it can be used in operations.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {debugInfo.needsAffiliation && (
                    <Button onClick={handleAffiliate} disabled={affiliating}>
                      {affiliating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Affiliating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Affiliate Payer
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
