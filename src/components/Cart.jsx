import { useState } from "react";

export default function Cart({
    cart,
    totalAmount,
    increaseQty,
    decreaseQty,
    removeItem,
    handleCheckout,
    customers,
    selectedCustomer,
    setSelectedCustomer
}) {

    const [paymentType, setPaymentType] = useState("cash");
    const [paymentAmount, setPaymentAmount] = useState("");

    const invoiceNumber = "فاتورة-" + Date.now();
    const date = new Date().toLocaleString();

    const currentCustomer = customers.find(
        c => c.id === Number(selectedCustomer)
    );

    // 🧮 حساب الرصيد السابق الحقيقي
    const allInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
    const payments = JSON.parse(localStorage.getItem("payments")) || [];

    let previousBalance = 0;

    if (currentCustomer) {

        const openingBalance = Number(currentCustomer.previousBalance || 0);

        const customerInvoices = allInvoices.filter(
            inv => inv.customerId === selectedCustomer
        );

        const totalInvoices = customerInvoices.reduce(
            (sum, inv) => sum + inv.total,
            0
        );

        const customerPayments = payments.filter(
            p => p.customerId === selectedCustomer
        );

        const totalPayments = customerPayments.reduce(
            (sum, p) => sum + p.amount,
            0
        );

        previousBalance = openingBalance + totalInvoices - totalPayments;
    }

    const payment = Number(paymentAmount) || 0;

    const totalDue = previousBalance + totalAmount;

    const remaining = totalDue - payment;

    // 🔥 إتمام البيع + حفظ الدفعة
    const handleCompleteSale = () => {

        if (cart.length === 0) {
            alert("السلة فارغة");
            return;
        }

        if (!selectedCustomer) {
            alert("اختر عميل أولاً");
            return;
        }

        if (payment > totalDue) {
            alert("المبلغ أكبر من إجمالي المستحق");
            return;
        }

        const savedProducts = JSON.parse(localStorage.getItem("products")) || [];
        const allInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
        const allPayments = JSON.parse(localStorage.getItem("payments")) || [];

        // 1️⃣ خصم المخزون
        const updatedProducts = savedProducts.map(product => {
            const cartItem = cart.find(item => item.id === product.id);
            if (cartItem) {
                return {
                    ...product,
                    quantity: product.quantity - cartItem.quantity
                };
            }
            return product;
        });

        localStorage.setItem("products", JSON.stringify(updatedProducts));

        // 2️⃣ إنشاء الفاتورة
        const newInvoice = {
            id: Date.now(),
            customerId: selectedCustomer,
            customerName: currentCustomer?.name || "",
            date: new Date().toISOString(),
            items: cart,
            total: totalAmount,
            status: remaining <= 0 ? "paid" : "partial"
        };

        localStorage.setItem(
            "invoices",
            JSON.stringify([...allInvoices, newInvoice])
        );

        // 3️⃣ حفظ الدفعة لو موجودة
        if (payment > 0) {

            const newPayment = {
                id: Date.now() + 1,
                invoiceId: newInvoice.id,
                customerId: selectedCustomer,
                amount: payment,
                date: new Date().toISOString()
            };

            localStorage.setItem(
                "payments",
                JSON.stringify([...allPayments, newPayment])
            );
        }

        // 4️⃣ تفريغ السلة
        localStorage.removeItem("cart");

        handleCheckout();

        alert("تم حفظ الفاتورة بنجاح ✅");

        window.dispatchEvent(new Event("productsUpdated"));
    };

    return (
        <div dir="rtl" className="bg-white p-6 rounded-2xl shadow print:shadow-none print:p-2 print:w-[80mm] print:max-w-[80mm] print:text-xs">

            {/* رأس الفاتورة */}
            <div className="text-center border-b border-dashed pb-2 mb-2">
                <h1 className="text-lg font-bold">متجري</h1>
                <p>رقم الفاتورة: {invoiceNumber}</p>
                <p>{date}</p>
            </div>

            {/* اختيار العميل */}
            <div className="mb-3 print:hidden">
                <label className="block text-sm font-semibold mb-1">
                    اختيار العميل
                </label>
                <select
                    value={selectedCustomer || ""}
                    onChange={(e) => setSelectedCustomer(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                >
                    <option value="">اختر عميل</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* بيانات العميل */}
            {currentCustomer && (
                <div className="text-xs mb-2 border-b border-dashed pb-2">
                    <p>اسم العميل: {currentCustomer.name}</p>
                    {previousBalance > 0 && (
                        <p>الرصيد السابق: {previousBalance} جنيه</p>
                    )}
                </div>
            )}

            {/* الدفع */}
            <div className="mb-3 print:hidden">
                <select
                    className="w-full border p-2 rounded mb-2"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                >
                    <option value="cash">نقدي</option>
                    <option value="credit">آجل</option>
                </select>

                <input
                    type="number"
                    placeholder="قيمة الدفعة"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full border p-2 rounded"
                />
            </div>

            {/* المنتجات */}
            <div className="border-t border-b border-dashed py-2 mb-2">
                {cart.map((item) => (
                    <div key={item.id} className="flex justify-between mb-1">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{item.sellPrice * item.quantity} جنيه</span>
                    </div>
                ))}
            </div>

            {/* الحسابات */}
            <div className="text-sm space-y-1 mb-3">

                {previousBalance > 0 && (
                    <div className="flex justify-between text-gray-600">
                        <span>الرصيد السابق</span>
                        <span>{previousBalance} جنيه</span>
                    </div>
                )}

                <div className="flex justify-between font-bold">
                    <span>إجمالي الفاتورة</span>
                    <span>{totalAmount} جنيه</span>
                </div>

                <div className="flex justify-between">
                    <span>إجمالي المستحق</span>
                    <span>{totalDue} جنيه</span>
                </div>

                <div className="flex justify-between text-green-600">
                    <span>المدفوع</span>
                    <span>{payment} جنيه</span>
                </div>

                <div className="flex justify-between text-red-600 font-bold">
                    <span>المتبقي</span>
                    <span>{remaining > 0 ? remaining : 0} جنيه</span>
                </div>

            </div>

            {/* الأزرار */}
            <div className="mt-4 print:hidden">
                <button
                    onClick={handleCompleteSale}
                    className="w-full bg-green-600 text-white py-2 rounded-lg mb-2"
                >
                    إتمام البيع
                </button>

                <button
                    onClick={() => window.print()}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg"
                >
                    طباعة الفاتورة
                </button>
            </div>

        </div>
    );
}