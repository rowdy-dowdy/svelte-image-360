import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { existsSync, mkdirSync } from "fs";
import sharp from "sharp";
import { v4 } from "uuid";

export const POST = (async ({ request }) => {
  const data = await request.formData()
  const file = data.get('file') as File

  if (!existsSync('./storage')){
    mkdirSync('./storage', { recursive: true });
  }

  const compress = {
    'png': {compressionLevel: 8, quality: 60},
    'jpeg': { quality: 60 },
    'webp': { quality: 60 },
    'gif': { }
  }
   
  // let fileData = sharp(fileMin)
  let fileData = sharp(await file.arrayBuffer(), { animated: true })
  
  let metadata = await fileData.metadata()
  
  let name = v4() + "." + metadata.format
  let fileUrl = `./storage/images/${name}`

  if (Object.keys(compress).findIndex(v => v == metadata.format) < 0) {
    throw "Không phải định dạng ảnh"
  }

  //@ts-ignore
  let fileSave = await fileData[metadata.format || "png"](compress[metadata.format || "png"]).toFile(fileUrl)
    .then((data: any) => {
      console.log(data)
      return data
    })

  let { format, size, width, height } = fileSave

  return json({ location: fileUrl.slice(1) })
}) satisfies RequestHandler;