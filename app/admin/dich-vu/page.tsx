"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, X, Loader2, Trash2, Clock, Sparkles, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { SERVICES, formatVND } from "@/lib/data"
import { getAdminServices, getAdminCategories, createService, updateService, deleteService, apiClient, updateServiceStatus } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { cn } from "@/lib/utils"

type ServiceCategoryName = "Rửa xe & combo" | "Vệ sinh trong" | "Vệ sinh ngoài" | "Xử lý bề mặt" | "Bảo vệ"

interface UIPrice {
  S: number | ''
  M: number | ''
  L: number | ''
}

interface UIService {
  id: string
  name: string
  description: string
  prices: UIPrice
  durationMinutes: number | ''
  category: ServiceCategoryName
  type: "slot" | "flex"
  active: boolean
}

const categoryNames: ServiceCategoryName[] = ["Rửa xe & combo", "Vệ sinh trong", "Vệ sinh ngoài", "Xử lý bề mặt", "Bảo vệ"]

const mapCategoryName = (dbName: string): ServiceCategoryName => {
  const norm = dbName.trim().toLowerCase()
  if (norm.includes("rửa xe") || norm.includes("combo")) return "Rửa xe & combo"
  if (norm.includes("vệ sinh trong") || norm.includes("nội thất")) return "Vệ sinh trong"
  if (norm.includes("vệ sinh ngoài") || norm.includes("ngoại thất")) return "Vệ sinh ngoài"
  if (norm.includes("xử lý bề mặt") || norm.includes("sơn") || norm.includes("bề mặt") || norm.includes("detailing")) return "Xử lý bề mặt"
  if (norm.includes("bảo vệ") || norm.includes("ceramic") || norm.includes("phủ")) return "Bảo vệ"
  return "Rửa xe & combo"
}

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryName>("Rửa xe & combo")
  const [services, setServices] = useState<UIService[]>([])
  const [editingService, setEditingService] = useState<UIService | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editPrices, setEditPrices] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(false)
  const [categoryGuidMap, setCategoryGuidMap] = useState<Record<string, string>>({})
  const [expandedDescs, setExpandedDescs] = useState<Record<string, boolean>>({})

  const toggleExpandDesc = (id: string) => {
    setExpandedDescs(prev => ({ ...prev, [id]: !prev[id] }))
  }
  
  const { toast } = useToast()

  const [serviceToDelete, setServiceToDelete] = useState<UIService | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return
    setDeleteLoading(true)
    try {
      await deleteService(serviceToDelete.id)
      toast({
        title: "Xóa thành công",
        description: `Dịch vụ "${serviceToDelete.name}" đã được xóa vĩnh viễn khỏi hệ thống.`,
      })
      setServiceToDelete(null)
      fetchServices()
    } catch (err: any) {
      console.error("API delete service failed:", err)
      toast({
        title: "Không thể xóa dịch vụ",
        description: err?.response?.data?.message || "Dịch vụ này có dữ liệu lịch sử hoặc lỗi từ máy chủ. Vui lòng dùng nút gạt bên dưới để Tạm ẩn.",
        variant: "destructive",
      })
      setServiceToDelete(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const convertPricesToApi = (prices: UIPrice) => [
    { vehicle_size: 'SMALL', price: prices.S === '' ? 0 : prices.S },
    { vehicle_size: 'MEDIUM', price: prices.M === '' ? 0 : prices.M },
    { vehicle_size: 'LARGE', price: prices.L === '' ? 0 : prices.L }
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
        const [categoriesData, allCategories] = await Promise.all([
          getAdminServices(),
          getAdminCategories().catch(() => []) // Fallback safely if API fails
        ])
        
        if (categoriesData && Array.isArray(categoriesData)) {
          const mapping: Record<string, string> = {}
          
          // Ưu tiên nạp ID của toàn bộ category từ API categories trước (kể cả rỗng)
          if (allCategories && Array.isArray(allCategories)) {
            allCategories.forEach(cat => {
              mapping[cat.name] = cat.category_id
            })
          }
          
          // Ghi đè hoặc bổ sung thêm từ categoriesData nếu có
          categoriesData.forEach(cat => {
            if (cat.category_id) {
              mapping[cat.name] = cat.category_id
            }
          })
          
          setCategoryGuidMap(mapping)

          serviceList = categoriesData.flatMap(cat => 
            cat.services.map(s => {
              // Convert API model to UI model
              const basePrice = s.price || 0
              // prices array from backend might be in different format
              const apiPrices = (s as any).prices || []
              return {
                id: s.service_id || (s as any).id || (s as any).serviceId || `srv-${Math.random()}`,
                name: s.name,
                description: (s as any).description || s.name,
                prices: convertApiPricesToUI(apiPrices, basePrice),
                durationMinutes: s.estimated_duration_minutes || 30,
                category: mapCategoryName(cat.name),
                type: (s as any).type || (cat.is_wash_group ? 'slot' : 'flex'),
                active: s.status === 'ACTIVE'
              }
            })
          )
        }
      } catch (err) {
        console.error("Failed to fetch services from API:", err)
        serviceList = []
      }
      setServices(serviceList)
    } catch (error) {
      toast({
        title: "Lỗi kết nối Backend",
        description: "Không thể lấy danh sách dịch vụ từ máy chủ. Vui lòng kiểm tra lại kết nối.",
        variant: "destructive",
      })
      setServices([])
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
    
    // Optimistic UI update
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: newActive } : s))
    )

    try {
      await updateService(id, {
        name: service.name,
        description: service.description || service.name,
        estimated_duration_minutes: typeof service.durationMinutes === 'number' && service.durationMinutes > 0 ? service.durationMinutes : 30,
        prices: convertPricesToApi(service.prices),
        status: newActive ? 'ACTIVE' : 'INACTIVE'
      })
      toast({
        title: "Cập nhật thành công",
        description: `Đã ${newActive ? 'kích hoạt' : 'tạm dừng'} dịch vụ "${service.name}".`,
      })
    } catch (err: any) {
      console.error("API toggle active failed:", err)
      // Revert state if failed
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !newActive } : s))
      )
      toast({
        title: "Không thể lưu trạng thái",
        description: err?.response?.data?.message || `Lỗi kết nối Backend. Trạng thái đã được khôi phục.`,
        variant: "destructive",
      })
    }
  }

  const handleEditPrice = (serviceId: string, size: "S" | "M" | "L", value: string) => {
    const key = `${serviceId}-${size}`
    const numValue = parseInt(value) || 0
    setEditPrices(prev => ({ ...prev, [key]: numValue }))
    
    // Update local state immediately
    setServices(prev => prev.map(s => s.id === serviceId ? {
      ...s,
      prices: { ...s.prices, [size]: numValue }
    } : s))
  }

  const handleBlurPrice = async (serviceId: string, size: "S" | "M" | "L") => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    try {
      await updateService(serviceId, {
        name: service.name,
        description: service.description,
        estimated_duration_minutes: service.durationMinutes === '' ? 0 : service.durationMinutes,
        status: service.active ? 'ACTIVE' : 'INACTIVE',
        prices: convertPricesToApi(service.prices)
      })
    } catch (err) {
      console.warn("API inline price update failed, fallback offline", err)
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
          const dbCategoryName = Object.keys(categoryGuidMap).find(
            (dbCat) => mapCategoryName(dbCat) === editingService.category
          ) || Object.keys(categoryGuidMap).find(
            (dbCat) => mapCategoryName(dbCat) === activeCategory
          ) || activeCategory;
          const catGuid = categoryGuidMap[dbCategoryName] || '';
          
          await createService({
            category_id: catGuid,
            service_code: `SRV-${Date.now().toString().slice(-4)}`,
            name: editingService.name,
            description: editingService.description,
            estimated_duration_minutes: editingService.durationMinutes === '' ? 0 : editingService.durationMinutes,
            prices: convertPricesToApi(editingService.prices)
          })

          toast({
            title: "Tạo thành công",
            description: "Dịch vụ mới đã được tạo thành công.",
          })
        } else {
          const dbCategoryName = Object.keys(categoryGuidMap).find(
            (dbCat) => mapCategoryName(dbCat) === editingService.category
          ) || activeCategory;
          const catGuid = categoryGuidMap[dbCategoryName] || '';

          await updateService(editingService.id, {
            category_id: catGuid && catGuid.length === 36 ? catGuid : undefined,
            name: editingService.name,
            description: editingService.description,
            estimated_duration_minutes: editingService.durationMinutes === '' ? 0 : editingService.durationMinutes,
            prices: convertPricesToApi(editingService.prices),
            status: editingService.active ? 'ACTIVE' : 'INACTIVE'
          })

          toast({
            title: "Cập nhật thành công",
            description: "Dịch vụ đã được cập nhật thành công.",
          })
        }
        fetchServices()
        setEditingService(null)
      } catch (err: any) {
        console.error("API save service failed:", err)
        toast({
          title: "Không thể lưu dịch vụ",
          description: err?.response?.data?.message || "Dữ liệu không hợp lệ hoặc lỗi từ máy chủ Backend.",
          variant: "destructive",
        })
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

        {/* Category Tabs: Explicit Horizontal Row (Flex Row) */}
        <div className="w-full bg-card border border-border/60 rounded-2xl p-1.5 shadow-sm flex flex-row items-center justify-between gap-1.5">
          {categoryNames.map((cat) => {
            const count = services.filter(s => s.category === cat).length
            const isActive = activeCategory === cat

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-1 flex flex-row items-center justify-center px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap rounded-xl gap-2 cursor-pointer outline-none min-w-0",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span className="truncate">{cat}</span>
                <span className={cn(
                  "text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors min-w-[20px] text-center shrink-0",
                  isActive
                    ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                    : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            )
          })}
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
            {filteredServices.map((service, index) => {
              const isDescExpanded = !!expandedDescs[service.id]
              const isLongDesc = service.description && service.description.length > 90

              return (
                <div
                  key={service.id}
                  className={`rounded-2xl border bg-card p-6 space-y-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-md relative overflow-hidden group/card ${
                    service.active ? "border-border/80" : "border-border/40 opacity-70 bg-muted/20"
                  }`}
                >
                  {/* Header Row: Title, Minimalist Type Badge & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-foreground tracking-tight leading-snug">{service.name}</h3>
                        
                        {/* Type Badge */}
                        <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50 shrink-0">
                          {service.type === "slot" ? "WASH" : "FLEX"}
                        </span>
                      </div>

                      {/* Description with Line Clamp & Expand */}
                      {service.description && (
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          <p className={isDescExpanded ? "" : "line-clamp-2"}>
                            {service.description}
                          </p>
                          {isLongDesc && (
                            <button
                              onClick={() => toggleExpandDesc(service.id)}
                              className="text-[11px] font-semibold text-primary hover:underline mt-0.5 inline-block"
                            >
                              {isDescExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions & Status Toggle */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Active Status Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(service.id)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 self-center",
                          service.active ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                        title={service.active ? "Dịch vụ đang hoạt động (Click để tắt)" : "Dịch vụ đang tạm dừng (Click để bật)"}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                            service.active ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditDrawer(service)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                        title="Chỉnh sửa chi tiết"
                      >
                        <Pencil className="size-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setServiceToDelete(service)}
                        className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                        title="Xóa dịch vụ"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing Table (Clean & Subtle) */}
                  <div className="rounded-xl bg-muted/30 p-4 border border-border/40 space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Bảng giá xe
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {(["S", "M", "L"] as const).map((size) => {
                        const priceKey = `${service.id}-${size}`
                        const currentVal = editPrices[priceKey] ?? service.prices[size]
                        
                        return (
                          <div key={size} className="text-center group/price relative">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                              Cỡ {size}
                            </span>
                            <div className="flex items-center justify-center bg-card rounded-lg p-2 min-h-10 border border-border/60 group-hover/price:border-primary/50 transition-all duration-150 cursor-pointer relative overflow-hidden">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-xs font-bold text-foreground group-hover/price:text-primary transition-colors">
                                  {formatVND(Number(currentVal))}
                                </span>
                                <Pencil className="size-3 text-muted-foreground/40 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                              </div>

                              <input
                                type="text"
                                value={currentVal}
                                onChange={(e) => handleEditPrice(service.id, size, e.target.value)}
                                onBlur={() => handleBlurPrice(service.id, size)}
                                onClick={(e) => e.currentTarget.select()}
                                placeholder="Nhập giá"
                                className="absolute inset-0 w-full h-full text-xs text-center font-bold opacity-0 focus:opacity-100 bg-card text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-lg transition-all"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Card Footer: Metadata */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="size-3.5 text-muted-foreground/70" />
                      <span>{service.durationMinutes} phút</span>
                    </div>

                    <span className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                      <span className={`size-1.5 rounded-full ${service.active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                      {service.active ? "Đang hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-16 bg-card rounded-xl border border-border shadow-[var(--shadow-card)]">
            <p className="text-muted-foreground">Không có dịch vụ nào trong danh mục này</p>
          </div>
        )}
      </div>

      {/* Create / Edit Drawer */}
      <Sheet open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <SheetContent className="w-full sm:max-w-[600px] p-0 flex flex-col gap-0 border-l border-border shadow-2xl bg-card">
          {editingService && (
            <>
              {/* Header */}
              <SheetHeader className="p-6 border-b border-border bg-muted/30 backdrop-blur-md relative z-10">
                <SheetTitle className="text-xl font-bold text-foreground">
                  {isCreating ? "Thêm dịch vụ mới" : "Chỉnh sửa dịch vụ"}
                </SheetTitle>
              </SheetHeader>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar" data-lenis-prevent="true">
                <div className="p-6 space-y-6">
                  {/* Khối 1: Thông tin cơ bản */}
                  <div className="rounded-2xl border border-border/50 bg-muted/10 p-5 space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                      <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Thông tin cơ bản</h3>
                    </div>
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
                        className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
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
                        className="input w-full px-4 py-3 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Nhóm dịch vụ
                      </label>
                      <select
                        value={editingService.category}
                        onChange={(e) => {
                          const selectedCat = e.target.value as ServiceCategoryName
                          setEditingService({
                            ...editingService,
                            category: selectedCat,
                            type: selectedCat === "Rửa xe & combo" ? "slot" : "flex",
                          })
                        }}
                        className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      >
                        {categoryNames.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-2 font-medium bg-background px-3 py-2 rounded-lg border border-border/50 inline-block">
                        {editingService.category === "Rửa xe & combo"
                          ? "✓ Dịch vụ đặt cầu (WASH)"
                          : "✓ Dịch vụ phụ trợ linh hoạt (FLEX)"}
                      </p>
                    </div>
                  </div>

                  {/* Khối 2: Bảng giá */}
                  <div className="rounded-2xl border border-border/50 bg-muted/10 p-5 space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                      <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Bảng giá theo cỡ xe</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {(["S", "M", "L"] as const).map((size) => (
                        <div key={size} className="bg-background rounded-xl p-3 border border-border shadow-sm flex flex-col items-center">
                          <span className="w-8 h-8 flex items-center justify-center font-black text-foreground bg-muted rounded-full mb-3 text-sm">
                            {size}
                          </span>
                          <div className="w-full relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">đ</span>
                            <input
                              type="number"
                              value={editingService.prices[size]}
                              onChange={(e) => {
                                const val = e.target.value
                                setEditingService({
                                  ...editingService,
                                  prices: {
                                    ...editingService.prices,
                                    [size]: val === '' ? '' : (parseInt(val) || 0),
                                  },
                                })
                              }}
                              className="input w-full pl-6 pr-2 py-2 text-center font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background border-none bg-transparent rounded-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Khối 3: Thiết lập khác */}
                  <div className="rounded-2xl border border-border/50 bg-muted/10 p-5 space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                      <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Thiết lập hệ thống</h3>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Thời lượng ước tính (phút)
                      </label>
                      <input
                        type="number"
                        value={editingService.durationMinutes}
                        onChange={(e) => {
                          const val = e.target.value
                          setEditingService({
                            ...editingService,
                            durationMinutes: val === '' ? '' : (parseInt(val) || 0),
                          })
                        }}
                        className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl shadow-sm">
                      <div>
                        <label className="text-sm font-bold text-foreground">Trạng thái kích hoạt</label>
                        <p className="text-xs text-muted-foreground mt-0.5">Cho phép khách hàng đặt dịch vụ này</p>
                      </div>
                      <button
                        onClick={() =>
                          setEditingService({
                            ...editingService,
                            active: !editingService.active,
                          })
                        }
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner ${
                          editingService.active ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                            editingService.active ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <SheetFooter className="border-t border-border p-6 flex flex-row gap-3 bg-muted/30 sm:justify-start">
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
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa vĩnh viễn dịch vụ?"
        description={`Hành động này sẽ xóa hoàn toàn dịch vụ "${serviceToDelete?.name}" khỏi hệ thống. Bạn không thể hoàn tác hành động này.`}
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy"
        tone="danger"
        loading={deleteLoading}
      />
    </div>
  )
}
