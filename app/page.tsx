import Link from "next/link"
import Image from "next/image"
import {
  Droplets,
  Sofa,
  Wind,
  Sparkles,
  Shield,
  CalendarCheck,
  Bell,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  Star,
  Users,
  Award,
  ThumbsUp,
  Quote,
  ChevronRight,
  Zap,
  Facebook,
  Youtube,
  Instagram,
  Phone,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getServices, getStoreInfo } from "@/lib/api"
import { formatVND } from "@/lib/data"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { CounterAnimation } from "@/components/shared/counter-animation"
import { BeforeAfterSlider } from "@/components/shared/before-after-slider"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { HeaderCTA } from "@/components/shared/header-cta"
import { LogoLink } from "@/components/shared/logo-link"

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const FALLBACK_SERVICES = [
  {
    name: "Rửa xe & combo",
    description: "AW Basic Wash, AW Detail Wash, AW Ultimate Wash",
    icon: Droplets,
    badge: "WASH",
    badgeColor: "bg-primary text-primary-foreground",
    iconColor: "text-primary",
  },
  {
    name: "Vệ sinh nội thất",
    description: "Vệ sinh nội thất Super Clean, khử mùi C-Air Fog",
    icon: Sofa,
    badge: "FLEX",
    badgeColor: "bg-violet-600 text-white",
    iconColor: "text-violet-600",
  },
  {
    name: "Vệ sinh ngoại thất",
    description: "Vệ sinh khoang máy, tẩy nhựa đường, tẩy ố kính",
    icon: Wind,
    badge: "FLEX",
    badgeColor: "bg-violet-600 text-white",
    iconColor: "text-sky-600",
  },
  {
    name: "Xử lý bề mặt",
    description: "Đánh bóng Basic, đánh bóng hiệu chỉnh màu sơn",
    icon: Sparkles,
    badge: "FLEX",
    badgeColor: "bg-violet-600 text-white",
    iconColor: "text-amber-600",
  },
  {
    name: "Bảo vệ sơn xe",
    description: "Phủ ceramic, phủ Nano kính, dán PPF cao cấp",
    icon: Shield,
    badge: "FLEX",
    badgeColor: "bg-violet-600 text-white",
    iconColor: "text-emerald-600",
  },
]

const SOCIAL_PROOF_STATS = [
  { value: 1000, suffix: "+", label: "Khách hàng tin tưởng", icon: Users },
  { value: 4.9, suffix: "★", label: "Điểm đánh giá trung bình", icon: Star, isDecimal: true },
  { value: 50, suffix: "+", label: "Dịch vụ chuyên sâu", icon: Award },
  { value: 99, suffix: "%", label: "Tỷ lệ hài lòng", icon: ThumbsUp },
]

const TESTIMONIALS = [
  {
    name: "Nguyễn Minh Khoa",
    role: "Khách hàng Bạch Kim",
    rating: 5,
    avatar: "NK",
    avatarBg: "bg-violet-600",
    text: "Dịch vụ phủ ceramic ở đây thực sự đỉnh. Xe mình sau khi xong trông như xe mới xuất xưởng. Đặt lịch online siêu tiện, nhân viên chuyên nghiệp và đúng giờ.",
  },
  {
    name: "Trần Thị Lan Anh",
    role: "Khách hàng Vàng",
    rating: 5,
    avatar: "LA",
    avatarBg: "bg-amber-500",
    text: "Mình đã thử nhiều tiệm rửa xe nhưng AutoWash Pro là lần đầu mình thấy hài lòng toàn diện. Nội thất xe sạch bóng, mùi thơm dễ chịu. Sẽ quay lại thường xuyên!",
  },
  {
    name: "Phạm Đức Thắng",
    role: "Khách hàng Bạc",
    rating: 5,
    avatar: "PT",
    avatarBg: "bg-slate-500",
    text: "App đặt lịch dễ dùng, chọn được đúng giờ mình muốn. Nhân viên check-in nhanh, không phải chờ đợi lâu. Tích điểm thành viên là điểm cộng rất lớn!",
  },
]

const BEFORE_AFTER_GALLERY = [
  {
    title: "Rửa xe ngoại thất",
    description: "Làm sạch hoàn toàn bụi bẩn, vết chim và cặn đường",
    before: "/images/before-after-wash.png",
    after: "/images/before-after-wash.png",
    tag: "Rửa xe cơ bản",
  },
  {
    title: "Vệ sinh nội thất",
    description: "Super Clean khôi phục lại vẻ sạch bóng như xe mới",
    before: "/images/before-after-interior.png",
    after: "/images/before-after-interior.png",
    tag: "Interior Detail",
  },
  {
    title: "Phủ Ceramic",
    description: "Bảo vệ sơn xe với lớp coating nano bền vững",
    before: "/images/before-after-ceramic.png",
    after: "/images/before-after-ceramic.png",
    tag: "Ceramic Coating",
  },
]

const TIERS = [
  {
    name: "Thành viên",
    emoji: "🎖️",
    requirement: "Đăng ký mới",
    benefits: ["Tích điểm 1% mỗi giao dịch", "Ưu đãi sinh nhật"],
    border: "border-slate-200 dark:border-slate-700",
    accentColor: "text-slate-600 dark:text-slate-400",
    badge: null,
  },
  {
    name: "Bạc",
    emoji: "🥈",
    requirement: "Từ 500 điểm",
    benefits: ["Tích điểm 2%", "Giảm 5% dịch vụ", "Ưu tiên đặt lịch"],
    border: "border-slate-300 dark:border-slate-600",
    accentColor: "text-slate-700 dark:text-slate-300",
    badge: null,
  },
  {
    name: "Vàng",
    emoji: "🥇",
    requirement: "Từ 2.000 điểm",
    benefits: ["Tích điểm 3%", "Giảm 10% dịch vụ", "Rửa xe miễn phí 1 lần/tháng"],
    border: "border-amber-300 dark:border-amber-700",
    accentColor: "text-amber-700 dark:text-amber-400",
    badge: "Phổ biến nhất",
  },
  {
    name: "Bạch kim",
    emoji: "💎",
    requirement: "Từ 5.000 điểm",
    benefits: ["Tích điểm 5%", "Giảm 15% dịch vụ", "Dịch vụ VIP tận nhà"],
    border: "border-violet-300 dark:border-violet-700",
    accentColor: "text-violet-700 dark:text-violet-400",
    badge: "VIP",
  },
]

const TRUST_STEPS = [
  {
    step: 1,
    icon: CalendarCheck,
    title: "Đặt lịch",
    description: "Chọn dịch vụ và khung giờ phù hợp ngay trên ứng dụng",
    bg: "bg-primary",
  },
  {
    step: 2,
    icon: Bell,
    title: "Nhận nhắc lịch",
    description: "Hệ thống tự động gửi thông báo nhắc lịch trước 2 giờ",
    bg: "bg-primary",
  },
  {
    step: 3,
    icon: CheckCircle2,
    title: "Xác nhận & tích điểm",
    description: "Check-in khi đến và nhận điểm thưởng ngay sau dịch vụ",
    bg: "bg-primary",
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryStyle(name: string, isWash: boolean) {
  if (isWash) return { icon: Droplets, badge: "WASH", badgeColor: "bg-primary text-primary-foreground", iconColor: "text-primary" }
  const lowerName = name.toLowerCase()
  if (lowerName.includes("trong") || lowerName.includes("nội thất"))
    return { icon: Sofa, badge: "FLEX", badgeColor: "bg-violet-600 text-white", iconColor: "text-violet-600" }
  if (lowerName.includes("ngoài") || lowerName.includes("khoang"))
    return { icon: Wind, badge: "FLEX", badgeColor: "bg-violet-600 text-white", iconColor: "text-sky-600" }
  if (lowerName.includes("bề mặt") || lowerName.includes("đánh bóng"))
    return { icon: Sparkles, badge: "FLEX", badgeColor: "bg-violet-600 text-white", iconColor: "text-amber-600" }
  return { icon: Shield, badge: "FLEX", badgeColor: "bg-violet-600 text-white", iconColor: "text-emerald-600" }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function LandingPage() {
  let storeInfo = {
    name: "AutoWash Pro",
    address: "7 Đ. D1, Tăng Nhơn Phú, Hồ Chí Minh 700000, Việt Nam",
    phone: "07:00 – 17:30 hàng ngày",
  }
  let displayServices: typeof FALLBACK_SERVICES = []

  try {
    const rawStore = await getStoreInfo()
    if (rawStore) storeInfo = { name: rawStore.name, address: rawStore.address, phone: rawStore.phone }
  } catch { /* use fallback */ }

  try {
    const categories = await getServices({ vehicle_size: "MEDIUM" })
    if (categories?.length > 0) {
      displayServices = categories.map((cat) => {
        const style = getCategoryStyle(cat.name, cat.is_wash_group)
        const serviceNames = cat.services.map((s) => s.name).slice(0, 3).join(", ")
        const prices = cat.services.map((s) => s.price).filter((p) => p > 0)
        return {
          name: cat.name,
          description: serviceNames || "Các dịch vụ chăm sóc chuyên sâu",
          icon: style.icon,
          badge: style.badge,
          badgeColor: style.badgeColor,
          iconColor: style.iconColor,
          priceRange: prices.length > 0 ? `Từ ${formatVND(Math.min(...prices))}` : "",
        }
      })
    }
  } catch { /* use fallback */ }

  if (displayServices.length === 0) displayServices = FALLBACK_SERVICES

  return (
    <main className="min-h-screen bg-background">

      {/* ================================================================
          HEADER — Frosted glass, transparent on load
          ================================================================ */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all duration-300 dark:border-white/8 dark:bg-[#09090f]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <LogoLink />

          {/* Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: "#dich-vu", label: "Dịch vụ" },
              { href: "#ket-qua", label: "Kết quả" },
              { href: "#danh-gia", label: "Đánh giá" },
              { href: "#thanh-vien", label: "Thành viên" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <HeaderCTA />
          </div>
        </div>
      </header>

      {/* ================================================================
          HERO — Cinematic full-bleed image (Tesla-inspired)
          ================================================================ */}
      <section className="relative min-h-[85vh] overflow-hidden flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-car.png"
            alt="AutoWash Pro — premium car wash studio"
            fill
            priority
            className="object-cover object-center"
            quality={90}
          />
          {/* Single bottom vignette — keeps image pure, text readable */}
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* Floating accent bubbles */}
        <div className="pointer-events-none absolute top-24 right-[8%] hidden xl:block">
          <div className="animate-float-slow flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-card/60 shadow-[var(--shadow-glow)] backdrop-blur-sm">
            <Sparkles className="size-6 text-primary" />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-32 right-[18%] hidden xl:block">
          <div className="animate-float flex size-11 items-center justify-center rounded-xl border border-sky-300/20 bg-card/50 shadow-[var(--shadow-md)] backdrop-blur-sm" style={{ animationDelay: "1.2s" }}>
            <Shield className="size-5 text-sky-400" />
          </div>
        </div>

        {/* Content */}
        <div className="relative mx-auto w-full max-w-6xl px-6 py-28">
          <div className="max-w-2xl">
            {/* Label */}
            <div className="animate-fade-in-down mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md">
                <Zap className="size-3 fill-current" />
                Hệ thống đặt lịch rửa xe #1 TP.HCM
              </span>
            </div>

            {/* Headline — white text floats over image like Tesla/Porsche hero */}
            <h1 className="animate-fade-in-up text-balance text-5xl font-extrabold tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)] md:text-7xl lg:text-[80px] leading-[1.05]">
              Xe sạch
              <br />
              <span className="gradient-text-animated">đỉnh cao.</span>
              <br />
              <span className="text-4xl font-bold text-white/85 md:text-5xl lg:text-6xl">Đặt lịch dễ dàng.</span>
            </h1>

            {/* Sub */}
            <p className="animate-fade-in-up mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]" style={{ animationDelay: "0.1s" }}>
              Từ rửa xe cơ bản đến phủ ceramic cao cấp — chọn dịch vụ, chọn giờ,
              đến và nhận xe bóng loáng.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up mt-10 flex flex-wrap gap-4" style={{ animationDelay: "0.2s" }}>
              <Link href="/customer/dat-lich">
                <Button
                  size="lg"
                  className="gap-2 rounded-2xl bg-gradient-to-r from-primary to-sky-500 px-8 py-6 text-base font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-300 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-1 dark:from-sky-400 dark:to-blue-400 dark:text-slate-900"
                >
                  Đặt lịch ngay
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#dich-vu">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-2xl border-white/40 bg-white/10 px-8 py-6 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/70 hover:bg-white/20"
                >
                  Xem dịch vụ
                  <ChevronRight className="size-4" />
                </Button>
              </a>
            </div>

            {/* Trust micro-badges */}
            <div className="animate-fade-in-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.3s" }}>
              {[
                "⭐ Đánh giá 4.9/5",
                "🔒 Đặt lịch miễn phí",
                "⚡ Xác nhận ngay lập tức",
                "🎁 Tích điểm mỗi lần dùng",
              ].map((badge) => (
                <span key={badge} className="inline-flex items-center rounded-full border border-white/15 bg-black/35 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SOCIAL PROOF — Counter stats (Stripe-inspired)
          ================================================================ */}
      <section className="border-y border-border/50 bg-background py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {SOCIAL_PROOF_STATS.map((stat, i) => {
              const Icon = stat.icon
              return (
                <ScrollReveal key={stat.label} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/8">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <div className="stat-value text-4xl">
                      {stat.isDecimal ? (
                        <span>{stat.value}{stat.suffix}</span>
                      ) : (
                        <CounterAnimation target={stat.value as number} suffix={stat.suffix} duration={1800} />
                      )}
                    </div>
                    <div className="stat-label mt-1">{stat.label}</div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          SERVICES — Premium Bento Grid (Linear-inspired)
          ================================================================ */}
      <section id="dich-vu" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <span className="section-label mb-4 inline-flex">Dịch vụ</span>
              <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Chăm sóc xe toàn diện
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
                Từ rửa xe cơ bản đến phủ ceramic cao cấp — mọi nhu cầu đều được đáp ứng
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayServices.map((service, idx) => {
              const Icon = service.icon
              const isLarge = idx === 0
              return (
                <ScrollReveal key={service.name} delay={idx * 0.08} className={isLarge ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
                  <div
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div>
                      <div className="mb-5 flex items-start justify-between">
                        {/* Icon — solid bg, no gradient */}
                        <span className={`flex size-12 items-center justify-center rounded-xl bg-primary/8 ${(service as any).iconColor ?? "text-primary"}`}>
                          <Icon className="size-5" />
                        </span>
                        {/* Badge + Price */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${service.badgeColor}`}>
                            {service.badge}
                          </span>
                          {(service as { priceRange?: string }).priceRange && (
                            <span className="text-xs font-medium text-muted-foreground">
                              {(service as { priceRange?: string }).priceRange}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{service.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                    </div>

                    <div className="mt-6">
                      <Link
                        href="/customer/dat-lich"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-200 hover:gap-3"
                      >
                        Đặt lịch ngay
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          BEFORE / AFTER GALLERY — Ceramic Pro-inspired
          ================================================================ */}
      <section id="ket-qua" className="bg-slate-50/60 py-20 md:py-28 dark:bg-card/40">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <span className="section-label mb-4 inline-flex">Kết quả thực tế</span>
              <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Trước & Sau khi dùng dịch vụ
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
                Kéo thanh trượt để xem sự khác biệt — kết quả nói lên tất cả
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {BEFORE_AFTER_GALLERY.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.12}>
                <div className="group overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
                  <div className="relative h-56 overflow-hidden">
                    <BeforeAfterSlider
                      beforeSrc={item.before}
                      afterSrc={item.after}
                      alt={item.title}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-bold text-foreground">{item.title}</h3>
                      <span className="badge badge-primary text-xs">{item.tag}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS — Airbnb-style review cards
          ================================================================ */}
      <section id="danh-gia" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <span className="section-label mb-4 inline-flex">Đánh giá</span>
              <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Khách hàng nói gì về chúng tôi
              </h2>
              <div className="mt-4 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 font-semibold text-foreground">4.9</span>
                <span className="text-muted-foreground">/5 · 1,000+ đánh giá</span>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((review, i) => (
              <ScrollReveal key={review.name} delay={i * 0.1}>
                <div className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[var(--shadow-glow)]">
                  {/* Quote icon */}
                  <Quote className="mb-4 size-8 text-primary/20" />

                  {/* Review text */}
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground italic">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Rating */}
                  <div className="mt-4 flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="mt-4 flex items-center gap-3 border-t border-border/50 pt-4">
                    <div className={`flex size-10 items-center justify-center rounded-full ${review.avatarBg} text-xs font-bold text-white`}>
                      {review.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{review.name}</div>
                      <div className="text-xs text-muted-foreground">{review.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          MEMBERSHIP TIERS — Upgraded cards
          ================================================================ */}
      <section id="thanh-vien" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <span className="section-label mb-4 inline-flex">Thành viên</span>
              <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Hạng thành viên & ưu đãi
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
                Tích điểm mỗi lần sử dụng dịch vụ, nâng hạng và mở khóa những đặc quyền hấp dẫn
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier, i) => (
              <ScrollReveal key={tier.name} delay={i * 0.1}>
                <div
                  className={`relative flex flex-col rounded-2xl border-2 ${tier.border} bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] ${tier.badge === "Phổ biến nhất" ? "ring-2 ring-amber-300" : ""}`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${tier.badge === "Phổ biến nhất" ? "bg-amber-400 text-amber-950" : "bg-violet-600 text-white"}`}>
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-3 text-3xl">{tier.emoji}</div>
                  <h3 className={`text-lg font-extrabold text-foreground`}>{tier.name}</h3>
                  <p className={`mt-1 text-xs font-medium ${tier.accentColor}`}>{tier.requirement}</p>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${tier.accentColor}`} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS — Tesla-style connected steps
          ================================================================ */}
      <section id="quy-trinh" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-14 text-center">
              <span className="section-label mb-4 inline-flex">Quy trình</span>
              <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Chỉ 3 bước đơn giản
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
                Quy trình minh bạch — từ đặt lịch đến tích điểm trong vài phút
              </p>
            </div>
          </ScrollReveal>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connecting line — simple border */}
            <div className="absolute top-10 left-[16.67%] right-[16.67%] hidden h-px bg-border md:block" />

            {TRUST_STEPS.map((item, i) => {
              const Icon = item.icon
              return (
                <ScrollReveal key={item.step} delay={i * 0.15}>
                  <div className="group flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="animate-pulse-ring absolute inset-0 rounded-full bg-primary/20" />
                      <span className={`relative flex size-20 items-center justify-center rounded-full ${item.bg} text-white shadow-[var(--shadow-glow)] transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="size-9" />
                      </span>
                    </div>

                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Bước {item.step}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA BANNER — Stripe-inspired gradient section
          ================================================================ */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="rounded-3xl bg-primary p-12 text-center">
              <div className="relative">
                <h2 className="text-balance text-3xl font-extrabold text-white md:text-5xl">
                  Xe của bạn xứng đáng được chăm sóc tốt nhất
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-white/80 md:text-lg">
                  Đặt lịch ngay hôm nay — miễn phí, nhanh chóng, và nhận điểm thưởng sau mỗi lần dùng dịch vụ.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link href="/customer/dat-lich">
                    <Button size="lg" className="rounded-2xl bg-white px-8 py-6 text-base font-semibold text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      Đặt lịch miễn phí
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                  <Link href="/customer">
                    <Button size="lg" variant="ghost" className="rounded-2xl px-8 py-6 text-base font-semibold text-white/90 hover:bg-white/15 hover:text-white">
                      Đăng nhập tài khoản
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          FOOTER — Multi-column, upgraded
          ================================================================ */}
      <footer className="border-t border-border bg-slate-50 py-14 dark:bg-card/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <LogoLink />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Hệ thống đặt lịch rửa xe và chăm sóc xe cao cấp hàng đầu tại TP.HCM.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex size-8 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/25 transition-colors" title="Facebook">
                  <Facebook className="size-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex size-8 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/25 transition-colors" title="YouTube">
                  <Youtube className="size-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex size-8 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/25 transition-colors" title="Instagram">
                  <Instagram className="size-4" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Dịch vụ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Rửa xe & Combo", "Vệ sinh nội thất", "Vệ sinh ngoại thất", "Xử lý bề mặt", "Phủ Ceramic & PPF"].map((s) => (
                  <li key={s}>
                    <a href="#dich-vu" className="transition-colors hover:text-foreground">{s}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Liên hệ</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>7 Đ. D1, Tăng Nhơn Phú, Hồ Chí Minh 700000, Việt Nam</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <a href="tel:0901234567" className="hover:text-foreground">090 123 4567</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-primary" />
                  <a href="mailto:contact@autowashpro.com" className="hover:text-foreground">contact@autowashpro.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="size-4 shrink-0 text-primary" />
                  <span>07:00 – 17:30, Thứ 2 – CN</span>
                </li>
              </ul>
            </div>

            {/* Google Map */}
            <div className="space-y-3 md:col-span-1">
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Bản đồ</h4>
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm h-52 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4853986869424!2d106.80479137457788!3d10.849156057819077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb7f12b7752e5d59a!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!2svi!2s!4v1717770000000!5m2!2svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="AutoWash Pro Google Map Location"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="section-divider mt-10" />
          <div className="mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-between">
            <p className="text-xs text-muted-foreground">© 2026 AutoWash Pro. Bản quyền thuộc về AutoWash Pro.</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">Chính sách bảo mật</a>
              <a href="#" className="transition-colors hover:text-foreground">Điều khoản dịch vụ</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
