import Link from "next/link"
import { Droplets, User, SprayCan, LayoutDashboard, ShieldCheck, ArrowRight } from "lucide-react"
import { ROLES } from "@/lib/data"

const ROLE_ICONS = {
  customer: User,
  washer: SprayCan,
  manager: LayoutDashboard,
  admin: ShieldCheck,
} as const

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
        <header className="mb-10 flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Droplets className="size-6" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">AutoWash Pro</span>
          </div>
          <div className="max-w-2xl space-y-3">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Hệ thống đặt lịch rửa xe cao cấp
            </h1>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground">
              Trải nghiệm đặt lịch liền mạch, quản lý vận hành thông minh và chăm sóc xe tận tâm.
              Vui lòng chọn vai trò để tiếp tục.
            </p>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {ROLES.map((role) => {
            const Icon = ROLE_ICONS[role.id]
            return (
              <Link
                key={role.id}
                href={role.path}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">{role.name}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{role.description}</p>
                </div>
              </Link>
            )
          })}
        </div>

        <footer className="mt-10 text-sm text-muted-foreground">
          <p>Đây là bản trình diễn giao diện với dữ liệu mẫu.</p>
        </footer>
      </div>
    </main>
  )
}
