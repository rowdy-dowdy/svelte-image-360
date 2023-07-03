import fs from 'fs'
import { createCanvas, loadImage } from 'canvas'
import sharp from "sharp";

export const load = async () => {
  await new Promise(res => setTimeout(_ => res(1), 1000))
  return {}
}

const facePositions = {
  pz: {x: 1, y: 1, name: 'b'},
  nz: {x: 3, y: 1, name: 'f'},
  px: {x: 2, y: 1, name: 'l'},
  nx: {x: 0, y: 1, name: 'r'},
  py: {x: 1, y: 0, name: 'u'},
  ny: {x: 1, y: 2, name: 'd'}
}

export const actions = {
  change: async ({ cookies, request, url }) => {
    const data = await request.formData()
    const image = data.get('image') as File
    const imageSharp = sharp(await image.arrayBuffer(), { limitInputPixels: false })
      
    let { width: w = 0, height: h = 0} = await imageSharp.metadata()

    let renderOptions = []

    const dataImage = imageSharp.raw().ensureAlpha().toBuffer()

    for (let [faceName, position] of Object.entries(facePositions)) {
      const options = {
        // data: dataImage,
        face: faceName,
        rotation: Math.PI,
        width: w,
        height: h,
        interpolation: "linear",
      }
      renderOptions.push(options)
    }

    const images = await Promise.all(renderOptions.map(v => {
      return renderFacePromise({data: dataImage, ...v})
    }))

    const findImage = (name: string) => images[Object.entries(facePositions).findIndex(v => v[1].name == name)]

    let b = findImage("b"),
        d = findImage("d"),
        f = findImage("f"),
        l = findImage("l"),
        r = findImage("r"),
        u = findImage("u")

    const faceWidth = Math.min(w, h / 4);
    const faceHeight = faceWidth;

    for(let i = 0; i < images.length; i++) {
      await sharp(images[i], {
        // because the input does not contain its dimensions or how many channels it has
        // we need to specify it in the constructor options
        raw: {
          width: faceWidth,
          height: faceHeight,
          channels: 4
        }
      }).toFile(`./storage/${i}.png`);
    }

    console.log('end')

    return {}
  }
}
 
function clamp(x: number, min: number, max: number) {
  return Math.min(max, Math.max(x, min));
}

function mod(x: number, n: number) {
  return ((x % n) + n) % n;
}

function copyPixelNearest(read: any, write: any, width: any, height: any) {
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  return (xFrom: number, yFrom: number, to: any) => {

    const nearest = readIndex(
      clamp(Math.round(xFrom), 0, width - 1),
      clamp(Math.round(yFrom), 0, height - 1)
    );

    for (let channel = 0; channel < 3; channel++) {
      write[to + channel] = read[nearest + channel];
    }
  };
}

function copyPixelBilinear(readData: any, writeData: any, width: any, height: any) {
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  return (xFrom: any, yFrom: any, to: any) => {
    const xl = clamp(Math.floor(xFrom), 0, width - 1);
    const xr = clamp(Math.ceil(xFrom), 0, width - 1);
    const xf = xFrom - xl;

    const yl = clamp(Math.floor(yFrom), 0, height - 1);
    const yr = clamp(Math.ceil(yFrom), 0, height - 1);
    const yf = yFrom - yl;

    const p00 = readIndex(xl, yl);
    const p10 = readIndex(xr, yl);
    const p01 = readIndex(xl, yr);
    const p11 = readIndex(xr, yr);

    for (let channel = 0; channel < 3; channel++) {
      const p0 = readData[p00 + channel] * (1 - xf) + readData[p10 + channel] * xf;
      const p1 = readData[p01 + channel] * (1 - xf) + readData[p11 + channel] * xf;
      writeData[to + channel] = 255 || Math.ceil(p0 * (1 - yf) + p1 * yf);
    }
  };
}

// performs a discrete convolution with a provided kernel
function kernelResample(read: any, write: any, filterSize: number, kernel: any) {
  const {width, height, data} = read;
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  const twoFilterSize = 2*filterSize;
  const xMax = width - 1;
  const yMax = height - 1;
  const xKernel = new Array(4);
  const yKernel = new Array(4);

  return (xFrom: number, yFrom: number, to: any) => {
    const xl = Math.floor(xFrom);
    const yl = Math.floor(yFrom);
    const xStart = xl - filterSize + 1;
    const yStart = yl - filterSize + 1;

    for (let i = 0; i < twoFilterSize; i++) {
      xKernel[i] = kernel(xFrom - (xStart + i));
      yKernel[i] = kernel(yFrom - (yStart + i));
    }

    for (let channel = 0; channel < 3; channel++) {
      let q = 0;

      for (let i = 0; i < twoFilterSize; i++) {
        const y = yStart + i;
        const yClamped = clamp(y, 0, yMax);
        let p = 0;
        for (let j = 0; j < twoFilterSize; j++) {
          const x = xStart + j;
          const index = readIndex(clamp(x, 0, xMax), yClamped);
          p += data[index + channel] * xKernel[j];

        }
        q += p * yKernel[i];
      }

      write.data[to + channel] = Math.round(q);
    }
  };
}

function copyPixelBicubic(read: any, write: any) {
  const b = -0.5;
  const kernel = (x: number) => {
    x = Math.abs(x);
    const x2 = x*x;
    const x3 = x*x*x;
    return x <= 1 ?
      (b + 2)*x3 - (b + 3)*x2 + 1 :
      b*x3 - 5*b*x2 + 8*b*x - 4*b;
  };

  return kernelResample(read, write, 2, kernel);
}

function copyPixelLanczos(read: any, write: any) {
  const filterSize = 5;
  const kernel = (x: number) => {
    if (x === 0) {
      return 1;
    }
    else {
      const xp = Math.PI * x;
      return filterSize * Math.sin(xp) * Math.sin(xp / filterSize) / (xp * xp);
    }
  };

  return kernelResample(read, write, filterSize, kernel);
}

const orientations = {
  pz: (out: any, x: number, y: number) => {
    out.x = -1;
    out.y = -x;
    out.z = -y;
  },
  nz: (out: any, x: number, y: number) => {
    out.x = 1;
    out.y = x;
    out.z = -y;
  },
  px: (out: any, x: number, y: number) => {
    out.x = x;
    out.y = -1;
    out.z = -y;
  },
  nx: (out: any, x: number, y: number) => {
    out.x = -x;
    out.y = 1;
    out.z = -y;
  },
  py: (out: any, x: number, y: number) => {
    out.x = -y;
    out.y = -x;
    out.z = 1;
  },
  ny: (out: any, x: number, y: number) => {
    out.x = y;
    out.y = -x;
    out.z = -1;
  }
};

function renderFacePromise({data: readData, width, height, face, rotation, interpolation, maxWidth = Infinity} : any): Promise<Uint8Array> {
  return new Promise(res => {
    const faceWidth = Math.min(maxWidth, width / 4);
    const faceHeight = faceWidth;

    const cube: any = {};
    const orientation = (orientations as any)[face];

    const writeData = new Uint8Array(faceWidth * faceHeight * 4)

    const copyPixel =
      interpolation === 'linear' ? copyPixelBilinear(readData, writeData, width, height) :
      interpolation === 'cubic' ? copyPixelBicubic(readData, writeData) :
      interpolation === 'lanczos' ? copyPixelLanczos(readData, writeData) :
      copyPixelNearest(readData, writeData, width, height);

    for (let x = 0; x < faceWidth; x++) {
      for (let y = 0; y < faceHeight; y++) {
        const to = 4 * (y * faceWidth + x);

        // fill alpha channel
        writeData[to + 3] = 255;

        // get position on cube face
        // cube is centered at the origin with a side length of 2
        orientation(cube, (2 * (x + 0.5) / faceWidth - 1), (2 * (y + 0.5) / faceHeight - 1));
        

        // project cube face onto unit sphere by converting cartesian to spherical coordinates
        const r = Math.sqrt(cube.x*cube.x + cube.y*cube.y + cube.z*cube.z);
        const lon = mod(Math.atan2(cube.y, cube.x) + rotation, 2 * Math.PI);
        const lat = Math.acos(cube.z / r);

        copyPixel(width * lon / Math.PI / 2 - 0.5, height * lat / Math.PI - 0.5, to);
      }
    }

    res(writeData)

    // res(writeData)
  })
}