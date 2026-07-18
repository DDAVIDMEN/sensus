import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";

interface PrototypeShellProps {
  children: ReactNode;
  currentPage: "song" | "sponsor" | "result";
}

const prototypePages = [
  {
    id: "song",
    href: "/prototype/song",
    label: "Canción",
  },
  {
    id: "sponsor",
    href: "/prototype/sponsor",
    label: "Patrocinador",
  },
  {
    id: "result",
    href: "/prototype/result",
    label: "Resultado",
  },
];

export default function PrototypeShell({
  children,
  currentPage,
}: PrototypeShellProps) {
  return (
    <main className="sensus-page prototype-page">
      <header className="prototype-header">
        <div className="sensus-container prototype-header-content">
          <Link href="/" className="navbar-brand">
            <Image
                src="/logo.png"
                alt="Sensus"
                width={190}
                height={55}
                priority
                className="navbar-logo"
            />
            </Link>

          <nav className="prototype-navigation">
            {prototypePages.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                className={`prototype-navigation-link ${
                  currentPage === page.id ? "active" : ""
                }`}
              >
                {page.label}
              </Link>
            ))}
          </nav>

          <span className="prototype-label">Prototipo</span>
        </div>
      </header>

      {children}
    </main>
  );
}