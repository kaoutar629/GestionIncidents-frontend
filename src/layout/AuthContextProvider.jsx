import { useState } from "react";
import AuthContext from "../config/AuthContext";

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [profileImage, setProfileImage] = useState(
    () => localStorage.getItem("profileImage") || null
  );

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) localStorage.setItem("user", JSON.stringify(userData));
    else localStorage.removeItem("user");
  };

  const updateProfileImage = (base64) => {
    setProfileImage(base64);
    if (base64) localStorage.setItem("profileImage", base64);
    else localStorage.removeItem("profileImage");
  };

  const logout = () => {
    setUser(null);
    setProfileImage(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("profileImage");
  };

  return (
    <AuthContext.Provider value={{ user, updateUser, logout, profileImage, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
