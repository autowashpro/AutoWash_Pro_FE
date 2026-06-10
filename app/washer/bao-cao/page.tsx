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
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Báo cáo kiểm tra</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">
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
