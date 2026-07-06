'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { BeforeAfterSlider } from '@/components/shared/before-after-slider'
import { SpotlightCard } from '@/components/shared/spotlight-card'
import { MagneticButton } from '@/components/shared/magnetic-button'
import { Sparkles, Camera, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  model: string
  category: 'ALL' | 'CERAMIC' | 'INTERIOR' | 'PAINT'
  beforeImage: string
  afterImage: string
  description: string
  serviceTag: string
}

const GALLERY_DATA: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Phục hồi độ bóng gương & Xóa xoáy kính xước dăm',
    model: 'Porsche 911 Carrera S (Màu đen Metallic)',
    category: 'PAINT',
    beforeImage: '/images/car-dirty.jpg',
    afterImage: '/images/car-clean.jpg',
    description: 'Bề mặt sơn xước xoáy nặng do rửa xe cọ cứng không đủ bùn đất. Tiến hành hiệu chỉnh sơn kép 2 bước bằng máy Rupes loại bỏ 95% khuyết tật.',
    serviceTag: 'Hiệu chỉnh sơn kép & Phủ Ceramic 9H',
  },
  {
    id: 'g2',
    title: 'Làm mềm & phục hồi ghế da Nappa trắng ngà',
    model: 'Mercedes-Benz Maybach S680 4MATIC',
    category: 'INTERIOR',
    beforeImage: '/images/car-dirty.jpg',
    afterImage: '/images/car-clean.jpg',
    description: 'Ghế da nappa sáng màu bị ố vàng bám bẩn mồ hôi và ma sát quần jean. Làm sạch sâu bằng dung dịch Koch-Chemie Pol Star pH trung tính mờ tự nhiên.',
    serviceTag: 'Vệ sinh nội thất Super Clean & C-Air Fog',
  },
  {
    id: 'g3',
    title: 'Khóa giáp thủy tinh Ceramic 9H kháng nước lá sen',
    model: 'BMW M8 Competition Gran Coupe',
    category: 'CERAMIC',
    beforeImage: '/images/car-dirty.jpg',
    afterImage: '/images/car-clean.jpg',
    description: 'Tạo lớp màng bảo vệ vô cơ có độ cứng 9H, ngăn ngừa tuyệt đối tia UV làm xỉn màu màng sơn và kháng acid từ nước mưa hoặc phân chim.',
    serviceTag: 'Phủ bóng Ceramic CQUARTZ Professional',
  },
]

export default function ThuVienPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAINT' | 'INTERIOR' | 'CERAMIC'>('ALL')

  const filteredItems = activeTab === 'ALL' ? GALLERY_DATA : GALLERY_DATA.filter(i => i.category === activeTab)

  return (
    <div className="min-h-screen bg-[#05060A] text-white overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-28 border-b border-white/10 bg-gradient-to-b from-[#0A0D16] to-[#05060A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-400/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-purple-400">
              <Camera className="size-3.5" />
              BEFORE & AFTER INSPECTION GALLERY
            </span>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Sự lột xác ngỡ ngàng qua từng góc rọi.
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed text-slate-300 max-w-3xl">
              Kéo thanh trượt để tự mình nghiệm thu kết quả thi công thực tế tại phòng kín AutoWash Pro dưới dải sáng CRI 96+ trung thực nhất.
            </p>

            {/* Filter Pill Tabs */}
            <div className="pt-6 flex flex-wrap gap-3">
              {[
                { id: 'ALL', label: 'TẤT CẢ TÁC PHẨM' },
                { id: 'PAINT', label: 'HIỆU CHỈNH SƠN (PAINT)' },
                { id: 'INTERIOR', label: 'NỘI THẤT NAPPA (INTERIOR)' },
                { id: 'CERAMIC', label: 'PHỦ CERAMIC 9H' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-full font-mono text-xs font-bold tracking-wider transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl scale-105'
                      : 'bg-white/5 border border-white/15 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery List Grid */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {filteredItems.map((item, idx) => (
            <div key={item.id} className="rounded-[2.5rem] border border-white/15 bg-white/[0.02] p-2">
              <div className="rounded-[2.1rem] bg-gradient-to-br from-[#0D111D] to-[#080A12] p-8 sm:p-12 border border-white/5 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 aspect-[16/10] rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
                    <BeforeAfterSlider
                      beforeSrc={item.beforeImage}
                      afterSrc={item.afterImage}
                      beforeLabel="TRƯỚC KHI XỬ LÝ (BEFORE)"
                      afterLabel="SAU KHI LỘT XÁC (AFTER)"
                    />
                  </div>

                  <div className="lg:col-span-5 space-y-6">
                    <div>
                      <span className="font-mono text-xs text-purple-400 uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                        {item.serviceTag}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">{item.title}</h3>
                      <p className="font-mono text-sm text-amber-400 mt-2">// VEHICLE: {item.model}</p>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-base">
                      {item.description}
                    </p>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <Link href="/customer/dat-lich">
                        <MagneticButton className="group flex items-center rounded-full bg-white/10 border border-white/20 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all">
                          <span>Đặt khoang chăm sóc tương tự</span>
                          <div className="ml-2 flex size-6 items-center justify-center rounded-full bg-black/30 transition-transform group-hover:translate-x-1">
                            <ArrowRight className="size-3 text-white" />
                          </div>
                        </MagneticButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
