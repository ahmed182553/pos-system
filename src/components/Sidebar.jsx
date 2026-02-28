import { NavLink } from "react-router-dom";

export default function Sidebar(closeSidebar) {

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
                    <NavLink to="/" className={linkClass} onClick={closeSidebar}>
                        Dashboard
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/products" className={linkClass} onClick={closeSidebar}>
                        المنتجات
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/invoices" className={linkClass} onClick={closeSidebar}>
                        الفواتير
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/customers" className={linkClass} onClick={closeSidebar}>
                        العملاء
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/allinvoices" className={linkClass} onClick={closeSidebar}>
                        كل الفواتير
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/statment" className={linkClass} onClick={closeSidebar}>
                        كشف الحسابات
                    </NavLink>
                </li>
                
                <li>
                    <NavLink to="/reports" className={linkClass} onClick={closeSidebar}>
                        التقارير والجرد
                    </NavLink>
                </li>
            </ul>

        </div>
    );
}