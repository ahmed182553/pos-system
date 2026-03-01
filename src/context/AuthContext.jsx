import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const storedAuth = localStorage.getItem("isAuth");
        if (storedAuth === "true") {
            setIsAuth(true);
        }
    }, []);

    const login = () => {
        localStorage.setItem("isAuth", "true");
        setIsAuth(true);
    };

    const logout = () => {
        localStorage.removeItem("isAuth");
        setIsAuth(false);
    };

    return (
        <AuthContext.Provider value={{ isAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}