'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { SpotlightCard } from '@/components/shared/spotlight-card'
import { MagneticButton } from '@/components/shared/magnetic-button'
import { Car, Shield, Sparkles, CheckCircle2, Calculator, ArrowRight, Award } from 'lucide-react'
import { formatVND } from '@/lib/data'

type CarSize = 'SEDAN' | 'SUV' | 'MPV'
type MemberTier = 'MEMBER' | 'SILVER' | 'GOLD' | 'PLATINUM'

interface PricingPackage {
  id: string
  title: string
  category: 'WASH' | 'FLEX'
  basePrice: Record<CarSize, number>
  description: string
  features: string[]
}

const PRICING_DATA: PricingPackage[] = [
  {
    id: 'p1',
    title: 'Rửa Xe Chi Tiết 12 Bước (WASH PRO)',
    category: 'WASH',
    basePrice: { SEDAN: 150000, SUV: 180000, MPV: 220000 },
    description: 'Quy trình rửa bọt tuyết Koch-Chemie trung tính, xịt cặn gầm lốp, dưỡng lốp và hút bụi nội thất.',
    features: ['Rửa bọt tuyết Gentle Snow Foam pH trung tính', 'Xịt gầm áp lực cao xoáy bùn', 'Vệ sinh mâm cọ lông cừu mềm', 'Hút bụi & lau dưỡng khoang lái'],
  },
  {
    id: 'p2',
    title: 'Phủ bóng Ceramic Quick Detailer',
    category: 'WASH',
    basePrice: { SEDAN: 450000, SUV: 550000, MPV: 650000 },
    description: 'Rửa xe chi tiết + tẩy bụi sắt + phủ màng Polymer Ceramic kháng nước mạnh mẽ trong 3 tháng.',
    features: ['Toàn bộ 12 bước rửa xe chi tiết', 'Tẩy nhựa cây & bụi sa khoáng mạt sắt', 'Phủ màng bóng Polymer Ceramic SiO2', 'Dưỡng nhựa nhám chống tia UV'],
  },
  {
    id: 'p3',
    title: 'Vệ sinh nội thất Super Clean & C-Air Fog',
    category: 'FLEX',
    basePrice: { SEDAN: 1800000, SUV: 2200000, MPV: 2600000 },
    description: 'Làm sạch sâu ghế da Nappa bằng hơi nước nóng, diệt khuẩn giàn lạnh và xông tinh dầu kháng khuẩn.',
    features: ['Tháo ghế hoặc cọ khe rãnh chuyên sâu', 'Dung dịch Pol Star dưỡng mềm da cao cấp', 'Khử mùi sinh học C-Air Fog Hàn Quốc', 'Bảo hành sạch khuẩn sâu 6 tháng'],
  },
  {
    id: 'p4',
    title: 'Hiệu chỉnh sơn 3 bước & Phủ Ceramic 9H (VIP)',
    category: 'FLEX',
    basePrice: { SEDAN: 6500000, SUV: 8500000, MPV: 10500000 },
    description: 'Khôi phục 98% độ bóng nguyên bản, xóa xước xoáy kính dưới đèn rọi CRI 96+ và phủ 2 lớp Ceramic CQUARTZ.',
    features: ['Đo độ dày màng sơn Clear Coat điện tử', 'Hiệu chỉnh kép Dual-Action Rupes Ý', 'Phủ 2 lớp giáp thủy tinh vô cơ 9H', 'Bảo dưỡng định kỳ miễn phí 12 tháng'],
  },
]

const TIER_DISCOUNTS: Record<MemberTier, { label: string; discount: number }> = {
  MEMBER: { label: 'Thành viên (Mặc định)', discount: 0 },
  SILVER: { label: 'Bạc (Giảm 5%)', discount: 0.05 },
  GOLD: { label: 'Vàng (Giảm 10%)', discount: 0.1 },
  PLATINUM: { label: 'Bạch kim (Giảm 15%)', discount: 0.15 },
}

export default function BangGiaPage() {
  const [selectedSize, setSelectedSize] = useState<CarSize>('SEDAN')
  const [selectedTier, setSelectedTier] = useState<MemberTier>('MEMBER')

  return (
    <div className="min-h-screen bg-[#05060A] text-white overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-28 border-b border-white/10 bg-gradient-to-b from-[#0A0D16] to-[#05060A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              <Calculator className="size-3.5" />
              LIVE TRANSPARENT DETAILING ESTIMATOR
            </span>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Minh bạch giá trị, cam kết không phát sinh.
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed text-slate-300 max-w-3xl">
              Chọn kích thước phương tiện và hạng thành viên để trải nghiệm hệ thống báo giá tự động theo thời gian thực.
            </p>

            {/* Interactive Selector Pill Box */}
            <div className="pt-6 flex flex-wrap items-center gap-6">
              <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-2 flex items-center gap-2">
                {(['SEDAN', 'SUV', 'MPV'] as CarSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-xl font-mono text-sm font-bold transition-all ${
                      selectedSize === size
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-2 flex items-center gap-2">
                {(['MEMBER', 'SILVER', 'GOLD', 'PLATINUM'] as MemberTier[]).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all ${
                      selectedTier === tier
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {TIER_DISCOUNTS[tier].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PRICING_DATA.map((pkg) => {
              const base = pkg.basePrice[selectedSize]
              const disc = TIER_DISCOUNTS[selectedTier].discount
              const finalPrice = Math.round(base * (1 - disc))

              return (
                <div key={pkg.id} className="rounded-[2.5rem] border border-white/15 bg-white/[0.02] p-2">
                  <div className="h-full rounded-[2.1rem] bg-gradient-to-br from-[#0D111D] to-[#080A12] p-8 sm:p-12 flex flex-col justify-between border border-white/5 shadow-2xl">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                        <div>
                          <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-sky-400">
                            STATION: {pkg.category}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">{pkg.title}</h3>
                        </div>
                      </div>

                      <div className="mb-8">
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-4xl sm:text-5xl font-black text-white">
                            {formatVND(finalPrice)}
                          </span>
                          {disc > 0 && (
                            <span className="font-mono text-base text-slate-500 line-through">
                              {formatVND(base)}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-base mt-4 leading-relaxed">{pkg.description}</p>
                      </div>

                      <div className="space-y-3 mb-8">
                        {pkg.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3.5 border border-white/5 text-sm text-slate-200">
                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <Link href={`/customer/dat-lich?package=${pkg.id}&size=${selectedSize}`}>
                        <MagneticButton className="group flex items-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02]">
                          <span>Chọn gói dịch vụ này</span>
                          <div className="ml-2 flex size-6 items-center justify-center rounded-full bg-black/20 transition-transform group-hover:translate-x-1">
                            <ArrowRight className="size-3 text-white" />
                          </div>
                        </MagneticButton>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
