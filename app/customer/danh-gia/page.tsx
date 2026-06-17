'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect: /customer/danh-gia không có booking_id
 * Trang đánh giá cần booking_id cụ thể — chuyển về danh sách lịch hẹn.
 */
export default function ReviewIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/customer/lich-hen')
  }, [router])

  return null
}
