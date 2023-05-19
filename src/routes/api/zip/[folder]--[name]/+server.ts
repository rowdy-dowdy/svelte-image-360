import { error } from '@sveltejs/kit';
import type { RequestHandler } from "./$types";
import { json } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync, createReadStream } from "fs";
import AdmZip from "adm-zip";
import {tmpdir} from 'os';
import path from 'path';
import { SAVE_TEMP } from '$env/static/private';

function tmpFile(p: string) {
  return path.join(tmpdir(),p);
}

let saveInTemp = SAVE_TEMP

export const GET: RequestHandler = async ({ params, request, cookies }) => {
  let filepath = './storage/' + params.folder + '/' + params.name
  if (saveInTemp) {
    filepath = tmpFile(params.folder + '/' + params.name)
  }

  if (!existsSync(filepath)){
    throw error(404, 'Not found');
  }

  var zip = new AdmZip();
  zip.addLocalFolder(filepath)

  const file_stream = zip.toBuffer()

  return new Response(file_stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachement; filename=${params.name}.zip`
    },
  })
}