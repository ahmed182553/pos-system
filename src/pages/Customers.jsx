import { useEffect, useState } from "react";
import {
    getCustomers,
    addCustomer,
    deleteCustomer,
    updateCustomer,
    calculateCustomerBalance
} from "../services/customerService";

import { addPayment } from "../services/paymentService";

export default function Customers() {

    const [customers, setCustomers] = useState([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [previousBalance, setPreviousBalance] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState("");

    useEffect(() => {
        refresh();
    }, []);

    const refresh = () => {
        setCustomers(getCustomers());
    };

    // إضافة أو تعديل عميل
    const handleSubmit = () => {
        if (!name || !phone) {
            alert("أدخل البيانات كاملة");
            return;
        }

        if (editingId) {
            updateCustomer(editingId, {
                name,
                phone,
                previousBalance: Number(previousBalance)
            });
            setEditingId(null);
        } else {
            addCustomer({
                name,
                phone,
                previousBalance: Number(previousBalance)
            });
        }

        setName("");
        setPhone("");
        setPreviousBalance("");
        refresh();
    };

    const handleEdit = (customer) => {
        setName(customer.name);
        setPhone(customer.phone);
        setPreviousBalance(customer.previousBalance);
        setEditingId(customer.id);
    };

    const handlePayment = () => {
        if (!paymentAmount) {
            alert("أدخل قيمة الدفعة");
            return;
        }

        addPayment({
            customerId: selectedCustomer.id,
            amount: Number(paymentAmount)
        });

        setPaymentAmount("");
        setShowPaymentModal(false);
        refresh();
    };

    return (
        <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                إدارة العملاء
            </h2>

            {/* نموذج إضافة عميل */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

                    <input
                        type="text"
                        placeholder="اسم العميل"
                        className="p-2 border rounded text-sm sm:text-base"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="رقم الهاتف"
                        className="p-2 border rounded text-sm sm:text-base"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="رصيد سابق"
                        className="p-2 border rounded text-sm sm:text-base"
                        value={previousBalance}
                        onChange={(e) => setPreviousBalance(e.target.value)}
                    />

                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 text-sm sm:text-base w-full"
                    >
                        {editingId ? "تحديث" : "إضافة"}
                    </button>

                </div>
            </div>

            {/* عرض العملاء */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow">

                {customers.length === 0 ? (
                    <p className="text-gray-500 text-sm">لا يوجد عملاء</p>
                ) : (
                    <div className="space-y-4">

                        {customers.map((customer, i) => {

                            const balance = calculateCustomerBalance(customer.id);

                            return (
                                <div
                                    key={customer.id}
                                    className="border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                                >

                                    {/* بيانات العميل */}
                                    <div className="space-y-1 text-sm sm:text-base">
                                        <div className="font-bold">
                                            #{i + 1} - {customer.name}
                                        </div>

                                        <div className="text-gray-500">
                                            📞 {customer.phone}
                                        </div>

                                        <div
                                            className={
                                                balance > 0
                                                    ? "text-red-600 font-bold"
                                                    : "text-green-600 font-bold"
                                            }
                                        >
                                            الرصيد: {balance} جنيه
                                        </div>
                                    </div>

                                    {/* الأزرار */}
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

                                        <button
                                            onClick={() => handleEdit(customer)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
                                        >
                                            تعديل
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setShowPaymentModal(true);
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
                                        >
                                            تسجيل دفعة
                                        </button>

                                        <button
                                            onClick={() => {
                                                deleteCustomer(customer.id);
                                                refresh();
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
                                        >
                                            حذف
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>

            {/* مودال تسجيل دفعة */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

                    <div className="bg-white p-5 sm:p-6 rounded-xl w-full max-w-md">

                        <h3 className="text-base sm:text-lg font-bold mb-4">
                            تسجيل دفعة - {selectedCustomer.name}
                        </h3>

                        <input
                            type="number"
                            placeholder="قيمة الدفعة"
                            className="w-full p-2 border rounded mb-4 text-sm sm:text-base"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                        />

                        <div className="flex flex-col sm:flex-row justify-end gap-2">

                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
                            >
                                إلغاء
                            </button>

                            <button
                                onClick={handlePayment}
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