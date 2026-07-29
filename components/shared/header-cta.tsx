'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight, LayoutDashboard } from 'lucide-react'

type AuthState = 'loading' | 'authenticated' | 'guest'

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
    return <div className="h-9 w-28 rounded-xl bg-slate-100 animate-pulse" />
  }

  if (state === 'authenticated') {
    return (
      <Link href={portalPath}>
        <Button
          size="sm"
          style={{ backgroundColor: '#1470af', color: '#ffffff' }}
          className="gap-1.5 rounded-xl px-5 text-white font-bold shadow-md transition-all duration-200 hover:bg-[#0f5f8f] hover:scale-105 active:scale-95"
        >
          <LayoutDashboard className="size-3.5 text-white" />
          <span>Vào portal</span>
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/auth/dang-nhap">
      <Button
        size="sm"
        style={{ backgroundColor: '#1470af', color: '#ffffff' }}
        className="gap-1.5 rounded-xl px-5 text-white font-bold shadow-md transition-all duration-200 hover:bg-[#0f5f8f] hover:scale-105 active:scale-95"
      >
        <span>Đăng nhập</span>
        <ChevronRight className="size-3.5 text-white" />
      </Button>
    </Link>
  )
}
