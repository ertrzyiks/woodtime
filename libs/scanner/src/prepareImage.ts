import otsu from 'otsu'

const getColorIndicesForCoord = (x: number, y: number, width: number) => {
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
}

const posToIndex = (x: number, y: number, width: number) => {
  return width * x + y
}

export function prepareImage(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  const intensity = []

  // Grey-scale
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const [rIndex, gIndex, bIndex] =  getColorIndicesForCoord(x, y, width)

      const r = data[rIndex]
      const g = data[gIndex]
      const b = data[bIndex]

      const grey = Math.ceil(r + g + b) / 3
      intensity.push(grey)
    }
  }

  // Otsu
  const t = otsu(intensity)
  const thresholded = intensity.map(e => (e > t))

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const index = posToIndex(x, y, height)
      const [rIndex, gIndex, bIndex, aIndex] =  getColorIndicesForCoord(x, y, width)

      if (thresholded[index]) {
        data[rIndex] = 255
        data[gIndex] = 255
        data[bIndex] = 255
        data[aIndex] = 255
      } else {
        data[rIndex] = 0
        data[gIndex] = 0
        data[bIndex] = 0
        data[aIndex] = 255
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
