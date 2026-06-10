"use client"

import { InspectionReport } from "@/components/washer/inspection-report"
import { useParams } from "next/navigation"

export default function WasherInspectionPage() {
  const params = useParams()
  const bookingId = params.id as string

  return (
    <div className="mx-auto max-w-2xl pb-20">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Biên bản kiểm tra xe
        </h1>
        <p className="text-sm text-muted-foreground">
          Vui lòng kiểm tra và ghi nhận tình trạng xe trước / sau dịch vụ.
        </p>
      </div>

      <InspectionReport bookingId={bookingId} />
    </div>
  )
}
