import { useState } from "react";
import { RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const KTable = ({ dataSource = [], columns = [], onRefresh, slotRight, slotLeft, searchKeys = [] }) => {
  const [query, setQuery]     = useState("");
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);

  const filtered = query
    ? dataSource.filter((row) =>
        searchKeys.length
          ? searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(query.toLowerCase()))
          : columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(query.toLowerCase()))
      )
    : dataSource;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setLoading(true);
    try { await onRefresh(); } finally { setLoading(false); }
  };

  const visibleColumns = columns.filter((c) => c.visible !== false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="pl-9 h-9 text-sm"
            />
          </div>
          {slotLeft}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          )}
          {slotRight}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {visibleColumns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Aucun résultat
                  </td>
                </tr>
              ) : paged.map((row, i) => (
                <tr key={row.id ?? i} className="hover:bg-muted/30 transition-colors">
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KTable;
