import Link from 'next/link'
import { Brain } from 'lucide-react'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function SignUpPage(): React.JSX.Element {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">GroupMind AI</span>
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Create your account</h1>
        <p className="text-muted-foreground">Start your free AI think tank today</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
        <GoogleSignInButton />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-brand-purple hover:underline">
            Sign in
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
