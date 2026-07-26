"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Vehicle, VehicleSize } from "@/lib/types"
import {
  Car,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  AlertCircle,
  Check,
  ExternalLink,
  Palette,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { detectVehicleSize, getModelsForBrand, getAllBrands, CAR_DATABASE } from "@/lib/car-database"

interface VehicleFormProps {
  vehicle?: Vehicle
  onSubmit: (data: {
    license_plate: string
    brand: string
    model: string
    color: string
    vehicle_size: VehicleSize
    notes?: string
    is_default?: boolean
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

const COLORS = [
  { name: "Trắng Ngọc Trai", hex: "#f8fafc", border: "#e2e8f0" },
  { name: "Đen Huyền Bí", hex: "#0f172a", border: "#1e293b", textLight: true },
  { name: "Xám Ánh Kim", hex: "#64748b", border: "#475569", textLight: true },
  { name: "Bạc Titan", hex: "#cbd5e1", border: "#94a3b8" },
  { name: "Đỏ Ruby", hex: "#dc2626", border: "#b91c1c", textLight: true },
  { name: "Xanh Sapphire", hex: "#1e3a8a", border: "#1d4ed8", textLight: true },
]

const QUICK_BRANDS = [
  "VinFast", "Toyota", "Mercedes", "BMW", "Hyundai", "Kia", "Mazda", "Honda", "Ford", "Lexus"
]

const SIZE_CARDS: { size: VehicleSize; label: string; sub: string; desc: string }[] = [
  {
    size: "SMALL",
    label: "Nhỏ (Size S)",
    sub: "4-5 chỗ nhỏ gọn",
    desc: "Hatchback, Morning, Fadil, i10, VF3, VF5, Vios, Accent..."
  },
  {
    size: "MEDIUM",
    label: "Vừa (Size M)",
    sub: "Sedan D / CUV / 5 chỗ",
    desc: "Camry, VF7, VF8, CX-5, CR-V, GLC, C-Class, Tucson, Creta..."
  },
  {
    size: "LARGE",
    label: "Lớn (Size L)",
    sub: "SUV 7 chỗ / Bán tải",
    desc: "Fortuner, VF9, Everest, Ranger, Carnival, GLS, Prado, Alphard..."
  },
]

export function VehicleForm({ vehicle, onSubmit, onCancel, isLoading }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    license_plate: vehicle?.license_plate || "",
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    color: vehicle?.color || "Trắng",
    vehicle_size: vehicle?.vehicle_size || ("MEDIUM" as VehicleSize),
    notes: vehicle?.notes || "",
    is_default: vehicle?.is_default || false,
  })

  // Custom Color Toggle
  const [isCustomColorOpen, setIsCustomColorOpen] = useState(false)
  const [customColorInput, setCustomColorInput] = useState("")

  const [detectedInfo, setDetectedInfo] = useState<{
    size: VehicleSize
    categoryText: string
    confidencePct: number
    reason: string
  } | null>(null)

  const [plateError, setPlateError] = useState("")

  const allBrandsList = React.useMemo(() => getAllBrands(), [])
  const filteredBrands = React.useMemo(() => {
    const query = formData.brand.trim().toLowerCase()
    if (!query) {
      return ["VinFast", "Toyota", "Honda", "Hyundai", "Kia", "Mercedes-Benz", "BMW", "Ford", "Mazda"]
    }
    const matches = allBrandsList
      .filter((b) => b.name.toLowerCase().includes(query))
      .map((b) => b.name)
    return matches.slice(0, 10)
  }, [allBrandsList, formData.brand])

  // Available models for currently typed/selected brand
  const availableModels = getModelsForBrand(formData.brand)

  const updateBrandModel = (brand: string, model: string) => {
    const detected = detectVehicleSize(brand, model)
    if (brand.trim() || model.trim()) {
      setDetectedInfo(detected)
      setFormData((prev) => ({
        ...prev,
        brand,
        model,
        vehicle_size: detected.confidencePct >= 70 ? detected.size : prev.vehicle_size,
      }))
    } else {
      setFormData((prev) => ({ ...prev, brand, model }))
    }
  }

  const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.toUpperCase()
    const invalidCharRegex = /[^A-Z0-9.\-]/g
    if (invalidCharRegex.test(rawValue)) {
      setPlateError("Biển số chỉ được chứa chữ cái (A-Z), số (0-9), dấu (-) hoặc (.)")
    } else {
      setPlateError("")
    }
    const cleanValue = rawValue.replace(invalidCharRegex, "")
    setFormData({ ...formData, license_plate: cleanValue })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalPlate = formData.license_plate.trim()
    
    // Kiểm tra định dạng chuẩn biển số Việt Nam (VD: 51A-123.45, 30G-678.90, 50LD-123.45 hoặc 51A12345)
    const vnPlateRegex = /^(?:[0-9]{2}[A-Z]{1,2}(?:-[0-9]{3}\.[0-9]{2}|-[0-9]{4}|[0-9]{4,5}))$/
    if (!vnPlateRegex.test(finalPlate)) {
      setPlateError("Biển số xe không đúng định dạng VN (VD chuẩn: 51A-123.45, 30G-678.90, 50LD-123.45 hoặc 51A12345)")
      return
    }

    const finalColor = isCustomColorOpen && customColorInput.trim() ? customColorInput.trim() : formData.color

    onSubmit({
      ...formData,
      license_plate: finalPlate,
      color: finalColor,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-1">
      {/* HEADER LINK BADGE TO /phan-loai-xe */}
      <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl p-3 text-xs font-semibold text-primary">
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-4 text-primary shrink-0" />
          Bạn chưa chắc chắn về Size xe của mình?
        </span>
        <Link
          href="/phan-loai-xe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline hover:scale-105 transition-all"
        >
          Tra cứu ngay
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {/* 1. BIỂN SỐ XE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
            <Car className="size-4 text-primary" />
            Biển số phương tiện <span className="text-destructive">*</span>
          </label>
          <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">
            Định danh chính
          </span>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <div className="flex flex-col items-center justify-center rounded bg-slate-900 px-1.5 py-1 text-[9px] font-black leading-none text-white tracking-tighter">
              <span>VN</span>
            </div>
          </div>
          <Input
            type="text"
            placeholder="51A-123.45"
            value={formData.license_plate}
            onChange={handleLicensePlateChange}
            required
            className={cn(
              "pl-12 pr-4 h-13 text-xl font-mono font-black tracking-wider uppercase rounded-xl border-2 transition-all shadow-2xs",
              plateError
                ? "border-destructive focus-visible:ring-destructive bg-destructive/5"
                : "border-slate-300 focus-visible:border-primary focus-visible:ring-primary/20 bg-slate-50/50 hover:bg-background"
            )}
          />
        </div>
        {plateError ? (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive mt-1">
            <AlertCircle className="size-3.5 shrink-0" />
            {plateError}
          </p>
        ) : (
          <p className="text-[12px] text-muted-foreground">
            Nhập liền hoặc có dấu gạch ngang/chấm (VD: 51A-123.45, 30K-888.88)
          </p>
        )}
      </div>

      {/* 2. HÃNG XE & MODEL WITH SMART COMBOBOX */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Shield className="size-3.5 text-primary" />
              Hãng xe <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="Toyota, VinFast, Mercedes..."
              value={formData.brand}
              onChange={(e) => updateBrandModel(e.target.value, formData.model)}
              required
              className="h-11 rounded-xl bg-muted/20 border-slate-200 focus:bg-background font-medium"
            />
            {/* Brand suggestions filtered dynamically */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {formData.brand.trim() ? `Gợi ý theo từ khóa "${formData.brand}":` : "Hãng phổ biến:"}
              </span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-0.5">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((bName) => (
                    <button
                      key={bName}
                      type="button"
                      onClick={() => updateBrandModel(bName, formData.model)}
                      className={cn(
                        "px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all cursor-pointer",
                        formData.brand.toLowerCase() === bName.toLowerCase()
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      {bName}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">Không tìm thấy</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              Dòng xe (Model) <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="Camry, VF8, GLC 300..."
              value={formData.model}
              onChange={(e) => updateBrandModel(formData.brand, e.target.value)}
              required
              className="h-11 rounded-xl bg-muted/20 border-slate-200 focus:bg-background font-medium"
            />
          </div>
        </div>

        {/* Dynamic Model Suggestion Chips if Brand is selected */}
        {availableModels.length > 0 && (
          <div className="space-y-1.5 pt-0.5 animate-in fade-in">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Dòng xe gợi ý cho hãng {formData.brand}:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {availableModels.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => updateBrandModel(formData.brand, m.name)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-150 flex items-center gap-1",
                    formData.model.toLowerCase() === m.name.toLowerCase()
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs scale-105"
                      : "bg-background border-slate-200 text-slate-700 hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  <span>{m.name}</span>
                  <span className="text-[9px] opacity-70 font-mono font-bold">({m.size})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Brand Selector Chips */}
        <div className="space-y-1.5 pt-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Chọn nhanh hãng phổ biến:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => updateBrandModel(brand, formData.model)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-lg border transition-all duration-150",
                  formData.brand.toLowerCase() === brand.toLowerCase()
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs scale-105"
                    : "bg-background border-slate-200 text-slate-600 hover:border-primary/50 hover:bg-slate-100"
                )}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* AUTO-DETECTED CONFIDENCE BADGE */}
        {detectedInfo && (formData.brand.trim() || formData.model.trim()) && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs font-medium text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>
                Tự động nhận diện Size: <strong className="uppercase font-black text-emerald-700">{formData.vehicle_size}</strong> ({detectedInfo.categoryText})
              </span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full shrink-0">
              Độ khớp {detectedInfo.confidencePct}%
            </span>
          </div>
        )}
      </div>

      {/* 3. MÀU SẮC PHƯƠNG TIỆN (PALETTE & CUSTOM COLOR INPUT) */}
      <div className="space-y-2.5">
        <label className="text-sm font-bold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Palette className="size-3.5 text-primary" />
            Màu ngoại thất
          </span>
          <span className="text-xs font-bold text-primary">
            {isCustomColorOpen && customColorInput ? customColorInput : formData.color}
          </span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {COLORS.map((c) => {
            const isSelected = !isCustomColorOpen && (formData.color === c.name || (formData.color.includes("Trắng") && c.name.includes("Trắng")) || (formData.color.includes("Đen") && c.name.includes("Đen")))
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setIsCustomColorOpen(false)
                  setFormData({ ...formData, color: c.name })
                }}
                className={cn(
                  "relative flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all duration-200 text-left group overflow-hidden",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm scale-[1.02]"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                )}
              >
                <div
                  className="size-6 rounded-full shrink-0 shadow-inner flex items-center justify-center border transition-transform group-hover:scale-110"
                  style={{ backgroundColor: c.hex, borderColor: c.border }}
                >
                  {isSelected && (
                    <Check className={cn("size-3.5 stroke-[3]", c.textLight ? "text-white" : "text-slate-900")} />
                  )}
                </div>
                <span className={cn("text-xs font-semibold truncate leading-tight", isSelected ? "text-primary" : "text-slate-700")}>
                  {c.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* CUSTOM COLOR TOGGLE BUTTON & FIELD */}
        <div className="pt-1">
          {!isCustomColorOpen ? (
            <button
              type="button"
              onClick={() => setIsCustomColorOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              + Chọn hoặc nhập màu khác (Xám xi măng, Vàng cát, Nâu đồng...)
            </button>
          ) : (
            <div className="space-y-1.5 animate-in fade-in pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Nhập màu tùy chỉnh của xe:</span>
                <button
                  type="button"
                  onClick={() => setIsCustomColorOpen(false)}
                  className="text-primary hover:underline text-[11px]"
                >
                  Dùng danh sách màu có sẵn
                </button>
              </div>
              <Input
                type="text"
                placeholder="VD: Xám Xi Măng, Vàng Cát, Nâu Đồng, Tím Nho..."
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                className="h-10 rounded-xl bg-background border-slate-200 font-medium text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. CỠ XE (INTERACTIVE BENTO CARDS) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-foreground">
            Phân hạng kích thước (Size) <span className="text-destructive">*</span>
          </label>
          <span className="text-xs text-muted-foreground">Quyết định giá dịch vụ</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          {SIZE_CARDS.map((item) => {
            const isSelected = formData.vehicle_size === item.size
            return (
              <div
                key={item.size}
                onClick={() => setFormData({ ...formData, vehicle_size: item.size })}
                className={cn(
                  "relative flex items-start justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none",
                  isSelected
                    ? "border-primary bg-primary/[0.04] shadow-sm ring-1 ring-primary/20"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                )}
              >
                <div className="space-y-1 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold", isSelected ? "text-primary" : "text-foreground")}>
                      {item.label}
                    </span>
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-600"
                    )}>
                      {item.sub}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                
                <div className={cn(
                  "size-6 rounded-full flex items-center justify-center shrink-0 transition-colors mt-0.5",
                  isSelected ? "bg-primary text-white" : "border-2 border-slate-300 bg-background"
                )}>
                  {isSelected && <Check className="size-3.5 stroke-[3]" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. GHI CHÚ THÊM */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-foreground flex items-center justify-between">
          <span>Ghi chú thêm (Tùy chọn)</span>
          <span className="text-xs font-normal text-muted-foreground">Ví dụ: Xe dán phim cách nhiệt, nắp thùng...</span>
        </label>
        <Textarea
          placeholder="Nhập ghi chú đặc biệt cho kỹ thuật viên nếu có..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="rounded-xl border-slate-200 min-h-[70px] text-xs font-medium"
        />
      </div>

      {/* FORM ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-5 rounded-xl font-bold border-slate-200">
          Hủy bỏ
        </Button>
        <Button type="submit" className="h-11 px-7 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90">
          {vehicle ? "Cập nhật thông tin xe" : "Xác nhận & Thêm xe mới"}
        </Button>
      </div>
    </form>
  )
}
