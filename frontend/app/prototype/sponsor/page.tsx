import PrototypeShell from "@/components/PrototypeShell";

export default function SponsorPrototypePage() {
  return (
    <PrototypeShell currentPage="sponsor">
      <div className="prototype-screen">
        <section
          style={{
            flex: 1,
            width: "min(calc(100% - 40px), 920px)",
            margin: "0 auto",
            padding: "70px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <article
            className="sensus-card"
            style={{
              width: "100%",
              minHeight: "560px",
              padding: "clamp(34px, 7vw, 76px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              borderColor: "rgba(215, 227, 255, 0.18)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at center, rgba(215, 227, 255, 0.12), transparent 54%)",
                pointerEvents: "none",
              }}
            />

            <p
              style={{
                position: "relative",
                margin: 0,
                color: "var(--text-muted)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.17em",
                textTransform: "uppercase",
              }}
            >
              Esta experiencia es presentada por
            </p>

            <div
              style={{
                position: "relative",
                width: "min(100%, 520px)",
                minHeight: "210px",
                margin: "42px 0",
                padding: "30px",
                border: "1px solid var(--border-light)",
                borderRadius: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.96)",
                color: "#111111",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "clamp(25px, 6vw, 48px)",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                  }}
                >
                  LOGO
                </p>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#555555",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Nombre del patrocinador
                </p>
              </div>
            </div>

            <h1
              style={{
                position: "relative",
                margin: 0,
                maxWidth: "700px",
                fontSize: "clamp(31px, 6vw, 54px)",
                letterSpacing: "-0.045em",
                lineHeight: 1.08,
              }}
            >
              Gracias por hacer posible esta experiencia.
            </h1>

            <p
              style={{
                position: "relative",
                maxWidth: "590px",
                margin: "22px 0 0",
                color: "var(--text-secondary)",
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              La siguiente pieza de <strong>Sinfonía de Piedra y Luz</strong>{" "}
              comenzará en breve.
            </p>

            <div
              style={{
                position: "relative",
                width: "min(100%, 420px)",
                height: "4px",
                marginTop: "42px",
                borderRadius: "99px",
                overflow: "hidden",
                background: "var(--border)",
              }}
            >
              <div
                style={{
                  width: "64%",
                  height: "100%",
                  background: "var(--accent)",
                  borderRadius: "99px",
                }}
              />
            </div>
          </article>
        </section>
      </div>
    </PrototypeShell>
  );
}