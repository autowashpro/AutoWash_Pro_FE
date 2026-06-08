"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { logout } from "@/lib/api"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import {
  LayoutDashboard,
  CalendarPlus,
  Car,
  Gift,
  ClipboardList,
  Camera,
  Users,
  SprayCan,
  UserPlus,
  BarChart3,
  Wrench,
  LogOut,
  Settings,
  MessageSquare,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  calendar: CalendarPlus,
  car: Car,
  gift: Gift,
  clipboard: ClipboardList,
  camera: Camera,
  users: Users,
  spray: SprayCan,
  walkin: UserPlus,
  chart: BarChart3,
  wrench: Wrench,
  settings: Settings,
  message: MessageSquare,
} satisfies Record<string, LucideIcon>

export type NavIconKey = keyof typeof NAV_ICONS

export interface NavItem {
  label: string
  href: string
  icon: NavIconKey
}

interface PortalShellProps {
  roleName: string
  nav: NavItem[]
  userName: string
  userMeta: string
  children: React.ReactNode
}

export function PortalShell({ roleName, nav, userName, userMeta, children }: PortalShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/dang-nhap")
    } catch (error) {
      console.error("Logout failed:", error)
      router.push("/auth/dang-nhap")
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-20 flex-col items-center gap-1 border-r border-border/60 bg-sidebar py-6 shadow-[1px_0_0_0_rgba(0,0,0,0.04)] md:flex lg:w-64 lg:items-stretch lg:px-4">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-3 px-2 lg:px-2 transition-opacity hover:opacity-80">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-white/90 shadow-[var(--shadow-glow)] ring-1 ring-border/40">
            <Image src="/images/logo-awp.png" alt="AutoWash Pro" width={40} height={40} className="size-full object-contain" />
          </span>
          <span className="hidden flex-col lg:flex">
            <span className="text-sm font-extrabold tracking-tight text-foreground">
              AutoWash <span className="text-primary">Pro</span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">{roleName}</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5">
          {nav.map((item) => {
            const active = pathname === item.href
            const Icon = NAV_ICONS[item.icon]
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium transition-all duration-200 lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm",
                  active
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-slate-50 hover:text-foreground",
                )}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary lg:h-6" />
                )}
                <span className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                  active
                    ? "bg-gradient-to-br from-primary to-sky-500 text-white shadow-[var(--shadow-glow)]"
                    : "group-hover:bg-slate-100"
                )}>
                  <Icon className="size-4" />
                </span>
                <span className="text-center lg:text-left">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-destructive lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-red-100">
            <LogOut className="size-4" />
          </span>
          <span className="hidden lg:inline">Đăng xuất</span>
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar — glassmorphism */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)] md:px-8">
          <Link href="/" className="flex items-center gap-2 md:hidden transition-opacity hover:opacity-80">
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-white/90 shadow-[var(--shadow-glow)] ring-1 ring-border/40">
              <Image src="/images/logo-awp.png" alt="AutoWash Pro" width={36} height={36} className="size-full object-contain" />
            </span>
            <span className="text-sm font-extrabold tracking-tight text-foreground">
              AutoWash <span className="text-primary">Pro</span>
            </span>
          </Link>
          <div className="hidden md:block">
            <p className="text-sm font-bold tracking-tight text-foreground">{roleName}</p>
            <p className="text-xs text-muted-foreground">Chào mừng quay trở lại 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userMeta}</p>
            </div>
            {/* Gradient avatar */}
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-sm font-bold text-white shadow-[var(--shadow-glow)]">
              {userName.charAt(0).toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-destructive"
              title="Đăng xuất"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex items-center gap-1 overflow-x-auto border-b border-border/60 bg-background px-3 py-2 md:hidden">
          {nav.map((item) => {
            const active = pathname === item.href
            const Icon = NAV_ICONS[item.icon]
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-slate-50 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}

