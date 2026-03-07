import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  getProducts,
  getCustomers,
  getInvoices
} from "../services/dataService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Navbar from "../components/Navbar";
import { addPayment } from "../services/paymentService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

// Animation
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");

  const [chartData, setChartData] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    invoices: 0,
    totalSales: 0,
    totalProfit: 0,
    todaySales: 0
  });

  useEffect(() => {
    setCustomers(getCustomers());

    const products = getProducts();
    const customersData = getCustomers();
    const invoices = getInvoices();

    const totalSales = invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || inv.total || 0),
      0
    );

    const totalProfit = invoices.reduce(
      (sum, inv) => sum + (inv.totalProfit || 0),
      0
    );

    const today = new Date().toISOString().slice(0, 10);

    const todaySales = invoices
      .filter(inv => inv.date?.slice(0, 10) === today)
      .reduce(
        (sum, inv) => sum + (inv.totalAmount || inv.total || 0),
        0
      );

    setStats({
      products: products.length,
      customers: customersData.length,
      invoices: invoices.length,
      totalSales,
      totalProfit,
      todaySales
    });

    setLowStockProducts(
      products.filter(p => p.quantity < 10)
    );

    const monthly = {};
    invoices.forEach(inv => {
      if (!inv.date) return;

      const month = new Date(inv.date).toLocaleString("default", {
        month: "short"
      });

      monthly[month] =
        (monthly[month] || 0) +
        (inv.totalAmount || inv.total || 0);
    });

    setChartData({
      labels: Object.keys(monthly),
      datasets: [
        {
          label: "المبيعات الشهرية",
          data: Object.values(monthly),
          backgroundColor: "#1e40af"
        }
      ]
    });

  }, []);

  const handleSavePayment = () => {
    if (!customerId || !amount) return;

    addPayment({
      customerId: Number(customerId),
      amount: Number(amount)
    });

    setIsOpen(false);
    setCustomerId("");
    setAmount("");

    alert("تم إضافة الدفعة بنجاح");
  };

  return (
    <>
      <Navbar onAddPayment={() => setIsOpen(true)} />

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-5 sm:p-6 rounded-2xl">

            <h2 className="text-base sm:text-lg font-bold mb-4">
              إضافة دفعة
            </h2>

            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full border p-2 rounded mb-3 text-sm"
            >
              <option value="">اختر عميل</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="المبلغ"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2 rounded mb-4 text-sm"
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2">

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded w-full sm:w-auto"
              >
                إلغاء
              </button>

              <button
                onClick={handleSavePayment}
                className="px-4 py-2 bg-green-600 text-white rounded w-full sm:w-auto"
              >
                حفظ
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Page */}
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 py-6 space-y-6">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-linear-to-r from-blue-900 to-blue-600 text-white p-5 sm:p-6 rounded-2xl shadow-lg"
          >
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
              لوحة التحكم
            </h1>
            <p className="opacity-80 text-xs sm:text-sm mt-2">
              ملخص شامل لحالة النظام
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
          >
            <StatCard title="إجمالي المبيعات" value={stats.totalSales} />
            <StatCard title="صافي الربح" value={stats.totalProfit} />
            <StatCard title="مبيعات اليوم" value={stats.todaySales} />
            <StatCard title="عدد الفواتير" value={stats.invoices} isMoney={false} />
            <StatCard title="عدد المنتجات" value={stats.products} isMoney={false} />
            <StatCard title="عدد العملاء" value={stats.customers} isMoney={false} />
          </motion.div>

          {/* Low Stock */}
          <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold mb-4 text-blue-900">
              المنتجات منخفضة المخزون
            </h2>

            {lowStockProducts.length === 0 ? (
              <p className="text-gray-400 text-sm">
                لا يوجد منتجات منخفضة المخزون
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product, index) => (
                  <div
                    key={product.id + "-" + index}
                    className="flex justify-between items-center border rounded-xl p-3 text-sm"
                  >
                    <span>{product.name}</span>

                    <span className="text-red-600 font-bold">
                      {product.quantity}
                    </span>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart */}
          {chartData && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow"
            >
              <h2 className="text-base sm:text-lg font-bold text-blue-900 mb-4">
                الرسم البياني للمبيعات
              </h2>

              <div className="h-64 sm:h-80 md:h-96">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, isMoney = true }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-2xl shadow-md p-4 sm:p-5 transition-all"
    >
      <p className="text-gray-500 text-xs sm:text-sm mb-1 truncate">
        {title}
      </p>

      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">
        {value.toLocaleString()} {isMoney && "جنيه"}
      </h3>
    </motion.div>
  );
}