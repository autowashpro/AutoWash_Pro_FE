import { InspectionReport } from "@/components/washer/inspection-report"

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Báo cáo kiểm tra</h1>
        <p className="text-sm text-muted-foreground">
          Ghi nhận tình trạng xe trước và sau khi rửa kèm hình ảnh minh chứng.
        </p>
      </div>
      <InspectionReport />
    </div>
  )
}
