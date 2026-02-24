import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'

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
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/discussions"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discussions
        </Link>

        <h1 className="mb-8 text-3xl font-bold text-foreground">{conversation.title}</h1>

        <div className="space-y-6">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl p-4 ${
                message.role === 'USER'
                  ? 'border border-white/10 bg-white/5'
                  : 'border border-brand-purple/20 bg-brand-purple/5'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-purple" />
                <span className="text-sm font-medium text-foreground">
                  {message.role === 'USER' ? 'You' : 'AI Agent'}
                </span>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}

          {conversation.messages.length === 1 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-muted-foreground">
                AI responses are being generated...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
