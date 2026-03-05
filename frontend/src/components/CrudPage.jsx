import { useState, useEffect } from "react";
import api from "../api/client";

export default function CrudPage({ title, endpoint, fields, renderExtra }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    api.get(endpoint).then((r) => setItems(r.data)).catch(() => {});
  };

  useEffect(load, [endpoint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`${endpoint}/${editing}`, form);
      } else {
        await api.post(endpoint, form);
      }
      setForm({});
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Bir hata olustu");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Silmek istediginizden emin misiniz?")) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Silinemedi");
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    const formData = {};
    fields.forEach((f) => {
      formData[f.key] = item[f.key] ?? "";
    });
    setForm(formData);
  };

  return (
    <div>
      <h1>{title}</h1>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {fields.map((f) => (
          <input
            key={f.key}
            placeholder={f.label}
            type={f.type || "text"}
            step={f.type === "number" ? "any" : undefined}
            value={form[f.key] || ""}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            style={inputStyle}
            required
          />
        ))}
        <button type="submit" style={btnStyle}>
          {editing ? "Guncelle" : "Ekle"}
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setForm({}); }} style={{ ...btnStyle, background: "#999" }}>
            Iptal
          </button>
        )}
      </form>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            {fields.map((f) => (
              <th key={f.key} style={thStyle}>{f.label}</th>
            ))}
            <th style={thStyle}>Islemler</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={tdStyle}>{item.id}</td>
              {fields.map((f) => (
                <td key={f.key} style={tdStyle}>{String(item[f.key] ?? "")}</td>
              ))}
              <td style={tdStyle}>
                <button onClick={() => handleEdit(item)} style={smallBtnStyle}>Duzenle</button>{" "}
                <button onClick={() => handleDelete(item.id)} style={{ ...smallBtnStyle, background: "#e74c3c" }}>Sil</button>
                {renderExtra && renderExtra(item)}
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
const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8 };
const thStyle = { textAlign: "left", padding: 12, borderBottom: "2px solid #eee", background: "#fafafa" };
const tdStyle = { padding: 10, borderBottom: "1px solid #eee" };
