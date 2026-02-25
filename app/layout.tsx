import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import { Suspense } from 'react'
import SmoothScrollHandler from './SmoothScrollHandler'
import './globals.css'

export const metadata: Metadata = {
  title: 'GroupMind AI — Collaborative AI Discussions',
  description:
    'Multi-agent AI platform where teams collaboratively explore ideas through structured, AI-assisted discussions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <SessionProvider>
          <Suspense fallback={null}>
            <SmoothScrollHandler />
          </Suspense>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
