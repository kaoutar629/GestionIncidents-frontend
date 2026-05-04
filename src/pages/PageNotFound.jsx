import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center space-y-3">
        <p className="text-8xl font-bold text-muted-foreground/20">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>
      <Button onClick={() => navigate("/")}>
        <ArrowLeft className="h-4 w-4" />Retour à l'accueil
      </Button>
    </div>
  );
};

export default PageNotFound;
