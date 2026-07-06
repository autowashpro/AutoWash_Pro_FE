'use client'

import React from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { SpotlightCard } from '@/components/shared/spotlight-card'
import { MagneticButton } from '@/components/shared/magnetic-button'
import { ShieldCheck, Award, Sparkles, CheckCircle2, FlaskConical, Globe, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen bg-[#05060A] text-white overflow-x-hidden">
      <PublicHeader />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-36 pb-28 border-b border-white/10 bg-gradient-to-b from-[#0A0D16] to-[#05060A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
              <FlaskConical className="size-3.5" />
              GLOBAL OEM CHEMICAL & HARDWARE AUTHORITY
            </span>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Hệ sinh thái đối tác & công nghệ toàn cầu.
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed text-slate-300 max-w-3xl">
              Chúng tôi minh bạch 100% nguồn gốc sản phẩm thi công. Chỉ những thương hiệu hóa chất và thiết bị đạt chuẩn phê duyệt OEM của các hãng xe Đức và Ý mới có mặt trong phòng kín AutoWash Pro.
            </p>
          </div>
        </div>
      </section>

      {/* Partners Bento Grid */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PARTNERS_DATA.map((brand, idx) => (
              <div key={idx} className="rounded-[2.5rem] border border-white/15 bg-white/[0.02] p-2">
                <div className="h-full rounded-[2.1rem] bg-gradient-to-br from-[#0D111D] to-[#080A12] p-8 sm:p-12 flex flex-col justify-between border border-white/5 shadow-2xl">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                      <div>
                        <span className="text-3xl font-black tracking-wider text-amber-400 font-mono">{brand.name}</span>
                        <p className="text-xs font-mono text-slate-400 mt-1">{brand.category}</p>
                      </div>
                      <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200">
                        {brand.origin}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-base sm:text-lg mb-8">
                      {brand.description}
                    </p>

                    <div className="space-y-3">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">// SẢN PHẨM TIÊU BIỂU TẠI XƯỞNG</span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {brand.keyProducts.map((prod, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3.5 border border-white/5 text-sm text-slate-200">
                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                            <span>{prod}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-amber-400">
                    <span className="flex items-center gap-2">
                      <Award className="size-4" /> {brand.certification}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lab Verification Double-Bezel CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[3rem] border border-white/20 bg-white/[0.03] p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
            <div className="rounded-[2.6rem] bg-gradient-to-r from-[#120F0C] via-[#0D0A08] to-[#14100D] p-10 sm:p-16 text-center border border-white/10 relative overflow-hidden">
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">// CERTIFIED LAB QUALITY</span>
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                  Trải nghiệm công nghệ chuẩn Đức cho xế cưng.
                </h2>
                <p className="text-slate-300 text-base sm:text-lg">
                  Đặt lịch hôm nay để được tư vấn gói hiệu chỉnh sơn và dưỡng nội thất phù hợp đúng khuyến cáo của nhà sản xuất.
                </p>
                <div className="pt-4 flex justify-center">
                  <Link href="/customer/dat-lich">
                    <MagneticButton className="group flex items-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 px-10 py-5 text-lg font-bold text-black shadow-2xl transition-all hover:scale-[1.03]">
                      <span>Đặt khoang chăm sóc VIP ngay</span>
                      <div className="ml-3 flex size-8 items-center justify-center rounded-full bg-black/20 transition-transform group-hover:translate-x-1">
                        <ArrowRight className="size-4 text-black" />
                      </div>
                    </MagneticButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
