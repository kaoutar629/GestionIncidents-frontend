import { useCallback, useEffect, useState } from "react";
import {
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
} from "../config/api";
import { toast } from "react-toastify";

export const useIncidents = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getIncidents({ page: 0, size: 100 });
      setTickets((data.content || []).reverse());
    } catch (e) {
      toast.error("Erreur chargement incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (payload) => {
    await createIncident(payload);
    await fetchIncidents();
  };

  const update = async (id, payload) => {
    await updateIncident(id, payload);
    await fetchIncidents();
  };

  const remove = async (id) => {
    await deleteIncident(id);
    await fetchIncidents();
  };

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    tickets,
    loading,
    fetchIncidents,
    create,
    update,
    remove,
  };
};