export function detectHarpus(text: string) {
  const results = text.match(/([0-9]{1,2})\s+(.{3})/)
  if (!results) {
    return null
  }

  return { id: parseInt(results[1], 10), code: results[2] }
}
