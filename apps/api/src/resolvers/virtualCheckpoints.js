const { isPointWithinRadius } = require('geolib')

function getRandomPointInDisk(radius) {
  const r = radius * Math.sqrt(Math.random())
  const theta = Math.random() * 2 * Math.PI
  return [r * Math.cos(theta), r * Math.sin(theta)]
}

const EarthRadius = 6371 // km
const OneDegree = EarthRadius * 2 * Math.PI / 360 * 1000 // 1° latitude in meters

function getRandomPoint(center, radius) {
  const [dx, dy] = getRandomPointInDisk(radius)
  const randomLat = center.lat + dy / OneDegree
  const randomLng = center.lng + dx / ( OneDegree * Math.cos(center.lat * Math.PI / 180) )
  return { lat: randomLat, lng: randomLng }
}

const MAX_ATTEMPTS = 100

module.exports = async (_, args) => {
  const { input } = args
  const { start, radius, count } = input

  const startPoint = { lat: parseFloat(start.lat), lng: parseFloat(start.lng) }

  const points = []

  for (let i = 0; i < MAX_ATTEMPTS; i++){
    const point = getRandomPoint(startPoint, radius)

    if (isPointWithinRadius({latitude: point.lat, longitude: point.lng}, {latitude: startPoint.lat, longitude: startPoint.lng}, radius)) {
      points.push(point)
    }

    if (points.length >= count) {
      break
    }
  }

  return {
    points
  }
};
