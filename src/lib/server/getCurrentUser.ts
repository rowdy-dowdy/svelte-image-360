import db from "./prismadb"

export const getCurrentUser = async (adminId: string | null) => {
  if (!adminId) return null

  const user = await db.admin.findUnique({
    where: {
      id: adminId
    }
  })

  return user
}