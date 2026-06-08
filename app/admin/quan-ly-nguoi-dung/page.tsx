"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Lock, Unlock, RotateCcw, Plus, ChevronRight, Users, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CUSTOMERS_LOW_TRUST, WASHERS, BOOKINGS, formatVND } from "@/lib/data"
import { getAdminUsers, updateUserStatus, createStaffAccount, apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type UserTab = "customers" | "washers" | "managers"
type LockStatus = "active" | "locked"

type CustomerUser = {
  id: string
  name: string
  phone: string
  trustScore: number
  lastBookingCode?: string
  email?: string
  bookingCount?: number
  status?: LockStatus
  tier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
}

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return "text-success bg-success/10 border-success/30"
  if (score >= 50) return "text-gold bg-gold/10 border-gold/30"
  return "text-rose-600 bg-rose-50 border-rose-200"
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case "PLATINUM":
      return "bg-purple-100 text-purple-700 border-purple-300"
    case "GOLD":
      return "bg-gold/10 text-gold border-gold/30"
    case "SILVER":
      return "bg-slate-100 text-slate-700 border-slate-300"
    case "BRONZE":
    case "MEMBER":
      return "bg-amber-100/50 text-amber-700 border-amber-300"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

// Mock enhanced customer data with email, booking count, and status
const customersWithDetails: CustomerUser[] = CUSTOMERS_LOW_TRUST.map((c, i) => ({
  ...c,
  email: `customer${i + 1}@gmail.com`,
  bookingCount: Math.floor(Math.random() * 15) + 3,
  status: Math.random() > 0.7 ? "locked" : "active",
  tier: ["BRONZE", "SILVER", "GOLD"][Math.floor(Math.random() * 3)] as any,
}))

// Mock enhanced washer data
const washersWithDetails = WASHERS.map((w, i) => ({
  ...w,
  email: `washer${i + 1}@gmail.com`,
}))

export default function AdminUsersPage() {
  const [tab, setTab] = useState<UserTab>("customers")
  const [showResetModal, setShowResetModal] = useState<{ type: string; id: string } | null>(null)
  
  // Tab states for API/offline data
  const [customers, setCustomers] = useState<CustomerUser[]>([])
  const [washers, setWashers] = useState<any[]>([])
  const [managers, setManagers] = useState<any[]>([])
  
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  // Add User modal states
  const [showAddModal, setShowAddModal] = useState<{ role: 'MANAGER' | 'CAR_WASHER' } | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  })

  // Mapping helpers
  const mapAdminUserToCustomer = (u: any): CustomerUser => ({
    id: u.user_id || u.id,
    name: u.full_name || u.name,
    phone: u.phone,
    trustScore: u.trust_score ?? 100,
    email: u.email,
    bookingCount: u.total_bookings ?? 0,
    status: u.status === 'BANNED' ? 'locked' : 'active',
    tier: u.membership_tier ?? 'BRONZE'
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Fetch customers
      let customersList: CustomerUser[] = []
      try {
        const res = await getAdminUsers({ role: 'CUSTOMER' })
        if (res && res.data) {
          customersList = res.data.map(mapAdminUserToCustomer)
        } else {
          customersList = customersWithDetails
        }
      } catch (err) {
        console.warn("Failed to fetch customers from API, using mock data", err)
        customersList = customersWithDetails
      }
      setCustomers(customersList)

      // Fetch washers
      let washersList: any[] = []
      try {
        const res = await getAdminUsers({ role: 'CAR_WASHER' })
        if (res && res.data) {
          washersList = res.data.map(u => ({
            id: u.user_id,
            name: u.full_name,
            phone: u.phone,
            email: u.email,
            status: u.status === 'BANNED' ? 'offline' : 'online',
            jobsToday: u.total_bookings ?? 0,
            trustScore: u.trust_score ?? 100,
          }))
        } else {
          washersList = washersWithDetails
        }
      } catch (err) {
        console.warn("Failed to fetch washers from API, using mock data", err)
        washersList = washersWithDetails
      }
      setWashers(washersList)

      // Fetch managers
      let managersList: any[] = []
      try {
        const res = await getAdminUsers({ role: 'MANAGER' })
        if (res && res.data) {
          managersList = res.data.map(u => ({
            id: u.user_id,
            name: u.full_name,
            email: u.email,
            role: "Full Access",
            status: u.status === 'BANNED' ? 'locked' : 'active',
          }))
        } else {
          managersList = [
            { id: "m-1", name: "Nguyễn Văn A", email: "manager1@company.com", role: "Full Access", status: "active" },
            { id: "m-2", name: "Trần Thị B", email: "manager2@company.com", role: "Booking & Report", status: "active" },
          ]
        }
      } catch (err) {
        console.warn("Failed to fetch managers from API, using mock data", err)
        managersList = [
          { id: "m-1", name: "Nguyễn Văn A", email: "manager1@company.com", role: "Full Access", status: "active" },
          { id: "m-2", name: "Trần Thị B", email: "manager2@company.com", role: "Booking & Report", status: "active" },
        ]
      }
      setManagers(managersList)

    } catch (error) {
      toast({
        title: "Lỗi kết nối",
        description: "Không thể lấy dữ liệu từ máy chủ. Đang tải dữ liệu mô phỏng.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleLock = async (userId: string, currentStatus: string, userRole: UserTab) => {
    const isLocked = currentStatus === "locked" || currentStatus === "offline"
    const nextStatus = isLocked ? "ACTIVE" : "BANNED"
    
    setActionLoading(userId)
    try {
      // Call official API
      try {
        await updateUserStatus(userId, nextStatus)
      } catch (apiErr) {
        // Fallback to Swagger direct ban/unban path
        const actionPath = `/AdminUser/${userId}/${isLocked ? 'unban' : 'ban'}`
        if (isLocked) {
          await apiClient.put(actionPath, { userId, note: "Mở khóa tài khoản bởi Admin" })
        } else {
          await apiClient.put(actionPath, { userId, reason: "Khóa tài khoản bởi Admin" })
        }
      }
      
      toast({
        title: "Cập nhật thành công",
        description: `Đã ${isLocked ? 'mở khóa' : 'khóa'} tài khoản thành công.`,
      })
      fetchUsers()
    } catch (err) {
      console.warn("API ban/unban failed, fallback offline state update", err)
      // Fallback offline state update
      if (userRole === "customers") {
        setCustomers(prev => prev.map(c => c.id === userId ? { ...c, status: isLocked ? 'active' : 'locked' } : c))
      } else if (userRole === "washers") {
        setWashers(prev => prev.map(w => w.id === userId ? { ...w, status: isLocked ? 'online' : 'offline' } : w))
      } else {
        setManagers(prev => prev.map(m => m.id === userId ? { ...m, status: isLocked ? 'active' : 'locked' } : m))
      }
      
      toast({
        title: "Cập nhật ngoại tuyến",
        description: `Đã cập nhật trạng thái ${isLocked ? 'mở khóa' : 'khóa'} tài khoản (Chế độ offline).`,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ các trường thông tin.",
        variant: "destructive",
      })
      return
    }

    try {
      if (showAddModal?.role === 'MANAGER') {
        // Post direct /api/AdminUser/managers
        await apiClient.post('/AdminUser/managers', {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      } else {
        // Post direct /api/Auth/create-staff
        try {
          await createStaffAccount({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            role: 'CAR_WASHER',
            password: formData.password
          })
        } catch (apiErr) {
          // fallback direct call
          await apiClient.post('/Auth/create-staff', {
            fullName: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: 1 // 1 corresponds to CAR_WASHER role in backend enum
          })
        }
      }

      toast({
        title: "Tạo tài khoản thành công",
        description: `Đã tạo mới tài khoản ${showAddModal?.role === 'MANAGER' ? 'Manager' : 'Thợ rửa xe'} thành công.`,
      })
      setShowAddModal(null)
      setFormData({ full_name: '', email: '', phone: '', password: '' })
      fetchUsers()
    } catch (err) {
      console.warn("API create staff failed, fallback offline", err)
      const tempId = `off-${Date.now()}`
      if (showAddModal?.role === 'MANAGER') {
        setManagers(prev => [...prev, {
          id: tempId,
          name: formData.full_name,
          email: formData.email,
          role: "Full Access",
          status: 'active',
        }])
      } else {
        setWashers(prev => [...prev, {
          id: tempId,
          name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          status: 'online',
          jobsToday: 0,
          trustScore: 100,
        }])
      }

      toast({
        title: "Tạo tài khoản ngoại tuyến",
        description: "Đã thêm tài khoản tạm thời vào danh sách (Chế độ offline).",
      })
      setShowAddModal(null)
      setFormData({ full_name: '', email: '', phone: '', password: '' })
    }
  }

  const handleResetTrustScore = async (id: string) => {
    try {
      // Call adjustTrustScore API to set score to 100 (diff of 100 - current score)
      const customer = customers.find(c => c.id === id)
      if (customer) {
        const diff = 100 - customer.trustScore
        await apiClient.post(`/manager/customers/${id}/trust-score/adjust`, {
          score_change: diff,
          reason: "Reset điểm uy tín bởi Admin"
        })
      }
      toast({
        title: "Reset thành công",
        description: "Điểm uy tín đã được khôi phục về 100.",
      })
      fetchUsers()
    } catch (err) {
      console.warn("API reset trust score failed, fallback offline", err)
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, trustScore: 100 } : c))
      toast({
        title: "Cập nhật ngoại tuyến",
        description: "Đã khôi phục điểm uy tín về 100 (Chế độ offline).",
      })
    } finally {
      setShowResetModal(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Users className="size-8 text-primary animate-pulse" />
              <div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Quản lý người dùng</h1>
                <p className="text-sm text-muted-foreground">Xem, cập nhật trạng thái và cấp tài khoản nhân viên.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowAddModal({ role: 'CAR_WASHER' })} className="bg-primary hover:bg-primary/90 gap-2 shadow-[var(--shadow-glow)] transition-all duration-200 hover:-translate-y-0.5">
                <Plus className="size-4" />
                Thêm nhân viên
              </Button>
              <Button onClick={() => setShowAddModal({ role: 'MANAGER' })} className="bg-primary hover:bg-primary/90 gap-2 shadow-[var(--shadow-glow)] transition-all duration-200 hover:-translate-y-0.5">
                <Plus className="size-4" />
                Thêm Manager
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border">
          {(["customers", "washers", "managers"] as const).map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
                tab === tabName
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tabName === "customers"
                ? "Khách hàng"
                : tabName === "washers"
                  ? "Nhân viên rửa xe"
                  : "Manager"}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Đang tải danh sách tài khoản...</p>
          </div>
        ) : (
          /* Tab Content */
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
            {/* Customers Tab */}
            {tab === "customers" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                      <th className="px-6 py-4 text-left font-semibold">Họ tên</th>
                      <th className="px-6 py-4 text-left font-semibold">Email</th>
                      <th className="px-6 py-4 text-left font-semibold">SĐT</th>
                      <th className="px-6 py-4 text-left font-semibold">Hạng</th>
                      <th className="px-6 py-4 text-left font-semibold">Trust Score</th>
                      <th className="px-6 py-4 text-left font-semibold">Số đặt lịch</th>
                      <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                      <th className="px-6 py-4 text-left font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customers.map((customer) => {
                      const isLocked = customer.status === "locked"
                      const currentStatus = customer.status

                      return (
                        <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground">{customer.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{customer.email || "—"}</td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                            {customer.phone}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${getTierColor(customer.tier || "BRONZE")}`}
                            >
                              {customer.tier || "BRONZE"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border font-mono ${getTrustScoreColor(customer.trustScore)}`}
                            >
                              {customer.trustScore}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {customer.bookingCount}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                currentStatus === "active"
                                  ? "bg-success/10 text-success border border-success/20"
                                  : "bg-rose-50 text-rose-600 border border-rose-200"
                              }`}
                            >
                              {currentStatus === "active" ? "Hoạt động" : "Đã khóa"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/khach-hang/${customer.id}`}>
                                <Button size="sm" variant="outline" className="gap-1 hover:border-primary/45 transition-colors">
                                  Xem
                                  <ChevronRight className="size-3" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === customer.id}
                                onClick={() => handleToggleLock(customer.id, customer.status || 'active', 'customers')}
                                className="gap-1"
                              >
                                {actionLoading === customer.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : isLocked ? (
                                  <>
                                    <Unlock className="size-3 text-success" />
                                    Mở khóa
                                  </>
                                ) : (
                                  <>
                                    <Lock className="size-3 text-destructive" />
                                    Khóa
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowResetModal({ type: "customer", id: customer.id })}
                                className="gap-1"
                              >
                                <RotateCcw className="size-3" />
                                Reset
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Washers Tab */}
            {tab === "washers" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                      <th className="px-6 py-4 text-left font-semibold">Tên nhân viên</th>
                      <th className="px-6 py-4 text-left font-semibold">Email</th>
                      <th className="px-6 py-4 text-left font-semibold">Số điện thoại</th>
                      <th className="px-6 py-4 text-left font-semibold">Trạng thái ca</th>
                      <th className="px-6 py-4 text-left font-semibold">Task hôm nay</th>
                      <th className="px-6 py-4 text-left font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {washers.map((washer) => {
                      const isLocked = washer.status === "offline"
                      const statusColor = isLocked ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-primary/10 text-primary border-primary/20"

                      return (
                        <tr key={washer.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground">{washer.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{washer.email || "—"}</td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{washer.phone || "—"}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${statusColor}`}>
                              {isLocked ? "Vô hiệu" : "Đang hoạt động"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-foreground font-medium">
                            {washer.jobsToday || 0} task hoàn thành
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/nhan-vien/${washer.id}`}>
                                <Button size="sm" variant="outline" className="gap-1 hover:border-primary/45 transition-colors">
                                  Xem
                                  <ChevronRight className="size-3" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === washer.id}
                                onClick={() => handleToggleLock(washer.id, washer.status, 'washers')}
                                className="gap-1"
                              >
                                {actionLoading === washer.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : isLocked ? (
                                  <>
                                    <Unlock className="size-3 text-success" />
                                    Kích hoạt
                                  </>
                                ) : (
                                  <>
                                    <Lock className="size-3 text-destructive" />
                                    Vô hiệu
                                  </>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Managers Tab */}
            {tab === "managers" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                      <th className="px-6 py-4 text-left font-semibold">Tên quản lý</th>
                      <th className="px-6 py-4 text-left font-semibold">Email</th>
                      <th className="px-6 py-4 text-left font-semibold">Quyền hạn</th>
                      <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                      <th className="px-6 py-4 text-left font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {managers.map((manager) => {
                      const isLocked = manager.status === "locked"

                      return (
                        <tr key={manager.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground">{manager.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{manager.email}</td>
                          <td className="px-6 py-4 text-foreground text-sm font-medium">{manager.role}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                isLocked
                                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                                  : "bg-success/10 text-success border border-success/20"
                              }`}
                            >
                              {isLocked ? "Đã khóa" : "Hoạt động"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === manager.id}
                                onClick={() => handleToggleLock(manager.id, manager.status, 'managers')}
                                className="gap-1"
                              >
                                {actionLoading === manager.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : isLocked ? (
                                  <>
                                    <Unlock className="size-3 text-success" />
                                    Mở khóa
                                  </>
                                ) : (
                                  <>
                                    <Lock className="size-3 text-destructive" />
                                    Khóa
                                  </>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Manager / Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h2 className="text-xl font-bold text-foreground">
                  Thêm {showAddModal.role === 'MANAGER' ? 'Manager' : 'Thợ rửa xe'} mới
                </h2>
                <button
                  onClick={() => setShowAddModal(null)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="size-5 text-muted-foreground" />
                </button>
              </div>
              <form onSubmit={handleAddUserSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn Hải"
                    className="input w-full px-3.5 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Địa chỉ email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="input w-full px-3.5 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Số điện thoại</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ví dụ: 0912345678"
                    className="input w-full px-3.5 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Mật khẩu ban đầu</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="input w-full px-3.5 py-2 border border-border rounded-xl bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setShowAddModal(null)}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                  >
                    Tạo tài khoản
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 border border-border shadow-xl">
              <h2 className="text-lg font-bold text-foreground mb-4">Reset điểm uy tín</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Bạn có chắc muốn khôi phục điểm uy tín cho khách hàng này về 100? Hành động này sẽ ghi đè điểm hiện tại.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowResetModal(null)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={() => handleResetTrustScore(showResetModal.id)}
                >
                  Đồng ý Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
