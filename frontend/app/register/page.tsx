"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { AxiosError } from "axios";

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
    <main className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Sensus</h1>
        <p className="text-gray-400 mb-8">Crea tu cuenta</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm text-gray-300 mb-1 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm text-gray-300 mb-1 block">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
