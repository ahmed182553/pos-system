import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import AllInvoices from "./pages/AllInvoices";
import Statement from "./pages/Statement";
import Reports from "./pages/Reports";
import DailyPayments from "./pages/DailyPayments";
import { initializeProducts } from "./data/Productsdata";

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const { isAuth } = useAuth();
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    initializeProducts();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert("الكمية غير كافية في المخزون");
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return (
    <BrowserRouter>
      {/* 🔥 شيلنا bg-gray-100 من هنا */}
      <div className="flex min-h-screen overflow-x-hidden">

        {/* Sidebar */}
        {isAuth && (
          <div
            className={`
              fixed inset-y-0 right-0 z-50 w-64 bg-blue-900 text-white transform
              ${isOpen ? "translate-x-0" : "translate-x-full"}
              transition-transform duration-300
              lg:static lg:translate-x-0
            `}
          >
            <Sidebar closeSidebar={() => setIsOpen(false)} />
          </div>
        )}

        <div className="flex-1 flex flex-col">

          {/* Mobile Header */}
          {isAuth && (
            <div className="lg:hidden bg-white shadow p-4 flex justify-between">
              <button
                onClick={() => setIsOpen(true)}
                className="text-blue-900 text-2xl"
              >
                ☰
              </button>
              <h1 className="font-bold text-blue-900">POS System</h1>
            </div>
          )}

          {/* 🔥 الخلفية الرمادي بس بعد اللوجين */}
          <div className={`flex-1 p-4 ${isAuth ? "bg-gray-100" : ""}`}>

            <Routes>

              {/* Root */}
              <Route
                path="/"
                element={
                  isAuth
                    ? <Navigate to="/dashboard" replace />
                    : <Navigate to="/login" replace />
                }
              />

              {/* Login */}
              <Route
                path="/login"
                element={
                  !isAuth
                    ? <Login />
                    : <Navigate to="/dashboard" replace />
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products addToCart={addToCart} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/invoices"
                element={
                  <ProtectedRoute>
                    <Invoices cart={cart} setCart={setCart} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Customers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/allinvoices"
                element={
                  <ProtectedRoute>
                    <AllInvoices />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/statment"
                element={
                  <ProtectedRoute>
                    <Statement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dailypayments"
                element={
                  <ProtectedRoute>
                    <DailyPayments />
                  </ProtectedRoute>
                }
              />

              {/* Catch All */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>

          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}