"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { InspectionReport } from "@/components/washer/inspection-report"
import { Loader2 } from "lucide-react"

function ReportPageContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId") || ""

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Báo cáo kiểm tra</h1>
        <p className="text-sm text-muted-foreground">
          Ghi nhận tình trạng xe trước và sau khi rửa kèm hình ảnh minh chứng.
        </p>
      </div>
      {bookingId ? (
        <InspectionReport bookingId={bookingId} />
      ) : (
        <div className="p-8 text-center border border-dashed rounded-xl bg-card">
          <p className="text-muted-foreground">Không tìm thấy thông tin đặt lịch (bookingId).</p>
        </div>
      )}
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <ReportPageContent />
    </Suspense>
  )
}
