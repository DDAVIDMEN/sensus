"use client";

import { useState } from "react";
import PrototypeShell from "@/components/PrototypeShell";

const emotions = [
  {
    name: "Intimidad",
    description: "Sentimiento de cercanía, conexión y apertura emocional.",
  },
  {
    name: "Deseo",
    description: "Atracción, anhelo o impulso hacia otra persona.",
  },
  {
    name: "Vulnerabilidad",
    description: "Sensación de exponerse emocionalmente y mostrarse auténtico.",
  },
  {
    name: "Plenitud",
    description: "Estado de satisfacción, bienestar y realización.",
  },
];

export default function SongPrototypePage() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  return (
    <PrototypeShell currentPage="song">
      <div className="prototype-screen">
        <div className="prototype-main-content">
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "24px",
            }}
          >
            <div>
              <span className="prototype-live-badge">
                <span className="prototype-live-dot" />
                En vivo
              </span>

              <p
                style={{
                  margin: "30px 0 8px",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Canción IV
              </p>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(44px, 8vw, 78px)",
                  letterSpacing: "-0.055em",
                  lineHeight: 1,
                }}
              >
                Desnudez
              </h1>

              <p
                style={{
                  maxWidth: "670px",
                  margin: "24px 0 0",
                  color: "var(--text-secondary)",
                  fontSize: "17px",
                  lineHeight: 1.75,
                }}
              >
                Una pieza íntima y sensual que explora el deseo erótico y la natural necesidad humana de placer. 
                A través de su atmósfera sonora, la canción captura la vulnerabilidad y la intensidad del encuentro 
                sexual en su estado más puro.
              </p>
            </div>

            <section
              className="sensus-card"
              style={{
                padding: "clamp(24px, 5vw, 42px)",
                marginTop: "12px",
                borderColor: "rgba(215, 227, 255, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                  marginBottom: "28px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "var(--accent)",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Momento de responder
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "clamp(25px, 4vw, 36px)",
                      letterSpacing: "-0.035em",
                    }}
                  >
                    Esta canción me hace sentir:
                  </h2>
                </div>

                <div
                  style={{
                    minWidth: "84px",
                    padding: "10px 13px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "12px",
                    textAlign: "center",
                    background: "var(--surface)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      color: "var(--text-muted)",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Tiempo
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "3px",
                      color: "var(--text-primary)",
                      fontSize: "21px",
                    }}
                  >
                    00:12
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "12px",
                }}
              >
                {emotions.map((emotion) => {
                  const selected = selectedEmotion === emotion.name;

                  return (
                    <label
                      key={emotion.name}
                      style={{
                        minHeight: "108px",
                        padding: "17px",
                        border: selected
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        background: selected
                          ? "rgba(215, 227, 255, 0.09)"
                          : "var(--surface)",
                        cursor: "pointer",
                        transition: "all 160ms ease",
                      }}
                    >
                      <input
                        type="radio"
                        name="prototype-emotion"
                        checked={selected}
                        onChange={() => setSelectedEmotion(emotion.name)}
                        style={{
                          marginTop: "4px",
                          accentColor: "#d7e3ff",
                        }}
                      />

                      <span>
                        <strong
                          style={{
                            display: "block",
                            color: selected
                              ? "var(--accent)"
                              : "var(--text-primary)",
                            fontSize: "16px",
                          }}
                        >
                          {emotion.name}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: "6px",
                            color: "var(--text-muted)",
                            fontSize: "12px",
                            lineHeight: 1.5,
                          }}
                        >
                          {emotion.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <p
                style={{
                  margin: "22px 0 0",
                  color: selectedEmotion
                    ? "var(--success)"
                    : "var(--text-muted)",
                  fontSize: "13px",
                }}
              >
                {selectedEmotion
                  ? `Tu respuesta “${selectedEmotion}” ha sido seleccionada.`
                  : "Selecciona una opción antes de que termine el tiempo."}
              </p>
            </section>
          </section>
        </div>

        <SponsorsFooterPreview />
      </div>
    </PrototypeShell>
  );
}

function SponsorsFooterPreview() {
  return (
    <footer className="prototype-sponsors-footer">
      <div className="sensus-container prototype-sponsors-footer-content">
        <span className="prototype-sponsors-label">Con el apoyo de</span>
        <div className="prototype-sponsor-placeholder">Patrocinador 1</div>
        <div className="prototype-sponsor-placeholder">Patrocinador 2</div>
        <div className="prototype-sponsor-placeholder">Patrocinador 3</div>
        <div className="prototype-sponsor-placeholder">Patrocinador 4</div>
      </div>
    </footer>
  );
}