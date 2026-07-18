import PrototypeShell from "@/components/PrototypeShell";

const resultData = [
  {
    name: "Reflexión",
    percentage: 42,
  },
  {
    name: "Serenidad",
    percentage: 31,
  },
  {
    name: "Esperanza",
    percentage: 19,
  },
  {
    name: "Energía",
    percentage: 8,
  },
];

export default function ResultPrototypePage() {
  return (
    <PrototypeShell currentPage="result">
      <div className="prototype-screen">
        <div className="prototype-main-content">
          <div
            style={{
              marginBottom: "34px",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                color: "var(--gold-light)",
                fontSize: "15px",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Tu recorrido emocional
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(42px, 8vw, 76px)",
                letterSpacing: "-0.055em",
                lineHeight: 1,
              }}
            >
              El concierto resonó en ti de forma reflexiva.
            </h1>

            <p
              style={{
                maxWidth: "690px",
                margin: "24px 0 0",
                color: "var(--text-secondary)",
                fontSize: "17px",
                lineHeight: 1.75,
              }}
            >
              Tus respuestas muestran una conexión profunda con emociones
              relacionadas con la introspección, la calma y la memoria.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <section
              className="sensus-card"
              style={{
                padding: "34px",
                minHeight: "410px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
                borderColor: "rgba(215, 227, 255, 0.2)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                Estado predominante
              </p>

              <div
                style={{
                  width: "190px",
                  height: "190px",
                  margin: "32px auto",
                  border: "1px solid rgba(215, 227, 255, 0.25)",
                  borderRadius: "50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "radial-gradient(circle, rgba(215,227,255,0.13), transparent 66%)",
                }}
              >
                <strong
                  style={{
                    color: "var(--gold-light)",
                    fontSize: "27px",
                    letterSpacing: "0.06em",
                  }}
                >
                  REFLEXIVO
                </strong>

                <span
                  style={{
                    marginTop: "6px",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                  }}
                >
                  42% del recorrido
                </span>
              </div>

              <p
                style={{
                  maxWidth: "330px",
                  margin: "0 auto",
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  lineHeight: 1.65,
                }}
              >
                Encontraste en la música un espacio para observar, recordar y
                conectar contigo.
              </p>
            </section>

            <section
              className="sensus-card"
              style={{
                padding: "34px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "20px",
                  marginBottom: "32px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Tu experiencia
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "25px",
                    }}
                  >
                    Distribución emocional
                  </h2>
                </div>

                <div
                  style={{
                    padding: "8px 11px",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    color: "var(--text-muted)",
                    fontSize: "11px",
                  }}
                >
                  14 de 16 canciones
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {resultData.map((result) => (
                  <div key={result.name}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "20px",
                        marginBottom: "9px",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {result.name}
                      </span>

                      <strong
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "14px",
                        }}
                      >
                        {result.percentage}%
                      </strong>
                    </div>

                    <div
                      style={{
                        height: "8px",
                        borderRadius: "99px",
                        overflow: "hidden",
                        background: "var(--border)",
                      }}
                    >
                      <div
                        style={{
                          width: `${result.percentage}%`,
                          height: "100%",
                          borderRadius: "99px",
                          background: "var(--accent)",
                          opacity: 1 - resultData.indexOf(result) * 0.16,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            {/* <div
                style={{
                  marginTop: "38px",
                  paddingTop: "24px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    lineHeight: 1.65,
                  }}
                >
                  Este resultado representa tu experiencia durante el concierto
                  y no constituye una evaluación o diagnóstico psicológico.
                </p>
              </div>*/}
            </section>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "30px",
            }}
          >

            <button
              type="button"
              className="sensus-button-secondary"
              style={{
                cursor: "pointer",
              }}
            >
              Ver experiencia del público
            </button>
          </div>
        </div>

        <footer className="prototype-sponsors-footer">
          <div className="sensus-container prototype-sponsors-footer-content">
            <span className="prototype-sponsors-label">
              Gracias a nuestros patrocinadores
            </span>
            <div className="prototype-sponsor-placeholder">Patrocinador 1</div>
            <div className="prototype-sponsor-placeholder">Patrocinador 2</div>
            <div className="prototype-sponsor-placeholder">Patrocinador 3</div>
            <div className="prototype-sponsor-placeholder">Patrocinador 4</div>
          </div>
        </footer>
      </div>
    </PrototypeShell>
  );
}