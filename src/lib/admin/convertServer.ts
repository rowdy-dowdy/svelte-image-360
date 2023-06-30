import { ImageData, createCanvas } from "canvas";
import sharp from "sharp";

function clamp(x: number, min: number, max: number) {
  return Math.min(max, Math.max(x, min));
}

function mod(x: number, n: number) {
  return ((x % n) + n) % n;
}

function copyPixelNearest(read: any, write: any) {
  const {width, height, data} = read;
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  return (xFrom: number, yFrom: number, to: any) => {

    const nearest = readIndex(
      clamp(Math.round(xFrom), 0, width - 1),
      clamp(Math.round(yFrom), 0, height - 1)
    );

    for (let channel = 0; channel < 3; channel++) {
      write.data[to + channel] = data[nearest + channel];
    }
  };
}

function copyPixelBilinear(read: any, write: any) {
  const {width, height, data} = read;
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  return (xFrom: number, yFrom: number, to: any) => {
    const xl = clamp(Math.floor(xFrom), 0, width - 1);
    const xr = clamp(Math.ceil(xFrom), 0, width - 1);
    const xf = xFrom - xl;

    const yl = clamp(Math.floor(yFrom), 0, height - 1);
    const yr = clamp(Math.ceil(yFrom), 0, height - 1);
    const yf = yFrom - yl;

    const p00 = readIndex(xl, yl);
    const p10 = readIndex(xr ,yl);
    const p01 = readIndex(xl, yr);
    const p11 = readIndex(xr, yr);

    for (let channel = 0; channel < 3; channel++) {
      const p0 = data[p00 + channel] * (1 - xf) + data[p10 + channel] * xf;
      const p1 = data[p01 + channel] * (1 - xf) + data[p11 + channel] * xf;
      write.data[to + channel] = Math.ceil(p0 * (1 - yf) + p1 * yf);
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

export function renderFace({data: readData, face, rotation, interpolation, maxWidth = Infinity} : any): ImageData {
  const faceWidth = Math.min(maxWidth, readData.width / 4);
  const faceHeight = faceWidth;

  const cube: any = {};
  const orientation = (orientations as any)[face];

  // const canvas = createCanvas(faceWidth, faceHeight)
  // const ctx = canvas.getContext('2d')
  // const writeData = ctx.getImageData(0, 0, faceWidth, faceHeight)

  const writeData = new ImageData(faceWidth, faceHeight)

  const copyPixel =
    interpolation === 'linear' ? copyPixelBilinear(readData, writeData) :
    interpolation === 'cubic' ? copyPixelBicubic(readData, writeData) :
    interpolation === 'lanczos' ? copyPixelLanczos(readData, writeData) :
    copyPixelNearest(readData, writeData);

  for (let x = 0; x < faceWidth; x++) {
    for (let y = 0; y < faceHeight; y++) {
      const to = 4 * (y * faceWidth + x);

      // fill alpha channel
      writeData.data[to + 3] = 255;

      // get position on cube face
      // cube is centered at the origin with a side length of 2
      orientation(cube, (2 * (x + 0.5) / faceWidth - 1), (2 * (y + 0.5) / faceHeight - 1));

      // project cube face onto unit sphere by converting cartesian to spherical coordinates
      const r = Math.sqrt(cube.x*cube.x + cube.y*cube.y + cube.z*cube.z);
      const lon = mod(Math.atan2(cube.y, cube.x) + rotation, 2 * Math.PI);
      const lat = Math.acos(cube.z / r);

      copyPixel(readData.width * lon / Math.PI / 2 - 0.5, readData.height * lat / Math.PI - 0.5, to);
    }
  }

  return writeData
}

export function renderFacePromise({data: readData, face, rotation, interpolation, maxWidth = Infinity} : any): Promise<ImageData> {
  return new Promise(res => {
    console.log({face})
    const faceWidth = Math.min(maxWidth, readData.width / 4);
    const faceHeight = faceWidth;
  
    const cube: any = {};
    const orientation = (orientations as any)[face];
  
    // const canvas = createCanvas(faceWidth, faceHeight)
    // const ctx = canvas.getContext('2d')
    // const writeData = ctx.getImageData(0, 0, faceWidth, faceHeight)
  
    const writeData = new ImageData(faceWidth, faceHeight)

    const copyPixel =
      interpolation === 'linear' ? copyPixelBilinear(readData, writeData) :
      interpolation === 'cubic' ? copyPixelBicubic(readData, writeData) :
      interpolation === 'lanczos' ? copyPixelLanczos(readData, writeData) :
      copyPixelNearest(readData, writeData);
  
    for (let x = 0; x < faceWidth; x++) {
      for (let y = 0; y < faceHeight; y++) {
        const to = 4 * (y * faceWidth + x);
  
        // fill alpha channel
        writeData.data[to + 3] = 255;
  
        // get position on cube face
        // cube is centered at the origin with a side length of 2
        orientation(cube, (2 * (x + 0.5) / faceWidth - 1), (2 * (y + 0.5) / faceHeight - 1));
  
        // project cube face onto unit sphere by converting cartesian to spherical coordinates
        const r = Math.sqrt(cube.x*cube.x + cube.y*cube.y + cube.z*cube.z);
        const lon = mod(Math.atan2(cube.y, cube.x) + rotation, 2 * Math.PI);
        const lat = Math.acos(cube.z / r);
  
        copyPixel(readData.width * lon / Math.PI / 2 - 0.5, readData.height * lat / Math.PI - 0.5, to);
      }
    }
  
    res(writeData)
  })
}

export function getDataURL(imgData: ImageData) {
  const canvas = createCanvas(200,200);
  const ctx = canvas.getContext('2d')

  canvas.width = imgData.width
  canvas.height = imgData.height
  ctx?.putImageData(imgData, 0, 0)
  // return canvas.toDataURL('image/jpeg', 0.92)
  return canvas.toBuffer()
}

export function convertEquirectangularToCubeMap(equirectangularImage: ImageData) {
  const equirectangularWidth = equirectangularImage.width;
  const equirectangularHeight = equirectangularImage.height;

  // Calculate dimensions for each face
  const faceWidth = equirectangularWidth / 6;
  const faceHeight = faceWidth / 2;

  // Create a canvas element for the cube map
  // const cubeMapCanvas = document.createElement('canvas');
  // cubeMapCanvas.width = faceWidth * 4;
  // cubeMapCanvas.height = faceHeight * 3;
  const cubeMapCanvas = createCanvas(200,200);
  
  cubeMapCanvas.width = faceWidth * 4;
  cubeMapCanvas.height = faceHeight * 3;

  // Get the 2D rendering context of the canvas
  const ctx = cubeMapCanvas.getContext('2d');

  // Map pixels from equirectangular to cube map
  for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
    const xOffset = faceIndex * faceWidth;
    console.log(1)

    for (let y = 0; y < faceHeight; y++) {
      for (let x = 0; x < faceWidth; x++) {
        // Calculate the corresponding position in the equirectangular image
        const u = (x + xOffset) / equirectangularWidth;
        const v = y / equirectangularHeight;
        // Get the color from the equirectangular image using bilinear interpolation
        const color = getBilinearInterpolatedColor(equirectangularImage, u, v);
        // Set the color on the cube map canvas
        ctx.fillStyle = color;
        ctx.fillRect(x + xOffset, y, 1, 1);
      }
    }
  }

  return {a: 1}

  return {
    f: ctx.getImageData(0, 0, faceWidth, faceHeight)
  }

  // Return the cube map canvas
  return cubeMapCanvas;
}

function getBilinearInterpolatedColor(image: ImageData, u: number, v: number) {
  const x = u * (image.width - 1);
  const y = v * (image.height - 1);

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.ceil(x);
  const y1 = Math.ceil(y);

  const colorTopLeft = getPixelColor(image, x0, y0);
  const colorTopRight = getPixelColor(image, x1, y0);
  const colorBottomLeft = getPixelColor(image, x0, y1);
  const colorBottomRight = getPixelColor(image, x1, y1);

  const horizontalBlend = x - x0;
  const verticalBlend = y - y0;

  const topBlend = interpolateColor(colorTopLeft, colorTopRight, horizontalBlend);
  const bottomBlend = interpolateColor(colorBottomLeft, colorBottomRight, horizontalBlend);

  return interpolateColor(topBlend, bottomBlend, verticalBlend);
}

function getPixelColor(image: ImageData, x: number, y: number) {
  const pixelIndex = (y * image.width + x) * 4;
  const r = image.data[pixelIndex];
  const g = image.data[pixelIndex + 1];
  const b = image.data[pixelIndex + 2];
  const a = image.data[pixelIndex + 3];

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function interpolateColor(color1: any, color2: any, t: any) {
  const rgba1 = color1.match(/\d+/g).map(Number);
  const rgba2 = color2.match(/\d+/g).map(Number);

  const r = Math.round(lerp(rgba1[0], rgba2[0], t));
  const g = Math.round(lerp(rgba1[1], rgba2[1], t));
  const b = Math.round(lerp(rgba1[2], rgba2[2], t));
  const a = Math.round(lerp(rgba1[3], rgba2[3], t));

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

export async function convertEquirectangularToCubeMap2(equirectangularImageBuffer: Buffer, equirectangularWidth: number, equirectangularHeight: number) {
  // Calculate dimensions for each face
  const faceWidth = Math.floor(equirectangularWidth / 6)
  const faceHeight = Math.floor(faceWidth / 2)
  // loadImageFromBuffer
  // Create a buffer for the cube map
  // const cubeMapBuffer = Buffer.alloc(faceWidth * faceHeight * 4 * 6);
  // console.log(faceWidth, faceHeight)
  // const cubeMapBuffer = await sharp({
  //   create: {
  //     width: 5,
  //     height: 5,
  //     channels: 4,
  //     background: { r: 0, g: 0, b: 0, alpha: 1 },
  //   },
  // }).png().toBuffer()

  const input = Uint8Array.from([255, 255, 255, 0, 0, 0]);
  const cubeMapBuffer = await sharp(input, {
    // because the input does not contain its dimensions or how many channels it has
    // we need to specify it in the constructor options
    raw: {
      width: 2,
      height: 1,
      channels: 3
    }
  });

  await cubeMapBuffer.toFile('./storage/my-two-pixels.png');

  return await cubeMapBuffer.png().toBuffer()

  console.log(equirectangularWidth, equirectangularHeight)

  // Map pixels from equirectangular to cube map
  for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
    const xOffset = faceIndex * faceWidth;
    const faceBufferOffset = faceIndex * faceWidth * faceHeight * 4;
    console.log(faceIndex)

    for (let y = 0; y < faceHeight; y++) {
      for (let x = 0; x < faceWidth; x++) {
        // Calculate the corresponding position in the equirectangular image
        const u = (x + xOffset) / equirectangularWidth;
        const v = y / equirectangularHeight;

        // Get the color from the equirectangular image using bilinear interpolation
        const color = getBilinearInterpolatedColor3(equirectangularImageBuffer, equirectangularWidth, equirectangularHeight, u, v);

        // Set the color in the cube map buffer
        const bufferOffset = faceBufferOffset + (y * faceWidth + x) * 4;
        // cubeMapBuffer[bufferOffset] = color[0];
        // cubeMapBuffer[bufferOffset + 1] = color[1];
        // cubeMapBuffer[bufferOffset + 2] = color[2];
        // cubeMapBuffer[bufferOffset + 3] = color[3];
        cubeMapBuffer[bufferOffset] = 255;
        cubeMapBuffer[bufferOffset + 1] = 255;
        cubeMapBuffer[bufferOffset + 2] = 255;
        cubeMapBuffer[bufferOffset + 3] = 255;
      }
    }
  }

  // Return the cube map buffer
  return cubeMapBuffer;
}

function getBilinearInterpolatedColor3(imageBuffer: any, imageWidth: any, imageHeight: any, u: any, v: any) {
  const x = Math.floor(u * (imageWidth - 1));
  const y = Math.floor(v * (imageHeight - 1));
  const xWeight = u * (imageWidth - 1) - x;
  const yWeight = v * (imageHeight - 1) - y;

  const index = (y * imageWidth + x) * 4;
  const indexRight = index + 4;
  const indexBottom = index + imageWidth * 4;
  const indexBottomRight = indexBottom + 4;

  const colorTopLeft = [
    imageBuffer[index],
    imageBuffer[index + 1],
    imageBuffer[index + 2],
    imageBuffer[index + 3]
  ];
  const colorTopRight = [
    imageBuffer[indexRight],
    imageBuffer[indexRight + 1],
    imageBuffer[indexRight + 2],
    imageBuffer[indexRight + 3]
  ];
  const colorBottomLeft = [
    imageBuffer[indexBottom],
    imageBuffer[indexBottom + 1],
    imageBuffer[indexBottom + 2],
    imageBuffer[indexBottom + 3]
  ];
  const colorBottomRight = [
    imageBuffer[indexBottomRight],
    imageBuffer[indexBottomRight + 1],
    imageBuffer[indexBottomRight + 2],
    imageBuffer[indexBottomRight + 3]
  ];

  const color = [
    (1 - xWeight) * (1 - yWeight) * colorTopLeft[0] + xWeight * (1 - yWeight) * colorTopRight[0] +
    (1 - xWeight) * yWeight * colorBottomLeft[0] + xWeight * yWeight * colorBottomRight[0],
    (1 - xWeight) * (1 - yWeight) * colorTopLeft[1] + xWeight * (1 - yWeight) * colorTopRight[1] +
    (1 - xWeight) * yWeight * colorBottomLeft[1] + xWeight * yWeight * colorBottomRight[1],
    (1 - xWeight) * (1 - yWeight) * colorTopLeft[2] + xWeight * (1 - yWeight) * colorTopRight[2] +
    (1 - xWeight) * yWeight * colorBottomLeft[2] + xWeight * yWeight * colorBottomRight[2],
    (1 - xWeight) * (1 - yWeight) * colorTopLeft[3] + xWeight * (1 - yWeight) * colorTopRight[3] +
    (1 - xWeight) * yWeight * colorBottomLeft[3] + xWeight * yWeight * colorBottomRight[3]
  ];

  return color;
}

function getBilinearInterpolatedColor2(imageBuffer: any, imageWidth: any, imageHeight: any, u: any, v: any) {
  const x = u * (imageWidth - 1);
  const y = v * (imageHeight - 1);

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.ceil(x);
  const y1 = Math.ceil(y);

  const colorTopLeft = getPixelColor2(imageBuffer, imageWidth, x0, y0);
  const colorTopRight = getPixelColor2(imageBuffer, imageWidth, x1, y0);
  const colorBottomLeft = getPixelColor2(imageBuffer, imageWidth, x0, y1);
  const colorBottomRight = getPixelColor2(imageBuffer, imageWidth, x1, y1);

  const horizontalBlend = x - x0;
  const verticalBlend = y - y0;

  const topBlend = interpolateColor2(colorTopLeft, colorTopRight, horizontalBlend);
  const bottomBlend = interpolateColor2(colorBottomLeft, colorBottomRight, horizontalBlend);

  return interpolateColor2(topBlend, bottomBlend, verticalBlend);
}

function interpolateColor2(color1: any, color2: any, t: any) {
  const r = Math.round(lerp(color1[0], color2[0], t));
  const g = Math.round(lerp(color1[1], color2[1], t));
  const b = Math.round(lerp(color1[2], color2[2], t));
  const a = Math.round(lerp(color1[3], color2[3], t));

  return [r, g, b, a];
}

function getPixelColor2(imageBuffer: any, imageWidth: any, x: any, y: any) {
  const pixelIndex = (y * imageWidth + x) * 4;
  const r = imageBuffer[pixelIndex];
  const g = imageBuffer[pixelIndex + 1];
  const b = imageBuffer[pixelIndex + 2];
  const a = imageBuffer[pixelIndex + 3];

  return [r, g, b, a];
}