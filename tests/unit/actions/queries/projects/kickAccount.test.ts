import { describe, it, expect, vi } from "vitest"
import { kickAccount } from "@/lib/actions/queries/projects"
import { prismaMock } from "@/tests/mocks/prisma-mock"
import {
  mockAdmin,
  mockUnauthenticated,
  mockStudent,
} from "@/tests/mocks/auth-mock"
import { redirect } from "next/navigation"

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

describe("Test kickAccount", () => {
  const projectId = "project-123"
  const accountId = "student-456"

  it("should redirect if user is unauthenticated", async () => {
    mockUnauthenticated()

    await kickAccount(projectId, accountId)

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("should redirect if user is not admin", async () => {
    mockStudent("non-admin-id")

    prismaMock.account.findUnique.mockResolvedValue({
      id: "non-admin-id",
      role: "STUDENT",
    } as any)

    await kickAccount(projectId, accountId)

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("should redirect if project not found", async () => {
    mockAdmin("admin-id")

    prismaMock.account.findUnique.mockResolvedValue({
      id: "admin-id",
      role: "ADMIN",
    } as any)

    prismaMock.project.findUnique.mockResolvedValue(null)

    await kickAccount(projectId, accountId)

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("should redirect if participant not in project", async () => {
    mockAdmin("admin-id")

    prismaMock.account.findUnique.mockResolvedValue({
      id: "admin-id",
      role: "ADMIN",
    } as any)

    prismaMock.project.findUnique.mockResolvedValue({
      id: projectId,
      participants: [{ id: "someone-else" }],
    } as any)

    await kickAccount(projectId, accountId)

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("should disconnect participant if all checks pass", async () => {
    mockAdmin("admin-id")

    prismaMock.account.findUnique.mockResolvedValue({
      id: "admin-id",
      role: "ADMIN",
    } as any)

    prismaMock.project.findUnique.mockResolvedValue({
      id: projectId,
      participants: [{ id: accountId }],
    } as any)

    await kickAccount(projectId, accountId)

    expect(prismaMock.project.update).toHaveBeenCalledWith({
      where: { id: projectId },
      data: {
        participants: {
          disconnect: {
            id: accountId,
          },
        },
      },
    })
  })
})
