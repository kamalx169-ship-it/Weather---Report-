import { useContext } from "react"
import { AppContext } from "./appContext"

export function useApp() {
  const ctx = useContext(AppContext)
  if (ctx == null) {
    throw new Error("useApp must be used within AppProvider")
  }
  return ctx
}