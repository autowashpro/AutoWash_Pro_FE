'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect: /customer/khieu-nai không có booking_id
 * Trang khiếu nại cần booking_id cụ thể — chuyển về danh sách lịch hẹn.
 */
export default function ComplaintIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/customer/lich-hen')
  }, [router])

  return null
}
