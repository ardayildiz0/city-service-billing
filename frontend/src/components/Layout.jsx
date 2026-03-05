import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isSuperadmin = user?.role === "superadmin";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: 220,
          background: "#1a1a2e",
          color: "#fff",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #333", marginBottom: 10 }}>
          <strong style={{ fontSize: 16 }}>Servis Yonetimi</strong>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
            {user?.username} ({user?.role})
          </div>
        </div>

        <NavLink to="/">Dashboard</NavLink>

        {isSuperadmin && (
          <>
            <NavLink to="/users">Kullanicilar</NavLink>
            <NavLink to="/cities">Sehirler</NavLink>
            <NavLink to="/taxes">Vergiler</NavLink>
            <NavLink to="/currencies">Para Birimleri</NavLink>
            <NavLink to="/providers">Saglayicilar</NavLink>
            <NavLink to="/services">Hizmetler</NavLink>
            <NavLink to="/catalog">Katalog</NavLink>
          </>
        )}

        <NavLink to="/subscriptions">Abonelikler</NavLink>
        <NavLink to="/reports">Raporlar</NavLink>

        <div style={{ marginTop: "auto", padding: "20px" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "8px",
              background: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cikis Yap
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: 30, background: "#f5f5f5" }}>
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: "#ccc",
        textDecoration: "none",
        padding: "10px 20px",
        display: "block",
        fontSize: 14,
      }}
    >
      {children}
    </Link>
  );
}
