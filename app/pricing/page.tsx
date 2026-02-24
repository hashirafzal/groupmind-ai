import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/landing/Navbar'
import Pricing from '@/components/landing/Pricing'
import Footer from '@/components/landing/Footer'
import { headers } from 'next/headers'

export const metadata = {
  title: 'Pricing — GroupMind AI',
  description:
    'Simple, transparent pricing for individuals and teams. Start free, upgrade when you need more.',
}

export default async function PricingPage(): Promise<React.JSX.Element> {
  const session = await auth()
  
  // If user is logged in, they should go through Stripe checkout
  const isLoggedIn = !!session?.user

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Pricing isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </>
  )
}
