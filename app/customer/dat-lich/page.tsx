import { BookingWizard } from "@/components/customer/booking-wizard"

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Đặt lịch rửa xe</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">Hoàn thành 4 bước để xác nhận lịch hẹn của bạn.</p>
      </div>
      <BookingWizard />
    </div>
  )
}
