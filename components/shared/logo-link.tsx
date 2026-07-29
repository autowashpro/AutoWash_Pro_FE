'use client'

import Image from 'next/image'

interface LogoLinkProps {
  variant?: 'dark' | 'light'
}

export function LogoLink({ variant = 'dark' }: LogoLinkProps) {
  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname)
      }
    }
  }

  return (
    <a
      href="#"
      onClick={handleScrollToTop}
      className="flex items-center gap-2.5 transition-opacity hover:opacity-90 select-none"
    >
      {/* Container box with zoomed edge-to-edge logo filling all padding gaps */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-sm overflow-hidden p-0">
        <Image
          src="/images/logo-awp.png"
          alt="AutoWash Pro"
          width={40}
          height={40}
          className="size-full object-contain scale-125 bg-white"
        />
      </div>
      <span className={`text-base font-extrabold tracking-tight ${variant === 'light' ? 'text-white' : 'text-slate-900'}`}>
        AutoWash <span style={{ color: '#1470af' }} className="font-extrabold">Pro</span>
      </span>
    </a>
  )
}
