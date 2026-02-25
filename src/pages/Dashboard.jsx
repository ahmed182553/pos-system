import MainLayout from "../layout/MainLayout";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getProducts, getCustomers, getInvoices } from "../services/dataService";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

// Animation Variants
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
    const products = getProducts();
    const customers = getCustomers();
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
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.total || 0), 0);

    setStats({
      products: products.length,
      customers: customers.length,
      invoices: invoices.length,
      totalSales,
      totalProfit,
      todaySales
    });

    setLowStockProducts(products.filter(p => p.quantity < 10));

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

  return (<>
    <Navbar />

    <div className="p-4 md:p-6 space-y-6">

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-linear-to-r from-blue-900 to-blue-600 text-white p-6 rounded-2xl shadow-lg"
      >
        <h1 className="text-xl md:text-2xl font-bold">
          لوحة التحكم
        </h1>
        <p className="opacity-80 text-sm md:text-base mt-2">
          ملخص شامل لحالة النظام
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4
                     grid-cols-1
                     sm:grid-cols-2
                     lg:grid-cols-3
                     xl:grid-cols-6"
      >
        <StatCard title="إجمالي المبيعات" value={stats.totalSales} />
        <StatCard title="صافي الربح" value={stats.totalProfit} />
        <StatCard title="مبيعات اليوم" value={stats.todaySales} />
        <StatCard title="عدد الفواتير" value={stats.invoices} />
        <StatCard title="عدد المنتجات" value={stats.products} />
        <StatCard title="عدد العملاء" value={stats.customers} />
      </motion.div>

      {/* Low Stock */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow p-4 md:p-6 overflow-x-auto"
      >
        <h2 className="text-lg font-bold mb-4 text-blue-900">
          المنتجات منخفضة المخزون
        </h2>

        <table className="w-full min-w-100 text-sm md:text-base">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 text-right">المنتج</th>
              <th className="py-2 text-right">الكمية</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center py-4 text-gray-400">
                  لا يوجد منتجات منخفضة المخزون
                </td>
              </tr>
            ) : (
              lowStockProducts.map(product => (
                <tr key={product.id} className="border-b">
                  <td className="py-2">{product.name}</td>
                  <td className="py-2 text-red-600 font-semibold">
                    {product.quantity}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Chart */}
      {chartData && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-4 md:p-6 rounded-2xl shadow"
        >
          <h2 className="text-lg font-bold text-blue-900 mb-4">
            الرسم البياني للمبيعات
          </h2>

          <div className="h-75 md:h-100">
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
  </>
  );
}

function StatCard({ title, value }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-2xl shadow-md p-4 transition-all"
    >
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <h3 className="text-xl font-bold text-blue-900">
        {value.toLocaleString()} جنيه
      </h3>
    </motion.div>
  );
}