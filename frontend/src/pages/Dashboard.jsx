import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Hosgeldiniz, {user?.username}</h1>
      <p style={{ color: "#666" }}>
        Rol: <strong>{user?.role}</strong>
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {user?.role === "superadmin" && (
          <>
            <Card title="Kullanicilar" desc="Kullanici ve admin yonetimi" />
            <Card title="Katalog" desc="Saglayici-hizmet ve fiyat yonetimi" />
            <Card title="Sehirler" desc="Sehir ekleme ve yonetimi" />
          </>
        )}
        <Card title="Abonelikler" desc="Abonelik olusturma ve yonetimi" />
        <Card title="Raporlar" desc="Kullanim verileri ve faturalar" />
      </div>
    </div>
  );
}

function Card({ title, desc }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p style={{ color: "#888", margin: "8px 0 0" }}>{desc}</p>
    </div>
  );
}
