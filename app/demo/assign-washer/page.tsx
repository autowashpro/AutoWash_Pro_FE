"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AssignWasherModal } from "@/components/manager/assign-washer-modal"

export default function AssignWasherDemoPage() {
  const [showModal, setShowModal] = useState(true)
  const [assignedWasher, setAssignedWasher] = useState<string | null>(null)

  const handleAssign = (washerId: string) => {
    setAssignedWasher(washerId)
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Demo: Assign Washer Modal</h1>

        {assignedWasher && (
          <div className="rounded-2xl border border-success/30 bg-success/10 p-6 mb-6">
            <p className="font-semibold text-success">Đã gán nhân viên: {assignedWasher}</p>
          </div>
        )}

        <Button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          Mở Modal Gán Nhân Viên
        </Button>

        {showModal && (
          <AssignWasherModal
            bookingId="b-1"
            onAssign={handleAssign}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  )
}
