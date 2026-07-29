'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { Droplets, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1470af]/20 bg-[#1470af]/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[#1470af]">
              <Droplets className="size-3.5 text-[#1470af]" />
              SERVICE CATALOG & DETAILED PROTOCOLS
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
              Quy trình chăm sóc xe sang chuẩn Lab.
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl">
              Phân chia khoa học thành 2 khoang công nghệ chuyên biệt: Khoang Rửa Nhanh Kỹ Thuật Số (WASH) và Phòng Kín Hiệu Chỉnh Chuyên Sâu (FLEX).
            </p>

            {/* Filter Pills */}
            <div className="pt-4 flex flex-wrap gap-3">
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
                      ? 'bg-[#1470af] text-white shadow-md'
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

      {/* Services Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredServices.map((srv) => (
              <div key={srv.id} className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#1470af]/10 text-[#1470af] border border-[#1470af]/20">
                        STATION: {srv.category}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mt-3">{srv.title}</h3>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs text-slate-500 block">GIÁ TIÊU CHUẨN TỪ</span>
                      <span className="text-2xl font-black text-[#1470af]">{formatVND(srv.price)}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="space-y-2.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">// BƯỚC THI CÔNG TIÊU BIỂU</span>
                    {srv.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="size-4 text-[#1470af] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Clock className="size-4 text-[#1470af]" /> THỜI GIAN: {srv.duration}
                  </span>
                  <Link href={`/customer/dat-lich?service=${srv.id}`}>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-[#1470af] hover:bg-[#0f5f8f] px-6 py-3 text-xs font-bold text-white transition-all shadow-sm">
                      <span>Đặt lịch thi công</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </Link>
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
