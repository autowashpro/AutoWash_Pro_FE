"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SERVICES, formatVND } from "@/lib/data"
import { getAdminServices, createService, updateService, apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type ServiceCategoryName = "Rửa xe & combo" | "Vệ sinh trong" | "Vệ sinh ngoài" | "Xử lý bề mặt" | "Bảo vệ"

interface UIPrice {
  S: number
  M: number
  L: number
}

interface UIService {
  id: string
  name: string
  description: string
  prices: UIPrice
  durationMinutes: number
  category: ServiceCategoryName
  type: "slot" | "flex"
  active: boolean
}

const categoryNames: ServiceCategoryName[] = ["Rửa xe & combo", "Vệ sinh trong", "Vệ sinh ngoài", "Xử lý bề mặt", "Bảo vệ"]

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryName>("Rửa xe & combo")
  const [services, setServices] = useState<UIService[]>([])
  const [editingService, setEditingService] = useState<UIService | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editPrices, setEditPrices] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(false)
  
  const { toast } = useToast()

  const convertPricesToApi = (prices: UIPrice) => [
    { vehicle_size: 'SMALL', price: prices.S },
    { vehicle_size: 'MEDIUM', price: prices.M },
    { vehicle_size: 'LARGE', price: prices.L }
  ]

  const convertApiPricesToUI = (pricesArr: Array<{ vehicle_size: string; price: number }>, basePrice: number): UIPrice => {
    const pricesObj: UIPrice = { S: basePrice, M: basePrice, L: basePrice }
    if (pricesArr && Array.isArray(pricesArr)) {
      pricesArr.forEach(p => {
        if (p.vehicle_size === 'SMALL') pricesObj.S = p.price
        if (p.vehicle_size === 'MEDIUM') pricesObj.M = p.price
        if (p.vehicle_size === 'LARGE') pricesObj.L = p.price
      })
    }
    return pricesObj
  }

  const fetchServices = async () => {
    setLoading(true)
    try {
      let serviceList: UIService[] = []
      try {
        const categories = await getAdminServices()
        if (categories && Array.isArray(categories)) {
          serviceList = categories.flatMap(cat => 
            cat.services.map(s => {
              // Convert API model to UI model
              const basePrice = s.price || 0
              // prices array from backend might be in different format
              const apiPrices = (s as any).prices || []
              return {
                id: s.service_id,
                name: s.name,
                description: (s as any).description || s.name,
                prices: convertApiPricesToUI(apiPrices, basePrice),
                durationMinutes: s.estimated_duration_minutes || 30,
                category: cat.name as ServiceCategoryName,
                type: (s as any).type || (cat.is_wash_group ? 'slot' : 'flex'),
                active: s.status === 'ACTIVE'
              }
            })
          )
        }
      } catch (err) {
        console.warn("Failed to fetch services from API, using mock data", err)
        serviceList = SERVICES.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          prices: s.prices || { S: s.price, M: s.price, L: s.price },
          durationMinutes: s.durationMinutes,
          category: s.category as ServiceCategoryName,
          type: s.type,
          active: s.active
        }))
      }
      setServices(serviceList)
    } catch (error) {
      toast({
        title: "Lỗi dữ liệu",
        description: "Không thể lấy danh sách dịch vụ. Đang hiển thị dữ liệu mô phỏng.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const filteredServices = services.filter((s) => s.category === activeCategory)

  const handleToggleActive = async (id: string) => {
    const service = services.find((s) => s.id === id)
    if (!service) return

    const newActive = !service.active
    try {
      try {
        await updateService(id, {
          status: newActive ? 'ACTIVE' : 'INACTIVE'
        })
      } catch (apiErr) {
        await apiClient.put(`/admin/services/${id}`, {
          status: newActive ? 'ACTIVE' : 'INACTIVE'
        })
      }
      toast({
        title: "Cập nhật thành công",
        description: `Đã ${newActive ? 'kích hoạt' : 'tạm dừng'} dịch vụ thành công.`,
      })
      fetchServices()
    } catch (err) {
      console.warn("API toggle active failed, fallback offline", err)
      setServices(
        services.map((s) =>
          s.id === id ? { ...s, active: newActive } : s
        )
      )
      toast({
        title: "Cập nhật ngoại tuyến",
        description: `Đã cập nhật trạng thái dịch vụ (Chế độ offline).`,
      })
    }
  }

  const handleEditPrice = async (serviceId: string, size: "S" | "M" | "L", value: string) => {
    const key = `${serviceId}-${size}`
    const numValue = parseInt(value) || 0
    setEditPrices({ ...editPrices, [key]: numValue })
    
    // Auto save inline price update to API
    const service = services.find(s => s.id === serviceId)
    if (service) {
      const updatedPrices = {
        ...service.prices,
        [size]: numValue
      }
      try {
        try {
          await updateService(serviceId, {
            prices: convertPricesToApi(updatedPrices)
          })
        } catch (apiErr) {
          await apiClient.put(`/admin/services/${serviceId}`, {
            prices: convertPricesToApi(updatedPrices)
          })
        }
        // update local list
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, prices: updatedPrices } : s))
      } catch (err) {
        console.warn("API inline price update failed, fallback offline", err)
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, prices: updatedPrices } : s))
      }
    }
  }

  const handleOpenEditDrawer = (service: UIService) => {
    setIsCreating(false)
    setEditingService({ ...service })
  }

  const handleOpenCreateDrawer = () => {
    setIsCreating(true)
    setEditingService({
      id: "",
      name: "",
      description: "",
      prices: { S: 50000, M: 70000, L: 100000 },
      durationMinutes: 30,
      category: activeCategory,
      type: activeCategory === "Rửa xe & combo" ? "slot" : "flex",
      active: true,
    })
  }

  const handleSaveService = async () => {
    if (editingService) {
      if (!editingService.name) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền tên dịch vụ.",
          variant: "destructive",
        })
        return
      }

      try {
        if (isCreating) {
          try {
            await createService({
              category_id: activeCategory === "Rửa xe & combo" ? "wash-combo" : "addon-category",
              service_code: `SRV-${Date.now().toString().slice(-4)}`,
              name: editingService.name,
              estimated_duration_minutes: editingService.durationMinutes,
              prices: convertPricesToApi(editingService.prices)
            })
          } catch (apiErr) {
            await apiClient.post('/admin/services', {
              category_id: activeCategory === "Rửa xe & combo" ? "wash-combo" : "addon-category",
              service_code: `SRV-${Date.now().toString().slice(-4)}`,
              name: editingService.name,
              estimated_duration_minutes: editingService.durationMinutes,
              prices: convertPricesToApi(editingService.prices)
            })
          }
          toast({
            title: "Tạo thành công",
            description: "Dịch vụ mới đã được tạo thành công.",
          })
        } else {
          try {
            await updateService(editingService.id, {
              name: editingService.name,
              estimated_duration_minutes: editingService.durationMinutes,
              prices: convertPricesToApi(editingService.prices),
              status: editingService.active ? 'ACTIVE' : 'INACTIVE'
            })
          } catch (apiErr) {
            await apiClient.put(`/admin/services/${editingService.id}`, {
              name: editingService.name,
              estimated_duration_minutes: editingService.durationMinutes,
              prices: convertPricesToApi(editingService.prices),
              status: editingService.active ? 'ACTIVE' : 'INACTIVE'
            })
          }
          toast({
            title: "Cập nhật thành công",
            description: "Dịch vụ đã được cập nhật thành công.",
          })
        }
        fetchServices()
        setEditingService(null)
      } catch (err) {
        console.warn("API save service failed, fallback offline", err)
        if (isCreating) {
          const newSrv: UIService = {
            ...editingService,
            id: `srv-${Date.now()}`
          }
          setServices([...services, newSrv])
        } else {
          setServices(services.map((s) => s.id === editingService.id ? editingService : s))
        }
        toast({
          title: "Cập nhật ngoại tuyến",
          description: "Thông tin dịch vụ được lưu tạm thời (Chế độ offline).",
        })
        setEditingService(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dịch vụ & Bảng giá</h1>
            <p className="mt-2 text-muted-foreground">Quản lý danh sách dịch vụ và bảng giá theo kích thước xe</p>
          </div>
          <Button onClick={handleOpenCreateDrawer} className="shadow-[var(--shadow-glow)]">
            <Plus className="size-4" />
            Thêm dịch vụ mới
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto bg-card rounded-t-xl px-2 pt-2 shadow-[var(--shadow-sm)]">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-5 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap rounded-t-lg ${
                activeCategory === cat
                  ? "text-primary bg-background shadow-sm"
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

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Đang tải danh sách dịch vụ...</p>
          </div>
        ) : (
          /* Services Grid */
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
                    <h3 className="font-extrabold text-lg text-foreground">{service.name}</h3>
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
                    className={`inline-flex rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                      service.type === "slot"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}
                  >
                    {service.type === "slot" ? "Dịch vụ đặt cầu (WASH)" : "Dịch vụ linh hoạt (FLEX)"}
                  </span>
                </div>

                {/* Pricing Table */}
                <div className="rounded-xl bg-muted/50 p-5 border border-border/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Bảng giá xe</p>
                  <div className="grid grid-cols-3 gap-4">
                    {(["S", "M", "L"] as const).map((size) => (
                      <div key={size} className="text-center">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Cỡ xe {size}</p>
                        <div className="flex items-center justify-center bg-card rounded-lg p-3 min-h-12 cursor-pointer hover:bg-primary/5 group relative border border-border/50 transition-all duration-200 hover:border-primary/30">
                          <span className="text-sm font-bold text-foreground group-hover:opacity-0 transition-opacity">
                            {formatVND(service.prices[size])}
                          </span>
                          <input
                            type="text"
                            value={
                              editPrices[`${service.id}-${size}`] ??
                              service.prices[size]
                            }
                            onChange={(e) => handleEditPrice(service.id, size, e.target.value)}
                            onClick={(e) => e.currentTarget.select()}
                            placeholder="Nhập giá"
                            className="absolute inset-0 w-full text-sm text-center font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-transparent focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {service.durationMinutes}
                  </span>
                  <span>phút thực hiện ước tính</span>
                </div>

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
                      {service.active ? "Đang hoạt động" : "Tạm dừng hoạt động"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-16 bg-card rounded-xl border border-border shadow-[var(--shadow-card)]">
            <p className="text-muted-foreground">Không có dịch vụ nào trong danh mục này</p>
          </div>
        )}
      </div>

      {/* Create / Edit Drawer */}
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
              <h2 className="text-xl font-bold text-foreground">
                {isCreating ? "Thêm dịch vụ mới" : "Chỉnh sửa dịch vụ"}
              </h2>
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
                  Tên dịch vụ
                </label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
                  }
                  placeholder="Ví dụ: Rửa khoang động cơ"
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  placeholder="Nhập mô tả về dịch vụ..."
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Giá dịch vụ theo cỡ xe (VND)
                </label>
                <div className="space-y-3">
                  {(["S", "M", "L"] as const).map((size) => (
                    <div key={size} className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center font-bold text-foreground bg-muted rounded-lg">
                        {size}
                      </span>
                      <input
                        type="number"
                        value={editingService.prices[size]}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            prices: {
                              ...editingService.prices,
                              [size]: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="input flex-1 px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Thời lượng ước tính (phút)
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
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Loại hình đặt lịch
                </label>
                <select
                  value={editingService.type}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      type: e.target.value as "slot" | "flex",
                    })
                  }
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="slot">Dịch vụ đặt cầu (WASH)</option>
                  <option value="flex">Dịch vụ phụ trợ linh hoạt (FLEX)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <label className="text-sm font-semibold text-foreground">Trạng thái kích hoạt</label>
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
                Hủy bỏ
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveService}
              >
                {isCreating ? "Tạo dịch vụ" : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
