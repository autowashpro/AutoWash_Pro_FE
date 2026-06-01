import { AssignmentBoard } from "@/components/assignment-board"

export default function AssignmentPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Phân công thợ rửa xe</h1>
        <p className="text-sm text-muted-foreground">
          Gán thợ và khoang rửa cho các lịch hẹn đang chờ.
        </p>
      </div>
      <AssignmentBoard />
    </div>
  )
}
