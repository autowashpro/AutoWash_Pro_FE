import { WalkInForm } from "@/components/manager/walk-in-form"

export default function WalkInPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Tiếp nhận khách vãng lai</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">
          Tạo phiếu dịch vụ nhanh cho khách đến trực tiếp không đặt lịch trước.
        </p>
      </div>
      <WalkInForm />
    </div>
  )
}
