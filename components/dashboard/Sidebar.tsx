'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Brain, Home, MessageSquare, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: {
    id: string
    name: string | null
    image: string | null
    email: string | null
    subscriptionTier: string
  }
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ user }: SidebarProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col border-r border-white/5 bg-background">
      <div className="flex h-16 items-center gap-2 border-b border-white/5 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">GroupMind</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-purple/10 text-brand-purple'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="mb-3 flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple text-sm font-medium text-white">
              {user.name?.[0] || user.email?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">{user.name || 'User'}</p>
            <p className="truncate text-xs text-muted-foreground">{user.subscriptionTier}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
