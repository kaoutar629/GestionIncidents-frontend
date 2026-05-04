import React from "react";

const IncidentForm = ({
  titre,
  setTitre,
  description,
  setDescription,
  priority,
  setPriority,
  category,
  setCategory,
  imagePreview,
  setImage,
  onSubmit,
  suggestion,
  applySuggestion,
  inputClass,
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result); // base64 string
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">

      <input
        placeholder="Titre"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className={inputClass}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={inputClass}
        rows={3}
      />

      {/* IA Suggestion */}
      {suggestion && (
        <div className="p-2 border rounded bg-blue-50">
          <p>Priorité suggérée : <strong>{suggestion.priority}</strong></p>
          <p>Catégorie suggérée : <strong>{suggestion.category}</strong></p>
          {suggestion.explanation && <p className="text-xs text-gray-500">{suggestion.explanation}</p>}
          <button
            onClick={applySuggestion}
            className="mt-1 px-2 py-1 bg-blue-600 text-white text-sm rounded"
          >
            Appliquer
          </button>
        </div>
      )}

      {/* FIX: valeurs LOW/MEDIUM/HIGH correspondant aux enums backend */}
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className={inputClass}
      >
        <option value="LOW">Faible</option>
        <option value="MEDIUM">Moyenne</option>
        <option value="HIGH">Haute</option>
      </select>

      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={inputClass}
        placeholder="Catégorie"
      />

      {/* FIX: lecture en base64 pour envoi au backend */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {imagePreview && (
        <img src={imagePreview} className="h-24 rounded" alt="preview" />
      )}

      <button
        onClick={onSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Enregistrer
      </button>
    </div>
  );
};

export default IncidentForm;
