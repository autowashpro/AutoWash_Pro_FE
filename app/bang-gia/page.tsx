'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { CheckCircle2, Calculator, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1470af]/20 bg-[#1470af]/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[#1470af]">
              <Calculator className="size-3.5 text-[#1470af]" />
              LIVE TRANSPARENT DETAILING ESTIMATOR
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
              Minh bạch giá trị, cam kết không phát sinh.
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl">
              Chọn kích thước phương tiện và hạng thành viên để trải nghiệm hệ thống báo giá tự động theo thời gian thực.
            </p>

            {/* Interactive Selector Pill Box */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-1.5 flex items-center gap-1.5">
                {(['SEDAN', 'SUV', 'MPV'] as CarSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={selectedSize === size ? { backgroundColor: '#1470af', color: '#ffffff' } : {}}
                    className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                      selectedSize === size
                        ? 'text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-1.5 flex items-center gap-1.5">
                {(['MEMBER', 'SILVER', 'GOLD', 'PLATINUM'] as MemberTier[]).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                      selectedTier === tier
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PRICING_DATA.map((pkg) => {
              const base = pkg.basePrice[selectedSize]
              const disc = TIER_DISCOUNTS[selectedTier].discount
              const finalPrice = Math.round(base * (1 - disc))

              return (
                <div key={pkg.id} className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#1470af]/10 text-[#1470af] border border-[#1470af]/20">
                          STATION: {pkg.category}
                        </span>
                        <h3 className="text-2xl font-bold text-slate-900 mt-3">{pkg.title}</h3>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900">
                          {formatVND(finalPrice)}
                        </span>
                        {disc > 0 && (
                          <span className="font-mono text-sm text-slate-400 line-through">
                            {formatVND(base)}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm mt-3 leading-relaxed">{pkg.description}</p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      {pkg.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700 font-medium">
                          <CheckCircle2 className="size-4 text-[#1470af] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Link href={`/customer/dat-lich?package=${pkg.id}&size=${selectedSize}`}>
                      <button
                        style={{ backgroundColor: '#1470af', color: '#ffffff' }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all shadow-sm hover:bg-[#0f5f8f]"
                      >
                        <span>Chọn gói dịch vụ này</span>
                        <ArrowRight className="size-4 text-white" />
                      </button>
                    </Link>
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
