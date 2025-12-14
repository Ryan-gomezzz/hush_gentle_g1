'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  )
}

const initialState = { message: '' }

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="flex items-center justify-center min-h-screen bg-beige-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-sage-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-sage-900 font-serif">Welcome Back</CardTitle>
          <CardDescription className="text-center text-sage-600">
            Sign in to continue shopping gently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
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
            {state?.message && (
              <p className="text-sm text-red-500 text-center">{state.message}</p>
            )}
            <SubmitButton />
          </form>
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
    </div>
  )
}
