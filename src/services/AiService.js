const BASE_URL = import.meta.env.VITE_API_URL || "https://gestionincidents-backend.onrender.com/api";

export const classifyIncident = async (title, description) => {
  const text = `${title} ${description}`.trim();
  if (!text || text.length < 5) return null;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/ai/classify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (e) {
    console.error("Erreur IA:", e);
    return null;
  }
};
