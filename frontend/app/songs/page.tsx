"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Song, EmotionResponse, SongStatus } from "@/types";

const EMOTIONS = ["Alegría", "Nostalgia", "Esperanza"];

type EmotionMap = Record<number, string>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSongStatus(song: Song, emotionMap: EmotionMap): SongStatus {
  if (!song.is_unlocked) return "locked";
  if (emotionMap[song.id]) return "answered";
  return "pending";
}

const STATUS_LABEL: Record<SongStatus, string> = {
  locked:   "🔒 Bloqueada",
  pending:  "⏳ Pendiente",
  answered: "✅ Respondida",
};

const STATUS_COLOR: Record<SongStatus, string> = {
  locked:   "#6b7280",
  pending:  "#f59e0b",
  answered: "#10b981",
};

// ── Estilos inline centralizados ──────────────────────────────────────────────

const styles = {
  page: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "40px 16px",
    fontFamily: "var(--font-geist-sans), sans-serif",
    color: "#f9fafb",
  } as React.CSSProperties,

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  } as React.CSSProperties,

  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    color: "#ffffff",
  } as React.CSSProperties,

  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  } as React.CSSProperties,

  logoutBtn: {
    background: "none",
    border: "1px solid #374151",
    color: "#9ca3af",
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
  } as React.CSSProperties,

  progressSection: {
    marginBottom: 32,
  } as React.CSSProperties,

  progressLabel: {
    fontSize: 14,
    color: "#d1d5db",
    marginBottom: 8,
  } as React.CSSProperties,

  progressTrack: {
    height: 8,
    backgroundColor: "#1f2937",
    borderRadius: 99,
    overflow: "hidden",
  } as React.CSSProperties,

  progressFill: (pct: number): React.CSSProperties => ({
    height: "100%",
    width: `${pct}%`,
    backgroundColor: "#6366f1",
    borderRadius: 99,
    transition: "width 0.4s ease",
  }),

  songList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  } as React.CSSProperties,

  card: (status: SongStatus): React.CSSProperties => ({
    backgroundColor: status === "locked" ? "#0d1117" : "#111827",
    border: `1px solid ${status === "answered" ? "#065f46" : "#1f2937"}`,
    borderRadius: 16,
    padding: 24,
    opacity: status === "locked" ? 0.6 : 1,
    transition: "border-color 0.2s",
  }),

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  } as React.CSSProperties,

  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#f9fafb",
    margin: 0,
  } as React.CSSProperties,

  statusBadge: (status: SongStatus): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 600,
    color: STATUS_COLOR[status],
    backgroundColor: `${STATUS_COLOR[status]}18`,
    padding: "3px 8px",
    borderRadius: 99,
    whiteSpace: "nowrap",
  }),

  cardDesc: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 0,
    marginBottom: 16,
    lineHeight: 1.5,
  } as React.CSSProperties,

  emotionList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  } as React.CSSProperties,

  emotionLabel: (isSelected: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${isSelected ? "#4f46e5" : "#1f2937"}`,
    backgroundColor: isSelected ? "#1e1b4b" : "transparent",
    color: isSelected ? "#a5b4fc" : "#d1d5db",
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.15s ease",
  }),

  savingText: {
    marginLeft: "auto",
    fontSize: 11,
    color: "#6b7280",
  } as React.CSSProperties,

  footer: {
    marginTop: 40,
    textAlign: "center",
  } as React.CSSProperties,

  finishBtn: (disabled: boolean): React.CSSProperties => ({
    padding: "14px 32px",
    backgroundColor: disabled ? "#1f2937" : "#6366f1",
    color: disabled ? "#4b5563" : "#ffffff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s",
  }),

  finishHint: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 10,
  } as React.CSSProperties,

  loadingText: {
    textAlign: "center",
    marginTop: 80,
    color: "#6b7280",
  } as React.CSSProperties,
};

// ── Componente principal ──────────────────────────────────────────────────────

function SongsContent() {
  const { user, logout } = useAuth();

  const [songs, setSongs]           = useState<Song[]>([]);
  const [emotionMap, setEmotionMap] = useState<EmotionMap>({});
  const [isLoading, setIsLoading]   = useState(true);
  const [savingFor, setSavingFor]   = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    console.log("USER EN SONGS:", user);
    try {
      const [songsRes, responsesRes] = await Promise.all([
        api.get<Song[]>("/songs/"),
        
        api.get<EmotionResponse[]>(`/responses/user/${user.id}`),
      ]);

      setSongs(songsRes.data);

      const map: EmotionMap = {};
      for (const r of responsesRes.data) {
        map[r.song_id] = r.selected_emotion;
      }
      setEmotionMap(map);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEmotionSelect = async (songId: number, emotion: string) => {
    if (!user) return;

    setEmotionMap((prev) => ({ ...prev, [songId]: emotion }));
    setSavingFor(songId);

    try {
      await api.post("/responses/", {
        user_id: user.id,
        song_id: songId,
        selected_emotion: emotion,
      });
    } catch (error) {
      console.error("Error guardando respuesta:", error);
      // Rollback
      setEmotionMap((prev) => {
        const restored = { ...prev };
        delete restored[songId];
        return restored;
      });
    } finally {
      setSavingFor(null);
    }
  };

  // ── Progreso ───────────────────────────────────────────────────────────────

  const answeredCount = songs.filter((s) => emotionMap[s.id]).length;
  const totalSongs = songs.length;
  const allAnswered = totalSongs > 0 && answeredCount === totalSongs;
  const progressPct = totalSongs > 0 ? (answeredCount / totalSongs) * 100 : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return <p style={styles.loadingText}>Cargando canciones...</p>;
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sensus</h1>
          <p style={styles.subtitle}>{user?.email}</p>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      {/* Progreso */}
      <div style={styles.progressSection}>
        <p style={styles.progressLabel}>
          <strong>{answeredCount}</strong> / {totalSongs} canciones respondidas
        </p>
        <div style={styles.progressTrack}>
          <div style={styles.progressFill(progressPct)} />
        </div>
      </div>

      {/* Lista de canciones */}
      <div style={styles.songList}>
        {songs.map((song) => {
          const status     = getSongStatus(song, emotionMap);
          const isSaving   = savingFor === song.id;

          return (
            <div key={song.id} style={styles.card(status)}>

              {/* Cabecera de card */}
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>{song.title}</h2>
                <span style={styles.statusBadge(status)}>
                  {STATUS_LABEL[status]}
                </span>
              </div>

              <p style={styles.cardDesc}>{song.description}</p>

              {/* Opciones emocionales */}
              {song.is_unlocked && (
                <div style={styles.emotionList}>
                  {EMOTIONS.map((emotion) => {
                    const isSelected = emotionMap[song.id] === emotion;
                    return (
                      <label
                        key={emotion}
                        style={styles.emotionLabel(isSelected)}
                      >
                        <input
                          type="radio"
                          name={`song-${song.id}`}
                          value={emotion}
                          checked={isSelected}
                          disabled={isSaving}
                          onChange={() => handleEmotionSelect(song.id, emotion)}
                          style={{ accentColor: "#6366f1" }}
                        />
                        <span>{emotion}</span>
                        {isSaving && isSelected && (
                          <span style={styles.savingText}>Guardando...</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón final */}
      <div style={styles.footer}>
        <button
          style={styles.finishBtn(!allAnswered)}
          disabled={!allAnswered}
          onClick={() => {
            // Próximo paso: navegar a /results
          }}
        >
          Ver mi resultado
        </button>
        {!allAnswered && (
          <p style={styles.finishHint}>
            Responde todas las canciones para continuar.
          </p>
        )}
      </div>

    </div>
  );
}

export default function SongsPage() {
  return (
    <ProtectedRoute>
      <SongsContent />
    </ProtectedRoute>
  );
}
