'use client'

import React from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { HeroCinematicStoryboard } from '@/components/shared/hero-cinematic-storyboard'
import { HorizontalShowroomTrack } from '@/components/shared/horizontal-showroom-track'
import { CurtainCard } from '@/components/shared/curtain-reveal-section'
import { AppleScrollAnatomy } from '@/components/shared/apple-scroll-anatomy'
import { BeforeAfterSlider } from '@/components/shared/before-after-slider'
import { SpotlightCard } from '@/components/shared/spotlight-card'
import { CounterAnimation } from '@/components/shared/counter-animation'
import { MagneticButton } from '@/components/shared/magnetic-button'
import {
  Layers,
  Award,
  FlaskConical,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Car,
  Shield,
  Gauge,
  Flame,
} from 'lucide-react'

const SOCIAL_PROOF_STATS = [
  { icon: Car, value: 8500, suffix: '+', label: 'Xe đã chăm sóc', sub: 'SIÊU XE & XE SANG' },
  { icon: Shield, value: 100, suffix: '%', label: 'Hài lòng khách hàng', sub: 'IDA STANDARDS' },
  { icon: Gauge, value: 4.9, suffix: '/5', label: 'Đánh giá Google Maps', sub: 'TỪ 1200+ CHỦ XE' },
  { icon: Flame, value: 12, suffix: ' năm', label: 'Kinh nghiệm trưởng xưởng', sub: 'MASTER DETAILINGS' },
]

const PARTNER_LABS = [
  { name: "Koch-Chemie", origin: "Germany", role: "Hóa chất Detailing đạt chuẩn Mercedes-Benz / BMW", desc: "Dung dịch bọt tuyết Gentle Snow Foam pH trung tính, hoàn toàn không gây ố mốc nẹp crom hay làm xỉn màu màng sơn zin." },
  { name: "Rupes", origin: "Italy", role: "Hệ thống máy đánh bóng quỹ đạo kép Dual-Action", desc: "Độ lệch tâm 21mm cắt xoáy nhện êm ái, giảm thiểu nhiệt độ ma sát, tuyệt đối không gây cháy sơn hay holographic bóng ma." },
  { name: "Scangrip", origin: "Denmark", role: "Giàn đèn rọi khuyết tật CRI 96+ đa nhiệt độ màu", desc: "Phát hiện từng vết xước siêu vi dưới dải sáng 2700K - 6500K tương đương ánh sáng mặt trời giữa trưa." },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#06070d] text-slate-900 dark:text-white overflow-x-clip transition-colors duration-500">
      {/* 1. Global Header */}
      <PublicHeader />

      {/* 2. 3D Cinematic Storyboard Hero */}
      <HeroCinematicStoryboard />

      {/* 3. Horizontal Showroom Track */}
      <HorizontalShowroomTrack />

      {/* 4. Curtain Stacking Parallax Sections */}
      <div className="relative z-10 w-full pt-12 pb-24 space-y-8">
        {/* Curtain Card 1: Apple Scroll Anatomy */}
        <CurtainCard index={0} total={4}>
          <div className="text-center max-w-4xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 font-mono text-xs font-bold uppercase text-sky-600 dark:text-sky-400">
              <Layers className="size-3.5" />
              ANATOMY OF CAR PAINT CORRECTION
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Giải phẫu tầng sơn & Nghệ thuật lột xác.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Mỗi chiếc xe sang sở hữu màng sơn bóng Clear Coat dày chỉ 40-50 micron. Quy trình thi công của chúng tôi bảo vệ từng micromet giá trị ấy.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/40 p-2 sm:p-6">
            <AppleScrollAnatomy />
          </div>
        </CurtainCard>

        {/* Curtain Card 2: Lab Metrics & Social Proof */}
        <CurtainCard index={1} total={4}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 font-mono text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
              <Award className="size-3.5" />
              LABORATORY QUALITY BENCHMARKS
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Những con số không biết nói dối.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Khẳng định vị thế xưởng Detailing uy tín nhất nhờ sự minh bạch và tiêu chuẩn kiểm định khắt khe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SOCIAL_PROOF_STATS.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.03] p-8 text-center backdrop-blur-md flex flex-col justify-between hover:border-blue-500/40 transition-colors duration-300 shadow-sm">
                  <div className="mx-auto size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <div className="font-mono text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                      <CounterAnimation target={stat.value} duration={2000} suffix={stat.suffix} />
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100">{stat.label}</h3>
                    <p className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400">{stat.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CurtainCard>

        {/* Curtain Card 3: Partner Authority Lab */}
        <CurtainCard index={2} total={4}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 font-mono text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
              <FlaskConical className="size-3.5" />
              GLOBAL CHEMICAL & EQUIPMENT AUTHORITY
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Đối tác chiến lược toàn cầu.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Chỉ sử dụng 100% hóa chất và thiết bị nhập khẩu chính ngạch từ Đức, Ý, Đan Mạch đạt chuẩn OEM nhà máy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PARTNER_LABS.map((partner, idx) => (
              <SpotlightCard key={idx} className="h-full rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-white/[0.02] p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                    <span className="text-2xl font-black font-mono tracking-wider text-amber-600 dark:text-amber-400">{partner.name}</span>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">{partner.origin}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{partner.role}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{partner.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span>CERTIFIED PARTNER</span>
                  <CheckCircle2 className="size-4 text-emerald-500 dark:text-emerald-400" />
                </div>
              </SpotlightCard>
            ))}
          </div>
        </CurtainCard>

        {/* Curtain Card 4: Transformation Gallery & Final Prestige CTA */}
        <CurtainCard index={3} total={4}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 font-mono text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-3.5" />
                REAL-WORLD MIRROR TRANSFORMATION
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                Kiểm chứng thực tế trước & sau thi công.
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Kéo thanh trượt để chứng kiến sự khác biệt một trời một vực trước và sau khi được chăm sóc tại phòng kín AutoWash Pro.
              </p>

              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Cam kết hoàn tiền 100% nếu phát hiện hologram bóng ma hoặc xước phát sinh</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Khách hàng trực tiếp nghiệm thu dưới đèn rọi CRI 96+ trước khi thanh toán</span>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/customer/dat-lich">
                  <MagneticButton className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl hover:brightness-110">
                    Đặt lịch lột xác xe ngay hôm nay <ArrowRight className="ml-2 size-5" />
                  </MagneticButton>
                </Link>
              </div>
            </div>

            {/* Interactive Slider Box */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/20 bg-slate-100/50 dark:bg-black/60 p-4 shadow-xl dark:shadow-2xl overflow-hidden">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                <BeforeAfterSlider
                  beforeSrc="/images/car-dirty.jpg"
                  afterSrc="/images/car-clean.jpg"
                  beforeLabel="TRƯỚC KHI RỬA & ĐÁNH BÓNG"
                  afterLabel="SAU HIỆU CHỈNH & PHỦ CERAMIC 9H"
                />
              </div>
            </div>
          </div>
        </CurtainCard>
      </div>

      {/* 5. Global Footer */}
      <PublicFooter />
    </main>
  )
}
