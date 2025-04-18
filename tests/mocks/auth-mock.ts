import { vi } from "vitest"

export const mockAuth = vi.fn()

beforeAll(() => {
  vi.clearAllMocks()
})

vi.mock("@/lib/auth/auth", () => ({
  auth: mockAuth,
}))

export const mockAdmin = (id = "admin-id") =>
  mockAuth.mockResolvedValue({ user: { id, role: "ADMIN" } })

export const mockStudent = (id = "student-id") =>
  mockAuth.mockResolvedValue({ user: { id, role: "STUDENT" } })

export const mockTeacher = (id = "teacher-id") =>
  mockAuth.mockResolvedValue({ user: { id, role: "TEACHER" } })

export const mockUnauthenticated = () => mockAuth.mockResolvedValue(null)
