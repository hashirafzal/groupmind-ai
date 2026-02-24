import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import SalesPitch from '@/components/landing/SalesPitch'
import Testimonials from '@/components/landing/Testimonials'
import Pricing from '@/components/landing/Pricing'
import Footer from '@/components/landing/Footer'

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <SalesPitch />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
