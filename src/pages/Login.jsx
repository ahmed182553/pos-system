import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function Login() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {

        if (password === "1234") {

            navigate("/dashboard");

        } else {

            alert("كلمة المرور غير صحيحة");

        }

    };


    return (
        <div className="min-h-screen flex overflow-hidden">

            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-700 to-blue-900 items-center justify-center"
            >
                <h1 className="text-white text-4xl font-bold">
                    Inventory System
                </h1>
            </motion.div>
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100">

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md"
                >

                    <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
                        Login
                    </h2>

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border rounded-lg mb-4"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-blue-800 text-white p-3 rounded-lg font-semibold flex justify-center items-center gap-2"
                    >

                        {loading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1,
                                        ease: "linear"
                                    }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                                Loading...
                            </>
                        ) : (
                            "Login"
                        )}

                    </button>

                </motion.div>

            </div>

        </div>
    );
}
