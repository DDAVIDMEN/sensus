"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const navigation = [
  { href: "/", label: "Inicio" },
  { href: "/songs", label: "Canciones" },
  { href: "/results", label: "Resultados" },
  { href: "/about", label: "Sobre nosotros" },
];

export default function MainNavbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="main-navbar">
      <div className="sensus-container navbar-content">
        <Link href="/" className="navbar-brand">
          <Image
            src="/logo.png"
            alt="Sensus"
            width={220}
            height={70}
            priority
            className="navbar-logo"
          />
        </Link>

        <nav className="navbar-links" aria-label="Navegación principal">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`navbar-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Muestra el enlace solo si el usuario existe y es admin */}
              {user?.is_admin && (
                <Link href="/admin" className="navbar-admin-link">
                  Panel admin
                </Link>
              )}

              <div className="navbar-user">
                <span>{user?.email}</span>

                <button type="button" onClick={logout}>
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="navbar-login-link">
                Iniciar sesión
              </Link>

              <Link href="/register" className="sensus-button-primary navbar-register">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}