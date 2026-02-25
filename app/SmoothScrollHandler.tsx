'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function SmoothScrollHandler() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // This handles the "snap" when navigating between pages with a hash
    const hash = window.location.hash
    if (hash && pathname === '/') {
      const targetId = hash.replace('#', '')
      const element = document.getElementById(targetId)
      
      if (element) {
        // Delay slightly to ensure layout is ready
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 100)
      }
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Setup Intersection Observer for scroll-reveal animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    const revealElements = document.querySelectorAll('.reveal-on-scroll')
    revealElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [pathname])

  return null
}
