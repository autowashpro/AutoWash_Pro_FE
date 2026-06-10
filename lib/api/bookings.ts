// ============================================================
// AutoWash Pro — Bookings API (Customer + Manager + Washer)
// ============================================================

import apiClient from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  Booking,
  BookingDetail,
  BookingSummary,
  BookingListParams,
  CreateBookingRequest,
  CancelBookingResponse,
  RatingRequest,
  HoldSlotRequest,
  HoldSlotResponse,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  SlotDetail,
  CreateWalkinRequest,
  CreateWalkinResponse,
  Inspection,
  CreateInspectionRequest,
  InspectionImage,
  Payment,
  CreatePaymentRequest,
  Complaint,
} from '@/lib/types'

// ═══════════════════════════════════════════
// PUBLIC — Slots & Availability
// ═══════════════════════════════════════════

/**
 * POST /slots/check-availability
 * Kiểm tra slot trống cho dịch vụ đã chọn
 */
export async function checkAvailability(
  payload: CheckAvailabilityRequest,
): Promise<CheckAvailabilityResponse> {
  const { data } = await apiClient.post<ApiResponse<CheckAvailabilityResponse>>(
    '/slots/check-availability',
    payload,
  )
  return data.data
}

// ═══════════════════════════════════════════
// CUSTOMER — Booking Flow
// ═══════════════════════════════════════════

/**
 * POST /bookings/hold-slot
 * Giữ slot 10 phút (Bước 1 của booking flow)
 */
export async function holdSlot(payload: HoldSlotRequest): Promise<HoldSlotResponse> {
  const { data } = await apiClient.post<ApiResponse<HoldSlotResponse>>(
    '/bookings/hold-slot',
    payload,
  )
  return data.data
}

/**
 * POST /bookings
 * Tạo booking sau khi giữ slot (Bước 2 của booking flow)
 */
export async function createBooking(payload: CreateBookingRequest): Promise<Booking> {
  const { data } = await apiClient.post<ApiResponse<Booking>>('/bookings/confirm', payload)
  return data.data
}

/**
 * GET /bookings
 * Lấy danh sách booking của customer đang đăng nhập
 */
export async function getMyBookings(
  params?: BookingListParams,
): Promise<PaginatedResponse<BookingSummary>> {
  const { data } = await apiClient.get<PaginatedResponse<BookingSummary>>(
    '/bookings',
    { params },
  )
  return data
}

/**
 * GET /bookings/:booking_id
 * Chi tiết booking cho customer
 */
export async function getMyBookingDetail(bookingId: string): Promise<Booking> {
  const { data } = await apiClient.get<ApiResponse<Booking>>(
    `/bookings/${bookingId}`,
  )
  return data.data
}

/**
 * POST /bookings/:booking_id/confirm-attendance
 * Xác nhận sẽ đến (T-2h email link hoặc từ app)
 */
export async function confirmAttendance(
  bookingId: string,
  confirmToken?: string,
): Promise<{ booking_id: string; status: string; message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ booking_id: string; status: string; message: string }>>(
    `/bookings/${bookingId}/confirm-attendance`,
    { confirm_token: confirmToken },
  )
  return data.data
}

/**
 * DELETE /bookings/:booking_id
 * Hủy booking (customer)
 */
export async function cancelBooking(bookingId: string): Promise<CancelBookingResponse> {
  const { data } = await apiClient.delete<ApiResponse<CancelBookingResponse>>(
    `/bookings/${bookingId}`,
  )
  return data.data
}

/**
 * POST /customer/bookings/:booking_id/confirm-vehicle-condition
 * Khách xác nhận tình trạng xe sau khi xem inspection
 */
export async function confirmVehicleCondition(
  bookingId: string,
): Promise<{ booking_id: string; status: string; message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ booking_id: string; status: string; message: string }>>(
    `/customer/bookings/${bookingId}/confirm-vehicle-condition`,
  )
  return data.data
}

/**
 * POST /customer/bookings/:booking_id/ratings
 * Đánh giá dịch vụ (chỉ khi CLOSED)
 */
export async function rateBooking(bookingId: string, payload: RatingRequest): Promise<void> {
  await apiClient.post(`/customer/bookings/${bookingId}/ratings`, payload)
}

/**
 * POST /customer/bookings/:booking_id/complaints
 * Gửi khiếu nại (multipart/form-data với ảnh)
 */
export async function createComplaint(
  bookingId: string,
  formData: FormData,
): Promise<Complaint> {
  const { data } = await apiClient.post<ApiResponse<Complaint>>(
    `/customer/bookings/${bookingId}/complaints`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}

// ═══════════════════════════════════════════
// MANAGER — Booking Operations
// ═══════════════════════════════════════════

/**
 * GET /manager/bookings
 * Danh sách booking với filter theo ngày/trạng thái
 */
export async function getManagerBookings(
  params?: BookingListParams,
): Promise<PaginatedResponse<BookingSummary>> {
  const { data } = await apiClient.get<PaginatedResponse<BookingSummary>>(
    '/manager/bookings',
    { params },
  )
  return data
}

/**
 * GET /manager/bookings/:booking_id
 * Chi tiết booking cho Manager
 */
export async function getManagerBookingDetail(bookingId: string): Promise<BookingDetail> {
  const { data } = await apiClient.get<ApiResponse<BookingDetail>>(
    `/manager/bookings/${bookingId}`,
  )
  return data.data
}

/**
 * PUT /manager/bookings/:booking_id/confirm
 * Xác nhận booking (PENDING → CONFIRMED)
 */
export async function confirmBooking(bookingId: string): Promise<Booking> {
  const { data } = await apiClient.put<ApiResponse<Booking>>(
    `/manager/bookings/${bookingId}/confirm`,
  )
  return data.data
}

/**
 * POST /manager/bookings/walk-in
 * Tạo booking walk-in cho khách tại cửa hàng
 */
export async function createWalkinBooking(
  payload: CreateWalkinRequest,
): Promise<CreateWalkinResponse> {
  const { data } = await apiClient.post<ApiResponse<CreateWalkinResponse>>(
    '/manager/bookings/walk-in',
    payload,
  )
  return data.data
}

/**
 * PUT /manager/bookings/:booking_id/assign
 * Phân công Car Washer cho booking
 */
export async function assignWasher(
  bookingId: string,
  carWasherId: string,
): Promise<{ booking_id: string; status: string; car_washer_id: string; car_washer_name: string }> {
  const { data } = await apiClient.put<ApiResponse<{ booking_id: string; status: string; car_washer_id: string; car_washer_name: string }>>(
    `/manager/bookings/${bookingId}/assign`,
    { car_washer_id: carWasherId },
  )
  return data.data
}

/**
 * PUT /manager/bookings/:booking_id/reassign
 * Phân công lại Car Washer
 */
export async function reassignWasher(
  bookingId: string,
  carWasherId: string,
  reason: string,
): Promise<void> {
  await apiClient.put(`/manager/bookings/${bookingId}/reassign`, {
    car_washer_id: carWasherId,
    reason,
  })
}

/**
 * POST /manager/bookings/:booking_id/check-in
 * Manager check-in hộ khách
 */
export async function managerCheckIn(bookingId: string): Promise<void> {
  await apiClient.post(`/manager/bookings/${bookingId}/check-in`)
}

/**
 * PUT /manager/bookings/:booking_id/no-show
 * Đánh dấu khách không đến (-40 trust score)
 */
export async function markNoShow(
  bookingId: string,
  note: string,
): Promise<{ booking_id: string; trust_score_change: number; customer_trust_score_after: number }> {
  const { data } = await apiClient.put<ApiResponse<{ booking_id: string; trust_score_change: number; customer_trust_score_after: number }>>(
    `/manager/bookings/${bookingId}/no-show`,
    { note },
  )
  return data.data
}

/**
 * POST /manager/bookings/:booking_id/cancel
 * Manager hủy booking, chọn có phạt hay không
 */
export async function managerCancelBooking(
  bookingId: string,
  penaltyApplied: boolean,
  cancellationReason: string,
): Promise<void> {
  await apiClient.post(`/manager/bookings/${bookingId}/cancel`, {
    penalty_applied: penaltyApplied,
    cancellation_reason: cancellationReason,
  })
}

/**
 * PUT /manager/bookings/:booking_id/services
 * Chỉnh sửa dịch vụ tại chỗ (khi đang CHECKED_IN / VEHICLE_INSPECTED)
 */
export async function updateBookingServices(
  bookingId: string,
  serviceIds: string[],
  note?: string,
): Promise<{ booking_id: string; estimated_total_price: number; estimated_duration_minutes: number; pending_customer_confirmation: boolean }> {
  const { data } = await apiClient.put<ApiResponse<{ booking_id: string; estimated_total_price: number; estimated_duration_minutes: number; pending_customer_confirmation: boolean }>>(
    `/manager/bookings/${bookingId}/services`,
    { service_ids: serviceIds, note },
  )
  return data.data
}

/**
 * POST /manager/bookings/:booking_id/payment
 * Tạo payment (CASH hoặc PAYOS)
 */
export async function createPayment(
  bookingId: string,
  payload: CreatePaymentRequest,
): Promise<Payment> {
  const { data } = await apiClient.post<ApiResponse<Payment>>(
    `/manager/bookings/${bookingId}/payment`,
    payload,
  )
  return data.data
}

/**
 * POST /manager/bookings/:booking_id/payment/retry-payos
 * Tạo lại PayOS link khi QR hết hạn
 */
export async function retryPayosLink(
  bookingId: string,
): Promise<{ payment_link: string; expires_at: string }> {
  const { data } = await apiClient.post<ApiResponse<{ payment_link: string; expires_at: string }>>(
    `/manager/bookings/${bookingId}/payment/retry-payos`,
  )
  return data.data
}

// ═══════════════════════════════════════════
// MANAGER — Slots
// ═══════════════════════════════════════════

/**
 * GET /manager/slots?date=YYYY-MM-DD
 * Xem slot theo ngày
 */
export async function getManagerSlots(date: string): Promise<SlotDetail[]> {
  const { data } = await apiClient.get<ApiResponse<SlotDetail[]>>('/manager/slots', {
    params: { date },
  })
  return data.data
}

/**
 * PUT /manager/slots/:slot_id
 * Cập nhật cấu hình slot (số washer online, số cầu hoạt động)
 */
export async function updateSlot(
  slotId: string,
  payload: { washers_online?: number; active_bays?: number; status?: string },
): Promise<void> {
  await apiClient.put(`/manager/slots/${slotId}`, payload)
}

// ═══════════════════════════════════════════
// MANAGER — Complaints
// ═══════════════════════════════════════════

/**
 * GET /manager/complaints
 */
export async function getManagerComplaints(
  params?: { status?: string; page?: number; limit?: number },
): Promise<PaginatedResponse<Complaint>> {
  const { data } = await apiClient.get<PaginatedResponse<Complaint>>(
    '/manager/complaints',
    { params },
  )
  return data
}

/**
 * GET /manager/complaints/:complaint_id
 */
export async function getManagerComplaintDetail(complaintId: string): Promise<Complaint> {
  const { data } = await apiClient.get<ApiResponse<Complaint>>(
    `/manager/complaints/${complaintId}`,
  )
  return data.data
}

/**
 * PUT /manager/complaints/:complaint_id
 * Xử lý / đóng khiếu nại
 */
export async function resolveComplaint(
  complaintId: string,
  payload: {
    status: string
    resolution_note: string
    loyalty_adjustment?: { customer_id: string; points: number; description: string }
  },
): Promise<void> {
  await apiClient.put(`/manager/complaints/${complaintId}`, payload)
}

// ═══════════════════════════════════════════
// CAR WASHER — Tasks & Inspection
// ═══════════════════════════════════════════

/**
 * GET /washer/tasks
 * Danh sách task hôm nay của Car Washer
 */
export async function getWasherTasks(date?: string): Promise<BookingSummary[]> {
  const { data } = await apiClient.get<ApiResponse<BookingSummary[]>>('/washer/tasks', {
    params: date ? { date } : undefined,
  })
  return data.data
}

/**
 * GET /washer/tasks/:booking_id
 */
export async function getWasherTaskDetail(bookingId: string): Promise<Booking> {
  const { data } = await apiClient.get<ApiResponse<Booking>>(
    `/washer/tasks/${bookingId}`,
  )
  return data.data
}

/**
 * POST /washer/tasks/:booking_id/check-in
 * Car Washer xác nhận khách đã đến
 */
export async function washerCheckIn(bookingId: string): Promise<void> {
  await apiClient.post(`/washer/tasks/${bookingId}/check-in`)
}

/**
 * POST /washer/tasks/:booking_id/inspections
 * Tạo biên bản kiểm tra xe
 */
export async function createInspection(
  bookingId: string,
  payload: CreateInspectionRequest,
): Promise<Inspection> {
  const { data } = await apiClient.post<ApiResponse<Inspection>>(
    `/washer/tasks/${bookingId}/inspections`,
    payload,
  )
  return data.data
}

/**
 * POST /washer/tasks/:booking_id/inspections/:inspection_id/images
 * Upload ảnh biên bản (multipart/form-data)
 */
export async function uploadInspectionImages(
  bookingId: string,
  inspectionId: string,
  formData: FormData,
): Promise<InspectionImage[]> {
  const { data } = await apiClient.post<ApiResponse<InspectionImage[]>>(
    `/washer/tasks/${bookingId}/inspections/${inspectionId}/images`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}

/**
 * PUT /washer/tasks/:booking_id/start
 * Bắt đầu thực hiện dịch vụ (chỉ sau khi khách confirm vehicle condition)
 */
export async function startService(bookingId: string): Promise<void> {
  await apiClient.put(`/washer/tasks/${bookingId}/start`)
}

/**
 * PUT /washer/tasks/:booking_id/complete
 * Hoàn thành dịch vụ
 */
export async function completeService(
  bookingId: string,
  afterInspectionNotes: string,
): Promise<void> {
  await apiClient.put(`/washer/tasks/${bookingId}/complete`, {
    after_inspection_notes: afterInspectionNotes,
  })
}
