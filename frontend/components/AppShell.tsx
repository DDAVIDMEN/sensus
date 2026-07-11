import { ReactNode } from "react";
import MainNavbar from "@/components/MainNavbar";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function AppShell({
  children,
  title,
  description,
}: AppShellProps) {
  return (
    <main className="sensus-page">
      <MainNavbar />

      <div className="sensus-container app-shell-content">
        {(title || description) && (
          <section className="page-heading">
            {title && <h1>{title}</h1>}
            {description && <p>{description}</p>}
          </section>
        )}

        {children}
      </div>
    </main>
  );
}