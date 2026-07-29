'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { BeforeAfterSlider } from '@/components/shared/before-after-slider'
import { Camera, ArrowRight } from 'lucide-react'

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
    beforeImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
    afterImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    description: 'Bề mặt sơn xước xoáy nặng do rửa xe cọ cứng không đủ bùn đất. Tiến hành hiệu chỉnh sơn kép 2 bước bằng máy Rupes loại bỏ 95% khuyết tật.',
    serviceTag: 'Hiệu chỉnh sơn kép & Phủ Ceramic 9H',
  },
  {
    id: 'g2',
    title: 'Làm mềm & phục hồi ghế da Nappa trắng ngà',
    model: 'Mercedes-Benz Maybach S680 4MATIC',
    category: 'INTERIOR',
    beforeImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    afterImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
    description: 'Ghế da nappa sáng màu bị ố vàng bám bẩn mồ hôi và ma sát quần jean. Làm sạch sâu bằng dung dịch Koch-Chemie Pol Star pH trung tính mờ tự nhiên.',
    serviceTag: 'Vệ sinh nội thất Super Clean & C-Air Fog',
  },
  {
    id: 'g3',
    title: 'Khóa giáp thủy tinh Ceramic 9H kháng nước lá sen',
    model: 'BMW M8 Competition Gran Coupe',
    category: 'CERAMIC',
    beforeImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    afterImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    description: 'Tạo lớp màng bảo vệ vô cơ có độ cứng 9H, ngăn ngừa tuyệt đối tia UV làm xỉn màu màng sơn và kháng acid từ nước mưa hoặc phân chim.',
    serviceTag: 'Phủ bóng Ceramic CQUARTZ Professional',
  },
]

export default function ThuVienPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAINT' | 'INTERIOR' | 'CERAMIC'>('ALL')

  const filteredItems = activeTab === 'ALL' ? GALLERY_DATA : GALLERY_DATA.filter(i => i.category === activeTab)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-purple-700">
              <Camera className="size-3.5 text-purple-600" />
              BEFORE & AFTER INSPECTION GALLERY
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
              Sự lột xác ngỡ ngàng qua từng góc rọi.
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl">
              Kéo thanh trượt để tự mình nghiệm thu kết quả thi công thực tế tại phòng kín AutoWash Pro dưới dải sáng CRI 96+ trung thực nhất.
            </p>

            {/* Filter Pill Tabs */}
            <div className="pt-4 flex flex-wrap gap-3">
              {[
                { id: 'ALL', label: 'TẤT CẢ TÁC PHẨM' },
                { id: 'PAINT', label: 'HIỆU CHỈNH SƠN (PAINT)' },
                { id: 'INTERIOR', label: 'NỘI THẤT NAPPA (INTERIOR)' },
                { id: 'CERAMIC', label: 'PHỦ CERAMIC 9H' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={activeTab === tab.id ? { backgroundColor: '#1470af', color: '#ffffff' } : {}}
                  className={`px-6 py-3 rounded-full font-mono text-xs font-bold tracking-wider transition-all ${
                    activeTab === tab.id
                      ? 'text-white shadow-md'
                      : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
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
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {filteredItems.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm hover:shadow-md transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 aspect-[16/10] rounded-2xl overflow-hidden relative border border-slate-200 shadow-sm">
                <BeforeAfterSlider
                  beforeSrc={item.beforeImage}
                  afterSrc={item.afterImage}
                  beforeLabel="TRƯỚC KHI XỬ LÝ (BEFORE)"
                  afterLabel="SAU KHI LỘT XÁC (AFTER)"
                />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="font-mono text-xs font-bold text-[#1470af] uppercase tracking-widest px-3 py-1 rounded-full bg-[#1470af]/10 border border-[#1470af]/20">
                    {item.serviceTag}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-3">{item.title}</h3>
                  <p className="font-mono text-xs font-bold text-amber-600 mt-2">// VEHICLE: {item.model}</p>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <Link href="/customer/dat-lich">
                    <button
                      style={{ backgroundColor: '#1470af', color: '#ffffff' }}
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold text-white transition-all shadow-sm hover:bg-[#0f5f8f]"
                    >
                      <span>Đặt khoang chăm sóc tương tự</span>
                      <ArrowRight className="size-3.5 text-white" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <PublicFooter />
    </div>
  )
}
