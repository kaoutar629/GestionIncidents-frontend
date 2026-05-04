import { useEffect, useContext, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import AuthContext from "../config/AuthContext";
import { useTheme } from "../config/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Bell, Sun, Moon, ChevronDown, User, LogOut, LayoutDashboard, AlertTriangle, Users, Menu, X } from "lucide-react";
import userImage from "../assets/photoProfile.png";

const MAX_NOTIFS = 50;

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, profileImage } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();

  const [dropOpen, setDropOpen]     = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifications, setNotifs]  = useState([]);
  const [unread, setUnread]         = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const notifRef = useRef(null);
  const dropRef  = useRef(null);

  const isAdmin  = user?.role === "admin" || user?.role === "ADMIN";
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

  useEffect(() => { if (!user?.email) navigate("/login"); }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    fetch(`${BASE}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const f = data.map((n) => ({ ...n, at: new Date(n.at), read: n.read ?? false }));
        setNotifs(f);
        setUnread(f.filter((n) => !n.read).length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    const es = new EventSource(`${BASE}/notifications/stream?token=${token}`);
    es.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        const n = { id: d.id || Date.now(), title: d.title, createdBy: d.createdBy,
          priority: d.priority, status: d.status, at: new Date(d.at || Date.now()), read: false };
        setNotifs((prev) => [n, ...prev].slice(0, MAX_NOTIFS));
        setUnread((c) => c + 1);
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const markAllRead = () => { setNotifs((p) => p.map((n) => ({ ...n, read: true }))); setUnread(0); };
  const clearAll    = () => { setNotifs([]); setUnread(0); };
  const onLogout    = () => { logout(); navigate("/login"); };

  const priorityClass = (p) =>
    ({ HIGH: "text-red-500", MEDIUM: "text-amber-500", LOW: "text-emerald-500" })[p?.toUpperCase()] || "";

  const navLinks = [
    { to: "/",         label: "Tableau de bord", icon: LayoutDashboard },
    { to: "/incidents", label: "Incidents",       icon: AlertTriangle },
    ...(isAdmin ? [{ to: "/users", label: "Utilisateurs", icon: Users }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`
            }>
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-1.5 rounded-md hover:bg-accent" onClick={() => setMobileOpen((o) => !o)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative"
              onClick={() => { setNotifOpen((o) => !o); if (!notifOpen && unread > 0) markAllRead(); }}>
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-popover shadow-xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="text-sm font-semibold">Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                      Effacer tout
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                      <Bell className="h-8 w-8 opacity-30" />
                      <p className="text-xs">Aucune notification</p>
                    </div>
                  ) : notifications.map((n) => (
                    <div key={n.id} onClick={() => { navigate("/incidents"); setNotifOpen(false); }}
                      className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
                      <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {n.createdBy}
                          {n.priority && <span className={`ml-1.5 font-semibold ${priorityClass(n.priority)}`}>· {n.priority}</span>}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {n.at?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t text-center">
                    <button onClick={() => { navigate("/incidents"); setNotifOpen(false); }}
                      className="text-xs text-primary hover:underline">
                      Voir tous les incidents
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* User dropdown */}
          <div className="relative" ref={dropRef}>
            <button onClick={() => setDropOpen((o) => !o)}
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profileImage ?? userImage} alt={user?.firstName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">{user?.firstName || user?.email}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {dropOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-lg border bg-popover shadow-xl z-50 py-1">
                <div className="px-3 py-2 border-b mb-1">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button onClick={() => { navigate("/profile"); setDropOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left">
                  <User className="h-4 w-4 text-muted-foreground" />Mon profil
                </button>
                <Separator className="my-1" />
                <button onClick={() => { onLogout(); setDropOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left">
                  <LogOut className="h-4 w-4" />Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t px-4 py-2 flex flex-col gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}>
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
