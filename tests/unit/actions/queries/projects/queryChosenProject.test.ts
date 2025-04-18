import { describe, it, expect } from "vitest"
import { queryChosenProjects } from "@/lib/actions/queries/projects"
import { prismaMock } from "@/tests/mocks/prisma-mock"
import { mockStudent, mockUnauthenticated } from "@/tests/mocks/auth-mock"
import { Role } from "@prisma/client"

describe("queryChosenProjects", () => {
  const studentId = "student-id"

  it("should return error if user is unauthenticated", async () => {
    mockUnauthenticated()
    const res = await queryChosenProjects()
    expect(res).toEqual({ error: "no id[ea] haha" })
  })

  it("should return error if student not found", async () => {
    mockStudent(studentId)
    prismaMock.account.findUnique.mockResolvedValue(null)
    const res = await queryChosenProjects()
    expect(res).toEqual({ error: "no student" })
  })

  it("should return sorted projects if valid student", async () => {
    mockStudent(studentId)

    prismaMock.account.findUnique.mockResolvedValue({
      id: studentId,
      role: Role.STUDENT,
      projects: [
        { id: "1", day: "WED", participants: [] },
        { id: "2", day: "MON", participants: [] },
        { id: "3", day: "TUE", participants: [] },
      ],
    } as any)

    const res = await queryChosenProjects()
    expect(res).toEqual([
      { id: "2", day: "MON", participants: [] },
      { id: "3", day: "TUE", participants: [] },
      { id: "1", day: "WED", participants: [] },
    ])
  })
})
