import db from '$lib/server/prismadb.js';

export const load = async () => {
  const groups = db.groupScene.findMany()
  return { groups }
}

export const actions = {
  addEdit: async ({ cookies, request, url }) => {
    const data = await request.formData()
    const name = data.get('name') as string,
      editId = data.get('editId') as string | undefined

    if (editId && editId != "") {
      console.log({editId})
      await db.groupScene.update({
        where: {
          id: editId
        },
        data: {
          name: name
        }
      })
    }
    else {
      await db.groupScene.create({
        data: {
          name: name
        }
      })
    }
   
    return {}
  },

  delete: async ({ cookies, request, url }) => {
    const data = await request.formData()
    const id = data.get('id') as string | undefined

    if (!id) throw ""

    await db.groupScene.delete({
      where: {
        id: id
      }
    })
   
    return {}
  },
}