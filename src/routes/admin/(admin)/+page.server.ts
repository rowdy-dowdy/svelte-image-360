import { fail } from '@sveltejs/kit'
import * as fs from 'fs/promises'
import { existsSync, mkdirSync } from "fs"
import sharp from "sharp"
import AdmZip from "adm-zip"
import {tmpdir} from 'os'
import path from 'path'
import { SAVE_TEMP } from '$env/static/private'
import { renderFace } from '$lib/admin/convert.js'

function tmpFile(p: string) {
  return path.join(tmpdir(),p)
}

let saveInTemp = SAVE_TEMP == "true"

const compress = {
  'png': {compressionLevel: 8, quality: 60},
  'jpeg': { quality: 60 },
  'webp': { quality: 60 },
  'gif': { }
}

const facePositions = {
  pz: {x: 1, y: 1},
  nz: {x: 3, y: 1},
  px: {x: 2, y: 1},
  nx: {x: 0, y: 1},
  py: {x: 1, y: 0},
  ny: {x: 1, y: 2}
}

export const actions = {
  split: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      
      let name = data.get('title') as string,
          b = data.get('b') as File,
          d = data.get('d') as File,
          f = data.get('f') as File,
          l = data.get('l') as File,
          r = data.get('r') as File,
          u = data.get('u') as File

      await sharp(await (data.get('image') as File).arrayBuffer()).toFile('./storage/tiles/fasdf.png')
      .then((data: any) => {
        console.log(data)
        return data
      })

      return { success: true }
      
      if (!saveInTemp && !existsSync('./storage')) {
        mkdirSync('./storage', { recursive: true })
      }

      let uuid = crypto.randomUUID()

      let metadata = await sharp(await b.arrayBuffer()).metadata()
      let { size = 0, format, width } = metadata

      console.log(1)

      let maxZoom = Math.max(Math.floor(Math.log2(width!) - 8),3)

      console.log(2)

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

      let tileSize = size / Math.pow(2,(maxZoom - 1))

      return { success: true, zip: `${uuid}--${name}` }
    }
    catch (e) {
      console.log({e})
      return fail(400, { error: `Đã có lỗi xảy ra vui lòng thử lại sau` })
    }
  },
}

const slipImageFace = async (
  file: File, faceName: string, name: string, zoom: number, uuid: string,
  maxZoom: number
) => {
  const image = sharp(await file.arrayBuffer())

  if (["d", "u"].findIndex(v => v == faceName) >= 0) {
    image.rotate(180)
  }

  let metadata = await image.metadata()
  let { width = 0, height = 0, format } = metadata

  if (zoom < maxZoom) {
    image.resize(+(width/Math.pow(2,maxZoom - zoom)), +(height/Math.pow(2,maxZoom - zoom)))
  }

  let length = Math.pow(2,(zoom - 1)) 

  let distance = width / length

  if (zoom < maxZoom) {
    distance = +(width/Math.pow(2,maxZoom - zoom)) / length
  }

  for(let i = 0; i < length; i++) {
    for(let j = 0; j < length; j++) {
      let temp = image.clone()
      if (saveInTemp) {
        await temp.extract({left: j * distance, top: i * distance, width: distance, height: distance})
          .jpeg({ quality: 60, force: true, mozjpeg: true })
          .toFile(tmpFile(`${uuid}/${name}/${zoom}/${faceName}/${i}/${j}.${format}`))
          .then((data: any) => {
            console.log(data)
            return data
          })
      }
      else {
        await temp.extract({left: j * distance, top: i * distance, width: distance, height: distance })
          .jpeg({ quality: 60, force: true, mozjpeg: true })
          .toFile(`./storage/tiles/${uuid}/${name}/${zoom}/${faceName}/${i}/${j}.${format}`)
          .then((data: any) => {
            console.log(data)
            return data
          })
      }
    }
  }
}

const mergeImagePreview = async(
  b: File, d: File, f: File, l: File, r: File, u: File, 
  name: string, uuid: string, maxZoom: number
) => {
  const imageB = await sharp(await b.arrayBuffer())
  const imageD = await sharp(await d.arrayBuffer())
  const imageF = await sharp(await f.arrayBuffer())
  const imageL = await sharp(await l.arrayBuffer())
  const imageR = await sharp(await r.arrayBuffer())
  const imageU = await sharp(await u.arrayBuffer())

  let metadata = await imageB.metadata()

  let { width = 0, format } = metadata

  let imagePreview = imageB.clone()
  // imagePreview.resize(width, width*6)

  imagePreview.composite([
    // { input: await imageB.toBuffer(), left: 0, top: 0 },
    { input: await imageD.rotate(180).toBuffer(), left: 0, top: width },
    { input: await imageF.toBuffer(), left: 0, top: width * 2 },
    { input: await imageL.toBuffer(), left: 0, top: width * 3 },
    { input: await imageR.toBuffer(), left: 0, top: width * 4 },
    { input: await imageU.rotate(180).toBuffer(), left: 0, top: width * 5 },

  ])

  imagePreview.resize(width/Math.pow(2, maxZoom), width*6 / Math.pow(2, maxZoom))

  if (saveInTemp) {
    await imagePreview.jpeg({ quality: 60, force: true, mozjpeg: true }).toFile(tmpFile(`${uuid}/${name}/preview.${format}`))
      .then((data: any) => {
        console.log(data)
        return data
      })
  }
  else {
    await imagePreview.jpeg({ quality: 60, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/${name}/preview.${format}`)
      .then((data: any) => {
        console.log(data)
        return data
      })
  }
}