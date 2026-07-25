"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Search,
  Car,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  X,
  Upload,
  Bot,
  Layers,
  HelpCircle,
  BookmarkCheck,
  Zap,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getAllBrands,
  searchCars,
  detectVehicleSize,
  type CarBrandInfo,
  type CarModelInfo,
  type VehicleSize,
} from "@/lib/car-database"
import { cn } from "@/lib/utils"

const SIZE_DISPLAY_CONFIG: Record<
  VehicleSize,
  {
    badgeText: string
    title: string
    sub: string
    bgColor: string
    textColor: string
    borderColor: string
    badgeBg: string
    desc: string
  }
> = {
  SMALL: {
    badgeText: "SMALL (SIZE S)",
    title: "XE CỠ NHỎ (SIZE S)",
    sub: "4-5 chỗ nhỏ gọn: Hatchback, Sedan hạng A/B, Mini EV",
    bgColor: "bg-emerald-50 text-emerald-900 border-emerald-200",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    badgeBg: "bg-emerald-500 text-white font-black",
    desc: "Kích thước xe gọn nhẹ dưới 4.4m. Thời gian rửa nhanh chóng, phù hợp đi lại đô thị hàng ngày.",
  },
  MEDIUM: {
    badgeText: "MEDIUM (SIZE M)",
    title: "XE CỠ VỪA (SIZE M)",
    sub: "Sedan D / CUV 5 chỗ / MPV cỡ vừa",
    bgColor: "bg-amber-50 text-amber-900 border-amber-200",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    badgeBg: "bg-amber-500 text-slate-950 font-black",
    desc: "Kích thước xe trung bình 4.4m - 4.8m. Bao gồm các dòng CUV phổ thông, Sedan hạng D và MPV gia đình.",
  },
  LARGE: {
    badgeText: "LARGE (SIZE L)",
    title: "XE CỠ LỚN (SIZE L)",
    sub: "SUV 7 chỗ / Bán tải (Pickup) / MPV cỡ đại",
    bgColor: "bg-purple-50 text-purple-900 border-purple-200",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    badgeBg: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black",
    desc: "Kích thước xe lớn trên 4.8m. Khung gầm cao, diện tích bề mặt lớn cần kỹ thuật chăm sóc đặc biệt.",
  },
}

// Brand Logo styling & color accents for professional look
const BRAND_METADATA: Record<string, { logoBg: string; logoColor: string; accent: string }> = {
  vinfast: { logoBg: "bg-blue-600", logoColor: "text-white", accent: "from-blue-600 to-indigo-700" },
  toyota: { logoBg: "bg-red-600", logoColor: "text-white", accent: "from-red-600 to-rose-700" },
  honda: { logoBg: "bg-red-700", logoColor: "text-white", accent: "from-red-700 to-red-900" },
  hyundai: { logoBg: "bg-sky-700", logoColor: "text-white", accent: "from-sky-700 to-blue-900" },
  kia: { logoBg: "bg-rose-700", logoColor: "text-white", accent: "from-rose-700 to-red-800" },
  ford: { logoBg: "bg-blue-800", logoColor: "text-white", accent: "from-blue-800 to-indigo-950" },
  mazda: { logoBg: "bg-slate-800", logoColor: "text-white", accent: "from-slate-800 to-slate-950" },
  mercedes: { logoBg: "bg-slate-900", logoColor: "text-slate-100", accent: "from-slate-900 to-zinc-950" },
  bmw: { logoBg: "bg-blue-700", logoColor: "text-white", accent: "from-blue-700 to-slate-900" },
  audi: { logoBg: "bg-slate-950", logoColor: "text-white", accent: "from-slate-900 to-black" },
  lexus: { logoBg: "bg-slate-900", logoColor: "text-amber-400", accent: "from-slate-900 to-stone-900" },
  porsche: { logoBg: "bg-amber-950", logoColor: "text-amber-400", accent: "from-amber-950 to-stone-900" },
  mitsubishi: { logoBg: "bg-red-600", logoColor: "text-white", accent: "from-red-600 to-slate-900" },
  nissan: { logoBg: "bg-red-700", logoColor: "text-white", accent: "from-red-700 to-slate-900" },
  suzuki: { logoBg: "bg-blue-600", logoColor: "text-white", accent: "from-blue-600 to-red-600" },
  subaru: { logoBg: "bg-blue-700", logoColor: "text-white", accent: "from-blue-700 to-indigo-900" },
  peugeot: { logoBg: "bg-blue-900", logoColor: "text-white", accent: "from-blue-900 to-slate-950" },
  mg: { logoBg: "bg-red-600", logoColor: "text-white", accent: "from-red-600 to-slate-900" },
  wuling: { logoBg: "bg-red-500", logoColor: "text-white", accent: "from-red-500 to-slate-800" },
  byd: { logoBg: "bg-slate-900", logoColor: "text-white", accent: "from-slate-900 to-blue-950" },
  volvo: { logoBg: "bg-slate-800", logoColor: "text-white", accent: "from-slate-800 to-slate-950" },
  volkswagen: { logoBg: "bg-blue-800", logoColor: "text-white", accent: "from-blue-800 to-blue-950" },
  skoda: { logoBg: "bg-emerald-700", logoColor: "text-white", accent: "from-emerald-700 to-slate-900" },
  isuzu: { logoBg: "bg-red-600", logoColor: "text-white", accent: "from-red-600 to-slate-900" },
  landrover: { logoBg: "bg-emerald-900", logoColor: "text-emerald-100", accent: "from-emerald-900 to-slate-950" },
  jeep: { logoBg: "bg-amber-900", logoColor: "text-amber-100", accent: "from-amber-900 to-slate-900" },
  maserati: { logoBg: "bg-blue-950", logoColor: "text-amber-400", accent: "from-blue-950 to-slate-900" },
  astonmartin: { logoBg: "bg-emerald-950", logoColor: "text-emerald-300", accent: "from-emerald-950 to-slate-900" },
  bentley: { logoBg: "bg-slate-900", logoColor: "text-amber-300", accent: "from-slate-900 to-stone-900" },
  chevrolet: { logoBg: "bg-amber-700", logoColor: "text-white", accent: "from-amber-700 to-slate-900" },
  omoda_jaecoo: { logoBg: "bg-cyan-800", logoColor: "text-white", accent: "from-cyan-800 to-slate-900" },
  lynk_co: { logoBg: "bg-slate-900", logoColor: "text-cyan-400", accent: "from-slate-900 to-cyan-950" },
  haval: { logoBg: "bg-blue-900", logoColor: "text-white", accent: "from-blue-900 to-slate-900" },
  gac: { logoBg: "bg-slate-800", logoColor: "text-white", accent: "from-slate-800 to-slate-950" },
  hongqi: { logoBg: "bg-red-900", logoColor: "text-amber-300", accent: "from-red-900 to-slate-950" },
  ram: { logoBg: "bg-stone-900", logoColor: "text-red-500", accent: "from-stone-900 to-slate-950" },
}

export default function CarClassificationPage() {
  const router = useRouter()
  const allBrands = getAllBrands()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBrand, setSelectedBrand] = useState<CarBrandInfo | null>(null)
  
  // Selected Model Modal
  const [selectedModel, setSelectedModel] = useState<{
    brandName: string
    model: CarModelInfo
  } | null>(null)

  // AI Suggestion Modal State
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false)
  const [suggestInput, setSuggestInput] = useState("")
  const [suggestFile, setSuggestFile] = useState<File | null>(null)
  const [aiResult, setAiResult] = useState<{
    brandName: string
    modelName: string
    size: VehicleSize
    categoryText: string
    reason: string
    confidencePct: number
  } | null>(null)

  const searchResults = searchQuery ? searchCars(searchQuery) : []

  const handleSelectBrand = (brand: CarBrandInfo) => {
    setSelectedBrand(brand)
    setSearchQuery("")
  }

  const handleSelectModel = (brandName: string, model: CarModelInfo) => {
    setSelectedModel({ brandName, model })
  }

  const handleRunAiSuggestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggestInput.trim() && !suggestFile) return

    const inputName = suggestInput.trim() || suggestFile?.name.replace(/\.[^/.]+$/, "") || "Xe lạ"
    const detected = detectVehicleSize("Custom", inputName)

    setAiResult({
      brandName: detected.matchedModelName ? "Hệ Thống Phân Tích AI" : "Tùy Chỉnh",
      modelName: inputName,
      size: detected.size,
      categoryText: detected.categoryText,
      reason: detected.reason,
      confidencePct: detected.confidencePct,
    })
  }

  const handleProceedToBooking = (brand: string, model: string, size: VehicleSize) => {
    router.push(
      `/customer/dat-lich?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(
        model
      )}&size=${size}`
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/90 border-b border-border shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm p-1.5 group-hover:scale-105 transition-all">
              <Image src="/images/logo-awp.png" alt="AutoWash Pro Logo" width={40} height={40} className="size-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-foreground">AutoWash Pro</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                  Cổng Tra Cứu
                </span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">Hướng Dẫn Phân Loại Kích Thước Xe Ô TÔ 2026</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/customer/dat-lich">
              <Button className="rounded-xl h-11 px-5 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105">
                <Sparkles className="size-4 mr-2" />
                Đặt Lịch Online
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* HERO TITLE BLOCK - BENTO CARD STYLE */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-blue-50/50 p-8 sm:p-10 shadow-sm text-center max-w-4xl mx-auto space-y-4">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-xs">
            <ShieldCheck className="size-4 text-primary" />
            Tra cứu chuẩn mực kích thước xe rửa tại tiệm AutoWash Pro
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Phân Loại <span className="text-primary">Size Xe Ô Tô</span>
          </h1>

          <p className="text-sm sm:text-base font-medium text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tra cứu nhanh kích thước xe của bạn (Size S / M / L) theo Hãng và Dòng xe để xem bảng giá dịch vụ và thời gian chăm sóc tối ưu.
          </p>

          {/* SEARCH BAR */}
          <div className="max-w-2xl mx-auto pt-2 space-y-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Nhập tên xe nhanh... (VD: VF7, Camry, Macan, Ranger, VF8, Vios...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-14 text-base font-bold bg-background border-2 border-border focus:border-primary focus:ring-primary/20 rounded-2xl shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setAiResult(null)
                  setSuggestInput("")
                  setIsSuggestModalOpen(true)
                }}
                className="h-11 rounded-xl font-bold border-amber-300 bg-amber-50/50 text-amber-900 hover:bg-amber-100 hover:border-amber-400 shadow-2xs transition-all"
              >
                <Bot className="size-4.5 mr-2 text-amber-600" />
                Không thấy xe? Gợi ý nhanh (AI)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedBrand(null)
                  setSearchQuery("")
                }}
                className="h-11 rounded-xl font-bold border-border bg-background text-foreground hover:bg-slate-100 transition-all"
              >
                <Layers className="size-4.5 mr-2 text-primary" />
                Xem tất cả 35+ Hãng Xe A-Z
              </Button>
            </div>
          </div>
        </div>

        {/* SEARCH RESULTS OVERLAY */}
        {searchQuery.trim() !== "" && (
          <div className="space-y-4 max-w-4xl mx-auto bg-card border border-border rounded-3xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Search className="size-4 text-primary" />
                Kết quả tìm kiếm cho từ khóa &quot;<span className="text-primary font-extrabold">{searchQuery}</span>&quot; ({searchResults.length})
              </h3>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <HelpCircle className="size-12 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-semibold text-muted-foreground">Không tìm thấy dòng xe phù hợp trong kho dữ liệu chuẩn.</p>
                <Button
                  size="sm"
                  onClick={() => {
                    setSuggestInput(searchQuery)
                    setIsSuggestModalOpen(true)
                  }}
                  className="rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  <Bot className="size-4 mr-1.5" />
                  Dùng AI Gợi ý cho &quot;{searchQuery}&quot;
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {searchResults.map((item, idx) => {
                  const sizeConf = SIZE_DISPLAY_CONFIG[item.size]
                  return (
                    <div
                      key={idx}
                      onClick={() =>
                        handleSelectModel(item.brandName, {
                          name: item.modelName,
                          size: item.size,
                          categoryText: item.categoryText,
                        })
                      }
                      className="rounded-2xl border border-border bg-background p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {item.brandName}
                          </span>
                          <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                            {item.modelName}
                          </h4>
                        </div>
                        <span className={cn("text-[10px] px-2.5 py-0.5 rounded-full font-black shrink-0", sizeConf.badgeBg)}>
                          {item.size}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium line-clamp-2">{item.categoryText}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* SELECTED BRAND VIEW OR BRANDS GRID */}
        {selectedBrand ? (
          <div className="space-y-6 max-w-5xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBrand(null)}
                  className="rounded-xl border-border bg-background text-foreground hover:bg-slate-100"
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Quay lại danh sách
                </Button>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Hãng xe xuất xứ: {selectedBrand.country}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground">{selectedBrand.name}</h2>
                </div>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                {selectedBrand.models.length} dòng xe phổ biến
              </span>
            </div>

            {/* MODEL BUTTONS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-2">
              {selectedBrand.models.map((m) => {
                const sizeConf = SIZE_DISPLAY_CONFIG[m.size]
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => handleSelectModel(selectedBrand.name, m)}
                    className="rounded-2xl border border-border bg-background p-4 text-left hover:border-primary hover:shadow-md transition-all space-y-2.5 group active:scale-95"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                        {m.name}
                      </h4>
                      <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-black", sizeConf.badgeBg)}>
                        {m.size}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground line-clamp-1">{m.categoryText}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* BRANDS GRID A-Z WITH PROFESSIONAL BRAND BADGES */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <BookmarkCheck className="size-6 text-primary" />
                  CHỌN HÃNG XE (A-Z)
                </h2>
                <p className="text-xs font-semibold text-muted-foreground mt-1">
                  Nhấp chọn biểu tượng hãng xe để xem chi tiết phân loại của từng dòng xe
                </p>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-full">
                35+ Thương Hiệu Phổ Biến
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allBrands.map((b) => {
                const meta = BRAND_METADATA[b.id] || { logoBg: "bg-slate-900", logoColor: "text-white", accent: "from-slate-800 to-slate-950" }
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBrand(b)}
                    className="group rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg p-4 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 relative overflow-hidden"
                  >
                    {/* Brand Logo Badge */}
                    {b.logoUrl ? (
                      <div className="size-14 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xs border border-slate-200 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.logoUrl}
                          alt={`${b.name} logo`}
                          className="size-full object-contain filter drop-shadow-2xs"
                          onError={(e) => {
                            // Hide broken image gracefully and show text badge fallback
                            (e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className={cn(
                        "size-14 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110",
                        meta.logoBg,
                        meta.logoColor
                      )}>
                        <span className="font-black text-xl tracking-tighter">
                          {b.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="text-center space-y-0.5">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {b.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        {b.models.length} dòng xe
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* MODAL POPUP FOR SELECTED MODEL */}
        <Dialog open={selectedModel !== null} onOpenChange={(open) => !open && setSelectedModel(null)}>
          {selectedModel && (
            <DialogContent className="sm:max-w-md bg-background border-2 border-border text-foreground rounded-3xl p-6 shadow-2xl overflow-hidden">
              <DialogHeader className="space-y-2 border-b border-border pb-4 text-center">
                <span className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                  KẾT QUẢ PHÂN LOẠI KÍCH THƯỚC XE
                </span>
                <div className="pt-1">
                  <span
                    className={cn(
                      "inline-block text-xs px-3.5 py-1 rounded-full font-black shadow-sm",
                      SIZE_DISPLAY_CONFIG[selectedModel.model.size].badgeBg
                    )}
                  >
                    {SIZE_DISPLAY_CONFIG[selectedModel.model.size].badgeText}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-4 text-center">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Thương hiệu {selectedModel.brandName}
                  </span>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">
                    {selectedModel.brandName} {selectedModel.model.name}
                  </h3>
                  <p className="text-xs font-bold text-primary pt-1">
                    {selectedModel.model.categoryText}
                  </p>
                </div>

                <div className={cn(
                  "rounded-2xl border p-4 text-left space-y-2 text-xs font-medium leading-relaxed",
                  SIZE_DISPLAY_CONFIG[selectedModel.model.size].bgColor,
                  SIZE_DISPLAY_CONFIG[selectedModel.model.size].borderColor
                )}>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="size-3.5 shrink-0" />
                    <span>Lý do phân loại kích thước:</span>
                  </div>
                  <p>{SIZE_DISPLAY_CONFIG[selectedModel.model.size].desc}</p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() =>
                      handleProceedToBooking(
                        selectedModel.brandName,
                        selectedModel.model.name,
                        selectedModel.model.size
                      )
                    }
                    className="w-full h-13 rounded-2xl font-black text-base bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                  >
                    <Zap className="size-5 mr-2 fill-current" />
                    ĐẶT LỊCH RỬA XE NÀY NGAY
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* MODAL AI SUGGESTION FOR UNKNOWN CARS */}
        <Dialog open={isSuggestModalOpen} onOpenChange={setIsSuggestModalOpen}>
          <DialogContent className="sm:max-w-lg bg-background border-2 border-border text-foreground rounded-3xl p-6 shadow-2xl">
            <DialogHeader className="space-y-1.5 border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Bot className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-foreground">
                    Gợi ý nhanh xe chưa có trong bảng
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Nhập tên xe hoặc tải ảnh xe lên để hệ thống AI tự động phân loại Size.
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 pt-3">
              <form onSubmit={handleRunAiSuggestion} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nhập nhanh tên xe:</label>
                  <Input
                    type="text"
                    placeholder="VD: Porsche Macan, Santa Fe 2026, VF7..."
                    value={suggestInput}
                    onChange={(e) => setSuggestInput(e.target.value)}
                    className="h-11 rounded-xl bg-muted/20 border-slate-200 text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Ảnh xe (Tùy chọn):</label>
                  <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-4 text-center bg-muted/10 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSuggestFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="car-file-input"
                    />
                    <label htmlFor="car-file-input" className="cursor-pointer space-y-1 block">
                      <Upload className="size-6 text-muted-foreground mx-auto" />
                      <p className="text-xs font-semibold text-foreground">
                        {suggestFile ? suggestFile.name : "Nhấp để chọn ảnh xe từ máy"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Hỗ trợ PNG, JPG (Dưới 5MB)</p>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  <Sparkles className="size-4 mr-2" />
                  Gửi Phân Tích AI
                </Button>
              </form>

              {aiResult && (
                <div className="space-y-4 border-t border-border pt-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 space-y-2 text-center text-amber-950">
                    <span className="text-[10px] font-black uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                      GỢI Ý AI - ĐỘ TIN CẬY {aiResult.confidencePct}%
                    </span>
                    <h4 className="text-xl font-black uppercase text-foreground">{aiResult.modelName}</h4>
                    <div className="pt-1">
                      <span
                        className={cn(
                          "text-xs px-3 py-1 rounded-full font-black shadow-2xs inline-block",
                          SIZE_DISPLAY_CONFIG[aiResult.size].badgeBg
                        )}
                      >
                        {SIZE_DISPLAY_CONFIG[aiResult.size].badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1 font-medium">{aiResult.reason}</p>
                  </div>

                  <Button
                    onClick={() =>
                      handleProceedToBooking(aiResult.brandName, aiResult.modelName, aiResult.size)
                    }
                    className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <CheckCircle2 className="size-4 mr-2" />
                    Xác Nhận & Đặt Lịch Ngay
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
