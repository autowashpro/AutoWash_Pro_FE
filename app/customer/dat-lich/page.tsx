import { Suspense } from "react"
import { BookingWizard } from "@/components/customer/booking-wizard"
import { Loader2 } from "lucide-react"

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Đặt lịch rửa xe</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">Hoàn thành các bước để chốt lịch hẹn một cách nhanh chóng.</p>
      </div>
      <Suspense fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }>
        <BookingWizard />
      </Suspense>
    </div>
  )
}
