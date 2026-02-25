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
        <div className="p-6">

            <h2 className="text-2xl font-bold mb-6">
                إدارة العملاء
            </h2>

            {/* نموذج إضافة عميل */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <div className="grid md:grid-cols-4 gap-4">

                    <input
                        type="text"
                        placeholder="اسم العميل"
                        className="p-2 border rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="رقم الهاتف"
                        className="p-2 border rounded"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="رصيد سابق"
                        className="p-2 border rounded"
                        value={previousBalance}
                        onChange={(e) => setPreviousBalance(e.target.value)}
                    />

                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white rounded p-2"
                    >
                        {editingId ? "تحديث" : "إضافة"}
                    </button>

                </div>
            </div>

            {/* جدول العملاء */}
            <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">

                {customers.length === 0 ? (
                    <p className="text-gray-500">لا يوجد عملاء</p>
                ) : (
                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b font-bold">
                                <th className="py-2">#</th>
                                <th>الاسم</th>
                                <th>الهاتف</th>
                                <th>الرصيد الحالي</th>
                                <th>التحكم</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map((customer, i) => {

                                const balance = calculateCustomerBalance(customer.id);

                                return (
                                    <tr key={customer.id} className="border-b">
                                        <td className="py-2">{i + 1}</td>
                                        <td>{customer.name}</td>
                                        <td>{customer.phone}</td>
                                        <td className={
                                            balance > 0
                                                ? "text-red-600 font-bold"
                                                : "text-green-600 font-bold"
                                        }>
                                            {balance} جنيه
                                        </td>

                                        <td className="space-x-2">

                                            <button
                                                onClick={() => handleEdit(customer)}
                                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                                            >
                                                تعديل
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setShowPaymentModal(true);
                                                }}
                                                className="bg-green-600 text-white px-3 py-1 rounded"
                                            >
                                                تسجيل دفعة
                                            </button>

                                            <button
                                                onClick={() => {
                                                    deleteCustomer(customer.id);
                                                    refresh();
                                                }}
                                                className="bg-red-600 text-white px-3 py-1 rounded"
                                            >
                                                حذف
                                            </button>

                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                )}

            </div>

            {/* مودال تسجيل دفعة */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-xl w-96">

                        <h3 className="text-lg font-bold mb-4">
                            تسجيل دفعة - {selectedCustomer.name}
                        </h3>

                        <input
                            type="number"
                            placeholder="قيمة الدفعة"
                            className="w-full p-2 border rounded mb-4"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                        />

                        <div className="flex justify-end gap-2">

                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                            >
                                إلغاء
                            </button>

                            <button
                                onClick={handlePayment}
                                className="bg-green-600 text-white px-4 py-2 rounded"
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