'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ShowroomStation {
  id: string
  code: string
  title: string
  category: string
  badgeColor: string
  price: string
  duration: string
  description: string
  specs: string[]
}

const STATIONS: ShowroomStation[] = [
  {
    id: 's01',
    code: 'STATION 01 // HIGH-SPEED EXPRESS',
    title: 'Khoang Rửa Kỹ Thuật Số WASH',
    category: 'WASH BAY',
    badgeColor: 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10',
    price: 'Từ 150.000đ',
    duration: '45 Phút',
    description: 'Quy trình rửa không chạm kết hợp cọ lông cừu tự nhiên và dung dịch pH trung tính Koch-Chemie GSF. Ngăn chặn tuyệt đối 100% rủi ro xước dăm lốc xoáy trên bề mặt sơn bóng.',
    specs: [
      'Hệ thống nước lọc RO tinh khiết không để lại cặn mốc khoáng',
      'Xịt áp lực cao gầm lốp & hốc bánh tẩy mùn than phanh',
      'Dưỡng bóng cản nhựa đen ngoại thất chống lão hóa UV',
      'Lau sấy viền cửa bằng khăn Microfiber sợi xoắn 1200 GSM',
    ],
  },
  {
    id: 's02',
    code: 'STATION 02 // DUAL-ACTION CORRECTION',
    title: 'Phòng Kín Hiệu Chỉnh FLEX',
    category: 'STUDIO FLEX',
    badgeColor: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10',
    price: 'Từ 1.800.000đ',
    duration: '3 - 6 Giờ',
    description: 'Soi dưới giàn đèn rọi Scangrip CRI 96+ chuyên dụng. Kỹ thuật viên chứng nhận thực hiện hiệu chỉnh sơn kép xóa vết xoáy nhện, bào mòn Clear Coat tối thiểu chỉ 1 micron.',
    specs: [
      'Đo độ dày màng sơn bằng máy siêu âm kỹ thuật số trước khi đánh',
      'Sử dụng xi đánh bóng gốc nước Rupes D-A Fine không chứa Silicon trét lấp',
      'Khôi phục độ sáng bóng gương như vừa xuất xưởng nhà máy',
      'Khử màng dầu & xám mờ kính lái tăng tầm nhìn ban đêm',
    ],
  },
  {
    id: 's03',
    code: 'STATION 03 // NAPPA INTERIOR SPA',
    title: 'Phòng Lab Chăm Sóc Nội Thất',
    category: 'INTERIOR LAB',
    badgeColor: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10',
    price: 'Từ 1.200.000đ',
    duration: '180 Phút',
    description: 'Làm sạch sâu từng khe kẽ ghế da Nappa, Alcantara bằng hơi nước nóng bão hòa 140°C cùng dung dịch da liễu Leather Star. Diệt khuẩn tận gốc hệ thống điều hòa bằng khí Ozone.',
    specs: [
      'Giặt hấp hơi nước nóng tiêu diệt 99.9% nấm mốc & vi khuẩn gây mùi',
      'Phủ dưỡng vitamin E giữ độ đàn hồi mềm mại cho ghế da sang trọng',
      'Vệ sinh chi tiết cụm phím Piano Black không gây xước mờ',
      'Khử mùi thuốc lá, mùi xe mới bằng công nghệ Bio-Enzyme hữu cơ',
    ],
  },
  {
    id: 's04',
    code: 'STATION 04 // CERAMIC 9H ARMOR',
    title: 'Khoang Phủ Giáp Thủy Tinh VIP',
    category: 'CERAMIC 9H',
    badgeColor: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    price: 'Từ 4.500.000đ',
    duration: '24 Giờ',
    description: 'Phủ màng pha lê tinh khiết Silicon Dioxide (SiO2) độ cứng 9H tạo trường lực chống trầy xước nhẹ, kháng axit nước mưa và phân chim. Khóa bóng sâu vĩnh cửu lên đến 24 tháng.',
    specs: [
      'Sấy hồng ngoại ngắn (Short-wave Infrared) kết tinh màng gốm sâu thẳm',
      'Hiệu ứng lá sen trôi nước siêu việt với góc tiếp xúc >110 độ',
      'Bảo hành chính hãng màng phủ bong tróc 2 năm kèm bảo dưỡng định kỳ',
      'Tặng gói chăm sóc kính lái hydrophobic chống bám nước mưa',
    ],
  },
]

export function HorizontalShowroomTrack() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    const track = trackRef.current
    if (!el || !track) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        const progress = self.progress
        const maxTranslate = (STATIONS.length - 1) / STATIONS.length // 0.75 for 4 items
        track.style.transform = `translate3d(-${progress * maxTranslate * 100}%, 0, 0)`
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[250vh] bg-slate-50 dark:bg-[#070911] text-slate-900 dark:text-white transition-colors duration-500">
      {/* Sticky Showroom Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between border-y border-slate-200 dark:border-white/10">
        {/* Top Header Label */}
        <div className="p-6 sm:p-10 flex items-center justify-between z-10 bg-slate-50/90 dark:bg-[#070911]/90 backdrop-blur-md">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
              // HORIZONTAL SHOWROOM TRACK
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Hệ sinh thái 4 Khoang Detailing Tiêu chuẩn Lab
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>SCROLL HORIZONTALLY</span>
            <ArrowRight className="size-4 animate-bounce" />
          </div>
        </div>

        {/* Horizontal Moving Track */}
        <div ref={trackRef} className="flex w-[400vw] h-full items-center transition-transform duration-75 will-change-transform">
          {STATIONS.map((station, idx) => (
            <div key={station.id} className="w-screen h-full flex items-center justify-center p-6 sm:p-12">
              <div className="w-full max-w-5xl rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0c0f1c] p-8 sm:p-12 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col justify-between h-[72vh] transition-colors duration-500">
                {/* Subtle Station Number Watermark */}
                <span className="absolute -right-6 -bottom-10 font-mono text-[160px] font-black text-slate-100 dark:text-white/[0.02] select-none pointer-events-none leading-none">
                  0{idx + 1}
                </span>

                <div className="space-y-6 relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className={`rounded-full border px-3.5 py-1 text-xs font-mono font-bold ${station.badgeColor}`}>
                      {station.code}
                    </span>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span>THỜI GIAN: <strong className="text-slate-900 dark:text-white">{station.duration}</strong></span>
                      <span>•</span>
                      <span>CHI PHÍ: <strong className="text-primary font-bold">{station.price}</strong></span>
                    </div>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {station.title}
                  </h3>

                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                    {station.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                    {station.specs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="inline-block size-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>TRẠNG THÁI KHOANG: SẴN SÀNG TIẾP NHẬN</span>
                  </div>
                  <Link href="/customer/dat-lich">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95">
                      Đặt khoang này ngay <ArrowRight className="size-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
