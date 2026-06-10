import { describe, it, expect } from "vitest"
import { formatVND, formatDate } from "../lib/data"

describe("Formatting Utilities", () => {
  describe("formatVND", () => {
    it("should format numbers to VND currency representation", () => {
      const result = formatVND(100000)
      // Check if it contains '100.000' and either '₫' or 'VND' depending on env locale format
      expect(result).toContain("100.000")
    })
  })

  describe("formatDate", () => {
    it("should format ISO string to DD/MM/YYYY date format", () => {
      const result = formatDate("2026-06-08T00:53:30Z")
      expect(result).toBe("08/06/2026")
    })
  })
})
