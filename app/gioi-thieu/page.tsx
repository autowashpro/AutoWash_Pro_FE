'use client'

import React from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { SpotlightCard } from '@/components/shared/spotlight-card'
import { MagneticButton } from '@/components/shared/magnetic-button'
import { ShieldCheck, Award, Wrench, Sparkles, CheckCircle2, ArrowRight, Layers, Users, Zap, Compass, HeartHandshake } from 'lucide-react'

export default function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-[#05060A] text-white overflow-x-hidden">
      <PublicHeader />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-36 pb-28 border-b border-white/10 bg-gradient-to-b from-[#0A0D16] to-[#05060A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-sky-400">
              <Sparkles className="size-3.5 animate-spin" />
              AGENCY OF EXCELLENCE IN AUTOMOTIVE DETAILING
            </span>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Định nghĩa lại chuẩn mực chăm sóc xe sang tại Việt Nam.
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed text-slate-300 max-w-3xl">
              Tại AutoWash Pro, mỗi chiếc xe không chỉ là phương tiện di chuyển, mà là một tác phẩm cơ khí chính xác và tài sản giá trị của chủ nhân. Chúng tôi kiên quyết từ chối cạnh tranh bằng giá rẻ hay làm ẩu, chúng tôi cạnh tranh bằng sự hoàn hảo trong từng micromet bề mặt.
            </p>

            <div className="pt-6 flex flex-wrap items-center gap-6">
              <Link href="/customer/dat-lich">
                <MagneticButton className="group flex items-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-base font-bold text-white shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <span>Đặt lịch trải nghiệm ngay</span>
                  <div className="ml-3 flex size-8 items-center justify-center rounded-full bg-black/20 transition-transform group-hover:translate-x-1">
                    <ArrowRight className="size-4 text-white" />
                  </div>
                </MagneticButton>
              </Link>
              <Link href="/dich-vu">
                <button className="rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10 hover:border-white/30">
                  Khám phá 4 khoang công nghệ
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetrical Bento Grid: 4 Pillars of Excellence */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-3xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-400">// INTERNATIONAL BENCHMARK</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white">
              4 Trụ cột chất lượng bất di bất dịch.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300">
              Mọi quy trình thi công đều tuân thủ kỷ luật phòng Lab khắt khe, tuyệt đối không gây tổn hại bề mặt sơn zin hay nội thất da Nappa tự nhiên.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Card 1: Large Span (col-span-8) */}
            <div className="md:col-span-8 rounded-[2.5rem] border border-white/15 bg-white/[0.02] p-2">
              <div className="h-full rounded-[2.1rem] bg-gradient-to-br from-[#0D111D] to-[#080A12] p-8 sm:p-12 flex flex-col justify-between border border-white/5 shadow-2xl">
                <div>
                  <div className="size-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-8">
                    <ShieldCheck className="size-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Quy trình chạm dung dịch 12 bước chuẩn Đức</h3>
                  <p className="mt-4 text-slate-300 leading-relaxed text-base sm:text-lg">
                    Sử dụng 100% dung dịch bọt tuyết trung tính Koch-Chemie kết hợp kỹ thuật 2 xô (Two-Bucket Method) với lưới lọc cặn Grit Guard, loại bỏ triệt để cát sỏi trước khi xoa găng tay cừu mềm mại lên bề mặt sơn.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-sky-400">
                  <span>CERTIFIED KOCH-CHEMIE PROTOCOL</span>
                  <span>STEP 01 → STEP 12</span>
                </div>
              </div>
            </div>

            {/* Card 2: Side Span (col-span-4) */}
            <div className="md:col-span-4 rounded-[2.5rem] border border-white/15 bg-white/[0.02] p-2">
              <div className="h-full rounded-[2.1rem] bg-gradient-to-br from-[#0D111D] to-[#080A12] p-8 flex flex-col justify-between border border-white/5 shadow-2xl">
                <div>
                  <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-8">
                    <Award className="size-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Kỹ thuật viên Master IDA</h3>
                  <p className="mt-4 text-slate-300 leading-relaxed text-sm">
                    Đội ngũ nghệ nhân thi công tối thiểu 3 năm kinh nghiệm, được huấn luyện và kiểm định tay nghề định kỳ theo chuẩn Hiệp hội Detailing Quốc tế (International Detailing Association).
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/10 text-xs font-mono text-amber-400">
                  IDA CERTIFIED CRAFTSMEN
                </div>
              </div>
            </div>

            {/* Card 3: Side Span (col-span-4) */}
            <div className="md:col-span-4 rounded-[2.5rem] border border-white/15 bg-white/[0.02] p-2">
              <div className="h-full rounded-[2.1rem] bg-gradient-to-br from-[#0D111D] to-[#080A12] p-8 flex flex-col justify-between border border-white/5 shadow-2xl">
                <div>
                  <div className="size-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-8">
                    <Wrench className="size-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Hệ sinh thái máy Rupes Ý</h3>
                  <p className="mt-4 text-slate-300 leading-relaxed text-sm">
                    Máy đánh bóng Dual-Action độ lệch tâm 21mm kết hợp phớt mút tế bào hở, đảm bảo nhiệt độ ma sát trên sơn luôn dưới 42°C, tuyệt đối không gây cháy sơn hay holographic bóng ma.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/10 text-xs font-mono text-purple-400">
                  RUPES DUAL-ACTION 21MM
                </div>
              </div>
            </div>

            {/* Card 4: Large Span (col-span-8) */}
            <div className="md:col-span-8 rounded-[2.5rem] border border-white/15 bg-white/[0.02] p-2">
              <div className="h-full rounded-[2.1rem] bg-gradient-to-br from-[#0D111D] to-[#080A12] p-8 sm:p-12 flex flex-col justify-between border border-white/5 shadow-2xl">
                <div>
                  <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8">
                    <Sparkles className="size-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Phòng Lab kiểm nghiệm đèn Scangrip CRI 96+</h3>
                  <p className="mt-4 text-slate-300 leading-relaxed text-base sm:text-lg">
                    Hệ thống chiếu sáng đa nhiệt độ màu 2700K - 6500K tái tạo chính xác ánh sáng mặt trời giữa trưa. Khách hàng trực tiếp soi từng vết xước xoáy kính cùng quản lý xưởng trước khi nghiệm thu.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span>ZERO HOLOGRAPHIC GUARANTEE</span>
                  <span>100% INSPECTION PASSED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Double-Bezel CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[3rem] border border-white/20 bg-white/[0.03] p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
            <div className="rounded-[2.6rem] bg-gradient-to-r from-[#0C1222] via-[#080D1A] to-[#0E1528] p-10 sm:p-16 text-center border border-white/10 relative overflow-hidden">
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-400">// PRESTIGE VIP RESERVATION</span>
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                  Sẵn sàng nâng tầm đẳng cấp cho chiếc xe của bạn?
                </h2>
                <p className="text-slate-300 text-base sm:text-lg">
                  Đặt lịch trước để khoang VIP kỹ thuật số được chuẩn bị riêng cùng chuyên gia kiểm tra khuyết tật sơn.
                </p>
                <div className="pt-4 flex justify-center">
                  <Link href="/customer/dat-lich">
                    <MagneticButton className="group flex items-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:scale-[1.03]">
                      <span>Đặt khoang chăm sóc VIP ngay</span>
                      <div className="ml-3 flex size-8 items-center justify-center rounded-full bg-black/20 transition-transform group-hover:translate-x-1">
                        <ArrowRight className="size-4 text-white" />
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
