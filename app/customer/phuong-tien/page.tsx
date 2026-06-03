"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { VEHICLES } from "@/lib/data"
import { VehicleForm } from "@/components/customer/vehicle-form"
import type { Vehicle } from "@/lib/data"
import { cn } from "@/lib/utils"

const SIZE_LABELS = { S: "Nhỏ (S)", M: "Vừa (M)", L: "Lớn (L)" }

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined)

  const handleAddVehicle = (data: Omit<Vehicle, "id">) => {
    const newVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      ...data,
    }
    setVehicles([...vehicles, newVehicle])
    setIsSheetOpen(false)
  }

  const handleUpdateVehicle = (data: Omit<Vehicle, "id">) => {
    if (!editingVehicle) return
    setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? { ...v, ...data } : v)))
    setEditingVehicle(undefined)
    setIsSheetOpen(false)
  }

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setVehicles(vehicles.map((v) => ({ ...v, isDefault: v.id === id })))
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setEditingVehicle(undefined)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-32">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Xe của tôi</h1>
        <p className="text-sm text-muted-foreground">Quản lý thông tin phương tiện để đặt lịch nhanh hơn.</p>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Chưa có xe nào được lưu.</p>
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="size-4" />
            Thêm xe mới
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={cn(
                "rounded-2xl border-2 p-5 transition-all",
                vehicle.isDefault
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground",
              )}
            >
              {/* Header with default badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-lg font-bold text-primary">{vehicle.plate}</p>
                    {vehicle.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                        <CheckCircle2 className="size-3" />
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                </div>
              </div>

              {/* Vehicle info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="size-4 rounded-full border border-muted-foreground"
                    style={{ backgroundColor: vehicle.colorHex }}
                  />
                  <span className="text-sm text-foreground">{vehicle.color}</span>
                </div>
                <div>
                  <span className="inline-block rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                    {SIZE_LABELS[vehicle.size]}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(vehicle)}
                >
                  <Edit2 className="size-4" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                >
                  <Trash2 className="size-4" />
                  Xóa
                </Button>
                {!vehicle.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSetDefault(vehicle.id)}
                  >
                    Đặt mặc định
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      {vehicles.length > 0 && (
        <div className="fixed bottom-8 right-8">
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
        <SheetContent className="w-full sm:max-w-md">
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
    </div>
  )
}
