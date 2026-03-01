import { useEffect, useState, useMemo } from "react";

export default function DailyPayments() {

    const [payments, setPayments] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        loadData();
        window.addEventListener("productsUpdated", loadData);
        return () =>
            window.removeEventListener("productsUpdated", loadData);
    }, []);

    const loadData = () => {
        setPayments(JSON.parse(localStorage.getItem("payments")) || []);
        setCustomers(JSON.parse(localStorage.getItem("customers")) || []);
        setInvoices(JSON.parse(localStorage.getItem("invoices")) || []);
    };

    // فلترة حسب التاريخ
    const filteredPayments = useMemo(() => {
        return payments.filter(p =>
            new Date(p.date).toISOString().split("T")[0] === selectedDate
        );
    }, [payments, selectedDate]);

    const totalToday = filteredPayments.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    // الفواتير الخاصة بالعميل
    const customerInvoices = invoices.filter(
        inv => Number(inv.customerId) === Number(selectedCustomer)
    );

    const handleAddPayment = () => {

        if (!selectedCustomer || !selectedInvoice || !amount) {
            alert("اكمل البيانات");
            return;
        }

        const invoice = invoices.find(
            inv => inv.id === Number(selectedInvoice)
        );

        const invoicePayments = payments.filter(
            p => p.invoiceId === invoice.id
        );

        const totalPaid = invoicePayments.reduce(
            (sum, p) => sum + p.amount,
            0
        );

        const remaining = invoice.total - totalPaid;

        if (Number(amount) > remaining) {
            alert("المبلغ أكبر من المتبقي");
            return;
        }

        const newPayment = {
            id: Date.now(),
            customerId: Number(selectedCustomer),
            invoiceId: Number(selectedInvoice),
            amount: Number(amount),
            date: new Date().toISOString()
        };

        const updated = [...payments, newPayment];

        localStorage.setItem("payments", JSON.stringify(updated));

        setShowModal(false);
        setAmount("");
        setSelectedCustomer("");
        setSelectedInvoice("");

        loadData();
        window.dispatchEvent(new Event("productsUpdated"));
    };
    const clearAllPayments = () => {
        localStorage.removeItem("payments");
        setPayments([]);
    };

    return (
        <div dir="rtl" className="p-3 sm:p-6 bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">

                <h2 className="text-xl sm:text-2xl font-bold">
                    تحصيلات العملاء
                </h2>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm w-full sm:w-auto"
                    >
                        + إضافة دفعة
                    </button>

                    <button
                        onClick={clearAllPayments}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
                    >
                        مسح كل الدفعات
                    </button>

                </div>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-gray-500 text-sm">إجمالي تحصيل اليوم</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                        {totalToday} ج
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-gray-500 text-sm">عدد الدفعات</p>
                    <p className="text-xl sm:text-2xl font-bold">
                        {filteredPayments.length}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border p-2 rounded w-full text-sm"
                    />
                </div>

            </div>

            {/* Payments List */}
            <div className="bg-white rounded-xl shadow p-3 sm:p-4 space-y-4">

                {filteredPayments.length === 0 && (
                    <p className="text-gray-500 text-sm">
                        لا توجد تحصيلات في هذا اليوم
                    </p>
                )}

                {filteredPayments.map(p => {

                    const customer = customers.find(
                        c => c.id === p.customerId
                    );

                    return (
                        <div
                            key={p.id}
                            className="border rounded-xl p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm"
                        >

                            <div className="space-y-1">
                                <div className="font-bold">
                                    {customer?.name}
                                </div>

                                <div className="text-gray-500">
                                    فاتورة رقم: {p.invoiceId}
                                </div>

                                <div className="text-gray-400 text-xs">
                                    {new Date(p.date).toLocaleString("ar-EG")}
                                </div>
                            </div>

                            <div className="text-green-600 font-bold text-base">
                                {p.amount} ج
                            </div>

                        </div>
                    );
                })}

            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

                    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow w-full max-w-md">

                        <h3 className="text-base sm:text-lg font-bold mb-4">
                            إضافة دفعة جديدة
                        </h3>

                        <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            className="w-full border p-2 rounded mb-3 text-sm"
                        >
                            <option value="">اختر عميل</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedInvoice}
                            onChange={(e) => setSelectedInvoice(e.target.value)}
                            className="w-full border p-2 rounded mb-3 text-sm"
                        >
                            <option value="">اختر فاتورة</option>
                            {customerInvoices.map(inv => (
                                <option key={inv.id} value={inv.id}>
                                    {inv.id} - {inv.total} ج
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="قيمة الدفعة"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full border p-2 rounded mb-4 text-sm"
                        />

                        <div className="flex flex-col sm:flex-row justify-end gap-2">

                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
                            >
                                إلغاء
                            </button>

                            <button
                                onClick={handleAddPayment}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
                            >
                                حفظ
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}