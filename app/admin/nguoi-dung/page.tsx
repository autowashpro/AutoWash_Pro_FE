import { USERS, ROLES, TIER_META, formatDate, type Role } from "@/lib/data"

const roleLabel: Record<Role, string> = {
  customer: "Khách hàng",
  washer: "Thợ rửa xe",
  manager: "Quản lý",
  admin: "Quản trị viên",
}

const roleTone: Record<Role, string> = {
  customer: "bg-accent text-accent-foreground",
  washer: "bg-success/10 text-success",
  manager: "bg-gold/10 text-gold",
  admin: "bg-primary/10 text-primary",
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground">
            Tổng cộng {USERS.length} tài khoản thuộc {ROLES.length} vai trò trong hệ thống.
          </p>
        </div>
        <button className="self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:self-auto">
          Thêm người dùng
        </button>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Họ và tên</th>
                <th className="px-5 py-3 font-medium">Thư điện tử</th>
                <th className="px-5 py-3 font-medium">Vai trò</th>
                <th className="px-5 py-3 font-medium">Hạng thành viên</th>
                <th className="px-5 py-3 font-medium">Ngày tham gia</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {USERS.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium text-foreground">{user.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${roleTone[user.role]}`}>
                      {roleLabel[user.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {user.tier ? TIER_META[user.tier].label : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatDate(user.joinedDate)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        user.active ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.active ? "bg-success" : "bg-muted-foreground"
                        }`}
                      />
                      {user.active ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
