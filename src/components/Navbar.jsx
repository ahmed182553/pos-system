export default function Navbar({ onAddPayment }) {

    return (

        <div className="bg-white shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

            <h1 className="text-lg font-bold text-blue-900">
                لوحة التحكم
            </h1>

            <button
                onClick={onAddPayment}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
                إضافة دفعة
            </button>

            <div className="flex items-center gap-3">

                <input
                    type="text"
                    placeholder="بحث..."
                    className="border rounded-lg px-3 py-1 outline-none w-40 sm:w-56"
                />

                <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center">
                    A
                </div>

            </div>

        </div>

    );
}