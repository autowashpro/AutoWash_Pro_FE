"use client"

import { useState } from "react"
import { Play, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BookingStatus } from "@/lib/data"

export function JobActionButton({
  status,
  code,
}: {
  status: BookingStatus
  code: string
}) {
  const [current, setCurrent] = useState(status)

  if (current === "ASSIGNED") {
    return (
      <Button size="sm" onClick={() => setCurrent("IN_PROGRESS")}>
        <Play className="size-4" />
        Bắt đầu rửa
      </Button>
    )
  }

  if (current === "IN_PROGRESS") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="border-success text-success hover:bg-success/10"
        onClick={() => setCurrent("COMPLETED")}
        aria-label={`Hoàn thành công việc ${code}`}
      >
        <Check className="size-4" />
        Hoàn thành
      </Button>
    )
  }

  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-success">
      <Check className="size-4" />
      Đã hoàn thành
    </span>
  )
}
