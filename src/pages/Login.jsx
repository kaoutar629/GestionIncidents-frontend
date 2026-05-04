import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import AuthContext from "../config/AuthContext";
import { login } from "../config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import LOGO from "../assets/nomatis.png";

const parseLoginError = (message) => {
  const msg = (message || "").toLowerCase();
  if (msg.includes("bad credentials") || msg.includes("unauthorized") || msg.includes("401") || msg.includes("incorrect"))
    return "Mot de passe incorrect. Veuillez réessayer.";
  if (msg.includes("not found") || msg.includes("no user") || msg.includes("user not"))
    return "Aucun compte associé à cet email. Contactez votre administrateur.";
  if (msg.includes("disabled") || msg.includes("locked"))
    return "Compte désactivé ou verrouillé. Contactez un administrateur.";
  if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("load"))
    return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  if (msg.includes("500"))
    return "Erreur serveur interne. Réessayez dans quelques instants.";
  return message || "Une erreur inattendue est survenue.";
};

const Login = () => {
  const [email,       setEmail]      = useState("");
  const [password,    setPassword]   = useState("");
  const [showPass,    setShowPass]   = useState(false);
  const [loading,     setLoading]    = useState(false);
  const [error,       setError]      = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate     = useNavigate();
  const { updateUser } = useContext(AuthContext);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "L'email est obligatoire.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Format d'email invalide.";
    if (!password) errs.password = "Le mot de passe est obligatoire.";
    return errs;
  };

  const onLogin = async (e) => {
    e?.preventDefault();
    setError(""); setFieldErrors({});
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      localStorage.setItem("token", data.token);
      updateUser({
        id: data.id, email: data.email, role: data.role.toLowerCase(),
        username: data.firstName || data.email, firstName: data.firstName, lastName: data.lastName,
      });
      navigate("/");
    } catch (err) {
      setError(parseLoginError(err.message));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={LOGO} alt="Logo" className="h-16 object-contain" />
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Plateforme de</p>
            <h1 className="text-xl font-semibold tracking-tight">Gestion des Incidents</h1>
          </div>
        </div>

        <Card className="shadow-lg border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">Connexion</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Entrez vos identifiants pour accéder au tableau de bord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onLogin} noValidate className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2.5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" placeholder="nom@exemple.com"
                  value={email} disabled={loading}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); setError(""); }}
                  className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"}
                    autoComplete="current-password" placeholder="••••••••"
                    value={password} disabled={loading}
                    className={`pr-10 ${fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); setError(""); }}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{fieldErrors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Connexion...</> : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">Contactez votre administrateur pour créer un compte.</p>
      </div>
    </div>
  );
};

export default Login;
