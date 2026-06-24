// ============================================================
// AutoWash Pro — API Index
// Re-export tất cả API modules để import gọn
// ============================================================

// Ví dụ dùng:
//   import { signIn, signUp, logout } from '@/lib/api'
//   import { getMyBookings, createBooking } from '@/lib/api'

export * from './auth'
export * from './bookings'
export * from './services'
export * from './loyalty'
export * from './users'
export * from './dashboard'
export * from './audit'
export { default as apiClient } from './client'
export { tokenStorage } from './client'
