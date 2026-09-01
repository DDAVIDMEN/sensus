"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import {
  ConcertStatus,
  EmotionResponse,
  Song,
} from "@/types";



type EmotionMap = Record<number, string>;

function SongsContent() {
  const { user } = useAuth();

  const [concert, setConcert] = useState<ConcertStatus | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [emotionMap, setEmotionMap] = useState<EmotionMap>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  /**
   * Carga inicial:
   * - estado del concierto;
   * - canciones;
   * - respuestas anteriores del usuario.
   */
  const loadInitialData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setLoadError("");

    try {
      const [concertResponse, songsResponse, responsesResponse] =
        await Promise.all([
          api.get<ConcertStatus>("/concert/state"),
          api.get<Song[]>("/songs/"),
          api.get<EmotionResponse[]>(
            `/responses/user/${user.id}`
          ),
        ]);

      setConcert(concertResponse.data);
      setSongs(songsResponse.data);

      const storedResponses: EmotionMap = {};

      for (const response of responsesResponse.data) {
        storedResponses[response.song_id] =
          response.selected_emotion;
      }

      setEmotionMap(storedResponses);
    } catch (error) {
      console.error("Error cargando la experiencia:", error);
      setLoadError(
        "No pudimos cargar el estado del concierto. Intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Actualiza únicamente el estado del concierto.
   * Por ahora se ejecuta mediante polling.
   * Más adelante será reemplazado por WebSockets.
   */
  const refreshConcertState = useCallback(async () => {
    try {
      const response =
        await api.get<ConcertStatus>("/concert/state");

      setConcert(response.data);
    } catch (error) {
      console.error(
        "Error actualizando el estado del concierto:",
        error
      );
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /**
   * Consulta el estado cada 2 segundos para detectar:
   * - inicio de canción;
   * - apertura de votación;
   * - patrocinador;
   * - final del concierto.
   */
  useEffect(() => {
    if (!user) return;

    const intervalId = window.setInterval(() => {
      refreshConcertState();
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [user, refreshConcertState]);

  /**
   * Calcula el contador de los últimos 15 segundos
   * usando la fecha enviada por el backend.
   */
  useEffect(() => {
    if (
      !concert?.voting_open ||
      !concert.voting_ends_at
    ) {
      setTimeLeft(0);
      return;
    }

    const calculateRemainingTime = () => {
      const endingTime = new Date(
        concert.voting_ends_at as string
      ).getTime();

      const remainingMilliseconds =
        endingTime - Date.now();

      const remainingSeconds = Math.max(
        0,
        Math.ceil(remainingMilliseconds / 1000)
      );

      setTimeLeft(remainingSeconds);
    };

    calculateRemainingTime();

    const timerId = window.setInterval(
      calculateRemainingTime,
      250
    );

    return () => {
      window.clearInterval(timerId);
    };
  }, [
    concert?.voting_open,
    concert?.voting_ends_at,
  ]);

  /**
   * Localiza solamente la canción que el backend
   * marcó como activa.
   */
  const currentSong = useMemo(() => {
    if (!concert?.current_song_id) {
      return null;
    }

    return (
      songs.find(
        (song) =>
          song.id === concert.current_song_id
      ) ?? null
    );
  }, [songs, concert?.current_song_id]);

  /**
   * La votación se considera visible únicamente si:
   * - el backend la abrió;
   * - existe una hora de cierre;
   * - todavía quedan segundos.
   */
  const votingIsAvailable =
    concert?.state === "SONG_ACTIVE" &&
    concert.voting_open &&
    Boolean(concert.voting_ends_at) &&
    timeLeft > 0;

  const handleOptionSelect = async (
    songId: number,
    optionId: number,
    optionTitle: string
  ) => {
    if (!user || !votingIsAvailable || isSaving) {
      return;
    }

    const previousOption = emotionMap[songId];

    setSaveError("");
    setIsSaving(true);

    // Actualización visual inmediata.
    setEmotionMap((previous) => ({
      ...previous,
      [songId]: optionTitle,
    }));

    try {
      await api.post("/responses/", {
        user_id: user.id,
        song_id: songId,
        option_id: optionId,
      });
    } catch (error) {
      console.error(
        "Error guardando la respuesta:",
        error
      );

      // Rollback si el backend rechazó la respuesta.
      setEmotionMap((previous) => {
        const restored = { ...previous };

        if (previousOption) {
          restored[songId] = previousOption;
        } else {
          delete restored[songId];
        }

        return restored;
      });

      setSaveError(
        "No pudimos guardar tu respuesta. Inténtalo nuevamente antes de que termine el tiempo."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell
        eyebrow="Experiencia en vivo"
        title="Cargando concierto"
        description="Estamos preparando tu experiencia."
      >
        <StatusCard>
          <p style={styles.statusText}>
            Consultando el estado del concierto...
          </p>
        </StatusCard>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell
        eyebrow="Experiencia en vivo"
        title="No pudimos cargar el concierto"
        description="Ocurrió un problema al consultar la información."
      >
        <StatusCard>
          <p style={styles.errorText}>{loadError}</p>

          <button
            type="button"
            className="sensus-button-primary"
            onClick={loadInitialData}
            style={{ cursor: "pointer" }}
          >
            Intentar nuevamente
          </button>
        </StatusCard>
      </AppShell>
    );
  }

  if (!concert) {
    return (
      <AppShell
        eyebrow="Experiencia en vivo"
        title="Estado no disponible"
        description="No encontramos información del concierto."
      >
        <StatusCard>
          <p style={styles.statusText}>
            Intenta recargar la página.
          </p>
        </StatusCard>
      </AppShell>
    );
  }

  /**
   * ESTADO 1:
   * El concierto todavía no ha iniciado
   * o se está esperando la siguiente canción.
   */
  if (concert.state === "WAITING_START") {
    return (
      <AppShell
        eyebrow="Experiencia en vivo"
        title="Esperando el inicio del concierto"
        description="La siguiente experiencia musical comenzará en breve."
      >
        <StatusCard>
          <div style={styles.waitingIndicator}>
            <span style={styles.waitingDot} />
            <span style={styles.waitingDot} />
            <span style={styles.waitingDot} />
          </div>

          <h2 style={styles.statusTitle}>
            Todo está listo
          </h2>

          <p style={styles.statusText}>
            Puedes permanecer en esta página o continuar
            explorando Sensus. Cuando la experiencia
            comience, esta pantalla se actualizará
            automáticamente.
          </p>

          <div style={styles.statusActions}>
            <Link
              href="/about"
              className="sensus-button-secondary"
            >
              Conocer el proyecto
            </Link>

            <Link
              href="/"
              className="sensus-button-primary"
            >
              Volver al inicio
            </Link>
          </div>
        </StatusCard>
      </AppShell>
    );
  }

  /**
   * ESTADO 2:
   * Pantalla del patrocinador entre canciones.
   */
  if (concert.state === "SPONSOR") {
    return (
      <AppShell
        eyebrow="Con el apoyo de"
        title="Gracias por hacer posible esta experiencia"
        description="La siguiente pieza comenzará en breve."
      >
        <section
          className="sensus-card"
          style={styles.sponsorCard}
        >
          <p className="sensus-eyebrow">
            Esta experiencia es presentada por
          </p>

          <div style={styles.sponsorLogoArea}>
            <strong style={styles.sponsorName}>
              {concert.sponsor_name ||
                "Patrocinador Sensus"}
            </strong>

            <span style={styles.sponsorCaption}>
              Sinfonía de Piedra y Luz
            </span>
          </div>

          <p style={styles.statusText}>
            Gracias por acompañarnos y contribuir a
            transformar este concierto en una experiencia
            emocional interactiva.
          </p>

          <div style={styles.sponsorProgressTrack}>
            <div style={styles.sponsorProgressFill} />
          </div>
        </section>
      </AppShell>
    );
  }

  /**
   * ESTADO 3:
   * El concierto finalizó.
   */
  if (concert.state === "FINISHED") {
    return (
      <AppShell
        eyebrow="Fin del concierto"
        title="Gracias por vivir Sensus"
        description="Tu recorrido emocional ya está listo."
      >
        <StatusCard>
          <div style={styles.finishedIcon}>✦</div>

          <h2 style={styles.statusTitle}>
            Sinfonía de Piedra y Luz ha finalizado
          </h2>

          <p style={styles.statusText}>
            Consulta cómo resonó la música en ti y descubre
            cómo vivió el público esta experiencia.
          </p>

          <div style={styles.statusActions}>
            <Link
              href="/results"
              className="sensus-button-primary"
            >
              Ver mis resultados
            </Link>
          </div>
        </StatusCard>
      </AppShell>
    );
  }

  /**
   * ESTADO 4:
   * Existe una canción activa.
   */
  if (
    concert.state === "SONG_ACTIVE" &&
    !currentSong
  ) {
    return (
      <AppShell
        eyebrow="Experiencia en vivo"
        title="Preparando la canción"
        description="La pieza activa todavía no está disponible."
      >
        <StatusCard>
          <p style={styles.statusText}>
            Espera unos segundos. Esta pantalla se
            actualizará automáticamente.
          </p>
        </StatusCard>
      </AppShell>
    );
  }

  if (
    concert.state === "SONG_ACTIVE" &&
    currentSong
  ) {
    const selectedEmotion =
      emotionMap[currentSong.id];

    return (
      <AppShell
        eyebrow="Canción en vivo"
        title={currentSong.title}
        description={currentSong.description}
      >
        <section
          className="sensus-card"
          style={styles.songCard}
        >
          <div style={styles.liveHeader}>
            <span className="prototype-live-badge">
              <span className="prototype-live-dot" />
              En vivo
            </span>

            {votingIsAvailable && (
              <div style={styles.timerBox}>
                <span style={styles.timerLabel}>
                  Tiempo
                </span>

                <strong style={styles.timerValue}>
                  00:{String(timeLeft).padStart(2, "0")}
                </strong>
              </div>
            )}
          </div>

          {!votingIsAvailable ? (
            <div style={styles.listeningState}>
              <p className="sensus-eyebrow">
                Escucha con atención
              </p>

              <h2 style={styles.songHeading}>
                Permite que la música resuene en ti.
              </h2>

              <p style={styles.statusText}>
                Las opciones de respuesta aparecerán durante
                los últimos 15 segundos de la pieza.
              </p>

              {concert.voting_open && timeLeft === 0 && (
                <p style={styles.closedMessage}>
                  El tiempo para responder ha terminado.
                  Espera la siguiente canción.
                </p>
              )}
            </div>
          ) : (
            <div>
              <div style={styles.votingHeading}>
                <div>
                  <p className="sensus-eyebrow">
                    Momento de responder
                  </p>

                  <h2 style={styles.songHeading}>
                    {currentSong.question_text ||
                      "¿Qué dejó esta pieza en ti?"}
                  </h2>
                </div>
              </div>

              <div style={styles.emotionGrid}>
                {currentSong.options.map((option) => {
                  const isSelected =
                    selectedEmotion === option.title;

                  return (
                    <label
                      key={option.id}
                      style={styles.emotionOption(
                        isSelected,
                        isSaving
                      )}
                    >
                      <input
                        type="radio"
                        name={`song-${currentSong.id}`}
                        value={option.id}
                        checked={isSelected}
                        disabled={isSaving}
                        onChange={() =>
                          handleOptionSelect(
                            currentSong.id,
                            option.id,
                            option.title
                          )
                        }
                        style={{
                          marginTop: "4px",
                          accentColor: "var(--gold-light)",
                        }}
                      />

                      <span>
                        <strong style={styles.emotionName}>
                          {option.title}
                        </strong>

                        {option.subtitle && (
                          <span style={styles.optionSubtitle}>
                            {option.subtitle}
                          </span>
                        )}

                        {option.description && (
                          <span style={styles.emotionDescription}>
                            {option.description}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>

              {isSaving && (
                <p style={styles.savingMessage}>
                  Guardando tu respuesta...
                </p>
              )}

              {!isSaving && selectedEmotion && (
                <p style={styles.savedMessage}>
                  Tu respuesta “{selectedEmotion}” fue
                  guardada.
                </p>
              )}

              {saveError && (
                <p style={styles.errorText}>
                  {saveError}
                </p>
              )}
            </div>
          )}
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Experiencia en vivo"
      title="Estado no reconocido"
      description="Estamos actualizando la experiencia."
    >
      <StatusCard>
        <p style={styles.statusText}>
          Espera unos segundos o recarga la página.
        </p>
      </StatusCard>
    </AppShell>
  );
}

function StatusCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className="sensus-card"
      style={styles.statusCard}
    >
      {children}
    </section>
  );
}

const styles = {
  statusCard: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "clamp(28px, 6vw, 56px)",
    textAlign: "center",
    borderColor: "rgba(255, 255, 255, 0.12)",
  } as React.CSSProperties,

  statusTitle: {
    margin: "20px 0 12px",
    color: "var(--text-primary)",
    fontSize: "clamp(26px, 5vw, 40px)",
    letterSpacing: "-0.035em",
  } as React.CSSProperties,

  statusText: {
    maxWidth: "620px",
    margin: "14px auto 0",
    color: "var(--text-secondary)",
    fontSize: "16px",
    lineHeight: 1.75,
  } as React.CSSProperties,

  statusActions: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "12px",
  } as React.CSSProperties,

  waitingIndicator: {
    display: "flex",
    justifyContent: "center",
    gap: "9px",
  } as React.CSSProperties,

  waitingDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "var(--gold-light)",
    boxShadow:
      "0 0 18px rgba(201, 150, 36, 0.45)",
  } as React.CSSProperties,

  sponsorCard: {
    maxWidth: "820px",
    margin: "0 auto",
    padding: "clamp(30px, 7vw, 64px)",
    textAlign: "center",
    borderColor: "rgba(255, 255, 255, 0.14)",
  } as React.CSSProperties,

  sponsorLogoArea: {
    width: "min(100%, 540px)",
    minHeight: "180px",
    margin: "34px auto",
    padding: "26px",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(145deg, var(--accent), var(--accent-hover))",
  } as React.CSSProperties,

  sponsorName: {
    color: "#ffffff",
    fontSize: "clamp(25px, 6vw, 48px)",
    letterSpacing: "-0.04em",
  } as React.CSSProperties,

  sponsorCaption: {
    marginTop: "9px",
    color: "rgba(255, 255, 255, 0.76)",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  } as React.CSSProperties,

  sponsorProgressTrack: {
    width: "min(100%, 420px)",
    height: "5px",
    margin: "36px auto 0",
    borderRadius: "99px",
    overflow: "hidden",
    background: "var(--border)",
  } as React.CSSProperties,

  sponsorProgressFill: {
    width: "65%",
    height: "100%",
    borderRadius: "99px",
    background:
      "linear-gradient(90deg, var(--gold), var(--gold-light))",
  } as React.CSSProperties,

  finishedIcon: {
    width: "76px",
    height: "76px",
    margin: "0 auto",
    border: "1px solid var(--gold-light)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--gold-light)",
    fontSize: "32px",
    background: "var(--gold-soft)",
  } as React.CSSProperties,

  songCard: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "clamp(24px, 5vw, 42px)",
    borderColor: "rgba(255, 255, 255, 0.14)",
  } as React.CSSProperties,

  liveHeader: {
    marginBottom: "28px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "18px",
  } as React.CSSProperties,

  timerBox: {
    minWidth: "92px",
    padding: "10px 14px",
    border: "1px solid var(--border-light)",
    borderRadius: "12px",
    textAlign: "center",
    background: "var(--surface)",
  } as React.CSSProperties,

  timerLabel: {
    display: "block",
    color: "var(--text-muted)",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.09em",
    textTransform: "uppercase",
  } as React.CSSProperties,

  timerValue: {
    display: "block",
    marginTop: "3px",
    color: "var(--text-primary)",
    fontSize: "22px",
  } as React.CSSProperties,

  listeningState: {
    padding: "clamp(18px, 4vw, 36px) 0",
    textAlign: "center",
  } as React.CSSProperties,

  votingHeading: {
    marginBottom: "26px",
  } as React.CSSProperties,

  songHeading: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: "clamp(27px, 5vw, 40px)",
    letterSpacing: "-0.04em",
    lineHeight: 1.1,
  } as React.CSSProperties,

  emotionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
  } as React.CSSProperties,

  emotionOption: (
    selected: boolean,
    disabled: boolean
  ): React.CSSProperties => ({
    minHeight: "112px",
    padding: "18px",
    border: selected
      ? "2px solid var(--gold-light)"
      : "1px solid rgba(255, 255, 255, 0.16)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    background: selected
      ? "var(--accent-hover)"
      : "var(--accent)",
    color: "#ffffff",
    cursor: disabled ? "wait" : "pointer",
    opacity: disabled && !selected ? 0.65 : 1,
    transition:
      "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
  }),

  emotionName: {
    display: "block",
    color: "#ffffff",
    fontSize: "18px",
  } as React.CSSProperties,

  optionSubtitle: {
    display: "block",
    marginTop: "5px",
    color: "var(--gold-light)",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1.4,
  } as React.CSSProperties,

  emotionDescription: {
    display: "block",
    marginTop: "7px",
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: "14px",
    lineHeight: 1.5,
  } as React.CSSProperties,

  savingMessage: {
    margin: "20px 0 0",
    color: "var(--text-muted)",
    fontSize: "13px",
  } as React.CSSProperties,

  savedMessage: {
    margin: "20px 0 0",
    color: "var(--success)",
    fontSize: "13px",
    fontWeight: 700,
  } as React.CSSProperties,

  closedMessage: {
    maxWidth: "520px",
    margin: "24px auto 0",
    padding: "13px 16px",
    border: "1px solid rgba(201, 150, 36, 0.28)",
    borderRadius: "12px",
    color: "var(--gold-light)",
    background: "var(--gold-soft)",
    fontSize: "14px",
    lineHeight: 1.6,
  } as React.CSSProperties,

  errorText: {
    margin: "18px 0",
    padding: "13px 15px",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    borderRadius: "10px",
    color: "var(--danger)",
    background: "rgba(248, 113, 113, 0.1)",
    fontSize: "14px",
    lineHeight: 1.55,
  } as React.CSSProperties,
};

export default function SongsPage() {
  return (
    <ProtectedRoute>
      <SongsContent />
    </ProtectedRoute>
  );
}