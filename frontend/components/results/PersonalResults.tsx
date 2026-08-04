import { ParticipationResult } from "@/types";
import InsufficientParticipation from "@/components/results/InsufficientParticipation";

interface PersonalResultsProps {
  participation: ParticipationResult;
}

export default function PersonalResults({
  participation,
}: PersonalResultsProps) {
  if (!participation.meets_minimum) {
    return (
      <InsufficientParticipation
        participation={participation}
      />
    );
  }

  const progressPercentage =
    participation.total_questions > 0
      ? Math.min(
          100,
          (participation.answered_count /
            participation.total_questions) *
            100
        )
      : 0;

  return (
    <section
      className="sensus-blue-card"
      style={{
        width: "100%",
        maxWidth: "820px",
        padding: "clamp(28px, 6vw, 52px)",
      }}
    >
      <p
        className="sensus-eyebrow"
        style={{
          color: "var(--gold-light)",
        }}
      >
        Participación suficiente
      </p>

      <h2
        style={{
          maxWidth: "650px",
          margin: "0 0 18px",
          color: "#ffffff",
          fontSize: "clamp(31px, 5vw, 46px)",
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
        }}
      >
        Completaste tu recorrido
      </h2>

      <p
        style={{
          maxWidth: "680px",
          margin: 0,
          color: "rgba(255, 255, 255, 0.82)",
          fontSize: "16px",
          lineHeight: 1.75,
        }}
      >
        Respondiste suficientes preguntas para generar tu
        perfil de resonancia. Tu información fue registrada
        correctamente.
      </p>

      <div
        style={{
          marginTop: "30px",
          padding: "22px",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: "15px",
          background: "rgba(0, 0, 0, 0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "18px",
          }}
        >
          <div>
            <span
              style={{
                display: "block",
                color: "rgba(255, 255, 255, 0.65)",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
              }}
            >
              Preguntas respondidas
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "7px",
                color: "#ffffff",
                fontSize: "clamp(30px, 6vw, 46px)",
              }}
            >
              {participation.answered_count}
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.55)",
                  fontSize: "20px",
                }}
              >
                {" "}
                / {participation.total_questions}
              </span>
            </strong>
          </div>

          <div
            style={{
              padding: "8px 12px",
              border: "1px solid rgba(201, 150, 36, 0.4)",
              borderRadius: "999px",
              color: "var(--gold-light)",
              background: "rgba(145, 101, 0, 0.18)",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            Mínimo superado
          </div>
        </div>

        <div
          style={{
            height: "8px",
            marginTop: "20px",
            overflow: "hidden",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.14)",
          }}
        >
          <div
            style={{
              width: `${progressPercentage}%`,
              height: "100%",
              borderRadius: "999px",
              background:
                "linear-gradient(90deg, var(--gold), var(--gold-light))",
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "24px",
          padding: "20px",
          border: "1px dashed rgba(255, 255, 255, 0.23)",
          borderRadius: "14px",
          background: "rgba(0, 0, 0, 0.12)",
        }}
      >
        <span
          style={{
            color: "var(--gold-light)",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          Perfil en configuración
        </span>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(255, 255, 255, 0.82)",
            fontSize: "14px",
            lineHeight: 1.65,
          }}
        >
          El equipo está terminando de definir las opciones,
          valores y rangos de los perfiles. Esta sección
          mostrará próximamente tu perfil, su descripción y
          las respuestas predominantes de tu recorrido.
        </p>
      </div>

      <p
        style={{
          margin: "26px 0 0",
          color: "rgba(255, 255, 255, 0.6)",
          fontSize: "12px",
          lineHeight: 1.65,
        }}
      >
        Sensus describe la resonancia producida por la
        experiencia musical y no constituye una evaluación
        ni un diagnóstico psicológico.
      </p>
    </section>
  );
}