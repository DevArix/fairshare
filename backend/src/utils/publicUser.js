export function publicUser(user) {
  if (!user) return null
  const { passwordHash, sessionVersion, ...safe } = user
  return safe
}
