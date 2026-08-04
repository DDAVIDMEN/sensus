"use client";

import Image from "next/image";
import Link from "next/link";

import MainNavbar from "@/components/MainNavbar";
import SponsorsFooter from "@/components/SponsorsFooter";
import { useAuth } from "@/context/AuthContext";

const steps = [
  {
    number: "01",
    title: "Escucha",
    description:
      "Cada obra se desbloquea conforme es interpretada en vivo durante el concierto.",
  },
  {
    number: "02",
    title: "Siente",
    description:
      "Selecciona la emoción que mejor represente lo que cada pieza despierta en ti.",
  },
  {
    number: "03",
    title: "Descubre",
    description:
      "Al finalizar conocerás el recorrido emocional que experimentaste durante el concierto.",
  },
];

export default function HomePage() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  return (
    <main className="sensus-page">
      <MainNavbar />

      <section
        className="sensus-container"
        style={{
          minHeight: "calc(100vh - 84px)",
          padding: "60px 0 100px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(310px, 1fr))",
          alignItems: "center",
          gap: "64px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 20px",
              color: "var(--gold-light)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Experiencia musical interactiva
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(48px, 7vw, 86px)",
              lineHeight: 0.98,
              letterSpacing: "-0.055em",
            }}
          >
            La música se escucha.
            <br />
            También se siente.
          </h1>

          <p
            style={{
              margin: "30px 0 0",
              color: "var(--text-secondary)",
              fontSize: "clamp(17px, 2vw, 20px)",
              lineHeight: 1.7,
            }}
          >
            Vive{" "}
            <strong>
              Sinfonía de Piedra y Luz
            </strong>{" "}
            y descubre cómo cada obra resuena
            contigo a través de una experiencia
            que une música, emoción y reflexión.
          </p>

          {!isLoading && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
                marginTop: "38px",
              }}
            >
              {isAuthenticated ? (
                <Link
                  href="/songs"
                  className="sensus-button-primary"
                >
                  Continuar experiencia
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="sensus-button-primary"
                  >
                    Ingresar a la experiencia
                  </Link>

                  <Link
                    href="/register"
                    className="sensus-button-secondary"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          )}

          <p
            style={{
              marginTop: "24px",
              color: "var(--text-muted)",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            No existen respuestas correctas.
            Solo emociones auténticas.
          </p>
        </div>

        <div
          className="sensus-card"
          style={{
            position: "relative",
            minHeight: "520px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "30px",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at center, rgba(215, 227, 255, 0.12), transparent 60%)",
            }}
          />

          <Image
            src="/sensus-logo.png"
            alt="Sensus, Sinfonía de Piedra y Luz"
            width={900}
            height={900}
            priority
            style={{
              position: "relative",
              width: "100%",
              height: "auto",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      </section>

      <section
        id="como-funciona"
        style={{
          borderTop:
            "1px solid var(--border)",
          borderBottom:
            "1px solid var(--border)",
          background:
            "var(--background-soft)",
        }}
      >
        <div
          className="sensus-container"
          style={{
            padding: "110px 0",
          }}
        >
          <div
            style={{
              marginBottom: "52px",
            }}
          >
            <p
              style={{
                margin: "0 0 12px",
                color: "var(--gold-light)",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Tu recorrido emocional
            </p>

            <h2
              style={{
                margin: 0,
                fontSize:
                  "clamp(36px, 5vw, 58px)",
                letterSpacing: "-0.045em",
              }}
            >
              ¿Cómo funciona?
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
            }}
          >
            {steps.map((step) => (
              <article
                key={step.number}
                className="sensus-card"
                style={{
                  padding: "30px",
                  minHeight: "270px",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color:
                      "var(--text-muted)",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    marginBottom: "72px",
                  }}
                >
                  {step.number}
                </span>

                <h3
                  style={{
                    margin: "0 0 14px",
                    fontSize: "25px",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color:
                      "var(--text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="sensus-container"
        style={{
          padding: "130px 0",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--text-secondary)",
            fontSize:
              "clamp(21px, 3vw, 32px)",
            lineHeight: 1.6,
          }}
        >
          Cada persona escucha la misma música.
          <br />

          <strong
            style={{
              color:
                "var(--text-primary)",
            }}
          >
            Ninguna persona la siente de la
            misma manera.
          </strong>
        </p>

        {!isLoading &&
          (isAuthenticated ? (
            <Link
              href="/songs"
              className="sensus-button-primary"
              style={{
                marginTop: "36px",
              }}
            >
              Continuar experiencia
            </Link>
          ) : (
            <Link
              href="/register"
              className="sensus-button-primary"
              style={{
                marginTop: "36px",
              }}
            >
              Formar parte de la experiencia
            </Link>
          ))}
      </section>

      <footer
        style={{
          borderTop:
            "1px solid var(--border)",
        }}
      >
        <div
          className="sensus-container"
          style={{
            minHeight: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            flexWrap: "wrap",
            gap: "18px",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}
        >
          <span>
            Sensus · Sinfonía de Piedra y Luz
          </span>

          <span>
            Experiencia musical y emocional
          </span>
        </div>
      </footer>

      <SponsorsFooter />
    </main>
  );
}