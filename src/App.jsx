import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import AllInvoices from "./pages/AllInvoices";
import { initializeProducts } from "./data/Productsdata";
import Statement from "./pages/Statement";

export default function App() {

  const [cart, setCart] = useState([]);

  useEffect(() => {
    initializeProducts(); // 🔥 تحميل الداتا الافتراضية أول مرة
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);

      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert("الكمية غير كافية في المخزون");
          return prev;
        }

        return prev.map(item =>
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
      <div className="flex">

        <Sidebar />

        <div className="flex-1 p-6">
          <Routes>

            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<Products addToCart={addToCart} />} />
            <Route path="/invoices" element={<Invoices cart={cart} setCart={setCart} />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/allinvoices" element={<AllInvoices />} />
            <Route path="/statment" element={<Statement />} />

          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}