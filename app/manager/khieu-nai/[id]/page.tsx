"use client"

import { useState } from "react"
import { ArrowLeft, ImagePlus, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SERVICE_COMPLAINTS, BOOKINGS, formatDate } from "@/lib/data"

const mockComplaint = SERVICE_COMPLAINTS.find((c) => c.id === "c-1")!
const linkedBooking = BOOKINGS.find((b) => b.id === mockComplaint.bookingId)!

const conclusionOptions = [
  { value: "refunded", label: "Đã bồi thường" },
  { value: "no_basis", label: "Không đủ cơ sở" },
  { value: "staff_error", label: "Lỗi nhân viên" },
  { value: "customer_error", label: "Lỗi khách hàng" },
]

export default function ComplaintDetailPage() {
  const [response, setResponse] = useState("")
  const [conclusion, setConclusion] = useState("")
  const [evidenceImages, setEvidenceImages] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setEvidenceImages([...evidenceImages, url])
    }
  }

  const handleRemoveImage = (index: number) => {
    setEvidenceImages(evidenceImages.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (response && conclusion) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-success/30 bg-success/10 p-8 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-success/20 text-success mb-4">
              <svg
                className="size-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-success mb-2">Đã gửi phản hồi & đóng khiếu nại</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Khiếu nại {mockComplaint.id.toUpperCase()} của {mockComplaint.customerName} đã được xử lý thành công.
              Khách hàng sẽ nhận được email phản hồi.
            </p>
            <Link href="/manager/khieu-nai">
              <Button className="bg-primary hover:bg-primary/90">
                Quay lại danh sách
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/manager/khieu-nai">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{mockComplaint.id.toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground">{mockComplaint.customerName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{mockComplaint.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{mockComplaint.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Gửi: {formatDate(mockComplaint.createdAt.split("T")[0])}</span>
                <span>•</span>
                <span>
                  Trạng thái:{" "}
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-primary font-semibold">
                    Đang xử lý
                  </span>
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-semibold text-muted-foreground mb-3">BOOKING LIÊN QUAN</p>
              <Link href={`/manager/booking/${linkedBooking.id}`}>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 hover:bg-primary/10 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-semibold text-primary">{linkedBooking.code}</p>
                      <p className="text-sm text-foreground mt-1">Dịch vụ: {linkedBooking.serviceName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{linkedBooking.customerName}</p>
                    </div>
                    <span className="text-primary">→</span>
                  </div>
                </div>
              </Link>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Xử lý khiếu nại</h3>

                <div>
                  <label htmlFor="response" className="text-sm font-semibold text-foreground mb-2 block">
                    Kết quả xử lý / Phản hồi cho khách
                  </label>
                  <textarea
                    id="response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Nhập phản hồi chi tiết cho khách hàng..."
                    className="w-full rounded-lg border border-border bg-input p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none h-32"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Ảnh minh chứng phản hồi (tùy chọn)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {evidenceImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted"
                      >
                        <img
                          src={img}
                          alt="Evidence"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-2 right-2 size-6 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer bg-muted/30 hover:bg-muted/50">
                      <div className="text-center">
                        <ImagePlus className="size-5 text-muted-foreground mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground">Thêm ảnh</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAddImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="conclusion" className="text-sm font-semibold text-foreground mb-2 block">
                    Kết luận
                  </label>
                  <select
                    id="conclusion"
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Chọn kết luận</option>
                    {conclusionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!response || !conclusion}
                className="w-full h-12 bg-primary hover:bg-primary/90 font-semibold"
              >
                Gửi phản hồi & Đóng khiếu nại
              </Button>
            </form>
          </div>

          <div className="col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 sticky top-24 space-y-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">TRẠNG THÁI</p>
                <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  Đang xử lý
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">KHÁCH HÀNG</p>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{mockComplaint.customerName}</p>
                  <p className="text-sm text-muted-foreground">0987654321</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">THỜI GIAN</p>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Gửi:{" "}
                    <span className="text-foreground">
                      {formatDate(mockComplaint.createdAt.split("T")[0])}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
