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
    } catch (error) {
      console.error("Failed to add vehicle:", error)
      toast({
        variant: "destructive",
        title: "Thêm thất bại",
        description: "Không thể thêm xe mới. Vui lòng kiểm tra và thử lại.",
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
    } catch (error) {
      console.error("Failed to update vehicle:", error)
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: "Không thể cập nhật thông tin xe. Vui lòng thử lại.",
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
          description: "Đã xảy ra lỗi khi xóa phương tiện. Vui lòng thử lại sau.",
        })
      }
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await updateVehicle(id, { is_default: true })
      toast({
        title: "Thành công",
        description: "Đã thiết lập xe mặc định để đặt lịch nhanh hơn.",
      })
      await loadVehicles()
    } catch (error) {
      console.error("Failed to set default vehicle:", error)
      toast({
        variant: "destructive",
        title: "Lỗi cài đặt",
        description: "Không thể đặt xe này làm mặc định. Vui lòng thử lại.",
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
                  "rounded-2xl border-2 p-5 transition-all flex flex-col justify-between",
                  vehicle.is_default
                    ? "border-primary bg-primary/5 dark:bg-primary/5"
                    : "border-border hover:border-muted-foreground",
                )}
              >
                <div>
                  {/* Header with default badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <MonoText className="text-lg font-bold text-primary">
                          {vehicle.license_plate}
                        </MonoText>
                        {vehicle.is_default && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                            <CheckCircle2 className="size-3" />
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{vehicle.brand} {vehicle.model}</p>
                    </div>
                  </div>

                  {/* Vehicle info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-4 rounded-full border border-muted-foreground/30 shadow-sm"
                        style={{ backgroundColor: colorHex }}
                      />
                      <span className="text-sm text-foreground">{vehicle.color}</span>
                    </div>
                    <div>
                      <span className="inline-block rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                        Cỡ xe: {SIZE_LABELS[vehicle.vehicle_size] || vehicle.vehicle_size}
                      </span>
                    </div>
                    {vehicle.notes && (
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        Ghi chú: {vehicle.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-3 border-t border-border mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <Edit2 className="size-4" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-950 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    onClick={() => setDeletingId(vehicle.vehicle_id)}
                  >
                    <Trash2 className="size-4" />
                    Xóa
                  </Button>
                  {!vehicle.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSetDefault(vehicle.vehicle_id)}
                    >
                      Mặc định
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
            className="rounded-full shadow-lg"
            onClick={() => {
              setEditingVehicle(undefined)
              setIsSheetOpen(true)
            }}
          >
            <Plus className="size-5" />
            Thêm xe mới
          </Button>
        </div>
      )}

      {/* Add/Edit Vehicle Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={handleCloseSheet}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingVehicle ? "Chỉnh sửa xe" : "Thêm xe mới"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
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
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Xác nhận xóa xe"
        description="Bạn có chắc chắn muốn xóa phương tiện này? Hành động này không thể hoàn tác và thông tin xe sẽ bị loại khỏi tài khoản của bạn."
        confirmText="Xóa xe"
        cancelText="Bỏ qua"
        variant="destructive"
      />
    </div>
  )
}
