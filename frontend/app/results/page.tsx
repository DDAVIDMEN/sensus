"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";

function ResultsContent() {
  return (
    <AppShell
      title="Resultados en tiempo real"
      description="Explora cómo está viviendo el público cada pieza del concierto."
    >
      <section
        className="sensus-card"
        style={{
          padding: "36px",
          maxWidth: "820px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--accent)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Próximamente
        </p>

        <h2
          style={{
            margin: "14px 0 10px",
            fontSize: "28px",
          }}
        >
          Estadísticas del concierto
        </h2>

        <p
          style={{
            margin: 0,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          Aquí aparecerán los porcentajes de emociones seleccionadas, la
          emoción dominante de cada canción y la evolución emocional general
          del público.
        </p>
      </section>
    </AppShell>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}