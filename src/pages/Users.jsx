import { useState, useEffect } from "react";
import KTable from "../components/KTable";
import KModal from "../components/KModal";
import { toast } from "react-toastify";
import { getUsers, createUser, updateUser, deleteUser } from "../config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Pencil, Trash2, UserPlus } from "lucide-react";

const parseApiError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("email") && msg.includes("already")) return "Un compte avec cet email existe déjà.";
  if (msg.includes("email")) return "Email invalide ou déjà utilisé.";
  if (msg.includes("password") || msg.includes("mot de passe")) return "Le mot de passe ne respecte pas les critères requis.";
  if (msg.includes("403") || msg.includes("forbidden")) return "Action non autorisée.";
  if (msg.includes("404")) return "Utilisateur introuvable.";
  if (msg.includes("failed to fetch") || msg.includes("network")) return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  if (msg.includes("500")) return "Erreur serveur interne. Réessayez dans quelques instants.";
  return err?.message || "Une erreur est survenue.";
};

const FormSelect = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  >
    {children}
  </select>
);

const Users = () => {
  const [users,  setUsers]  = useState([]);
  const [show,   setShow]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [userId, setUserId] = useState(null);
  const [form,   setForm]   = useState({ firstName: "", lastName: "", email: "", password: "", role: "USER" });
  const [fieldErrors, setFieldErrors] = useState({});

  const setField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setFieldErrors((p) => ({ ...p, [k]: "" }));
    setFormError("");
  };

  const listUsers = async () => {
    try {
      const data = await getUsers({ page: 0, size: 200 });
      setUsers(data.content || []);
    } catch (err) { toast.error(parseApiError(err)); }
  };

  useEffect(() => { listUsers(); }, []);

  const resetForm = () => {
    setForm({ firstName: "", lastName: "", email: "", password: "", role: "USER" });
    setUserId(null); setFormError(""); setFieldErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Le prénom est obligatoire.";
    if (!form.lastName.trim())  errs.lastName  = "Le nom est obligatoire.";
    if (!form.email.trim()) errs.email = "L'email est obligatoire.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Format d'email invalide.";
    if (!userId) {
      if (!form.password) errs.password = "Le mot de passe est obligatoire.";
      else if (form.password.length < 6) errs.password = "Minimum 6 caractères requis.";
    }
    return errs;
  };

  const saveUser = async () => {
    setFormError(""); setFieldErrors({});
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setSaving(true);
    try {
      if (userId) {
        await updateUser(userId, { firstName: form.firstName, lastName: form.lastName, email: form.email, role: form.role });
      } else {
        await createUser({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role: form.role });
      }
      toast.success(userId ? "Utilisateur modifié." : "Utilisateur créé.");
      setShow(false); resetForm(); listUsers();
    } catch (err) {
      const msg = parseApiError(err);
      if (msg.toLowerCase().includes("email")) setFieldErrors((p) => ({ ...p, email: msg }));
      else if (msg.toLowerCase().includes("mot de passe") || msg.toLowerCase().includes("password"))
        setFieldErrors((p) => ({ ...p, password: msg }));
      else setFormError(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur définitivement ?")) return;
    try { await deleteUser(id); toast.success("Utilisateur supprimé."); listUsers(); }
    catch (err) { toast.error(parseApiError(err)); }
  };

  const editUser = (u) => {
    setForm({ firstName: u.firstName || "", lastName: u.lastName || "", email: u.email, password: "", role: u.role || "USER" });
    setUserId(u.id); setShow(true);
  };

  const inputCls = (k) => fieldErrors[k] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">Gérez les comptes et les rôles.</p>
      </div>

      <KTable
        onRefresh={listUsers}
        searchKeys={["firstName", "lastName", "email"]}
        slotRight={
          <Button size="sm" onClick={() => { resetForm(); setShow(true); }}>
            <UserPlus className="h-4 w-4" />Ajouter
          </Button>
        }
        dataSource={users}
        columns={[
          { key: "firstName", name: "Prénom" },
          { key: "lastName",  name: "Nom" },
          { key: "email",     name: "Email" },
          { key: "role", name: "Rôle", render: (v) => (
            <Badge variant={v?.toLowerCase() === "admin" ? "default" : "secondary"} className="text-[11px]">
              {v || "USER"}
            </Badge>
          )},
          { key: "action", name: "", render: (_, u) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editUser(u)} title="Modifier">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(u.id)} title="Supprimer">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )},
        ]}
      />

      <KModal title={userId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        show={show} onSave={saveUser} onHide={() => { setShow(false); resetForm(); }} saving={saving}>
        <div className="space-y-3">
          {formError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{formError}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prénom <span className="text-destructive">*</span></Label>
              <Input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)}
                placeholder="Prénom" className={inputCls("firstName")} />
              {fieldErrors.firstName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{fieldErrors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Nom <span className="text-destructive">*</span></Label>
              <Input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)}
                placeholder="Nom" className={inputCls("lastName")} />
              {fieldErrors.lastName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{fieldErrors.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email <span className="text-destructive">*</span></Label>
            <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)}
              placeholder="email@exemple.com" className={inputCls("email")} />
            {fieldErrors.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{fieldErrors.email}
              </p>
            )}
          </div>
          {!userId && (
            <div className="space-y-1.5">
              <Label>Mot de passe <span className="text-destructive">*</span></Label>
              <Input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)}
                placeholder="Min. 6 caractères" className={inputCls("password")} />
              {fieldErrors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{fieldErrors.password}
                </p>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Rôle</Label>
            <FormSelect value={form.role} onChange={(e) => setField("role", e.target.value)}>
              <option value="ADMIN">Administrateur</option>
              <option value="USER">Utilisateur</option>
            </FormSelect>
          </div>
        </div>
      </KModal>
    </div>
  );
};

export default Users;
