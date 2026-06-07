// ============================================================
// AutoWash Pro — Axios API Client
// Base URL: http://localhost:5255/api (dev)
//           https://api.autowash.pro/api  (prod)
// ============================================================

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ApiError } from '@/lib/types'

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5255/api'
const ACCESS_TOKEN_KEY  = 'aw_access_token'
const REFRESH_TOKEN_KEY = 'aw_refresh_token'
const ROLE_COOKIE_KEY   = 'aw_role'

// ─────────────────────────────────────────
// Cookie helpers (đọc được bởi middleware server-side)
// ─────────────────────────────────────────

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

// ─────────────────────────────────────────
// Token helpers (localStorage + cookie)
// ─────────────────────────────────────────

export const tokenStorage = {
  getAccess:  () => (typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY)  : null),
  getRefresh: () => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  setAccess:  (t: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, t)
    setCookie(ACCESS_TOKEN_KEY, t)
  },
  setRefresh: (t: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, t)
  },
  setRole: (role: string) => {
    setCookie(ROLE_COOKIE_KEY, role)
  },
  clearAll: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    deleteCookie(ACCESS_TOKEN_KEY)
    deleteCookie(ROLE_COOKIE_KEY)
  },
}

// ─────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Cần để gửi/nhận httpOnly cookie refreshToken
})

// ─────────────────────────────────────────
// REQUEST interceptor — Tự động gắn JWT
// ─────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccess()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─────────────────────────────────────────
// RESPONSE interceptor — Tự động refresh token khi 401
// ─────────────────────────────────────────

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject:  (reason?: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else       resolve(token)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Nếu không phải 401 → throw thẳng
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Nếu đang refresh → queue lại
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
        }
        return apiClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    // BE dùng httpOnly cookie để lưu refreshToken — gọi renew-token không cần body

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/renew-token`, {}, {
        withCredentials: true, // BE đọc refreshToken từ httpOnly cookie
      })

      const newAccessToken: string = data.token
      tokenStorage.setAccess(newAccessToken)
      if (data.role) tokenStorage.setRole(data.role)

      processQueue(null, newAccessToken)

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
      }

      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      tokenStorage.clearAll()
      if (typeof window !== 'undefined') window.location.href = '/auth/dang-nhap'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient
