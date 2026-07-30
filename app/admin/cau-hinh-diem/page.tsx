"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import TierConfigPage from "../cau-hinh-tier/page"

export default function PointsConfigPageRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/cau-hinh-tier")
  }, [router])

  return <TierConfigPage />
}
