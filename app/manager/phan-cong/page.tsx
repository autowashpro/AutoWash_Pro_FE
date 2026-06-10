import { AssignmentBoard } from "@/components/manager/assignment-board"

export default function AssignmentPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Phân công thợ rửa xe</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">
          Gán thợ và khoang rửa cho các lịch hẹn đang chờ.
        </p>
      </div>
      <AssignmentBoard />
    </div>
  )
}
