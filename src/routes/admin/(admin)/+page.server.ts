export const ssr = false;

import { fail } from '@sveltejs/kit'
import * as fs from 'fs/promises'
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs"
import sharp from "sharp"
import AdmZip from "adm-zip"
import {tmpdir, type} from 'os'
import path from 'path'
import db from '$lib/server/prismadb.js'
import type { InfoHotspots, LinkHotspots, Scene } from '@prisma/client'
import { v4 } from 'uuid';
import { createCanvas, loadImage, ImageData } from "canvas";
import { renderFacePromise } from '$lib/admin/convertServer.js';

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
  const [scenes, groups] = await Promise.all([
    db.scene.findMany({
      include: {
        infoHotspots: true,
        linkHotspots: true
      },
      orderBy: {
        sort: 'asc'
      }
    }),
    db.groupScene.findMany()
  ])

  let scenesData: SceneDataType[] = scenes.map(v => {
    return {
      ...v,
      levels: JSON.parse(v.levels) as LevelsType,
      initialViewParameters: JSON.parse(v.initialViewParameters) as InitialViewParametersType,
    }
  })

  return { scenes: scenesData, groups }
}

export const actions = {
  addScene: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      let name = data.get('name') as string,
        slug = data.get('slug') as string,
        sort = data.get('sort') as string,
        image = data.get('image') as File,
        audio = data.get('audio') as File,
        groupId = data.get('groupId') as string,
        description = data.get('description') as string

      const imageSharp = sharp(await image.arrayBuffer(), { limitInputPixels: false })
      
      let { width: w = 0, height: h = 0} = await imageSharp.metadata()

      if (w / h != 2) {
        throw { errorText: "Ảnh equirectangular chuyển thành cube map phải có tỷ lệ 2:1"}
      }

      if (w >= 24576) {
        imageSharp.resize({width: 24576})
        w = 24576
        h = 12288
      }
      else if (w >= 20480) {
        imageSharp.resize({width: 20480})
        w = 20480
        h = 10240
      }
      else if (w >= 16384) {
        imageSharp.resize({width: 16384})
        w = 16384
        h = 8192
      }
      else if (w >= 12288) {
        imageSharp.resize({width: 12288})
        w = 12288
        h = 6144
      }
      else if (w >= 8192) {
        imageSharp.resize({width: 8192})
        w = 8192
        h = 4096
      }
      else if (w >= 4096) {
        imageSharp.resize({width: 4096})
        w = 4096
        h = 2048
      }
      else {
        throw {errorText: "Ảnh có kich thước quá bé"}
      }

      // if (h % 2 != 0) {
      //   imageSharp.resize({height: h - (h % 2)})
      //   h = h - (h % 2)
      //   w = h * 2
      // }

      const dataImage = await imageSharp.raw().ensureAlpha().toBuffer()
        .then((img) => {
          let imageData = new Uint8ClampedArray(img)
          return new ImageData(imageData, w, h)
        })

      // const dataImage = new ImageData(new Uint8ClampedArray(Buffer.from(await image.arrayBuffer())),w,h)

      let renderOptions = []

      for (let [faceName, position] of Object.entries(facePositions)) {
        const options = {
          // data: dataImage,
          face: faceName,
          rotation: Math.PI,
          interpolation: "linear",
        }
        renderOptions.push(options)
      }

      const images = await Promise.all(renderOptions.map(v => {
        return renderFacePromise({data: dataImage, ...v})
      }))

      // // image 360 to cube map
      // let images = await loadImage(Buffer.from(await image.arrayBuffer())).then(async (image) => {
      //   const { width, height } = image
      //   const canvas = createCanvas(width, height)
      //   console.log({width, height})
      //   const ctx = canvas.getContext('2d')
      //   ctx.drawImage(image, 0, 0, width, height)

      //   console.log("drawImage")
      
      //   const dataImage = await new Promise(res => res(ctx.getImageData(0, 0, width, height))) 

      //   console.log("getImageData")

      //   let renderOptions = []
    
      //   for (let [faceName, position] of Object.entries(facePositions)) {
      //     console.log({faceName})
      //     const options = {
      //       // data: dataImage,
      //       face: faceName,
      //       rotation: Math.PI,
      //       interpolation: "linear",
      //     }
      //     renderOptions.push(options)
      //   }

      //   const data = await Promise.all(renderOptions.map(v => {
      //     return renderFacePromise({data: dataImage, ...v})
      //   }))

      //   return data
      // })

      const findImage = (name: string) => images[Object.entries(facePositions).findIndex(v => v[1].name == name)]

      let b = findImage("b"),
          d = findImage("d"),
          f = findImage("f"),
          l = findImage("l"),
          r = findImage("r"),
          u = findImage("u")
      let uuid = v4()

      let metadata = await sharp(b).metadata()
      let width = Math.floor(metadata.width || 0)

      let maxZoom = Math.max(Math.floor(Math.log2(width) - 8),3)

      // save image tiles
      for(let i = 1; i <= maxZoom; i++) {
        await Promise.all([
          slipImageFace(b, "b", name, i, uuid, maxZoom),
          slipImageFace(d, "d", name, i, uuid, maxZoom),
          slipImageFace(f, "f", name, i, uuid, maxZoom),
          slipImageFace(l, "l", name, i, uuid, maxZoom),
          slipImageFace(r, "r", name, i, uuid, maxZoom),
          slipImageFace(u, "u", name, i, uuid, maxZoom),
        ])
      }
      await mergeImagePreview(b,d,f,l,r,u,name,uuid, maxZoom)
      await saveImageMobile(b,d,f,l,r,u,uuid)

      if (!existsSync(`./storage/tiles/${uuid}`)) {
        mkdirSync(`./storage/tiles/${uuid}`, { recursive: true })
      }
    
      //save image demo
      const imageDemo = await sharp(await image.arrayBuffer()).resize({ width: 1000 }).jpeg({ quality: 80, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/demo.jpg`)
        .then((data: any) => {
          return data
        })

      // save audio file
      let audioUrl = null
      if (audio && audio.size > 0) {
        let typeAduio = path.extname(audio.name)
        await fs.writeFile(`./storage/tiles/${uuid}/audio.${typeAduio}`, audio.stream() as any)
        audioUrl = `./storage/tiles/${uuid}/audio.${typeAduio}`
      }

      let tileSize = width / Math.pow(2,(maxZoom - 1))

      const scene = await db.scene.create({
        data: {
          id: uuid,
          name: name,
          slug: slug,
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
          audio: audioUrl,
          groupId: groupId != "null" ? groupId : null,
          sort: +sort
        }
      })

      return { success: true, scene }
    }
    catch(e: any) {
      console.log({e})
      return fail(400, { error: e.errorText || `Đã có lỗi xảy ra vui lòng thử lại sau` })
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
        slug = data.get('slug') as string,
        audio = data.get('audio') as File,
        oldAduio = data.get('oldAduio') as string,
        id = data.get('id') as string,
        groupId = data.get('groupId') as string,
        description = data.get('description') as string

      // save audio file
      let audioUrl = null
      if (audio && audio.size > 0) {
        let typeAduio = path.extname(audio.name)
        await fs.writeFile(`./storage/tiles/${id}/audio.${typeAduio}`, audio.stream() as any)
        audioUrl = `./storage/tiles/${id}/audio.${typeAduio}`
      }
      
      let dataUpdate: any = {
        name: name,
        description: description,
        slug: slug,
        groupId: groupId != "null" ? groupId : null
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

  updateInitialViewParametersScene: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      let initialViewParameters = data.get('initialViewParameters') as string,
        id = data.get('id') as string

      const scene = await db.scene.update({
        where: {
          id: id,
        },
        data: {
          initialViewParameters: initialViewParameters
        }
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
          video = data.get('video') as string,
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
        let videoUrl: string | null = null
        let uuid = v4()
        // if (image && image?.size > 0) {

        //   if (!existsSync(`./storage/info-hotspots`)) {
        //     mkdirSync(`./storage/info-hotspots`, { recursive: true })
        //   }

        //   let imageFile = sharp(await image.arrayBuffer())
        //   let { format } = await imageFile.metadata()
          
        //   imageUrl = await imageFile
        //     .toFile(`./storage/info-hotspots/${uuid}.${format}`)
        //     .then((data) => {
        //       return data
        //     })
        // }

        // if (video && video?.size > 0) {

        //   if (!existsSync(`./storage/info-hotspots`)) {
        //     mkdirSync(`./storage/info-hotspots`, { recursive: true })
        //   }

        //   let mimetype = path.extname(video.name)
          
        //   await fs.writeFile(`./storage/info-hotspots/${uuid}${mimetype}`, video.stream() as any)
        //   videoUrl = `/storage/info-hotspots/${uuid}${mimetype}`
        // }

        const infoHotspot = await db.infoHotspots.create({
          data: {
            sceneId: sceneId,
            yaw: +yaw,
            pitch: +pitch,
            direction: direction,
            type: type,
            title: title,
            description: description,
            // image: imageUrl ? `/storage/info-hotspots/${uuid}.${imageUrl.format}` : null,
            video: video
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
          video = data.get('video') as string,
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
            image: imageUrl ? `/storage/info-hotspots/${uuid}.${imageUrl.format}` : null,
            video: video
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
  let [width, height] = [Math.floor(metadata.width || 0), Math.floor(metadata.height || 0)]

  if (zoom < maxZoom) {
    image.resize(Math.floor(width/Math.pow(2,maxZoom - zoom)), Math.floor(height/Math.pow(2,maxZoom - zoom)))
  }

  let length = Math.pow(2,(zoom - 1)) 

  let distance = Math.floor(width / length)

  if (zoom < maxZoom) {
    distance = Math.floor((width/Math.pow(2,maxZoom - zoom)) / length)
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

  let width = Math.round(metadata.width || 0)

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

const saveImageMobile = async(
  b: Buffer, d: Buffer, f: Buffer, l: Buffer, r: Buffer, u: Buffer, 
  uuid: string
) => {
  const imageB = sharp(b)
  const imageD = sharp(d)
  const imageF = sharp(f)
  const imageL = sharp(l)
  const imageR = sharp(r)
  const imageU = sharp(u)

  let metadata = await imageB.metadata()

  let width = Math.round(metadata.width || 0)

  if (!existsSync(`./storage/tiles/${uuid}/mobile`)) {
    mkdirSync(`./storage/tiles/${uuid}/mobile`, { recursive: true })
  }

  let w = Math.round(width / 2)

  await Promise.all([
    imageB.resize(w, w).jpeg({ quality: 80, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/mobile/b.jpg`).then((data: any) => { return data }),
    imageD.rotate(180).resize(w, w).jpeg({ quality: 80, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/mobile/d.jpg`).then((data: any) => { return data }),
    imageF.resize(w, w).jpeg({ quality: 80, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/mobile/f.jpg`).then((data: any) => { return data }),
    imageL.resize(w, w).jpeg({ quality: 80, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/mobile/l.jpg`).then((data: any) => { return data }),
    imageR.resize(w, w).jpeg({ quality: 80, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/mobile/r.jpg`).then((data: any) => { return data }),
    imageU.rotate(180).resize(w, w).jpeg({ quality: 80, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/mobile/u.jpg`).then((data: any) => { return data }),
  ])

}