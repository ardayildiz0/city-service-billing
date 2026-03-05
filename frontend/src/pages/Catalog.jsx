import { useState, useEffect } from "react";
import api from "../api/client";

export default function Catalog() {
  const [items, setItems] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [form, setForm] = useState({ provider_id: "", service_id: "", currency_id: "", unit_price: "", unit_label: "" });
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api.get("/provider-services").then((r) => setItems(r.data));
    api.get("/providers").then((r) => setProviders(r.data));
    api.get("/services").then((r) => setServices(r.data));
    api.get("/currencies").then((r) => setCurrencies(r.data));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/provider-services", {
        ...form,
        provider_id: Number(form.provider_id),
        service_id: Number(form.service_id),
        currency_id: Number(form.currency_id),
        unit_price: Number(form.unit_price),
      });
      setForm({ provider_id: "", service_id: "", currency_id: "", unit_price: "", unit_label: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Hata");
    }
  };

  const handleUpdatePrice = async (id) => {
    try {
      await api.put(`/provider-services/${id}`, { unit_price: Number(newPrice) });
      setEditingPrice(null);
      setNewPrice("");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Hata");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Silmek istediginizden emin misiniz?")) return;
    await api.delete(`/provider-services/${id}`);
    load();
  };

  return (
    <div>
      <h1>Katalog (Saglayici - Hizmet)</h1>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <select value={form.provider_id} onChange={(e) => setForm({ ...form, provider_id: e.target.value })} style={inputStyle} required>
          <option value="">Saglayici Sec</option>
          {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })} style={inputStyle} required>
          <option value="">Hizmet Sec</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={form.currency_id} onChange={(e) => setForm({ ...form, currency_id: e.target.value })} style={inputStyle} required>
          <option value="">Para Birimi</option>
          {currencies.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
        </select>
        <input placeholder="Birim Fiyat" type="number" step="any" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} style={inputStyle} required />
        <input placeholder="Birim Etiketi (gb/ay)" value={form.unit_label} onChange={(e) => setForm({ ...form, unit_label: e.target.value })} style={inputStyle} required />
        <button type="submit" style={btnStyle}>Ekle</button>
      </form>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Saglayici</th>
            <th style={thStyle}>Hizmet</th>
            <th style={thStyle}>Birim Fiyat</th>
            <th style={thStyle}>Birim</th>
            <th style={thStyle}>Para Birimi</th>
            <th style={thStyle}>Islemler</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={tdStyle}>{item.id}</td>
              <td style={tdStyle}>{item.provider_name}</td>
              <td style={tdStyle}>{item.service_name}</td>
              <td style={tdStyle}>
                {editingPrice === item.id ? (
                  <span style={{ display: "flex", gap: 4 }}>
                    <input type="number" step="any" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ ...inputStyle, width: 100 }} />
                    <button onClick={() => handleUpdatePrice(item.id)} style={smallBtnStyle}>Kaydet</button>
                    <button onClick={() => setEditingPrice(null)} style={{ ...smallBtnStyle, background: "#999" }}>X</button>
                  </span>
                ) : (
                  item.unit_price
                )}
              </td>
              <td style={tdStyle}>{item.unit_label}</td>
              <td style={tdStyle}>{item.currency_code}</td>
              <td style={tdStyle}>
                <button onClick={() => { setEditingPrice(item.id); setNewPrice(item.unit_price); }} style={smallBtnStyle}>Fiyat Degistir</button>{" "}
                <button onClick={() => handleDelete(item.id)} style={{ ...smallBtnStyle, background: "#e74c3c" }}>Sil</button>
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
