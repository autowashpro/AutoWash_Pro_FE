'use client'

import Image from 'next/image'

export function LogoLink() {
  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      // Clear hash in URL bar if there is one
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname)
      }
    }
  }

  return (
    <a
      href="#"
      onClick={handleScrollToTop}
      className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
    >
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-white/90 shadow-[var(--shadow-glow)] ring-1 ring-border/40">
        <Image
          src="/images/logo-awp.png"
          alt="AutoWash Pro"
          width={36}
          height={36}
          className="size-full object-contain"
        />
      </span>
      <span className="text-base font-extrabold tracking-tight text-foreground">
        AutoWash <span className="text-primary">Pro</span>
      </span>
    </a>
  )
}
