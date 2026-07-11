"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { AxiosError } from "axios";
import AuthCard from "@/components/AuthCard";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post("/auth/register", { email, password });
      router.push("/login");
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(axiosError.response?.data?.detail ?? "Error al registrarse");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <AuthCard
    title="Crea tu cuenta"
    subtitle="Regístrate para vivir la experiencia completa del concierto."
    footerText="¿Ya tienes cuenta?"
    footerLinkText="Inicia sesión"
    footerHref="/login"
  >
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "18px" }}>
        <label
          htmlFor="email"
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          Correo electrónico
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{
            width: "100%",
            minHeight: "48px",
            padding: "0 14px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            backgroundColor: "var(--surface)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: "18px" }}>
        <label
          htmlFor="password"
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          Contraseña
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          style={{
            width: "100%",
            minHeight: "48px",
            padding: "0 14px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            backgroundColor: "var(--surface)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
      </div>

      {error && (
        <p
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            borderRadius: "10px",
            backgroundColor: "rgba(248, 113, 113, 0.12)",
            border: "1px solid rgba(248, 113, 113, 0.35)",
            color: "var(--danger)",
            fontSize: "14px",
            lineHeight: 1.5,
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="sensus-button-primary"
        style={{
          width: "100%",
          border: "none",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.65 : 1,
        }}
      >
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  </AuthCard>
  );
}
