"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { REWARDS, formatVND } from "@/lib/data"

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
  const [rewards, setRewards] = useState(REWARDS)
  const [editingReward, setEditingReward] = useState<EditingReward | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleOpenEditDrawer = (reward: (typeof rewards)[0]) => {
    setEditingReward({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      discountType: reward.discountType,
      discountValue: reward.discountValue,
      pointsCost: reward.pointsCost,
      minTier: reward.minTier,
      quantity: reward.quantity,
      expiryDate: reward.expiryDate,
      active: reward.active,
    })
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
    })
    setIsCreating(true)
  }

  const handleSaveReward = () => {
    if (editingReward) {
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
      setEditingReward(null)
    }
  }

  const handleDeleteReward = (id: string) => {
    setRewards(rewards.filter((r) => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Quản lý Phần thưởng</h1>
            <p className="mt-2 text-muted-foreground">Quản lý voucher và phần thưởng cho khách hàng thân thiết</p>
          </div>
          <Button
            onClick={handleOpenCreateDrawer}
          >
            <Plus className="size-4" />
            Thêm phần thưởng
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tên voucher</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giá trị giảm</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Điểm cần</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hạng tối thiểu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Số lượng còn</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rewards.map((reward, index) => (
                  <tr 
                    key={reward.id} 
                    className="transition-colors duration-150 hover:bg-primary/5"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">{reward.title}</span>
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
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">{reward.quantity}</span>
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

        {rewards.length === 0 && (
          <div className="text-center py-16 bg-card rounded-xl border border-border shadow-[var(--shadow-card)]">
            <div className="text-muted-foreground">Chưa có phần thưởng nào. Hãy thêm phần thưởng đầu tiên.</div>
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
                  Tên voucher
                </label>
                <input
                  type="text"
                  value={editingReward.title}
                  onChange={(e) =>
                    setEditingReward({ ...editingReward, title: e.target.value })
                  }
                  placeholder="Ví dụ: Giảm 50.000đ"
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Mô tả
                </label>
                <textarea
                  value={editingReward.description}
                  onChange={(e) =>
                    setEditingReward({ ...editingReward, description: e.target.value })
                  }
                  placeholder="Mô tả chi tiết về phần thưởng"
                  className="input resize-none h-24"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Loại giảm
                </label>
                <select
                  value={editingReward.discountType}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      discountType: e.target.value as "fixed" | "percent",
                    })
                  }
                  className="input"
                >
                  <option value="fixed">Số tiền cố định</option>
                  <option value="percent">Phần trăm (%)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Giá trị {editingReward.discountType === "fixed" ? "(VND)" : "(%)"}
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
                  className="input"
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
                  className="input"
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
                  className="input"
                >
                  <option value="MEMBER">Thành viên</option>
                  <option value="SILVER">Bạc</option>
                  <option value="GOLD">Vàng</option>
                  <option value="PLATINUM">Bạch kim</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Số lượng còn
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
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Ngày hết hạn
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
                  className="input"
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
                Hủy
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveReward}
              >
                {isCreating ? "Thêm phần thưởng" : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
