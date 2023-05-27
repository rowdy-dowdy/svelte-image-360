export const ssr = false;

import { fail } from '@sveltejs/kit'
import * as fs from 'fs/promises'
import { existsSync, mkdirSync, rmSync } from "fs"
import sharp from "sharp"
import AdmZip from "adm-zip"
import {tmpdir, type} from 'os'
import path from 'path'
import { SAVE_TEMP } from '$env/static/private'
import db from '$lib/server/prismadb.js'
import type { InfoHotspots, LinkHotspots, Scene } from '@prisma/client'
import { v4 } from 'uuid';
import { ImageData, createCanvas, loadImage } from "canvas";
import { getDataURL, renderFace, renderFacePromise } from '$lib/admin/convertServer.js';

function tmpFile(p: string) {
  return path.join(tmpdir(),p)
}

const facePositions = {
  pz: {x: 1, y: 1, name: 'b'},
  nz: {x: 3, y: 1, name: 'f'},
  px: {x: 2, y: 1, name: 'l'},
  nx: {x: 0, y: 1, name: 'r'},
  py: {x: 1, y: 0, name: 'u'},
  ny: {x: 1, y: 2, name: 'd'}
}

export type LevelsType = {
  tileSize: number,
  size: number,
  fallbackOnly?: boolean
}[]

export type InitialViewParametersType = {
  pitch: number,
  yaw: number,
  fov: number
}

export type SceneDataType =  (Omit<Scene, 'levels' | 'initialViewParameters'> & {
  levels: LevelsType;
  initialViewParameters: InitialViewParametersType;
  infoHotspots: InfoHotspots[];
  linkHotspots: LinkHotspots[];
})

export const load = async () => {
  const scenes = await db.scene.findMany({
    include: {
      infoHotspots: true,
      linkHotspots: true
    },
    orderBy: {
      sort: 'asc'
    }
  })

  let scenesData: SceneDataType[] = scenes.map(v => {
    return {
      ...v,
      levels: JSON.parse(v.levels) as LevelsType,
      initialViewParameters: JSON.parse(v.initialViewParameters) as InitialViewParametersType,
    }
  })

  return { scenes: scenesData }
}

export const actions = {
  addScene: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      let name = data.get('name') as string,
        image = data.get('image') as File,
        audio = data.get('audio') as File,
        description = data.get('description') as string

      const canvas = createCanvas(200, 200)
      const ctx = canvas.getContext('2d')

      // image 360 to cube map
      let renderOptions = await loadImage(Buffer.from(await image.arrayBuffer())).then((image) => {
        const { width, height } = image
        canvas.width = width
        canvas.height = height
        ctx.drawImage(image, 0, 0, width, height)
      
        const dataImage = ctx.getImageData(0, 0, width, height)

        let renderOptions = []
    
        for (let [faceName, position] of Object.entries(facePositions)) {
          const options = {
            data: dataImage,
            face: faceName,
            rotation: Math.PI * 180 / 180,
            interpolation: "lanczos",
          }
          renderOptions.push(options)
        }

        return renderOptions
      })

      let images = await Promise.all(renderOptions.map(v => {
        return renderFacePromise(v)
      }))

      const findImage = (name: string) => 
        getDataURL(images[Object.entries(facePositions).findIndex(v => v[1].name == name)])

      let b = findImage("b"),
          d = findImage("d"),
          f = findImage("f"),
          l = findImage("l"),
          r = findImage("r"),
          u = findImage("u")
          let uuid = v4()

      let metadata = await sharp(b).metadata()
      let { width = 0 } = metadata

      let maxZoom = Math.max(Math.floor(Math.log2(width!) - 8),3)

      // save image tiles
      for(let i = 0; i < maxZoom; i++) {
        await Promise.all([
          slipImageFace(b, "b", name, i+1, uuid, maxZoom),
          slipImageFace(d, "d", name, i+1, uuid, maxZoom),
          slipImageFace(f, "f", name, i+1, uuid, maxZoom),
          slipImageFace(l, "l", name, i+1, uuid, maxZoom),
          slipImageFace(r, "r", name, i+1, uuid, maxZoom),
          slipImageFace(u, "u", name, i+1, uuid, maxZoom),
        ])
      }
      await mergeImagePreview(b,d,f,l,r,u,name,uuid, maxZoom)

      if (!existsSync(`./storage/tiles/${uuid}`)) {
        mkdirSync(`./storage/tiles/${uuid}`, { recursive: true })
      }
    
      //save image demo
      const imageDemo = await sharp(await image.arrayBuffer()).resize({ width: 1000 }).jpeg({ quality: 80, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/demo.jpg`)
        .then((data: any) => {
          return data
        })

      // save audio file
      let typeAduio = audio.type.split('/')[1]
      await fs.writeFile(`./storage/tiles/${uuid}/audio.${typeAduio}`, audio.stream() as any)

      let tileSize = width / Math.pow(2,(maxZoom - 1))

      const scene = await db.scene.create({
        data: {
          id: uuid,
          name: name,
          faceSize: width * 2,
          initialViewParameters: `{
            "pitch": 0,
            "yaw": 0,
            "fov": 1.5707963267948966
          }`,
          url: `/storage/tiles/${uuid}`,
          levels: `[
            { "tileSize": ${tileSize/2}, "size": ${tileSize/2}, "fall backOnly": true },
            ${new Array(maxZoom).fill(0).map((v,i) => {
              return `{ "tileSize": ${tileSize}, "size": ${tileSize * Math.pow(2,i)} }`
            }).toString()}
          ]`,
          description: description,
          audio: `/storage/tiles/${uuid}/audio.${typeAduio}`
        }
      })

      return { success: true, scene }
    }
    catch(e) {
      console.log({e})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },

  deleteScene: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      
      let id = data.get('id') as string

      const deleteInfoHotspots = db.infoHotspots.deleteMany({
        where: {
          sceneId: id
        }
      })

      const deleteLinkHotspots = db.linkHotspots.deleteMany({
        where: {
          sceneId: id
        }
      })

      const deletescene = db.scene.delete({
        where: {
          id: id
        }
      })

      const transaction = await db.$transaction([deleteInfoHotspots, deleteLinkHotspots, deletescene])

      // await rmSync(`./storage/tiles/${id}`, { recursive: true })
      await fs.rm(`./storage/tiles/${id}`, { recursive: true })

      return { success: true }
    } 
    catch (error) {
      console.log({error})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },

  updateScene: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      let name = data.get('name') as string,
        audio = data.get('audio') as File,
        oldAduio = data.get('oldAduio') as string,
        id = data.get('id') as string,
        description = data.get('description') as string

      // save audio file
      let audioUrl = null
      if (audio && audio.size > 0) {
        console.log({audio})
        let typeAduio = audio.type.split('/')[1]
        await fs.writeFile(`./storage/tiles/${id}/audio.${typeAduio}`, audio.stream() as any)
        audioUrl = `./storage/tiles/${id}/audio.${typeAduio}`
      }
      
      let dataUpdate: any = {
        name: name,
        description: description,
      }

      if (!oldAduio) {
        dataUpdate = {...dataUpdate, audio: audioUrl}
      }

      const scene = await db.scene.update({
        where: {
          id: id,
        },
        data: dataUpdate
      })

      return { success: true, scene }
    }
    catch(e) {
      console.log({e})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },

  sortScene: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      
      let list = JSON.parse(data.get('list') as string) as string[]

      let scenesUpdate = list.map((v,i) => {
        return db.scene.update({
          where: {
            id: v
          },
          data: {
            sort: i
          }
        })
      })

      const transaction = await db.$transaction(scenesUpdate)

      return { success: true }
    } 
    catch (error) {
      console.log({error})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },

  createHotspot: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      
      let sceneId = data.get('sceneId') as string,
          target = data.get('target') as string,
          yaw = data.get('yaw') as string,
          pitch = data.get('pitch') as string,
          direction = data.get('direction') as string,
          hotspotType = data.get('hotspotType') as string,
          type = data.get('type') as string,
          image = data.get('image') as File | null | undefined,
          title = data.get('title') as string,
          description = data.get('description') as string

      if (hotspotType == "link") {
        const linkHotspot = await db.linkHotspots.create({
          data: {
            sceneId: sceneId,
            yaw: +yaw,
            pitch: +pitch,
            direction: direction,
            target: target,
            type: type
          }
        })
      }
      else if (hotspotType == "info") {

        let imageUrl: sharp.OutputInfo | null = null
        let uuid = v4()
        if (image && image?.size > 0) {

          if (!existsSync(`./storage/info-hotspots`)) {
            mkdirSync(`./storage/info-hotspots`, { recursive: true })
          }

          let imageFile = sharp(await image.arrayBuffer())
          let { format } = await imageFile.metadata()
          
          imageUrl = await imageFile
            .toFile(`./storage/info-hotspots/${uuid}.${format}`)
            .then((data) => {
              return data
            })
        }

        const infoHotspot = await db.infoHotspots.create({
          data: {
            sceneId: sceneId,
            yaw: +yaw,
            pitch: +pitch,
            direction: direction,
            type: type,
            title: title,
            description: description,
            image: imageUrl ? `/storage/info-hotspots/${uuid}.${imageUrl.format}` : null
          }
        })
      }
      else throw ""
      return { success: true }
    } 
    catch (error) {
      console.log({error})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },

  deleteHotspot: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      
      let id = data.get('id') as string,
          type = data.get('type') as string

      if (type == "link") {
        const linkHotspot = await db.linkHotspots.delete({
          where: {
            id: id
          }
        })
      }
      else if (type == "info") {
        const infoHotspot = await db.infoHotspots.delete({
          where: {
            id: id
          }
        })
      } else {
        throw ""
      }

      return { success: true }
    } 
    catch (error) {
      console.log({error})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },

  editHotspot: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      
      let id = data.get('id') as string,
          target = data.get('target') as string,
          direction = data.get('direction') as string,
          hotspotType = data.get('hotspotType') as string,
          type = data.get('type') as string,
          image = data.get('image') as File | null | undefined,
          title = data.get('title') as string,
          description = data.get('description') as string

      if (hotspotType == "link") {
        const linkHotspot = await db.linkHotspots.update({
          where: {
            id: id
          },
          data: {
            direction: direction,
            target: target,
            type: type
          }
        })
      }
      else if (hotspotType == "info") {

        let imageUrl: sharp.OutputInfo | null = null
        let uuid = v4()
        if (image && image?.size > 0) {

          if (!existsSync(`./storage/info-hotspots`)) {
            mkdirSync(`./storage/info-hotspots`, { recursive: true })
          }

          let imageFile = sharp(await image.arrayBuffer())
          let { format } = await imageFile.metadata()
          
          imageUrl = await imageFile
            .toFile(`./storage/info-hotspots/${uuid}.${format}`)
            .then((data) => {
              return data
            })
        }

        const infoHotspot = await db.infoHotspots.update({
          where: {
            id: id,
          },
          data: {
            direction: direction,
            type: type,
            title: title,
            description: description,
            image: imageUrl ? `/storage/info-hotspots/${uuid}.${imageUrl.format}` : null
          }
        })
      }
      else throw ""
      return { success: true }
    } 
    catch (error) {
      console.log({error})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },
}

const slipImageFace = async (
  file: Buffer, faceName: string, name: string, zoom: number, uuid: string,
  maxZoom: number
) => {
  const image = sharp(file)

  if (["d", "u"].findIndex(v => v == faceName) >= 0) {
    image.rotate(180)
  }

  let metadata = await image.metadata()
  let { width = 0, height = 0 } = metadata

  if (zoom < maxZoom) {
    image.resize(Math.round(width/Math.pow(2,maxZoom - zoom)), Math.round(height/Math.pow(2,maxZoom - zoom)))
  }

  let length = Math.pow(2,(zoom - 1)) 

  let distance = width / length

  if (zoom < maxZoom) {
    distance = +(width/Math.pow(2,maxZoom - zoom)) / length
  }

  for(let i = 0; i < length; i++) {
    for(let j = 0; j < length; j++) {

      if (!existsSync(`./storage/tiles/${uuid}/${zoom}/${faceName}/${i}`)) {
        mkdirSync(`./storage/tiles/${uuid}/${zoom}/${faceName}/${i}`, { recursive: true })
      }
      
      let temp = image.clone()

      await temp.extract({left: j * distance, top: i * distance, width: distance, height: distance })
        .jpeg({ quality: 80, force: true, mozjpeg: true })
        .toFile(`./storage/tiles/${uuid}/${zoom}/${faceName}/${i}/${j}.jpg`)
        .then((data: any) => {
          return data
        })
    }
  }
}

const mergeImagePreview = async(
  b: Buffer, d: Buffer, f: Buffer, l: Buffer, r: Buffer, u: Buffer, 
  name: string, uuid: string, maxZoom: number
) => {
  const imageB = sharp(b)
  const imageD = sharp(d)
  const imageF = sharp(f)
  const imageL = sharp(l)
  const imageR = sharp(r)
  const imageU = sharp(u)

  let metadata = await imageB.metadata()

  let { width = 0 } = metadata

  let imagePreview = imageB.clone()
  imagePreview.resize(width, width*6)

  // let imagePreview = sharp({
  //   create: {
  //     width: width,
  //     height: width * 6,
  //     channels: 4,
  //     background: { r: 255, g: 255, b: 255, alpha: 1 }
  //   }
  // })

  let imagePreviewBuffer = await imagePreview.composite([
    { input: await imageB.toBuffer(), left: 0, top: 0 },
    { input: await imageD.rotate(180).toBuffer(), left: 0, top: width },
    { input: await imageF.toBuffer(), left: 0, top: width * 2 },
    { input: await imageL.toBuffer(), left: 0, top: width * 3 },
    { input: await imageR.toBuffer(), left: 0, top: width * 4 },
    { input: await imageU.rotate(180).toBuffer(), left: 0, top: width * 5 },

  ]).toBuffer()

  let imagePreviewSave = sharp(imagePreviewBuffer).resize(Math.round(width/Math.pow(2, maxZoom)), Math.round(width*6 / Math.pow(2, maxZoom)))

  if (!existsSync(`./storage/tiles/${uuid}`)) {
    mkdirSync(`./storage/tiles/${uuid}`, { recursive: true })
  }

  await imagePreviewSave.jpeg({ quality: 80, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/preview.jpg`)
    .then((data: any) => {
      return data
    })
}