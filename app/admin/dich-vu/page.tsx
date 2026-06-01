import { SERVICES, formatVND } from "@/lib/data"

export default function AdminServicesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Danh mục dịch vụ</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý gói dịch vụ, giá niêm yết và thời lượng thực hiện.
          </p>
        </div>
        <button className="self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:self-auto">
          Thêm dịch vụ
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <article
            key={service.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                {service.category}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  service.active ? "text-success" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    service.active ? "bg-success" : "bg-muted-foreground"
                  }`}
                />
                {service.active ? "Đang bán" : "Tạm ẩn"}
              </span>
            </div>
            <h2 className="mt-3 text-base font-semibold text-foreground">{service.name}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <div>
                <p className="text-lg font-semibold text-foreground">{formatVND(service.price)}</p>
                <p className="text-xs text-muted-foreground">
                  Thời lượng {service.durationMinutes} phút
                </p>
              </div>
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
                Chỉnh sửa
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
