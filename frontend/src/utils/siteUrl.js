export function siteUrl(path) {
  const base = new URL(import.meta.env.BASE_URL, window.location.origin).toString()
  return `${base}#${path.startsWith('/') ? path : `/${path}`}`
}
