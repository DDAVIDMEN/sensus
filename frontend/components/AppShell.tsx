import { ReactNode } from "react";
import MainNavbar from "@/components/MainNavbar";
import SponsorsFooter from "@/components/SponsorsFooter";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  eyebrow?: string;
  showSponsors?: boolean;
}

export default function AppShell({
  children,
  title,
  description,
  eyebrow,
  showSponsors = true,
}: AppShellProps) {
  return (
    <main
      className="sensus-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MainNavbar />

      <div
        className="sensus-container app-shell-content"
        style={{ flex: 1 }}
      >
        {(title || description || eyebrow) && (
          <section className="page-heading">
            {eyebrow && <p className="sensus-eyebrow">{eyebrow}</p>}
            {title && <h1>{title}</h1>}
            {description && <p>{description}</p>}
          </section>
        )}

        {children}
      </div>

      {showSponsors && <SponsorsFooter />}
    </main>
  );
}