import { Car, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VEHICLES } from "@/lib/data"

export default function VehiclesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Phương tiện của tôi</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách xe để đặt lịch nhanh hơn.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Thêm xe
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {VEHICLES.map((v) => (
          <div key={v.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Car className="size-6" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{v.model}</p>
                <p className="font-mono text-sm text-muted-foreground">{v.plate}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Loại xe</dt>
                <dd className="font-medium text-foreground">{v.type}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Màu sắc</dt>
                <dd className="font-medium text-foreground">{v.color}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}
