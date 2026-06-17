import { useState } from "react";

const SEVERITY_COLORS = {
  none: "#16a34a",
  low: "#65a30d",
  moderate: "#d97706",
  high: "#dc2626",
};

const SEVERITY_LABELS = {
  none: "Aucune",
  low: "Faible",
  moderate: "Modérée",
  high: "Élevée",
};

export default function PredictionResult({ result }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  const {
    predicted_label,
    confidence,
    severity,
    is_healthy,
    advice,
    class_probabilities,
  } = result;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>{predicted_label}</h2>
        <span
          style={{
            ...styles.badge,
            backgroundColor: SEVERITY_COLORS[severity] || "#6b7280",
          }}
        >
          Sévérité : {SEVERITY_LABELS[severity] || severity}
        </span>
      </div>

      <p style={styles.confidence}>
        Confiance du modèle : <strong>{confidence}%</strong>
      </p>

      <div style={styles.adviceBox}>
        <h3 style={styles.adviceTitle}>
          {is_healthy ? "Recommandation" : "Diagnostic & Traitement"}
        </h3>
        <p style={styles.adviceText}>{advice}</p>
      </div>

      <button
        style={styles.toggleBtn}
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Masquer les détails" : "Voir toutes les probabilités"}
      </button>

      {showDetails && (
        <ul style={styles.probList}>
          {Object.entries(class_probabilities)
            .sort((a, b) => b[1].probability - a[1].probability)
            .map(([key, val]) => (
              <li key={key} style={styles.probItem}>
                <span>{val.label}</span>
                <span>{val.probability}%</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "500px",
    margin: "20px auto",
    fontFamily: "sans-serif",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  title: {
    fontSize: "1.25rem",
    margin: 0,
  },
  badge: {
    color: "white",
    fontSize: "0.75rem",
    padding: "4px 10px",
    borderRadius: "999px",
    fontWeight: 600,
  },
  confidence: {
    color: "#6b7280",
    marginBottom: "16px",
  },
  adviceBox: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "12px",
  },
  adviceTitle: {
    fontSize: "1rem",
    marginTop: 0,
    marginBottom: "8px",
  },
  adviceText: {
    whiteSpace: "pre-line",
    fontSize: "0.9rem",
    lineHeight: "1.5",
    margin: 0,
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: 0,
  },
  probList: {
    listStyle: "none",
    padding: 0,
    marginTop: "10px",
  },
  probItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    fontSize: "0.85rem",
    borderBottom: "1px solid #f3f4f6",
  },
};