import { useEffect, useState } from "react";

export default function AllInvoices() {

    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");

    // تحميل الفواتير
    useEffect(() => {
        loadInvoices();

        // سماع أي تحديث
        const handleUpdate = () => {
            loadInvoices();
        };

        window.addEventListener("productsUpdated", handleUpdate);

        return () => {
            window.removeEventListener("productsUpdated", handleUpdate);
        };

    }, []);

    const loadInvoices = () => {
        const saved =
            JSON.parse(localStorage.getItem("invoices")) || [];

        // الأحدث أولاً
        setInvoices(saved.reverse());
    };

    // حذف فاتورة
    const deleteInvoice = (id) => {

        const updated = invoices.filter(inv => inv.id !== id);

        localStorage.setItem(
            "invoices",
            JSON.stringify(updated.reverse())
        );

        setInvoices(updated);
    };

    // فلترة
    const filteredInvoices = invoices.filter(inv =>
        inv.id.toString().includes(search)
    );

    // إجمالي المبيعات
    const totalSales = invoices.reduce(
        (acc, inv) => acc + inv.total,
        0
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            <h2 className="text-2xl font-bold mb-4">
                جميع الفواتير
            </h2>

            {/* احصائيات */}
            <div className="bg-white p-4 rounded-xl shadow mb-6">
                <p className="font-semibold">
                    إجمالي عدد الفواتير: {invoices.length}
                </p>
                <p className="text-blue-600 font-bold">
                    إجمالي المبيعات: {totalSales} جنيه
                </p>
            </div>

            {/* بحث */}
            <input
                type="text"
                placeholder="بحث برقم الفاتورة..."
                className="mb-6 p-2 border rounded w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* عرض الفواتير */}
            <div className="space-y-4">

                {filteredInvoices.length === 0 && (
                    <p className="text-gray-500">
                        لا توجد فواتير
                    </p>
                )}

                {filteredInvoices.map((invoice) => (

                    <div
                        key={invoice.id}
                        className="bg-white p-4 rounded-xl shadow"
                    >

                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <p className="font-bold">
                                    فاتورة رقم: {invoice.id}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {invoice.date}
                                </p>
                            </div>

                            <button
                                onClick={() => deleteInvoice(invoice.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                                حذف
                            </button>
                        </div>

                        <div className="border-t pt-2 space-y-1">

                            {invoice.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between text-sm"
                                >
                                    <span>
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span>
                                        {item.sellPrice * item.quantity} جنيه
                                    </span>
                                </div>
                            ))}

                        </div>

                        <div className="border-t mt-2 pt-2 text-right font-bold text-blue-600">
                            الإجمالي: {invoice.total} جنيه
                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}