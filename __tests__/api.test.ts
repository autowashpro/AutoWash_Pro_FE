import { describe, it, expect, vi, beforeEach } from "vitest"
import apiClient from "../lib/api/client"
import { 
  getManagerComplaints, 
  getCarWashers,
  getManagerBookings,
  getManagerBookingDetail,
  assignWasher,
  managerCancelBooking,
  markNoShow,
  createPayment,
  getBookingReport,
  getWasherTasks,
  getWasherTaskDetail,
  createInspection,
  washerCheckIn,
  startService,
  completeService
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
      const mockResponse = { data: { items: [], total: 0 } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getManagerBookings({ status: "CONFIRMED" } as any)
      expect(apiClient.get).toHaveBeenCalledWith("/manager/bookings", { params: { status: "CONFIRMED" } })
      expect(result).toEqual({ items: [], total: 0 })
    })
  })

  describe("getManagerBookingDetail", () => {
    it("should fetch booking detail", async () => {
      const mockResponse = { data: { data: { id: "b-1" } } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getManagerBookingDetail("b-1")
      expect(apiClient.get).toHaveBeenCalledWith("/manager/bookings/b-1")
      expect(result).toEqual({ id: "b-1" })
    })
  })

  describe("assignWasher", () => {
    it("should assign washer via PUT", async () => {
      const mockResponse = { data: { data: { status: "ASSIGNED" } } }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await assignWasher("b-1", "w-1")
      expect(apiClient.put).toHaveBeenCalledWith("/manager/bookings/b-1/assign", { car_washer_id: "w-1" })
      expect(result).toEqual({ status: "ASSIGNED" })
    })
  })

  describe("managerCancelBooking", () => {
    it("should cancel booking via POST", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({})

      await managerCancelBooking("b-1", true, "Khách yêu cầu")
      expect(apiClient.post).toHaveBeenCalledWith("/manager/bookings/b-1/cancel", {
        penalty_applied: true,
        cancellation_reason: "Khách yêu cầu"
      })
    })
  })

  describe("markNoShow", () => {
    it("should mark no show via PUT", async () => {
      const mockResponse = { data: { data: { trust_score_change: -40 } } }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await markNoShow("b-1", "Không đến")
      expect(apiClient.put).toHaveBeenCalledWith("/manager/bookings/b-1/no-show", { note: "Không đến" })
      expect(result).toEqual({ trust_score_change: -40 })
    })
  })

  describe("createPayment", () => {
    it("should create payment via POST", async () => {
      const mockResponse = { data: { data: { id: "p-1" } } }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const payload = { amount: 100, method: "CASH" as any }
      const result = await createPayment("b-1", payload)
      expect(apiClient.post).toHaveBeenCalledWith("/manager/bookings/b-1/payment", payload)
      expect(result).toEqual({ id: "p-1" })
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
      const mockResponse = { data: { data: { id: "i-1" } } }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const payload = { inspection_type: "BEFORE_SERVICE" as any, exterior_condition: "Ok", interior_condition: "Ok" }
      const result = await createInspection("b-1", payload)
      expect(apiClient.post).toHaveBeenCalledWith("/washer/tasks/b-1/inspections", payload)
      expect(result).toEqual({ id: "i-1" })
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
      expect(apiClient.put).toHaveBeenCalledWith("/washer/tasks/b-1/complete", { after_inspection_notes: "Hoàn tất" })
    })
  })
})
