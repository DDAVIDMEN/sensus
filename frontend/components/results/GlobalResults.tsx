"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "@/services/api";
import {
  GlobalResultsResponse,
  GlobalSongResult,
} from "@/types";

const CATEGORY_LABELS: Record<
  string,
  string
> = {
  COGNITIVE_ACTIVATION:
    "Activación cognitiva",
  EMOTIONAL_RESONANCE:
    "Resonancia emocional",
  BODY_RESPONSE:
    "Respuesta corporal",
  STATE_OF_CONSCIOUSNESS:
    "Estado de conciencia",
};

export default function GlobalResults() {
  const [results, setResults] =
    useState<GlobalResultsResponse | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadGlobalResults =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response =
          await api.get<GlobalResultsResponse>(
            "/results/global"
          );

        setResults(response.data);
      } catch (error) {
        console.error(
          "Error cargando resultados globales:",
          error
        );

        setErrorMessage(
          "No fue posible cargar los resultados del público."
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    loadGlobalResults();
  }, [loadGlobalResults]);

  const mostAnsweredSong = useMemo(() => {
    if (!results?.songs.length) {
      return null;
    }

    return [...results.songs].sort(
      (first, second) =>
        second.response_count
        - first.response_count
    )[0];
  }, [results]);

  if (isLoading) {
    return (
      <GlobalStatusCard
        title="Preparando resultados"
        description="Estamos reuniendo las respuestas del público."
      />
    );
  }

  if (errorMessage || !results) {
    return (
      <section
        className="sensus-card"
        style={styles.mainCard}
      >
        <p style={styles.errorBox}>
          {errorMessage ||
            "No encontramos resultados globales."}
        </p>

        <button
          type="button"
          className="sensus-button-primary"
          onClick={loadGlobalResults}
          style={{ cursor: "pointer" }}
        >
          Intentar nuevamente
        </button>
      </section>
    );
  }

  return (
    <div style={styles.wrapper}>
      <section
        className="sensus-card"
        style={styles.mainCard}
      >
        <p className="sensus-eyebrow">
          Experiencia colectiva
        </p>

        <h2 style={styles.title}>
          Resultados del público
        </h2>

        <p style={styles.description}>
          Descubre cómo vivieron los asistentes
          las distintas piezas y cuáles fueron las
          respuestas predominantes.
        </p>

        <div style={styles.metricsGrid}>
          <MetricCard
            label="Participantes"
            value={`${results.total_participants}`}
          />

          <MetricCard
             label="Respuestas registradas"
             value={`${results.total_responses}`}
           />

        </div>

        {mostAnsweredSong &&
          mostAnsweredSong.response_count > 0 && (
            <div style={styles.highlightBox}>
              <span style={styles.highlightLabel}>
                Mayor participación
              </span>

              <strong
                style={styles.highlightTitle}
              >
                {mostAnsweredSong.title}
              </strong>

              <span style={styles.highlightText}>
                {
                  mostAnsweredSong.response_count
                }{" "}
                respuestas registradas
              </span>
            </div>
          )}
      </section>

      <section
        className="sensus-card"
        style={styles.songsCard}
      >
        <div style={styles.sectionHeading}>
          <div>
            <p className="sensus-eyebrow">
              Resultados por pieza
            </p>

            <h2 style={styles.sectionTitle}>
              Recorrido colectivo
            </h2>
          </div>

          <button
            type="button"
            onClick={loadGlobalResults}
            style={styles.refreshButton}
          >
            Actualizar
          </button>
        </div>

        {results.total_responses === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>
              Todavía no hay respuestas
            </h3>

            <p style={styles.emptyText}>
              Las estadísticas aparecerán cuando
              los asistentes comiencen a participar.
            </p>
          </div>
        ) : (
          <div style={styles.songList}>
            {results.songs.map((song) => (
              <SongResultCard
                key={song.song_id}
                song={song}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SongResultCard({
  song,
}: {
  song: GlobalSongResult;
}) {
  const categoryLabel =
    song.analysis_category
      ? CATEGORY_LABELS[
          song.analysis_category
        ] || song.analysis_category
      : "Sin categoría";

  return (
    <article style={styles.songCard}>
      <div style={styles.songHeader}>
        <div style={{ minWidth: 0 }}>
          <span style={styles.songOrder}>
            Canción{" "}
            {song.display_order ?? "—"}
          </span>

          <h3 style={styles.songTitle}>
            {song.title}
          </h3>

          <span style={styles.categoryLabel}>
            {categoryLabel}
          </span>
        </div>

        <div style={styles.responseBadge}>
          {song.response_count} respuestas
        </div>
      </div>

      {song.response_count === 0 ? (
        <p style={styles.noResponses}>
          Todavía no hay respuestas para esta
          pieza.
        </p>
      ) : (
        <>
          <div style={styles.topOptionBox}>
            <span style={styles.topOptionLabel}>
              Opción predominante
            </span>

            <strong
              style={styles.topOptionValue}
            >
              {song.top_option || "Sin datos"}
            </strong>
          </div>

          <div style={styles.optionsList}>
            {song.options.map((option) => (
              <div key={option.option}>
                <div style={styles.optionHeader}>
                  <span style={styles.optionName}>
                    {option.option}
                  </span>

                  <strong
                    style={
                      styles.optionPercentage
                    }
                  >
                    {option.percentage}%
                  </strong>
                </div>

                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${option.percentage}%`,
                    }}
                  />
                </div>

                <span style={styles.optionCount}>
                  {option.count}{" "}
                  {option.count === 1
                    ? "respuesta"
                    : "respuestas"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </article>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.metricCard}>
      <span style={styles.metricLabel}>
        {label}
      </span>

      <strong style={styles.metricValue}>
        {value}
      </strong>
    </div>
  );
}

function GlobalStatusCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section
      className="sensus-card"
      style={{
        ...styles.mainCard,
        textAlign: "center",
      }}
    >
      <div style={styles.spinner} />

      <h2
        style={{
          ...styles.sectionTitle,
          marginTop: "18px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          ...styles.description,
          margin: "10px auto 0",
        }}
      >
        {description}
      </p>

      <style jsx>{`
        @keyframes global-results-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    maxWidth: "920px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  } as React.CSSProperties,

  mainCard: {
    width: "100%",
    padding: "clamp(28px, 6vw, 52px)",
  } as React.CSSProperties,

  title: {
    maxWidth: "680px",
    margin: "0 0 16px",
    color: "var(--text-primary)",
    fontSize: "clamp(31px, 5vw, 46px)",
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
  } as React.CSSProperties,

  description: {
    maxWidth: "680px",
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: "16px",
    lineHeight: 1.75,
  } as React.CSSProperties,

  metricsGrid: {
    marginTop: "30px",
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(260px, 1fr))",
    gap: "12px",
  } as React.CSSProperties,

  metricCard: {
    minHeight: "108px",
    padding: "18px",
    border: "1px solid var(--border)",
    borderRadius: "13px",
    background: "var(--surface)",
  } as React.CSSProperties,

  metricLabel: {
    display: "block",
    color: "var(--text-muted)",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } as React.CSSProperties,

  metricValue: {
    display: "block",
    marginTop: "11px",
    color: "#ffffff",
    fontSize: "28px",
  } as React.CSSProperties,

  highlightBox: {
    marginTop: "22px",
    padding: "18px",
    border: "1px solid rgba(201, 150, 36, 0.28)",
    borderRadius: "13px",
    background: "var(--gold-soft)",
  } as React.CSSProperties,

  highlightLabel: {
    display: "block",
    color: "var(--gold-light)",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } as React.CSSProperties,

  highlightTitle: {
    display: "block",
    marginTop: "7px",
    color: "#ffffff",
    fontSize: "20px",
  } as React.CSSProperties,

  highlightText: {
    display: "block",
    marginTop: "5px",
    color: "var(--text-secondary)",
    fontSize: "13px",
  } as React.CSSProperties,

  songsCard: {
    width: "100%",
    padding: "clamp(24px, 5vw, 40px)",
  } as React.CSSProperties,

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "15px",
  } as React.CSSProperties,

  sectionTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(26px, 4vw, 36px)",
    letterSpacing: "-0.035em",
  } as React.CSSProperties,

  refreshButton: {
    minHeight: "42px",
    padding: "0 15px",
    border: "1px solid var(--border-light)",
    borderRadius: "10px",
    color: "#ffffff",
    background: "var(--surface)",
    fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties,

  songList: {
    marginTop: "26px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  } as React.CSSProperties,

  songCard: {
    padding: "20px",
    border: "1px solid var(--border)",
    borderRadius: "15px",
    background: "var(--surface)",
  } as React.CSSProperties,

  songHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "14px",
  } as React.CSSProperties,

  songOrder: {
    color: "var(--gold-light)",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.09em",
    textTransform: "uppercase",
  } as React.CSSProperties,

  songTitle: {
    margin: "6px 0",
    color: "#ffffff",
    fontSize: "20px",
  } as React.CSSProperties,

  categoryLabel: {
    color: "var(--text-muted)",
    fontSize: "12px",
  } as React.CSSProperties,

  responseBadge: {
    padding: "7px 10px",
    border: "1px solid var(--border)",
    borderRadius: "999px",
    color: "var(--text-secondary)",
    fontSize: "11px",
    fontWeight: 700,
  } as React.CSSProperties,

  topOptionBox: {
    marginTop: "18px",
    padding: "14px",
    border: "1px solid rgba(201, 150, 36, 0.22)",
    borderRadius: "11px",
    background: "var(--gold-soft)",
  } as React.CSSProperties,

  topOptionLabel: {
    display: "block",
    color: "var(--gold-light)",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } as React.CSSProperties,

  topOptionValue: {
    display: "block",
    marginTop: "6px",
    color: "#ffffff",
    fontSize: "17px",
  } as React.CSSProperties,

  optionsList: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  } as React.CSSProperties,

  optionHeader: {
    marginBottom: "7px",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
  } as React.CSSProperties,

  optionName: {
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontWeight: 700,
  } as React.CSSProperties,

  optionPercentage: {
    color: "#ffffff",
    fontSize: "14px",
  } as React.CSSProperties,

  progressTrack: {
    height: "7px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "var(--border)",
  } as React.CSSProperties,

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, var(--accent), var(--gold-light))",
  } as React.CSSProperties,

  optionCount: {
    display: "block",
    marginTop: "6px",
    color: "var(--text-muted)",
    fontSize: "11px",
  } as React.CSSProperties,

  noResponses: {
    margin: "18px 0 0",
    color: "var(--text-muted)",
    fontSize: "13px",
  } as React.CSSProperties,

  emptyState: {
    marginTop: "25px",
    padding: "34px",
    border: "1px dashed var(--border-light)",
    borderRadius: "14px",
    textAlign: "center",
  } as React.CSSProperties,

  emptyTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "22px",
  } as React.CSSProperties,

  emptyText: {
    maxWidth: "520px",
    margin: "10px auto 0",
    color: "var(--text-muted)",
    fontSize: "14px",
    lineHeight: 1.65,
  } as React.CSSProperties,

  errorBox: {
    margin: "0 0 20px",
    padding: "13px 15px",
    border:
      "1px solid rgba(248, 113, 113, 0.35)",
    borderRadius: "10px",
    color: "var(--danger)",
    background:
      "rgba(248, 113, 113, 0.1)",
    fontSize: "14px",
  } as React.CSSProperties,

  spinner: {
    width: "42px",
    height: "42px",
    margin: "0 auto",
    border: "3px solid var(--border)",
    borderTopColor: "var(--gold-light)",
    borderRadius: "50%",
    animation:
      "global-results-spin 0.8s linear infinite",
  } as React.CSSProperties,
};