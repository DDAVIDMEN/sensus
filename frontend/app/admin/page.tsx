"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/services/api";
import { Song } from "@/types";
import AppShell from "@/components/AppShell";

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
  <AppShell
    eyebrow="Control del concierto"
    title="Panel administrador"
    description="Controla las canciones disponibles y administra la experiencia del concierto."
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "900px",
      }}
    >
        {songs.map((song) => (
          <div
            key={song.id}
            style={{
              backgroundColor:   "linear-gradient(145deg, rgba(36,16,95,.68), rgba(17,17,19,.96))",
              border: "1px solid rgba(255,255,255,.12)",
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
                  backgroundColor: "var(--sensus-blue)",
                  color: "#ffffff",
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
                  backgroundColor: "#591b24",
                  color: "#ffffff",
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
  </AppShell>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}