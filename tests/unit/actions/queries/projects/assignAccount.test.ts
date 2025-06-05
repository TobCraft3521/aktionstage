import { describe, it, expect } from "vitest"
import { assignAccount } from "@/lib/actions/queries/projects"
import { prismaMock } from "@/tests/mocks/prisma-mock"
import {
  mockAdmin,
  mockStudent,
  mockUnauthenticated,
} from "@/tests/mocks/auth-mock"
import { Role } from "@prisma/client"

describe("assignAccount", () => {
  const projectId = "project-123"
  const accountId = "student-456"

  it("should return error if user is unauthenticated", async () => {
    mockUnauthenticated()

    const res = await assignAccount(projectId, accountId)
    expect(res).toEqual({ error: "no id[ea] haha" })
  })

  it("should return error if user is not admin", async () => {
    mockStudent("some-id")
    prismaMock.account.findUnique.mockResolvedValue({
      id: "some-id",
      role: "STUDENT",
    } as any)

    const res = await assignAccount(projectId, accountId)
    expect(res).toEqual({ error: "no admin" })
  })

  it("should return error if project not found", async () => {
    mockAdmin("admin-id")
    prismaMock.account.findUnique.mockResolvedValue({
      id: "admin-id",
      role: Role.ADMIN,
    } as any)
    prismaMock.project.findUnique.mockResolvedValue(null)

    const res = await assignAccount(projectId, accountId)
    expect(res).toEqual({ error: "no project" })
  })

  it("should return error if account already in project", async () => {
    mockAdmin("admin-id")
    prismaMock.account.findUnique.mockResolvedValue({
      id: "admin-id",
      role: Role.ADMIN,
    } as any)
    prismaMock.project.findUnique.mockResolvedValue({
      id: projectId,
      participants: [{ id: accountId }],
    } as any)

    const res = await assignAccount(projectId, accountId)
    expect(res).toEqual({ error: "account already in project" })
  })

  it("should connect account if not already in project", async () => {
    mockAdmin("admin-id")
    prismaMock.account.findUnique.mockResolvedValue({
      id: "admin-id",
      role: Role.ADMIN,
    } as any)
    prismaMock.project.findUnique.mockResolvedValue({
      id: projectId,
      participants: [],
    } as any)

    const res = await assignAccount(projectId, accountId)

    expect(prismaMock.project.update).toHaveBeenCalledWith({
      where: { id: projectId },
      data: {
        participants: {
          connect: {
            id: accountId,
          },
        },
      },
    })

    expect(res).toEqual({ error: false })
  })
})
