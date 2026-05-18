"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/services/api";
import { Song } from "@/types";

function AdminContent() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchSongs = async () => {
    try {
      const response = await api.get<Song[]>("/songs/");
      setSongs(response.data);
    } catch (error) {
      console.error("Error cargando canciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleUnlock = async (songId: number) => {
    setUpdatingId(songId);

    try {
      await api.patch(`/songs/${songId}/unlock`);
      await fetchSongs();
    } catch (error) {
      console.error("Error desbloqueando canción:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLock = async (songId: number) => {
    setUpdatingId(songId);

    try {
      await api.patch(`/songs/${songId}/lock`);
      await fetchSongs();
    } catch (error) {
      console.error("Error bloqueando canción:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <main style={{ padding: "40px", color: "#f9fafb" }}>
        Cargando panel admin...
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px 16px",
        color: "#f9fafb",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
        Panel administrador
      </h1>

      <p style={{ color: "#9ca3af", marginBottom: "28px" }}>
        Controla manualmente qué canciones están disponibles para votar.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {songs.map((song) => (
          <div
            key={song.id}
            style={{
              backgroundColor: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "14px",
              padding: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "16px", margin: 0 }}>{song.title}</h2>

              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  margin: "6px 0 0",
                }}
              >
                {song.description}
              </p>

              <p
                style={{
                  fontSize: "12px",
                  marginTop: "8px",
                  color: song.is_unlocked ? "#10b981" : "#f59e0b",
                  fontWeight: 600,
                }}
              >
                {song.is_unlocked ? "✅ Desbloqueada" : "🔒 Bloqueada"}
              </p>
            </div>

            {song.is_unlocked ? (
              <button
                onClick={() => handleLock(song.id)}
                disabled={updatingId === song.id}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#7f1d1d",
                  color: "#fecaca",
                  fontWeight: 600,
                  cursor: updatingId === song.id ? "not-allowed" : "pointer",
                  minWidth: "120px",
                }}
              >
                {updatingId === song.id ? "Actualizando..." : "Bloquear"}
              </button>
            ) : (
              <button
                onClick={() => handleUnlock(song.id)}
                disabled={updatingId === song.id}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#065f46",
                  color: "#d1fae5",
                  fontWeight: 600,
                  cursor: updatingId === song.id ? "not-allowed" : "pointer",
                  minWidth: "120px",
                }}
              >
                {updatingId === song.id ? "Actualizando..." : "Desbloquear"}
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}