import { useEffect, useState, useMemo } from "react";

export default function AllInvoices() {

    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        loadInvoices();
        window.addEventListener("productsUpdated", loadInvoices);
        return () =>
            window.removeEventListener("productsUpdated", loadInvoices);
    }, []);

    const loadInvoices = () => {
        const saved = JSON.parse(localStorage.getItem("invoices")) || [];

        const sorted = [...saved].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        setInvoices(sorted);
    };

    const deleteInvoice = (id) => {

        const confirmDelete = window.confirm("هل أنت متأكد من حذف الفاتورة؟");

        if (!confirmDelete) return;

        const original = JSON.parse(localStorage.getItem("invoices")) || [];
        const updated = original.filter(inv => inv.id !== id);

        localStorage.setItem("invoices", JSON.stringify(updated));

        loadInvoices();

        alert("تم حذف الفاتورة بنجاح");
    };

    // 🔍 فلترة بالرقم أو الاسم
    const filteredInvoices = useMemo(() => {

        const customers = JSON.parse(localStorage.getItem("customers")) || [];

        return invoices.filter(inv => {

            const customer = customers.find(c => c.id === inv.customerId);
            const customerName = customer?.name || inv.customerName || "";

            const matchesSearch =
                search === "" ||
                inv.id.toString().includes(search) ||
                customerName.toLowerCase().includes(search.toLowerCase());

            const invoiceDate = new Date(inv.date);

            const matchesFrom =
                !fromDate ||
                invoiceDate >= new Date(fromDate + "T00:00:00");

            const matchesTo =
                !toDate ||
                invoiceDate <= new Date(toDate + "T23:59:59");

            return matchesSearch && matchesFrom && matchesTo;
        });

    }, [invoices, search, fromDate, toDate]);

    // 🧮 الحسابات + حالة الفاتورة
    const payments = JSON.parse(localStorage.getItem("payments")) || [];

    const getInvoiceData = (invoice) => {

        const allInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
        const customers = JSON.parse(localStorage.getItem("customers")) || [];
        const payments = JSON.parse(localStorage.getItem("payments")) || [];

        const customer = customers.find(
            c => Number(c.id) === Number(invoice.customerId)
        );

        let previousBalance = Number(customer?.previousBalance || 0);

        // الفواتير الأقدم فقط
        const olderInvoices = allInvoices.filter(
            inv =>
                Number(inv.customerId) === Number(invoice.customerId) &&
                new Date(inv.date) < new Date(invoice.date)
        );

        const totalOlderInvoices = olderInvoices.reduce(
            (sum, inv) => sum + inv.total,
            0
        );

        // المدفوعات الخاصة بالفواتير الأقدم فقط
        const olderPayments = payments.filter(p => {

            const relatedInvoice = olderInvoices.find(
                inv => inv.id === p.invoiceId
            );

            return relatedInvoice;
        });

        const totalOlderPayments = olderPayments.reduce(
            (sum, p) => sum + p.amount,
            0
        );

        previousBalance =
            previousBalance +
            totalOlderInvoices -
            totalOlderPayments;

        // مدفوعات الفاتورة الحالية
        const invoicePayments = payments.filter(
            p => p.invoiceId === invoice.id
        );

        const collected = invoicePayments.reduce(
            (sum, p) => sum + p.amount,
            0
        );

        const remaining =
            (invoice.total + previousBalance) - collected;

        let status = "غير مدفوعة";
        let statusColor = "bg-red-100 text-red-700";

        if (remaining <= 0) {
            status = "مدفوعة";
            statusColor = "bg-green-100 text-green-700";
        } else if (collected > 0) {
            status = "دفع جزئي";
            statusColor = "bg-yellow-100 text-yellow-700";
        }

        return {
            collected,
            remaining,
            previousBalance,
            status,
            statusColor
        };
    };

    // 🖨 طباعة فاتورة واحدة
    const printSingleInvoice = (invoice) => {

        const data = getInvoiceData(invoice);

        const printWindow = window.open("", "", "width=900,height=700");

        printWindow.document.write(`
            <html>
            <head>
                <title>فاتورة رقم ${invoice.id}</title>
                <style>
                    body { font-family: Arial; direction: rtl; padding: 20px; }
                    h2 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
                    .total { margin-top: 20px; font-weight: bold; font-size: 18px; }
                </style>
            </head>
            <body>

                <h2>فاتورة بيع</h2>

                <p><strong>رقم الفاتورة:</strong> ${invoice.id}</p>
                <p><strong>العميل:</strong> ${invoice.customerName || "عميل نقدي"}</p>
                <p><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleString("ar-EG")}</p>

                <table>
                    <thead>
                        <tr>
                            <th>الصنف</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${item.sellPrice}</td>
                                <td>${item.sellPrice * item.quantity}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>

                <div class="total">
                    إجمالي الفاتورة: ${invoice.total} ج <br/>
                    الرصيد السابق: ${data.previousBalance} ج <br/>
                    المحصل: ${data.collected} ج <br/>
                    المتبقي: ${data.remaining} ج
                </div>

            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    };


    return (
        <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                تقرير الفواتير
            </h2>

            {/* الفلاتر */}
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

                <input
                    type="text"
                    placeholder="بحث برقم أو اسم العميل"
                    className="p-2 border rounded text-sm sm:text-base"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <input
                    type="date"
                    className="p-2 border rounded text-sm sm:text-base"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />

                <input
                    type="date"
                    className="p-2 border rounded text-sm sm:text-base"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />

            </div>

            {/* عرض الفواتير */}
            <div className="space-y-3 sm:space-y-4">

                {filteredInvoices.length === 0 && (
                    <p className="text-gray-500 text-sm">لا توجد بيانات</p>
                )}

                {filteredInvoices.map((invoice) => {

                    const data = getInvoiceData(invoice);

                    return (
                        <div
                            key={invoice.id}
                            className="bg-white p-3 sm:p-4 rounded-xl shadow"
                        >

                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">

                                <div className="space-y-1">

                                    <p className="font-bold text-sm sm:text-base">
                                        فاتورة رقم: {invoice.id}
                                    </p>

                                    <p className="text-xs sm:text-sm text-gray-500">
                                        {invoice.customerName || "عميل نقدي"}
                                    </p>

                                    <p className="text-xs text-gray-400">
                                        {new Date(invoice.date).toLocaleString("ar-EG")}
                                    </p>

                                    <span className={`inline-block text-xs px-2 py-1 rounded ${data.statusColor}`}>
                                        {data.status}
                                    </span>

                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

                                    <button
                                        onClick={() => printSingleInvoice(invoice)}
                                        className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm w-full sm:w-auto"
                                    >
                                        طباعة
                                    </button>

                                    <button
                                        onClick={() => deleteInvoice(invoice.id)}
                                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm w-full sm:w-auto"
                                    >
                                        حذف
                                    </button>

                                </div>

                            </div>

                            {/* Items */}
                            <div className="border-t pt-2 space-y-1 text-xs sm:text-sm">

                                {invoice.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between gap-2"
                                    >
                                        <span className="truncate">
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span className="whitespace-nowrap">
                                            {item.sellPrice * item.quantity} ج
                                        </span>
                                    </div>
                                ))}

                            </div>

                            {/* Totals */}
                            <div className="border-t mt-2 pt-2 text-xs sm:text-sm space-y-1">

                                <div>إجمالي الفاتورة: {invoice.total} ج</div>
                                <div>الرصيد السابق: {data.previousBalance} ج</div>
                                <div>المحصل: {data.collected} ج</div>

                                <div className="font-bold text-red-600">
                                    المتبقي: {data.remaining} ج
                                </div>

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}
