import "./App.css"
import { AppProvider } from "./context/AppProvider"
import Header from "./components/Header/Header"
import WeatherReport from "./WeatherApi/WeatherReport"

function App() {
  return (
    <AppProvider>
      <div style={{
        maxWidth: 1100,
        margin: "40px auto",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(201,168,76,0.18)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>
        <Header />
        <WeatherReport />
      </div>
    </AppProvider>
  )
}

export default App