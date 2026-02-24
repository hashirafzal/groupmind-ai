import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, MessageSquare } from 'lucide-react'

export default async function DiscussionsPage(): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      conversations: {
        orderBy: { updatedAt: 'desc' },
        take: 50,
      },
    },
  })

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Discussions</h1>
          <p className="text-muted-foreground">
            Your conversation history with AI agents
          </p>
        </div>
        <Link
          href="/discuss/new"
          className="flex items-center gap-2 rounded-xl bg-brand-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-purple/90"
        >
          <Plus className="h-4 w-4" />
          New Discussion
        </Link>
      </div>

      {user.conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/2 py-16">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No discussions yet
          </h3>
          <p className="mb-6 text-center text-muted-foreground">
            Start your first AI-powered discussion to see it here
          </p>
          <Link
            href="/discuss/new"
            className="flex items-center gap-2 rounded-xl bg-brand-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-purple/90"
          >
            <Plus className="h-4 w-4" />
            Start Discussion
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {user.conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/discuss/${conversation.id}`}
              className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/2 p-4 transition-colors hover:border-white/12 hover:bg-white/4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10">
                <MessageSquare className="h-5 w-5 text-brand-purple" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="truncate font-medium text-foreground">
                  {conversation.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
