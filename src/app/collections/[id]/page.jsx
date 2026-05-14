"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Edit3, X, Check, Loader2 } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import MovieGrid from "@/components/MovieGrid";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function CollectionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const { user } = useAuth();

  const [collection, setCollection] = useState(null);
  const [movies, setMovies] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    fetch(`/api/collections/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCollection(data.collection);
        // Transform collection_movies to movie-card compatible shape
        setMovies(
          (data.movies || []).map((m) => ({
            id: m.tmdb_id,
            title: m.title,
            poster_path: m.poster_path,
            release_date: null,
            vote_average: 0,
            genre_ids: [],
          }))
        );
        setIsOwner(data.isOwner);
        setEditName(data.collection?.name || "");
        setEditDesc(data.collection?.description || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveEdit = async () => {
    const res = await fetch(`/api/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    const data = await res.json();
    if (data.collection) {
      setCollection(data.collection);
      setEditing(false);
    }
  };

  const handleRemoveMovie = async (tmdbId) => {
    await fetch(`/api/collections/${id}/movies`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdbId }),
    });
    setMovies((prev) => prev.filter((m) => m.id !== tmdbId));
  };

  const handleDelete = async () => {
    if (!confirm(lang === "es" ? "¿Eliminar esta colección?" : "Delete this collection?")) return;
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    router.push("/collections");
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="page">
          <div className="empty-state"><Loader2 size={24} className="spin" /></div>
        </div>
      </ClientLayout>
    );
  }

  if (!collection) {
    return (
      <ClientLayout>
        <div className="page">
          <div className="empty-state">
            <p>{lang === "es" ? "Colección no encontrada" : "Collection not found"}</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="page">
        <button className="btn btn-ghost btn-sm mb8" onClick={() => router.push("/collections")}>
          <ArrowLeft size={16} /> {lang === "es" ? "Colecciones" : "Collections"}
        </button>

        <div className="collection-detail-header">
          {editing ? (
            <div className="collection-edit-form">
              <input
                type="text"
                className="input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
              <input
                type="text"
                className="input"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder={lang === "es" ? "Descripción" : "Description"}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                  <Check size={14} /> {lang === "es" ? "Guardar" : "Save"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="page-title">{collection.name}</h1>
              {collection.description && (
                <p className="page-sub">{collection.description}</p>
              )}
              {isOwner && !collection.is_curated && (
                <div className="collection-detail-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                    <Edit3 size={14} /> {lang === "es" ? "Editar" : "Edit"}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--clay)" }} onClick={handleDelete}>
                    <Trash2 size={14} /> {lang === "es" ? "Eliminar" : "Delete"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <p className="collection-movie-count">
          {movies.length} {movies.length === 1 ? (lang === "es" ? "película" : "movie") : (lang === "es" ? "películas" : "movies")}
        </p>

        {movies.length > 0 ? (
          <div className="collection-movies-grid">
            <MovieGrid
              movies={movies}
              loading={false}
              onRemove={isOwner ? handleRemoveMovie : undefined}
            />
          </div>
        ) : (
          <div className="empty-state">
            <p>{lang === "es" ? "Esta colección está vacía" : "This collection is empty"}</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
