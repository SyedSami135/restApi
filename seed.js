 const PrismaClient = require('@prisma/client').PrismaClient
 const bcrypt = require("bcrypt");


const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('adminpassword', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      firstName: 'Default',
      email: 'admin@example.com',
      country: 'AdminLand',
      password: hashedPassword,
      isAdmin: true,
      verified: true,
    },
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


