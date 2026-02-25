import { useState, useEffect } from "react";

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

    // تسجيل دفعة
    const handleRegisterPayment = () => {
        if (!selectedCustomer || !paymentAmount) return;

        const payment = Number(paymentAmount);

        if (payment <= 0) return;

        if (payment > selectedCustomer.totalDebt) {
            alert("المبلغ أكبر من إجمالي الدين");
            return;
        }

        updateCustomerBalance(selectedCustomer.id, -payment);

        setCustomers(getCustomers());
        setPaymentAmount("");
        alert("تم تسجيل الدفعة بنجاح");
    };

    // 🔥 إتمام البيع
    const handleCompleteSale = () => {
        if (cart.length === 0) {
            alert("السلة فارغة");
            return;
        }

        const savedProducts = JSON.parse(localStorage.getItem("products")) || [];

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

        // إضافة دين لو آجل
        if (paymentType === "credit" && selectedCustomer) {
            updateCustomerBalance(
                Number(selectedCustomer),
                totalAmount
            );
        }

        // ✅ حفظ الفاتورة
        const invoices = JSON.parse(localStorage.getItem("invoices")) || [];

        const newInvoice = {
            id: Date.now(),
            invoiceNumber,
            date,
            customer: selectedCustomer ? selectedCustomer.name : "عميل نقدي",
            items: cart,
            total: totalAmount,
            paymentType
        };

        localStorage.setItem(
            "invoices",
            JSON.stringify([...invoices, newInvoice])
        );

        // ✅ تصفير السلة
        localStorage.removeItem("cart");

        handleCheckout();
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

            {currentCustomer && (
                <div className="text-xs mb-2 border-b border-dashed pb-2">
                    <p>اسم العميل: {currentCustomer.name}</p>
                    <p>الرصيد السابق: {currentCustomer.totalDebt} جنيه</p>
                </div>
            )}

            {/* تسجيل دفعة */}
            {selectedCustomer && selectedCustomer.totalDebt > 0 && (
                <div className="mb-3 print:hidden">
                    <input
                        type="number"
                        placeholder="ادخل قيمة الدفعة"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full border p-2 rounded mb-2"
                    />
                    <button
                        onClick={handleRegisterPayment}
                        className="w-full bg-yellow-500 text-white py-2 rounded-lg"
                    >
                        تسجيل دفعة
                    </button>
                </div>
            )}

            {/* نوع الدفع */}
            <div className="mb-3 print:hidden">
                <select
                    className="w-full border p-2 rounded"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                >
                    <option value="cash">نقدي</option>
                    <option value="credit">آجل</option>
                </select>
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

            {/* الإجمالي */}
            <div className="flex justify-between font-bold text-sm mb-3">
                <span>الإجمالي</span>
                <span>{totalAmount} جنيه</span>
            </div>

            {/* أزرار */}
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