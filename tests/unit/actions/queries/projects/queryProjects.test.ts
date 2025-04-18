import { describe, it, expect, vi } from "vitest"

import { queryProjects } from "@/lib/actions/queries/projects"
import { createSampleProject, prismaMock } from "@/tests/mocks/prisma-mock"

describe("Test project query functionality", () => {
  it("should return a list of projects", async () => {
    prismaMock.project.findMany.mockResolvedValue([
      ...Array.from({ length: 10 }, () => createSampleProject()),
    ])

    const projects = await queryProjects()
    expect(projects).toBeDefined()
    expect(projects.length).toBe(10)
  })
})
