import db from "$lib/server/prismadb"
import type { GroupSetting, Setting } from "@prisma/client"
import { fail } from "@sveltejs/kit"
import { existsSync, mkdirSync } from "fs"
import { writeFile } from "fs/promises";
import path from "path"
import sharp from "sharp"
import { v4 } from "uuid"

export const load = async () => {
  const groupSettings = await db.groupSetting.findMany({
    include: {
      settings: true
    }
  })

  let groupSettingsData: (GroupSetting & {
    settings: Setting[]
  })[] = groupSettings.map(v => {
    return {
      ...v,
      settings: v.settings.map(v2 => ({
        ...v2,
        details: v2.details ? JSON.parse(v2.details) : null
      }))
    }
  })

  return { groupSettings: groupSettingsData }
}

export const actions = {
  createGroup: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      const name = data.get('name') as string

      const group = await db.groupSetting.create({
        data: {
          name: name
        }
      })

      return {}

    } catch (error) {
      console.log({error})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },
  createSetting: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      const name = data.get('name') as string,
            field = data.get('field') as string,
            width = data.get('width') as string,
            groupId = data.get('groupId') as string

      const setting = await db.setting.create({
        data: {
          groupId: groupId,
          name: name,
          field,
          details: JSON.stringify({
            width: width
          })
        }
      })

      return {}

    } catch (error) {
      console.log({error})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },

  saveSettings: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()

      let updates = []
      for (var [key, value] of data.entries()) {
        console.log(key, value);
        if (value && ((value as File).size > 0 || value.length > 0)) {
          if (typeof value === 'string') {
            updates.push(db.setting.updateMany({
              where: {
                name: key
              },
              data: {
                value: value
              }
            }))
          }
          else if (value instanceof File) {
            let uuid = v4()
            if (!existsSync(`./storage/settings`)) {
              mkdirSync(`./storage/settings`, { recursive: true })
            }

            let mimetype = path.extname(value.name)
            let temp = ''

            if ([".jpg", ".png", ".jpge", ".webp"].includes(mimetype)) {
              await sharp(await value.arrayBuffer()).png({ quality: 60, compressionLevel: 9, adaptiveFiltering: true, force: true }).toFile(`./storage/settings/${uuid}.png`);
              temp = `/storage/settings/${uuid}.png`
            }
            else if ([".mp3"].includes(mimetype)) {
              await writeFile(`./storage/settings/${uuid}${mimetype}`, value.stream() as any)
              temp = `/storage/settings/${uuid}${mimetype}`
            }
            
            updates.push(db.setting.updateMany({
              where: {
                name: key
              },
              data: {
                value: temp
              }
            }))
          }
          
        }
      }

      await db.$transaction(updates)

      return {}

    } catch (error) {
      console.log({error})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },
}