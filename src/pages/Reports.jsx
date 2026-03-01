import { useEffect, useState } from "react";

export default function Reports() {
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState("all");

    useEffect(() => {
        setInvoices(JSON.parse(localStorage.getItem("invoices")) || []);
        setPayments(JSON.parse(localStorage.getItem("payments")) || []);
        setCustomers(JSON.parse(localStorage.getItem("customers")) || []);
    }, []);

    const filteredInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.date);
        return (
            (selectedCustomer === "all" ||
                inv.customerId === Number(selectedCustomer)) &&
            (!fromDate || invDate >= new Date(fromDate)) &&
            (!toDate || invDate <= new Date(toDate))
        );
    });

    const filteredPayments = payments.filter((pay) => {
        const payDate = new Date(pay.date);
        return (
            (selectedCustomer === "all" ||
                pay.customerId === Number(selectedCustomer)) &&
            (!fromDate || payDate >= new Date(fromDate)) &&
            (!toDate || payDate <= new Date(toDate))
        );
    });

    let totalSales = 0;
    let totalCost = 0;
    let totalProfit = 0;

    filteredInvoices.forEach((inv) => {
        inv.items.forEach((item) => {
            const sales = item.sellPrice * item.quantity;
            const cost = item.buyPrice * item.quantity;
            totalSales += sales;
            totalCost += cost;
            totalProfit += sales - cost;
        });
    });

    const profitPercentage =
        totalCost > 0
            ? ((totalProfit / totalCost) * 100).toFixed(1)
            : 0;

    const now = new Date();

    const monthlyProfit = invoices
        .filter((inv) => {
            const d = new Date(inv.date);
            return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
            );
        })
        .reduce(
            (sum, inv) =>
                sum +
                inv.items.reduce(
                    (itemSum, item) =>
                        itemSum +
                        (item.sellPrice - item.buyPrice) *
                        item.quantity,
                    0
                ),
            0
        );

    return (
        <div className="w-full p-4 sm:p-6 bg-gray-50 min-h-screen" dir="rtl">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
                التقارير المالية
            </h2>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                    className="border p-2 rounded w-full sm:w-auto"
                    value={selectedCustomer}
                    onChange={(e) =>
                        setSelectedCustomer(e.target.value)
                    }
                >
                    <option value="all">كل العملاء</option>
                    {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    className="border p-2 rounded w-full sm:w-auto"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />

                <input
                    type="date"
                    className="border p-2 rounded w-full sm:w-auto"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card title="إجمالي المبيعات" value={totalSales} />
                <Card title="رأس المال" value={totalCost} />
                <Card title="إجمالي الربح" value={totalProfit} green />
                <Card
                    title="نسبة الربح"
                    value={profitPercentage + "%"}
                    blue
                />
            </div>

            {/* ================= Desktop Table ================= */}
            <div className="hidden md:block bg-white p-6 rounded-xl shadow">
                <h3 className="font-bold mb-4">تقرير العملاء</h3>

                <table className="w-full text-right border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">العميل</th>
                            <th className="p-2 border">رصيد سابق</th>
                            <th className="p-2 border">المبيعات</th>
                            <th className="p-2 border">إجمالي المديونية</th>
                            <th className="p-2 border">المدفوع</th>
                            <th className="p-2 border">المتبقي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => {
                            const previousBalance =
                                customer.previousBalance || 0;

                            const customerInvoices =
                                filteredInvoices.filter(
                                    (inv) =>
                                        inv.customerId ===
                                        customer.id
                                );

                            const customerPayments =
                                filteredPayments.filter(
                                    (pay) =>
                                        pay.customerId ===
                                        customer.id
                                );

                            const totalInv =
                                customerInvoices.reduce(
                                    (sum, inv) =>
                                        sum + inv.total,
                                    0
                                );

                            const totalPaid =
                                customerPayments.reduce(
                                    (sum, pay) =>
                                        sum + pay.amount,
                                    0
                                );

                            const totalDebt =
                                previousBalance + totalInv;

                            const remaining =
                                totalDebt - totalPaid;

                            return (
                                <tr key={customer.id}>
                                    <td className="p-2 border">
                                        {customer.name}
                                    </td>
                                    <td className="p-2 border">
                                        {previousBalance} ج
                                    </td>
                                    <td className="p-2 border">
                                        {totalInv} ج
                                    </td>
                                    <td className="p-2 border">
                                        {totalDebt} ج
                                    </td>
                                    <td className="p-2 border">
                                        {totalPaid} ج
                                    </td>
                                    <td
                                        className={`p-2 border font-bold ${remaining > 0
                                                ? "text-red-600"
                                                : "text-green-600"
                                            }`}
                                    >
                                        {remaining} ج
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ================= Mobile Cards ================= */}
            <div className="md:hidden space-y-4">
                {customers.map((customer) => {
                    const previousBalance =
                        customer.previousBalance || 0;

                    const customerInvoices =
                        filteredInvoices.filter(
                            (inv) =>
                                inv.customerId === customer.id
                        );

                    const customerPayments =
                        filteredPayments.filter(
                            (pay) =>
                                pay.customerId === customer.id
                        );

                    const totalInv =
                        customerInvoices.reduce(
                            (sum, inv) =>
                                sum + inv.total,
                            0
                        );

                    const totalPaid =
                        customerPayments.reduce(
                            (sum, pay) =>
                                sum + pay.amount,
                            0
                        );

                    const totalDebt =
                        previousBalance + totalInv;

                    const remaining =
                        totalDebt - totalPaid;

                    return (
                        <div
                            key={customer.id}
                            className="bg-white p-4 rounded-xl shadow"
                        >
                            <h4 className="font-bold mb-2">
                                {customer.name}
                            </h4>

                            <div className="text-sm space-y-1">
                                <p>رصيد سابق: {previousBalance} ج</p>
                                <p>المبيعات: {totalInv} ج</p>
                                <p>إجمالي المديونية: {totalDebt} ج</p>
                                <p>المدفوع: {totalPaid} ج</p>
                                <p
                                    className={`font-bold ${remaining > 0
                                            ? "text-red-600"
                                            : "text-green-600"
                                        }`}
                                >
                                    المتبقي: {remaining} ج
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Card({ title, value, green, blue }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow text-center">
            <p className="text-gray-500 text-sm">{title}</p>
            <h3
                className={`text-2xl font-bold mt-2 ${green
                        ? "text-green-600"
                        : blue
                            ? "text-blue-600"
                            : "text-black"
                    }`}
            >
                {value}
            </h3>
        </div>
    );
}