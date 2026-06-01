// AutoWash Pro — Mô hình dữ liệu và dữ liệu mẫu
// Toàn bộ nhãn hiển thị bằng tiếng Việt trang trọng.

export type Role = "customer" | "washer" | "manager" | "admin"

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "AUTO_CANCELLED"
  | "CUSTOMER_CANCELLED"

export type MembershipTier = "MEMBER" | "SILVER" | "GOLD" | "PLATINUM"

export type VehicleType = "Sedan" | "SUV" | "Bán tải" | "Xe điện" | "Hatchback"

export interface RoleMeta {
  id: Role
  name: string
  description: string
  path: string
}

export const ROLES: RoleMeta[] = [
  {
    id: "customer",
    name: "Khách hàng",
    description: "Đặt lịch rửa xe, theo dõi điểm thưởng và xác nhận tình trạng xe.",
    path: "/customer",
  },
  {
    id: "washer",
    name: "Thợ rửa xe",
    description: "Xem công việc được giao và gửi báo cáo kiểm tra trước/sau kèm ảnh.",
    path: "/washer",
  },
  {
    id: "manager",
    name: "Quản lý",
    description: "Theo dõi sức chứa khoang rửa, phân công thợ và xử lý khách vãng lai.",
    path: "/manager",
  },
  {
    id: "admin",
    name: "Quản trị viên",
    description: "Quản lý người dùng, danh mục dịch vụ và báo cáo toàn hệ thống.",
    path: "/admin",
  },
]

export const STATUS_META: Record<
  BookingStatus,
  { label: string; tone: "pending" | "info" | "active" | "success" | "danger" }
> = {
  PENDING: { label: "Chờ xác nhận", tone: "pending" },
  CONFIRMED: { label: "Đã xác nhận", tone: "info" },
  ASSIGNED: { label: "Đã phân công", tone: "info" },
  IN_PROGRESS: { label: "Đang thực hiện", tone: "active" },
  COMPLETED: { label: "Hoàn thành", tone: "success" },
  AUTO_CANCELLED: { label: "Tự động hủy", tone: "danger" },
  CUSTOMER_CANCELLED: { label: "Khách hủy", tone: "danger" },
}

export const TIER_META: Record<
  MembershipTier,
  { label: string; discount: number; color: string }
> = {
  MEMBER: { label: "Thành viên", discount: 0, color: "#64748b" },
  SILVER: { label: "Bạc", discount: 5, color: "#94a3b8" },
  GOLD: { label: "Vàng", discount: 10, color: "#f59e0b" },
  PLATINUM: { label: "Bạch kim", discount: 15, color: "#0055ff" },
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  category: "Cơ bản" | "Cao cấp" | "Nội thất" | "Phủ bóng"
  active: boolean
}

export const SERVICES: Service[] = [
  {
    id: "svc-1",
    name: "Rửa xe tiêu chuẩn",
    description: "Rửa ngoại thất, làm sạch bánh xe và lau khô toàn bộ thân xe.",
    price: 120000,
    durationMinutes: 30,
    category: "Cơ bản",
    active: true,
  },
  {
    id: "svc-2",
    name: "Rửa xe cao cấp",
    description: "Rửa tiêu chuẩn kèm phủ sáp bảo vệ và đánh bóng lốp.",
    price: 250000,
    durationMinutes: 50,
    category: "Cao cấp",
    active: true,
  },
  {
    id: "svc-3",
    name: "Vệ sinh nội thất chuyên sâu",
    description: "Hút bụi, làm sạch ghế da, khử mùi và vệ sinh bảng điều khiển.",
    price: 380000,
    durationMinutes: 75,
    category: "Nội thất",
    active: true,
  },
  {
    id: "svc-4",
    name: "Phủ ceramic bảo vệ sơn",
    description: "Lớp phủ ceramic bảo vệ sơn xe lên đến 12 tháng, tăng độ bóng.",
    price: 2500000,
    durationMinutes: 180,
    category: "Phủ bóng",
    active: true,
  },
  {
    id: "svc-5",
    name: "Combo chăm sóc toàn diện",
    description: "Rửa cao cấp, vệ sinh nội thất và phủ sáp nano trọn gói.",
    price: 550000,
    durationMinutes: 120,
    category: "Cao cấp",
    active: false,
  },
]

export interface Vehicle {
  id: string
  plate: string
  model: string
  type: VehicleType
  color: string
}

export interface Booking {
  id: string
  code: string
  customerName: string
  vehicle: Vehicle
  serviceId: string
  serviceName: string
  price: number
  date: string
  timeSlot: string
  status: BookingStatus
  bayId?: string
  washerName?: string
  isWalkIn?: boolean
}

export const VEHICLES: Vehicle[] = [
  { id: "v-1", plate: "51K-123.45", model: "VinFast VF8", type: "Xe điện", color: "Trắng ngọc trai" },
  { id: "v-2", plate: "30A-678.90", model: "Toyota Camry", type: "Sedan", color: "Đen" },
  { id: "v-3", plate: "29B-456.78", model: "Ford Ranger", type: "Bán tải", color: "Xám" },
]

export const BOOKINGS: Booking[] = [
  {
    id: "b-1",
    code: "AW-2041",
    customerName: "Nguyễn Minh Anh",
    vehicle: VEHICLES[0],
    serviceId: "svc-2",
    serviceName: "Rửa xe cao cấp",
    price: 250000,
    date: "2026-06-01",
    timeSlot: "08:00",
    status: "IN_PROGRESS",
    bayId: "bay-1",
    washerName: "Trần Văn Hùng",
  },
  {
    id: "b-2",
    code: "AW-2042",
    customerName: "Lê Thị Hồng",
    vehicle: VEHICLES[1],
    serviceId: "svc-3",
    serviceName: "Vệ sinh nội thất chuyên sâu",
    price: 380000,
    date: "2026-06-01",
    timeSlot: "08:30",
    status: "ASSIGNED",
    bayId: "bay-2",
    washerName: "Phạm Quốc Bảo",
  },
  {
    id: "b-3",
    code: "AW-2043",
    customerName: "Đỗ Hoàng Long",
    vehicle: VEHICLES[2],
    serviceId: "svc-1",
    serviceName: "Rửa xe tiêu chuẩn",
    price: 120000,
    date: "2026-06-01",
    timeSlot: "09:00",
    status: "CONFIRMED",
  },
  {
    id: "b-4",
    code: "AW-2044",
    customerName: "Vũ Thanh Tâm",
    vehicle: { id: "v-4", plate: "43A-222.11", model: "Mercedes GLC", type: "SUV", color: "Bạc" },
    serviceId: "svc-4",
    serviceName: "Phủ ceramic bảo vệ sơn",
    price: 2500000,
    date: "2026-06-01",
    timeSlot: "10:00",
    status: "PENDING",
  },
  {
    id: "b-5",
    code: "AW-2039",
    customerName: "Nguyễn Minh Anh",
    vehicle: VEHICLES[0],
    serviceId: "svc-1",
    serviceName: "Rửa xe tiêu chuẩn",
    price: 120000,
    date: "2026-05-28",
    timeSlot: "14:00",
    status: "COMPLETED",
    washerName: "Trần Văn Hùng",
  },
  {
    id: "b-6",
    code: "AW-2038",
    customerName: "Khách vãng lai",
    vehicle: { id: "v-5", plate: "59F-888.88", model: "Honda CR-V", type: "SUV", color: "Đỏ" },
    serviceId: "svc-2",
    serviceName: "Rửa xe cao cấp",
    price: 250000,
    date: "2026-06-01",
    timeSlot: "09:30",
    status: "COMPLETED",
    bayId: "bay-3",
    washerName: "Lý Gia Khang",
    isWalkIn: true,
  },
]

export interface Bay {
  id: string
  name: string
  status: "available" | "occupied" | "maintenance"
  currentBookingCode?: string
  washerName?: string
}

export const BAYS: Bay[] = [
  { id: "bay-1", name: "Khoang 1", status: "occupied", currentBookingCode: "AW-2041", washerName: "Trần Văn Hùng" },
  { id: "bay-2", name: "Khoang 2", status: "occupied", currentBookingCode: "AW-2042", washerName: "Phạm Quốc Bảo" },
  { id: "bay-3", name: "Khoang 3", status: "available" },
  { id: "bay-4", name: "Khoang 4", status: "available" },
  { id: "bay-5", name: "Khoang 5", status: "maintenance" },
]

export interface Washer {
  id: string
  name: string
  status: "available" | "busy" | "offline"
  jobsToday: number
  trustScore: number
}

export const WASHERS: Washer[] = [
  { id: "w-1", name: "Trần Văn Hùng", status: "busy", jobsToday: 4, trustScore: 98 },
  { id: "w-2", name: "Phạm Quốc Bảo", status: "busy", jobsToday: 3, trustScore: 95 },
  { id: "w-3", name: "Lý Gia Khang", status: "available", jobsToday: 5, trustScore: 92 },
  { id: "w-4", name: "Hoàng Đức Thắng", status: "available", jobsToday: 2, trustScore: 89 },
  { id: "w-5", name: "Ngô Bá Khánh", status: "offline", jobsToday: 0, trustScore: 84 },
]

export interface SystemUser {
  id: string
  name: string
  email: string
  role: Role
  tier?: MembershipTier
  active: boolean
  joinedDate: string
}

export const USERS: SystemUser[] = [
  { id: "u-1", name: "Nguyễn Minh Anh", email: "minhanh@email.com", role: "customer", tier: "GOLD", active: true, joinedDate: "2025-01-12" },
  { id: "u-2", name: "Lê Thị Hồng", email: "hong.le@email.com", role: "customer", tier: "PLATINUM", active: true, joinedDate: "2024-08-03" },
  { id: "u-3", name: "Đỗ Hoàng Long", email: "long.do@email.com", role: "customer", tier: "SILVER", active: true, joinedDate: "2025-03-21" },
  { id: "u-4", name: "Trần Văn Hùng", email: "hung.tran@autowash.vn", role: "washer", active: true, joinedDate: "2024-05-10" },
  { id: "u-5", name: "Phạm Quốc Bảo", email: "bao.pham@autowash.vn", role: "washer", active: true, joinedDate: "2024-06-15" },
  { id: "u-6", name: "Trương Mỹ Linh", email: "linh.truong@autowash.vn", role: "manager", active: true, joinedDate: "2023-11-01" },
  { id: "u-7", name: "Bùi Anh Tuấn", email: "admin@autowash.vn", role: "admin", active: true, joinedDate: "2023-09-18" },
  { id: "u-8", name: "Ngô Bá Khánh", email: "khanh.ngo@autowash.vn", role: "washer", active: false, joinedDate: "2024-12-02" },
]

export interface LoyaltyActivity {
  id: string
  label: string
  date: string
  points: number
}

export const LOYALTY_ACTIVITIES: LoyaltyActivity[] = [
  { id: "l-1", label: "Rửa xe cao cấp — AW-2041", date: "2026-06-01", points: 25 },
  { id: "l-2", label: "Rửa xe tiêu chuẩn — AW-2039", date: "2026-05-28", points: 12 },
  { id: "l-3", label: "Đổi quà: Phiếu giảm 50.000đ", date: "2026-05-20", points: -200 },
  { id: "l-4", label: "Vệ sinh nội thất — AW-2031", date: "2026-05-12", points: 38 },
]

export const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
]

export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}
