import React from "react";

const IncidentDetailModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-96">
        <h2>{ticket.title}</h2>
        <p>{ticket.description}</p>

        <p>Status: {ticket.status}</p>
        <p>Priority: {ticket.priority}</p>

        {ticket.imageBase64 && (
          <img src={ticket.imageBase64} />
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default IncidentDetailModal;