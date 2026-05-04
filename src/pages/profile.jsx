import { useContext, useState, useRef,useEffect } from "react";
import { useNavigate } from "react-router";
import photoProfile from "../assets/photoProfile.png";
import AuthContext from "../config/AuthContext";
import { updateUser } from "../config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, Camera, Loader2, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB   = 2;

const parseApiError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("email") && msg.includes("already")) return "Cet email est déjà utilisé par un autre compte.";
  if (msg.includes("403")) return "Vous n'avez pas l'autorisation de modifier ce profil.";
  if (msg.includes("404")) return "Compte introuvable.";
  if (msg.includes("failed to fetch") || msg.includes("network")) return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  if (msg.includes("500")) return "Erreur serveur interne. Réessayez dans quelques instants.";
  return err?.message || "Une erreur est survenue lors de la mise à jour.";
};

const Profile = () => {
  const { user, updateUser: updateCtx, updateProfileImage, profileImage } = useContext(AuthContext);
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [form, setForm]     = useState({ firstName: user?.firstName || "", lastName: user?.lastName || "", email: user?.email || "" });
  const [preview, setPreview] = useState(profileImage || null);
  useEffect(() => {
  setPreview(profileImage || null);
}, [profileImage]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [photoError,  setPhotoError]  = useState("");

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  const setField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setFieldErrors((p) => ({ ...p, [k]: "" }));
    setError(""); setSuccess(false);
  };

 const handleImageChange = (e) => {
  setPhotoError("");
  const file = e.target.files[0];
  if (!file) return;

  if (!ALLOWED_TYPES.includes(file.type)) {
    setPhotoError("Format non supporté. Utilisez JPEG, PNG, WebP ou GIF.");
    e.target.value = "";
    return;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    setPhotoError(`Photo trop volumineuse (max ${MAX_SIZE_MB} Mo).`);
    e.target.value = "";
    return;
  }

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const MAX = 300; // px
    const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
    canvas.width  = img.width  * ratio;
    canvas.height = img.height * ratio;
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const b64 = canvas.toDataURL("image/jpeg", 0.8); // qualité 80%
    setPreview(b64);
    updateProfileImage(b64);
    URL.revokeObjectURL(objectUrl);
  };
  img.onerror = () => setPhotoError("Erreur lors de la lecture du fichier.");
  img.src = objectUrl;
};

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "L'email est obligatoire.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Format d'email invalide.";
    return errs;
  };

  const handleUpdate = async () => {
    setError(""); setSuccess(false); setFieldErrors({});
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    if (!user?.id) return;
    setLoading(true);
    try {
      await updateUser(user.id, {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        role:      user.role?.toUpperCase(),
      });
      updateCtx({ ...user, ...form });
      setSuccess(true);
      toast.success("Profil mis à jour.");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      const msg = parseApiError(err);
      if (msg.toLowerCase().includes("email")) setFieldErrors((p) => ({ ...p, email: msg }));
      else setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Mon Profil</h1>
          <p className="text-sm text-muted-foreground">Gérez vos informations personnelles.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Photo de profil</CardTitle>
          <CardDescription className="text-xs">JPEG, PNG ou WebP, max {MAX_SIZE_MB} Mo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={preview ?? photoProfile} alt="Profile" />
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleImageChange} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4" />Changer la photo
              </Button>
              {preview && (
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                  onClick={() => { setPreview(null); updateProfileImage(null); }}>
                  <Trash2 className="h-4 w-4" />Supprimer
                </Button>
              )}
            </div>
          </div>
          {photoError && (
            <Alert variant="destructive" className="mt-3 py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{photoError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="py-2.5 border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-sm">Profil mis à jour avec succès.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prénom</Label>
              <Input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)}
                placeholder="Prénom" disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label>Nom</Label>
              <Input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)}
                placeholder="Nom" disabled={loading} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email <span className="text-destructive">*</span></Label>
            <Input type="email" value={form.email} disabled={loading}
              onChange={(e) => setField("email", e.target.value)} placeholder="email@exemple.com"
              className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""} />
            {fieldErrors.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Rôle</Label>
            <Input value={user?.role?.toUpperCase() || ""} disabled className="opacity-60 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Le rôle est défini par un administrateur.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={loading} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={loading} className="flex-1">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</> : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
