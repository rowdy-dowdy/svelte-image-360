import { fail } from '@sveltejs/kit';
import pkg from 'jimp';
const { read } = pkg;
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from "fs";
import AdmZip from "adm-zip";
import {tmpdir} from 'os';
import path from 'path';

function tmpFile(p: string) {
  return path.join(tmpdir(),p);
}

let saveInTemp = false

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

      let type = b.name.split('.')[1]
      let image = await read(Buffer.from(await b.arrayBuffer()))
      let size = image.bitmap.width
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
        "type": "${type}",
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
  const image = await read(Buffer.from(await file.arrayBuffer()))

  let w = image.bitmap.width;
  let h = image.bitmap.height;

  if (zoom < maxZoom) {
    image.resize(+(w/Math.pow(2,maxZoom - zoom)), +(h/Math.pow(2,maxZoom - zoom)))
  }

  let type = file.name.split('.')[1]

  let length = Math.pow(2,(zoom - 1)) 

  let distance = w / length

  if (zoom < maxZoom) {
    distance = +(w/Math.pow(2,maxZoom - zoom)) / length
  }

  for(let i = 0; i < length; i++) {
    for(let j = 0; j < length; j++) {
      let temp = image.clone()
      if (saveInTemp) {
        await temp.crop(j * distance, i * distance, distance, distance)
        .writeAsync(tmpFile(`${uuid}/${name}/${zoom}/${faceName}/${i}/${j}.${type}`))
      }
      else {
        await temp.crop(j * distance, i * distance, distance, distance)
          .writeAsync(`./storage/${uuid}/${name}/${zoom}/${faceName}/${i}/${j}.${type}`)
      }
    }
  }
}

const mergeImagePreview = async(
  b: File, d: File, f: File, l: File, r: File, u: File, 
  name: string, uuid: string, maxZoom: number
) => {
  const imageB = await read(Buffer.from(await b.arrayBuffer()))
  const imageD = await read(Buffer.from(await d.arrayBuffer()))
  const imageF = await read(Buffer.from(await f.arrayBuffer()))
  const imageL = await read(Buffer.from(await l.arrayBuffer()))
  const imageR = await read(Buffer.from(await r.arrayBuffer()))
  const imageU = await read(Buffer.from(await u.arrayBuffer()))

  let distance = imageB.bitmap.width
  let type = b.name.split('.')[1]

  let imagePreview = imageB.clone()
  imagePreview.resize(distance, distance*6)

  imagePreview.blit(imageB,0,0)
  imagePreview.blit(imageD, 0, distance)
  imagePreview.blit(imageF, 0, distance * 2)
  imagePreview.blit(imageL, 0, distance * 3)
  imagePreview.blit(imageR, 0, distance * 4)
  imagePreview.blit(imageU, 0, distance * 5)

  imagePreview.resize(distance/Math.pow(2, maxZoom), distance*6 / Math.pow(2, maxZoom))

  if (saveInTemp) {
    await imagePreview.writeAsync(tmpFile(`${uuid}/${name}/preview.${type}`))
  }
  else {
    await imagePreview.writeAsync(`./storage/${uuid}/${name}/preview.${type}`)
  }
}