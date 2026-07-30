"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, X, Loader2, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatVND, CATALOG } from "@/lib/data"
import { getAdminRewards, createReward, updateReward, getServices, apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type MembershipTier = "MEMBER" | "SILVER" | "GOLD" | "PLATINUM"

interface EditingReward {
  id: string
  title: string
  description: string
  discountType: "fixed" | "percent" | "free_service" | "physical_gift"
  discountValue: number | ''
  pointsCost: number | ''
  minTier: MembershipTier
  quantity: number | ''
  expiryDate: string
  active: boolean
  category: string
  serviceId?: string
  minOrderValue?: number | ''
  maxDiscountAmount?: number | ''
  usageLimitPerUser?: number | ''
  isExactTierOnly?: boolean
}

const tierLabels: Record<MembershipTier, string> = {
  MEMBER: "Thành viên",
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch kim",
}

const getTierColor = (tier: MembershipTier) => {
  switch (tier) {
    case "MEMBER":
      return "bg-slate-100 text-slate-700 border-slate-300"
    case "SILVER":
      return "bg-blue-100 text-blue-700 border-blue-300"
    case "GOLD":
      return "bg-gold/10 text-gold border-gold/30"
    case "PLATINUM":
      return "bg-purple-100 text-purple-700 border-purple-300"
  }
}

const isRewardExpired = (expiryDate?: string) => {
  if (!expiryDate) return false
  const exp = new Date(expiryDate)
  exp.setHours(23, 59, 59, 999)
  return exp.getTime() < Date.now()
}

const getStatusBadgeColor = (active: boolean, expiryDate?: string) => {
  if (isRewardExpired(expiryDate)) {
    return "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400"
  }
  return active
    ? "bg-success/10 text-success border-success/30"
    : "bg-rose-50 text-rose-600 border-rose-200"
}

const getStatusLabel = (active: boolean, expiryDate?: string) => {
  if (isRewardExpired(expiryDate)) {
    return "Đã hết hạn"
  }
  return active ? "Hoạt động" : "Tạm dừng"
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<EditingReward[]>([])
  const [editingReward, setEditingReward] = useState<EditingReward | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [storeServices, setStoreServices] = useState<any[]>([])
  
  const { toast } = useToast()

  useEffect(() => {
    // Fetch store services for dropdown
    const fetchStoreServices = async () => {
      try {
        const categories = await getServices({ vehicle_size: 'MEDIUM' })
        const list: any[] = []
        if (Array.isArray(categories)) {
          categories.forEach((cat) => {
            if (Array.isArray(cat.services)) {
              cat.services.forEach((s) => {
                list.push({
                  id: s.service_id || (s as any).id,
                  name: s.name,
                  price: s.price || (s as any).base_price || 0,
                  categoryName: cat.name,
                })
              })
            }
          })
        }
        if (list.length > 0) {
          setStoreServices(list)
          return
        }
      } catch (err) {
        console.warn("getServices API failed, using CATALOG fallback", err)
      }

      // Fallback to CATALOG from lib/data.ts
      const fallback = CATALOG.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price.M,
        categoryName: s.group,
      }))
      setStoreServices(fallback)
    }

    fetchStoreServices()
  }, [])

  const getCategoryLabel = (reward: EditingReward) => {
    if (reward.discountType === "physical_gift") {
      return "Quà hiện vật (Nhận tại quầy)"
    }
    if (reward.discountType === "free_service" && reward.serviceId) {
      const s = storeServices.find((srv) => (srv.id || srv.service_id) === reward.serviceId)
      if (s) return s.categoryName || s.category?.name || "Dịch vụ chỉ định"
    }
    return reward.serviceId ? "Dịch vụ chỉ định" : "Toàn bộ dịch vụ"
  }

  const mapApiToUI = (r: any): EditingReward => {
    const rawType = r.reward_type || r.rewardType || ''
    const val = r.value ?? r.discountValue ?? 0
    const srvId = r.service_id || r.serviceId || ''
    const titleLower = (r.name || r.title || '').toLowerCase()

    let type: "fixed" | "percent" | "free_service" | "physical_gift" = "fixed"

    // Detect Physical Gift (Khăn lau, Nước hoa, Móc khóa, etc.)
    if (
      titleLower.includes("khăn") ||
      titleLower.includes("nước hoa") ||
      titleLower.includes("móc khóa") ||
      titleLower.includes("gạt mưa") ||
      titleLower.includes("hiện vật") ||
      (rawType === 'ADD_ON_SERVICE' && !srvId)
    ) {
      type = 'physical_gift'
    } else if ((rawType === 'FREE_WASH' || rawType === 'ADD_ON_SERVICE') && srvId) {
      type = 'free_service'
    } else if (rawType === 'PERCENTAGE_DISCOUNT' && val <= 100) {
      type = 'percent'
    } else {
      type = 'fixed'
    }

    return {
      id: r.reward_id || r.id,
      title: r.name || r.title || "Voucher ưu đãi",
      description: r.description || "Voucher quy đổi ưu đãi dịch vụ",
      discountType: type,
      discountValue: val,
      pointsCost: r.points_required || r.pointsCost || 500,
      minTier: r.min_tier_required || 'MEMBER',
      quantity: r.total_quantity || r.quantity || 100,
      expiryDate: r.expiryDate || new Date(Date.now() + (r.valid_days || 30) * 864e5).toISOString().split('T')[0],
      active: r.status === 'ACTIVE' || (r.active ?? true),
      category: r.category || 'Rửa xe',
      serviceId: srvId,
      minOrderValue: r.min_order_value || r.minOrderValue || 0,
      maxDiscountAmount: r.max_discount_amount || r.maxDiscountAmount || '',
    }
  }

  const mapUIToApi = (ui: EditingReward) => ({
    name: ui.title,
    reward_type:
      ui.discountType === 'percent'
        ? 'PERCENTAGE_DISCOUNT'
        : ui.discountType === 'free_service'
        ? 'FREE_WASH'
        : ui.discountType === 'physical_gift'
        ? 'ADD_ON_SERVICE'
        : 'DISCOUNT_VOUCHER' as any,
    points_required: ui.pointsCost === '' ? 0 : ui.pointsCost,
    value: ui.discountType === 'free_service' ? 0 : ui.discountValue === '' ? 0 : ui.discountValue,
    min_tier_required: ui.minTier,
    valid_days: ui.expiryDate ? Math.max(1, Math.round((new Date(ui.expiryDate).getTime() - Date.now()) / 864e5)) : 30,
    description: ui.description || ui.title,
    status: ui.active ? 'ACTIVE' : 'INACTIVE',
    total_quantity: ui.quantity === '' ? 0 : ui.quantity,
    service_id: ui.discountType === 'free_service' ? (ui.serviceId || null) : null,
    min_order_value: ui.minOrderValue === '' ? 0 : ui.minOrderValue,
    max_discount_amount: ui.maxDiscountAmount === '' ? null : ui.maxDiscountAmount,
  })

  const fetchRewards = async () => {
    setLoading(true)
    try {
      let rewardList: EditingReward[] = []
      try {
        const res = await getAdminRewards()
        if (res && Array.isArray(res)) {
          rewardList = res.map(mapApiToUI)
        } else {
          rewardList = []
        }
      } catch (err) {
        console.error("Failed to fetch rewards from API:", err)
        rewardList = []
      }
      setRewards(rewardList)
    } catch (error) {
      toast({
        title: "Lỗi kết nối",
        description: "Không thể lấy danh sách phần thưởng. Đang hiển thị dữ liệu mô phỏng.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  const handleOpenEditDrawer = (reward: EditingReward) => {
    setEditingReward({ ...reward })
    setIsCreating(false)
  }

  const handleOpenCreateDrawer = () => {
    setEditingReward({
      id: "",
      title: "",
      description: "",
      discountType: "fixed",
      discountValue: 50000,
      pointsCost: 500,
      minTier: "MEMBER",
      quantity: 100,
      expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      active: true,
      category: "Rửa xe",
    })
    setIsCreating(true)
  }

  const handleSaveReward = async () => {
    if (editingReward) {
      if (!editingReward.title) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền tên voucher.",
          variant: "destructive",
        })
        return
      }

      if (editingReward.discountType === "free_service" && !editingReward.serviceId) {
        toast({
          title: "Thiếu dịch vụ quà tặng",
          description: "Vui lòng chọn dịch vụ được tặng miễn phí từ danh sách.",
          variant: "destructive",
        })
        return
      }

      if (editingReward.expiryDate && new Date(editingReward.expiryDate).getTime() < new Date().setHours(0,0,0,0)) {
        toast({
          title: "Ngày hết hạn không hợp lệ",
          description: "Ngày hết hạn sử dụng phải từ ngày hôm nay trở đi.",
          variant: "destructive",
        })
        return
      }

      try {
        if (isCreating) {
          try {
            await createReward(mapUIToApi(editingReward) as any)
          } catch (apiErr) {
            await apiClient.post('/admin/rewards', mapUIToApi(editingReward))
          }
          const savedItem = {
            ...editingReward,
            id: editingReward.id || `r-${Date.now()}`,
          }
          setRewards((prev) => [savedItem, ...prev])
          toast({
            title: "Tạo thành công",
            description: "Phần thưởng quy đổi đã được tạo mới thành công.",
          })
        } else {
          try {
            await updateReward(editingReward.id, mapUIToApi(editingReward) as any)
          } catch (apiErr) {
            await apiClient.put(`/admin/rewards/${editingReward.id}`, mapUIToApi(editingReward))
          }
          setRewards((prev) =>
            prev.map((r) => (r.id === editingReward.id ? editingReward : r))
          )
          toast({
            title: "Cập nhật thành công",
            description: "Thông tin phần thưởng đã được cập nhật thành công.",
          })
        }
        setEditingReward(null)
      } catch (err) {
        console.warn("API save reward failed, fallback offline", err)
        if (isCreating) {
          const newReward = {
            ...editingReward,
            id: `r-${Date.now()}`,
          }
          setRewards((prev) => [newReward, ...prev])
        } else {
          setRewards((prev) =>
            prev.map((r) => (r.id === editingReward.id ? editingReward : r))
          )
        }
        toast({
          title: "Đã cập nhật trên giao diện",
          description: "Thông tin phần thưởng đã được lưu và cập nhật trên danh sách.",
        })
        setEditingReward(null)
      }
    }
  }

  const handleDeleteReward = async (id: string) => {
    try {
      try {
        await apiClient.patch(`/admin/rewards/${id}/status`, { status: 'INACTIVE' })
      } catch (apiErr) {
        await updateReward(id, { status: 'INACTIVE' } as any)
      }
      toast({
        title: "Xóa thành công",
        description: "Đã hủy kích hoạt phần thưởng thành công.",
      })
      fetchRewards()
    } catch (err) {
      console.warn("API delete reward failed, fallback offline", err)
      setRewards(rewards.filter((r) => r.id !== id))
      toast({
        title: "Cập nhật ngoại tuyến",
        description: "Đã xóa phần thưởng khỏi danh sách tạm thời (Chế độ offline).",
      })
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Premium Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Quản lý Phần thưởng</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-3">Quản lý voucher và phần thưởng cho khách hàng thân thiết</p>
          </div>
          <Button onClick={handleOpenCreateDrawer} className="shadow-[var(--shadow-glow)] bg-gradient-to-r from-primary to-sky-500 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 transition-all duration-200">
            <Plus className="size-4" />
            Thêm phần thưởng
          </Button>
        </div>

        {/* Table / Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Đang tải danh sách phần thưởng...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {rewards.map((reward, index) => (
                <div 
                  key={reward.id} 
                  className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-1 flex flex-col group/ticket"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Fake cutouts for ticket effect */}
                  <div className="absolute top-[88px] -left-3 w-6 h-6 bg-muted/30 rounded-full border-r border-border z-10 shadow-inner"></div>
                  <div className="absolute top-[88px] -right-3 w-6 h-6 bg-muted/30 rounded-full border-l border-border z-10 shadow-inner"></div>

                  {/* Ticket Header */}
                  <div className="p-6 pb-5 border-b-2 border-dashed border-border/60 relative bg-gradient-to-br from-card to-muted/20">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="font-extrabold text-lg leading-tight text-foreground line-clamp-2">{reward.title}</h3>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getStatusBadgeColor(reward.active, reward.expiryDate)}`}>
                        {getStatusLabel(reward.active, reward.expiryDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-primary drop-shadow-sm">
                        {reward.discountType === "fixed"
                          ? formatVND(Number(reward.discountValue || 0))
                          : reward.discountType === "percent"
                          ? `${reward.discountValue || 0}%`
                          : reward.discountType === "physical_gift"
                          ? "🎁 QUÀ TẶNG"
                          : "🛠️ MIỄN PHÍ"}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {reward.discountType === "free_service"
                          ? "DỊCH VỤ"
                          : reward.discountType === "physical_gift"
                          ? "HIỆN VẬT"
                          : "GIẢM GIÁ"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Ticket Body */}
                  <div className="p-6 pt-5 flex-1 flex flex-col justify-between bg-card relative">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground font-medium">Điểm đổi:</span>
                        <span className="font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded-md">{Number(reward.pointsCost).toLocaleString()} pts</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground font-medium">Hạng áp dụng:</span>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getTierColor(reward.minTier)}`}>
                          {reward.isExactTierOnly ? `🎯 Độc quyền ${tierLabels[reward.minTier]}` : tierLabels[reward.minTier]}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground font-medium">Số lượng còn:</span>
                        <span className="font-semibold">{reward.quantity} vé</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                      <Button size="sm" variant="outline" className="flex-1 rounded-xl h-10 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => handleOpenEditDrawer(reward)}>
                        <Pencil className="size-4 mr-2" /> Sửa vé
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 rounded-xl h-10 text-destructive hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors" onClick={() => handleDeleteReward(reward.id)}>
                        <Trash2 className="size-4 mr-2" /> Hủy vé
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && rewards.length === 0 && (
          <div className="text-center py-16 bg-card rounded-xl border border-border shadow-[var(--shadow-card)]">
            <div className="text-muted-foreground font-semibold">Chưa có phần thưởng nào. Hãy thêm phần thưởng đầu tiên.</div>
          </div>
        )}
      </div>

      {/* Edit/Create Drawer */}
      <Sheet open={!!editingReward} onOpenChange={(open) => !open && setEditingReward(null)}>
        <SheetContent className="w-full sm:max-w-[860px] p-0 flex flex-col gap-0 border-l border-border shadow-2xl bg-card">
          {editingReward && (
            <>
              {/* Header */}
              <SheetHeader className="p-6 border-b border-border bg-muted/30 backdrop-blur-md relative z-10">
                <SheetTitle className="text-xl font-bold text-foreground">
                  {isCreating ? "Thêm phần thưởng" : "Chỉnh sửa phần thưởng"}
                </SheetTitle>
              </SheetHeader>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar" data-lenis-prevent="true">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Cột trái: Nhập liệu */}
                    <div className="lg:col-span-3 space-y-6">
                      
                      {/* Khối 1: Thông tin cơ bản */}
                      <div className="rounded-2xl border border-border/50 bg-muted/10 p-5 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Thông tin cơ bản</h3>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">
                            Tên voucher / Tiêu đề
                          </label>
                          <input
                            type="text"
                            value={editingReward.title}
                            onChange={(e) =>
                              setEditingReward({ ...editingReward, title: e.target.value })
                            }
                            placeholder="Ví dụ: Giảm 50.000đ"
                            className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">
                            Mô tả chi tiết
                          </label>
                          <textarea
                            value={editingReward.description}
                            onChange={(e) =>
                              setEditingReward({ ...editingReward, description: e.target.value })
                            }
                            placeholder="Mô tả chi tiết về phần thưởng"
                            className="input w-full px-4 py-3 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24 shadow-sm"
                          />
                        </div>
                      </div>

                        {/* Khối 2: Cấu hình ưu đãi */}
                        <div className="rounded-2xl border border-border/50 bg-muted/10 p-5 space-y-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Cấu hình ưu đãi</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-foreground mb-2 block">Loại phần thưởng</label>
                              <select
                                value={editingReward.discountType}
                                onChange={(e) =>
                                  setEditingReward({
                                    ...editingReward,
                                    discountType: e.target.value as "fixed" | "percent" | "free_service" | "physical_gift",
                                  })
                                }
                                className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-medium"
                              >
                                <option value="fixed">💵 Voucher Giảm số tiền (VND)</option>
                                <option value="percent">🏷️ Voucher Giảm phần trăm (%)</option>
                                <option value="free_service">🛠️ Dịch vụ Tặng Miễn phí (0đ)</option>
                                <option value="physical_gift">🎁 Quà tặng Hiện vật (Nhận tại quầy)</option>
                              </select>
                            </div>
                            <div>
                              {editingReward.discountType === "free_service" ? (
                                <div>
                                  <label className="text-sm font-semibold text-foreground mb-2 block text-amber-600 dark:text-amber-400">
                                    Dịch vụ được Tặng Miễn phí <span className="text-rose-500">*</span>
                                  </label>
                                  <select
                                    value={editingReward.serviceId || ""}
                                    onChange={(e) => {
                                      const srvId = e.target.value
                                      const srv = storeServices.find((s) => (s.id || s.service_id) === srvId)
                                      const autoTitle = (!editingReward.title || editingReward.title.startsWith("Miễn phí")) && srv
                                        ? `Miễn phí ${srv.name}`
                                        : editingReward.title

                                      setEditingReward({
                                        ...editingReward,
                                        serviceId: srvId,
                                        title: autoTitle,
                                      })
                                    }}
                                    className="input w-full px-4 py-2.5 border border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                                  >
                                    <option value="">-- Chọn dịch vụ quà tặng --</option>
                                    {storeServices.map((s) => (
                                      <option key={s.id || s.service_id} value={s.id || s.service_id}>
                                        {s.name} ({formatVND(s.base_price || s.price || 0)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : editingReward.discountType === "physical_gift" ? (
                                <div>
                                  <label className="text-sm font-semibold text-foreground mb-2 block text-purple-600 dark:text-purple-400">
                                    Trị giá quà tặng ước tính (VND)
                                  </label>
                                  <input
                                    type="number"
                                    value={editingReward.discountValue}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      setEditingReward({
                                        ...editingReward,
                                        discountValue: val === '' ? '' : (parseInt(val) || 0),
                                      })
                                    }}
                                    placeholder="Ví dụ: 80000 (Trị giá hiện vật)"
                                    className="input w-full px-4 py-2.5 border border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <label className="text-sm font-semibold text-foreground mb-2 block">
                                    Giá trị giảm {editingReward.discountType === "fixed" ? "(VND)" : "(%)"}
                                  </label>
                                  <input
                                    type="number"
                                    value={editingReward.discountValue}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      setEditingReward({
                                        ...editingReward,
                                        discountValue: val === '' ? '' : (parseInt(val) || 0),
                                      })
                                    }}
                                    placeholder="Nhập giá trị"
                                    className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Min order value & Max discount or Quantity */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-foreground mb-2 block">
                                Đơn hàng tối thiểu (VND)
                              </label>
                              <input
                                type="number"
                                value={editingReward.minOrderValue ?? ''}
                                onChange={(e) =>
                                  setEditingReward({
                                    ...editingReward,
                                    minOrderValue: e.target.value === '' ? '' : (parseInt(e.target.value) || 0),
                                  })
                                }
                                placeholder="0 (Không giới hạn)"
                                className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                              />
                            </div>

                            {editingReward.discountType === "percent" ? (
                              <div>
                                <label className="text-sm font-semibold text-foreground mb-2 block">
                                  Mức giảm tối đa (VND)
                                </label>
                                <input
                                  type="number"
                                  value={editingReward.maxDiscountAmount ?? ''}
                                  onChange={(e) =>
                                    setEditingReward({
                                      ...editingReward,
                                      maxDiscountAmount: e.target.value === '' ? '' : (parseInt(e.target.value) || 0),
                                    })
                                  }
                                  placeholder="Tối đa (Ví dụ: 50000)"
                                  className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="text-sm font-semibold text-foreground mb-2 block">Số lượng phát hành</label>
                                <input
                                  type="number"
                                  value={editingReward.quantity}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setEditingReward({
                                      ...editingReward,
                                      quantity: val === '' ? '' : (parseInt(val) || 0),
                                    })
                                  }}
                                  placeholder="Ví dụ: 100"
                                  className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* Row 3: Points cost & Min tier */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-foreground mb-2 block">Điểm cần đổi (pts)</label>
                              <input
                                type="number"
                                value={editingReward.pointsCost}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setEditingReward({
                                    ...editingReward,
                                    pointsCost: val === '' ? '' : (parseInt(val) || 0),
                                  })
                                }}
                                className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-foreground mb-2 block">Hạng tối thiểu</label>
                              <select
                                value={editingReward.minTier}
                                onChange={(e) =>
                                  setEditingReward({
                                    ...editingReward,
                                    minTier: e.target.value as MembershipTier,
                                  })
                                }
                                className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                              >
                                <option value="MEMBER">Thành viên</option>
                                <option value="SILVER">Bạc</option>
                                <option value="GOLD">Vàng</option>
                                <option value="PLATINUM">Bạch kim</option>
                              </select>
                            </div>
                          </div>

                          {/* Row 4: Usage Limit & Exact Tier Checkbox */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-foreground mb-2 block">
                                Số lần đổi tối đa / Khách hàng
                              </label>
                              <input
                                type="number"
                                value={editingReward.usageLimitPerUser ?? 1}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setEditingReward({
                                    ...editingReward,
                                    usageLimitPerUser: val === '' ? '' : (parseInt(val) || 1),
                                  })
                                }}
                                placeholder="1 (Tối đa 1 lần/khách)"
                                className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                              />
                            </div>
                            <div className="flex items-center pt-6">
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                                <input
                                  type="checkbox"
                                  checked={Boolean(editingReward.isExactTierOnly)}
                                  onChange={(e) =>
                                    setEditingReward({
                                      ...editingReward,
                                      isExactTierOnly: e.target.checked,
                                    })
                                  }
                                  className="size-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span>Chỉ áp dụng chính xác cho hạng này (Không lũy tiến)</span>
                              </label>
                            </div>
                          </div>
                        </div>

                      {/* Khối 3: Thiết lập hệ thống */}
                      <div className="rounded-2xl border border-border/50 bg-muted/10 p-5 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Thiết lập hệ thống</h3>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">Ngày hết hạn sử dụng</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal rounded-xl bg-background h-[42px] px-4 border-border hover:bg-muted/50 hover:text-foreground shadow-sm",
                                  !editingReward.expiryDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                {editingReward.expiryDate ? editingReward.expiryDate : <span>Chọn ngày hết hạn</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[100]" align="start">
                              <Calendar
                                mode="single"
                                selected={editingReward.expiryDate ? new Date(editingReward.expiryDate) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    const tzOffset = date.getTimezoneOffset() * 60000;
                                    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().split('T')[0];
                                    setEditingReward({ ...editingReward, expiryDate: localISOTime })
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl shadow-sm">
                          <div>
                            <label className="text-sm font-bold text-foreground">Trạng thái hoạt động</label>
                            <p className="text-xs text-muted-foreground mt-0.5">Cho phép khách hàng đổi điểm lấy phần thưởng này</p>
                          </div>
                          <button
                            onClick={() =>
                              setEditingReward({
                                ...editingReward,
                                active: !editingReward.active,
                              })
                            }
                            className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner ${
                              editingReward.active ? "bg-primary" : "bg-muted-foreground/30"
                            }`}
                          >
                            <div
                              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                                editingReward.active ? "translate-x-6" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cột phải: Live Preview */}
                    <div className="lg:col-span-2 hidden lg:block">
                      <div className="sticky top-0 pt-2">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-1.5 h-4 bg-sky-500 rounded-full"></span>
                          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Bản xem trước (Live Preview)</h3>
                        </div>
                        
                        {/* Tấm vé ảo */}
                        <div className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-card)] flex flex-col group/ticket transform hover:scale-[1.02] transition-transform duration-300">
                          <div className="absolute top-[88px] -left-3 w-6 h-6 bg-muted/40 rounded-full border-r border-border z-10 shadow-inner"></div>
                          <div className="absolute top-[88px] -right-3 w-6 h-6 bg-muted/40 rounded-full border-l border-border z-10 shadow-inner"></div>

                          <div className="p-6 pb-5 border-b-2 border-dashed border-border/60 relative bg-gradient-to-br from-card to-muted/20">
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <h3 className="font-extrabold text-lg leading-tight text-foreground line-clamp-2">
                                {editingReward.title || 'Tên Voucher hiển thị...'}
                              </h3>
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getStatusBadgeColor(editingReward.active)}`}>
                                {getStatusLabel(editingReward.active)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-2xl sm:text-3xl font-black text-primary drop-shadow-sm">
                                {editingReward.discountType === "fixed"
                                  ? formatVND(Number(editingReward.discountValue || 0))
                                  : editingReward.discountType === "percent"
                                  ? `${editingReward.discountValue || 0}%`
                                  : editingReward.discountType === "physical_gift"
                                  ? "🎁 QUÀ TẶNG"
                                  : "🛠️ MIỄN PHÍ"}
                              </span>
                              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                {editingReward.discountType === "free_service"
                                  ? "DỊCH VỤ"
                                  : editingReward.discountType === "physical_gift"
                                  ? "HIỆN VẬT"
                                  : "GIẢM GIÁ"}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-6 pt-5 flex-1 flex flex-col justify-between bg-background relative">
                            <div className="space-y-4 mb-2">
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground font-medium">Điểm đổi:</span>
                                <span className="font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded-md">{Number(editingReward.pointsCost || 0).toLocaleString()} pts</span>
                              </div>
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground font-medium">Hạng tối thiểu:</span>
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getTierColor(editingReward.minTier)}`}>
                                  {tierLabels[editingReward.minTier]}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground font-medium">Phạm vi áp dụng:</span>
                                <span className="font-semibold text-primary">{getCategoryLabel(editingReward)}</span>
                              </div>
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground font-medium">Số lượng còn:</span>
                                <span className="font-semibold">{editingReward.quantity === '' ? 0 : editingReward.quantity} vé</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary flex items-start gap-3">
                          <span className="text-xl">✨</span>
                          <p className="leading-relaxed">Đây là hình ảnh mô phỏng thực tế cách khách hàng nhìn thấy tấm vé phần thưởng này trên ứng dụng AutoWash.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <SheetFooter className="border-t border-border p-6 flex flex-row gap-3 bg-muted/30 sm:justify-start">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingReward(null)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveReward}
                >
                  {isCreating ? "Tạo phần thưởng" : "Lưu thay đổi"}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
