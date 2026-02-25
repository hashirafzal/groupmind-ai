import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DiscussionClient from './DiscussionClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ conversationId: string }>
}

export default async function DiscussionPage({ params }: PageProps): Promise<React.JSX.Element> {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  const { conversationId } = await params

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/sign-in')
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!conversation || conversation.createdById !== user.id) {
    redirect('/dashboard/discussions')
  }

  return (
    <DiscussionClient
      user={user}
      conversation={conversation}
    />
  )
}
