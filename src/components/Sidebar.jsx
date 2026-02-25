import { NavLink } from "react-router-dom";

export default function Sidebar() {

    const linkClass = ({ isActive }) =>
        `p-2 rounded cursor-pointer block transition ${isActive
            ? "bg-blue-600"
            : "hover:bg-blue-700"
        }`;

    return (
        <div className="w-64 bg-blue-900 text-white min-h-screen p-4">

            <h2 className="text-xl font-bold mb-6">
                POS System
            </h2>

            <ul className="space-y-3">

                <li>
                    <NavLink to="/" className={linkClass}>
                        Dashboard
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/products" className={linkClass}>
                        المنتجات
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/invoices" className={linkClass}>
                        الفواتير
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/customers" className={linkClass}>
                        العملاء
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/allinvoices" className={linkClass}>
                        كل الفواتير
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/statment" className={linkClass}>
                        كشف الحسابات
                    </NavLink>
                </li>

            </ul>

        </div>
    );
}