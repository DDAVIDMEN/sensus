import { ParticipationResult } from "@/types";

interface InsufficientParticipationProps {
  participation: ParticipationResult;
}

export default function InsufficientParticipation({
  participation,
}: InsufficientParticipationProps) {
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
      className="sensus-card"
      style={{
        width: "100%",
        maxWidth: "820px",
        padding: "clamp(28px, 6vw, 52px)",
        borderColor: "rgba(201, 150, 36, 0.26)",
      }}
    >
      <p className="sensus-eyebrow">
        Recorrido incompleto
      </p>

      <h2
        style={{
          maxWidth: "650px",
          margin: "0 0 18px",
          color: "var(--text-primary)",
          fontSize: "clamp(29px, 5vw, 44px)",
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
        }}
      >
        No fue posible generar tu perfil de resonancia
      </h2>

      <p
        style={{
          maxWidth: "680px",
          margin: 0,
          color: "var(--text-secondary)",
          fontSize: "16px",
          lineHeight: 1.75,
        }}
      >
        Para ofrecerte un resultado representativo
        necesitábamos al menos{" "}
        <strong style={{ color: "#ffffff" }}>
          {participation.minimum_required} respuestas
        </strong>
        . Tu recorrido quedó incompleto, por lo que no
        contamos con información suficiente para realizar
        el análisis final.
      </p>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
        }}
      >
        <ParticipationMetric
          label="Preguntas respondidas"
          value={`${participation.answered_count} de ${participation.total_questions}`}
        />

        <ParticipationMetric
          label="Mínimo requerido"
          value={`${participation.minimum_required}`}
        />

        <ParticipationMetric
          label="Respuestas faltantes"
          value={`${participation.remaining_required}`}
        />
      </div>

      <div
        style={{
          marginTop: "28px",
        }}
      >
        <div
          style={{
            marginBottom: "9px",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            color: "var(--text-muted)",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          <span>Participación registrada</span>
          <span>
            {participation.answered_count}/
            {participation.total_questions}
          </span>
        </div>

        <div
          style={{
            height: "8px",
            overflow: "hidden",
            borderRadius: "999px",
            background: "var(--border)",
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

      <p
        style={{
          margin: "28px 0 0",
          paddingTop: "22px",
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)",
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

function ParticipationMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        minHeight: "100px",
        padding: "17px",
        border: "1px solid var(--border)",
        borderRadius: "13px",
        background: "var(--surface)",
      }}
    >
      <span
        style={{
          display: "block",
          color: "var(--text-muted)",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          display: "block",
          marginTop: "10px",
          color: "#ffffff",
          fontSize: "24px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}