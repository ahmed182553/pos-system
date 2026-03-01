import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Sidebar({ closeSidebar }) {

    const linkClass = ({ isActive }) =>
        `p-3 rounded-lg transition flex items-center ${isActive
            ? "bg-blue-600 shadow-md"
            : "hover:bg-blue-700"
        }`;

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="w-64 bg-blue-900 text-white min-h-screen p-5 flex flex-col">

            {/* Header */}
            <h2 className="text-2xl font-bold mb-8 tracking-wide">
                POS System
            </h2>

            {/* Links */}
            <ul className="space-y-3 flex-1">

                <li>
                    <NavLink to="/dashboard" className={linkClass} onClick={closeSidebar}>
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

                <li>
                    <NavLink to="/dailypayments" className={linkClass} onClick={closeSidebar}>
                        التحصيل
                    </NavLink>
                </li>

            </ul>

            {/* Logout Button */}
            <div className="pt-6 border-t border-blue-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-200 p-3 rounded-xl font-semibold shadow-lg"
                >
                    <LogOut size={18} />
                    تسجيل الخروج
                </button>
            </div>

        </div>
    );
}