"use client"

import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, CheckCircle2, Loader2, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { VehicleForm } from "@/components/customer/vehicle-form"
import type { Vehicle } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getMyVehicles, createVehicle, updateVehicle, deleteVehicle } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { MonoText } from "@/components/shared/mono-text"

const SIZE_LABELS = {
  SMALL: "Nhỏ (S)",
  MEDIUM: "Vừa (M)",
  LARGE: "Lớn (L)",
}

const COLOR_HEX_MAP: Record<string, string> = {
  "Trắng Ngọc Trai": "#f5f5f5",
  "Đen": "#1a1a1a",
  "Xám": "#7f8c8d",
  "Bạc": "#c0c0c0",
  "Đỏ": "#dc2626",
  "Xanh đen": "#1e3a8a",
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined)
  
  // Deletion confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()

  const loadVehicles = async () => {
    // TODO: connect API
    try {
      const list = await getMyVehicles()
      setVehicles(list)
    } catch (error) {
      console.warn("Failed to load customer vehicles, using mock fallback:", error)
      const fallbackVehicles: Vehicle[] = [
        {
          vehicle_id: "v-1",
          license_plate: "51A-123.45",
          brand: "Toyota",
          model: "Camry",
          color: "Trắng Ngọc Trai",
          vehicle_size: "MEDIUM",
          is_default: true,
          notes: "Xe gia đình"
        },
        {
          vehicle_id: "v-2",
          license_plate: "30A-678.90",
          brand: "VinFast",
          model: "VF8",
          color: "Đen",
          vehicle_size: "MEDIUM",
          is_default: false
        },
        {
          vehicle_id: "v-3",
          license_plate: "29B-456.78",
          brand: "Ford",
          model: "Ranger",
          color: "Xám",
          vehicle_size: "LARGE",
          is_default: false
        }
      ]
      setVehicles(fallbackVehicles)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const handleAddVehicle = async (data: Omit<Vehicle, "vehicle_id">) => {
    try {
      await createVehicle(data as any)
      toast({
        title: "Thành công",
        description: "Thêm phương tiện mới thành công.",
      })
      await loadVehicles()
      setIsSheetOpen(false)
    } catch (error: any) {
      console.error("Failed to add vehicle:", error)
      const beMessage = error?.response?.data?.message || error?.response?.data?.error || "Không thể thêm xe mới. Vui lòng kiểm tra lại thông tin (biển số, định dạng) hoặc thử lại sau."
      toast({
        variant: "destructive",
        title: "Thêm xe thất bại",
        description: beMessage,
      })
    }
  }

  const handleUpdateVehicle = async (data: Omit<Vehicle, "vehicle_id">) => {
    if (!editingVehicle) return
    try {
      await updateVehicle(editingVehicle.vehicle_id, data)
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin xe thành công.",
      })
      await loadVehicles()
      setEditingVehicle(undefined)
      setIsSheetOpen(false)
    } catch (error: any) {
      console.error("Failed to update vehicle:", error)
      const beMessage = error?.response?.data?.message || error?.response?.data?.error || "Không thể cập nhật thông tin xe. Vui lòng kiểm tra lại và thử lại sau."
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: beMessage,
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      await deleteVehicle(deletingId)
      toast({
        title: "Thành công",
        description: "Đã xóa phương tiện khỏi tài khoản của bạn.",
      })
      await loadVehicles()
      setDeletingId(null)
    } catch (error: any) {
      console.error("Failed to delete vehicle:", error)
      const status = error?.response?.status
      const msg = error?.response?.data?.message || ""
      
      if (status === 422 || msg.toLowerCase().includes("booking") || msg.toLowerCase().includes("lịch hẹn")) {
        toast({
          variant: "destructive",
          title: "Không thể xóa xe",
          description: "Phương tiện này hiện đang có lịch đặt hẹn hoạt động trong hệ thống. Vui lòng hoàn thành hoặc hủy lịch hẹn trước khi xóa.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Xóa thất bại",
          description: msg || "Đã xảy ra lỗi khi xóa phương tiện. Vui lòng thử lại sau.",
        })
      }
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const target = vehicles.find((v) => v.vehicle_id === id)
      const payload = target
        ? {
            license_plate: target.license_plate,
            brand: target.brand,
            model: target.model,
            color: target.color,
            vehicle_size: target.vehicle_size,
            notes: target.notes,
            is_default: true,
          }
        : { is_default: true }

      await updateVehicle(id, payload)
      toast({
        title: "Thành công",
        description: "Đã thiết lập xe mặc định để đặt lịch nhanh hơn.",
      })
      await loadVehicles()
    } catch (error: any) {
      console.error("Failed to set default vehicle:", error)
      const beMessage = error?.response?.data?.message || error?.response?.data?.error || "Không thể đặt xe này làm mặc định. Vui lòng thử lại sau."
      toast({
        variant: "destructive",
        title: "Lỗi thiết lập xe mặc định",
        description: beMessage,
      })
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setEditingVehicle(undefined)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải danh sách xe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-32">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Xe của tôi</h1>
        <p className="text-sm text-muted-foreground">Quản lý thông tin phương tiện để đặt lịch nhanh hơn.</p>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center flex flex-col items-center">
          <Car className="size-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">Chưa có phương tiện nào được lưu trong tài khoản của bạn.</p>
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="size-4" />
            Thêm xe mới
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {vehicles.map((vehicle) => {
            const colorHex = COLOR_HEX_MAP[vehicle.color] || "#f5f5f5"
            return (
              <div
                key={vehicle.vehicle_id}
                className={cn(
                  "group relative rounded-2xl border-2 p-5.5 transition-all duration-200 flex flex-col justify-between bg-card shadow-xs hover:shadow-md",
                  vehicle.is_default
                    ? "border-primary bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent ring-1 ring-primary/10"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div>
                  {/* Header with default badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-900 px-3 py-1 text-white shadow-2xs">
                          <span className="text-[10px] font-black uppercase text-slate-400">VN</span>
                          <span className="font-mono text-base font-black tracking-widest uppercase">
                            {vehicle.license_plate}
                          </span>
                        </div>
                        {vehicle.is_default && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary shadow-2xs">
                            <CheckCircle2 className="size-3.5" />
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-base font-bold text-foreground tracking-tight pt-1">
                        {vehicle.brand} <span className="font-semibold text-slate-600">{vehicle.model}</span>
                      </p>
                    </div>
                  </div>

                  {/* Vehicle info */}
                  <div className="space-y-2.5 mb-5 rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span className="text-muted-foreground">Màu ngoại thất:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: colorHex }}
                        />
                        <span className="font-semibold text-foreground">{vehicle.color}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span className="text-muted-foreground">Phân hạng kích thước:</span>
                      <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {SIZE_LABELS[vehicle.vehicle_size] || vehicle.vehicle_size}
                      </span>
                    </div>
                    {vehicle.notes && (
                      <div className="pt-1.5 border-t border-slate-200/60 text-xs text-muted-foreground italic">
                        <span className="font-semibold text-slate-600">Ghi chú:</span> {vehicle.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-100 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl h-9 font-semibold text-slate-700 border-slate-200 hover:bg-slate-100"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <Edit2 className="size-3.5" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-9 px-3 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                    onClick={() => setDeletingId(vehicle.vehicle_id)}
                    title="Xóa xe"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                  {!vehicle.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl h-9 font-semibold border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() => handleSetDefault(vehicle.vehicle_id)}
                    >
                      Chọn mặc định
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating Action Button */}
      {vehicles.length > 0 && (
        <div className="fixed bottom-8 right-8 z-10">
          <Button
            size="lg"
            className="rounded-2xl h-14 px-6 shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 font-bold text-base transition-all hover:scale-105"
            onClick={() => {
              setEditingVehicle(undefined)
              setIsSheetOpen(true)
            }}
          >
            <Plus className="size-5" />
            Thêm phương tiện mới
          </Button>
        </div>
      )}

      {/* Add/Edit Vehicle Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={handleCloseSheet}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-6 sm:p-8 bg-background border-l border-slate-200 shadow-2xl">
          <SheetHeader className="space-y-1.5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Car className="size-5.5 stroke-[2.2]" />
              </div>
              <div>
                <SheetTitle className="text-xl font-extrabold tracking-tight text-foreground">
                  {editingVehicle ? "Chỉnh sửa hồ sơ xe" : "Thêm phương tiện mới"}
                </SheetTitle>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  {editingVehicle ? "Cập nhật biển số, dòng xe, kích thước hoặc màu sắc." : "Điền thông tin xe để tính giá tự động và đặt lịch chăm sóc nhanh chóng."}
                </p>
              </div>
            </div>
          </SheetHeader>
          <div className="mt-5">
            <VehicleForm
              vehicle={editingVehicle}
              onSubmit={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
              onCancel={handleCloseSheet}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Deletion confirmation dialog */}
      <ConfirmDialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Xác nhận xóa xe"
        description="Bạn có chắc chắn muốn xóa phương tiện này? Hành động này không thể hoàn tác và thông tin xe sẽ bị loại khỏi tài khoản của bạn."
        confirmLabel="Xóa xe"
        cancelLabel="Bỏ qua"
        tone="danger"
      />
    </div>
  )
}
