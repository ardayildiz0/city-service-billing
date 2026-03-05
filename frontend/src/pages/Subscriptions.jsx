import { useState, useEffect } from "react";
import api from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function Subscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({ city_id: "", provider_service_id: "", amount: "" });
  const [editingAmount, setEditingAmount] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [error, setError] = useState("");

  const isSuperadmin = user?.role === "superadmin";

  const load = () => {
    api.get("/subscriptions").then((r) => setSubs(r.data));
    if (isSuperadmin) {
      api.get("/provider-services").then((r) => setCatalog(r.data));
      api.get("/cities").then((r) => setCities(r.data));
    }
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/subscriptions", {
        city_id: Number(form.city_id),
        provider_service_id: Number(form.provider_service_id),
        amount: Number(form.amount),
      });
      setForm({ city_id: "", provider_service_id: "", amount: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Hata");
    }
  };

  const handleUpdateAmount = async (id) => {
    try {
      await api.put(`/subscriptions/${id}/amount`, { amount: Number(newAmount) });
      setEditingAmount(null);
      setNewAmount("");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Hata");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Aboneligi iptal etmek istediginizden emin misiniz?")) return;
    await api.delete(`/subscriptions/${id}`);
    load();
  };

  const catalogName = (psId) => {
    const item = catalog.find((c) => c.id === psId);
    return item ? `${item.provider_name} - ${item.service_name}` : `#${psId}`;
  };

  const cityName = (cityId) => {
    const c = cities.find((c) => c.id === cityId);
    return c ? c.name : `#${cityId}`;
  };

  return (
    <div>
      <h1>Abonelikler</h1>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {isSuperadmin ? (
          <select value={form.city_id} onChange={(e) => setForm({ ...form, city_id: e.target.value })} style={inputStyle} required>
            <option value="">Sehir Sec</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : (
          <input placeholder="Sehir ID" type="number" value={form.city_id} onChange={(e) => setForm({ ...form, city_id: e.target.value })} style={inputStyle} required />
        )}
        {isSuperadmin ? (
          <select value={form.provider_service_id} onChange={(e) => setForm({ ...form, provider_service_id: e.target.value })} style={inputStyle} required>
            <option value="">Katalog Sec</option>
            {catalog.map((c) => <option key={c.id} value={c.id}>{c.provider_name} - {c.service_name} ({c.unit_price} {c.currency_code}/{c.unit_label})</option>)}
          </select>
        ) : (
          <input placeholder="Katalog ID" type="number" value={form.provider_service_id} onChange={(e) => setForm({ ...form, provider_service_id: e.target.value })} style={inputStyle} required />
        )}
        <input placeholder="Miktar" type="number" step="any" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={inputStyle} required />
        <button type="submit" style={btnStyle}>Abone Ol</button>
      </form>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Sehir</th>
            <th style={thStyle}>Katalog</th>
            <th style={thStyle}>Miktar</th>
            <th style={thStyle}>Durum</th>
            <th style={thStyle}>Islemler</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id}>
              <td style={tdStyle}>{s.id}</td>
              <td style={tdStyle}>{cityName(s.city_id)}</td>
              <td style={tdStyle}>{catalogName(s.provider_service_id)}</td>
              <td style={tdStyle}>
                {editingAmount === s.id ? (
                  <span style={{ display: "flex", gap: 4 }}>
                    <input type="number" step="any" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} style={{ ...inputStyle, width: 100 }} />
                    <button onClick={() => handleUpdateAmount(s.id)} style={smallBtnStyle}>Kaydet</button>
                    <button onClick={() => setEditingAmount(null)} style={{ ...smallBtnStyle, background: "#999" }}>X</button>
                  </span>
                ) : (
                  s.amount
                )}
              </td>
              <td style={tdStyle}>
                <span style={{ color: s.is_active ? "green" : "red" }}>
                  {s.is_active ? "Aktif" : "Iptal"}
                </span>
              </td>
              <td style={tdStyle}>
                {s.is_active && (
                  <>
                    <button onClick={() => { setEditingAmount(s.id); setNewAmount(s.amount); }} style={smallBtnStyle}>Miktar Degistir</button>{" "}
                    <button onClick={() => handleCancel(s.id)} style={{ ...smallBtnStyle, background: "#e74c3c" }}>Iptal Et</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle = { padding: 8, border: "1px solid #ddd", borderRadius: 4, fontSize: 14 };
const btnStyle = { padding: "8px 16px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const smallBtnStyle = { padding: "4px 10px", background: "#3498db", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 };
const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff" };
const thStyle = { textAlign: "left", padding: 12, borderBottom: "2px solid #eee", background: "#fafafa" };
const tdStyle = { padding: 10, borderBottom: "1px solid #eee" };
