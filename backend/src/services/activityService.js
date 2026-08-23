import { makeId } from '../utils/id.js'

export function addActivity(db, groupId, userId, type, text) {
  db.activities.push({
    id: makeId(),
    groupId,
    userId,
    type,
    text,
    createdAt: new Date().toISOString()
  })
}

