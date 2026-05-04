import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const KModal = ({ title, show, onSave, onHide, saving = false, children, saveLabel = "Enregistrer" }) => (
  <Dialog open={show} onOpenChange={(open) => { if (!open) onHide(); }}>
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
      </DialogHeader>
      <div className="py-2">{children}</div>
      <DialogFooter>
        <Button variant="outline" onClick={onHide} disabled={saving}>
          Annuler
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</> : saveLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default KModal;
