'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { LogoLink } from '@/components/shared/logo-link'
import { MapPin, Phone, Mail, Clock, ShieldCheck, Award, ChevronUp } from 'lucide-react'
import { GiantGlitchFooter } from '@/components/shared/giant-glitch-footer'

export function PublicFooter() {
  const [showGoTop, setShowGoTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowGoTop(true)
      } else {
        setShowGoTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <footer className="relative z-10 select-none bg-[#0c0e14]">
      {/* 1. Carbon Fiber Detail Section (Restored original airy padding pt-16 pb-12) */}
      <div
        className="relative border-t-4 border-[#1470af] text-white pt-16 pb-12 overflow-hidden"
        style={{
          backgroundColor: '#111216',
          backgroundImage: `url('/images/carbon-pattern.png')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '360px auto',
        }}
      >
        {/* Top subtle overlay shadow */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand Col */}
            <div className="space-y-4 lg:col-span-2">
              <LogoLink variant="light" />
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                AutoWash Pro — Chuỗi rửa xe & chăm sóc xe đúng cách chuyên nghiệp tiêu chuẩn Detailing quốc tế tại TP.HCM.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1470af]/40 bg-black/60 px-3 py-1.5 text-slate-200 shadow-md">
                  <ShieldCheck className="size-4 text-[#1470af]" /> Bảo hành màng phủ chính hãng
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-black/60 px-3 py-1.5 text-slate-200 shadow-md">
                  <Award className="size-4 text-amber-400" /> Đạt chuẩn 4.9★ Google Maps
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#1470af] font-mono">// Khám phá</h4>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><Link href="/gioi-thieu" className="transition-colors hover:text-[#1470af]">Về chúng tôi</Link></li>
                <li><Link href="/dich-vu" className="transition-colors hover:text-[#1470af]">Hệ sinh thái dịch vụ</Link></li>
                <li><Link href="/san-pham-doi-tac" className="transition-colors hover:text-[#1470af]">Đối tác hóa chất</Link></li>
                <li><Link href="/bang-gia" className="transition-colors hover:text-[#1470af]">Bảng giá & Ưu đãi</Link></li>
                <li><Link href="/thu-vien" className="transition-colors hover:text-[#1470af]">Thư viện Before/After</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#1470af] font-mono">// Dịch vụ cốt lõi</h4>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><Link href="/dich-vu" className="transition-colors hover:text-[#1470af]">Rửa xe kỹ thuật số (WASH)</Link></li>
                <li><Link href="/dich-vu" className="transition-colors hover:text-[#1470af]">Hiệu chỉnh sơn Rupes D-A</Link></li>
                <li><Link href="/dich-vu" className="transition-colors hover:text-[#1470af]">Vệ sinh nội thất Nappa Spa</Link></li>
                <li><Link href="/dich-vu" className="transition-colors hover:text-[#1470af]">Phủ Ceramic 9H Quartz</Link></li>
                <li><Link href="/dich-vu" className="transition-colors hover:text-[#1470af]">Khử mùi sinh học C-Air Fog</Link></li>
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#1470af] font-mono">// Trung tâm dịch vụ</h4>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#1470af]" />
                  <span>7 Đ. D1, Tăng Nhơn Phú, TP. Thủ Đức, TP.HCM</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-[#1470af]" />
                  <a href="tel:0901234567" className="font-mono font-bold text-white hover:text-[#1470af]">090 123 4567</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-[#1470af]" />
                  <a href="mailto:info@autowashpro.vn" className="font-mono text-xs text-slate-300 hover:text-[#1470af]">info@autowashpro.vn</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="size-4 shrink-0 text-[#1470af]" />
                  <span className="font-mono text-xs">07:00 – 18:30 (Thứ 2 – CN)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="mt-12 border-t border-white/10 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-slate-400">
              © 2026 AutoWash Pro. Bảo lưu mọi quyền. Value of Excellent Service.
            </p>
            <div className="flex gap-6 text-xs text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Chính sách bảo hành</a>
              <a href="#" className="hover:text-white transition-colors">Điều khoản đặt lịch</a>
              <a href="#" className="hover:text-white transition-colors">Bảo mật thông tin</a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fixed 200px Golden Ratio Glitch Canvas Banner */}
      <GiantGlitchFooter />

      {/* Floating Go Top Button */}
      {showGoTop && (
        <button
          onClick={scrollToTop}
          aria-label="Cuộn lên đầu trang"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#1470af] hover:bg-[#0f5f8f] text-white px-4 py-3 font-mono text-xs font-bold shadow-[0_10px_25px_rgba(20,112,175,0.5)] border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-bottom-5"
        >
          <ChevronUp className="size-4 stroke-[3]" />
          <span className="hidden sm:inline uppercase tracking-wider">GO TOP</span>
        </button>
      )}
    </footer>
  )
}
