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

// --- Booking service catalog (v2, size-aware) ---

export type VehicleSize = "S" | "M" | "L"
export type ServiceGroup =
  | "WASH"
  | "Vệ sinh trong"
  | "Vệ sinh ngoài"
  | "Xử lý bề mặt"
  | "Bảo vệ"

export interface CatalogService {
  id: string
  name: string
  durationMinutes: number
  /** Price map by vehicle size */
  price: Record<VehicleSize, number>
  group: ServiceGroup
  /** WASH = fixed bay slot; FLEX = consult, no guaranteed slot */
  type: "WASH" | "FLEX"
}

export const CATALOG: CatalogService[] = [
  // ---- WASH group ----
  { id: "w-1", name: "AW Basic Wash", durationMinutes: 20, price: { S: 170000, M: 180000, L: 190000 }, group: "WASH", type: "WASH" },
  { id: "w-2", name: "AW Detail Wash", durationMinutes: 20, price: { S: 270000, M: 280000, L: 290000 }, group: "WASH", type: "WASH" },
  { id: "w-3", name: "AW Ultimate Wash", durationMinutes: 40, price: { S: 590000, M: 640000, L: 690000 }, group: "WASH", type: "WASH" },
  { id: "w-4", name: "Rửa xe ngoài", durationMinutes: 20, price: { S: 80000, M: 90000, L: 100000 }, group: "WASH", type: "WASH" },
  { id: "w-5", name: "Rửa gầm", durationMinutes: 20, price: { S: 40000, M: 50000, L: 60000 }, group: "WASH", type: "WASH" },
  // ---- Vệ sinh trong (FLEX) ----
  { id: "f-1", name: "Vệ sinh nội thất Super Clean", durationMinutes: 60, price: { S: 450000, M: 500000, L: 550000 }, group: "Vệ sinh trong", type: "FLEX" },
  { id: "f-2", name: "Vệ sinh nội thất Ultimate Clean", durationMinutes: 90, price: { S: 700000, M: 780000, L: 860000 }, group: "Vệ sinh trong", type: "FLEX" },
  { id: "f-3", name: "Vệ sinh nội thất Ultimate Clean Plus", durationMinutes: 120, price: { S: 950000, M: 1050000, L: 1150000 }, group: "Vệ sinh trong", type: "FLEX" },
  { id: "f-4", name: "Xử lý vị trí ngồi", durationMinutes: 30, price: { S: 150000, M: 170000, L: 190000 }, group: "Vệ sinh trong", type: "FLEX" },
  { id: "f-5", name: "Vệ sinh dàn lạnh", durationMinutes: 45, price: { S: 280000, M: 280000, L: 280000 }, group: "Vệ sinh trong", type: "FLEX" },
  { id: "f-6", name: "Khử mùi C-Air Fog", durationMinutes: 20, price: { S: 120000, M: 120000, L: 120000 }, group: "Vệ sinh trong", type: "FLEX" },
  { id: "f-7", name: "Khử mùi Ozone", durationMinutes: 30, price: { S: 180000, M: 180000, L: 180000 }, group: "Vệ sinh trong", type: "FLEX" },
  // ---- Vệ sinh ngoài (FLEX) ----
  { id: "g-1", name: "Vệ sinh khoang máy", durationMinutes: 40, price: { S: 250000, M: 280000, L: 320000 }, group: "Vệ sinh ngoài", type: "FLEX" },
  { id: "g-2", name: "Tẩy nhựa đường", durationMinutes: 30, price: { S: 200000, M: 230000, L: 260000 }, group: "Vệ sinh ngoài", type: "FLEX" },
  { id: "g-3", name: "Tẩy bụi sơn", durationMinutes: 40, price: { S: 300000, M: 350000, L: 400000 }, group: "Vệ sinh ngoài", type: "FLEX" },
  { id: "g-4", name: "Tẩy ố kính", durationMinutes: 30, price: { S: 180000, M: 210000, L: 240000 }, group: "Vệ sinh ngoài", type: "FLEX" },
  { id: "g-5", name: "Tẩy gầm", durationMinutes: 30, price: { S: 150000, M: 180000, L: 210000 }, group: "Vệ sinh ngoài", type: "FLEX" },
  { id: "g-6", name: "Tẩy ố Chrome", durationMinutes: 20, price: { S: 120000, M: 120000, L: 130000 }, group: "Vệ sinh ngoài", type: "FLEX" },
  { id: "g-7", name: "Tẩy nhựa cây", durationMinutes: 30, price: { S: 160000, M: 190000, L: 220000 }, group: "Vệ sinh ngoài", type: "FLEX" },
  { id: "g-8", name: "Vệ sinh mâm lazang", durationMinutes: 25, price: { S: 100000, M: 100000, L: 120000 }, group: "Vệ sinh ngoài", type: "FLEX" },
  // ---- Xử lý bề mặt (FLEX) ----
  { id: "s-1", name: "Đánh bóng Basic", durationMinutes: 60, price: { S: 600000, M: 700000, L: 800000 }, group: "Xử lý bề mặt", type: "FLEX" },
  { id: "s-2", name: "Đánh bóng hiệu chỉnh", durationMinutes: 90, price: { S: 1200000, M: 1400000, L: 1600000 }, group: "Xử lý bề mặt", type: "FLEX" },
  { id: "s-3", name: "Đánh bóng kính", durationMinutes: 30, price: { S: 250000, M: 250000, L: 300000 }, group: "Xử lý bề mặt", type: "FLEX" },
  { id: "s-4", name: "Wax bóng sáp", durationMinutes: 45, price: { S: 350000, M: 400000, L: 450000 }, group: "Xử lý bề mặt", type: "FLEX" },
  // ---- Bảo vệ (FLEX) ----
  { id: "p-1", name: "Phủ gầm", durationMinutes: 60, price: { S: 800000, M: 900000, L: 1000000 }, group: "Bảo vệ", type: "FLEX" },
  { id: "p-2", name: "Ceramic 2 lớp", durationMinutes: 180, price: { S: 3500000, M: 4000000, L: 4500000 }, group: "Bảo vệ", type: "FLEX" },
  { id: "p-3", name: "Ceramic 3 lớp", durationMinutes: 240, price: { S: 5000000, M: 5800000, L: 6500000 }, group: "Bảo vệ", type: "FLEX" },
  { id: "p-4", name: "Phủ Nano kính", durationMinutes: 30, price: { S: 300000, M: 300000, L: 350000 }, group: "Bảo vệ", type: "FLEX" },
  { id: "p-5", name: "PPF", durationMinutes: 480, price: { S: 12000000, M: 15000000, L: 18000000 }, group: "Bảo vệ", type: "FLEX" },
  { id: "p-6", name: "Phim cách nhiệt", durationMinutes: 240, price: { S: 4500000, M: 5500000, L: 6500000 }, group: "Bảo vệ", type: "FLEX" },
]

// Legacy service list (used by manager/washer views)
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
  brand: string
  model: string
  size: VehicleSize
  color: string
  colorHex?: string
  isDefault?: boolean
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
  { id: "v-1", plate: "51A-123.45", brand: "Toyota", model: "Camry", size: "M", color: "Trắng Ngọc Trai", colorHex: "#f5f5f5", isDefault: true },
  { id: "v-2", plate: "30A-678.90", brand: "VinFast", model: "VF8", size: "M", color: "Đen", colorHex: "#1a1a1a", isDefault: false },
  { id: "v-3", plate: "29B-456.78", brand: "Ford", model: "Ranger", size: "L", color: "Xám", colorHex: "#7f8c8d", isDefault: false },
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

export interface Reward {
  id: string
  title: string
  description: string
  pointsCost: number
  minTier: MembershipTier
  category: "Rửa xe" | "Chăm sóc" | "Bảo vệ"
  active: boolean
}

export const REWARDS: Reward[] = [
  { id: "r-1", title: "Giảm 50.000đ", description: "Áp dụng cho tất cả dịch vụ rửa xe", pointsCost: 500, minTier: "MEMBER", category: "Rửa xe", active: true },
  { id: "r-2", title: "Giảm 100.000đ", description: "Áp dụng cho dịch vụ nâng cấp", pointsCost: 900, minTier: "SILVER", category: "Chăm sóc", active: true },
  { id: "r-3", title: "Giảm 10%", description: "Chiết khấu 10% trên tổng hóa đơn", pointsCost: 1500, minTier: "GOLD", category: "Chăm sóc", active: true },
  { id: "r-4", title: "Giảm 200.000đ", description: "Áp dụng cho dịch vụ cao cấp", pointsCost: 1800, minTier: "PLATINUM", category: "Bảo vệ", active: true },
]

export interface Voucher {
  id: string
  code: string
  title: string
  discountType: "fixed" | "percent"
  discountValue: number
  status: "active" | "used" | "expired"
  expiryDate: string
  createdFrom: string
}

export const VOUCHERS: Voucher[] = [
  { id: "v-1", code: "AW50K-2026", title: "Giảm 50.000đ", discountType: "fixed", discountValue: 50000, status: "active", expiryDate: "2026-12-31", createdFrom: "Đổi điểm" },
  { id: "v-2", code: "AW100K-SILVER", title: "Giảm 100.000đ", discountType: "fixed", discountValue: 100000, status: "active", expiryDate: "2026-12-15", createdFrom: "Đổi điểm" },
  { id: "v-3", code: "AW10PERCENT", title: "Giảm 10%", discountType: "percent", discountValue: 10, status: "used", expiryDate: "2026-10-30", createdFrom: "Khuyến mãi" },
  { id: "v-4", code: "AW-WELCOME", title: "Chào mừng", discountType: "fixed", discountValue: 30000, status: "expired", expiryDate: "2026-03-31", createdFrom: "Hệ thống" },
]

export const TIME_SLOTS = [
  "07:00", "07:30",
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
]

/** Slots that are already booked (mock data) */
export const BOOKED_SLOTS: string[] = ["08:00", "08:30", "10:00", "13:30"]

export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}
