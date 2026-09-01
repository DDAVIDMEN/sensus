"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import api from "@/services/api";
import {
  ConcertStatus,
  GlobalResultsResponse,
  Song,
} from "@/types";

const SPONSOR_DURATION_SECONDS = 8;

const STATE_LABELS: Record<
  ConcertStatus["state"],
  string
> = {
  WAITING_START: "Esperando inicio",
  SONG_ACTIVE: "Canción activa",
  SPONSOR: "Patrocinador",
  FINISHED: "Concierto finalizado",
};

const STATE_COLORS: Record<
  ConcertStatus["state"],
  string
> = {
  WAITING_START: "#f59e0b",
  SONG_ACTIVE: "#10b981",
  SPONSOR: "#8b5cf6",
  FINISHED: "#C99624",
};

function AdminContent() {
  const [songs, setSongs] = useState<Song[]>([]);

  const [concert, setConcert] =
    useState<ConcertStatus | null>(null);

  const [globalResults, setGlobalResults] =
    useState<GlobalResultsResponse | null>(null);

  const [selectedSongId, setSelectedSongId] =
    useState<number | null>(null);

  const [sponsorName, setSponsorName] =
    useState("Patrocinador Sensus");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoadingStats, setIsLoadingStats] =
    useState(true);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [votingTimeLeft, setVotingTimeLeft] =
    useState(0);

  const [sponsorTimeLeft, setSponsorTimeLeft] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [statsErrorMessage, setStatsErrorMessage] =
    useState("");

  const closeRequestSent = useRef(false);

  /*
   * Carga inicial de canciones y estado
   * del concierto.
   */
  const loadInitialData =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [
          songsResponse,
          concertResponse,
        ] = await Promise.all([
          api.get<Song[]>("/songs/"),
          api.get<ConcertStatus>(
            "/concert/state"
          ),
        ]);

        setSongs(songsResponse.data);
        setConcert(concertResponse.data);
      } catch (error) {
        console.error(
          "Error cargando panel administrador:",
          error
        );

        setErrorMessage(
          "No pudimos cargar el estado del concierto."
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  /*
   * Consulta solamente el estado actual
   * del concierto.
   */
  const refreshConcertState =
    useCallback(async () => {
      try {
        const response =
          await api.get<ConcertStatus>(
            "/concert/state"
          );

        setConcert(response.data);
      } catch (error) {
        console.error(
          "Error actualizando estado:",
          error
        );
      }
    }, []);

  /*
   * Consulta las estadísticas globales.
   */
  const loadGlobalResults =
    useCallback(async () => {
      setIsLoadingStats(true);
      setStatsErrorMessage("");

      try {
        const response =
          await api.get<GlobalResultsResponse>(
            "/results/global"
          );

        setGlobalResults(response.data);
      } catch (error) {
        console.error(
          "Error cargando estadísticas del concierto:",
          error
        );

        setStatsErrorMessage(
          "No fue posible cargar las estadísticas del concierto."
        );
      } finally {
        setIsLoadingStats(false);
      }
    }, []);

  /*
   * Carga inicial.
   */
  useEffect(() => {
    loadInitialData();
    loadGlobalResults();
  }, [
    loadInitialData,
    loadGlobalResults,
  ]);

  /*
   * Polling del estado del concierto
   * cada dos segundos.
   */
  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        refreshConcertState();
      }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshConcertState]);

  /*
   * Actualización de estadísticas
   * cada cinco segundos.
   */
  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        loadGlobalResults();
      }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadGlobalResults]);

  /*
   * Contador visual de votación.
   */
  useEffect(() => {
    if (
      !concert?.voting_open ||
      !concert.voting_ends_at
    ) {
      setVotingTimeLeft(0);
      closeRequestSent.current = false;
      return;
    }

    const votingEndsAt =
      concert.voting_ends_at;

    const calculateTimeLeft = () => {
      const endTime = new Date(
        votingEndsAt
      ).getTime();

      const remaining = Math.max(
        0,
        Math.ceil(
          (endTime - Date.now()) / 1000
        )
      );

      setVotingTimeLeft(remaining);
    };

    calculateTimeLeft();

    const intervalId =
      window.setInterval(
        calculateTimeLeft,
        250
      );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    concert?.voting_open,
    concert?.voting_ends_at,
]);

  /*
   * Cierre automático de la votación.
   */
  useEffect(() => {
    if (
      !concert?.voting_open ||
      !concert.voting_ends_at
    ) {
      closeRequestSent.current = false;
      return;
    }

    closeRequestSent.current = false;

    const endTime = new Date(
      concert.voting_ends_at
    ).getTime();

    const remainingMilliseconds =
      Math.max(
        0,
        endTime - Date.now()
      );

    const timeoutId = window.setTimeout(
      async () => {
        if (closeRequestSent.current) {
          return;
        }

        closeRequestSent.current = true;

        try {
          const response =
            await api.post<ConcertStatus>(
              "/concert/voting/close"
            );

          setConcert(response.data);

          await loadGlobalResults();
        } catch (error) {
          console.error(
            "Error cerrando la votación automáticamente:",
            error
          );

          closeRequestSent.current = false;
        }
      },
      remainingMilliseconds
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    concert?.voting_open,
    concert?.voting_ends_at,
    loadGlobalResults,
  ]);

  /*
   * Contador visual del patrocinador.
   */
  useEffect(() => {
    if (
      concert?.state !== "SPONSOR" ||
      sponsorTimeLeft <= 0
    ) {
      return;
    }

    const timeoutId =
      window.setTimeout(() => {
        setSponsorTimeLeft(
          (previous) =>
            Math.max(0, previous - 1)
        );
      }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    concert?.state,
    sponsorTimeLeft,
  ]);

  /*
   * Canción que está sonando actualmente.
   */
  const currentSong = useMemo(() => {
    if (!concert?.current_song_id) {
      return null;
    }

    return (
      songs.find(
        (song) =>
          song.id ===
          concert.current_song_id
      ) ?? null
    );
  }, [
    songs,
    concert?.current_song_id,
  ]);

  /*
   * Canción seleccionada por el operador.
   */
  const selectedSong = useMemo(() => {
    if (!selectedSongId) {
      return null;
    }

    return (
      songs.find(
        (song) =>
          song.id === selectedSongId
      ) ?? null
    );
  }, [
    songs,
    selectedSongId,
  ]);

  /*
   * Canción con mayor cantidad
   * de respuestas.
   */
  const mostAnsweredSong =
    useMemo(() => {
      if (
        !globalResults?.songs.length
      ) {
        return null;
      }

      const sortedSongs = [
        ...globalResults.songs,
      ].sort(
        (firstSong, secondSong) =>
          secondSong.response_count -
          firstSong.response_count
      );

      return sortedSongs[0] ?? null;
    }, [globalResults]);

  /*
   * Ejecuta cualquier acción del concierto.
   */
  const runAction = async (
    action: () => Promise<{
      data: ConcertStatus;
    }>
  ) => {
    setIsUpdating(true);
    setErrorMessage("");

    try {
      const response = await action();

      setConcert(response.data);
    } catch (error) {
      console.error(
        "Error ejecutando acción:",
        error
      );

      setErrorMessage(
        "La acción no pudo completarse. Revisa el backend e inténtalo nuevamente."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartSong = async () => {
    if (!selectedSongId) {
      setErrorMessage(
        "Selecciona una canción antes de continuar."
      );
      return;
    }

    await runAction(() =>
      api.post<ConcertStatus>(
        `/concert/songs/${selectedSongId}/start`
      )
    );

    setSelectedSongId(null);
    setSponsorTimeLeft(0);
  };

  const handleOpenVoting =
    async () => {
      await runAction(() =>
        api.post<ConcertStatus>(
          "/concert/voting/open"
        )
      );
    };

  const handleCloseVoting =
    async () => {
      closeRequestSent.current = true;

      await runAction(() =>
        api.post<ConcertStatus>(
          "/concert/voting/close"
        )
      );

      await loadGlobalResults();
    };

  const handleShowSponsor =
    async () => {
      await runAction(() =>
        api.post<ConcertStatus>(
          "/concert/sponsor",
          {
            sponsor_name:
              sponsorName.trim() ||
              "Patrocinador Sensus",
          }
        )
      );

      setSponsorTimeLeft(
        SPONSOR_DURATION_SECONDS
      );

      await loadGlobalResults();
    };

  const handleWaitingStart =
    async () => {
      await runAction(() =>
        api.post<ConcertStatus>(
          "/concert/waiting-start"
        )
      );

      setSponsorTimeLeft(0);
    };

  const handleFinishConcert =
    async () => {
      const confirmed =
        window.confirm(
          "¿Seguro que deseas finalizar el concierto? Los usuarios verán inmediatamente la pantalla de resultados."
        );

      if (!confirmed) {
        return;
      }

      await runAction(() =>
        api.post<ConcertStatus>(
          "/concert/finish"
        )
      );

      await loadGlobalResults();
    };

  const handleRestartConcert =
    async () => {
      const confirmed =
        window.confirm(
          "¿Deseas regresar el concierto al estado inicial?"
        );

      if (!confirmed) {
        return;
      }

      await handleWaitingStart();
    };

  if (isLoading) {
    return (
      <AppShell
        eyebrow="Control del concierto"
        title="Cargando panel"
        description="Estamos preparando la consola de producción."
      >
        <section
          className="sensus-card"
          style={styles.centerCard}
        >
          <p style={styles.secondaryText}>
            Consultando canciones y estado
            del concierto...
          </p>
        </section>
      </AppShell>
    );
  }

  if (!concert) {
    return (
      <AppShell
        eyebrow="Control del concierto"
        title="Panel no disponible"
        description="No se pudo recuperar el estado actual."
      >
        <section
          className="sensus-card"
          style={styles.centerCard}
        >
          <p style={styles.errorBox}>
            {errorMessage ||
              "No encontramos información del concierto."}
          </p>

          <button
            type="button"
            className="sensus-button-primary"
            onClick={loadInitialData}
          >
            Intentar nuevamente
          </button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Control del concierto"
      title="Consola de producción"
      description="Controla el flujo completo de la experiencia Sensus."
    >
      <div style={styles.layout}>
        {/* ESTADÍSTICAS */}
        <section
          className="sensus-card"
          style={styles.statisticsCard}
        >
          <div style={styles.sectionHeader}>
            <div>
              <p className="sensus-eyebrow">
                Actividad del público
              </p>

              <h2 style={styles.sectionTitle}>
                Estadísticas del concierto
              </h2>
            </div>

            <button
              type="button"
              disabled={isLoadingStats}
              onClick={loadGlobalResults}
              style={{
                ...styles.refreshStatsButton,
                cursor: isLoadingStats
                  ? "wait"
                  : "pointer",
                opacity: isLoadingStats
                  ? 0.65
                  : 1,
              }}
            >
              {isLoadingStats
                ? "Actualizando..."
                : "Actualizar"}
            </button>
          </div>

          {isLoadingStats &&
          !globalResults ? (
            <p
              style={{
                ...styles.secondaryText,
                marginTop: "24px",
              }}
            >
              Cargando estadísticas del
              público...
            </p>
          ) : statsErrorMessage &&
            !globalResults ? (
            <div style={{ marginTop: "24px" }}>
              <p style={styles.errorBox}>
                {statsErrorMessage}
              </p>
            </div>
          ) : globalResults ? (
            <>
              <div
                style={
                  styles.adminMetricsGrid
                }
              >
                <AdminMetric
                  label="Participantes"
                  value={`${globalResults.total_participants}`}
                  description="Usuarios que han respondido al menos una canción."
                />

                <AdminMetric
                  label="Respuestas registradas"
                  value={`${globalResults.total_responses}`}
                  description="Total de respuestas guardadas durante el concierto."
                />

                <AdminMetric
                  label="Promedio por participante"
                  value={`${globalResults.average_responses_per_participant}`}
                  description="Promedio de canciones respondidas por cada usuario."
                />

                <AdminMetric
                  label="Mayor participación"
                  value={
                    mostAnsweredSong &&
                    mostAnsweredSong.response_count >
                      0
                      ? mostAnsweredSong.title
                      : "Sin datos"
                  }
                  description={
                    mostAnsweredSong &&
                    mostAnsweredSong.response_count >
                      0
                      ? `${mostAnsweredSong.response_count} respuestas registradas.`
                      : "Todavía no hay respuestas registradas."
                  }
                  compact
                />
              </div>

              <div
                style={
                  styles.adminStatsFooter
                }
              >
                <span>
                  Actualización automática cada
                  5 segundos
                </span>

                <span>
                  {
                    globalResults.total_responses
                  }{" "}
                  respuestas acumuladas
                </span>
              </div>

              {statsErrorMessage && (
                <p
                  style={{
                    ...styles.errorBox,
                    marginTop: "16px",
                  }}
                >
                  {statsErrorMessage}
                </p>
              )}
            </>
          ) : null}
        </section>

        {/* ESTADO ACTUAL */}
        <section
          className="sensus-card"
          style={styles.statusCard}
        >
          <div style={styles.sectionHeader}>
            <div>
              <p className="sensus-eyebrow">
                Estado actual
              </p>

              <h2 style={styles.sectionTitle}>
                Concierto
              </h2>
            </div>

            <span
              style={styles.stateBadge(
                STATE_COLORS[concert.state]
              )}
            >
              <span
                style={styles.stateDot(
                  STATE_COLORS[concert.state]
                )}
              />

              {
                STATE_LABELS[
                  concert.state
                ]
              }
            </span>
          </div>

          <div style={styles.statusGrid}>
            <StatusItem
              label="Canción actual"
              value={
                currentSong?.title ||
                "Ninguna canción activa"
              }
            />

            <StatusItem
              label="Votación"
              value={
                concert.voting_open
                  ? "Abierta"
                  : "Cerrada"
              }
            />

            <StatusItem
              label="Tiempo restante"
              value={
                concert.voting_open
                  ? `${votingTimeLeft} segundos`
                  : "—"
              }
            />

            <StatusItem
              label="Patrocinador"
              value={
                concert.sponsor_name ||
                "—"
              }
            />
          </div>

          {concert.voting_open && (
            <div style={styles.timerPanel}>
              <span
                style={styles.timerLabel}
              >
                Votación abierta
              </span>

              <strong
                style={styles.timerValue}
              >
                00:
                {String(
                  votingTimeLeft
                ).padStart(2, "0")}
              </strong>

              <div
                style={
                  styles.progressTrack
                }
              >
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min(
                      100,
                      (votingTimeLeft /
                        30) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {concert.state ===
            "SPONSOR" && (
            <div style={styles.timerPanel}>
              <span
                style={styles.timerLabel}
              >
                Pantalla de patrocinador
              </span>

              <strong
                style={styles.timerValue}
              >
                {sponsorTimeLeft > 0
                  ? `00:${String(
                      sponsorTimeLeft
                    ).padStart(2, "0")}`
                  : "Lista para continuar"}
              </strong>

              <p style={styles.timerHint}>
                Selecciona la siguiente
                canción cuando el escenario
                esté listo.
              </p>
            </div>
          )}
        </section>

        {/* CONTROL PRINCIPAL */}
        <section
          className="sensus-card"
          style={styles.controlCard}
        >
          <p className="sensus-eyebrow">
            Próxima acción
          </p>

          <SmartControl
            concert={concert}
            songs={songs}
            selectedSongId={
              selectedSongId
            }
            selectedSong={selectedSong}
            sponsorName={sponsorName}
            sponsorTimeLeft={
              sponsorTimeLeft
            }
            isUpdating={isUpdating}
            onSongSelect={
              setSelectedSongId
            }
            onSponsorNameChange={
              setSponsorName
            }
            onStartSong={
              handleStartSong
            }
            onOpenVoting={
              handleOpenVoting
            }
            onCloseVoting={
              handleCloseVoting
            }
            onShowSponsor={
              handleShowSponsor
            }
            onFinishConcert={
              handleFinishConcert
            }
            onRestartConcert={
              handleRestartConcert
            }
          />

          {errorMessage && (
            <p style={styles.errorBox}>
              {errorMessage}
            </p>
          )}
        </section>

        {/* REPERTORIO */}
        <section
          className="sensus-card"
          style={styles.songsCard}
        >
          <div style={styles.sectionHeader}>
            <div>
              <p className="sensus-eyebrow">
                Repertorio
              </p>

              <h2 style={styles.sectionTitle}>
                Canciones disponibles
              </h2>
            </div>

            <span style={styles.songCount}>
              {songs.length} canciones
            </span>
          </div>

          <div style={styles.songList}>
            {songs.map(
              (song, index) => {
                const isCurrent =
                  song.id ===
                  concert.current_song_id;

                const isSelected =
                  song.id ===
                  selectedSongId;

                return (
                  <button
                    key={song.id}
                    type="button"
                    disabled={
                      isUpdating ||
                      concert.voting_open
                    }
                    onClick={() =>
                      setSelectedSongId(
                        song.id
                      )
                    }
                    style={styles.songRow(
                      isCurrent,
                      isSelected
                    )}
                  >
                    <span
                      style={
                        styles.songNumber
                      }
                    >
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>

                    <span
                      style={
                        styles.songInformation
                      }
                    >
                      <strong
                        style={
                          styles.songTitle
                        }
                      >
                        {song.title}
                      </strong>

                      <span
                        style={
                          styles.songDescription
                        }
                      >
                        {song.description}
                      </span>
                    </span>

                    <span
                      style={
                        styles.songStatus
                      }
                    >
                      {isCurrent
                        ? "En vivo"
                        : isSelected
                          ? "Seleccionada"
                          : "Disponible"}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* FINALIZAR CONCIERTO */}
        {concert.state !==
          "FINISHED" && (
          <section
            className="sensus-card"
            style={styles.dangerCard}
          >
            <div>
              <p className="sensus-eyebrow">
                Control del evento
              </p>

              <h2
                style={
                  styles.dangerTitle
                }
              >
                Finalizar concierto
              </h2>

              <p
                style={
                  styles.secondaryText
                }
              >
                Esta acción enviará a todos
                los asistentes a la pantalla
                final de resultados.
              </p>
            </div>

            <button
              type="button"
              disabled={isUpdating}
              onClick={
                handleFinishConcert
              }
              style={
                styles.dangerButton
              }
            >
              Finalizar concierto
            </button>
          </section>
        )}
      </div>
    </AppShell>
  );
}

type SmartControlProps = {
  concert: ConcertStatus;
  songs: Song[];
  selectedSongId: number | null;
  selectedSong: Song | null;
  sponsorName: string;
  sponsorTimeLeft: number;
  isUpdating: boolean;
  onSongSelect: (
    songId: number | null
  ) => void;
  onSponsorNameChange: (
    name: string
  ) => void;
  onStartSong: () => void;
  onOpenVoting: () => void;
  onCloseVoting: () => void;
  onShowSponsor: () => void;
  onFinishConcert: () => void;
  onRestartConcert: () => void;
};

function SmartControl({
  concert,
  songs,
  selectedSongId,
  selectedSong,
  sponsorName,
  sponsorTimeLeft,
  isUpdating,
  onSongSelect,
  onSponsorNameChange,
  onStartSong,
  onOpenVoting,
  onCloseVoting,
  onShowSponsor,
  onFinishConcert,
  onRestartConcert,
}: SmartControlProps) {
  if (
    concert.state === "FINISHED"
  ) {
    return (
      <div style={styles.smartContent}>
        <h2 style={styles.actionTitle}>
          El concierto ha finalizado
        </h2>

        <p style={styles.secondaryText}>
          Todos los usuarios están viendo
          la pantalla final. Puedes
          reiniciar el estado cuando quieras
          preparar una nueva ejecución.
        </p>

        <button
          type="button"
          className="sensus-button-primary"
          disabled={isUpdating}
          onClick={onRestartConcert}
        >
          {isUpdating
            ? "Actualizando..."
            : "Preparar nuevo concierto"}
        </button>
      </div>
    );
  }

  if (
    concert.state ===
      "WAITING_START" ||
    concert.state === "SPONSOR"
  ) {
    const isSponsor =
      concert.state === "SPONSOR";

    return (
      <div style={styles.smartContent}>
        <h2 style={styles.actionTitle}>
          {isSponsor
            ? sponsorTimeLeft > 0
              ? "Patrocinador en pantalla"
              : "Selecciona la siguiente canción"
            : "Selecciona la primera canción"}
        </h2>

        <p style={styles.secondaryText}>
          {isSponsor
            ? "Cuando el escenario esté listo, selecciona la siguiente pieza y comienza."
            : "Selecciona la canción con la que iniciará la experiencia."}
        </p>

        <select
          value={selectedSongId ?? ""}
          disabled={isUpdating}
          onChange={(event) => {
            const value =
              event.target.value;

            onSongSelect(
              value
                ? Number(value)
                : null
            );
          }}
          style={styles.select}
        >
          <option value="">
            Selecciona una canción
          </option>

          {songs.map((song) => (
            <option
              key={song.id}
              value={song.id}
            >
              {song.title}
            </option>
          ))}
        </select>

        {selectedSong && (
          <div
            style={
              styles.selectionPreview
            }
          >
            <span
              style={
                styles.selectionLabel
              }
            >
              Próxima canción
            </span>

            <strong
              style={
                styles.selectionTitle
              }
            >
              {selectedSong.title}
            </strong>
          </div>
        )}

        <button
          type="button"
          className="sensus-button-primary"
          disabled={
            !selectedSongId ||
            isUpdating ||
            (isSponsor &&
              sponsorTimeLeft > 0)
          }
          onClick={onStartSong}
          style={{
            cursor:
              !selectedSongId ||
              isUpdating ||
              (isSponsor &&
                sponsorTimeLeft > 0)
                ? "not-allowed"
                : "pointer",
            opacity:
              !selectedSongId ||
              (isSponsor &&
                sponsorTimeLeft > 0)
                ? 0.55
                : 1,
          }}
        >
          {isUpdating
            ? "Iniciando..."
            : isSponsor
              ? "Iniciar siguiente canción"
              : "Iniciar concierto"}
        </button>
      </div>
    );
  }

  if (
    concert.state ===
      "SONG_ACTIVE" &&
    concert.voting_open
  ) {
    return (
      <div style={styles.smartContent}>
        <h2 style={styles.actionTitle}>
          La votación está abierta
        </h2>

        <p style={styles.secondaryText}>
          La votación se cerrará
          automáticamente cuando el contador
          llegue a cero.
        </p>

        <button
          type="button"
          disabled={isUpdating}
          onClick={onCloseVoting}
          style={styles.secondaryButton}
        >
          {isUpdating
            ? "Cerrando..."
            : "Cerrar votación ahora"}
        </button>
      </div>
    );
  }

  if (
    concert.state ===
      "SONG_ACTIVE" &&
    !concert.voting_open &&
    !concert.voting_ends_at
  ) {
    return (
      <div style={styles.smartContent}>
        <h2 style={styles.actionTitle}>
          Canción en reproducción
        </h2>

        <p style={styles.secondaryText}>
          Abre la votación cuando falten 15
          segundos para que termine la pieza.
        </p>

        <button
          type="button"
          className="sensus-button-primary"
          disabled={isUpdating}
          onClick={onOpenVoting}
        >
          {isUpdating
            ? "Abriendo..."
            : "Abrir votación de 30 segundos"}
        </button>

        <div style={styles.divider} />

        <label style={styles.inputLabel}>
          Patrocinador posterior
        </label>

        <input
          type="text"
          value={sponsorName}
          disabled={isUpdating}
          onChange={(event) =>
            onSponsorNameChange(
              event.target.value
            )
          }
          placeholder="Nombre del patrocinador"
          style={styles.input}
        />

        <button
          type="button"
          disabled={isUpdating}
          onClick={onShowSponsor}
          style={styles.secondaryButton}
        >
          Saltar directamente al patrocinador
        </button>
        <div style={styles.divider} />

          <label style={styles.inputLabel}>
            Siguiente canción
          </label>

          <select
            value={selectedSongId ?? ""}
            disabled={isUpdating}
            onChange={(event) => {
              const value = event.target.value;

              onSongSelect(
                value ? Number(value) : null
              );
            }}
            style={styles.select}
          >
            <option value="">
              Selecciona la siguiente canción
            </option>

            {songs.map((song) => (
              <option
                key={song.id}
                value={song.id}
                disabled={
                  song.id === concert.current_song_id
                }
              >
                {song.title}
              </option>
            ))}
          </select>

          {selectedSong && (
            <div style={styles.selectionPreview}>
              <span style={styles.selectionLabel}>
                Próxima canción
              </span>

              <strong style={styles.selectionTitle}>
                {selectedSong.title}
              </strong>
            </div>
          )}

          <button
            type="button"
            className="sensus-button-primary"
            disabled={
              !selectedSongId ||
              isUpdating
            }
            onClick={onStartSong}
            style={{
              cursor:
                !selectedSongId || isUpdating
                  ? "not-allowed"
                  : "pointer",
              opacity:
                !selectedSongId || isUpdating
                  ? 0.55
                  : 1,
            }}
          >
            {isUpdating
              ? "Iniciando..."
              : "Iniciar siguiente canción"}
          </button>
      </div>
    );
  }

  return (
    <div style={styles.smartContent}>
      <h2 style={styles.actionTitle}>
        Continuar experiencia
      </h2>

      <p style={styles.secondaryText}>
        Muestra el patrocinador antes de
        comenzar la siguiente canción.
      </p>

      <input
        type="text"
        value={sponsorName}
        onChange={(event) =>
          onSponsorNameChange(
            event.target.value
          )
        }
        placeholder="Nombre del patrocinador"
        style={styles.input}
      />

      <button
        type="button"
        className="sensus-button-primary"
        disabled={isUpdating}
        onClick={onShowSponsor}
      >
        Mostrar patrocinador
      </button>

      <button
        type="button"
        disabled={isUpdating}
        onClick={onFinishConcert}
        style={styles.secondaryButton}
      >
        Finalizar concierto
      </button>
    </div>
  );
}

function StatusItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.statusItem}>
      <span
        style={
          styles.statusItemLabel
        }
      >
        {label}
      </span>

      <strong
        style={
          styles.statusItemValue
        }
      >
        {value}
      </strong>
    </div>
  );
}

function AdminMetric({
  label,
  value,
  description,
  compact = false,
}: {
  label: string;
  value: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      style={
        styles.adminMetricCard
      }
    >
      <span
        style={
          styles.adminMetricLabel
        }
      >
        {label}
      </span>

      <strong
        style={{
          ...styles.adminMetricValue,
          fontSize: compact
            ? "clamp(18px, 3vw, 25px)"
            : "clamp(30px, 5vw, 42px)",
        }}
      >
        {value}
      </strong>

      <p
        style={
          styles.adminMetricDescription
        }
      >
        {description}
      </p>
    </div>
  );
}

const styles = {
  layout: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  } as React.CSSProperties,

  centerCard: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "44px",
    textAlign: "center",
  } as React.CSSProperties,

  statisticsCard: {
    width: "100%",
    padding: "clamp(24px, 5vw, 38px)",
    borderColor:
      "rgba(201, 150, 36, 0.24)",
  } as React.CSSProperties,

  statusCard: {
    padding: "clamp(24px, 5vw, 38px)",
  } as React.CSSProperties,

  controlCard: {
    padding: "clamp(24px, 5vw, 38px)",
    borderColor:
      "rgba(201, 150, 36, 0.28)",
  } as React.CSSProperties,

  songsCard: {
    padding: "clamp(22px, 5vw, 34px)",
  } as React.CSSProperties,

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "14px",
  } as React.CSSProperties,

  sectionTitle: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize:
      "clamp(24px, 4vw, 34px)",
    letterSpacing: "-0.035em",
  } as React.CSSProperties,

  adminMetricsGrid: {
    marginTop: "28px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
  } as React.CSSProperties,

  adminMetricCard: {
    minHeight: "150px",
    padding: "20px",
    border:
      "1px solid var(--border)",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "var(--surface)",
  } as React.CSSProperties,

  adminMetricLabel: {
    display: "block",
    color: "var(--gold-light)",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.09em",
    textTransform: "uppercase",
  } as React.CSSProperties,

  adminMetricValue: {
    display: "block",
    marginTop: "13px",
    overflowWrap: "anywhere",
    color: "#ffffff",
    lineHeight: 1.05,
    letterSpacing: "-0.035em",
  } as React.CSSProperties,

  adminMetricDescription: {
    margin: "14px 0 0",
    color: "var(--text-muted)",
    fontSize: "12px",
    lineHeight: 1.55,
  } as React.CSSProperties,

  refreshStatsButton: {
    minHeight: "42px",
    padding: "0 15px",
    border:
      "1px solid var(--border-light)",
    borderRadius: "10px",
    color: "#ffffff",
    background: "var(--surface)",
    fontSize: "13px",
    fontWeight: 700,
  } as React.CSSProperties,

  adminStatsFooter: {
    marginTop: "18px",
    paddingTop: "16px",
    borderTop:
      "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    color: "var(--text-muted)",
    fontSize: "11px",
  } as React.CSSProperties,

  stateBadge: (
    stateColor: string
  ): React.CSSProperties => ({
    padding: "8px 12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border:
      `1px solid ${stateColor}55`,
    borderRadius: "999px",
    color: stateColor,
    background: `${stateColor}16`,
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  }),

  stateDot: (
    stateColor: string
  ): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: stateColor,
    boxShadow:
      `0 0 14px ${stateColor}`,
  }),

  statusGrid: {
    marginTop: "28px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  } as React.CSSProperties,

  statusItem: {
    padding: "16px",
    border:
      "1px solid var(--border)",
    borderRadius: "12px",
    background: "var(--surface)",
  } as React.CSSProperties,

  statusItemLabel: {
    display: "block",
    marginBottom: "6px",
    color: "var(--text-muted)",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  } as React.CSSProperties,

  statusItemValue: {
    color: "var(--text-primary)",
    fontSize: "15px",
  } as React.CSSProperties,

  timerPanel: {
    marginTop: "20px",
    padding: "20px",
    border:
      "1px solid rgba(201, 150, 36, 0.25)",
    borderRadius: "14px",
    textAlign: "center",
    background: "var(--gold-soft)",
  } as React.CSSProperties,

  timerLabel: {
    display: "block",
    color: "var(--gold-light)",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  } as React.CSSProperties,

  timerValue: {
    display: "block",
    marginTop: "8px",
    color: "#ffffff",
    fontSize:
      "clamp(38px, 8vw, 64px)",
    fontVariantNumeric:
      "tabular-nums",
  } as React.CSSProperties,

  timerHint: {
    margin: "8px 0 0",
    color: "var(--text-secondary)",
    fontSize: "13px",
  } as React.CSSProperties,

  progressTrack: {
    maxWidth: "420px",
    height: "6px",
    margin: "18px auto 0",
    borderRadius: "99px",
    overflow: "hidden",
    background:
      "rgba(255, 255, 255, 0.12)",
  } as React.CSSProperties,

  progressFill: {
    height: "100%",
    borderRadius: "99px",
    background:
      "linear-gradient(90deg, var(--gold), var(--gold-light))",
    transition:
      "width 250ms linear",
  } as React.CSSProperties,

  smartContent: {
    marginTop: "14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "16px",
  } as React.CSSProperties,

  actionTitle: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize:
      "clamp(24px, 4vw, 34px)",
    letterSpacing: "-0.035em",
  } as React.CSSProperties,

  secondaryText: {
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: "15px",
    lineHeight: 1.7,
  } as React.CSSProperties,

  select: {
    width: "100%",
    minHeight: "48px",
    padding: "0 14px",
    border:
      "1px solid var(--border-light)",
    borderRadius: "10px",
    color: "#ffffff",
    background: "#111113",
    fontSize: "15px",
    outline: "none",
  } as React.CSSProperties,

  inputLabel: {
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: 700,
  } as React.CSSProperties,

  input: {
    width: "100%",
    minHeight: "48px",
    padding: "0 14px",
    border:
      "1px solid var(--border-light)",
    borderRadius: "10px",
    color: "#ffffff",
    background: "#111113",
    fontSize: "15px",
    outline: "none",
  } as React.CSSProperties,

  selectionPreview: {
    width: "100%",
    padding: "15px",
    border:
      "1px solid rgba(201, 150, 36, 0.24)",
    borderRadius: "12px",
    background: "var(--gold-soft)",
  } as React.CSSProperties,

  selectionLabel: {
    display: "block",
    marginBottom: "5px",
    color: "var(--gold-light)",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  } as React.CSSProperties,

  selectionTitle: {
    color: "#ffffff",
    fontSize: "17px",
  } as React.CSSProperties,

  secondaryButton: {
    minHeight: "44px",
    padding: "0 18px",
    border:
      "1px solid var(--border-light)",
    borderRadius: "10px",
    color: "#ffffff",
    background: "transparent",
    fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties,

  divider: {
    width: "100%",
    height: "1px",
    margin: "4px 0",
    background: "var(--border)",
  } as React.CSSProperties,

  songCount: {
    padding: "7px 11px",
    border:
      "1px solid var(--border)",
    borderRadius: "999px",
    color: "var(--text-muted)",
    fontSize: "12px",
    fontWeight: 700,
  } as React.CSSProperties,

  songList: {
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  } as React.CSSProperties,

  songRow: (
    isCurrent: boolean,
    isSelected: boolean
  ): React.CSSProperties => ({
    width: "100%",
    padding: "16px",
    border: isCurrent
      ? "1px solid var(--success)"
      : isSelected
        ? "1px solid var(--gold-light)"
        : "1px solid var(--border)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
    color: "#ffffff",
    background: isCurrent
      ? "rgba(16, 185, 129, 0.08)"
      : isSelected
        ? "var(--gold-soft)"
        : "var(--surface)",
    cursor: "pointer",
  }),

  songNumber: {
    minWidth: "34px",
    color: "var(--gold-light)",
    fontSize: "12px",
    fontWeight: 800,
  } as React.CSSProperties,

  songInformation: {
    minWidth: 0,
    flex: 1,
  } as React.CSSProperties,

  songTitle: {
    display: "block",
    fontSize: "15px",
  } as React.CSSProperties,

  songDescription: {
    display: "block",
    marginTop: "5px",
    overflow: "hidden",
    color: "var(--text-muted)",
    fontSize: "12px",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as React.CSSProperties,

  songStatus: {
    color: "var(--text-muted)",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
  } as React.CSSProperties,

  dangerCard: {
    padding: "24px",
    borderColor:
      "rgba(248, 113, 113, 0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
  } as React.CSSProperties,

  dangerTitle: {
    margin: "0 0 7px",
    color: "#ffffff",
    fontSize: "22px",
  } as React.CSSProperties,

  dangerButton: {
    minHeight: "44px",
    padding: "0 18px",
    border:
      "1px solid rgba(248, 113, 113, 0.45)",
    borderRadius: "10px",
    color: "#fca5a5",
    background:
      "rgba(248, 113, 113, 0.1)",
    fontWeight: 800,
    cursor: "pointer",
  } as React.CSSProperties,

  errorBox: {
    width: "100%",
    margin: "4px 0 0",
    padding: "13px 15px",
    border:
      "1px solid rgba(248, 113, 113, 0.35)",
    borderRadius: "10px",
    color: "#fca5a5",
    background:
      "rgba(248, 113, 113, 0.1)",
    fontSize: "14px",
    lineHeight: 1.55,
  } as React.CSSProperties,
};

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminContent />
    </ProtectedRoute>
  );
}