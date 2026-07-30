"use client";

import {
  FormEvent,
  useState,
} from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import AuthCard from "@/components/AuthCard";

type ApiErrorResponse = {
  detail?: string | { msg: string }[];
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      setError(
        "Ingresa tu correo electrónico y contraseña."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      console.log(
        "Intentando iniciar sesión:",
        normalizedEmail
      );

      await login(
        normalizedEmail,
        password
      );

      console.log(
        "Inicio de sesión correcto"
      );

      router.replace("/songs");
      router.refresh();
    } catch (err) {
      console.error(
        "Error iniciando sesión:",
        err
      );

      const axiosError =
        err as AxiosError<ApiErrorResponse>;

      const detail =
        axiosError.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail[0]?.msg ||
            "Error en los datos enviados."
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
          "No fue posible iniciar sesión."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Ingresa a tu cuenta"
      subtitle="Continúa tu experiencia emocional con Sensus."
      footerText="¿No tienes cuenta?"
      footerLinkText="Regístrate"
      footerHref="/register"
    >
      <form
        id="sensus-login-form"
        onSubmit={handleSubmit}
        method="post"
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
            htmlFor="login-email"
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
            id="login-email"
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
            htmlFor="login-password"
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
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
            disabled={isSubmitting}
            autoComplete="current-password"
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
            style={{
              margin:
                "0 0 18px",
              padding:
                "12px 14px",
              borderRadius: "10px",
              backgroundColor:
                "rgba(248, 113, 113, 0.12)",
              border:
                "1px solid rgba(248, 113, 113, 0.35)",
              color:
                "var(--danger)",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          form="sensus-login-form"
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
            ? "Ingresando..."
            : "Ingresar"}
        </button>
      </form>
    </AuthCard>
  );
}