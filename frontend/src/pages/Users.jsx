import { useState, useEffect } from "react";
import api from "../api/client";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", role: "admin" });
  const [cityModal, setCityModal] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/users").then((r) => setUsers(r.data));
    api.get("/cities").then((r) => setCities(r.data));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users", form);
      setForm({ username: "", password: "", role: "admin" });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Hata");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Silmek istediginizden emin misiniz?")) return;
    await api.delete(`/users/${id}`);
    load();
  };

  const openCityModal = (user) => {
    setCityModal(user);
    setSelectedCities([]);
  };

  const assignCities = async () => {
    await api.post(`/users/${cityModal.id}/cities`, { city_ids: selectedCities });
    setCityModal(null);
    load();
  };

  const toggleCity = (cityId) => {
    setSelectedCities((prev) =>
      prev.includes(cityId) ? prev.filter((c) => c !== cityId) : [...prev, cityId]
    );
  };

  return (
    <div>
      <h1>Kullanicilar</h1>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          placeholder="Kullanici adi"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          style={inputStyle}
          required
        />
        <input
          placeholder="Sifre"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={inputStyle}
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          style={inputStyle}
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <button type="submit" style={btnStyle}>Ekle</button>
      </form>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Kullanici Adi</th>
            <th style={thStyle}>Rol</th>
            <th style={thStyle}>Islemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={tdStyle}>{u.id}</td>
              <td style={tdStyle}>{u.username}</td>
              <td style={tdStyle}>{u.role}</td>
              <td style={tdStyle}>
                {u.role === "admin" && (
                  <button onClick={() => openCityModal(u)} style={smallBtnStyle}>
                    Sehir Ata
                  </button>
                )}{" "}
                <button onClick={() => handleDelete(u.id)} style={{ ...smallBtnStyle, background: "#e74c3c" }}>
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {cityModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Sehir Ata: {cityModal.username}</h3>
            <div style={{ maxHeight: 300, overflow: "auto", margin: "16px 0" }}>
              {cities.map((c) => (
                <label key={c.id} style={{ display: "block", marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(c.id)}
                    onChange={() => toggleCity(c.id)}
                  />{" "}
                  {c.name}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={assignCities} style={btnStyle}>Kaydet</button>
              <button onClick={() => setCityModal(null)} style={{ ...btnStyle, background: "#999" }}>
                Iptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { padding: 8, border: "1px solid #ddd", borderRadius: 4, fontSize: 14 };
const btnStyle = { padding: "8px 16px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const smallBtnStyle = { padding: "4px 10px", background: "#3498db", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 };
const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff" };
const thStyle = { textAlign: "left", padding: 12, borderBottom: "2px solid #eee", background: "#fafafa" };
const tdStyle = { padding: 10, borderBottom: "1px solid #eee" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalBox = { background: "#fff", padding: 30, borderRadius: 8, minWidth: 350 };
