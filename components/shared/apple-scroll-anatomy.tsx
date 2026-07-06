'use client'

import React, { useState } from 'react'
import { SpotlightCard } from '@/components/shared/spotlight-card'
import { Layers, CheckCircle2, ShieldAlert, Droplets, Wrench, Sparkles } from 'lucide-react'

interface AnatomyStage {
  step: number
  id: string
  title: string
  subtitle: string
  icon: any
  color: string
  problemOrSolution: string
  technicalDetails: string[]
}

const ANATOMY_STAGES: AnatomyStage[] = [
  {
    step: 0,
    id: 'defect',
    title: 'Tầng 0: Khuyết Tật Nguyên Bản',
    subtitle: 'Soi dưới đèn nhiệt độ màu Scangrip 5000K',
    icon: ShieldAlert,
    color: 'text-rose-500 border-rose-500/30 bg-rose-500/10',
    problemOrSolution: 'Bề mặt sơn đầy rẫy vết xoáy nhện (Swirl Marks) bợt màu do rửa xe bằng giẻ bẩn bám cát và cọ cước cứng.',
    technicalDetails: [
      'Gây khúc xạ ánh sáng hỗn loạn làm xe mất độ bóng 40%',
      'Cặn canxi nước mưa ăn sâu vào lớp bóng Clear Coat',
      'Nhựa nhám ngoại thất bị oxy hóa trắng xám',
    ],
  },
  {
    step: 1,
    id: 'wash',
    title: 'Tầng 1: Rửa Bọt Tuyết 3 Xô',
    subtitle: 'Loại bỏ khoáng cặn không làm xước sơn',
    icon: Droplets,
    color: 'text-sky-500 border-sky-500/30 bg-sky-500/10',
    problemOrSolution: 'Sử dụng bọt tuyết Koch-Chemie GSF pH trung tính mềm hóa cặn bẩn, tách mạt khoáng bằng lưới lọc Grit Guard.',
    technicalDetails: [
      'Xịt gầm áp lực cao tẩy bùn đất cặn bẩn',
      'Tẩy cặn sắt mâm lốp bằng dung dịch đổi màu tím chuyên dụng',
      'Dùng cọ lông mềm không tĩnh điện vệ sinh khe kẽ logo',
    ],
  },
  {
    step: 2,
    id: 'polish',
    title: 'Tầng 2: Hiệu Chỉnh Sơn Kép Dual-Action',
    subtitle: 'Sử dụng máy quỹ đạo lớn Rupes LHR21',
    icon: Wrench,
    color: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    problemOrSolution: 'Bào mòn tối thiểu lớp bóng zin (chỉ 1-2 micron) để làm phẳng hoàn toàn 85-92% vết xước dăm xoáy kính.',
    technicalDetails: [
      'Bước 1: Cắt xước nặng bằng xi Meguiar\'s M105 & phớt lông cừu',
      'Bước 2: Xóa vầng hologram & tạo bóng gương sâu bằng xi M205',
      'Độ dày lớp sơn zin được đo lường cẩn thận trước thi công',
    ],
  },
  {
    step: 3,
    id: 'ceramic',
    title: 'Tầng 3: Phủ Màng Thủy Tinh Ceramic 9H',
    subtitle: 'Khóa bóng 24 tháng & Kháng nước lá sen',
    icon: Sparkles,
    color: 'text-primary border-primary/30 bg-primary/10',
    problemOrSolution: 'Hợp chất Silicon Dioxide (SiO2) liên kết phân tử với sơn xe tạo thành lớp giáp thủy tinh có độ cứng 9H.',
    technicalDetails: [
      'Kháng tia UV ngăn chặn tuyệt đối tình trạng ngả vàng sơn trắng',
      'Hiệu ứng trôi nước lá sen góc tiếp xúc >110 độ rửa xe cực nhàn',
      'Gia nhiệt bằng đèn sấy hồng ngoại IR bảo đảm độ cứng tối đa',
    ],
  },
]

export function AppleScrollAnatomy() {
  const [activeStep, setActiveStep] = useState<number>(3)

  const currentStage = ANATOMY_STAGES[activeStep]
  const CurrentIcon = currentStage.icon

  return (
    <section className="py-24 sm:py-32 border-b border-border/60 bg-card/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Layers className="size-3.5" />
            Apple Scroll-Telling Anatomy
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Lột tả 4 tầng thi công Detailing
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed text-base sm:text-lg">
            Sự chỉn chu nằm sâu dưới từng lớp bóng. Chọn từng tầng thi công để khám phá cách AutoWash Pro phục hồi và bảo vệ chiếc xe của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
          {/* Left: Interactive Step Selector */}
          <div className="lg:col-span-5 space-y-3">
            {ANATOMY_STAGES.map((stage) => {
              const isSelected = stage.step === activeStep
              const StageIcon = stage.icon

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStep(stage.step)}
                  className={`w-full text-left rounded-2xl p-5 transition-all duration-300 border flex items-center justify-between ${
                    isSelected
                      ? 'bg-card border-primary shadow-sm ring-1 ring-primary/40'
                      : 'border-border/60 bg-background/60 hover:bg-card/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`flex size-10 items-center justify-center rounded-xl border ${stage.color}`}>
                      <StageIcon className="size-5" />
                    </span>
                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        STAGE 0{stage.step}
                      </div>
                      <div className={`font-bold text-base mt-0.5 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {stage.title}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-muted-foreground">
                    {isSelected ? '●' : '○'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right: Detailed Stage Technical Spec Card */}
          <div className="lg:col-span-7">
            <SpotlightCard className="p-8 sm:p-10 border-border/80 min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">ANATOMY LEVEL {currentStage.step}/3</span>
                  <span className="font-mono text-xs text-muted-foreground">{currentStage.subtitle}</span>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span className={`flex size-12 items-center justify-center rounded-xl border ${currentStage.color}`}>
                    <CurrentIcon className="size-6" />
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold">{currentStage.title}</h3>
                </div>

                <p className="mt-4 text-base leading-relaxed text-muted-foreground font-medium">
                  {currentStage.problemOrSolution}
                </p>

                <div className="mt-8 border-t border-border/60 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                    Tiêu chuẩn kỹ thuật áp dụng:
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {currentStage.technicalDetails.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-foreground/90">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground font-mono">
                <span>Khuyến nghị kiểm tra định kỳ mỗi 6 tháng</span>
                <span>VALUE OF EXCELLENT SERVICE</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  )
}
