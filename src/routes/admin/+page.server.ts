import { fail } from '@sveltejs/kit';
// import pkg from 'jimp';
// const { read } = pkg;
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from "fs";
import sharp from "sharp";
import AdmZip from "adm-zip";
import {tmpdir} from 'os';
import path from 'path';
import { SAVE_TEMP } from '$env/static/private';

function tmpFile(p: string) {
  return path.join(tmpdir(),p);
}

let saveInTemp = SAVE_TEMP

const compress = {
  'png': {compressionLevel: 8, quality: 60},
  'jpeg': { quality: 60 },
  'webp': { quality: 60 },
  'gif': { }
}

export const actions = {
  split: async ({ cookies, request, url }) => {
    try {
      const data = await request.formData()
      
      let name = data.get('name') as string,
          zooms = data.getAll('zooms[]') as string[],
          b = data.get('b') as File,
          d = data.get('d') as File,
          f = data.get('f') as File,
          l = data.get('l') as File,
          r = data.get('r') as File,
          u = data.get('u') as File
      
      if (!saveInTemp && !existsSync('./storage')) {
        mkdirSync('./storage', { recursive: true });
      }

      let uuid = crypto.randomUUID()
      let maxZoom = zooms.length > 0 ? +zooms[zooms.length - 1] : 3

      for(let i = 0; i < zooms.length; i++) {
        await Promise.all([
          slipImageFace(b, "b", name, +zooms[i],uuid, maxZoom),
          slipImageFace(d, "d", name, +zooms[i],uuid, maxZoom),
          slipImageFace(f, "f", name, +zooms[i],uuid, maxZoom),
          slipImageFace(l, "l", name, +zooms[i],uuid, maxZoom),
          slipImageFace(r, "r", name, +zooms[i],uuid, maxZoom),
          slipImageFace(u, "u", name, +zooms[i],uuid, maxZoom),
        ])
      }
      await mergeImagePreview(b,d,f,l,r,u,name,uuid, maxZoom)

      // var zip = new AdmZip();
      // zip.addLocalFolder(`./storage/${uuid}/${name}`)
      // await zip.writeZipPromise(`./storage/${uuid}/${name}.zip`);

      let metadata = await sharp(await b.arrayBuffer()).metadata()
      let { size = 0, format } = metadata
      let tileSize = size / Math.pow(2,(maxZoom - 1))

      let jsText = `
      {
        "id": "${name}",
        "name": "${name}",
        "levels": [
          { "tileSize": ${tileSize/2}, "size": ${tileSize/2}, "fall backOnly": true },
          ${new Array(maxZoom).fill(0).map((v,i) => {
            return `\n{ "tileSize": ${tileSize}, "size": ${tileSize * Math.pow(2,i)} }`
          }).toString()}
        ],
        "faceSize": ${size*2},
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "linkHotspots": [],
      }`

      return { success: true, jsText, zip: `${uuid}--${name}` }
    }
    catch (e) {
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
          .jpeg({ quality: 60, force: true })
          .toFile(tmpFile(`${uuid}/${name}/${zoom}/${faceName}/${i}/${j}.${format}`))
          .then((data: any) => {
            console.log(data)
            return data
          })
      }
      else {
        await temp.extract({left: j * distance, top: i * distance, width: distance, height: distance })
          .jpeg({ quality: 60, force: true })
          .toFile(`./storage/${uuid}/${name}/${zoom}/${faceName}/${i}/${j}.${format}`)
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
    await imagePreview.jpeg({ quality: 60, force: true }).toFile(tmpFile(`${uuid}/${name}/preview.${format}`))
      .then((data: any) => {
        console.log(data)
        return data
      })
  }
  else {
    await imagePreview.jpeg({ quality: 60, force: true }).toFile(`./storage/${uuid}/${name}/preview.${format}`)
      .then((data: any) => {
        console.log(data)
        return data
      })
  }
}