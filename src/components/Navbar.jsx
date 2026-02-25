export default function Navbar() {

    return (

        <div className="bg-white shadow p-4 flex justify-between items-center">

            <h1 className="text-lg font-bold text-blue-900">
                لوحة التحكم
            </h1>

            <div className="flex items-center gap-3">

                <input
                    type="text"
                    placeholder="بحث..."
                    className="border rounded-lg px-3 py-1 outline-none"
                />

                <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center">
                    A
                </div>

            </div>

        </div>

    );
}
