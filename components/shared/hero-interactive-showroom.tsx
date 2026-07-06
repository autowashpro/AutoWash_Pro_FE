'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MagneticButton } from '@/components/shared/magnetic-button'
import { ArrowRight, ChevronRight, Zap, Shield, Sparkles, Disc, Eye, Layers, Sofa } from 'lucide-react'

interface Hotspot {
  id: string
  x: number // percent left
  y: number // percent top
  label: string
  icon: any
  title: string
  techSpec: string
}

const CAR_HOTSPOTS: Hotspot[] = [
  {
    id: 'wheels',
    x: 28,
    y: 72,
    label: 'Mâm & Lốp',
    icon: Disc,
    title: 'Tẩy mạt sắt & Phủ dưỡng bóng lốp',
    techSpec: 'Sử dụng cọ cước mềm không xước mâm phay xước, tẩy sạch cặn phanh dính chặt và phủ kem dưỡng Meguiar\'s chống nứt nẻ.',
  },
  {
    id: 'paint',
    x: 48,
    y: 48,
    label: 'Bề Mặt Sơn',
    icon: Layers,
    title: 'Phủ bóng Ceramic Nano 9H',
    techSpec: 'Khôi phục độ bóng sâu như gương, kháng nước cực mạnh hiệu ứng lá sen ngăn ố mưa axit và tia UV làm bợt màu.',
  },
  {
    id: 'glass',
    x: 38,
    y: 35,
    label: 'Kính Lái',
    icon: Eye,
    title: 'Tẩy ố cặn canxi & Phủ Nano kính',
    techSpec: 'Xử lý màng dầu khí thải bám kính, giúp tầm nhìn đi mưa trong suốt gạt nước cực êm không rít kêu.',
  },
  {
    id: 'interior',
    x: 55,
    y: 38,
    label: 'Khoang Lái',
    icon: Sofa,
    title: 'Giặt hấp ghế Nappa & Xông ion C-Air Fog',
    techSpec: 'Làm sạch vi khuẩn sâu trong thảm sàn và hệ thống dàn lạnh, trả lại mùi hương da mới tự nhiên.',
  },
]

export function HeroInteractiveShowroom() {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(CAR_HOTSPOTS[1])

  return (
    <section className="relative min-h-[88vh] overflow-hidden flex items-center border-b border-border/60 bg-background pt-8 pb-16">
      {/* Background radial glow - very subtle and clean */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,112,175,0.08),rgba(255,255,255,0))]" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
        {/* Left Column: Headline & CTA */}
        <div className="space-y-6 lg:col-span-5 text-left">
          {/* Live Slot Tracker Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-muted-foreground">
              LIVE SLOTS: <strong className="text-foreground">WASH (2 trống)</strong> · <strong className="text-violet-600 dark:text-violet-400">FLEX (1 trống)</strong>
            </span>
          </div>

          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.08]">
            Chăm sóc xe sang <br />
            <span className="text-primary">chuẩn Laboratory.</span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Hệ sinh thái Detailing tiêu chuẩn quốc tế. Nhấp vào các điểm sáng trên xe để kiểm chứng quy trình thi công không tì vết.
          </p>

          <div className="pt-2 flex flex-wrap gap-3.5">
            <Link href="/customer/dat-lich">
              <MagneticButton className="bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                Đặt lịch dịch vụ ngay <ArrowRight className="ml-2 size-4" />
              </MagneticButton>
            </Link>
            <Link href="/gioi-thieu">
              <button className="rounded-xl border border-border/80 bg-background px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                Tìm hiểu xưởng
              </button>
            </Link>
          </div>

          {/* Trust micro-badges */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1">⭐ Đạt 4.9/5 Trustindex</span>
            <span className="flex items-center gap-1">🔒 Bảo hành bong bóng 2 năm</span>
          </div>
        </div>

        {/* Right Column: Interactive 3D Showroom Hotspots */}
        <div className="lg:col-span-7 relative">
          <div className="relative aspect-[16/10] w-full rounded-3xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur-md flex items-center justify-center overflow-hidden">
            <Image
              src="/images/hero-car.png"
              alt="AutoWash Pro Interactive Showroom Car"
              fill
              priority
              className="object-cover object-center scale-105 transition-transform duration-700 hover:scale-100"
              quality={95}
            />

            {/* Hotspots */}
            {CAR_HOTSPOTS.map((spot) => {
              const isActive = activeHotspot?.id === spot.id
              const Icon = spot.icon
              return (
                <button
                  key={spot.id}
                  onClick={() => setActiveHotspot(spot)}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none ${
                    isActive
                      ? 'size-10 bg-primary text-white scale-125 shadow-md ring-4 ring-primary/30'
                      : 'size-8 bg-background/90 text-foreground hover:bg-primary hover:text-white hover:scale-110 shadow-sm border border-border/80'
                  }`}
                  title={spot.label}
                >
                  <Icon className="size-4" />
                </button>
              )
            })}

            {/* Info overlay card inside the showroom */}
            {activeHotspot && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 rounded-2xl border border-border/80 bg-background/90 p-4 shadow-md backdrop-blur-md z-30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                    {activeHotspot.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">STEP ANATOMY</span>
                </div>
                <h4 className="mt-1.5 text-base font-bold">{activeHotspot.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{activeHotspot.techSpec}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
