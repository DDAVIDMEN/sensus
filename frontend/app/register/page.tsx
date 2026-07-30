"use client";

import {
  FormEvent,
  useState,
} from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import AuthCard from "@/components/AuthCard";

type ValidationError = {
  msg?: string;
};

type ApiErrorResponse = {
  detail?: string | ValidationError[];
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Ingresa un correo electrónico."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Crear la cuenta.
      await api.post("/auth/register", {
        email: normalizedEmail,
        password,
      });

      // 2. Iniciar sesión automáticamente.
      await login(
        normalizedEmail,
        password
      );

      // 3. Enviar al usuario a la experiencia.
      router.replace("/songs");
      router.refresh();
    } catch (err) {
      console.error(
        "Error durante el registro:",
        err
      );

      const axiosError =
        err as AxiosError<ApiErrorResponse>;

      const detail =
        axiosError.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail[0]?.msg ??
            "Revisa los datos enviados."
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else if (
        axiosError.code ===
        "ERR_NETWORK"
      ) {
        setError(
          "No fue posible conectarse con el servidor."
        );
      } else {
        setError(
          "No fue posible crear la cuenta."
        );
      }
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
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          width: "100%",
        }}
      >
        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <label
            htmlFor="register-email"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color:
                "var(--text-secondary)",
            }}
          >
            Correo electrónico
          </label>

          <input
            id="register-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            required
            disabled={isSubmitting}
            autoComplete="email"
            inputMode="email"
            className="sensus-input"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "0 14px",
              borderRadius: "10px",
              border:
                "1px solid var(--border-light)",
              backgroundColor:
                "var(--surface)",
              color:
                "var(--text-primary)",
              outline: "none",
              opacity: isSubmitting
                ? 0.7
                : 1,
            }}
          />
        </div>

        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <label
            htmlFor="register-password"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color:
                "var(--text-secondary)",
            }}
          >
            Contraseña
          </label>

          <input
            id="register-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
            minLength={6}
            disabled={isSubmitting}
            autoComplete="new-password"
            className="sensus-input"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "0 14px",
              borderRadius: "10px",
              border:
                "1px solid var(--border-light)",
              backgroundColor:
                "var(--surface)",
              color:
                "var(--text-primary)",
              outline: "none",
              opacity: isSubmitting
                ? 0.7
                : 1,
            }}
          />
        </div>

        {error && (
          <p
            role="alert"
            aria-live="polite"
            style={{
              margin: "0 0 18px",
              padding: "12px 14px",
              borderRadius: "10px",
              backgroundColor:
                "rgba(248, 113, 113, 0.12)",
              border:
                "1px solid rgba(248, 113, 113, 0.35)",
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
            cursor: isSubmitting
              ? "not-allowed"
              : "pointer",
            opacity: isSubmitting
              ? 0.65
              : 1,
          }}
        >
          {isSubmitting
            ? "Creando cuenta..."
            : "Crear cuenta"}
        </button>
      </form>
    </AuthCard>
  );
}