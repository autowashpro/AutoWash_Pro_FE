"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Vehicle, VehicleSize } from "@/lib/types"
import { Car, CheckCircle2, Shield, Layers, Sparkles, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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
  "Toyota", "VinFast", "Mercedes", "BMW", "Hyundai", "Kia", "Mazda", "Honda", "Ford", "Lexus"
]

const SIZE_CARDS: { size: VehicleSize; label: string; sub: string; desc: string }[] = [
  {
    size: "SMALL",
    label: "Nhỏ (Size S)",
    sub: "4-5 chỗ nhỏ gọn",
    desc: "Hatchback, Morning, Fadil, i10, Mazda 2, Vios..."
  },
  {
    size: "MEDIUM",
    label: "Vừa (Size M)",
    sub: "Sedan D / CUV / 5 chỗ",
    desc: "Camry, VF8, CX-5, CR-V, GLC, C-Class, E-Class..."
  },
  {
    size: "LARGE",
    label: "Lớn (Size L)",
    sub: "SUV 7 chỗ / Bán tải",
    desc: "Fortuner, VF9, Everest, Ranger, Carnival, GLS..."
  },
]

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    license_plate: vehicle?.license_plate || "",
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    color: vehicle?.color || "Trắng Ngọc Trai",
    vehicle_size: (vehicle?.vehicle_size || "MEDIUM") as VehicleSize,
    notes: vehicle?.notes || "",
    is_default: vehicle?.is_default || false,
  })

  const [plateError, setPlateError] = useState("")

  const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.toUpperCase()
    const invalidCharRegex = /[^A-Z0-9.\- ]/g
    if (invalidCharRegex.test(rawValue)) {
      setPlateError("Biển số chỉ được chứa chữ cái (A-Z), số (0-9), dấu (-) hoặc (.)")
    } else {
      setPlateError("")
    }
    const cleanValue = rawValue.replace(invalidCharRegex, "").trimStart()
    setFormData({ ...formData, license_plate: cleanValue })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalPlate = formData.license_plate.trim()
    
    const validRegex = /^[A-Z0-9.\-]+$/
    if (!validRegex.test(finalPlate)) {
      setPlateError("Biển số xe không hợp lệ (VD chuẩn: 51A-123.45 hoặc 30G-678.90)")
      return
    }

    onSubmit({
      ...formData,
      license_plate: finalPlate,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-1">
      {/* 1. BIỂN SỐ XE - KHUNG ĐỊNH DANH PREMIUM */}
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

      {/* 2. HÃNG XE & MODEL */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Shield className="size-3.5 text-primary" />
              Hãng xe <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="Toyota, Mercedes..."
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
              className="h-11 rounded-xl bg-muted/20 border-slate-200 focus:bg-background font-medium"
            />
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
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
              className="h-11 rounded-xl bg-muted/20 border-slate-200 focus:bg-background font-medium"
            />
          </div>
        </div>

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
                onClick={() => setFormData({ ...formData, brand })}
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
      </div>

      {/* 3. MÀU SẮC PHƯƠNG TIỆN (COLOR PALETTE SWATCHES) */}
      <div className="space-y-2.5">
        <label className="text-sm font-bold text-foreground flex items-center justify-between">
          <span>Màu ngoại thất</span>
          <span className="text-xs font-normal text-primary font-semibold">{formData.color}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {COLORS.map((c) => {
            const isSelected = formData.color === c.name || (formData.color.includes("Trắng") && c.name.includes("Trắng")) || (formData.color.includes("Đen") && c.name.includes("Đen"))
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setFormData({ ...formData, color: c.name })}
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
          <span>Lưu ý tình trạng xe</span>
          <span className="text-xs font-normal text-muted-foreground">Không bắt buộc</span>
        </label>
        <Textarea
          placeholder="VD: Trầy nhẹ cản trước, mâm phủ ceramic, cần cẩn thận khoang máy..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          className="rounded-xl bg-muted/20 border-slate-200 focus:bg-background text-sm resize-none"
        />
      </div>

      {/* 6. SWITCH ĐẶT LÀM XE MẶC ĐỊNH */}
      <div
        onClick={() => setFormData({ ...formData, is_default: !formData.is_default })}
        className={cn(
          "rounded-2xl border-2 p-4 flex items-center justify-between cursor-pointer transition-all select-none",
          formData.is_default
            ? "border-primary bg-primary/5 shadow-xs"
            : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "size-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
            formData.is_default ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
          )}>
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>Đặt làm xe mặc định</span>
              {formData.is_default && (
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                  Ưu tiên số 1
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tự động chọn chiếc xe này mỗi khi bạn vào wizard đặt lịch rửa xe
            </p>
          </div>
        </div>

        <div className={cn(
          "w-6 h-6 rounded-md flex items-center justify-center border transition-all",
          formData.is_default
            ? "bg-primary border-primary text-white scale-110"
            : "border-slate-300 bg-background"
        )}>
          {formData.is_default && <Check className="size-4 stroke-[3]" />}
        </div>
      </div>

      {/* 7. CTA BUTTONS */}
      <div className="flex items-center gap-3 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-12 flex-1 rounded-xl font-bold border-slate-300 hover:bg-slate-100 transition-all text-slate-700"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          className="h-12 flex-[2] rounded-xl font-bold text-base bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {vehicle ? (
            <>
              <CheckCircle2 className="size-5" />
              Cập nhật xe ngay
            </>
          ) : (
            <>
              <Car className="size-5" />
              Lưu phương tiện mới
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
