import { useEffect, useRef, useState, useContext, useCallback } from "react";
import Chart from "chart.js/auto";
import moment from "moment";
import AuthContext from "../config/AuthContext";
import { useTheme } from "../config/ThemeContext";
import { getIncidents } from "../config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Activity, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const { user }         = useContext(AuthContext);
  const { isDark }       = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [mode,    setMode]    = useState("status");
  const canvasRef    = useRef(null);
  const chartRef     = useRef(null);
  const lineRef      = useRef(null);
  const lineChartRef = useRef(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getIncidents({ page: 0, size: 1000 });
      const all  = data.content || [];
      const isAdm = user?.role === "admin" || user?.role === "ADMIN";
      setTickets(isAdm ? all : all.filter((t) => t.createdById === user?.id));
    } catch (err) {
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("403") || msg.includes("unauthorized"))
        setError("Session expirée. Rechargez la page ou reconnectez-vous.");
      else if (msg.includes("failed to fetch") || msg.includes("network"))
        setError("Impossible de charger les données. Vérifiez votre connexion.");
      else
        setError("Erreur lors du chargement du tableau de bord.");
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const textColor = isDark ? "#94a3b8" : "#64748b";

  useEffect(() => {
    if (!canvasRef.current || tickets.length === 0) return;
    const dataCount = {};
    if (mode === "status") {
      const LABELS = { OPEN: "Nouveau", IN_PROGRESS: "En cours", RESOLVED: "Résolu", CLOSED: "Clôturé" };
      tickets.forEach((t) => { const k = LABELS[t.status] || t.status; if (k) dataCount[k] = (dataCount[k] || 0) + 1; });
    } else {
      const LABELS = { LOW: "Faible", MEDIUM: "Moyenne", HIGH: "Haute" };
      tickets.forEach((t) => { const k = LABELS[t.priority] || t.priority; if (k) dataCount[k] = (dataCount[k] || 0) + 1; });
    }
    const COLOR_STATUS = { Nouveau: "#3b82f6", "En cours": "#f59e0b", Résolu: "#10b981", Clôturé: "#94a3b8" };
    const COLOR_PRIO   = { Faible: "#10b981", Moyenne: "#f59e0b", Haute: "#ef4444" };
    const colors = mode === "status"
      ? Object.keys(dataCount).map((k) => COLOR_STATUS[k] || "#94a3b8")
      : Object.keys(dataCount).map((k) => COLOR_PRIO[k]   || "#94a3b8");

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: Object.keys(dataCount),
        datasets: [{ data: Object.values(dataCount), backgroundColor: colors, hoverOffset: 6, borderWidth: 2, borderColor: isDark ? "#1e293b" : "#fff" }],
      },
      options: {
        responsive: true, cutout: "65%",
        plugins: { legend: { position: "right", labels: { font: { size: 12 }, color: textColor, padding: 16, boxWidth: 12, boxHeight: 12 } } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [tickets, isDark, mode]);

  useEffect(() => {
    if (!lineRef.current) return;
    const months = Array.from({ length: 12 }, (_, i) => moment().month(i).format("MMM"));
    const counts = Array(12).fill(0);
    tickets.forEach((t) => { const d = moment(t.createdAt); if (d.isValid()) counts[d.month()]++; });

    if (lineChartRef.current) lineChartRef.current.destroy();
    lineChartRef.current = new Chart(lineRef.current, {
      type: "line",
      data: {
        labels: months,
        datasets: [{
          label: "Incidents", data: counts, fill: true,
          borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.08)",
          tension: 0.4, pointRadius: 3, pointBackgroundColor: "#3b82f6",
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" } },
          y: { beginAtZero: true, ticks: { stepSize: 1, color: textColor, font: { size: 11 } }, grid: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" } },
        },
      },
    });
    return () => lineChartRef.current?.destroy();
  }, [tickets, isDark]);

  const count = (s) => tickets.filter((t) => t.status === s).length;
  const stats = [
    { label: "Total",    value: tickets.length,        icon: Activity,      color: "text-foreground" },
    { label: "Nouveau",  value: count("OPEN"),          icon: AlertTriangle, color: "text-blue-500" },
    { label: "En cours", value: count("IN_PROGRESS"),   icon: Clock,         color: "text-amber-500" },
    { label: "Résolu",   value: count("RESOLVED"),      icon: CheckCircle,   color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble des incidents</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />Chargement...
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" className="ml-4 text-destructive hover:text-destructive" onClick={fetchTickets}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold">Répartition</CardTitle>
            <div className="flex gap-1">
              {["status", "priority"].map((m) => (
                <Button key={m} variant={mode === m ? "default" : "ghost"} size="sm" className="h-7 text-xs px-2.5"
                  onClick={() => setMode(m)}>
                  {m === "status" ? "Statut" : "Priorité"}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 && !loading
              ? <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée disponible</p>
              : <div className="flex justify-center"><canvas ref={canvasRef} style={{ maxHeight: 260 }} /></div>
            }
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Incidents par mois ({moment().year()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={lineRef} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
