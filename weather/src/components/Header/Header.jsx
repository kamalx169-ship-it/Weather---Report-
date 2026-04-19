import Logo from "./Logo"
import Search from "./Search"

function Header() {
  return (
    <header style={{
      background: "#12141a",
      borderBottom: "1px solid rgba(201,168,76,0.18)",
      padding: "16px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    }}>
      <Logo />
      <Search />
    </header>
  )
}

export default Header