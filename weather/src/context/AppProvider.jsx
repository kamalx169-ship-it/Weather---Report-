import { useState } from "react"
import { AppContext } from "./appContext"
import { buildCurrentWeatherUrl, buildGeoUrl } from "../utils/weatherUrls"

const OPEN_WEATHER_KEY = "4fa2f77fb2ee2b618ce6da6397335e1a"
const OPEN_WEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"
const OPEN_WEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"

const DEFAULT_CITY = "chennai"

const defaultWeatherUrl = buildCurrentWeatherUrl(
  DEFAULT_CITY,
  OPEN_WEATHER_KEY,
  OPEN_WEATHER_CURRENT_URL
)
const defaultGeoUrl = buildGeoUrl(DEFAULT_CITY, OPEN_WEATHER_KEY, OPEN_WEATHER_GEO_URL)

export function AppProvider({ children }) {
  const [loc, setloc] = useState(DEFAULT_CITY)
  const [W_G_U, setwgu] = useState(defaultGeoUrl)
  const [W_C_U, setwcu] = useState(defaultWeatherUrl)
  const [weatherInfo, setWeatherInfo] = useState(null)
  const [geoInfo, setGeoInfo] = useState(null)

  return (
    <AppContext.Provider
      value={{
        loc,
        setloc,
        OPEN_WEATHER_KEY,
        OPEN_WEATHER_GEO_URL,
        OPEN_WEATHER_CURRENT_URL,
        W_G_U,
        setwgu,
        W_C_U,
        setwcu,
        weatherInfo,
        setWeatherInfo,
        geoInfo,
        setGeoInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}