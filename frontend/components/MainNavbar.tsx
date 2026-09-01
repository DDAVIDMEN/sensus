"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

const navigation = [
  { href: "/", label: "Inicio" },
  { href: "/songs", label: "Canciones" },
  { href: "/results", label: "Resultados" },
  { href: "/about", label: "Sobre nosotros" },
];

export default function MainNavbar() {
  const pathname = usePathname();

  const {
    user,
    logout,
    isAuthenticated,
  } = useAuth();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  // Cierra el menú al navegar.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActiveRoute = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <header className="main-navbar">
      <div className="sensus-container navbar-content">
        <Link
          href="/"
          className="navbar-brand"
          aria-label="Ir al inicio"
        >
          <Image
            src="/logo.png"
            alt="Sensus"
            width={220}
            height={70}
            priority
            className="navbar-logo"
          />
        </Link>

        {/* Navegación de escritorio */}
        <nav
          className="navbar-links navbar-desktop"
          aria-label="Navegación principal"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`navbar-link ${
                isActiveRoute(item.href)
                  ? "active"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Acciones de escritorio */}
        <div className="navbar-actions navbar-desktop">
          {isAuthenticated ? (
            <>
              {user?.is_admin && (
                <Link
                  href="/admin"
                  className="navbar-admin-link"
                >
                  Panel admin
                </Link>
              )}

              <div className="navbar-user">
                <span>{user?.email}</span>

                <button
                  type="button"
                  onClick={logout}
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="navbar-login-link"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="sensus-button-primary navbar-register"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        {/* Botón hamburguesa móvil */}
        <button
          type="button"
          className={`navbar-menu-button ${
            isMenuOpen ? "open" : ""
          }`}
          onClick={() =>
            setIsMenuOpen((previous) => !previous)
          }
          aria-label={
            isMenuOpen
              ? "Cerrar menú"
              : "Abrir menú"
          }
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Menú móvil */}
      <div
        className={`navbar-mobile-menu ${
          isMenuOpen ? "open" : ""
        }`}
      >
        <nav
          className="navbar-mobile-links"
          aria-label="Navegación móvil"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`navbar-mobile-link ${
                isActiveRoute(item.href)
                  ? "active"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              {user?.is_admin && (
                <Link
                  href="/admin"
                  className={`navbar-mobile-link ${
                    pathname.startsWith("/admin")
                      ? "active"
                      : ""
                  }`}
                >
                  Panel admin
                </Link>
              )}

              {user?.email && (
                <div className="navbar-mobile-user">
                  {user.email}
                </div>
              )}

              <button
                type="button"
                className="navbar-mobile-logout"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="navbar-mobile-link"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="sensus-button-primary navbar-mobile-register"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}