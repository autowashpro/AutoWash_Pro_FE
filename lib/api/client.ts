// ============================================================
// AutoWash Pro — Axios API Client
// Base URL: http://localhost:5000/api/v1 (dev)
//           https://api.autowash.pro/v1  (prod)
// ============================================================

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ApiError } from '@/lib/types'

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'
const ACCESS_TOKEN_KEY  = 'aw_access_token'
const REFRESH_TOKEN_KEY = 'aw_refresh_token'

// ─────────────────────────────────────────
// Token helpers (localStorage)
// ─────────────────────────────────────────

export const tokenStorage = {
  getAccess:       ()         => (typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY)  : null),
  getRefresh:      ()         => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  setAccess:       (t: string) => localStorage.setItem(ACCESS_TOKEN_KEY,  t),
  setRefresh:      (t: string) => localStorage.setItem(REFRESH_TOKEN_KEY, t),
  clearAll:        ()          => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

// ─────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
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

    const refreshToken = tokenStorage.getRefresh()

    if (!refreshToken) {
      // Không có refresh token → đăng xuất
      tokenStorage.clearAll()
      if (typeof window !== 'undefined') window.location.href = '/auth/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        refresh_token: refreshToken,
      })

      const newAccessToken: string = data.data.access_token
      tokenStorage.setAccess(newAccessToken)

      processQueue(null, newAccessToken)

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
      }

      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      tokenStorage.clearAll()
      if (typeof window !== 'undefined') window.location.href = '/auth/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient
