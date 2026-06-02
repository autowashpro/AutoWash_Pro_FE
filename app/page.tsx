import Link from "next/link"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"

const SERVICES = [
  {
    name: "Rửa xe & combo",
    description: "Gói rửa toàn diện từ cơ bản đến cao cấp",
    icon: Droplets,
    badge: "WASH",
    badgeColor: "bg-primary text-primary-foreground",
  },
  {
    name: "Vệ sinh trong",
    description: "Hút bụi, làm sạch nội thất, khử mùi",
    icon: Sofa,
    badge: "FLEX",
    badgeColor: "bg-flex text-flex-foreground",
  },
  {
    name: "Vệ sinh ngoài",
    description: "Tẩy bụi công nghiệp, nhựa đường, ố vàng",
    icon: Wind,
    badge: "FLEX",
    badgeColor: "bg-flex text-flex-foreground",
  },
  {
    name: "Xử lý bề mặt",
    description: "Đánh bóng, xử lý xoáy, phục hồi sơn",
    icon: Sparkles,
    badge: "FLEX",
    badgeColor: "bg-flex text-flex-foreground",
  },
  {
    name: "Bảo vệ",
    description: "Phủ ceramic, coating, bảo vệ sơn xe",
    icon: Shield,
    badge: "FLEX",
    badgeColor: "bg-flex text-flex-foreground",
  },
]

const TIERS = [
  {
    name: "Thành viên",
    requirement: "Đăng ký mới",
    benefits: ["Tích điểm 1% mỗi giao dịch", "Ưu đãi sinh nhật"],
    color: "bg-muted",
    textColor: "text-foreground",
    border: "border-border",
  },
  {
    name: "Bạc",
    requirement: "Từ 500 điểm",
    benefits: ["Tích điểm 2%", "Giảm 5% dịch vụ", "Ưu tiên đặt lịch"],
    color: "bg-gradient-to-br from-slate-200 to-slate-400",
    textColor: "text-slate-900",
    border: "border-slate-300",
  },
  {
    name: "Vàng",
    requirement: "Từ 2.000 điểm",
    benefits: ["Tích điểm 3%", "Giảm 10% dịch vụ", "Rửa xe miễn phí 1 lần/tháng"],
    color: "bg-gradient-to-br from-amber-300 to-amber-500",
    textColor: "text-amber-950",
    border: "border-amber-400",
  },
  {
    name: "Bạch kim",
    requirement: "Từ 5.000 điểm",
    benefits: ["Tích điểm 5%", "Giảm 15% dịch vụ", "Dịch vụ VIP tận nhà"],
    color: "bg-gradient-to-br from-violet-300 to-violet-500",
    textColor: "text-violet-950",
    border: "border-violet-400",
  },
]

const TRUST_STEPS = [
  {
    step: 1,
    icon: CalendarCheck,
    title: "Đặt lịch",
    description: "Chọn dịch vụ và khung giờ phù hợp qua ứng dụng",
  },
  {
    step: 2,
    icon: Bell,
    title: "Nhận nhắc",
    description: "Hệ thống gửi thông báo nhắc lịch trước 2 giờ",
  },
  {
    step: 3,
    icon: CheckCircle2,
    title: "Xác nhận",
    description: "Check-in khi đến và nhận điểm thưởng sau dịch vụ",
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Droplets className="size-5" />
            </span>
            <span className="text-base font-bold tracking-tight text-foreground">AutoWash Pro</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#dich-vu" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Dịch vụ
            </a>
            <a href="#thanh-vien" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Thành viên
            </a>
            <a href="#quy-trinh" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Quy trình
            </a>
          </nav>
          <Link href="/customer">
            <Button size="sm">Đăng nhập</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Rửa xe đỉnh cao.
              <br />
              <span className="text-primary">Đặt lịch dễ dàng.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Hệ thống đặt lịch thông minh — chọn dịch vụ, chọn giờ, đến rửa xe.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/customer/dat-lich">
                <Button size="lg" className="gap-2 px-8">
                  Đặt lịch ngay
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#dich-vu">
                <Button size="lg" variant="outline" className="px-8">
                  Xem dịch vụ
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section id="dich-vu" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Dịch vụ chăm sóc xe toàn diện
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Từ rửa xe cơ bản đến phủ ceramic cao cấp, đáp ứng mọi nhu cầu của bạn
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon
              const isLarge = idx === 0
              return (
                <div
                  key={service.name}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 ${
                    isLarge ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""
                  }`}
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${service.badgeColor}`}>
                        {service.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/customer/dat-lich"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Đặt lịch
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section id="thanh-vien" className="bg-muted/50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Hạng thành viên
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Tích điểm qua mỗi lần sử dụng dịch vụ, nâng hạng và nhận ưu đãi hấp dẫn
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-6 ${tier.border} ${tier.color} ${tier.textColor}`}
              >
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <p className="mt-1 text-sm opacity-80">{tier.requirement}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Score Section */}
      <section id="quy-trinh" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Hệ thống uy tín
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Quy trình đặt lịch minh bạch, giúp bạn an tâm và tiết kiệm thời gian
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TRUST_STEPS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center"
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="size-7" />
                  </span>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Bước {item.step}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Droplets className="size-5" />
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">AutoWash Pro</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground md:flex-row md:gap-6">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                123 Nguyễn Văn Linh, Quận 7, TP.HCM
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                7:00 – 17:30 hàng ngày
              </span>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            © 2026 AutoWash Pro. Bản quyền thuộc về AutoWash Pro.
          </div>
        </div>
      </footer>
    </main>
  )
}
