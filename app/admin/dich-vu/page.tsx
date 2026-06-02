"use client"

import { useState } from "react"
import { Plus, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SERVICES, formatVND } from "@/lib/data"

type ServiceCategory = "Rửa xe & combo" | "Vệ sinh trong" | "Vệ sinh ngoài" | "Xử lý bề mặt" | "Bảo vệ"

interface EditingService {
  id: string
  name: string
  description: string
  prices: { S: number; M: number; L: number }
  durationMinutes: number
  category: ServiceCategory
  type: "slot" | "flex"
  active: boolean
}

const categories: ServiceCategory[] = ["Rửa xe & combo", "Vệ sinh trong", "Vệ sinh ngoài", "Xử lý bề mặt", "Bảo vệ"]

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("Rửa xe & combo")
  const [services, setServices] = useState(SERVICES)
  const [editingService, setEditingService] = useState<EditingService | null>(null)
  const [editPrices, setEditPrices] = useState<{ [key: string]: number }>({})

  const filteredServices = services.filter((s) => s.category === activeCategory)

  const handleToggleActive = (id: string) => {
    setServices(
      services.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      )
    )
  }

  const handleEditPrice = (serviceId: string, size: "S" | "M" | "L", value: string) => {
    const key = `${serviceId}-${size}`
    setEditPrices({ ...editPrices, [key]: parseInt(value) || 0 })
  }

  const handleOpenEditDrawer = (service: (typeof services)[0]) => {
    setEditingService({
      id: service.id,
      name: service.name,
      description: service.description,
      prices: service.prices || { S: service.price, M: service.price, L: service.price },
      durationMinutes: service.durationMinutes,
      category: service.category as ServiceCategory,
      type: service.type,
      active: service.active,
    })
  }

  const handleSaveService = () => {
    if (editingService) {
      setServices(
        services.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                name: editingService.name,
                description: editingService.description,
                prices: editingService.prices,
                durationMinutes: editingService.durationMinutes,
                category: editingService.category,
                type: editingService.type,
                active: editingService.active,
              }
            : s
        )
      )
      setEditingService(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dịch vụ & Bảng giá</h1>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="size-4" />
            Thêm dịch vụ mới
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeCategory === cat
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                </div>
                <button
                  onClick={() => handleOpenEditDrawer(service)}
                  className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Pencil className="size-5 text-muted-foreground" />
                </button>
              </div>

              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    service.type === "slot"
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-purple-100 text-purple-700 border border-purple-300"
                  }`}
                >
                  {service.type === "slot" ? "Dịch vụ slot" : "Dịch vụ linh hoạt"}
                </span>
              </div>

              {/* Pricing Table */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Bảng giá</p>
                <div className="grid grid-cols-3 gap-3">
                  {(["S", "M", "L"] as const).map((size) => (
                    <div key={size} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">{size}</p>
                      <div className="flex items-center justify-center bg-background rounded p-2 min-h-10 cursor-pointer hover:bg-muted/50 group relative">
                        <span className="text-sm font-semibold text-foreground group-hover:opacity-0 transition-opacity">
                          {formatVND((service.prices?.[size as keyof typeof service.prices] || service.price))}
                        </span>
                        <input
                          type="text"
                          value={
                            editPrices[`${service.id}-${size}`] ??
                            (service.prices?.[size as keyof typeof service.prices] || service.price)
                          }
                          onChange={(e) => handleEditPrice(service.id, size, e.target.value)}
                          onClick={(e) => e.currentTarget.select()}
                          placeholder="Nhập giá"
                          className="absolute inset-0 w-full text-sm text-center opacity-0 group-hover:opacity-100 transition-opacity bg-transparent focus:outline-none focus:ring-2 focus:ring-primary rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration (if WASH) */}
              {service.category === "Rửa xe & combo" && (
                <div className="text-xs text-muted-foreground">
                  Thời lượng: <span className="font-semibold text-foreground">{service.durationMinutes} phút</span>
                </div>
              )}

              {/* Toggle & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActive(service.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      service.active ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        service.active ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {service.active ? "Đang hoạt động" : "Tạm dừng"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Không có dịch vụ trong danh mục này
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      {editingService && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditingService(null)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-card border-l border-border shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Chỉnh sửa dịch vụ</h2>
              <button
                onClick={() => setEditingService(null)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Tên dịch vụ
                </label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Mô tả
                </label>
                <textarea
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Giá theo kích thước
                </label>
                <div className="space-y-2">
                  {(["S", "M", "L"] as const).map((size) => (
                    <div key={size} className="flex items-center gap-2">
                      <span className="w-6 font-semibold text-foreground">{size}</span>
                      <input
                        type="number"
                        value={editingService.prices[size as keyof typeof editingService.prices]}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            prices: {
                              ...editingService.prices,
                              [size]: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  value={editingService.durationMinutes}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      durationMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Loại dịch vụ
                </label>
                <select
                  value={editingService.type}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      type: e.target.value as "slot" | "flex",
                    })
                  }
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="slot">Dịch vụ slot</option>
                  <option value="flex">Dịch vụ linh hoạt</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Trạng thái hoạt động</label>
                <button
                  onClick={() =>
                    setEditingService({
                      ...editingService,
                      active: !editingService.active,
                    })
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    editingService.active ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      editingService.active ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditingService(null)}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleSaveService}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
