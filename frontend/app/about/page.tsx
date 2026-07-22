import AppShell from "@/components/AppShell";

export default function AboutPage() {
  return (
    <AppShell
      eyebrow="Nuestra historia"
      title="Sobre nosotros"
      description="Conoce a las personas y la motivación detrás de Sensus."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        <article
          className="sensus-blue-card"
          style={{
            padding: "32px",
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              color: "var(--sensus-gold-light)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            El proyecto
          </p>

          <h2 style={{ margin: "0 0 16px", fontSize: "27px" }}>
            Música, emoción y tecnología
          </h2>

          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              lineHeight: 1.8,
            }}
          >
            Sensus nació con la intención de transformar un concierto en una
            experiencia participativa. Buscamos que cada asistente pueda
            reconocer cómo la música resuena en su estado emocional y, al mismo
            tiempo, formar parte de una lectura colectiva del evento.
          </p>
        </article>

        <article
          className="sensus-blue-card"
          style={{
            padding: "32px",
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              color: "var(--sensus-gold-light)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Nuestra motivación
          </p>

          <h2 style={{ margin: "0 0 16px", fontSize: "27px" }}>
            Cada persona siente diferente
          </h2>

          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              lineHeight: 1.8,
            }}
          >
            Aunque el público escucha las mismas piezas, cada persona puede
            experimentar emociones distintas. Sensus busca visibilizar esa
            diversidad de percepciones mediante una experiencia accesible,
            reflexiva y diseñada para el concierto.
          </p>
        </article>

        <article
          className="sensus-blue-card"
          style={{
            padding: "32px",
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              color: "var(--sensus-gold-light)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            El equipo
          </p>

          <h2 style={{ margin: "0 0 16px", fontSize: "27px" }}>
            Una colaboración interdisciplinaria
          </h2>

          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              lineHeight: 1.8,
            }}
          >
            El proyecto reúne conocimientos de música, psicología y desarrollo
            tecnológico. La selección de emociones y la interpretación de los
            resultados será desarrollada con acompañamiento profesional.
          </p>
        </article>
      </div>
    </AppShell>
  );
}