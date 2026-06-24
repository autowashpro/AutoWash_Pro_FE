"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { REWARDS, formatVND } from "@/lib/data"
import { getAdminRewards, createReward, updateReward, apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type MembershipTier = "MEMBER" | "SILVER" | "GOLD" | "PLATINUM"

interface EditingReward {
  id: string
  title: string
  description: string
  discountType: "fixed" | "percent"
  discountValue: number
  pointsCost: number
  minTier: MembershipTier
  quantity: number
  expiryDate: string
  active: boolean
  category: "Rửa xe" | "Chăm sóc" | "Bảo vệ"
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

const getStatusBadgeColor = (active: boolean) => {
  return active
    ? "bg-success/10 text-success border-success/30"
    : "bg-rose-50 text-rose-600 border-rose-200"
}

const getStatusLabel = (active: boolean) => {
  return active ? "Hoạt động" : "Tạm dừng"
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<EditingReward[]>([])
  const [editingReward, setEditingReward] = useState<EditingReward | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { toast } = useToast()

  const mapApiToUI = (r: any): EditingReward => ({
    id: r.reward_id || r.id,
    title: r.name || r.title,
    description: r.description || "Voucher quy đổi ưu đãi dịch vụ",
    discountType: r.reward_type === 'PERCENTAGE_DISCOUNT' ? 'percent' : 'fixed',
    discountValue: r.value || 50000,
    pointsCost: r.points_required || r.pointsCost || 500,
    minTier: r.min_tier_required || 'MEMBER',
    quantity: r.total_quantity || r.quantity || 100,
    expiryDate: r.expiryDate || new Date(Date.now() + (r.valid_days || 30) * 864e5).toISOString().split('T')[0],
    active: r.status === 'ACTIVE' || (r.active ?? true),
    category: r.category || 'Rửa xe',
  })

  const mapUIToApi = (ui: EditingReward) => ({
    name: ui.title,
    reward_type: ui.discountType === 'percent' ? 'PERCENTAGE_DISCOUNT' : 'DISCOUNT_VOUCHER' as any,
    points_required: ui.pointsCost,
    value: ui.discountValue,
    min_tier_required: ui.minTier,
    valid_days: ui.expiryDate ? Math.max(1, Math.round((new Date(ui.expiryDate).getTime() - Date.now()) / 864e5)) : 30,
    description: ui.description || ui.title,
    status: ui.active ? 'ACTIVE' : 'INACTIVE',
    total_quantity: ui.quantity,
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
          rewardList = REWARDS.map(mapApiToUI)
        }
      } catch (err) {
        console.warn("Failed to fetch rewards from API, using mock data", err)
        rewardList = REWARDS.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          discountType: r.discountType || 'fixed',
          discountValue: r.discountValue || 50000,
          pointsCost: r.pointsCost || 500,
          minTier: r.minTier || 'MEMBER',
          quantity: r.quantity || 100,
          expiryDate: r.expiryDate || '2027-06-01',
          active: r.active ?? true,
          category: r.category || 'Rửa xe',
        }))
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

      try {
        if (isCreating) {
          try {
            await createReward(mapUIToApi(editingReward) as any)
          } catch (apiErr) {
            await apiClient.post('/admin/rewards', mapUIToApi(editingReward))
          }
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
          toast({
            title: "Cập nhật thành công",
            description: "Thông tin phần thưởng đã được cập nhật thành công.",
          })
        }
        fetchRewards()
        setEditingReward(null)
      } catch (err) {
        console.warn("API save reward failed, fallback offline", err)
        if (isCreating) {
          const newReward = {
            ...editingReward,
            id: `r-${Date.now()}`,
          }
          setRewards([...rewards, newReward])
        } else {
          setRewards(
            rewards.map((r) =>
              r.id === editingReward.id ? editingReward : r
            )
          )
        }
        toast({
          title: "Cập nhật ngoại tuyến",
          description: "Thông tin phần thưởng được lưu tạm thời trên trình duyệt (Chế độ offline).",
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
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)] animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tên voucher</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giá trị giảm</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Điểm cần</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hạng tối thiểu</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Số lượng</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rewards.map((reward, index) => (
                    <tr 
                      key={reward.id} 
                      className="transition-colors duration-150 hover:bg-primary/5"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground">{reward.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-foreground">
                          {reward.discountType === "fixed"
                            ? formatVND(reward.discountValue)
                            : `${reward.discountValue}%`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-primary">
                          {reward.pointsCost.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${getTierColor(reward.minTier)}`}
                        >
                          {tierLabels[reward.minTier]}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {reward.quantity} còn lại
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold border ${getStatusBadgeColor(reward.active)}`}
                        >
                          {getStatusLabel(reward.active)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditDrawer(reward)}
                          >
                            <Pencil className="size-3.5" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteReward(reward.id)}
                            className="text-destructive hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5"
                          >
                            <Trash2 className="size-3.5" />
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      {editingReward && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingReward(null)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-card border-l border-border shadow-2xl flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">
                {isCreating ? "Thêm phần thưởng" : "Chỉnh sửa phần thưởng"}
              </h2>
              <button
                onClick={() => setEditingReward(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
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
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Loại giảm giá
                </label>
                <select
                  value={editingReward.discountType}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      discountType: e.target.value as "fixed" | "percent",
                    })
                  }
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="fixed">Số tiền cố định (VND)</option>
                  <option value="percent">Phần trăm (%)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Giá trị giảm {editingReward.discountType === "fixed" ? "(VND)" : "(%)"}
                </label>
                <input
                  type="number"
                  value={editingReward.discountValue}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      discountValue: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Nhập giá trị"
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Điểm cần để đổi
                </label>
                <input
                  type="number"
                  value={editingReward.pointsCost}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      pointsCost: parseInt(e.target.value) || 0,
                    })
                  }
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Hạng thành viên tối thiểu
                </label>
                <select
                  value={editingReward.minTier}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      minTier: e.target.value as MembershipTier,
                    })
                  }
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="MEMBER">Thành viên</option>
                  <option value="SILVER">Bạc</option>
                  <option value="GOLD">Vàng</option>
                  <option value="PLATINUM">Bạch kim</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Danh mục dịch vụ áp dụng
                </label>
                <select
                  value={editingReward.category}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      category: e.target.value as "Rửa xe" | "Chăm sóc" | "Bảo vệ",
                    })
                  }
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Rửa xe">Rửa xe (WASH)</option>
                  <option value="Chăm sóc">Chăm sóc (FLEX)</option>
                  <option value="Bảo vệ">Bảo vệ (PRO)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Số lượng phát hành
                </label>
                <input
                  type="number"
                  value={editingReward.quantity}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Ngày hết hạn sử dụng
                </label>
                <input
                  type="date"
                  value={editingReward.expiryDate}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      expiryDate: e.target.value,
                    })
                  }
                  className="input w-full px-3 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <label className="text-sm font-semibold text-foreground">
                  Trạng thái hoạt động
                </label>
                <button
                  onClick={() =>
                    setEditingReward({
                      ...editingReward,
                      active: !editingReward.active,
                    })
                  }
                  className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                    editingReward.active ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      editingReward.active ? "translate-x-5" : ""
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
