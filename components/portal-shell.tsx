"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { logout } from "@/lib/api"
import {
  Droplets,
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
      <aside className="sticky top-0 hidden h-screen w-20 flex-col items-center gap-1 border-r border-border bg-sidebar py-6 md:flex lg:w-60 lg:items-stretch lg:px-4">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2 lg:px-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Droplets className="size-5" />
          </span>
          <span className="hidden flex-col lg:flex">
            <span className="text-sm font-bold tracking-tight text-foreground">AutoWash Pro</span>
            <span className="text-xs text-muted-foreground">{roleName}</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href
            const Icon = NAV_ICONS[item.icon]
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium transition-colors lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span className="text-center lg:text-left">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        <button
          onClick={handleLogout}
          className="mt-auto flex w-full items-center justify-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium text-destructive hover:bg-destructive/10 transition-colors lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm"
        >
          <LogOut className="size-5 shrink-0" />
          <span className="hidden lg:inline">Đăng xuất</span>
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Droplets className="size-4" />
            </span>
            <span className="text-sm font-bold tracking-tight">AutoWash Pro</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold tracking-tight text-foreground">{roleName}</p>
            <p className="text-xs text-muted-foreground">Chào mừng quay trở lại</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userMeta}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
              {userName.charAt(0)}
            </span>
            <button
              onClick={handleLogout}
              className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex items-center gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2 md:hidden">
          {nav.map((item) => {
            const active = pathname === item.href
            const Icon = NAV_ICONS[item.icon]
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground",
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
