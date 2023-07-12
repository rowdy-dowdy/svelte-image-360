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
          settings: {
            create: [
              {
                name: 'banner',
                field: 'image',
                details: `{
                  width: 6
                }`
              },
              {
                name: 'main audio',
                field: 'audio',
                details: `{
                  width: 6
                }`
              },
              {
                name: 'so do',
                field: 'image',
                details: `{
                  width: 6
                }`
              },
            ]
          }
        }
      })
    })
  )
  
  console.log({ user, groupSettings })
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