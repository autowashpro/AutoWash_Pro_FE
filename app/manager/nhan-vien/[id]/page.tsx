"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Star, Loader2, CheckCircle2, Clock, Award, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCarWashers } from "@/lib/api"
import type { CarWasher } from "@/lib/types"
import { toast } from "sonner"

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-lg ${i <= Math.round(rating) ? "text-amber-400" : "text-muted/30"}`}>★</span>
      ))}
      <span className="ml-1 text-sm font-semibold text-foreground">{rating?.toFixed(1) || "N/A"}</span>
    </div>
  )
}

export default function WasherDetailPage() {
  const params = useParams()
  const washerId = params.id as string

  const [washer, setWasher] = useState<CarWasher | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const list = await getCarWashers()
        // normalize PascalCase từ BE
        const found = list.find((w: any) => {
          const id = w.washerId || w.WasherId || w.id || ""
          return id === washerId || id.toLowerCase() === washerId.toLowerCase()
        })
        if (found) {
          setWasher(found)
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error(err)
        toast.error("Không thể tải thông tin nhân viên")
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (washerId) load()
  }, [washerId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !washer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy nhân viên với ID: {washerId.slice(-8)}</p>
        <Button asChild variant="outline">
          <Link href="/manager/nhan-vien"><ArrowLeft className="size-4 mr-2" />Quay lại</Link>
        </Button>
      </div>
    )
  }

  const isAvailable = washer.status === "AVAILABLE"
  const completedTasks = washer.completedTasksToday ?? 0
  const totalTasks = washer.tasksToday ?? 1
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const rating = washer.averageRating ?? 0

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/manager/nhan-vien">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Hồ sơ nhân viên</h1>
            <p className="text-xs text-muted-foreground font-mono">ID: {washerId.slice(-8).toUpperCase()}</p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isAvailable ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
            }`}>
              <span className={`size-2 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-blue-500"}`} />
              {isAvailable ? "Đang rảnh" : "Đang làm việc"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-5">
            <div className="size-20 rounded-full bg-gradient-to-br from-primary to-sky-400 text-white flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">
              {getInitials(washer.fullName)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{washer.fullName}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Thợ rửa xe chuyên nghiệp</p>
              <div className="mt-2">
                <StarRating rating={rating} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Hôm nay</p>
            <p className="text-3xl font-extrabold text-foreground">{completedTasks}</p>
            <p className="text-xs text-muted-foreground">/ {totalTasks} xe</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Tỷ lệ HT</p>
            <p className="text-3xl font-extrabold text-primary">{completionRate}%</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Đánh giá TB</p>
            <p className="text-3xl font-extrabold text-amber-500">{rating > 0 ? rating.toFixed(1) : "—"}</p>
            <p className="text-xs text-muted-foreground">/ 5.0 ⭐</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Tiến độ hôm nay</h3>
            <span className="text-sm font-mono font-bold text-primary">{completedTasks}/{totalTasks} xe hoàn thành</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>0</span>
            <span className="text-primary font-semibold">{completionRate}%</span>
            <span>{totalTasks}</span>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Chỉ số hiệu suất</h3>
          {[
            { label: "Xe hoàn thành hôm nay", value: `${completedTasks} xe`, icon: <CheckCircle2 className="size-4 text-emerald-500" /> },
            { label: "Tổng xe trong ca", value: `${totalTasks} xe`, icon: <Clock className="size-4 text-blue-500" /> },
            { label: "Đánh giá trung bình", value: rating > 0 ? `${rating.toFixed(1)}/5.0 ⭐` : "Chưa có đánh giá", icon: <Star className="size-4 text-amber-500" /> },
            { label: "Trạng thái hiện tại", value: isAvailable ? "Đang rảnh" : "Đang thực hiện dịch vụ", icon: <Award className="size-4 text-primary" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </div>

        {/* Note: BE chưa có endpoint /manager/washers/{id} */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-400">
          ℹ️ Thông tin lấy từ danh sách chung. BE hiện chưa hỗ trợ endpoint lấy chi tiết từng nhân viên (<code>/manager/washers/{`{id}`}</code>).
        </div>
      </div>
    </div>
  )
}
