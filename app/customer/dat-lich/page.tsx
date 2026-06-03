import { BookingWizard } from "@/components/customer/booking-wizard"

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Đặt lịch rửa xe
        </h1>
        <p className="text-sm text-muted-foreground">
          Hoàn thành 4 bước để xác nhận lịch hẹn của bạn.
        </p>
      </div>
      <BookingWizard />
    </div>
  )
}
