import { NextRequest, NextResponse } from "next/server"
import type { UserRole } from "@/lib/types"

// ─────────────────────────────────────────
// Route config — định nghĩa các nhóm route
// ─────────────────────────────────────────

/** Các route yêu cầu phải đăng nhập */
const PROTECTED_PREFIXES = ["/customer", "/admin", "/manager", "/washer"]

/** Các route chỉ dành cho user CHƯA đăng nhập (khi đã đăng nhập → redirect về portal) */
const AUTH_ROUTES = ["/auth/dang-nhap", "/auth/dang-ky"]

/** Map role → portal prefix */
const ROLE_PORTAL: Record<UserRole, string> = {
  CUSTOMER:   "/customer",
  ADMIN:      "/admin",
  MANAGER:    "/manager",
  CAR_WASHER: "/washer",
}

// ─────────────────────────────────────────
// Proxy (Next.js 16 Middleware)
// ─────────────────────────────────────────

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Đọc token từ cookie (server-side) hoặc header Authorization
  // Token được lưu ở localStorage (client-side) nên middleware kiểm tra
  // thông qua cookie "aw_role" được set khi đăng nhập thành công
  const roleFromCookie = req.cookies.get("aw_role")?.value as UserRole | undefined
  const hasToken = !!req.cookies.get("aw_access_token")?.value

  const isAuthenticated = hasToken && !!roleFromCookie

  // ── 1. User đã đăng nhập cố vào trang auth → redirect về portal
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const portalPath = ROLE_PORTAL[roleFromCookie!] ?? "/customer"
    return NextResponse.redirect(new URL(portalPath, req.url))
  }

  // ── 2. User chưa đăng nhập cố vào protected route → redirect login
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/auth/dang-nhap", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 3. User đúng role mới được vào portal tương ứng
  if (isAuthenticated && roleFromCookie) {
    const expectedPrefix = ROLE_PORTAL[roleFromCookie]
    const isWrongPortal = PROTECTED_PREFIXES.some(
      (p) => pathname.startsWith(p) && p !== expectedPrefix
    )
    if (isWrongPortal) {
      return NextResponse.redirect(new URL(expectedPrefix, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match tất cả request trừ:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - files trong /public
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
