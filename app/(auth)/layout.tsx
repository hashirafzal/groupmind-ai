import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — GroupMind AI',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      {children}
    </div>
  )
}
