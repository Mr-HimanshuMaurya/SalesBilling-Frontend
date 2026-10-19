// import React, { createContext, useContext, useState, useEffect } from "react";
// import { login as loginApi } from "../api/auth.api";
// import toast from "react-hot-toast";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const userData = localStorage.getItem("user");
//     if (token && userData) {
//       setUser(JSON.parse(userData));
//     }
//     setIsLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     setIsLoading(true);
//     try {
//       const response = await loginApi({ email, password });
//       const { token, user } = response.data;

//       localStorage.setItem("token", token);
//       localStorage.setItem("user", JSON.stringify(user));

//       setUser(user);

//       toast.success("Login successful!");
//       return { success: true };
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error(error.response?.data?.message || "Login failed");
//       return { success: false, error: error.response?.data?.message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser(null);
//     toast.success("Logged out successfully");
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi } from "../api/auth.api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);

        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("AuthContext - JSON parse error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else {
      // Clear any invalid data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log("AuthContext - login called with:", email);
    const data = await loginApi({ email, password });
    console.log("AuthContext - login response:", data);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
