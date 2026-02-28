import { useEffect, useState, useRef } from "react";
import { getCustomers } from "../services/customerService";
import { useReactToPrint } from "react-to-print";

export default function Statement() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [transactions, setTransactions] = useState([]);
    const printRef = useRef(null);

    const selectedCustomer = customers.find(
        c => c.id === Number(selectedCustomerId)
    );

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "كشف حساب",
        pageStyle: `
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          -webkit-print-color-adjust: exact;
        }
      `
    });

    useEffect(() => {
        setCustomers(getCustomers());
    }, []);

    useEffect(() => {
        if (!selectedCustomerId) return;

        const invoices =
            JSON.parse(localStorage.getItem("invoices")) || [];

        const payments =
            JSON.parse(localStorage.getItem("payments")) || [];

        const customer = customers.find(
            c => c.id === Number(selectedCustomerId)
        );

        const previousBalance = customer?.previousBalance || 0;

        const customerInvoices = invoices
            .filter(inv => inv.customerId === Number(selectedCustomerId))
            .map(inv => ({
                rawDate: inv.date,
                date: new Date(inv.date).toLocaleString("ar-EG"),
                description: "فاتورة",
                debit: inv.total,
                credit: 0
            }));

        const customerPayments = payments
            .filter(pay => pay.customerId === Number(selectedCustomerId))
            .map(pay => ({
                rawDate: pay.date,
                date: new Date(pay.date).toLocaleString("ar-EG"),
                description: "دفعة",
                debit: 0,
                credit: pay.amount
            }));

        // ✅ إضافة الرصيد السابق كأول معاملة
        const openingTransaction =
            previousBalance !== 0
                ? [{
                    rawDate: "1900-01-01",
                    date: "رصيد سابق",
                    description: "رصيد سابق",
                    debit: previousBalance > 0 ? previousBalance : 0,
                    credit: previousBalance < 0 ? Math.abs(previousBalance) : 0
                }]
                : [];

        const allTransactions =
            [...openingTransaction, ...customerInvoices, ...customerPayments]
                .sort((a, b) =>
                    new Date(a.rawDate) - new Date(b.rawDate)
                );

        let balance = 0;

        const withBalance = allTransactions.map(t => {

            balance += t.debit;
            balance -= t.credit;

            return { ...t, balance };
        });

        setTransactions(withBalance);

    }, [selectedCustomerId, customers]);

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
                <option value="">اختر عميل</option>
                {customers.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>

            {selectedCustomerId && (
                <button
                    onClick={handlePrint}
                    className="no-print mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    طباعة كشف الحساب
                </button>
            )}

            {transactions.length > 0 && (
                <div
                    ref={printRef}
                    className="print-container bg-white p-6"
                >

                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold">
                            كشف حساب عميل
                        </h2>
                        <p className="mt-2">
                            اسم العميل: {selectedCustomer?.name}
                        </p>
                        <p>
                            تاريخ الطباعة:{" "}
                            {new Date().toLocaleDateString("ar-EG")}
                        </p>
                    </div>

                    <table className="w-full text-right text-[11px] border-collapse">
                        <thead>
                            <tr className="border-b font-bold bg-gray-100">
                                <th className="p-2">التاريخ</th>
                                <th className="p-2">البيان</th>
                                <th className="p-2">مدين</th>
                                <th className="p-2">دائن</th>
                                <th className="p-2">الرصيد</th>
                            </tr>
                        </thead>

                        <tbody>
                            {transactions.map((t, i) => (
                                <tr key={i} className="border-b text-center">
                                    <td className="p-2">{t.date}</td>
                                    <td className="p-2">{t.description}</td>
                                    <td className="p-2">
                                        {t.debit || "-"}
                                    </td>
                                    <td className="p-2">
                                        {t.credit || "-"}
                                    </td>

                                    <td
                                        className={`p-2 font-bold ${t.balance > 0
                                                ? "text-red-600"
                                                : t.balance < 0
                                                    ? "text-green-600"
                                                    : ""
                                            }`}
                                    >
                                        {t.balance}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div
                        className={`mt-6 font-bold text-lg text-center ${finalBalance > 0
                                ? "text-red-600"
                                : finalBalance < 0
                                    ? "text-green-600"
                                    : ""
                            }`}
                    >
                        الرصيد النهائي: {finalBalance} جنيه{" "}
                        {finalBalance > 0
                            ? "(العميل عليه)"
                            : finalBalance < 0
                                ? "(العميل له)"
                                : ""}
                    </div>

                </div>
            )}

        </div>
    );
}