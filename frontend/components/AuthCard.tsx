import Link from "next/link";
import { ReactNode } from "react";
import SponsorsFooter from "@/components/SponsorsFooter";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
}

export default function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthCardProps) {
  return (
    <main
      className="sensus-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
        }}
      >
      <section
        className="sensus-card"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px",
        }}
      >
        <Link href="/" className="auth-back-link">
            <span aria-hidden="true">←</span>
            Regresar al inicio
        </Link>
        
        <div style={{ marginBottom: "28px" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "var(--text-primary)",
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Sensus
          </Link>

          <h1
            style={{
              margin: "26px 0 8px",
              fontSize: "30px",
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
        </div>

        {children}

        <p
          style={{
            marginTop: "26px",
            marginBottom: 0,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "14px",
          }}
        >
          {footerText}{" "}
          <Link
            href={footerHref}
            style={{
              color: "var(--gold-light)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {footerLinkText}
          </Link>
        </p>
      </section>
      </div>
    </main>
  );
}