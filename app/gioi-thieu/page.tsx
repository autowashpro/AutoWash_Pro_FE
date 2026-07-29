'use client'

import React from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { ShieldCheck, Award, Wrench, Sparkles, ArrowRight } from 'lucide-react'

export default function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <PublicHeader />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-32 pb-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1470af]/20 bg-[#1470af]/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[#1470af]">
              <Sparkles className="size-3.5 text-[#1470af]" />
              AGENCY OF EXCELLENCE IN AUTOMOTIVE DETAILING
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
              Định nghĩa lại chuẩn mực chăm sóc xe sang tại Việt Nam.
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl leading-relaxed">
              Tại AutoWash Pro, mỗi chiếc xe không chỉ là phương tiện di chuyển, mà là một tác phẩm cơ khí chính xác và tài sản giá trị của chủ nhân. Chúng tôi kiên quyết từ chối cạnh tranh bằng giá rẻ hay làm ẩu, chúng tôi cạnh tranh bằng sự hoàn hảo trong từng micromet bề mặt.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="/customer/dat-lich">
                <button
                  style={{ backgroundColor: '#1470af', color: '#ffffff' }}
                  className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-[#0f5f8f]"
                >
                  <span>Đặt lịch trải nghiệm ngay</span>
                  <ArrowRight className="size-4 text-white" />
                </button>
              </Link>
              <Link href="/dich-vu">
                <button className="rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-8 py-4 font-semibold text-slate-800 transition-all">
                  Khám phá 4 khoang công nghệ
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Excellence */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1470af]">// INTERNATIONAL BENCHMARK</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            4 Trụ cột chất lượng bất di bất dịch.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Mọi quy trình thi công đều tuân thủ kỷ luật phòng Lab khắt khe, tuyệt đối không gây tổn hại bề mặt sơn zin hay nội thất da Nappa tự nhiên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-sm">
            <div className="size-12 rounded-2xl bg-[#1470af]/10 border border-[#1470af]/20 flex items-center justify-center text-[#1470af]">
              <ShieldCheck className="size-6 text-[#1470af]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Quy trình chạm dung dịch 12 bước chuẩn Đức</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Sử dụng 100% dung dịch bọt tuyết trung tính Koch-Chemie kết hợp kỹ thuật 2 xô (Two-Bucket Method) với lưới lọc cặn Grit Guard, loại bỏ triệt để cát sỏi trước khi xoa găng tay cừu mềm mại lên bề mặt sơn.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-[#1470af] font-bold">
              <span>CERTIFIED KOCH-CHEMIE PROTOCOL</span>
              <span>STEP 01 → STEP 12</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-sm">
            <div className="size-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Award className="size-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Kỹ thuật viên Master IDA</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Đội ngũ nghệ nhân thi công tối thiểu 3 năm kinh nghiệm, được huấn luyện và kiểm định tay nghề định kỳ theo chuẩn Hiệp hội Detailing Quốc tế (International Detailing Association).
            </p>
            <div className="pt-4 border-t border-slate-100 text-xs font-mono text-amber-600 font-bold">
              IDA CERTIFIED CRAFTSMEN
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-sm">
            <div className="size-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Wrench className="size-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Hệ sinh thái máy Rupes Ý</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Máy đánh bóng Dual-Action độ lệch tâm 21mm kết hợp phớt mút tế bào hở, đảm bảo nhiệt độ ma sát trên sơn luôn dưới 42°C, tuyệt đối không gây cháy sơn hay holographic bóng ma.
            </p>
            <div className="pt-4 border-t border-slate-100 text-xs font-mono text-indigo-600 font-bold">
              RUPES DUAL-ACTION 21MM
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-sm">
            <div className="size-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Sparkles className="size-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Phòng Lab kiểm nghiệm đèn Scangrip CRI 96+</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Hệ thống chiếu sáng đa nhiệt độ màu 2700K - 6500K tái tạo chính xác ánh sáng mặt trời giữa trưa. Khách hàng trực tiếp soi từng vết xước xoáy kính cùng quản lý xưởng trước khi nghiệm thu.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-emerald-600 font-bold">
              <span>ZERO HOLOGRAPHIC GUARANTEE</span>
              <span>100% INSPECTION PASSED</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: '#1470af' }} className="py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Sẵn sàng nâng tầm đẳng cấp cho chiếc xe của bạn?
          </h2>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
            Đặt lịch trước để khoang VIP kỹ thuật số được chuẩn bị riêng cùng chuyên gia kiểm tra khuyết tật sơn.
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
