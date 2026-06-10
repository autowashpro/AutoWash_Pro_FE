'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight, LayoutDashboard, LogIn } from 'lucide-react'

type AuthState = 'loading' | 'authenticated' | 'guest'

/**
 * Smart header CTA:
 * - Loading: placeholder to avoid layout shift
 * - Authenticated: "Vào portal" → redirect to correct portal
 * - Guest: "Đăng nhập"
 *
 * Reads cookies client-side (set by middleware on login).
 */
export function HeaderCTA() {
  const [state, setState] = useState<AuthState>('loading')
  const [portalPath, setPortalPath] = useState('/customer')

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce<Record<string, string>>(
      (acc, c) => {
        const [k, v] = c.trim().split('=')
        acc[k] = v
        return acc
      },
      {}
    )

    const hasToken = !!cookies['aw_access_token']
    const role = cookies['aw_role']

    if (hasToken && role) {
      const rolePortal: Record<string, string> = {
        CUSTOMER: '/customer',
        ADMIN: '/admin',
        MANAGER: '/manager',
        CAR_WASHER: '/washer',
      }
      setPortalPath(rolePortal[role] ?? '/customer')
      setState('authenticated')
    } else {
      setState('guest')
    }
  }, [])

  if (state === 'loading') {
    return <div className="h-9 w-28 rounded-xl bg-muted/40 animate-pulse" />
  }

  if (state === 'authenticated') {
    return (
      <Link href={portalPath}>
        <Button
          size="sm"
          className="gap-1.5 rounded-xl bg-gradient-to-r from-primary to-sky-500 px-5 text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 dark:from-sky-400 dark:to-blue-400 dark:text-slate-900"
        >
          <LayoutDashboard className="size-3.5" />
          Vào portal
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/auth/dang-nhap">
      <Button
        size="sm"
        className="gap-1.5 rounded-xl bg-gradient-to-r from-primary to-sky-500 px-5 text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 dark:from-sky-400 dark:to-blue-400 dark:text-slate-900"
      >
        Đăng nhập
        <ChevronRight className="size-3.5" />
      </Button>
    </Link>
  )
}
