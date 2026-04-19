/** Build OpenWeatherMap current-weather and geo URLs (must match Search / context). */
export function buildCurrentWeatherUrl(city, appId, baseUrl) {
  const q = encodeURIComponent(city.trim() || "chennai")
  return `${baseUrl}?q=${q}&appid=${appId}&units=metric`
}

export function buildGeoUrl(city, appId, baseUrl) {
  const q = encodeURIComponent(city.trim() || "chennai")
  return `${baseUrl}?q=${q}&limit=1&appid=${appId}`
}

/** Geocoding autocomplete (direct API, multiple results). */
export function buildGeoSuggestUrl(query, appId, baseDirectUrl, limit = 5) {
  const q = encodeURIComponent(query.trim())
  return `${baseDirectUrl}?q=${q}&limit=${limit}&appid=${appId}`
}

/** Current weather by coordinates (accurate when user picks a suggestion). */
export function buildCurrentWeatherLatLonUrl(lat, lon, appId, baseUrl) {
  return `${baseUrl}?lat=${lat}&lon=${lon}&appid=${appId}&units=metric`
}

/** Reverse geocode for context / header subtitle. */
export function buildReverseGeoUrl(lat, lon, appId) {
  return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${appId}`
}
