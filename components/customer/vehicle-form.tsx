"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Vehicle, VehicleSize } from "@/lib/types"

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
  { name: "Trắng Ngọc Trai", hex: "#f5f5f5" },
  { name: "Đen", hex: "#1a1a1a" },
  { name: "Xám", hex: "#7f8c8d" },
  { name: "Bạc", hex: "#c0c0c0" },
  { name: "Đỏ", hex: "#dc2626" },
  { name: "Xanh đen", hex: "#1e3a8a" },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Get colorHex for the selected color or first default
  const getSelectedColorHex = () => {
    const matched = COLORS.find((c) => c.name === formData.color)
    return matched ? matched.hex : "#f5f5f5"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Biển số xe
        </label>
        <Input
          type="text"
          placeholder="Ví dụ: 51A-123.45"
          value={formData.license_plate}
          onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Hãng xe
          </label>
          <Input
            type="text"
            placeholder="Ví dụ: Toyota"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Model
          </label>
          <Input
            type="text"
            placeholder="Ví dụ: Camry"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Màu xe
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setFormData({ ...formData, color: c.name })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  formData.color === c.name
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div
                  className="size-5 rounded-full border border-border"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-sm font-medium">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2.5">
          Cỡ xe
        </label>
        <div className="space-y-2">
          {(["SMALL", "MEDIUM", "LARGE"] as VehicleSize[]).map((size) => (
            <label key={size} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="vehicle_size"
                value={size}
                checked={formData.vehicle_size === size}
                onChange={() => setFormData({ ...formData, vehicle_size: size })}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm font-medium">
                {size === "SMALL" && "Nhỏ (S)"}
                {size === "MEDIUM" && "Vừa (M)"}
                {size === "LARGE" && "Lớn (L)"}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Ghi chú thêm (không bắt buộc)
        </label>
        <Textarea
          placeholder="Mô tả tình trạng xe hoặc lưu ý cho nhân viên..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <label className="flex items-center gap-2 p-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.is_default}
          onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm font-medium text-foreground">Đặt làm xe mặc định</span>
      </label>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {vehicle ? "Cập nhật" : "Thêm xe"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
      </div>
    </form>
  )
}
