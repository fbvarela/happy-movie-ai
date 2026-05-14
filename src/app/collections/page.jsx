"use client";

import { useState, useEffect } from "react";
import { Plus, Library, Loader2 } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import CollectionCard from "@/components/CollectionCard";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function CollectionsPage() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/collections")
      .then((r) => r.json())
      .then((data) => setCollections(data.collections || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || null }),
      });
      const data = await res.json();
      if (data.collection) {
        setCollections((prev) => [{ ...data.collection, movie_count: 0, cover_posters: [] }, ...prev]);
        setNewName("");
        setNewDesc("");
        setShowCreate(false);
      }
    } catch {}
    setCreating(false);
  };

  const curated = collections.filter((c) => c.is_curated);
  const userColls = collections.filter((c) => !c.is_curated);

  return (
    <ClientLayout>
      <div className="page">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t("collections.title")}</h1>
            <p className="page-sub">{t("collections.subtitle")}</p>
          </div>
          {user && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreate(!showCreate)}
            >
              <Plus size={16} /> {lang === "es" ? "Nueva" : "New"}
            </button>
          )}
        </div>

        {showCreate && (
          <form className="collection-create-form" onSubmit={handleCreate}>
            <input
              type="text"
              className="input"
              placeholder={lang === "es" ? "Nombre de la colección" : "Collection name"}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              className="input"
              placeholder={lang === "es" ? "Descripción (opcional)" : "Description (optional)"}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!newName.trim() || creating}>
                {creating ? <Loader2 size={14} className="spin" /> : lang === "es" ? "Crear" : "Create"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>
                {lang === "es" ? "Cancelar" : "Cancel"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="empty-state"><Loader2 size={24} className="spin" /></div>
        ) : (
          <>
            {curated.length > 0 && (
              <div className="collection-section">
                <h2 className="section-title">
                  {lang === "es" ? "Colecciones destacadas" : "Featured Collections"}
                </h2>
                <div className="collection-grid">
                  {curated.map((c) => (
                    <CollectionCard key={c.id} collection={c} />
                  ))}
                </div>
              </div>
            )}

            {userColls.length > 0 && (
              <div className="collection-section">
                <h2 className="section-title">
                  {lang === "es" ? "Mis colecciones" : "My Collections"}
                </h2>
                <div className="collection-grid">
                  {userColls.map((c) => (
                    <CollectionCard key={c.id} collection={c} />
                  ))}
                </div>
              </div>
            )}

            {collections.length === 0 && (
              <div className="empty-state">
                <Library size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
                <p>{lang === "es" ? "No hay colecciones aún" : "No collections yet"}</p>
                {user && (
                  <button className="btn btn-primary mt8" onClick={() => setShowCreate(true)}>
                    <Plus size={16} /> {lang === "es" ? "Crear colección" : "Create Collection"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ClientLayout>
  );
}
