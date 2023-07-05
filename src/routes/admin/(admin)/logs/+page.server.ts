import fs from 'fs'
import { createCanvas, loadImage } from 'canvas'
import sharp from "sharp";

export const load = async () => {
  
  return {}
}

export const actions = {
  addEdit: async ({ cookies, request, url }) => {
    const data = await request.formData()
    const image = data.get('image') as File
    
    return {}
  },

  delete: async ({ cookies, request, url }) => {
    return {}
  },
}