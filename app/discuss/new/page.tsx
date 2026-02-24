import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewDiscussionForm from '@/components/discussion/NewDiscussionForm'

export default async function NewDiscussionPage(): Promise<React.JSX.Element> {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Start New Discussion</h1>
        <NewDiscussionForm />
      </div>
    </div>
  )
}
