import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import NewDiscussionForm from '@/components/discussion/NewDiscussionForm'

export const dynamic = 'force-dynamic'

export default async function NewDiscussionPage(): Promise<React.JSX.Element> {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { subscriptionTier: true },
  })

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="h-screen overflow-y-auto bg-background p-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Start New Discussion</h1>
        <NewDiscussionForm tier={user.subscriptionTier} />
      </div>
    </div>
  )
}
