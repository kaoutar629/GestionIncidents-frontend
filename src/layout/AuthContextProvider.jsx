import { useState } from "react";
import AuthContext from "../config/AuthContext";

// Store profile image per user (keyed by email) so it survives logout/re-login
const imgKey  = (user) => user?.email ? `profileImage_${user.email}` : null;
const loadImg = (user) => {
  const k = imgKey(user);
  return k ? localStorage.getItem(k) || null : null;
};

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [profileImage, setProfileImage] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      return loadImg(u);
    } catch {
      return null;
    }
  });

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      // Restore saved image for this user on login
      setProfileImage(loadImg(userData));
    } else {
      localStorage.removeItem("user");
    }
  };

 // APRÈS
const updateProfileImage = (base64) => {
  setProfileImage(base64);
  const k = imgKey(user);
  if (!k) return;
  if (base64) {
    try {
      localStorage.setItem(k, base64);
    } catch (e) {
      // quota dépassé — image gardée en mémoire seulement
      console.warn("localStorage quota exceeded, profile image not persisted", e);
    }
  } else {
    localStorage.removeItem(k);
  }
};

  const logout = () => {
    setUser(null);
    setProfileImage(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, updateUser, logout, profileImage, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;