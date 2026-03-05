import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Cities from "./pages/Cities";
import Taxes from "./pages/Taxes";
import Currencies from "./pages/Currencies";
import Providers from "./pages/Providers";
import Services from "./pages/Services";
import Catalog from "./pages/Catalog";
import Subscriptions from "./pages/Subscriptions";
import Reports from "./pages/Reports";

function ProtectedRoute({ children, requireSuperadmin }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Yukleniyor...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireSuperadmin && user.role !== "superadmin") return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div>Yukleniyor...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<ProtectedRoute requireSuperadmin><Users /></ProtectedRoute>} />
        <Route path="/cities" element={<ProtectedRoute requireSuperadmin><Cities /></ProtectedRoute>} />
        <Route path="/taxes" element={<ProtectedRoute requireSuperadmin><Taxes /></ProtectedRoute>} />
        <Route path="/currencies" element={<ProtectedRoute requireSuperadmin><Currencies /></ProtectedRoute>} />
        <Route path="/providers" element={<ProtectedRoute requireSuperadmin><Providers /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute requireSuperadmin><Services /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute requireSuperadmin><Catalog /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
