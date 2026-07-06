'use client'

import Link from 'next/link'
import { LogoLink } from '@/components/shared/logo-link'
import { MapPin, Phone, Mail, Clock, ShieldCheck, Award, Sparkles } from 'lucide-react'

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/60 pt-16 pb-12 transition-colors duration-300 dark:bg-card/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="space-y-4 lg:col-span-2">
            <LogoLink />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Hệ sinh thái chăm sóc, hiệu chỉnh và nâng cấp xe hơi cao cấp theo tiêu chuẩn Detailing quốc tế. Sự chỉn chu trong từng khe kẽ bảo vệ tài sản và niềm tự hào của bạn.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-foreground/80">
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2.5 py-1 shadow-sm">
                <ShieldCheck className="size-3.5 text-primary" /> Bảo hành chính hãng
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2.5 py-1 shadow-sm">
                <Award className="size-3.5 text-gold" /> Đạt chuẩn 4.9★ Trustindex
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">Khám phá</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/gioi-thieu" className="transition-colors hover:text-primary">Vè chúng tôi</Link></li>
              <li><Link href="/dich-vu" className="transition-colors hover:text-primary">Hệ sinh thái dịch vụ</Link></li>
              <li><Link href="/san-pham-doi-tac" className="transition-colors hover:text-primary">Đối tác hóa chất</Link></li>
              <li><Link href="/bang-gia" className="transition-colors hover:text-primary">Bảng giá & Ưu đãi</Link></li>
              <li><Link href="/thu-vien" className="transition-colors hover:text-primary">Thư viện Before/After</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">Dịch vụ cốt lõi</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/dich-vu" className="transition-colors hover:text-primary">Rửa xe chi tiết (WASH)</Link></li>
              <li><Link href="/dich-vu" className="transition-colors hover:text-primary">Phủ Ceramic S1 & S2</Link></li>
              <li><Link href="/dich-vu" className="transition-colors hover:text-primary">Vệ sinh nội thất Super Clean</Link></li>
              <li><Link href="/dich-vu" className="transition-colors hover:text-primary">Dán PPF & Phim cách nhiệt</Link></li>
              <li><Link href="/dich-vu" className="transition-colors hover:text-primary">Khử mùi xông ion C-Air Fog</Link></li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">Trung tâm dịch vụ</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>7 Đ. D1, Tăng Nhơn Phú, TP. Thủ Đức, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                <a href="tel:0901234567" className="font-mono font-medium text-foreground hover:text-primary">090 123 4567</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-primary" />
                <span className="font-mono text-xs">07:00 – 18:30 (Thứ 2 – CN)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-border/60 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 AutoWash Pro. Bảo lưu mọi quyền. Value of Excellent Service.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Chính sách bảo hành</a>
            <a href="#" className="hover:text-foreground">Điều khoản đặt lịch</a>
            <a href="#" className="hover:text-foreground">Bảo mật thông tin</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
