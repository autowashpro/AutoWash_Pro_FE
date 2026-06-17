// ============================================================
// AutoWash Pro — TypeScript Type Definitions
// Nguồn: BRD v2.0 + API Contract v1.0
// ============================================================

// ─────────────────────────────────────────
// ENUMS — Dùng chung toàn hệ thống
// ─────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'MANAGER' | 'CAR_WASHER' | 'ADMIN'

export type VehicleSize = 'SMALL' | 'MEDIUM' | 'LARGE'

export type BookingType = 'WASH' | 'FLEX'

export type BookingSource = 'ONLINE' | 'WALK_IN'

export type BookingStatus =
  | 'SLOT_HELD'
  | 'EXPIRED'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'CHECKED_IN'
  | 'VEHICLE_INSPECTED'
  | 'CUSTOMER_CONFIRMED_CONDITION'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAID'
  | 'CLOSED'
  | 'CANCELLED_BY_CUSTOMER'
  | 'CANCELLED_BY_MANAGER'
  | 'AUTO_CANCELLED'
  | 'NO_SHOW'
  | 'CANCELLED'

export type MemberTier = 'MEMBER' | 'SILVER' | 'GOLD' | 'PLATINUM'

export type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'ADJUSTMENT' | 'EXPIRE'

export type RewardType = 'DISCOUNT_AMOUNT' | 'DISCOUNT_PERCENT' | 'FREE_WASH' | 'ADD_ON'

export type VoucherStatus = 'ACTIVE' | 'USED' | 'EXPIRED'

export type PaymentMethod = 'CASH' | 'PAYOS'

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED'

export type InspectionType = 'BEFORE_SERVICE' | 'AFTER_SERVICE'

export type ComplaintStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'WAITING_FOR_CUSTOMER'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CLOSED'

export type SlotStatus = 'AVAILABLE' | 'PARTIALLY_BOOKED' | 'FULLY_BOOKED' | 'BLOCKED'

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

export interface AuthUser {
  user_id: string
  full_name: string
  role: UserRole
  membership_tier?: MemberTier
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface LoginRequest {
  phone: string
  password: string
}

export interface RegisterRequest {
  full_name: string
  email: string
  phone: string
  password: string
}

export interface VerifyOtpRequest {
  user_id: string
  otp: string
}

// ─────────────────────────────────────────
// CUSTOMER PROFILE
// ─────────────────────────────────────────

export interface CustomerProfile {
  user_id: string
  full_name: string
  email: string
  phone: string
  birth_month?: number
  membership_tier: MemberTier
  total_points: number
  trust_score: number
  total_spending_12m: number
  tier_review_at: string
  booking_window_days: number
}

export interface UpdateProfileRequest {
  full_name?: string
  birth_month?: number
}

// ─────────────────────────────────────────
// VEHICLE (XE)
// ─────────────────────────────────────────

export interface Vehicle {
  vehicle_id: string
  license_plate: string
  brand: string
  model: string
  color: string
  vehicle_size: VehicleSize
  notes?: string
  is_default?: boolean
}

export interface CreateVehicleRequest {
  license_plate: string
  brand: string
  model: string
  color: string
  vehicle_size: VehicleSize
  notes?: string
}

// ─────────────────────────────────────────
// SERVICE (DỊCH VỤ)
// ─────────────────────────────────────────

export interface ServicePrice {
  vehicle_size: VehicleSize
  price: number
}

export interface Service {
  service_id: string
  service_code: string
  name: string
  estimated_duration_minutes: number
  price: number           // Giá theo loại xe đã chọn (từ API GET /services?vehicle_size=)
  status: 'ACTIVE' | 'INACTIVE'
}

export interface ServiceCategory {
  category_id: string
  name: string
  is_wash_group: boolean  // true = WASH (chiếm cầu nâng), false = FLEX
  services: Service[]
}

// ─────────────────────────────────────────
// SLOT
// ─────────────────────────────────────────

export interface Slot {
  slot_id: string
  start_time: string       // "09:00"
  end_time: string         // "09:30"
  remaining_capacity: number
  status?: SlotStatus
}

export interface SlotDetail extends Slot {
  capacity: number
  booked_count: number
  held_count: number
  bookings?: SlotBookingSummary[]
}

export interface SlotBookingSummary {
  booking_id: string
  customer_name: string
  license_plate: string
  status: BookingStatus
}

export interface CheckAvailabilityRequest {
  date: string             // "2026-06-01"
  service_ids: string[]
  vehicle_size: VehicleSize
}

export interface CheckAvailabilityResponse {
  booking_type: BookingType
  num_slots_required: number
  estimated_duration_minutes: number
  available_slots: Slot[]
  booking_window_note?: string
}

// ─────────────────────────────────────────
// BOOKING
// ─────────────────────────────────────────

export interface BookingService {
  service_id: string
  name: string
  price: number
  estimated_duration_minutes?: number
}

export interface BookingSlot {
  date: string             // "2026-06-01"
  start_time: string       // "09:00"
  end_time?: string        // "09:40"
}

export interface Booking {
  booking_id: string
  booking_source: BookingSource
  booking_type: BookingType
  status: BookingStatus
  slot: BookingSlot
  services: BookingService[]
  vehicle_id?: string
  license_plate?: string
  vehicle_size?: VehicleSize
  estimated_total_price: number
  discount_amount: number
  final_estimate: number
  num_slots?: number
  notes?: string
  created_at?: string
}

export interface BookingDetail extends Omit<Partial<Booking>, 'services'> {
  booking_id: string
  status: BookingStatus
  slot_start_time?: string
  slot_end_time?: string
  customer?: {
    full_name?: string
    phone_number?: string
    trust_score?: number
    loyalty_points?: number
    membership_tier?: MemberTier
  }
  vehicle?: {
    license_plate?: string
    brand?: string
    make?: string
    model?: string
    color?: string
    vehicle_size?: VehicleSize
  }
  services?: Array<{
    booking_service_id?: string
    service_id?: string
    service_name?: string
    name?: string
    price: number
    estimated_duration_minutes?: number
  }>
  total_price: number
  assigned_washer_name?: string
  bay_id?: string
  payments?: Array<Payment & { payment_method?: PaymentMethod }>
  inspections?: Inspection[]
  activities?: Array<{
    activity_id: string
    action_type: string
    details?: string
    actor_type?: string
    created_at: string
  }>
}

/** Tóm tắt booking cho danh sách (C-10, M-01) */
export interface BookingSummary {
  booking_id: string
  customer_name?: string
  phone?: string
  license_plate: string
  vehicle_size: VehicleSize
  services_summary: string
  slot_start_time: string
  booking_type: BookingType
  num_slots: number
  status: BookingStatus
  booking_source: BookingSource
  trust_score?: number
  assigned_washer?: string
}

export interface HoldSlotRequest {
  slot_id: string
  vehicle_id: string
  service_ids: string[]
  vehicle_size: VehicleSize
}

export interface HoldSlotResponse {
  booking_id: string
  slot_hold_token: string
  expires_at: string
  booking_type: BookingType
  num_slots: number
  estimated_total_price: number
  estimated_duration_minutes: number
  status?: BookingStatus
}

export interface CreateBookingRequest {
  slot_hold_token: string
  voucher_code?: string
  notes?: string
}

export interface CancelBookingResponse {
  booking_id: string
  status: BookingStatus
  trust_score_change: number
  reason: string
}

export interface RatingRequest {
  overall_score: number          // 1-5
  service_quality_score: number  // 1-5
  staff_attitude_score: number   // 1-5
  comment?: string
}

// ─────────────────────────────────────────
// VEHICLE INSPECTION
// ─────────────────────────────────────────

export interface Inspection {
  inspection_id: string
  booking_id: string
  inspection_type: InspectionType
  exterior_condition: string
  interior_condition?: string
  notes?: string
  customer_confirmed: boolean
  images: InspectionImage[]
  created_at: string
}

export interface InspectionImage {
  image_id: string
  url: string
  description?: string
}

export interface CreateInspectionRequest {
  inspection_type: InspectionType
  exterior_condition: string
  interior_condition?: string
  notes?: string
}

// ─────────────────────────────────────────
// LOYALTY & VOUCHER
// ─────────────────────────────────────────

export interface LoyaltyTransaction {
  transaction_id: string
  type: LoyaltyTransactionType
  points: number
  description: string
  created_at: string
}

export interface LoyaltyDashboard {
  total_points: number
  membership_tier: MemberTier
  point_multiplier: number
  total_spending_12m: number
  next_tier: MemberTier | null
  spending_to_next_tier: number | null
  transactions: LoyaltyTransaction[]
}

export interface Reward {
  reward_id: string
  name: string
  reward_type: RewardType
  points_required: number
  value: number
  min_tier_required: MemberTier | null
  valid_days: number
  category?: string
}

export interface CustomerVoucher {
  customer_reward_id: string
  voucher_code: string
  reward_name: string
  reward_type: RewardType
  value: number
  status: VoucherStatus
  expires_at: string
  used_at?: string
}

export interface RedeemRewardResponse {
  customer_reward_id: string
  voucher_code: string
  reward_name: string
  expires_at: string
  points_deducted: number
  remaining_points: number
}

// ─────────────────────────────────────────
// COMPLAINT (KHIẾU NẠI)
// ─────────────────────────────────────────

export interface Complaint {
  complaint_id: string
  booking_id: string
  title: string
  description: string
  status: ComplaintStatus
  images?: string[]
  resolution_note?: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────
// MANAGER — CAR WASHER
// ─────────────────────────────────────────

export interface CarWasher {
  washerId: string
  fullName: string
  avatarUrl?: string
  phone?: string
  status: string
  tasksToday: number
  completedTasksToday: number
  averageRating: number
}

export interface WalkinCustomerInfo {
  full_name: string
  phone: string
  email: string
  temp_password?: string
}

export interface WalkinVehicleInfo {
  license_plate: string
  brand: string
  model: string
  color: string
  vehicle_size: VehicleSize
}

export interface CreateWalkinRequest {
  customer_info: WalkinCustomerInfo
  vehicle: WalkinVehicleInfo
  slot_id: string
  service_ids: string[]
  notes?: string
}

export interface CreateWalkinResponse {
  booking_id: string
  booking_source: 'WALK_IN'
  status: BookingStatus
  user_id: string
  account_created: boolean
  message: string
}

// ─────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────

export interface Payment {
  paymentId: string
  method: PaymentMethod
  status: PaymentStatus
  amount?: number
  paidAt?: string
  paymentLink?: string
}

export interface CreatePaymentRequest {
  method: PaymentMethod
  amount: number
}

// ─────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────

export interface StoreInfo {
  name: string
  address: string
  phone: string
  opening_time: string   // "07:00"
  closing_time: string   // "18:00"
}

export interface AdminUser {
  user_id: string
  full_name: string
  email: string
  phone: string
  role: UserRole
  membership_tier?: MemberTier
  trust_score?: number
  total_bookings?: number
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  created_at: string
}

// ─────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────

export interface BookingReport {
  total_bookings: number
  by_status: Record<string, number>
  by_type: { WASH: number; FLEX: number }
  total_revenue: number
  dailyBreakdown?: Array<{ date: string; count: number; revenue: number }>
}

export interface WasherReport {
  car_washer_id: string
  full_name: string
  total_assigned: number
  total_completed: number
  avg_overall_score: number
  avg_service_quality_score: number
}

// ─────────────────────────────────────────
// API RESPONSE WRAPPERS
// ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}

// ─────────────────────────────────────────
// QUERY PARAMS
// ─────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface BookingListParams extends PaginationParams {
  status?: BookingStatus
  date?: string           // "2026-06-01"
  booking_type?: BookingType
  car_washer_id?: string
}

export interface ServiceListParams {
  vehicle_size: VehicleSize
}

// ─────────────────────────────────────────
// UI HELPERS (không phải từ API, dùng nội bộ FE)
// ─────────────────────────────────────────

/** Màu badge theo booking status */
export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: 'slate' | 'blue' | 'amber' | 'emerald' | 'red' | 'orange' }
> = {
  SLOT_HELD:                     { label: 'Đang giữ slot',      color: 'amber'   },
  EXPIRED:                       { label: 'Hết hạn',            color: 'red'     },
  PENDING_CONFIRMATION:          { label: 'Chờ xác nhận',       color: 'slate'   },
  CONFIRMED:                     { label: 'Đã xác nhận',        color: 'blue'    },
  ASSIGNED:                      { label: 'Đã phân công',       color: 'amber'   },
  CHECKED_IN:                    { label: 'Khách đã đến',       color: 'amber'   },
  VEHICLE_INSPECTED:             { label: 'Đã kiểm tra xe',     color: 'amber'   },
  CUSTOMER_CONFIRMED_CONDITION:  { label: 'Khách xác nhận xe',  color: 'amber'   },
  IN_PROGRESS:                   { label: 'Đang thực hiện',     color: 'orange'  },
  COMPLETED:                     { label: 'Hoàn thành',         color: 'emerald' },
  PAID:                          { label: 'Đã thanh toán',      color: 'emerald' },
  CLOSED:                        { label: 'Đã đóng',            color: 'emerald' },
  CANCELLED_BY_CUSTOMER:         { label: 'Khách hủy',          color: 'red'     },
  CANCELLED_BY_MANAGER:          { label: 'Tiệm hủy',          color: 'red'     },
  AUTO_CANCELLED:                { label: 'Tự động hủy',        color: 'red'     },
  NO_SHOW:                       { label: 'Không đến',          color: 'red'     },
  CANCELLED:                     { label: 'Đã hủy',             color: 'red'     },
}

/** Label tier thành viên */
export const TIER_LABELS: Record<MemberTier, string> = {
  MEMBER:   'Thành viên',
  SILVER:   'Bạc',
  GOLD:     'Vàng',
  PLATINUM: 'Bạch Kim',
}

/** Label cỡ xe */
export const VEHICLE_SIZE_LABELS: Record<VehicleSize, string> = {
  SMALL:  'Nhỏ (S)',
  MEDIUM: 'Vừa (M)',
  LARGE:  'Lớn (L)',
}
