"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { logout, getMe, getMyProfile } from "@/lib/api"
import type { CustomerProfile } from "@/lib/types"
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
  Plus,
  Award,
  ShieldCheck,
  Sparkles,
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
  const [dynUserName, setDynUserName] = useState(userName)
  const [dynUserMeta, setDynUserMeta] = useState(userMeta)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setDynUserName(userName)
  }, [userName])

  useEffect(() => {
    setDynUserMeta(userMeta)
  }, [userMeta])

  const [customAvatar, setCustomAvatar] = useState<string | null>(null)

  useEffect(() => {
    const updateAvatar = () => {
      const saved = localStorage.getItem("aw_user_avatar")
      if (saved) setCustomAvatar(saved)
    }
    updateAvatar()
    window.addEventListener("avatar_updated", updateAvatar)
    return () => window.removeEventListener("avatar_updated", updateAvatar)
  }, [])

  const [profile, setProfile] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    let active = true
    async function loadCustomerProfile() {
      if (!pathname.startsWith("/customer")) return
      try {
        const data = await getMyProfile()
        if (data && active) setProfile(data)
      } catch {
        // Silent catch
      }
    }
    loadCustomerProfile()
    return () => { active = false }
  }, [pathname])

  useEffect(() => {
    let active = true
    async function loadUser() {
      try {
        const res = await getMe()
        if (res && active) {
          const name = res.fullName || res.FullName || res.name || res.full_name
          if (name) {
            setDynUserName(name)
          }
          const role = res.role || res.Role
          if (role) {
            setUserRole(role)
            if (role === "ADMIN") {
              setDynUserMeta("Quản trị viên hệ thống")
            } else if (role === "MANAGER") {
              setDynUserMeta("Quản lý chi nhánh")
            } else if (role === "CAR_WASHER") {
              setDynUserMeta("Thợ rửa xe")
            }
          }
        }
      } catch (e) {
        console.warn("Failed to fetch user in PortalShell:", e)
      }
    }
    loadUser()
    return () => {
      active = false
    }
  }, [])

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
      {/* Sidebar - Cấu Trúc Kính 272px với Dải Viền 4px Gradient Trắng -> Xám */}
      <aside
        style={{ width: '272px', minWidth: '272px' }}
        className="sticky top-0 hidden h-screen w-68 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white/95 backdrop-blur-xl py-6 px-4 shadow-[14px_0_32px_-6px_rgba(0,0,0,0.04)] z-30 md:flex transition-all duration-300 relative overflow-hidden"
      >
        {/* Dải Viền 4px Gradient Trắng -> Xám Dọc Mép Phải */}
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-[4px] bg-gradient-to-r from-white via-slate-200/90 to-slate-400/50 z-20" />
        {/* Subtle Top Specular Line */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1px] bg-slate-200/60 z-20" />

        <div className="flex flex-col gap-6">
          {/* Logo với hiệu ứng 3D Ambient Glow & Hover Tilt */}
          <Link href="/" className="group flex items-center gap-3 px-2 transition-transform duration-300 hover:scale-[1.02]">
            <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-border/40 transition-all duration-300 group-hover:rotate-6 group-hover:shadow-primary/30 group-hover:ring-primary/50">
              <Image src="/images/logo-awp.png" alt="AutoWash Pro" width={40} height={40} className="size-full object-contain transition-transform duration-300 group-hover:scale-110" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
                AutoWash <span className="text-primary">Pro</span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">{roleName}</span>
            </span>
          </Link>

          <nav className="flex flex-col gap-1.5">
            {nav.map((item) => {
              const active = pathname === item.href
              const Icon = NAV_ICONS[item.icon]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200 overflow-hidden",
                    active
                      ? "bg-slate-100/90 text-primary font-extrabold shadow-2xs border border-slate-200/60"
                      : "text-slate-600 hover:bg-slate-100/60 hover:text-foreground",
                  )}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-primary shadow-2xs" />
                  )}
                  <span className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                    active
                      ? "bg-gradient-to-br from-primary to-sky-500 text-white shadow-sm shadow-primary/25"
                      : "group-hover:bg-slate-200/60"
                  )}>
                    <Icon className="size-4" />
                  </span>
                  <span className="font-bold text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Bottom VIP Profile Widget - Horizontal Row Layout */}
        <div className="mt-auto flex flex-col gap-3 p-3.5 rounded-2xl bg-slate-50/90 backdrop-blur-md border border-slate-200/80 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* Avatar Preview with Role / Tier Ring */}
            <div className="shrink-0">
              <div className={cn(
                "size-10 rounded-full flex items-center justify-center overflow-hidden text-white font-extrabold text-xs p-0.5 shadow-xs",
                userRole === "ADMIN" && "bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-700",
                userRole === "MANAGER" && "bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600",
                userRole === "CAR_WASHER" && "bg-gradient-to-tr from-blue-600 via-sky-400 to-cyan-500",
                !userRole && (profile?.membership_tier || "MEMBER") === "PLATINUM" && "bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400",
                !userRole && (profile?.membership_tier || "MEMBER") === "GOLD" && "bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600",
                !userRole && (profile?.membership_tier || "MEMBER") === "SILVER" && "bg-gradient-to-tr from-slate-400 via-cyan-300 to-slate-500",
                !userRole && (profile?.membership_tier || "MEMBER") === "MEMBER" && "bg-gradient-to-tr from-primary via-sky-400 to-blue-600"
              )}>
                <div className="size-full rounded-full overflow-hidden flex items-center justify-center bg-slate-900 text-white font-bold text-xs">
                  {customAvatar ? (
                    <img src={customAvatar} alt={dynUserName} className="size-full object-cover" />
                  ) : (
                    dynUserName.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col min-w-0">
              <p className="text-xs font-extrabold text-foreground truncate">{dynUserName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {userRole === "ADMIN" ? (
                  <span className="text-[10px] font-black text-purple-700 bg-purple-100 border border-purple-200/80 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                    <span>ADMIN</span>
                    <span className="text-[10px]">🛡️</span>
                  </span>
                ) : userRole === "MANAGER" ? (
                  <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-200/80 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                    <span>MANAGER</span>
                    <span className="text-[10px]">👔</span>
                  </span>
                ) : userRole === "CAR_WASHER" ? (
                  <span className="text-[10px] font-black text-blue-700 bg-blue-100 border border-blue-200/80 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                    <span>WASHER</span>
                    <span className="text-[10px]">🚿</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                    <span>{profile?.membership_tier || "MEMBER"}</span>
                    <span className="text-[10px]">
                      {(profile?.membership_tier || "MEMBER") === "PLATINUM" || (profile?.membership_tier || "MEMBER") === "GOLD" ? "👑" : "🌟"}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-border/60">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20"
              title="Đăng xuất"
            >
              <LogOut className="size-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar — Floating Glassmorphism Header */}
        <header className={cn(
          "sticky top-0 z-20 flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] md:px-8",
          pathname.startsWith("/customer") && "md:hidden"
        )}>
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
            {/* Quick 1-Touch Booking Button for Customer */}
            {pathname.startsWith("/customer") && (
              <Link
                href="/customer/dat-lich"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
              >
                <Plus className="size-3.5 stroke-[3]" />
                Đặt lịch rửa xe
              </Link>
            )}

            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-foreground flex items-center gap-1 justify-end">
                {dynUserName}
                {profile?.membership_tier === "PLATINUM" || profile?.membership_tier === "GOLD" ? (
                  <span className="text-xs" title="Thành viên VIP">👑</span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">{dynUserMeta}</p>
            </div>
            {/* Gradient / Image avatar */}
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-sm font-bold text-white shadow-[var(--shadow-glow)] overflow-hidden ring-2 ring-primary/20">
              {customAvatar ? (
                <img src={customAvatar} alt={dynUserName} className="size-full object-cover" />
              ) : (
                dynUserName.charAt(0).toUpperCase()
              )}
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

