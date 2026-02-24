import type { SubscriptionTier } from '@prisma/client'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      subscriptionTier: SubscriptionTier
    } & DefaultSession['user']
  }

  interface User {
    subscriptionTier: SubscriptionTier
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    subscriptionTier: SubscriptionTier
  }
}
