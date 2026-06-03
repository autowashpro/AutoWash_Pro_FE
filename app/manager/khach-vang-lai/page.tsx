import { WalkInForm } from "@/components/manager/walk-in-form"

export default function WalkInPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tiếp nhận khách vãng lai</h1>
        <p className="text-sm text-muted-foreground">
          Tạo phiếu dịch vụ nhanh cho khách đến trực tiếp không đặt lịch trước.
        </p>
      </div>
      <WalkInForm />
    </div>
  )
}
