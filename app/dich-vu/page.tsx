'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { SpotlightCard } from '@/components/shared/spotlight-card'
import { MagneticButton } from '@/components/shared/magnetic-button'
import { Droplets, Sparkles, Shield, Sofa, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { formatVND } from '@/lib/data'

interface ServiceDetail {
  id: string
  title: string
  category: 'ALL' | 'WASH' | 'FLEX'
  duration: string
  price: number
  description: string
  features: string[]
}

const SERVICES_DATA: ServiceDetail[] = [
  {
    id: 's1',
    title: 'Rửa Xe Chi Tiết 12 Bước (WASH PRO)',
    category: 'WASH',
    duration: '45 - 60 phút',
    price: 150000,
    description: 'Quy trình rửa bọt tuyết Koch-Chemie trung tính, xịt cặn gầm lốp chi tiết, dưỡng lốp và hút bụi khoang lái.',
    features: [
      'Dung dịch Gentle Snow Foam pH trung tính an toàn sơn zin',
      'Xịt gầm áp lực cao xoáy trôi bùn khoáng',
      'Vệ sinh mâm lốp cọ lông cừu chuyên dụng',
      'Hút bụi & lau dưỡng kính chống bám hơi nước',
    ],
  },
  {
    id: 's2',
    title: 'Phủ bóng Ceramic Quick Detailer',
    category: 'WASH',
    duration: '90 phút',
    price: 450000,
    description: 'Rửa xe chi tiết kết hợp tẩy mạt sắt phanh và phủ màng bóng Polymer Ceramic tạo hiệu ứng lá sen kháng nước trong 3 tháng.',
    features: [
      'Bao gồm toàn bộ 12 bước rửa xe chi tiết',
      'Tẩy nhựa cây & bụi sa khoáng mạt sắt',
      'Phủ màng bóng Polymer Ceramic SiO2',
      'Dưỡng nhựa ngoại thất chống tia UV làm xỉn màu',
    ],
  },
  {
    id: 's3',
    title: 'Vệ sinh nội thất Super Clean & C-Air Fog',
    category: 'FLEX',
    duration: '4 - 6 giờ',
    price: 1800000,
    description: 'Làm sạch sâu ghế da Nappa bằng hơi nước nóng hơi ấm, khử mùi sinh học C-Air Fog diệt 99.9% vi khuẩn giàn lạnh.',
    features: [
      'Tháo ghế cọ xát từng khe rãnh tiệt trùng',
      'Dung dịch Pol Star dưỡng da mềm mại tự nhiên',
      'Diệt nấm mốc giàn lạnh điều hòa sinh học',
      'Bảo dưỡng cao su ron cửa chống ồn tiếng gió',
    ],
  },
  {
    id: 's4',
    title: 'Hiệu chỉnh sơn 3 bước & Phủ Ceramic 9H VIP',
    category: 'FLEX',
    duration: '1 - 2 ngày',
    price: 6500000,
    description: 'Khôi phục độ bóng gương hoàn hảo, xóa xoáy nhện xước dăm dưới đèn rọi CRI 96+ và phủ 2 lớp giáp thủy tinh vô cơ 9H.',
    features: [
      'Đo độ dày màng sơn bằng cảm biến điện tử',
      'Hiệu chỉnh kép Dual-Action Rupes không gây nhiệt',
      'Phủ 2 lớp giáp thủy tinh Ceramic CQUARTZ',
      'Bảo hành độ bóng sâu và hỗ trợ dưỡng miễn phí 1 năm',
    ],
  },
]

export default function DichVuPage() {
  const [filter, setFilter] = useState<'ALL' | 'WASH' | 'FLEX'>('ALL')

  const filteredServices = filter === 'ALL' ? SERVICES_DATA : SERVICES_DATA.filter(s => s.category === filter)

  return (
    <div className="min-h-screen bg-[#05060A] text-white overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-28 border-b border-white/10 bg-gradient-to-b from-[#0A0D16] to-[#05060A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-blue-400">
              <Droplets className="size-3.5" />
              SERVICE CATALOG & DETAILED PROTOCOLS
            </span>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Quy trình chăm sóc xe sang chuẩn Lab.
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed text-slate-300 max-w-3xl">
              Phân chia khoa học thành 2 khoang công nghệ chuyên biệt: Khoang Rửa Nhanh Kỹ Thuật Số (WASH) và Phòng Kín Hiệu Chỉnh Chuyên Sâu (FLEX).
            </p>

            {/* Filter Pills */}
            <div className="pt-6 flex flex-wrap gap-4">
              {[
                { id: 'ALL', label: 'TẤT CẢ DỊCH VỤ' },
                { id: 'WASH', label: 'KHOANG RỬA KỸ THUẬT SỐ (WASH)' },
                { id: 'FLEX', label: 'PHÒNG KÍN HIỆU CHỈNH (FLEX)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-6 py-3 rounded-full font-mono text-xs font-bold tracking-wider transition-all ${
                    filter === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-xl scale-105'
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

      {/* Services Grid */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredServices.map((srv) => (
              <div key={srv.id} className="rounded-[2.5rem] border border-white/15 bg-white/[0.02] p-2">
                <div className="h-full rounded-[2.1rem] bg-gradient-to-br from-[#0D111D] to-[#080A12] p-8 sm:p-12 flex flex-col justify-between border border-white/5 shadow-2xl">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-blue-400">
                          STATION: {srv.category}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">{srv.title}</h3>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-sm text-slate-400 block">GIÁ TIÊU CHUẨN TỪ</span>
                        <span className="text-2xl font-black text-white">{formatVND(srv.price)}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-base mb-8">
                      {srv.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">// CÁC BƯỚC THI CÔNG TIÊU BIỂU</span>
                      {srv.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3.5 border border-white/5 text-sm text-slate-200">
                          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <Clock className="size-4 text-sky-400" /> THỜI GIAN: {srv.duration}
                    </span>
                    <Link href={`/customer/dat-lich?service=${srv.id}`}>
                      <MagneticButton className="group flex items-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02]">
                        <span>Đặt lịch thi công</span>
                        <div className="ml-2 flex size-6 items-center justify-center rounded-full bg-black/20 transition-transform group-hover:translate-x-1">
                          <ArrowRight className="size-3 text-white" />
                        </div>
                      </MagneticButton>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
