import { useEffect, useContext } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthContext from "./config/AuthContext";
import { createBrowserRouter, RouterProvider } from "react-router";
import BodyContent from "./layout/BodyContent";
import DashBoard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Users from "./pages/Users";
import Profile from "./pages/profile";
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";
import moment from "moment";

const InnerApp = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin" || user?.role === "ADMIN";

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem("lastLogin", moment().toISOString());
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <BodyContent>
          <DashBoard />
        </BodyContent>
      ),
    },
    {
      path: "/incidents",
      element: (
        <ProtectedRoute>
          <BodyContent>
            <Incidents />
          </BodyContent>
        </ProtectedRoute>
      ),
    },
    {
      path: "/users",
      element: (
        <ProtectedRoute adminOnly>
          <BodyContent>
            <Users />
          </BodyContent>
        </ProtectedRoute>
      ),
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/profile",
      element: (
        <BodyContent>
          <Profile />
        </BodyContent>
      ),
    },
    {
      path: "*",
      element: <PageNotFound />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default InnerApp;
