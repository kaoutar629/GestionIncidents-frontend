import moment from "moment";
import { useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import AuthContext from "../config/AuthContext";
import KTable from "../components/KTable";
import KModal from "../components/KModal";
import { getIncidents, createIncident, updateIncident, deleteIncident, getUsers } from "../config/api";
import { isAdmin as checkAdmin } from "../config/roles";
import { classifyIncident } from "../services/AiService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, Plus, Pencil, Trash2, Eye, Sparkles, CheckCircle2, Loader2, Paperclip, X, Image } from "lucide-react";

const STATUS_CONFIG = {
  OPEN:        { label: "Nouveau",  className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  IN_PROGRESS: { label: "En cours", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  RESOLVED:    { label: "Résolu",   className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  CLOSED:      { label: "Clôturé",  className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

const PRIO_CONFIG = {
  LOW:    { label: "Faible",  className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  MEDIUM: { label: "Moyenne", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  HIGH:   { label: "Haute",   className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

const CATEGORIES = ["Réseau", "Matériel", "Logiciel", "Sécurité", "Accès", "Performance", "Autre"];
const ALLOWED_IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMG_MB = 2;

const parseApiError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("403") || msg.includes("forbidden")) return "Action non autorisée.";
  if (msg.includes("404")) return "Incident introuvable.";
  if (msg.includes("title") && msg.includes("blank")) return "Le titre est obligatoire.";
  if (msg.includes("failed to fetch") || msg.includes("network")) return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  if (msg.includes("500")) return "Erreur serveur interne. Réessayez dans quelques instants.";
  return err?.message || "Une erreur est survenue.";
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || { label: status, className: "bg-slate-100 text-slate-600" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.className}`}>{c.label}</span>;
};

const PrioBadge = ({ priority }) => {
  const c = PRIO_CONFIG[priority] || { label: priority, className: "bg-slate-100 text-slate-600" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.className}`}>{c.label}</span>;
};

const FormSelect = ({ value, onChange, disabled, children, className = "" }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </select>
);

const Incidents = () => {
  const { user }   = useContext(AuthContext);
  const isAdmin    = checkAdmin(user);

  const [tickets,   setTickets]   = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [show,      setShow]      = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [ticketId,    setTicketId]    = useState(null);
  const [titre,       setTitre]       = useState("");
  const [description, setDesc]        = useState("");
  const [prio,        setPrio]        = useState("LOW");
  const [category,    setCategory]    = useState("");
  const [status,      setStatus]      = useState("OPEN");
  const [assignedId,  setAssignedId]  = useState(null);
  const [imgPreview,  setImgPreview]  = useState(null);
  const [imgBase64,   setImgBase64]   = useState(null);
  const [imgError,    setImgError]    = useState("");

  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiApplied,    setAiApplied]    = useState(false);
  const aiTimerRef = useRef(null);

  const [detailTicket, setDetail]      = useState(null);
  const [filterPrio,   setFilterPrio]  = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const fileRef = useRef(null);

  const clearFieldError = (key) => setFieldErrors((p) => ({ ...p, [key]: "" }));

  const fetchIncidents = useCallback(async () => {
    setLoading(true); setLoadError("");
    try {
      const data = await getIncidents({ page: 0, size: 200 });
      setTickets((data.content || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setLoadError(parseApiError(err));
    } finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try { const d = await getUsers({ page: 0, size: 200 }); setUsersList(d.content || []); }
    catch {}
  }, [isAdmin]);

  useEffect(() => { fetchIncidents(); fetchUsers(); }, [fetchIncidents, fetchUsers]);

  const resetForm = () => {
    setTicketId(null); setTitre(""); setDesc(""); setPrio("LOW");
    setCategory(""); setStatus("OPEN"); setAssignedId(null);
    setImgPreview(null); setImgBase64(null); setImgError("");
    setFormError(""); setFieldErrors({}); setAiSuggestion(null); setAiApplied(false);
    clearTimeout(aiTimerRef.current);
  };

  const triggerAI = (title, desc) => {
    clearTimeout(aiTimerRef.current);
    setAiSuggestion(null); setAiApplied(false);
    if (!title || title.trim().length < 8) return;
    setAiLoading(true);
    aiTimerRef.current = setTimeout(async () => {
      const result = await classifyIncident(title, desc);
      setAiSuggestion(result); setAiLoading(false);
    }, 1000);
  };

  const applyAI = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.priority) setPrio(aiSuggestion.priority);
    if (aiSuggestion.category) setCategory(aiSuggestion.category);
    setAiApplied(true);
  };

  const handleImageChange = (e) => {
    setImgError("");
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_IMG_TYPES.includes(file.type)) {
      setImgError("Format non supporté. Utilisez JPEG, PNG ou WebP.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMG_MB * 1024 * 1024) {
      setImgError(`Photo trop volumineuse (max ${MAX_IMG_MB} Mo).`);
      e.target.value = "";
      return;
    }
    const r = new FileReader();
    r.onload  = () => { setImgBase64(r.result); setImgPreview(r.result); };
    r.onerror = () => setImgError("Erreur lors de la lecture du fichier.");
    r.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!titre.trim()) errs.titre = "Le titre est obligatoire.";
    else if (titre.trim().length < 5) errs.titre = "Le titre doit contenir au moins 5 caractères.";
    else if (titre.trim().length > 200) errs.titre = "Le titre ne doit pas dépasser 200 caractères.";
    if (isAdmin && !ticketId && !assignedId) errs.assignedId = "Veuillez sélectionner un utilisateur.";
    return errs;
  };

  const saveIncident = async () => {
    setFormError(""); setFieldErrors({});
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setSaving(true);
    try {
      const dto = {
        title: titre.trim(), description: description.trim(),
        priority: prio, category, status,
        createdById: isAdmin ? (assignedId || user?.id) : user?.id,
        assignedUserId: assignedId || null,
        imageBase64: imgBase64 || null,
      };
      if (ticketId) await updateIncident(ticketId, dto);
      else await createIncident(dto);
      toast.success(ticketId ? "Incident modifié." : "Incident créé.");
      setShow(false); resetForm(); fetchIncidents();
    } catch (err) {
      const msg = parseApiError(err);
      if (msg.toLowerCase().includes("titre") || msg.toLowerCase().includes("title"))
        setFieldErrors((p) => ({ ...p, titre: msg }));
      else setFormError(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet incident définitivement ?")) return;
    try { await deleteIncident(id); toast.success("Incident supprimé."); fetchIncidents(); }
    catch (err) { toast.error(parseApiError(err)); }
  };

  const editTicket = (t) => {
    setTicketId(t.id); setTitre(t.title || ""); setDesc(t.description || "");
    setPrio(t.priority || "LOW"); setCategory(t.category || "");
    setStatus(t.status || "OPEN"); setAssignedId(t.assignedUserId || null);
    setImgPreview(t.imageBase64 || null); setImgBase64(t.imageBase64 || null);
    setFormError(""); setFieldErrors({}); setAiSuggestion(null); setAiApplied(false);
    setShow(true);
  };

  const filtered = useMemo(() =>
    tickets.filter((t) =>
      (!filterPrio   || t.priority === filterPrio) &&
      (!filterStatus || t.status   === filterStatus)
    ), [tickets, filterPrio, filterStatus]);

  const getUserLabel = (id) => {
    const u = usersList.find((u) => u.id === id);
    return u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email : `#${id}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Incidents</h1>
          <p className="text-sm text-muted-foreground">Gérez et suivez les incidents.</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />Chargement...
          </div>
        )}
      </div>

      {loadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {loadError}
            <Button variant="ghost" size="sm" className="ml-4 text-destructive hover:text-destructive" onClick={fetchIncidents}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <FormSelect value={filterPrio} onChange={(e) => setFilterPrio(e.target.value)} className="w-40">
          <option value="">Toutes priorités</option>
          {Object.entries(PRIO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </FormSelect>
        <FormSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-40">
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </FormSelect>
        {(filterPrio || filterStatus) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterPrio(""); setFilterStatus(""); }}>
            <X className="h-4 w-4" />Effacer
          </Button>
        )}
      </div>

      <KTable
        onRefresh={fetchIncidents}
        dataSource={filtered}
        searchKeys={["title", "description", "category"]}
        slotRight={
          <Button size="sm" onClick={() => { resetForm(); setShow(true); }}>
            <Plus className="h-4 w-4" />Nouveau
          </Button>
        }
        columns={[
          { key: "title", name: "Titre", render: (v, row) => (
            <button onClick={() => setDetail(row)} className="text-left font-medium hover:underline max-w-xs truncate block text-sm">
              {v}
            </button>
          )},
          { key: "status",   name: "Statut",   render: (v) => <StatusBadge status={v} /> },
          { key: "priority", name: "Priorité",  render: (v) => <PrioBadge priority={v} /> },
          { key: "category", name: "Catégorie", render: (v) => v
            ? <span className="text-sm text-muted-foreground">{v}</span>
            : <span className="text-muted-foreground">—</span>
          },
          { key: "imageBase64", name: "Photo", render: (v) => v
            ? <Image className="h-4 w-4 text-muted-foreground" />
            : <span className="text-muted-foreground text-xs">—</span>
          },
          { key: "createdAt", name: "Date", render: (v) => (
            <span className="text-xs text-muted-foreground">{v ? moment(v).format("DD/MM/YY HH:mm") : "—"}</span>
          )},
          { key: "createdById", name: "Créé par", visible: isAdmin, render: (v) => (
            <span className="text-sm">{getUserLabel(v)}</span>
          )},
          { key: "action", name: "", render: (_, t) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetail(t)} title="Détails">
                <Eye className="h-3.5 w-3.5" />
              </Button>
              {(isAdmin || t.createdById === user?.id) && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editTicket(t)} title="Modifier">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {isAdmin && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(t.id)} title="Supprimer">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )},
        ]}
      />

      {/* Create / Edit Modal */}
      <KModal title={ticketId ? "Modifier l'incident" : "Nouvel incident"}
        show={show} onSave={saveIncident} onHide={() => { setShow(false); resetForm(); }} saving={saving}>
        <div className="space-y-4">
          {formError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{formError}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Titre <span className="text-destructive">*</span></Label>
            <Input value={titre} disabled={saving}
              onChange={(e) => { const v = e.target.value; setTitre(v); clearFieldError("titre"); triggerAI(v, description); }}
              placeholder="Ex: Serveur de messagerie injoignable"
              className={fieldErrors.titre ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {fieldErrors.titre && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{fieldErrors.titre}
              </p>
            )}

            {/* AI suggestion */}
            {aiLoading && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Loader2 className="h-3 w-3 animate-spin" />Analyse IA en cours...
              </p>
            )}
            {aiSuggestion && !aiLoading && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3 mt-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Suggestion IA</span>
                </div>
                <div className="flex flex-wrap gap-2 items-center mb-2.5 text-xs text-muted-foreground">
                  <span>Priorité :</span>
                  <PrioBadge priority={aiSuggestion.priority} />
                  <span className="ml-1">Catégorie :</span>
                  <span className="font-medium text-foreground">{aiSuggestion.category}</span>
                </div>
                {aiSuggestion.explanation && (
                  <p className="text-xs text-muted-foreground italic mb-2">{aiSuggestion.explanation}</p>
                )}
                {!aiApplied
                  ? <Button size="sm" className="h-7 text-xs" onClick={applyAI}><CheckCircle2 className="h-3 w-3" />Appliquer</Button>
                  : <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Appliqué</p>
                }
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea value={description} disabled={saving}
              onChange={(e) => { setDesc(e.target.value); triggerAI(titre, e.target.value); }}
              placeholder="Décrivez l'incident en détail..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priorité</Label>
              <FormSelect value={prio} onChange={(e) => setPrio(e.target.value)} disabled={saving}>
                {Object.entries(PRIO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </FormSelect>
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <FormSelect value={category} onChange={(e) => setCategory(e.target.value)} disabled={saving}>
                <option value="">— Choisir —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
            </div>
          </div>

          {/* Status + Assigned (admin) */}
          {(ticketId || isAdmin) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <FormSelect value={status} onChange={(e) => setStatus(e.target.value)} disabled={saving}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </FormSelect>
              </div>
              {isAdmin && (
                <div className="space-y-1.5">
                  <Label>Assigné à {!ticketId && <span className="text-destructive">*</span>}</Label>
                  <FormSelect value={assignedId || ""} onChange={(e) => { setAssignedId(e.target.value || null); clearFieldError("assignedId"); }} disabled={saving}
                    className={fieldErrors.assignedId ? "border-destructive" : ""}>
                    <option value="">— Choisir —</option>
                    {usersList.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>)}
                  </FormSelect>
                  {fieldErrors.assignedId && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{fieldErrors.assignedId}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Image */}
          <div className="space-y-1.5">
            <Label>
              Photo jointe
              <span className="text-xs text-muted-foreground ml-1">(JPEG, PNG, WebP — max {MAX_IMG_MB} Mo)</span>
            </Label>
            <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleImageChange} />
            {!imgPreview ? (
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()} disabled={saving}>
                <Paperclip className="h-4 w-4" />Joindre une photo
              </Button>
            ) : (
              <div className="relative">
                <img src={imgPreview} alt="Aperçu" className="w-full rounded-md object-contain border max-h-48" />
                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7"
                  onClick={() => { setImgPreview(null); setImgBase64(null); if (fileRef.current) fileRef.current.value = ""; }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            {imgError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{imgError}
              </p>
            )}
          </div>
        </div>
      </KModal>

      {/* Detail Modal */}
      <Dialog open={!!detailTicket} onOpenChange={(open) => { if (!open) setDetail(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Incident #{detailTicket?.id}
            </DialogTitle>
          </DialogHeader>
          {detailTicket && (
            <div className="space-y-4 py-1">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Titre</p>
                <p className="font-medium">{detailTicket.title}</p>
              </div>
              {detailTicket.description && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{detailTicket.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Statut</p>
                  <StatusBadge status={detailTicket.status} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Priorité</p>
                  <PrioBadge priority={detailTicket.priority} />
                </div>
                {detailTicket.category && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Catégorie</p>
                    <p className="text-sm">{detailTicket.category}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Date</p>
                  <p className="text-sm">{detailTicket.createdAt ? moment(detailTicket.createdAt).format("DD/MM/YYYY HH:mm") : "—"}</p>
                </div>
                {isAdmin && detailTicket.createdById && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Créé par</p>
                    <p className="text-sm">{getUserLabel(detailTicket.createdById)}</p>
                  </div>
                )}
              </div>
              {detailTicket.imageBase64 ? (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Photo jointe</p>
                  <img src={detailTicket.imageBase64} alt="Photo" className="w-full rounded-md object-contain border max-h-64" />
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Photo jointe</p>
                  <p className="text-sm text-muted-foreground italic">Aucune photo jointe</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>Fermer</Button>
            {(isAdmin || detailTicket?.createdById === user?.id) && (
              <Button onClick={() => { editTicket(detailTicket); setDetail(null); }}>
                <Pencil className="h-4 w-4" />Modifier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Incidents;
