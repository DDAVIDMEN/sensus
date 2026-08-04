"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import ResultsTabs from "@/components/results/ResultsTabs";
import PersonalResults from "@/components/results/PersonalResults";
import GlobalResults from "@/components/results/GlobalResults";

import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { ParticipationResult } from "@/types";

type ResultsView = "personal" | "global";

function ResultsContent() {
  const { user } = useAuth();

  const [activeView, setActiveView] =
    useState<ResultsView>("personal");

  const [participation, setParticipation] =
    useState<ParticipationResult | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadParticipation = useCallback(
    async () => {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response =
          await api.get<ParticipationResult>(
            `/results/user/${user.id}/participation`
          );

        setParticipation(response.data);
      } catch (error) {
        console.error(
          "Error cargando la participación:",
          error
        );

        setErrorMessage(
          "No fue posible cargar tus resultados. Intenta nuevamente."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    loadParticipation();
  }, [loadParticipation]);

  return (
    <AppShell
      eyebrow="Recorrido emocional"
      title={
        activeView === "personal"
          ? "Tu experiencia en Sensus"
          : "Experiencia del público"
      }
      description={
        activeView === "personal"
          ? "Consulta el estado de tu recorrido y, cuando esté disponible, descubre tu perfil de resonancia."
          : "Explora cómo vivieron los asistentes las diferentes piezas del concierto."
      }
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ResultsTabs
          activeView={activeView}
          onChange={setActiveView}
        />

        {activeView === "global" ? (
          <GlobalResults />
        ) : isLoading ? (
          <LoadingResults />
        ) : errorMessage ? (
          <ResultsError
            message={errorMessage}
            onRetry={loadParticipation}
          />
        ) : participation ? (
          <PersonalResults
            participation={participation}
          />
        ) : (
          <ResultsError
            message="No encontramos información sobre tu participación."
            onRetry={loadParticipation}
          />
        )}
      </div>
    </AppShell>
  );
}

function LoadingResults() {
  return (
    <section
      className="sensus-card"
      style={{
        maxWidth: "820px",
        padding: "42px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          margin: "0 auto 18px",
          border: "3px solid var(--border)",
          borderTopColor: "var(--gold-light)",
          borderRadius: "50%",
          animation: "results-spin 0.8s linear infinite",
        }}
      />

      <h2
        style={{
          margin: "0 0 9px",
          color: "var(--text-primary)",
          fontSize: "24px",
        }}
      >
        Preparando tus resultados
      </h2>

      <p
        style={{
          margin: 0,
          color: "var(--text-secondary)",
          fontSize: "14px",
        }}
      >
        Estamos revisando las respuestas de tu recorrido.
      </p>

      <style jsx>{`
        @keyframes results-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}

function ResultsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section
      className="sensus-card"
      style={{
        maxWidth: "820px",
        padding: "38px",
      }}
    >
      <p
        style={{
          margin: "0 0 20px",
          padding: "13px 15px",
          border: "1px solid rgba(248, 113, 113, 0.35)",
          borderRadius: "10px",
          color: "var(--danger)",
          background:
            "rgba(248, 113, 113, 0.1)",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>

      <button
        type="button"
        className="sensus-button-primary"
        onClick={onRetry}
        style={{
          cursor: "pointer",
        }}
      >
        Intentar nuevamente
      </button>
    </section>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}