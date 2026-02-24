import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient(): ReturnType<typeof createServerClient> {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string): string | undefined {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions): void {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions): void {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
