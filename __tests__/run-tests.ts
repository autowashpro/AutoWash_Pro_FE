import { formatVND, formatDate } from "../lib/data"

async function runTests() {
  console.log("\x1b[35m%s\x1b[0m", "====================================================")
  console.log("\x1b[35m%s\x1b[0m", "          AutoWash Pro FE — Unit Test Runner        ")
  console.log("\x1b[35m%s\x1b[0m", "====================================================")

  let passed = 0
  let failed = 0

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn()
      console.log(`\x1b[32m✔ PASS\x1b[0m - ${name}`)
      passed++
    } catch (error: any) {
      console.error(`\x1b[31m✘ FAIL\x1b[0m - ${name}`)
      console.error(error)
      failed++
    }
  }

  // 1. Test formatVND
  test("formatVND formats 180000 to correct currency string", () => {
    const formatted = formatVND(180000)
    if (!formatted.includes("180.000")) {
      throw new Error(`Expected formatVND(180000) to contain '180.000', got '${formatted}'`)
    }
  })

  // 2. Test formatDate
  test("formatDate formats YYYY-MM-DD to DD/MM/YYYY", () => {
    const formatted = formatDate("2026-06-08")
    if (formatted !== "08/06/2026") {
      throw new Error(`Expected formatDate('2026-06-08') to be '08/06/2026', got '${formatted}'`)
    }
  })

  // 3. Test API wrapper imports and existence
  test("API endpoints are exported properly", async () => {
    const api = await import("../lib/api")
    if (typeof api.getManagerComplaints !== "function") {
      throw new Error("getManagerComplaints is not exported as a function")
    }
    if (typeof api.getCustomerProfile !== "function") {
      throw new Error("getCustomerProfile is not exported as a function")
    }
    if (typeof api.getCarWashers !== "function") {
      throw new Error("getCarWashers is not exported as a function")
    }
  })

  console.log("\x1b[35m%s\x1b[0m", "====================================================")
  console.log(
    `Kết quả: \x1b[32m${passed} Đạt\x1b[0m, \x1b[31m${failed} Thất bại\x1b[0m`
  )
  console.log("\x1b[35m%s\x1b[0m", "====================================================")

  if (failed > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

runTests()
