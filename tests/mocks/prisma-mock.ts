import { ProjectWithParticipants } from "@/lib/types"
import { Day, PrismaClient, Project } from "@prisma/client"
import { beforeEach } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"

beforeEach(() => {
  mockReset(prisma)
})

const prisma = mockDeep<PrismaClient>()

vi.mock("@/lib/db", () => ({
  __esModule: true,
  db: prisma, // Mock the db export to return the mocked Prisma client
}))

export const prismaMock = prisma // Export the mocked Prisma client for use in tests

export function createSampleProject(
  overrides: Partial<ProjectWithParticipants> = {}
): Project {
  return {
    id: Math.random().toString(36).substring(7), // Generate a random ID
    name: "Sample Project",
    description: "This is a sample project description.",
    imageUrl: "https://picsum.photos/100/50",
    time: "00:00:00",
    location: "Sample Location",
    minGrade: 5,
    maxGrade: 11,
    day: Day.MON,
    maxStudents: 20,
    price: 100,
    emoji: "🌟",
    createdAt: new Date(),
    updatedAt: new Date(),
    roomId: null,
    ...overrides, // Allow overriding specific properties
  }
}
