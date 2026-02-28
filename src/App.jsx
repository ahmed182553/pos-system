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
import Reports from "./pages/Reports";

export default function App() {

  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    initializeProducts();
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
      <div className="flex min-h-screen bg-gray-100 overflow-x-hidden">

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

        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        <div className="flex-1 min-w-0 flex flex-col">

          <div className="lg:hidden bg-white shadow p-4 flex items-center justify-between">
            <button
              onClick={() => setIsOpen(true)}
              className="text-blue-900 text-2xl"
            >
              ☰
            </button>

            <h1 className="font-bold text-blue-900">
              POS System
            </h1>
          </div>

          <div className="flex-1 p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<Products addToCart={addToCart} />} />
              <Route path="/invoices" element={<Invoices cart={cart} setCart={setCart} />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/allinvoices" element={<AllInvoices />} />
              <Route path="/statment" element={<Statement />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>

        </div>

      </div>
    </BrowserRouter>
  );
}