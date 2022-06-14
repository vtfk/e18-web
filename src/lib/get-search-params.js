export function getSearchParams (req) {
  const searchParams = new URLSearchParams(req.url?.search || req.location?.search)
  const params = {}
  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }
  return params
}
