import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { User, CreditCard, Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10">
              <User className="h-5 w-5 text-brand-purple" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Your account information</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">Name</span>
              <span className="text-foreground">{user.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Member since</span>
              <span className="text-foreground">
                {user.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-cyan/10">
              <CreditCard className="h-5 w-5 text-brand-cyan" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Subscription</h2>
              <p className="text-sm text-muted-foreground">Manage your plan</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">Current Plan</span>
              <span className="font-medium text-foreground">{user.subscriptionTier}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-foreground">
                {user.subscriptionStatus || 'N/A'}
              </span>
            </div>
          </div>
          <a
            href="/pricing"
            className="mt-4 block w-full rounded-xl bg-brand-purple px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-purple/90"
          >
            Upgrade Plan
          </a>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Security</h2>
              <p className="text-sm text-muted-foreground">Account security options</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your account is secured via Google OAuth. You can manage your
            connected Google account at myaccount.google.com.
          </p>
        </div>
      </div>
    </div>
  )
}
