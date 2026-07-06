'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoLink } from '@/components/shared/logo-link'
import { HeaderCTA } from '@/components/shared/header-cta'
import { cn } from '@/lib/utils'

const PUBLIC_NAV_ITEMS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/dich-vu', label: 'Dịch vụ' },
  { href: '/san-pham-doi-tac', label: 'Đối tác' },
  { href: '/bang-gia', label: 'Bảng giá' },
  { href: '/thu-vien', label: 'Thư viện' },
]

export function PublicHeader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const isHomePage = pathname === '/'

  useEffect(() => {
    const heroHeight = typeof window !== 'undefined' ? window.innerHeight * 3.5 : 2800 // 350vh hero

    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY.current

      if (y < 80) {
        // Always show header at the very top (unscrolled state)
        setVisible(true)
      } else if (isHomePage && y >= 80 && y < heroHeight) {
        // When scrolled inside Hero section -> hide to focus on 3D experience
        setVisible(false)
      } else {
        // Smart hide outside hero: hide on scroll down, show on scroll up
        if (delta > 6) {
          setVisible(false)
        } else if (delta < -4) {
          setVisible(true)
        }
      }

      lastY.current = y
    }

    // Always visible on initial mount
    setVisible(true)

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHomePage])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]',
        visible ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      {/* White header — full width, edge-to-edge */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 sm:px-10 lg:px-16 shadow-sm">
        <LogoLink />

        <nav className="hidden items-center gap-0.5 md:flex">
          {PUBLIC_NAV_ITEMS.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200',
                  isActive
                    ? 'text-primary font-semibold bg-primary/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <HeaderCTA />
        </div>
      </div>
    </header>
  )
}
