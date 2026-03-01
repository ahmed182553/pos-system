import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = () => {

        if (!password) {
            setError("من فضلك ادخل كلمة المرور");
            return;
        }

        setLoading(true);
        setError("");

        setTimeout(() => {

            if (password === "01095598066") {
                login();
                navigate("/dashboard", { replace: true });
            } else {
                setError("كلمة المرور غير صحيحة");
            }

            setLoading(false);

        }, 600);
    };

    return (
        <div className="min-h-screen flex bg-linear-to-br from-blue-900 via-blue-800 to-blue-600 relative overflow-hidden">

            {/* Background Glow */}
            <div className="absolute w-125 h-125 bg-blue-500/30 rounded-full blur-3xl -top-32 -left-32"></div>
            <div className="absolute w-100 h-100 bg-indigo-500/20 rounded-full blur-3xl bottom-0 right-0"></div>

            {/* Left Section */}
            <motion.div
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex w-1/2 items-center justify-center relative z-10"
            >
                <h1 className="text-6xl font-extrabold bg-linear-to-r from-white to-blue-200 bg-clip-text text-transparent tracking-wide">
                    Inventory System
                </h1>
            </motion.div>

            {/* Right Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">

                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-md"
                >

                    <h2 className="text-3xl font-bold text-white mb-6 text-center">
                        تسجيل الدخول
                    </h2>

                    <div className="relative mb-4">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="ادخل كلمة المرور"
                            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-white outline-none transition pr-12"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-white/80 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-300 text-sm mb-3 text-center">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-white text-blue-900 p-3 rounded-xl font-bold hover:bg-blue-100 active:scale-95 transition-all duration-200"
                    >
                        {loading ? "جاري الدخول..." : "دخول"}
                    </button>

                </motion.div>

            </div>
        </div>
    );
}