import { queryInfiniteProjects } from "@/lib/actions/queries/projects"
import { createSampleProject, prismaMock } from "@/tests/mocks/prisma-mock"
import { describe, it, expect } from "vitest"

describe("Test infinite project query/ chunk loading", () => {
  const mockProjects = Array.from({ length: 12 }, (_, index) =>
    createSampleProject({
      id: `project-${index}`,
    })
  )

  it("should return a list of projects with pagination", async () => {
    // Mock the Prisma db call to return a batch of projects
    prismaMock.project.findMany.mockResolvedValue(mockProjects)

    const { items, nextCursor } = await queryInfiniteProjects({
      pageParam: undefined,
    })

    expect(items).toBeDefined()
    expect(items.length).toBe(12) // Expect 12 projects, matching page size
    expect(nextCursor).toBe("project-11") // The next cursor should be the last project's ID

    // Check that the Prisma call is made with the correct pagination
    expect(prismaMock.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 12, // Page size
        skip: 0, // No cursor means no skip
        cursor: undefined, // No cursor for the first page
      })
    )
  })

  it("should handle pagination with a cursor", async () => {
    // Mock the Prisma db call with a cursor
    prismaMock.project.findMany.mockResolvedValue(mockProjects)

    const { items, nextCursor } = await queryInfiniteProjects({
      pageParam: "project-5",
    })

    expect(items).toBeDefined()
    expect(items.length).toBe(12) // As we mock skipping and taking, expect 12 projects -> mock fn always returns 12 projects
    expect(nextCursor).toBe("project-11") // The next cursor should be the last project's ID -> mocked fn ignores the cursor and always returns 12 projects

    // Check that the Prisma call is made with the correct pagination and cursor
    expect(prismaMock.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 12,
        skip: 1, // Skip 1 for cursor-based pagination
        cursor: { id: "project-5" }, // Cursor should be the passed ID
      })
    )
  })

  
})
