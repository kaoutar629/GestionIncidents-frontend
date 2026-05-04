const BASE_URL = import.meta.env.VITE_API_URL || "https://gestionincidents-backend.onrender.com/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const request = async (url, options = {}) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: authHeaders(),
    ...options,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
};

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Identifiants incorrects");
  }

  return res.json();
};

export const register = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Erreur lors de l'inscription");
  }

  return res.text();
};

export const getIncidents = (params = {}) => {
  const qs = new URLSearchParams({ page: 0, size: 100, ...params }).toString();
  return request(`/incidents?${qs}`);
};

export const getIncidentById = (id) => request(`/incidents/${id}`);

export const createIncident = (dto) =>
  request("/incidents", { method: "POST", body: JSON.stringify(dto) });

export const updateIncident = (id, dto) =>
  request(`/incidents/${id}`, { method: "PUT", body: JSON.stringify(dto) });

export const deleteIncident = (id) =>
  request(`/incidents/${id}`, { method: "DELETE" });

export const getUsers = (params = {}) => {
  const qs = new URLSearchParams({ page: 0, size: 50, ...params }).toString();
  return request(`/users?${qs}`);
};

export const createUser = (dto) =>
  request("/users", { method: "POST", body: JSON.stringify(dto) });

export const updateUser = (id, dto) =>
  request(`/users/${id}`, { method: "PUT", body: JSON.stringify(dto) });

export const deleteUser = (id) =>
  request(`/users/${id}`, { method: "DELETE" });
