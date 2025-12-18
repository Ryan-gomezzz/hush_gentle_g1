'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { login } from '@/lib/actions/auth'
import { sendOTP, verifyOTP } from '@/lib/actions/auth-phone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

function EmailSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  )
}

function PhoneSubmitButton({ step }: { step: 'send' | 'verify' }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (step === 'send' ? 'Sending...' : 'Verifying...') : (step === 'send' ? 'Send OTP' : 'Verify OTP')}
    </Button>
  )
}

import { AuthState } from '@/lib/auth'

const initialState: AuthState = { message: null }

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/account/dashboard'
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [phoneStep, setPhoneStep] = useState<'send' | 'verify'>('send')
  const [phoneNumber, setPhoneNumber] = useState('')

  const loginWithRedirect = async (prevState: AuthState, formData: FormData) => {
    return await login(prevState, formData, redirectTo)
  }

  const [emailState, emailFormAction] = useFormState(loginWithRedirect, initialState)

  const handleSendOTP = async (prevState: { success: boolean; message: string }, formData: FormData) => {
    const phone = formData.get('phone') as string
    setPhoneNumber(phone)
    const result = await sendOTP(phone)
    if (result.success) {
      setPhoneStep('verify')
    }
    return result
  }

  const [otpState, otpFormAction] = useFormState(handleSendOTP, { success: false, message: '' })

  const handleVerifyOTP = async (prevState: { success: boolean; message: string } | null, formData: FormData) => {
    formData.append('phoneNumber', phoneNumber)
    formData.append('redirectTo', redirectTo)
    return await verifyOTP(prevState, formData)
  }

  const [verifyState, verifyFormAction] = useFormState(handleVerifyOTP, { success: false, message: '' })

  return (
    <Card className="w-full max-w-md shadow-lg border-sage-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-sage-900 font-serif">Welcome Back</CardTitle>
        <CardDescription className="text-center text-sage-600">
          Sign in to continue shopping gently.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 border-b border-sage-200">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email')
              setPhoneStep('send')
            }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${authMethod === 'email'
                ? 'text-sage-900 border-b-2 border-sage-600'
                : 'text-sage-600 hover:text-sage-900'
              }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone')
              setPhoneStep('send')
            }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${authMethod === 'phone'
                ? 'text-sage-900 border-b-2 border-sage-600'
                : 'text-sage-600 hover:text-sage-900'
              }`}
          >
            Phone
          </button>
        </div>

        {/* Email Login Form */}
        {authMethod === 'email' && (
          <form action={emailFormAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-sage-800">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-sage-800">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 bg-white/50"
              />
            </div>
            {emailState?.message && (
              <p className="text-sm text-red-500 text-center">{emailState.message}</p>
            )}
            <EmailSubmitButton />
          </form>
        )}

        {/* Phone OTP Form */}
        {authMethod === 'phone' && (
          <>
            {phoneStep === 'send' ? (
              <form action={otpFormAction} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-sage-800">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    required
                    className="w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 bg-white/50"
                  />
                  <p className="text-xs text-sage-500">Include country code (e.g., +91 for India)</p>
                </div>
                {otpState?.message && (
                  <p className={`text-sm text-center ${otpState.success ? 'text-green-600' : 'text-red-500'}`}>
                    {otpState.message}
                  </p>
                )}
                <PhoneSubmitButton step="send" />
              </form>
            ) : (
              <form action={verifyFormAction} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-sage-800">Enter OTP</label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 bg-white/50 text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-sage-500">Enter the 6-digit code sent to {phoneNumber}</p>
                </div>
                <PhoneSubmitButton step="verify" />
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep('send')
                    setPhoneNumber('')
                  }}
                  className="w-full text-sm text-sage-600 hover:text-sage-900"
                >
                  Change phone number
                </button>
              </form>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-sage-600">
          New here?{' '}
          <Link href="/signup" className="text-sage-900 hover:underline">
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full py-12 px-4 flex justify-center">
      <Suspense fallback={<Card className="w-full max-w-md shadow-lg border-sage-100"><CardContent className="p-8"><div className="text-center">Loading...</div></CardContent></Card>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
