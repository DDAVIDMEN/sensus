type ResultsView = "personal" | "global";

interface ResultsTabsProps {
  activeView: ResultsView;
  onChange: (view: ResultsView) => void;
}

export default function ResultsTabs({
  activeView,
  onChange,
}: ResultsTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Tipos de resultados"
      style={{
        width: "fit-content",
        maxWidth: "100%",
        margin: "0 auto 28px",
        padding: "5px",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        display: "flex",
        gap: "5px",
        background: "var(--surface)",
      }}
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeView === "personal"}
        onClick={() => onChange("personal")}
        style={tabStyle(activeView === "personal")}
      >
        Mi resultado
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeView === "global"}
        onClick={() => onChange("global")}
        style={tabStyle(activeView === "global")}
      >
        Público general
      </button>
    </div>
  );
}

function tabStyle(
  isActive: boolean
): React.CSSProperties {
  return {
    minHeight: "42px",
    padding: "0 17px",
    border: isActive
      ? "1px solid var(--accent-hover)"
      : "1px solid transparent",
    borderRadius: "9px",
    color: "#ffffff",
    background: isActive
      ? "var(--accent)"
      : "transparent",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition:
      "background-color 160ms ease, border-color 160ms ease",
  };
}