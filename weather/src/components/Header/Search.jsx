import { useApp } from "../../context/useApp"
import {
  buildCurrentWeatherUrl,
  buildCurrentWeatherLatLonUrl,
  buildGeoUrl,
  buildGeoSuggestUrl,
  buildReverseGeoUrl,
} from "../../utils/weatherUrls"
import axios from "axios"
import { useEffect, useState } from "react"

function cityLine(item) {
  return [item.name, item.state, item.country].filter(Boolean).join(", ")
}

function Search() {
  const {
    loc, setloc,
    OPEN_WEATHER_KEY, OPEN_WEATHER_CURRENT_URL, OPEN_WEATHER_GEO_URL,
    setwgu, setwcu,
  } = useApp()

  const [suggestions, setSuggestions]           = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [noResults, setNoResults]               = useState(false)
  const [inputFocused, setInputFocused]         = useState(false)
  const [focused, setFocused]                   = useState(false)

  useEffect(() => {
    const text = loc.trim()
    if (!inputFocused || text.length < 2) {
      setSuggestions([]); setSuggestionsLoading(false); setNoResults(false)
      return
    }
    setNoResults(false)
    let cancelled = false, timerId, abortController
    timerId = setTimeout(async () => {
      abortController = new AbortController()
      setSuggestionsLoading(true); setSuggestions([])
      const url = buildGeoSuggestUrl(text, OPEN_WEATHER_KEY, OPEN_WEATHER_GEO_URL, 5)
      try {
        const res = await axios.get(url, { signal: abortController.signal })
        if (cancelled) return
        const list = Array.isArray(res.data) ? res.data : []
        setSuggestions(list); setNoResults(list.length === 0)
      } catch (err) {
        if (err.code === "ERR_CANCELED" || err.name === "CanceledError") return
        if (!cancelled) { setSuggestions([]); setNoResults(true) }
      } finally {
        if (!cancelled) setSuggestionsLoading(false)
      }
    }, 400)
    return () => { cancelled = true; clearTimeout(timerId); abortController?.abort() }
  }, [loc, inputFocused, OPEN_WEATHER_KEY, OPEN_WEATHER_GEO_URL])

  const showDropdown = inputFocused && loc.trim().length >= 2 &&
    (suggestionsLoading || suggestions.length > 0 || noResults)

  function searchByCityName(cityText) {
    const text = (cityText ?? loc).trim()
    if (!text) return
    setloc(text)
    setwcu(buildCurrentWeatherUrl(text, OPEN_WEATHER_KEY, OPEN_WEATHER_CURRENT_URL))
    setwgu(buildGeoUrl(text, OPEN_WEATHER_KEY, OPEN_WEATHER_GEO_URL))
    setSuggestions([]); setNoResults(false)
  }

  function pickCityFromList(item) {
    setloc(cityLine(item))
    setwcu(buildCurrentWeatherLatLonUrl(item.lat, item.lon, OPEN_WEATHER_KEY, OPEN_WEATHER_CURRENT_URL))
    setwgu(buildReverseGeoUrl(item.lat, item.lon, OPEN_WEATHER_KEY))
    setSuggestions([]); setNoResults(false)
  }

  function onSubmit(e) {
    e.preventDefault()
    const city = new FormData(e.currentTarget).get("city")
    searchByCityName(typeof city === "string" ? city : loc)
  }

  const barStyle = {
    display: "flex", alignItems: "center", gap: 8,
    background: "#1a1d26",
    border: `1px solid ${focused ? "#c9a84c" : "rgba(201,168,76,0.35)"}`,
    borderRadius: 10, padding: "0 14px",
    transition: "border-color 0.2s",
  }

  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
      <form onSubmit={onSubmit} style={barStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#c9a84c" strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7"/>
          <path d="M20 20L16.5 16.5" strokeLinecap="round"/>
        </svg>
        <label htmlFor="city-search" style={{
          position: "absolute", width: 1, height: 1, overflow: "hidden",
        }}>City</label>
        <input
          id="city-search" name="city" type="text"
          value={loc} placeholder="Search city…"
          autoComplete="off"
          onChange={(e) => setloc(e.target.value)}
          onFocus={() => { setInputFocused(true); setFocused(true) }}
          onBlur={() => {
            setInputFocused(false); setFocused(false); setSuggestions([])
          }}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#f0ede8", fontSize: 13, padding: "10px 0",
          }}
        />
        {loc.trim() && (
          <button type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setloc("")}
            style={{
              background: "transparent", border: "none",
              color: "rgba(240,237,232,0.4)", fontSize: 13,
              padding: "4px 6px", cursor: "pointer",
            }}>✕</button>
        )}
        <button type="submit" style={{
          background: "#c9a84c", color: "#0b0c10",
          border: "none", borderRadius: 6,
          fontSize: 11, fontWeight: 500,
          padding: "5px 12px", cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "opacity 0.15s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >Search</button>
      </form>

      {showDropdown && (
        <ul style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "#12141a", border: "1px solid rgba(201,168,76,0.35)",
          borderRadius: 10, overflow: "hidden", zIndex: 50,
          margin: 0, padding: "4px 0", listStyle: "none",
        }}>
          {suggestionsLoading && (
            <li style={{ padding: "10px 14px", fontSize: 13, color: "rgba(240,237,232,0.45)" }}>
              Searching…
            </li>
          )}
          {!suggestionsLoading && noResults && (
            <li style={{ padding: "10px 14px", fontSize: 13, color: "rgba(240,237,232,0.45)" }}>
              No cities found
            </li>
          )}
          {suggestions.map((item, i) => (
            <li key={`${item.lat}-${item.lon}-${i}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickCityFromList(item)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: "transparent", border: "none",
                  padding: "10px 14px", fontSize: 13,
                  color: "rgba(240,237,232,0.55)", cursor: "pointer",
                  transition: "background 0.1s, color 0.1s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201,168,76,0.08)"
                  e.currentTarget.style.color = "#e8c97a"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "rgba(240,237,232,0.55)"
                }}
              >
                {cityLine(item)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Search