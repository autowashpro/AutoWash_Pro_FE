import Link from "next/link"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left: Brand + Premium Content */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Deep dark carbon background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#09090f] via-[#0d1017] to-[#0a0e18]" />

        {/* Animated gradient mesh overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/5 blur-3xl" />
          <div className="absolute right-20 top-20 h-48 w-48 rounded-full bg-indigo-500/8 blur-2xl" />
          <div className="absolute bottom-32 left-20 h-36 w-36 rounded-full bg-blue-400/8 blur-2xl" />
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-10 px-12 text-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_0_32px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform duration-300 border border-white/10 dark:bg-white/95">
              <Image src="/images/logo-awp.png" alt="AutoWash Pro Logo" width={56} height={56} className="size-full object-contain" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">
              AutoWash <span className="text-sky-400">Pro</span>
            </span>
          </Link>

          {/* Tagline */}
          <div className="max-w-sm">
            <p className="text-xl font-semibold text-white/90 leading-snug">
              Rửa xe cao cấp.
              <br />
              <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                Đặt lịch thông minh.
              </span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Trải nghiệm dịch vụ rửa xe chuyên nghiệp với hệ thống đặt lịch tiện lợi.
            </p>
          </div>

          {/* Stat / Trust Cards */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {/* Card 1 */}
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 backdrop-blur-sm">
              <span className="text-xl font-bold text-white">1,000+</span>
              <span className="text-[11px] leading-tight text-white/50 text-center">xe phục vụ</span>
            </div>
            {/* Card 2 */}
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 backdrop-blur-sm">
              <span className="text-xl font-bold text-white">4.9★</span>
              <span className="text-[11px] leading-tight text-white/50 text-center">đánh giá</span>
            </div>
            {/* Card 3 */}
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 backdrop-blur-sm">
              <span className="text-xl font-bold text-white">5 năm</span>
              <span className="text-[11px] leading-tight text-white/50 text-center">kinh nghiệm</span>
            </div>
          </div>

          {/* Testimonial */}
          <div className="max-w-sm rounded-2xl border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-sm text-left">
            <p className="text-sm italic leading-relaxed text-white/70">
              &ldquo;AutoWash Pro giúp tôi tiết kiệm hàng giờ mỗi tháng — đặt lịch nhanh, dịch vụ chuyên nghiệp và luôn đúng giờ.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              {/* Avatar placeholder */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                N
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">Nguyễn Minh Tâm</p>
                <p className="text-xs text-white/40">Khách hàng thân thiết</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex flex-col bg-background dark:bg-[#09090f]">
        {/* Mobile header */}
        <Link href="/" className="flex items-center justify-center gap-2.5 border-b border-border bg-card dark:bg-[#0d1017] p-4 lg:hidden transition-opacity hover:opacity-80">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-white border border-border/40">
            <Image src="/images/logo-awp.png" alt="AutoWash Pro Logo" width={28} height={28} className="size-full object-contain" />
          </div>
          <span className="text-lg font-bold text-foreground">
            AutoWash <span className="text-primary">Pro</span>
          </span>
        </Link>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
