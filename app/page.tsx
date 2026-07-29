'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { BeforeAfterSlider } from '@/components/shared/before-after-slider'
import { BookingWizard } from '@/components/customer/booking-wizard'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Car,
  Shield,
  Gauge,
  Flame,
  ShieldCheck,
  ChevronDown,
  X,
  Star,
} from 'lucide-react'

const STATS = [
  { icon: Car, value: '8.500+', label: 'Siêu xe & xe sang đã phục vụ', sub: 'SIÊU XE & LUXURY CARS' },
  { icon: Shield, value: '100%', label: 'Đạt chuẩn kiểm định IDA', sub: 'IDA INTERNATIONAL' },
  { icon: Gauge, value: '4.9/5★', label: 'Đánh giá từ khách hàng', sub: 'TỪ 1.200+ CHỦ XE' },
  { icon: Flame, value: '12 Năm', label: 'Kinh nghiệm Trưởng Xưởng', sub: 'MASTER DETAILERS' },
]

const STATIONS = [
  {
    num: '01',
    code: 'STATION 01 // WASH BAY',
    title: 'Khoang Rửa Kỹ Thuật Số WASH',
    badge: 'Rửa không chạm & lọc RO',
    price: 'Từ 150.000đ',
    time: '45 Phút',
    desc: 'Rửa xe không chạm kết hợp bọt tuyết trung tính Koch-Chemie GSF (Đức). Lọc nước RO loại bỏ hoàn toàn cặn khoáng, lau sấy viền kính bằng khăn Microfiber 1200 GSM.',
    highlights: [
      'Nước RO lọc tinh khiết không để lại ố mốc kính',
      'Xịt áp lực gầm lốp & hốc bánh tẩy bụi phanh',
      'Dưỡng bóng lốp & nhựa ngoại thất chống lão hóa',
    ],
  },
  {
    num: '02',
    code: 'STATION 02 // FLEX STUDIO',
    title: 'Khoang Hiệu Chỉnh Sơn FLEX',
    badge: 'Xóa xoáy nhện bóng gương',
    price: 'Từ 1.800.000đ',
    time: '3 - 6 Giờ',
    desc: 'Soi khuyết tật dưới dàn đèn rọi Scangrip CRI 96+. Kỹ thuật viên dùng máy đánh bóng quỹ đạo kép Rupes D-A xóa 95% vết xoáy nhện, bảo tồn tối đa độ dày sơn bóng Clear Coat.',
    highlights: [
      'Đo độ dày màng sơn bằng máy siêu âm trước thi công',
      'Xi đánh bóng gốc nước Rupes không trét lấp silicone',
      'Khôi phục độ mượt & phản bóng gương xuất xưởng',
    ],
  },
  {
    num: '03',
    code: 'STATION 03 // INTERIOR SPA',
    title: 'Khoang Chăm Sóc Nội Thất',
    badge: 'Hấp hơi 140°C & Da Nappa',
    price: 'Từ 1.200.000đ',
    time: '180 Phút',
    desc: 'Giặt hấp hơi nước nóng bão hòa 140°C tiệt trùng 99.9% vi khuẩn hệ thống lạnh. Dưỡng vitamin E phục hồi độ đàn hồi mềm mại cho ghế da Nappa, Alcantara.',
    highlights: [
      'Diệt khuẩn & nấm mốc bằng hơi nước bão hòa',
      'Phủ lớp dưỡng da cao cấp Koch-Chemie Leather Star',
      'Khử sạch mùi thuốc lá, mùi xe mới bằng Bio-Enzyme',
    ],
  },
  {
    num: '04',
    code: 'STATION 04 // CERAMIC 9H',
    title: 'Khoang Phủ Gốm Thủy Tinh VIP',
    badge: 'Phủ SiO2 sấy hồng ngoại',
    price: 'Từ 4.500.000đ',
    time: '24 Giờ',
    desc: 'Phủ màng pha lê Silicon Dioxide (SiO2) độ cứng 9H tạo khiên bảo vệ kháng axit nước mưa, phân chim và tia UV. Khóa độ bóng sâu vĩnh cửu bảo hành lên đến 5 năm.',
    highlights: [
      'Sấy hồng ngoại sóng ngắn kết tinh màng gốm siêu cứng',
      'Hiệu ứng lá sen trượt nước với góc tiếp xúc >110°',
      'Bảo hành chính hãng 2 – 5 năm kèm dưỡng định kỳ',
    ],
  },
]

const PARTNERS = [
  {
    name: 'Koch-Chemie',
    country: 'Đức 🇩🇪',
    role: 'Hóa chất Detailing OEM Mercedes-Benz & BMW',
    desc: 'Dung dịch bọt tuyết Gentle Snow Foam pH 7.0 an toàn tuyệt đối cho mọi nẹp chrom và màng sơn bóng cao cấp.',
  },
  {
    name: 'Rupes',
    country: 'Ý 🇮🇹',
    role: 'Máy đánh bóng quỹ đạo kép Dual-Action',
    desc: 'Độ lệch tâm 21mm tiêu chuẩn thế giới, tạo lực cắt xoáy nhện êm ái mà không gây cháy sơn hay hiệu ứng bóng ma.',
  },
  {
    name: 'Scangrip',
    country: 'Đan Mạch 🇩🇰',
    role: 'Dàn đèn rọi khuyết tật CRI 96+ đa nhiệt màu',
    desc: 'Dải sáng 2700K – 6500K giả lập chuẩn xác ánh sáng mặt trời, chiếu lột tả từng vết xước dăm siêu nhỏ.',
  },
]

const FAQS = [
  {
    q: 'Thời gian hoàn thành một gói rửa xe và tân trang kéo dài bao lâu?',
    a: 'Gói rửa xe kỹ thuật số Express WASH mất từ 45-60 phút. Các gói hiệu chỉnh sơn FLEX hoặc vệ sinh nội thất sâu mất từ 3-6 giờ. Gói phủ Ceramic 9H cần 24 giờ bao gồm thời gian sấy đèn hồng ngoại.',
  },
  {
    q: 'Dung dịch bọt tuyết tại AutoWash Pro có gây hại cho màng sơn mỏng không?',
    a: 'Chúng tôi cam kết sử dụng 100% hóa chất Koch-Chemie (Đức) pH 7.0 trung tính nhập khẩu chính ngạch. Hóa chất hoàn toàn không ăn mòn nẹp crom, không làm xỉn màu màng sơn bóng Clear Coat.',
  },
  {
    q: 'Quy trình bảo hành gói phủ Ceramic 9H được thực hiện như thế nào?',
    a: 'Mọi gói phủ Ceramic tại AutoWash Pro đều được cấp thẻ bảo hành điện tử chính hãng từ 2 đến 5 năm. Mỗi 6 tháng, khách hàng được mời quay lại bảo dưỡng màng phủ và phủ bổ sung Top Coat miễn phí.',
  },
  {
    q: 'Tôi có thể theo dõi tiến trình làm sạch xe của mình qua đâu?',
    a: 'Sau khi xe vào khoang, bạn có thể xem trực tiếp tại phòng chờ VIP kính 2 lớp cách âm, hoặc nhận báo cáo hình ảnh trước/sau thi công theo thời gian thực từ Kỹ thuật viên xưởng.',
  },
]

const REVIEWS = [
  {
    name: 'Anh Trần Minh Khoa',
    car: 'Porsche 911 Carrera S',
    comment: 'Tôi đánh giá rất cao độ tỉ mỉ ở đây. Khoang hiệu chỉnh sơn dùng máy Rupes đánh mượt mà không để lại bóng ma chút nào. Nhìn xe bóng như lúc nhận từ salon.',
    stars: 5,
  },
  {
    name: 'Chị Nguyễn Thanh Hà',
    car: 'Mercedes-Maybach GLS 600',
    comment: 'Ghế da Nappa sáng màu của mình bị bẩn lâu ngày, rửa các nơi khác không hết. Vào khoang Spa nội thất hấp hơi nước 140°C của xưởng xong sạch bong thơm tho như xe mới.',
    stars: 5,
  },
  {
    name: 'Anh Phạm Quốc Bảo',
    car: 'BMW 740i Pure Excellence',
    comment: 'Quy trình nhận xe chuyên nghiệp, có bảng check-in hình ảnh đầy đủ. Nút đặt lịch online giữ đúng slot không phải chờ đợi phút nào.',
    stars: 5,
  },
]

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#1470af] selection:text-white font-sans">
      <PublicHeader />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* IDA Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1470af]/10 border border-[#1470af]/20 text-[#1470af] text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
              <Sparkles className="size-3.5 text-[#1470af]" />
              <span>CHUỖI RỬA XE ĐÚNG CÁCH // TIÊU CHUẨN IDA INTERNATIONAL</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Hệ Sinh Thái Detailing & <br />
              <span className="text-[#1470af]">
                Tân Trang Siêu Xe 9H
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Nghệ thuật hiệu chỉnh sơn bóng gương và chăm sóc xe hơi chuyên nghiệp trong khoang kín chuẩn Aerowash #1470AF.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setIsBookingOpen(true)}
                style={{ backgroundColor: '#1470af', color: '#ffffff' }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-[#1470af]/30 transition-all hover:bg-[#0f5f8f] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>ĐẶT LỊCH NGAY</span>
                <ArrowRight className="size-5 text-white" />
              </button>

              <Link
                href="/dich-vu"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 font-semibold text-base transition-all"
              >
                <span>Khám phá 4 khoang dịch vụ</span>
              </Link>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#1470af]" />
                <span>45 Phút Express Wash</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#1470af]" />
                <span>100% Koch-Chemie & Rupes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#1470af]" />
                <span>Bảo hành màng phủ tới 5 năm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="border-b border-slate-200/80 bg-slate-100/70 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="text-center space-y-2">
                  <div className="mx-auto size-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#1470af] mb-3">
                    <Icon className="size-5 text-[#1470af]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-800">{stat.label}</div>
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">{stat.sub}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3. CORE 4 STATIONS SHOWCASE */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-[#1470af]/10 border border-[#1470af]/20 text-[#1470af] font-mono text-xs font-bold uppercase tracking-widest">
            HỆ THỐNG XƯỞNG KHÍ KÍN
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            4 Khoang Detailing Chuyên Biệt
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Mỗi khoang thi công được phân lập quy trình khép kín, trang bị hệ thống lọc khí & chiếu sáng chuyên dụng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STATIONS.map((st) => (
            <div
              key={st.num}
              className="rounded-3xl border border-slate-200 bg-white p-8 flex flex-col justify-between hover:border-[#1470af]/50 transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1470af] tracking-wider">
                    {st.code}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
                    {st.time}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#1470af] transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {st.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="size-4 text-[#1470af] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 block">CHI PHÍ THI CÔNG</span>
                  <span className="text-lg font-bold text-[#1470af] font-mono">{st.price}</span>
                </div>
                <button
                  onClick={() => setIsBookingOpen(true)}
                  style={{ backgroundColor: '#1470af', color: '#ffffff' }}
                  className="px-5 py-2.5 rounded-xl font-bold font-mono text-xs text-white transition-all flex items-center gap-2 hover:bg-[#0f5f8f] cursor-pointer"
                >
                  <span>ĐẶT KHOANG NÀY</span>
                  <ArrowRight className="size-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BEFORE & AFTER SLIDER */}
      <section className="py-20 bg-slate-100/80 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="px-4 py-1.5 rounded-full bg-[#1470af]/10 border border-[#1470af]/20 text-[#1470af] font-mono text-xs font-bold uppercase tracking-widest">
                KIỂM CHỨNG CHẤT LƯỢNG THỰC TẾ
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Sự Khác Biệt Trước & Sau Thi Công
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Kéo thanh trượt để chứng kiến màng sơn xước xỉn màu lột xác thành lớp sơn bóng như gương sau khi xử lý tại khoang kín AutoWash Pro.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <ShieldCheck className="size-5 text-[#1470af] shrink-0" />
                  <span>Cam kết xóa 95%+ vết xước lốc xoáy nhện trên sơn bóng</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <ShieldCheck className="size-5 text-[#1470af] shrink-0" />
                  <span>Nghiệm thu dưới đèn soi khuyết tật Scangrip CRI 96+</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg overflow-hidden">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                <BeforeAfterSlider
                  beforeSrc="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80"
                  afterSrc="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"
                  beforeLabel="TRƯỚC HIỆU CHỈNH"
                  afterLabel="SAU PHỦ CERAMIC 9H"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CHEMICAL & EQUIPMENT PARTNERS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold uppercase tracking-widest">
            HÓA CHẤT & THIẾT BỊ CHÍNH HÃNG
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Đối Tác Chiến Lược Toàn Cầu
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Sử dụng 100% dung dịch và thiết bị cao cấp đạt chuẩn OEM từ Đức, Ý và Đan Mạch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PARTNERS.map((p, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-2xl font-black font-mono text-slate-900">{p.name}</span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">{p.country}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{p.role}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900">Khách Hàng Nói Về Chúng Tôi</h2>
            <p className="text-sm text-slate-600">Trải nghiệm thực tế từ các chủ xe cao cấp tại TP. Thủ Đức & TP.HCM</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                <div className="flex gap-1 text-amber-500">
                  {Array.from({ length: rev.stars }).map((_, s) => (
                    <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <div className="font-bold text-sm text-slate-900">{rev.name}</div>
                  <div className="text-xs font-mono text-[#1470af]">{rev.car}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900">Câu Hỏi Thường Gặp</h2>
          <p className="text-sm text-slate-600">Giải đáp thắc mắc về quy trình dịch vụ và chính sách bảo hành</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-6 text-left font-bold text-base text-slate-900 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`size-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 8. FINAL CTA BANNER */}
      <section
        style={{ backgroundColor: '#1470af' }}
        className="py-20 border-t border-slate-200 text-white select-none"
      >
        <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Sẵn Sàng Cho Sự Lột Xác Của Xế Yêu?
          </h2>
          <p className="text-white/90 max-w-xl mx-auto text-base sm:text-lg">
            Đặt lịch trực tuyến ngay để giữ khoang thi công chuẩn và nhận quà tặng dưỡng kính Hydrophobic độc quyền.
          </p>
          <div>
            <button
              onClick={() => setIsBookingOpen(true)}
              style={{ backgroundColor: '#ffffff', color: '#1470af' }}
              className="inline-flex items-center gap-3 px-9 py-4 rounded-2xl font-bold text-base shadow-xl transition-all hover:bg-slate-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>ĐẶT LỊCH HẸN NGAY</span>
              <ArrowRight className="size-5 text-[#1470af]" />
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* VIP Booking Wizard Overlay Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-2 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-8">
            <button
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <X className="size-5" />
            </button>
            <div className="mb-4 text-center sm:text-left">
              <span className="font-mono text-xs text-[#1470af] uppercase tracking-widest font-semibold">
                TRUNG TÂM ĐẶT LỊCH AUTOWASH PRO
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Đăng Ký Chăm Sóc & Tân Trang Xe
              </h2>
            </div>
            <div className="bg-white rounded-2xl p-4 text-slate-900">
              <BookingWizard />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
