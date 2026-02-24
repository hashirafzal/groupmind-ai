import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import type { SubscriptionTier } from '@prisma/client'

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as NextAuthConfig['adapter'],
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session: sessionToken }) {
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
        token.subscriptionTier = dbUser?.subscriptionTier ?? 'FREE'
      }
      if (trigger === 'update' && sessionToken) {
        token.subscriptionTier = sessionToken.subscriptionTier
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.subscriptionTier = token.subscriptionTier as SubscriptionTier
      }
      return session
    },
  },
  pages: {
    signIn: '/sign-in',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

export { authConfig as authOptions }
