"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { PayOSResultContent } from "@/components/payment/payos-result"

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <PayOSResultContent forcedStatus="success" />
    </Suspense>
  )
}
