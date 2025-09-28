'use client'

import { useState, useCallback, Suspense } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Phone, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import PublicRoute from '@/components/auth/PublicRoute'

function LoginPageContent() {
  const { login, loginDirect, loginWithPhone, sendOTP, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [activeTab, setActiveTab] = useState('email')

  const [formData, setFormData] = useState({
    email: 'shivarajagnipatil@gmail.com', // Pre-filled test credentials
    password: 'Medverve@123',
    phone: '',
    otp: ''
  })

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    // Reset OTP state when switching tabs
    if (value === 'email') {
      setOtpSent(false)
    }
  }, [])

  const handleGenerateOTP = useCallback(async () => {
    if (!formData.phone) {
      toast.error('Please enter a phone number')
      return
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setOtpLoading(true)
    try {
      await sendOTP(formData.phone)
      setOtpSent(true)
    } catch (error) {
      console.error('OTP generation error:', error)
    } finally {
      setOtpLoading(false)
    }
  }, [formData.phone, sendOTP])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation for Email tab
    if (activeTab === 'email') {
      if (!formData.email || !formData.password) {
        toast.error('Please enter both email and password')
        return
      }
      if (!formData.email.includes('@')) {
        toast.error('Please enter a valid email address')
        return
      }

      try {
        // Use loginDirect for API-based authentication (hospital_admin)
        await loginDirect({
          email: formData.email,
          password: formData.password
        })

        // Redirect will be handled by PublicRoute component
      } catch (error) {
        console.error('Login error:', error)
      }
    }

    // Validation for Phone tab
    if (activeTab === 'phone') {
      if (!formData.phone) {
        toast.error('Please enter your phone number')
        return
      }
      if (!/^\d{10}$/.test(formData.phone)) {
        toast.error('Please enter a valid 10-digit phone number')
        return
      }
      if (!otpSent) {
        toast.error('Please generate OTP first')
        return
      }
      if (!formData.otp) {
        toast.error('Please enter the OTP')
        return
      }
      if (formData.otp.length < 4) {
        toast.error('Please enter a valid OTP')
        return
      }

      try {
        await loginWithPhone({
          phone: formData.phone,
          otp: formData.otp
        })

        // Redirect will be handled by PublicRoute component
      } catch (error) {
        console.error('Phone login error:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main login card */}
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm border-white/20 shadow-2xl bg-white/80">
        <CardHeader className="space-y-4 text-center pb-8">
          {/* Logo/Brand */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 flex items-center justify-center">
                <Image
                  src="/assets/logo.png"
                  alt="Medvere Logo"
                  width={120}
                  height={120}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>

        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="email"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Mail className="w-4 h-4" />
                Email Login
              </TabsTrigger>
              <TabsTrigger
                value="phone"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Phone className="w-4 h-4" />
                Phone Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-11 pl-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="h-11 pl-4 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login button */}
                <Button
                  type="submit"
                  className={cn(
                    "w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
                    isLoading && "opacity-80 cursor-not-allowed"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign in with Email
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Phone field with Generate OTP button */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="h-11 pl-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading || otpLoading}
                      maxLength={10}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateOTP}
                      disabled={isLoading || otpLoading || !formData.phone || formData.phone.length !== 10}
                      className={cn(
                        "h-11 px-4 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap",
                        otpSent && "bg-green-50 border-green-500 text-green-600"
                      )}
                    >
                      {otpLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          Sending...
                        </div>
                      ) : otpSent ? (
                        'OTP Sent ✓'
                      ) : (
                        'Generate OTP'
                      )}
                    </Button>
                  </div>
                  {otpSent && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      OTP sent to {formData.phone}
                    </p>
                  )}
                </div>

                {/* OTP field */}
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Enter OTP
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-11 pl-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={!otpSent || isLoading}
                    maxLength={6}
                  />
                  {!otpSent && (
                    <p className="text-xs text-gray-500">
                      Enter your registered phone number and generate OTP
                    </p>
                  )}
                </div>

                {/* Login button */}
                <Button
                  type="submit"
                  className={cn(
                    "w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
                    isLoading && "opacity-80 cursor-not-allowed"
                  )}
                  disabled={isLoading || !otpSent}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying OTP...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Verify OTP & Sign in
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-gray-500">
          We see possibilities where others see a full stop. We Deliver on that promise.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PublicRoute>
        <LoginPageContent />
      </PublicRoute>
    </Suspense>
  )
}