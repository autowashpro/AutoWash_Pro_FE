import { describe, it, expect, vi, beforeEach } from "vitest"
import apiClient from "../lib/api/client"
import { 
  getManagerComplaints, 
  getCarWashers,
  getManagerBookings,
  getManagerBookingDetail,
  assignWasher,
  reassignWasher,
  managerCancelBooking,
  markNoShow,
  createPayment,
  getBookingReport,
  getWasherTasks,
  getWasherTaskDetail,
  createInspection,
  washerCheckIn,
  startService,
  completeService,
  updateBookingServices,
  retryPayosLink,
  updateSlot,
  resolveComplaint
} from "../lib/api"

// Mock the apiClient module
vi.mock("../lib/api/client", () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe("API Wrapper Functions", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("getManagerComplaints", () => {
    it("should fetch manager complaints with correct route and params", async () => {
      const mockResponse = { data: { success: true, data: [] } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getManagerComplaints({ status: "OPEN" })
      expect(apiClient.get).toHaveBeenCalledWith("/manager/complaints", {
        params: { status: "OPEN" },
      })
      expect(result).toEqual({ success: true, data: [] })
    })
  })

  describe("getCarWashers", () => {
    it("should fetch car washers list via GET", async () => {
      const mockResponse = { data: { success: true, data: [{ washerId: "w-1", fullName: "Thợ A" }] } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getCarWashers()
      expect(apiClient.get).toHaveBeenCalledWith("/manager/washers")
      expect(result).toEqual([{ washerId: "w-1", fullName: "Thợ A" }])
    })
  })

  // --- MANAGER BOOKINGS API TESTS ---
  describe("getManagerBookings", () => {
    it("should fetch manager bookings", async () => {
      const mockResponse = {
        data: {
          isSuccess: true,
          data: {
            items: [],
            totalItems: 0,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1
          }
        }
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getManagerBookings({ status: "CONFIRMED" } as any)
      expect(apiClient.get).toHaveBeenCalledWith("/manager/bookings", { params: { status: "CONFIRMED" } })
      expect(result).toEqual({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
      })
    })
  })

  describe("getManagerBookingDetail", () => {
    it("should fetch booking detail", async () => {
      const mockResponse = {
        data: {
          isSuccess: true,
          data: {
            bookingId: "b-1",
            customerName: "Thợ A",
            phone: "0123",
            licensePlate: "51A",
            vehicleSize: "SMALL",
            services: ["Service A"],
            estimatedTotalPrice: 100
          }
        }
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getManagerBookingDetail("b-1")
      expect(apiClient.get).toHaveBeenCalledWith("/manager/bookings/b-1")
      expect(result).toEqual({
        booking_id: "b-1",
        status: undefined,
        slot_start_time: undefined,
        slot_end_time: undefined,
        customer: {
          full_name: "Thợ A",
          phone_number: "0123",
          trust_score: 50,
          loyalty_points: 0,
          membership_tier: "MEMBER"
        },
        vehicle: {
          license_plate: "51A",
          brand: "",
          make: "",
          model: "",
          vehicle_size: "SMALL"
        },
        services: [
          { booking_service_id: "s-0", service_name: "Service A", price: 0 }
        ],
        total_price: 100,
        assigned_washer_name: undefined,
        bay_id: undefined,
        payments: [],
        inspections: [],
        activities: []
      })
    })
  })

  describe("assignWasher", () => {
    it("should assign washer via PUT", async () => {
      const mockResponse = {
        data: {
          data: {
            bookingId: "b-1",
            status: "ASSIGNED",
            carWasherId: "w-1",
            carWasherName: "Thợ A"
          }
        }
      }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await assignWasher("b-1", "w-1")
      expect(apiClient.put).toHaveBeenCalledWith("/manager/bookings/b-1/assign", { carWasherId: "w-1" })
      expect(result).toEqual({
        booking_id: "b-1",
        status: "ASSIGNED",
        car_washer_id: "w-1",
        car_washer_name: "Thợ A"
      })
    })
  })

  describe("managerCancelBooking", () => {
    it("should cancel booking via POST", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({})

      await managerCancelBooking("b-1", true, "Khách yêu cầu")
      expect(apiClient.post).toHaveBeenCalledWith("/manager/bookings/b-1/cancel", {
        penaltyApplied: true,
        cancellationReason: "Khách yêu cầu"
      })
    })
  })

  describe("markNoShow", () => {
    it("should mark no show via PUT", async () => {
      const mockResponse = {
        data: {
          data: {
            bookingId: "b-1",
            trustScoreChange: -40,
            customerTrustScoreAfter: 60
          }
        }
      }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await markNoShow("b-1", "Không đến")
      expect(apiClient.put).toHaveBeenCalledWith("/manager/bookings/b-1/no-show", { note: "Không đến" })
      expect(result).toEqual({
        booking_id: "b-1",
        trust_score_change: -40,
        customer_trust_score_after: 60
      })
    })
  })

  describe("createPayment", () => {
    it("should create payment via POST", async () => {
      const mockResponse = {
        data: {
          data: {
            paymentId: "p-1",
            method: "CASH",
            status: "PAID",
            paymentLink: "link"
          }
        }
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const payload = { amount: 100, method: "CASH" as any }
      const result = await createPayment("b-1", payload)
      expect(apiClient.post).toHaveBeenCalledWith("/manager/bookings/b-1/payment", payload)
      expect(result).toEqual({
        paymentId: "p-1",
        method: "CASH",
        status: "PAID",
        amount: 100,
        paymentLink: "link"
      })
    })
  })

  describe("getBookingReport", () => {
    it("should get booking report via GET", async () => {
      const mockResponse = { data: { data: { total: 1000 } } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getBookingReport("2026-06-01", "2026-06-30")
      expect(apiClient.get).toHaveBeenCalledWith("/manager/reports/bookings", { params: { from: "2026-06-01", to: "2026-06-30" } })
      expect(result).toEqual({ total: 1000 })
    })
  })

  // --- WASHER API TESTS ---
  describe("getWasherTasks", () => {
    it("should fetch washer tasks", async () => {
      const mockResponse = { data: { data: [] } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getWasherTasks("2026-06-08")
      expect(apiClient.get).toHaveBeenCalledWith("/washer/tasks", { params: { date: "2026-06-08" } })
      expect(result).toEqual([])
    })
  })

  describe("getWasherTaskDetail", () => {
    it("should fetch washer task detail", async () => {
      const mockResponse = { data: { data: { id: "b-1" } } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getWasherTaskDetail("b-1")
      expect(apiClient.get).toHaveBeenCalledWith("/washer/tasks/b-1")
      expect(result).toEqual({ id: "b-1" })
    })
  })

  describe("createInspection", () => {
    it("should create inspection via POST", async () => {
      const mockResponse = {
        data: {
          data: {
            inspectionId: "i-1",
            inspectionType: "BEFORE_SERVICE",
            exteriorCondition: "Ok",
            interiorCondition: "Ok",
            notes: "",
            customerConfirmed: false,
            images: []
          }
        }
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const payload = { inspection_type: "BEFORE_SERVICE" as any, exterior_condition: "Ok", interior_condition: "Ok" }
      const result = await createInspection("b-1", payload)
      expect(apiClient.post).toHaveBeenCalledWith("/washer/tasks/b-1/inspections", {
        inspectionType: "BEFORE_SERVICE",
        exteriorCondition: "Ok",
        interiorCondition: "Ok",
        notes: undefined
      })
      expect(result).toEqual({
        inspection_id: "i-1",
        booking_id: "b-1",
        created_at: expect.any(String),
        inspection_type: "BEFORE_SERVICE",
        exterior_condition: "Ok",
        interior_condition: "Ok",
        notes: "",
        customer_confirmed: false,
        images: []
      })
    })
  })

  describe("washerCheckIn", () => {
    it("should perform check-in via POST", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({})

      await washerCheckIn("b-1")
      expect(apiClient.post).toHaveBeenCalledWith("/washer/tasks/b-1/check-in")
    })
  })

  describe("startService", () => {
    it("should start service via PUT", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({})

      await startService("b-1")
      expect(apiClient.put).toHaveBeenCalledWith("/washer/tasks/b-1/start")
    })
  })

  describe("completeService", () => {
    it("should complete service via PUT", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({})

      await completeService("b-1", "Hoàn tất")
      expect(apiClient.put).toHaveBeenCalledWith("/washer/tasks/b-1/complete", { afterInspectionNotes: "Hoàn tất" })
    })
  })

  describe("reassignWasher", () => {
    it("should reassign washer via PUT with camelCase body", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({})
      await reassignWasher("b-1", "w-2", "Đổi thợ do bận")
      expect(apiClient.put).toHaveBeenCalledWith("/manager/bookings/b-1/reassign", {
        carWasherId: "w-2",
        reason: "Đổi thợ do bận"
      })
    })
  })

  describe("updateBookingServices", () => {
    it("should update booking services via PUT and return mapped response", async () => {
      const mockResponse = {
        data: {
          data: {
            bookingId: "b-1",
            estimatedTotalPrice: 150000,
            estimatedDurationMinutes: 45,
            pendingCustomerConfirmation: true
          }
        }
      }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)
      const result = await updateBookingServices("b-1", ["s-1", "s-2"], "Thêm dịch vụ")
      expect(apiClient.put).toHaveBeenCalledWith("/manager/bookings/b-1/services", {
        serviceIds: ["s-1", "s-2"],
        note: "Thêm dịch vụ"
      })
      expect(result).toEqual({
        booking_id: "b-1",
        estimated_total_price: 150000,
        estimated_duration_minutes: 45,
        pending_customer_confirmation: true
      })
    })
  })

  describe("retryPayosLink", () => {
    it("should retry payos link via POST and return mapped response", async () => {
      const mockResponse = {
        data: {
          data: {
            paymentLink: "https://payos.link/123",
            expiresAt: "2026-06-12T09:00:00Z"
          }
        }
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)
      const result = await retryPayosLink("b-1")
      expect(apiClient.post).toHaveBeenCalledWith("/manager/bookings/b-1/payment/retry-payos")
      expect(result).toEqual({
        payment_link: "https://payos.link/123",
        expires_at: "2026-06-12T09:00:00Z"
      })
    })
  })

  describe("updateSlot", () => {
    it("should update slot configuration via PUT with camelCase fields", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({})
      await updateSlot("slot-1", { washers_online: 5, active_bays: 3, status: "AVAILABLE" })
      expect(apiClient.put).toHaveBeenCalledWith("/manager/slots/slot-1", {
        washersOnline: 5,
        activeBays: 3,
        status: "AVAILABLE"
      })
    })
  })

  describe("resolveComplaint", () => {
    it("should resolve complaint via PUT with formatted camelCase payload", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({})
      const payload = {
        status: "RESOLVED",
        resolution_note: "Đã bồi thường",
        loyalty_adjustment: {
          customer_id: "cust-1",
          points: 100,
          description: "Đền bù khiếu nại"
        }
      }
      await resolveComplaint("c-1", payload)
      expect(apiClient.put).toHaveBeenCalledWith("/manager/complaints/c-1/resolve", {
        status: "RESOLVED",
        resolutionNote: "Đã bồi thường",
        loyaltyAdjustment: {
          customerId: "cust-1",
          points: 100,
          description: "Đền bù khiếu nại"
        }
      })
    })
  })
})
