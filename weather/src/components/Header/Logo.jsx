import { useApp } from "../../context/useApp"

function Logo() {
  const { weatherInfo, geoInfo } = useApp()

  const subtitle = (() => {
    if (weatherInfo?.name) {
      const country = weatherInfo.sys?.country
      const state = geoInfo?.[0]?.state
      return [weatherInfo.name, state, country].filter(Boolean).join(" · ")
    }
    return "Live atmospheric data"
  })()

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "1.5px solid #c9a84c",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "pulse 3s ease-in-out infinite",
        flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#c9a84c" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <div style={{
          fontSize: 15, fontWeight: 500, color: "#e8c97a",
          letterSpacing: "0.08em",
        }}>
          AURUM WEATHER
        </div>
        <div style={{ fontSize: 11, color: "rgba(240,237,232,0.45)", marginTop: 1 }}>
          {subtitle}
        </div>
      </div>
    </div>
  )
}

export default Logo