import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/client";
import { useAuth } from "../hooks/useAuth";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B6B"];

export default function Reports() {
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [usageData, setUsageData] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [cities, setCities] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState({ city_id: "", year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [error, setError] = useState("");

  const isSuperadmin = user?.role === "superadmin";

  useEffect(() => {
    if (isSuperadmin) {
      api.get("/cities").then((r) => setCities(r.data));
    }
  }, []);

  const loadUsage = () => {
    api.get("/reports/usage", { params: { year, month } })
      .then((r) => setUsageData(r.data))
      .catch(() => {});
  };

  const loadInvoices = () => {
    api.get("/reports/invoices").then((r) => setInvoices(r.data)).catch(() => {});
  };

  useEffect(() => {
    loadUsage();
    loadInvoices();
  }, [year, month]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/reports/invoices", {
        city_id: Number(invoiceForm.city_id),
        year: Number(invoiceForm.year),
        month: Number(invoiceForm.month),
      });
      loadInvoices();
    } catch (err) {
      setError(err.response?.data?.detail || "Hata");
    }
  };

  const cityName = (cityId) => {
    const c = cities.find((c) => c.id === cityId);
    return c ? c.name : `Sehir #${cityId}`;
  };

  return (
    <div>
      <h1>Raporlar</h1>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
        <label>Yil:</label>
        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={inputStyle} />
        <label>Ay:</label>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={inputStyle}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <button onClick={loadUsage} style={btnStyle}>Goster</button>
      </div>

      {usageData.length > 0 ? (
        <div style={{ background: "#fff", padding: 20, borderRadius: 8, marginBottom: 30 }}>
          <h3>Sehir Bazli Kullanim (Pie Chart)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={usageData}
                dataKey="total_cost"
                nameKey="city_name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ city_name, total_cost }) => `${city_name}: $${total_cost.toFixed(2)}`}
              >
                {usageData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `$${Number(val).toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={{ color: "#888" }}>Bu donem icin kullanim verisi bulunamadi.</p>
      )}

      <div style={{ background: "#fff", padding: 20, borderRadius: 8, marginBottom: 30 }}>
        <h3>Fatura Olustur</h3>
        <form onSubmit={handleCreateInvoice} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {isSuperadmin ? (
            <select value={invoiceForm.city_id} onChange={(e) => setInvoiceForm({ ...invoiceForm, city_id: e.target.value })} style={inputStyle} required>
              <option value="">Sehir Sec</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <input placeholder="Sehir ID" type="number" value={invoiceForm.city_id} onChange={(e) => setInvoiceForm({ ...invoiceForm, city_id: e.target.value })} style={inputStyle} required />
          )}
          <input type="number" placeholder="Yil" value={invoiceForm.year} onChange={(e) => setInvoiceForm({ ...invoiceForm, year: e.target.value })} style={inputStyle} required />
          <select value={invoiceForm.month} onChange={(e) => setInvoiceForm({ ...invoiceForm, month: e.target.value })} style={inputStyle}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <button type="submit" style={btnStyle}>Fatura Olustur</button>
        </form>
      </div>

      <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
        <h3>Faturalar</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Sehir</th>
              <th style={thStyle}>Donem</th>
              <th style={thStyle}>Toplam Maliyet</th>
              <th style={thStyle}>Vergi</th>
              <th style={thStyle}>Genel Toplam</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={tdStyle}>{inv.id}</td>
                <td style={tdStyle}>{cityName(inv.city_id)}</td>
                <td style={tdStyle}>{inv.year}-{String(inv.month).padStart(2, "0")}</td>
                <td style={tdStyle}>${Number(inv.total_cost).toFixed(2)}</td>
                <td style={tdStyle}>${Number(inv.tax_amount).toFixed(2)}</td>
                <td style={tdStyle}>${Number(inv.grand_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = { padding: 8, border: "1px solid #ddd", borderRadius: 4, fontSize: 14 };
const btnStyle = { padding: "8px 16px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { textAlign: "left", padding: 12, borderBottom: "2px solid #eee", background: "#fafafa" };
const tdStyle = { padding: 10, borderBottom: "1px solid #eee" };
