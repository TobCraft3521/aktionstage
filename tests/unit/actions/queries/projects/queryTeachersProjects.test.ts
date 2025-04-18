import { describe, it, expect, vi } from "vitest"
import { queryTeachersProjects } from "@/lib/actions/queries/projects"
import { createSampleProject, prismaMock } from "@/tests/mocks/prisma-mock"
import { mockTeacher, mockUnauthenticated } from "@/tests/mocks/auth-mock"

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

import { redirect } from "next/navigation"

describe("Test queryTeachersProjects", () => {
  it("should return teacher's projects sorted by day", async () => {
    mockTeacher("teacher-id")

    const unsortedProjects = [
      createSampleProject({ day: "WED" }),
      createSampleProject({ day: "MON" }),
      createSampleProject({ day: "TUE" }),
    ]

    prismaMock.account.findUnique.mockResolvedValue({
      id: "teacher-id",
      role: "TEACHER",
      projects: unsortedProjects,
    } as any)

    const result = await queryTeachersProjects()

    expect(result.map((p) => p.day)).toEqual(["MON", "TUE", "WED"])
    expect(prismaMock.account.findUnique).toHaveBeenCalled()
  })

  it("should redirect if user is not a teacher or not found", async () => {
    mockUnauthenticated()
    prismaMock.account.findUnique.mockResolvedValue(null)

    await queryTeachersProjects()

    expect(redirect).toHaveBeenCalledWith("/login")
  })
})
