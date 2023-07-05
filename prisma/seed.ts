import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import bcrypt from 'bcrypt'

async function main() {
  const password = await bcrypt.hash("password", 10)
  const user = await prisma.admin.create({
    data: {
      name: 'Admin',
      email: 'admin@admin.com',
      image: '/storage/images/user/b3.png',
      password
    }
  })

  const groupSettings = await prisma.$transaction(
    ["Website"].map(v => {
      return prisma.groupSetting.create({
        data: {
          name: v,
        }
      })
    })
  )
  
  console.log({ user })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })