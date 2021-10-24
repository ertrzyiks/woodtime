const getDistance = require('geolib/es/getDistance').default
const knex = require("../../knex");

module.exports = async (
  _,
  { event_id, position }
) => {
  const events = await knex
    .select("id","type", "virtual_challenge_id")
    .from("events")
    .where({ id })

  if (events.length <= 0) {
    throw new Error('NOT FOUND')
  }

  if (events.type !== 3) {
    throw new Error('VIRTUAL EVENTS ONLY')
  }

  const event = events[0]

  const challenges = knex
    .select("id", "checkpoints")
    .from("virtual_challenges")
    .where({ id: event.virtual_challenge_id })

  if (challenges.length <= 0) {
    throw new Error('NOT FOUND')
  }

  const challenge = challenges[0]

  const checkpoints = JSON.parse(challenge.checkpoints)

  const distances = checkpoints.map((point, index) => ({ index, distance: getDistance(
    { latitude: point.lat, longitude: point.lng },
    { latitude: position.lat, longitude: position.lng }
  )})).sort((d1, d2) => {
    if (d1.distance < d2.distance) return -1
    if (d1.distance > d2.distance) return 1
    return 0
  })

  const nearest = distances[0]
  const nearestPoint = nearest.index

  console.log({ distances, nearestPoint })

  const checkpoint = {
    event_id,
    cp_id: nearestPoint,
    cp_code: 'OK',
    skipped: false,
    skipped_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const createdCheckpointIds = await knex("checkpoints").insert(checkpoint);

  return {
    success: true,
    checkpoint: { id: createdCheckpointIds[0], ...checkpoint },
  };
};
