import React from "react";

const IncidentFilters = ({
  filters,
  setFilters,
  inputClass,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* FIX: valeurs correspondent aux enums backend LOW/MEDIUM/HIGH */}
      <select
        value={filters.priority}
        onChange={(e) =>
          setFilters({ ...filters, priority: e.target.value })
        }
        className={inputClass}
      >
        <option value="">Toutes priorités</option>
        <option value="LOW">Faible</option>
        <option value="MEDIUM">Moyenne</option>
        <option value="HIGH">Haute</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) =>
          setFilters({ ...filters, status: e.target.value })
        }
        className={inputClass}
      >
        <option value="">Tous états</option>
        <option value="OPEN">Nouveau</option>
        <option value="IN_PROGRESS">En cours</option>
        <option value="RESOLVED">Résolu</option>
        <option value="CLOSED">Clôturé</option>
      </select>

      <input
        type="date"
        value={filters.startDate}
        onChange={(e) =>
          setFilters({ ...filters, startDate: e.target.value })
        }
        className={inputClass}
      />

      <input
        type="date"
        value={filters.endDate}
        onChange={(e) =>
          setFilters({ ...filters, endDate: e.target.value })
        }
        className={inputClass}
      />
    </div>
  );
};

export default IncidentFilters;
