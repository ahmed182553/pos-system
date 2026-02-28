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

    // فلترة
    const filteredInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.date);

        const matchCustomer =
            selectedCustomer === "all" ||
            inv.customerId === Number(selectedCustomer);

        const matchDate =
            (!fromDate || invDate >= new Date(fromDate)) &&
            (!toDate || invDate <= new Date(toDate));

        return matchCustomer && matchDate;
    });

    const filteredPayments = payments.filter((pay) => {
        const payDate = new Date(pay.date);

        const matchCustomer =
            selectedCustomer === "all" ||
            pay.customerId === Number(selectedCustomer);

        const matchDate =
            (!fromDate || payDate >= new Date(fromDate)) &&
            (!toDate || payDate <= new Date(toDate));

        return matchCustomer && matchDate;
    });

    // ================= الحسابات =================

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

    const totalPayments = filteredPayments.reduce(
        (sum, pay) => sum + pay.amount,
        0
    );

    // ================= ربح الشهر =================

    const now = new Date();

    const monthlyProfit = invoices
        .filter((inv) => {
            const d = new Date(inv.date);
            return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
            );
        })
        .reduce((sum, inv) => {
            return (
                sum +
                inv.items.reduce(
                    (itemSum, item) =>
                        itemSum +
                        (item.sellPrice - item.buyPrice) *
                        item.quantity,
                    0
                )
            );
        }, 0);

    // ================= مقارنة فترة =================

    let previousPeriodProfit = 0;

    if (fromDate && toDate) {
        const diff =
            new Date(toDate).getTime() - new Date(fromDate).getTime();

        const prevFrom = new Date(new Date(fromDate).getTime() - diff);
        const prevTo = new Date(new Date(toDate).getTime() - diff);

        previousPeriodProfit = invoices
            .filter((inv) => {
                const d = new Date(inv.date);
                return d >= prevFrom && d <= prevTo;
            })
            .reduce((sum, inv) => {
                return (
                    sum +
                    inv.items.reduce(
                        (itemSum, item) =>
                            itemSum +
                            (item.sellPrice - item.buyPrice) *
                            item.quantity,
                        0
                    )
                );
            }, 0);
    }

    const growth =
        previousPeriodProfit > 0
            ? (
                ((totalProfit - previousPeriodProfit) /
                    previousPeriodProfit) *
                100
            ).toFixed(1)
            : 0;

    const growthColor =
        growth > 0
            ? "text-green-600"
            : growth < 0
                ? "text-red-600"
                : "text-gray-500";

    const handlePrint = () => window.print();

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
            <h2 className="text-2xl font-bold mb-6">
                التقارير المالية
            </h2>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <select
                    className="border p-2 rounded"
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
                    className="border p-2 rounded"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
                <input
                    type="date"
                    className="border p-2 rounded"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />

                <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    طباعة
                </button>
            </div>

            {/* KPI */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card title="إجمالي المبيعات" value={totalSales} />
                <Card title="رأس المال" value={totalCost} />
                <Card title="إجمالي الربح" value={totalProfit} green />
                <Card
                    title="نسبة الربح"
                    value={profitPercentage + "%"}
                    blue
                />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card
                    title="ربح الشهر الحالي"
                    value={monthlyProfit}
                    green
                />
                <Card
                    title="ربح الفترة السابقة"
                    value={previousPeriodProfit}
                />
                <Card
                    title="نسبة النمو"
                    value={growth + "%"}
                    customColor={growthColor}
                />
            </div>

            {/* تقرير العملاء */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="font-bold mb-4">
                    تقرير العملاء
                </h3>

                <table className="w-full text-right border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2">العميل</th>
                            <th className="p-2">رصيد سابق</th>
                            <th className="p-2">المبيعات</th>
                            <th className="p-2">إجمالي المديونية</th>
                            <th className="p-2">المدفوع</th>
                            <th className="p-2">المتبقي</th>
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
                                <tr
                                    key={customer.id}
                                    className="border-t"
                                >
                                    <td className="p-2">
                                        {customer.name}
                                    </td>
                                    <td className="p-2">
                                        {previousBalance} ج
                                    </td>
                                    <td className="p-2">
                                        {totalInv} ج
                                    </td>
                                    <td className="p-2">
                                        {totalDebt} ج
                                    </td>
                                    <td className="p-2">
                                        {totalPaid} ج
                                    </td>
                                    <td
                                        className={`p-2 font-bold ${remaining > 0
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
        </div>
    );
}

function Card({ title, value, green, blue, customColor }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">{title}</p>
            <h3
                className={`text-2xl font-bold mt-2 ${customColor
                        ? customColor
                        : green
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