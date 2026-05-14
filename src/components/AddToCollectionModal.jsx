"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Loader2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function AddToCollectionModal({ movie, onClose }) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [added, setAdded] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/collections")
      .then((r) => r.json())
      .then((data) => {
        // Only show user's own collections (not curated)
        setCollections(
          (data.collections || []).filter((c) => c.user_id === user.id)
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleAdd = async (collectionId) => {
    setAdding(collectionId);
    try {
      await fetch(`/api/collections/${collectionId}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
        }),
      });
      setAdded((prev) => new Set([...prev, collectionId]));
    } catch {}
    setAdding(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.collection) {
        setCollections((prev) => [data.collection, ...prev]);
        setNewName("");
        setShowCreate(false);
        // Auto-add the movie to the new collection
        handleAdd(data.collection.id);
      }
    } catch {}
    setCreating(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{lang === "es" ? "Añadir a colección" : "Add to Collection"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="collection-modal-loading">
            <Loader2 size={24} className="spin" />
          </div>
        ) : (
          <div className="collection-modal-list">
            {collections.map((c) => (
              <button
                key={c.id}
                className="collection-modal-item"
                onClick={() => !added.has(c.id) && handleAdd(c.id)}
                disabled={adding === c.id || added.has(c.id)}
              >
                <span className="collection-modal-item-name">{c.name}</span>
                {adding === c.id ? (
                  <Loader2 size={16} className="spin" />
                ) : added.has(c.id) ? (
                  <Check size={16} className="text-leaf" />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            ))}

            {collections.length === 0 && !showCreate && (
              <p className="collection-modal-empty">
                {lang === "es"
                  ? "No tienes colecciones aún"
                  : "You don't have any collections yet"}
              </p>
            )}
          </div>
        )}

        {showCreate ? (
          <form className="collection-modal-create" onSubmit={handleCreate}>
            <input
              type="text"
              className="input"
              placeholder={lang === "es" ? "Nombre de la colección" : "Collection name"}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!newName.trim() || creating}
            >
              {creating ? <Loader2 size={14} className="spin" /> : lang === "es" ? "Crear" : "Create"}
            </button>
          </form>
        ) : (
          <button
            className="btn btn-ghost btn-sm collection-modal-new-btn"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} /> {lang === "es" ? "Nueva colección" : "New Collection"}
          </button>
        )}
      </div>
    </div>
  );
}
