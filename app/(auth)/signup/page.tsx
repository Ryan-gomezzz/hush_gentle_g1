'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { signup } from '@/lib/actions/auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Reusing the same components for consistency
import { sendOTP, verifyOTP } from '@/lib/actions/auth-phone'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating Account...' : 'Sign Up'}
        </Button>
    )
}

function PhoneSubmitButton({ step }: { step: 'send' | 'verify' }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (step === 'send' ? 'Sending OTP...' : 'Verifying...') : (step === 'send' ? 'Send OTP' : 'Verify & Sign Up')}
        </Button>
    )
}

const initialState: { message: string | null } = { message: null }

function SignupForm() {
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirect') || '/'
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
    const [phoneStep, setPhoneStep] = useState<'send' | 'verify'>('send')
    const [phoneNumber, setPhoneNumber] = useState('')

    const signupWithRedirect = async (prevState: { message: string | null }, formData: FormData) => {
        return await signup(prevState, formData, redirectTo)
    }

    const [state, formAction] = useFormState(signupWithRedirect, initialState)
    const router = useRouter()

    // Phone Auth Logic
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

    // Handle successful email signup redirect
    useEffect(() => {
        if (state?.message?.startsWith('SUCCESS_REDIRECT')) {
            const redirectUrl = state.message.split(':')[1] || redirectTo
            router.push(redirectUrl)
            router.refresh()
        }
    }, [state?.message, router, redirectTo])

    // Handle successful phone signup redirect
    useEffect(() => {
        if (verifyState?.success && verifyState.message.startsWith('SUCCESS_REDIRECT')) {
            const redirectUrl = verifyState.message.split(':')[1] || redirectTo
            router.push(redirectUrl)
            router.refresh()
        }
    }, [verifyState?.success, verifyState?.message, router, redirectTo])

    return (
        <Card className="w-full max-w-md shadow-lg border-sage-100">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center text-sage-900 font-serif">Create an account</CardTitle>
                <CardDescription className="text-center text-sage-600">
                    Enter your details below to create your account
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

                {/* Email Form */}
                {authMethod === 'email' && (
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="full_name" className="text-sm font-medium text-sage-800">Full Name</label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                placeholder="John Doe"
                                required
                                className="w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 bg-white/50"
                            />
                        </div>
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
                        {state?.message && !state.message.startsWith('SUCCESS_REDIRECT') && (
                            <p className={`text-sm text-center ${state.message.includes('error') || state.message.includes('failed') ? 'text-red-500' : 'text-sage-600'}`}>
                                {state.message}
                            </p>
                        )}
                        <SubmitButton />
                    </form>
                )}

                {/* Phone Form */}
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
                                {verifyState?.message && (
                                    <p className="text-sm text-red-500 text-center">{verifyState.message}</p>
                                )}
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
                    Already have an account?{' '}
                    <Link href="/login" className="text-sage-900 hover:underline">
                        Login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function SignupPage() {
    return (
        <div className="w-full py-12 px-4 flex justify-center">
            <Suspense fallback={<Card className="w-full max-w-md shadow-lg border-sage-100"><CardContent className="p-8"><div className="text-center">Loading...</div></CardContent></Card>}>
                <SignupForm />
            </Suspense>
        </div>
    )
}
