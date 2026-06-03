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
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Dịch vụ & Bảng giá</h1>
            <p className="mt-2 text-muted-foreground">Quản lý danh sách dịch vụ và bảng giá theo kích thước xe</p>
          </div>
          <Button>
            <Plus className="size-4" />
            Thêm dịch vụ mới
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto bg-card rounded-t-xl px-2 pt-2 shadow-[var(--shadow-sm)]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-5 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-t-lg ${
                activeCategory === cat
                  ? "text-primary bg-background font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              className="rounded-xl border border-border bg-card p-6 space-y-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20 hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{service.description}</p>
                </div>
                <button
                  onClick={() => handleOpenEditDrawer(service)}
                  className="flex-shrink-0 p-2.5 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
                >
                  <Pencil className="size-5 text-muted-foreground hover:text-primary" />
                </button>
              </div>

              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    service.type === "slot"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-platinum/10 text-platinum border border-platinum/20"
                  }`}
                >
                  {service.type === "slot" ? "Dich vu slot" : "Dich vu linh hoat"}
                </span>
              </div>

              {/* Pricing Table */}
              <div className="rounded-xl bg-muted/50 p-5 border border-border/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Bang gia</p>
                <div className="grid grid-cols-3 gap-4">
                  {(["S", "M", "L"] as const).map((size) => (
                    <div key={size} className="text-center">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">{size}</p>
                      <div className="flex items-center justify-center bg-card rounded-lg p-3 min-h-12 cursor-pointer hover:bg-primary/5 group relative border border-border/50 transition-all duration-200 hover:border-primary/30">
                        <span className="text-sm font-bold text-foreground group-hover:opacity-0 transition-opacity">
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
                          placeholder="Nhap gia"
                          className="absolute inset-0 w-full text-sm text-center font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-transparent focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration (if WASH) */}
              {service.category === "Rua xe & combo" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {service.durationMinutes}
                  </span>
                  <span>phut thuc hien</span>
                </div>
              )}

              {/* Toggle & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActive(service.id)}
                    className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                      service.active ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        service.active ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${service.active ? "text-success" : "text-muted-foreground"}`}>
                    {service.active ? "Dang hoat dong" : "Tam dung"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-card rounded-xl border border-border shadow-[var(--shadow-card)]">
            <p className="text-muted-foreground">Khong co dich vu trong danh muc nay</p>
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      {editingService && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingService(null)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-card border-l border-border shadow-2xl flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">Chinh sua dich vu</h2>
              <button
                onClick={() => setEditingService(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Ten dich vu
                </label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Mo ta
                </label>
                <textarea
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  className="input resize-none h-24"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Gia theo kich thuoc
                </label>
                <div className="space-y-3">
                  {(["S", "M", "L"] as const).map((size) => (
                    <div key={size} className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center font-bold text-foreground bg-muted rounded-lg">{size}</span>
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
                        className="input flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Thoi luong (phut)
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
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Loai dich vu
                </label>
                <select
                  value={editingService.type}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      type: e.target.value as "slot" | "flex",
                    })
                  }
                  className="input"
                >
                  <option value="slot">Dich vu slot</option>
                  <option value="flex">Dich vu linh hoat</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <label className="text-sm font-semibold text-foreground">Trang thai hoat dong</label>
                <button
                  onClick={() =>
                    setEditingService({
                      ...editingService,
                      active: !editingService.active,
                    })
                  }
                  className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                    editingService.active ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      editingService.active ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6 flex gap-3 bg-muted/30">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditingService(null)}
              >
                Huy
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveService}
              >
                Luu thay doi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
