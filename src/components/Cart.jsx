import { useState } from "react";

export default function Cart({
    cart,
    subTotal,
    discount,
    setDiscount,
    totalAmount,
    increaseQty,
    decreaseQty,
    removeItem,
    handleCheckout,
    customers,
    selectedCustomer,
    setSelectedCustomer
}) {

    const [printData, setPrintData] = useState(null);
    const [paymentType, setPaymentType] = useState("cash");
    const [paymentAmount, setPaymentAmount] = useState("");

    const invoiceNumber = useState("فاتورة-" + Date.now())[0];
    const date = new Date().toLocaleString();

    const currentCustomer = customers.find(
        c => c.id === Number(selectedCustomer)
    );

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

        // 🔥 حفظ البيانات للطباعة
        setPrintData({
            cart,
            subTotal,
            discount,
            totalAmount,
            previousBalance,
            payment,
            totalDue,
            remaining
        });

        const savedProducts = JSON.parse(localStorage.getItem("products")) || [];
        const allInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
        const allPayments = JSON.parse(localStorage.getItem("payments")) || [];

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

        const newInvoice = {
            id: Date.now(),
            customerId: selectedCustomer,
            customerName: currentCustomer?.name || "",
            date: new Date().toISOString(),
            items: cart,
            subTotal: subTotal,
            discount: discount,
            total: totalAmount,
            status: remaining <= 0 ? "paid" : "partial"
        };

        localStorage.setItem(
            "invoices",
            JSON.stringify([...allInvoices, newInvoice])
        );

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

        localStorage.removeItem("cart");
        handleCheckout(); 

        setTimeout(() => {
            window.print(); 
        }, 200);

        alert("تم حفظ الفاتورة بنجاح ✅");

        window.dispatchEvent(new Event("productsUpdated"));
    };

    return (
        <div
            id="invoice-print"
            dir="rtl"
            className="bg-white p-6 rounded-2xl shadow
            w-full
            max-w-105
            mx-auto
            print:shadow-none
            print:p-2
            print:w-[80mm]
            print:max-w-[80mm]
            print:text-xs"
        >

            {/* رأس الفاتورة */}

            <div className="text-center border-b border-dashed pb-2 mb-2">

                <h1 className="text-lg font-bold">
                    متجري
                </h1>

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

                    {(printData?.previousBalance ?? previousBalance) > 0 && (
                        <p>الرصيد السابق: {printData?.previousBalance ?? previousBalance} جنيه</p>
                    )}

                </div>

            )}

            {/* الخصم */}

            <div className="mb-3 print:hidden">

                <label className="text-sm font-semibold">
                    الخصم
                </label>

                <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full border p-2 rounded"
                    placeholder="0"
                />

            </div>

            {/* الدفع */}

            <div className="mb-3 print:hidden">

                <select
                    className="w-full border p-2 rounded mb-2"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                >

                    <option value="cash">
                        نقدي
                    </option>

                    <option value="credit">
                        آجل
                    </option>

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

                {(printData?.cart || cart).map((item) => (

                    <div key={item.id} className="flex justify-between mb-1">

                        <span>
                            {item.name} × {item.quantity}
                        </span>

                        <span>
                            {item.sellPrice * item.quantity} جنيه
                        </span>

                    </div>

                ))}

            </div>

            {/* الحسابات */}

            <div className="text-sm space-y-1 mb-3">

                <div className="flex justify-between">
                    <span>الإجمالي</span>
                    <span>{printData?.subTotal ?? subTotal} جنيه</span>
                </div>

                <div className="flex justify-between text-red-500">
                    <span>الخصم</span>
                    <span>{printData?.discount ?? discount} جنيه</span>
                </div>

                <div className="flex justify-between font-bold">
                    <span>إجمالي الفاتورة</span>
                    <span>{printData?.totalAmount ?? totalAmount} جنيه</span>
                </div>

                <div className="flex justify-between">
                    <span>إجمالي المستحق</span>
                    <span>{printData?.totalDue ?? totalDue} جنيه</span>
                </div>

                <div className="flex justify-between text-green-600">
                    <span>المدفوع</span>
                    <span>{printData?.payment ?? payment} جنيه</span>
                </div>

                <div className="flex justify-between text-red-600 font-bold">
                    <span>المتبقي</span>
                    <span>{printData?.remaining ?? remaining} جنيه</span>
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