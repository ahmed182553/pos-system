import { useEffect, useState } from "react";
import { getCustomers } from "../services/customerService";

export default function Statement() {

    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        setCustomers(getCustomers());
    }, []);

    useEffect(() => {
        if (!selectedCustomerId) return;

        const invoices =
            JSON.parse(localStorage.getItem("invoices")) || [];

        const payments =
            JSON.parse(localStorage.getItem("payments")) || [];

        const customerInvoices = invoices
            .filter(inv => inv.customerId === Number(selectedCustomerId))
            .map(inv => ({
                date: new Date(inv.date).toLocaleString("ar-EG"),
                description: "فاتورة",
                debit: inv.total,
                credit: 0
            }));

        const customerPayments = payments
            .filter(pay => pay.customerId === Number(selectedCustomerId))
            .map(pay => ({
                date: new Date(pay.date).toLocaleString("ar-EG"),
                description: "دفعة",
                debit: 0,
                credit: pay.amount
            }));

        const allTransactions =
            [...customerInvoices, ...customerPayments]
                .sort((a, b) =>
                    new Date(a.date) - new Date(b.date)
                );

        // حساب الرصيد التراكمي
        let balance = 0;
        const withBalance = allTransactions.map(t => {
            balance = balance + t.debit - t.credit;
            return { ...t, balance };
        });

        setTransactions(withBalance);

    }, [selectedCustomerId]);

    const finalBalance =
        transactions.length > 0
            ? transactions[transactions.length - 1].balance
            : 0;

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">

            <h2 className="text-2xl font-bold mb-6">
                كشف حساب العميل
            </h2>

            <select
                className="border p-2 rounded mb-6 w-full"
                value={selectedCustomerId}
                onChange={(e) =>
                    setSelectedCustomerId(e.target.value)
                }
            >
                <option value="">
                    اختر عميل
                </option>

                {customers.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>

            {transactions.length > 0 && (

                <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">

                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b font-bold">
                                <th>التاريخ</th>
                                <th>البيان</th>
                                <th>مدين</th>
                                <th>دائن</th>
                                <th>الرصيد</th>
                            </tr>
                        </thead>

                        <tbody>
                            {transactions.map((t, i) => (
                                <tr key={i} className="border-b">
                                    <td>{t.date}</td>
                                    <td>{t.description}</td>
                                    <td>{t.debit || "-"}</td>
                                    <td>{t.credit || "-"}</td>
                                    <td className="font-bold">
                                        {t.balance}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 font-bold">
                        الرصيد النهائي:
                        {Math.abs(finalBalance)} جنيه
                        {finalBalance > 0 ? " (مدين)" : finalBalance < 0 ? " (دائن)" : ""}
                    </div>

                </div>
            )}

        </div>
    );
}