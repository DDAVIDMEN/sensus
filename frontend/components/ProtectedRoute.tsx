"use client";

import {
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const router = useRouter();

  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (
      adminOnly &&
      !user?.is_admin
    ) {
      router.replace("/songs");
    }
  }, [
    adminOnly,
    isAuthenticated,
    isLoading,
    router,
    user,
  ]);

  if (isLoading) {
    return (
      <main
        className="sensus-page"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
        }}
      >
        <section
          className="sensus-card"
          style={{
            width: "100%",
            maxWidth: "460px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              color:
                "var(--text-secondary)",
            }}
          >
            Verificando tu sesión...
          </p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (
    adminOnly &&
    !user?.is_admin
  ) {
    return null;
  }

  return <>{children}</>;
}