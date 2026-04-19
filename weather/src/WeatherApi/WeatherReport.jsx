import { useApp } from "../context/useApp"
import { useEffect, useState } from "react"
import axios from "axios"

function errorText(err) {
  const status = err.response?.status
  const msg = err.response?.data?.message
  if (status === 404 || msg === "city not found") return "City not found."
  if (status === 401) return "Invalid API key."
  if (status === 429) return "Too many requests. Wait and try again."
  if (!err.response) return "Network error. Check your connection."
  if (typeof msg === "string") return msg
  return err.message || "Something went wrong."
}

function windDirectionName(deg) {
  if (deg == null || Number.isNaN(deg)) return "—"
  const names = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]
  return names[Math.round((deg % 360) / 22.5) % 16]
}

function sunTimeUtc(s) {
  if (s == null) return "—"
  return new Date(s * 1000).toLocaleTimeString(undefined, {
    hour: "numeric", minute: "2-digit", timeZone: "UTC",
  })
}

function sunProgress(rise, set) {
  const now = Math.floor(Date.now() / 1000)
  if (!rise || !set || now < rise) return 0
  if (now > set) return 100
  return Math.round(((now - rise) / (set - rise)) * 100)
}

const C = {
  gold:  "#c9a84c",
  gold2: "#e8c97a",
  dark:  "#0b0c10",
  dark2: "#12141a",
  dark3: "#1a1d26",
  card:  "#16181f",
  text:  "#f0ede8",
  muted: "rgba(240,237,232,0.45)",
  muted2:"rgba(240,237,232,0.25)",
  border:"rgba(201,168,76,0.18)",
  border2:"rgba(201,168,76,0.35)",
}

function WeatherReport() {
  const { W_G_U, W_C_U, setWeatherInfo, setGeoInfo } = useApp()
  const [weather, setWeather] = useState(null)
  const [geo,     setGeo    ] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError  ] = useState(null)

  useEffect(() => {
    if (!W_G_U || !W_C_U) return
    let stopped = false
    setLoading(true); setError(null)

    async function load() {
      try {
        const [geoRes, wxRes] = await Promise.all([
          axios.get(W_G_U), axios.get(W_C_U),
        ])
        if (stopped) return
        const g = geoRes.data
        if (Array.isArray(g) && g.length === 0) {
          setError("No location found."); setWeather(null); setGeo(null)
          setGeoInfo(null); setWeatherInfo(null); return
        }
        const w = wxRes.data
        if (w.cod != null && String(w.cod) !== "200") {
          setError(typeof w.message === "string" ? w.message : "Weather not available.")
          setWeather(null); setGeo(null)
          setGeoInfo(null); setWeatherInfo(null); return
        }
        setGeo(g); setWeather(w)
        setGeoInfo(g); setWeatherInfo(w)
      } catch (err) {
        if (stopped) return
        setError(errorText(err))
        setWeather(null); setGeo(null)
        setGeoInfo(null); setWeatherInfo(null)
      } finally {
        if (!stopped) setLoading(false)
      }
    }
    load()
    return () => { stopped = true }
  }, [W_G_U, W_C_U, setGeoInfo, setWeatherInfo])

  /* ── shared shell ── */
  const shell = {
    display: "grid",
    gridTemplateColumns: "1fr 210px",
    background: C.dark,
    minHeight: 480,
  }

  if (loading) return (
    <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 36, height: 36,
          border: `2px solid ${C.border}`,
          borderTopColor: C.gold,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}/>
        <div style={{
          fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
          background: `linear-gradient(90deg,${C.gold},${C.gold2},${C.gold})`,
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "shimmer 2s linear infinite",
        }}>Fetching conditions</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{
      ...shell, display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ fontSize: 13, color: "#e55", textAlign: "center" }}>{error}</div>
    </div>
  )

  if (!weather) return null

  const w  = weather
  const g0 = Array.isArray(geo) ? geo[0] : geo

  const icon    = w.weather?.[0]?.icon
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@4x.png` : null
  const desc    = (w.weather?.[0]?.description || "").replace(/\b\w/g, c => c.toUpperCase())
  const temp    = Math.round(w.main.temp)
  const feels   = Math.round(w.main.feels_like)
  const hum     = w.main.humidity
  const pres    = w.main.pressure
  const windKmh = ((w.wind?.speed || 0) * 3.6).toFixed(1)
  const windDir = windDirectionName(w.wind?.deg)
  const visKm   = w.visibility ? (w.visibility / 1000).toFixed(1) : "—"
  const clouds  = w.clouds?.all ?? "—"
  const rise    = sunTimeUtc(w.sys?.sunrise)
  const set     = sunTimeUtc(w.sys?.sunset)
  const sp      = sunProgress(w.sys?.sunrise, w.sys?.sunset)
  const rain1h  = w.rain?.["1h"] != null ? `${w.rain["1h"]} mm` : "—"
  const snow1h  = w.snow?.["1h"] != null ? `${w.snow["1h"]} mm` : "—"
  const lat     = w.coord?.lat != null ? w.coord.lat.toFixed(3) : "—"
  const lon     = w.coord?.lon != null ? w.coord.lon.toFixed(3) : "—"
  const cityName = w.name || "—"
  const country  = w.sys?.country || ""
  const stateName = g0?.state || ""

  const delays = ["0s","0.06s","0.12s","0.18s"]

  const stats = [
    { l: "Humidity",   v: `${hum}%`,     s: "Relative"      },
    { l: "Wind",       v: `${windKmh}`,  s: `km/h · ${windDir}` },
    { l: "Visibility", v: `${visKm}`,    s: "km"            },
    { l: "Clouds",     v: `${clouds}%`,  s: "Coverage"      },
  ]

  const sideItems = [
    { l: "Pressure",   v: `${pres}`,    s: "hPa",          sm: false },
    { l: "Feels like", v: `${feels}°`,  s: "Apparent temp", sm: false },
    { l: "Sunrise",    v: rise,          s: "UTC",           sm: true  },
    { l: "Sunset",     v: set,           s: "UTC",           sm: true  },
  ]

  return (
    <main style={shell}>

      {/* ── LEFT ── */}
      <div style={{
        padding: "28px",
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", gap: 24,
      }}>

        {/* Hero */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 20,
          animation: "fadeUp 0.5s ease both",
        }}>
          {iconUrl && (
            <div style={{
              width: 80, height: 80, borderRadius: 20, flexShrink: 0,
              background: `linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.04))`,
              border: `1px solid ${C.border2}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "floatY 4s ease-in-out infinite",
            }}>
              <img src={iconUrl} alt={desc} style={{ width: 60, height: 60 }} />
            </div>
          )}
          <div>
            <div style={{
              fontSize: 12, color: C.gold, fontWeight: 500,
              letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4,
            }}>
              {[cityName, stateName, country].filter(Boolean).join(" · ")}
            </div>
            <div style={{
              fontSize: 72, fontWeight: 500, lineHeight: 1,
              color: C.text, letterSpacing: "-3px",
              animation: "countUp 0.6s ease both",
            }}>
              {temp}<span style={{ fontSize: 32, color: C.muted, letterSpacing: 0 }}>°C</span>
            </div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{desc}</div>
            <div style={{ fontSize: 12, color: C.muted2, marginTop: 3 }}>
              Feels like {feels}°C
            </div>
          </div>
        </div>

        {/* Gold divider */}
        <div style={{
          height: 1,
          background: `linear-gradient(90deg,${C.gold},transparent)`,
          opacity: 0.3,
        }}/>

        {/* Stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {stats.map(({ l, v, s }, i) => (
            <div key={l} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "14px 12px",
              animation: `fadeUp 0.5s ${delays[i]} ease both`,
              transition: "border-color 0.2s, transform 0.2s",
              cursor: "default",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.border2
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border
                e.currentTarget.style.transform = "none"
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 500, color: C.gold, textTransform: "uppercase", letterSpacing: "0.14em" }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: C.text, marginTop: 5, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 10, color: C.muted2, marginTop: 3 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Sun bar */}
        <div style={{ animation: "fadeUp 0.6s 0.1s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: C.gold, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Daylight
            </span>
            <span style={{ fontSize: 11, color: C.muted }}>{sp}% elapsed</span>
          </div>
          <div style={{ height: 4, background: "rgba(201,168,76,0.1)", borderRadius: 99, position: "relative" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: `linear-gradient(90deg,${C.gold},${C.gold2})`,
              width: `${sp}%`,
              animation: `sunrise 1.2s cubic-bezier(.4,0,.2,1) both`,
              position: "relative",
            }}>
              <div style={{
                position: "absolute", right: -1, top: "50%",
                transform: "translate(50%,-50%)",
                width: 10, height: 10, borderRadius: "50%",
                background: C.gold2,
                boxShadow: `0 0 10px ${C.gold}`,
              }}/>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted2, marginTop: 8 }}>
            <span>↑ {rise} UTC</span><span>↓ {set} UTC</span>
          </div>
        </div>

        {/* Precip + Location */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            {
              title: "Precipitation · 1h",
              content: (
                <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                  {[["Rain", rain1h], ["Snow", snow1h]].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: C.muted2 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: C.text, marginTop: 2 }}>{val}</div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              title: "Location",
              content: (
                <div style={{ marginTop: 8, fontSize: 12, color: C.muted, fontFamily: "monospace", lineHeight: 1.8 }}>
                  {lat}° N<br />{lon}° E<br />
                  <span style={{ fontSize: 10, color: C.muted2 }}>ID #{w.id || "—"}</span>
                </div>
              ),
            },
          ].map(({ title, content }) => (
            <div key={title} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "14px 16px",
              animation: "fadeUp 0.6s 0.15s ease both",
            }}>
              <div style={{ fontSize: 9, fontWeight: 500, color: C.gold, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                {title}
              </div>
              {content}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div style={{
        background: C.dark2,
        borderLeft: `1px solid ${C.border}`,
        padding: "24px 20px",
        display: "flex", flexDirection: "column",
      }}>
        {sideItems.map(({ l, v, s, sm }, i) => (
          <div key={l} style={{
            padding: "16px 0",
            borderBottom: `1px solid ${C.border}`,
            animation: `fadeIn 0.5s ${delays[i]} ease both`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 500, color: C.gold, textTransform: "uppercase", letterSpacing: "0.14em" }}>{l}</div>
            <div style={{ fontSize: sm ? 15 : 21, fontWeight: 500, color: C.text, marginTop: 4, lineHeight: 1.1 }}>{v}</div>
            <div style={{ fontSize: 10, color: C.muted2, marginTop: 2 }}>{s}</div>
          </div>
        ))}

        {/* Coords */}
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "12px 14px",
          }}>
            <div style={{ fontSize: 9, color: C.gold, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500, marginBottom: 6 }}>
              Coordinates
            </div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: "monospace", lineHeight: 1.8 }}>
              {lat}° N<br />{lon}° E
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}

export default WeatherReport