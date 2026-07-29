'use client'

import React from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { Award, CheckCircle2, FlaskConical, ArrowRight } from 'lucide-react'

interface PartnerBrand {
  name: string
  origin: string
  category: string
  description: string
  keyProducts: string[]
  certification: string
}

const PARTNERS_DATA: PartnerBrand[] = [
  {
    name: 'Koch-Chemie',
    origin: 'Germany (Đức)',
    category: 'Hóa chất Detailing chuyên nghiệp',
    description: 'Thương hiệu hóa chất được các tập đoàn xe hơi hàng đầu như Mercedes-Benz, BMW và Porsche phê duyệt sử dụng chính thức trong nhà máy xuất xưởng.',
    keyProducts: ['Gentle Snow Foam (GSF) pH trung tính', 'Pol Star vệ sinh da nappa an toàn', 'Top Star dưỡng nhựa nội thất chống UV'],
    certification: 'Đạt chứng nhận Daimler AG & BMW Group Approval',
  },
  {
    name: 'Rupes S.p.A',
    origin: 'Italy (Ý)',
    category: 'Hệ thống đánh bóng Quỹ đạo kép BigFoot',
    description: 'Cuộc cách mạng Dual-Action trong ngành Detailing toàn cầu. Máy đánh bóng quỹ đạo lệch tâm giảm thiểu nhiệt độ ma sát tuyệt đối, bảo toàn màng sơn Clear Coat zin.',
    keyProducts: ['LHR21 Mark III Dual-Action Polisher', 'D-A Coarse & Fine Microfiber Pads', 'D-A Gel Compound High Performance'],
    certification: 'Tiêu chuẩn Cơ khí Khí động học Châu Âu CE / Made in Milan',
  },
  {
    name: 'Scangrip A/S',
    origin: 'Denmark (Đan Mạch)',
    category: 'Giàn đèn rọi khuyết tật CRI 96+ chuyên dụng',
    description: 'Thương hiệu chiếu sáng số 1 thế giới dành cho phòng sơn và Detailing. Dải ánh sáng đa nhiệt độ màu soi rõ từng vết xoáy nhện siêu vi dưới mọi điều kiện ánh sáng.',
    keyProducts: ['Multimatch 8 Connect 8000 Lumen CRI 96+', 'Sunmatch 4 handheld inspection tool', 'Matchpen R rọi khuyết tật góc khuất'],
    certification: 'Tiêu chuẩn Kiểm tra Khuyết tật Sơn ISO 3664',
  },
  {
    name: 'CarPro Global',
    origin: 'South Korea (Hàn Quốc)',
    category: 'Công nghệ Phủ nano & Ceramic SiO2',
    description: 'Người tiên phong công nghệ phủ Quartz 9H toàn cầu. Dòng sản phẩm CQUARTZ tạo lớp giáp thủy tinh vô cơ có độ bền hóa học trên 24-36 tháng.',
    keyProducts: ['CQUARTZ Professional 9H Ceramic Armor', 'IronX khử mạt sắt phanh trên mâm sơn', 'Reload Quartz Spray Hydrophobic Sealant'],
    certification: 'Chứng nhận Độ cứng 9H từ Viện KITECH Korea',
  },
]

export default function SanPhamDoiTacPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <PublicHeader />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-32 pb-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-amber-800">
              <FlaskConical className="size-3.5 text-amber-600" />
              GLOBAL OEM CHEMICAL & HARDWARE AUTHORITY
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
              Hệ sinh thái đối tác & công nghệ toàn cầu.
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl leading-relaxed">
              Chúng tôi minh bạch 100% nguồn gốc sản phẩm thi công. Chỉ những thương hiệu hóa chất và thiết bị đạt chuẩn phê duyệt OEM của các hãng xe Đức và Ý mới có mặt trong phòng kín AutoWash Pro.
            </p>
          </div>
        </div>
      </section>

      {/* Partners Bento Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PARTNERS_DATA.map((brand, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <span className="text-2xl font-black font-mono text-slate-900">{brand.name}</span>
                  <p className="text-xs font-mono text-slate-500 mt-1">{brand.category}</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                  {brand.origin}
                </span>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                {brand.description}
              </p>

              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">// SẢN PHẨM TIÊU BIỂU TẠI XƯỞNG</span>
                <div className="grid grid-cols-1 gap-2">
                  {brand.keyProducts.map((prod, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="size-4 text-[#1470af] shrink-0" />
                      <span>{prod}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-amber-700 font-bold">
                <span className="flex items-center gap-2">
                  <Award className="size-4 text-amber-600" /> {brand.certification}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: '#1470af' }} className="py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Trải nghiệm công nghệ chuẩn Đức cho xế cưng.
          </h2>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
            Đặt lịch hôm nay để được tư vấn gói hiệu chỉnh sơn và dưỡng nội thất phù hợp đúng khuyến cáo của nhà sản xuất.
          </p>
          <div className="pt-2">
            <Link href="/customer/dat-lich">
              <button
                style={{ backgroundColor: '#ffffff', color: '#1470af' }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:bg-slate-100 transition-all"
              >
                <span>Đặt khoang chăm sóc VIP ngay</span>
                <ArrowRight className="size-5 text-[#1470af]" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
