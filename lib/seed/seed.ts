import { PrismaClient, Role } from "@prisma/client"

const db = new PrismaClient()
async function main() {
  console.log("🌱 Start seeding ...")
  // Sample student
  console.log("🍀 Seeding sample student")
  await db.account.upsert({
    where: {
      userName: "student",
    },
    create: {
      userName: "student",
      grade: "10a",
      name: "Student",
      role: Role.STUDENT,
      authDetails: {
        create: {
          password: "098f6bcd4621d373cade4e832627b4f6", // Test as md5 hash
          initialPassword: "098f6bcd4621d373cade4e832627b4f6",
        },
      },
    },
    update: {},
  })
  console.log("🍀 Seeding sample student done ✅")

  // Sample teacher
  console.log("🌿 Seeding sample teacher")
  await db.account.upsert({
    where: {
      userName: "teacher",
    },
    create: {
      userName: "teacher",
      name: "Teacher",
      role: Role.TEACHER,
      short: "Tea",
      authDetails: {
        create: {
          password: "098f6bcd4621d373cade4e832627b4f6", // Test as md5 hash
          initialPassword: "098f6bcd4621d373cade4e832627b4f6",
        },
      },
    },
    update: {},
  })
  console.log("🌿 Seeding sample teacher done ✅")

  // Seeding sample admin
  console.log("🌳 Seeding sample admin")
  await db.account.upsert({
    where: {
      userName: "admin",
    },
    create: {
      userName: "admin",
      name: "Admin",
      role: Role.ADMIN,
      short: "Adm",
      authDetails: {
        create: {
          password: "098f6bcd4621d373cade4e832627b4f6", // Test as md5 hash
          initialPassword: "098f6bcd4621d373cade4e832627b4f6",
        },
      },
    },
    update: {},
  })
  console.log("🌳 Seeding sample admin done ✅")

  // Seeding sample project
  console.log("🍃 Seeding sample project")
  await db.project.upsert({
    where: {
      id: "1",
    },
    create: {
      name: "Sample Project",
      description: "This is a sample project",
      imageUrl: "https://picsum.photos/100/50",
    },
    update: {},
  })
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
