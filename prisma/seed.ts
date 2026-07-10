import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "imas.bd.2026@gmail.com"
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    console.log("Admin user already exists, updating password...")
    const hashedPassword = await bcrypt.hash("imas2026@", 10)
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: "ADMIN" },
    })
    console.log("Admin password updated.")
    return
  }

  const hashedPassword = await bcrypt.hash("imas2026@", 10)
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  })
  console.log("Admin user created: imas.bd.2026@gmail.com")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
