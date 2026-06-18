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
  const { data } = await apiClient.post<ApiResponse<any>>(
    '/slots/check-availability',
    {
      date: payload.date,
      serviceIds: payload.service_ids,
      vehicleSize: payload.vehicle_size,
    },
  )
  const raw = data.data || {}
  return {
    booking_type: raw.bookingType || raw.booking_type || 'WASH',
    num_slots_required: raw.numSlotsRequired ?? raw.num_slots_required ?? 1,
    estimated_duration_minutes: raw.estimatedDurationMinutes ?? raw.estimated_duration_minutes ?? 30,
    available_slots: (raw.availableSlots || raw.available_slots || []).map((s: any) => ({
      slot_id: s.slotId ?? s.slot_id,
      start_time: s.startTime ?? s.start_time,
      end_time: s.endTime ?? s.end_time,
      remaining_capacity: s.remainingCapacity ?? s.remaining_capacity ?? s.remaining,
    })),
    booking_window_note: raw.bookingWindowNote ?? raw.booking_window_note,
  }
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
 * POST /bookings/confirm
 * Tạo booking sau khi giữ slot (Bước 2 của booking flow)
 * BE trả ConfirmBookingResponseDto — subset của Booking, không có license_plate/vehicle_size flat
 * FE dùng fallback từ local selectedVehicle state cho những field thiếu
 */
export async function createBooking(payload: CreateBookingRequest): Promise<Booking> {
  const { data } = await apiClient.post<ApiResponse<Booking>>('/bookings/confirm', payload)
  return data.data
}

/**
 * POST /bookings/release-hold
 * Giải phóng slot hold chủ động — gọi khi user huỷ ý định đặt lịch
 * BE sẽ set booking → CANCELLED và giảm HeldCount cho slot
 */
export async function releaseSlotHold(
  slotHoldToken: string,
  reason?: string,
): Promise<void> {
  await apiClient.post('/bookings/release-hold', {
    slot_hold_token: slotHoldToken,
    reason: reason ?? 'User cancelled before confirmation',
  })
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
 * Xác nhận sẽ đến (in-app, yêu cầu JWT — không cần body)
 */
export async function confirmAttendance(
  bookingId: string,
): Promise<{ booking_id: string; status: string; message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ booking_id: string; status: string; message: string }>>(
    `/bookings/${bookingId}/confirm-attendance`,
  )
  return data.data
}

/**
 * POST /bookings/:booking_id/confirm-attendance/public
 * Xác nhận sẽ đến qua link email (unauthenticated — cần confirm_token trong body)
 */
export async function confirmAttendanceByToken(
  bookingId: string,
  confirmToken: string,
): Promise<{ booking_id: string; status: string; message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ booking_id: string; status: string; message: string }>>(
    `/bookings/${bookingId}/confirm-attendance/public`,
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
 * Contract: Section 4.13 — api_contract.md
 */
export async function rateBooking(bookingId: string, payload: RatingRequest): Promise<void> {
  await apiClient.post(`/customer/bookings/${bookingId}/ratings`, payload)
}

/**
 * POST /CustomerComplaints/bookings/:booking_id/complaints
 * Gửi khiếu nại (multipart/form-data với ảnh)
 * Contract: Section 4.14 — api_contract.md
 * NOTE: BE expose tại /CustomerComplaints/... (không phải /customer/bookings/...)
 * Fields FormData: Title, Description, Files[] (PascalCase theo BE implement thực tế)
 */
export async function createComplaint(
  bookingId: string,
  payload: { title: string; description: string; images: File[] },
): Promise<Complaint> {
  const formData = new FormData()
  formData.append('Title', payload.title)
  formData.append('Description', payload.description)
  payload.images.forEach((img) => formData.append('Files[]', img))

  const { data } = await apiClient.post<ApiResponse<Complaint>>(
    `/CustomerComplaints/bookings/${bookingId}/complaints`,
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
  const { data } = await apiClient.get<any>(
    '/manager/bookings',
    { params },
  )
  
  const rawData = data.data || {}
  const items = rawData.items || []
  
  const mappedItems: BookingSummary[] = items.map((item: any) => ({
    booking_id: item.bookingId,
    customer_name: item.customerName,
    phone: item.phone,
    license_plate: item.licensePlate,
    vehicle_size: item.vehicleSize,
    services_summary: item.servicesSummary,
    slot_start_time: item.startTime,
    booking_type: item.bookingType,
    num_slots: item.numSlots,
    status: item.status,
    booking_source: item.bookingSource || 'ONLINE',
    trust_score: item.trustScore,
    assigned_washer: item.assignedWasher,
    bay_id: item.bayId,
  }))
  
  return {
    success: data.isSuccess,
    data: mappedItems,
    pagination: {
      page: rawData.pageNumber || 1,
      limit: rawData.pageSize || 10,
      total: rawData.totalItems || 0,
      totalPages: rawData.totalPages || 1,
    }
  }
}

/**
 * GET /manager/bookings/:booking_id
 * Chi tiết booking cho Manager
 */
export async function getManagerBookingDetail(bookingId: string): Promise<BookingDetail> {
  const { data } = await apiClient.get<any>(
    `/manager/bookings/${bookingId}`,
  )
  
  const raw = data.data || {}
  
  return {
    booking_id: raw.bookingId,
    status: raw.status,
    slot_start_time: raw.startTime,
    slot_end_time: raw.endTime || raw.startTime,
    customer: {
      full_name: raw.customerName,
      phone_number: raw.phone,
      trust_score: raw.trustScore || 50,
      loyalty_points: raw.loyaltyPoints || 0,
      membership_tier: raw.membershipTier || 'MEMBER',
    },
    vehicle: {
      license_plate: raw.licensePlate,
      brand: raw.brand || '',
      make: raw.brand || '',
      model: raw.model || '',
      vehicle_size: raw.vehicleSize,
    },
    services: (raw.services || []).map((sName: string, index: number) => ({
      booking_service_id: `s-${index}`,
      service_name: sName,
      price: 0,
    })),
    total_price: raw.estimatedTotalPrice || raw.finalTotalPrice || 0,
    assigned_washer_name: raw.assignedWasher,
    bay_id: raw.bayId,
    payments: raw.payments || [],
    inspections: raw.inspections || [],
    activities: raw.activities || [],
  }
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
  const { data } = await apiClient.put<ApiResponse<any>>(
    `/manager/bookings/${bookingId}/assign`,
    { carWasherId: carWasherId },
  )
  const res = data.data
  return {
    booking_id: res.bookingId,
    status: res.status,
    car_washer_id: res.carWasherId,
    car_washer_name: res.carWasherName,
  }
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
    carWasherId: carWasherId,
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
  const { data } = await apiClient.put<ApiResponse<any>>(
    `/manager/bookings/${bookingId}/no-show`,
    { note },
  )
  const res = data.data
  return {
    booking_id: res.bookingId,
    trust_score_change: res.trustScoreChange,
    customer_trust_score_after: res.customerTrustScoreAfter,
  }
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
    penaltyApplied: penaltyApplied,
    cancellationReason: cancellationReason,
  })
}

/**
 * POST /manager/bookings/:booking_id/send-t2h-reminder
 * Gửi email nhắc lịch T-2h thủ công (dùng để demo / test)
 * BE đã tạo route /manager/bookings/{bookingId}/send-t2h-reminder trong ManagerBookingController.
 */
export async function sendT2hReminderEmail(bookingId: string): Promise<void> {
  await apiClient.post(`/manager/bookings/${bookingId}/send-t2h-reminder`)
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
  const { data } = await apiClient.put<ApiResponse<any>>(
    `/manager/bookings/${bookingId}/services`,
    { serviceIds: serviceIds, note },
  )
  const res = data.data
  return {
    booking_id: res.bookingId,
    estimated_total_price: res.estimatedTotalPrice,
    estimated_duration_minutes: res.estimatedDurationMinutes,
    pending_customer_confirmation: res.pendingCustomerConfirmation,
  }
}

/**
 * POST /manager/bookings/:booking_id/payment
 * Tạo payment (CASH hoặc PAYOS)
 */
export async function createPayment(
  bookingId: string,
  payload: CreatePaymentRequest,
): Promise<Payment> {
  const { data } = await apiClient.post<ApiResponse<any>>(
    `/manager/bookings/${bookingId}/payment`,
    payload,
  )
  const res = data.data
  return {
    paymentId: res.paymentId,
    method: res.method,
    status: res.status,
    amount: payload.amount,
    paymentLink: res.paymentLink,
  }
}

/**
 * POST /manager/bookings/:booking_id/payment/retry-payos
 * Tạo lại PayOS link khi QR hết hạn
 */
export async function retryPayosLink(
  bookingId: string,
): Promise<{ payment_link: string; expires_at: string }> {
  const { data } = await apiClient.post<ApiResponse<any>>(
    `/manager/bookings/${bookingId}/payment/retry-payos`,
  )
  const res = data.data
  return {
    payment_link: res.paymentLink,
    expires_at: res.expiresAt,
  }
}

// ═══════════════════════════════════════════
// MANAGER — Slots
// ═══════════════════════════════════════════

/**
 * GET /manager/slots?date=YYYY-MM-DD
 * Xem slot theo ngày
 */
export async function getManagerSlots(date: string): Promise<SlotDetail[]> {
  const { data } = await apiClient.get<ApiResponse<any[]>>('/manager/slots', {
    params: { date },
  })
  const rawSlots = data.data || []
  return rawSlots.map((s: any) => ({
    slot_id: s.slotId,
    start_time: s.startTime,
    end_time: s.endTime,
    capacity: s.capacity,
    booked_count: s.bookedCount,
    held_count: s.heldCount,
    remaining_capacity: s.remaining,
    status: s.status,
    active_bays: s.activeBays,
    washers_online: s.washersOnline,
    bookings: (s.bookings || []).map((b: any) => ({
      booking_id: b.bookingId,
      customer_name: b.customerName,
      license_plate: b.licensePlate,
      status: b.status,
    }))
  })) as unknown as SlotDetail[]
}

/**
 * PUT /manager/slots/:slot_id
 * Cập nhật cấu hình slot (số washer online, số cầu hoạt động)
 */
export async function updateSlot(
  slotId: string,
  payload: { washers_online?: number; active_bays?: number; status?: string },
): Promise<void> {
  await apiClient.put(`/manager/slots/${slotId}`, {
    washersOnline: payload.washers_online,
    activeBays: payload.active_bays,
    status: payload.status,
  })
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
 * PUT /manager/complaints/:complaint_id/resolve
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
  const formattedPayload = {
    status: payload.status,
    resolutionNote: payload.resolution_note,
    loyaltyAdjustment: payload.loyalty_adjustment ? {
      customerId: payload.loyalty_adjustment.customer_id,
      points: payload.loyalty_adjustment.points,
      description: payload.loyalty_adjustment.description,
    } : undefined
  }
  await apiClient.put(`/manager/complaints/${complaintId}/resolve`, formattedPayload)
}

// ═══════════════════════════════════════════
// CAR WASHER — Tasks & Inspection
// ═══════════════════════════════════════════

/**
 * GET /washer/tasks
 * Danh sách task hôm nay của Car Washer
 */
export async function getWasherTasks(date?: string): Promise<BookingSummary[]> {
  const { data } = await apiClient.get<ApiResponse<any[]>>('/washer/tasks', {
    params: date ? { date } : undefined,
  })
  const rawList = data.data || []
  return rawList.map((item: any): BookingSummary => ({
    booking_id: item.bookingId,
    customer_name: item.customerName,
    license_plate: item.licensePlate,
    vehicle_size: item.vehicleSize,
    services_summary: Array.isArray(item.services) ? item.services.join(', ') : (item.services || ''),
    slot_start_time: item.slotStartTime || item.slot_start_time || '',
    booking_type: item.bookingType || 'WASH',
    num_slots: item.numSlots || 1,
    status: item.status,
    booking_source: item.bookingSource || 'ONLINE',
    assigned_washer: item.assignedWasher,
    bay_id: item.bayId,
  } as BookingSummary & { bay_id?: string }))
}

/**
 * GET /washer/tasks/:booking_id
 */
export async function getWasherTaskDetail(bookingId: string): Promise<any> {
  const { data } = await apiClient.get<ApiResponse<any>>(
    `/washer/tasks/${bookingId}`,
  )
  const raw = data.data || {}
  return {
    booking_id: raw.bookingId,
    assignment_id: raw.assignmentId,
    customer_name: raw.customerName,
    phone: raw.phone,
    license_plate: raw.licensePlate,
    vehicle_size: raw.vehicleSize,
    branch_name: raw.branchName,
    slot_start_time: raw.slotStartTime || raw.slot_start_time || '',
    slot_end_time: raw.slotEndTime || raw.slot_end_time || '',
    services: raw.services || [],
    booking_type: raw.bookingType || 'WASH',
    status: raw.status,
    booking_notes: raw.bookingNotes,
    bay_id: raw.bayId,
    inspections: (raw.inspections || []).map((ins: any) => ({
      inspection_id: ins.inspectionId,
      inspection_type: ins.inspectionType,
      exterior_condition: ins.exteriorCondition,
      interior_condition: ins.interiorCondition,
      notes: ins.notes,
      customer_confirmed: ins.customerConfirmed,
      images: (ins.images || []).map((img: any) => ({
        image_id: img.imageId,
        url: img.imageUrl,
        description: img.description,
      })),
    })),
  }
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
  const { data } = await apiClient.post<ApiResponse<any>>(
    `/washer/tasks/${bookingId}/inspections`,
    {
      inspectionType: payload.inspection_type,
      exteriorCondition: payload.exterior_condition,
      interiorCondition: payload.interior_condition,
      notes: payload.notes,
    },
  )
  const res = data.data
  return {
    inspection_id: res.inspectionId,
    booking_id: bookingId,
    created_at: new Date().toISOString(),
    inspection_type: res.inspectionType,
    exterior_condition: res.exteriorCondition,
    interior_condition: res.interiorCondition,
    notes: res.notes,
    customer_confirmed: res.customerConfirmed,
    images: (res.images || []).map((img: any) => ({
      image_id: img.imageId,
      image_url: img.imageUrl,
      description: img.description,
    })),
  }
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
    afterInspectionNotes: afterInspectionNotes,
  })
}
