'use client'

import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

interface HeroHudTelemetryProps {
  progress: number
  isScrolling?: boolean
  onOpenBooking?: () => void
}

const DETAILING_ZONES = [
  { num: '01', label: 'SNOW FOAM HYDRO WASH', desc: 'Sương bọt tuyết & làm sạch sâu Hydro', color: 'text-sky-400 border-sky-500/50 bg-slate-900' },
  { num: '02', label: 'D-A PAINT CORRECTION', desc: 'Hiệu chỉnh bóng gương bằng máy D-A Rupes', color: 'text-white border-white/50 bg-slate-900' },
  { num: '03', label: 'NAPPA STEAM SPA', desc: 'Dưỡng da Nappa & diệt khuẩn hơi nước nóng', color: 'text-amber-400 border-amber-500/50 bg-slate-900' },
  { num: '04', label: '9H CERAMIC SHIELD', desc: 'Sấy hồng ngoại & giọt sương kỵ nước lá sen', color: 'text-rose-400 border-rose-500/50 bg-slate-900' },
]

export function HeroHudTelemetry({ progress, isScrolling = false, onOpenBooking }: HeroHudTelemetryProps) {
  // Determine active zone based on scroll progress
  const activeZoneIdx = progress < 0.25 ? 0 : progress < 0.5 ? 1 : progress < 0.75 ? 2 : 3

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-12 transition-all duration-500">
      {/* Centered Top Header Typography - Flat & Solid */}
      <div className="w-full pt-6 pb-12 transition-opacity duration-300">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-sans uppercase">
            HỆ SINH THÁI DETAILING LAB TIÊU CHUẨN 9H.
          </h1>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-semibold tracking-widest text-slate-300 font-sans uppercase">
            TRẢI NGHIỆM SỰ HOÀN HẢO CHÍNH XÁC ĐẾN TỪNG MICROMET.
          </p>
        </div>
      </div>

      {/* Bottom Area: Unified Dashboard containing 4 Zone Cards & VIP CTA */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-6 pt-20 pointer-events-auto">
        {/* Left Side: 4 Minimalist Floating Stage Zones - Compact & Bottom-aligned */}
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:max-w-4xl transition-all duration-300 transform ${
            isScrolling ? 'opacity-25 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {DETAILING_ZONES.map((zone, idx) => {
            const isActive = activeZoneIdx === idx
            return (
              <div
                key={idx}
                className={`rounded-xl border p-3 backdrop-blur-md transition-all duration-500 flex flex-col justify-between min-h-[90px] ${
                  isActive
                    ? `${zone.color} shadow-lg -translate-y-1`
                    : 'border-white/5 bg-black/45 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-extrabold tracking-wider">
                  <span className={isActive ? 'text-cyan-300' : 'text-slate-500'}>{zone.num} //</span>
                  <span className="uppercase text-[9px] sm:text-[10px] truncate">{zone.label}</span>
                </div>
                <p className="mt-1 text-[10px] font-sans leading-snug text-slate-300">
                  {zone.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Right Side: Prominent VIP Booking CTA - Flat & Clean */}
        <div className="flex-shrink-0 flex items-end justify-end">
          <button
            onClick={onOpenBooking}
            className="group inline-flex items-center gap-3 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-4 text-sm font-extrabold text-white transition-all duration-300 border border-blue-500/30 active:scale-95"
          >
            <Sparkles className="size-4 text-cyan-300 animate-pulse" />
            <span className="tracking-wide uppercase font-sans whitespace-nowrap">ĐẶT LỊCH NGAY</span>
            <ArrowRight className="size-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
