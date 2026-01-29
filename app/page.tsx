"use client";

import { useEffect, useState } from "react";

interface RegistroFiscal {
  RFC: string;
  PERIODO: string;
  APROBACION: boolean | null;
  NOMBRE: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function Home() {
  const [registros, setRegistros] = useState<RegistroFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRegistros = async () => {
    const res = await fetch("/api/registros");
    const data = await res.json();
    setRegistros(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const actualizarRegistro = async (RFC: string, aprobacion: boolean) => {
    await fetch("/api/registros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfc: RFC, aprobacion }),
    });

    showToast(
      aprobacion
        ? `RFC ${RFC} aprobado correctamente`
        : `RFC ${RFC} rechazado correctamente`,
      "success"
    );

    fetchRegistros();
  };

  if (loading) {
    return (
      <main style={styles.center}>
        <p>Cargando registros...</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Registros Fiscales</h1>

      {registros.length === 0 && (
        <p style={styles.empty}>No hay registros</p>
      )}

      {registros.map((registro, index) => {
        const aprobado = registro.APROBACION === true;
        const rechazado = registro.APROBACION === false;

        return (
          <div key={`${registro.RFC}-${index}`} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.rfc}>{registro.RFC}</span>
              <span
                style={{
                  ...styles.badge,
                  ...(registro.APROBACION === null
                    ? styles.badgePending
                    : aprobado
                    ? styles.badgeApproved
                    : styles.badgeRejected),
                }}
              >
                {registro.APROBACION === null
                  ? "Pendiente"
                  : aprobado
                  ? "Aprobado"
                  : "Rechazado"}
              </span>
            </div>

            <p><strong>Cliente:</strong> {registro.NOMBRE}</p>
            <p style={styles.periodo}>
              <strong>Periodo:</strong> {registro.PERIODO}
            </p>

            <div style={styles.actions}>
              <button
                style={{
                  ...styles.button,
                  ...styles.approve,
                  ...(aprobado && styles.disabled),
                }}
                disabled={aprobado}
                onClick={() => actualizarRegistro(registro.RFC, true)}
              >
                Aprobar
              </button>

              <button
                style={{
                  ...styles.button,
                  ...styles.reject,
                  ...(rechazado && styles.disabled),
                }}
                disabled={rechazado}
                onClick={() => actualizarRegistro(registro.RFC, false)}
              >
                Rechazar
              </button>

              <a
                href={`/${registro.RFC}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.button, ...styles.pdf }}
              >
                Descargar PDF
              </a>
            </div>
          </div>
        );
      })}

      {toast && (
        <div
          style={{
            ...styles.toast,
            ...(toast.type === "success"
              ? styles.toastSuccess
              : styles.toastError),
          }}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}

/* 🎨 Styles */
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 24,
    fontFamily: "system-ui, sans-serif",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 24,
  },
  empty: {
    color: "#666",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rfc: {
    fontWeight: 600,
    fontSize: 16,
  },
  periodo: {
    marginBottom: 12,
    color: "#444",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },
  badgePending: {
    background: "#FEF3C7",
    color: "#92400E",
  },
  badgeApproved: {
    background: "#DCFCE7",
    color: "#166534",
  },
  badgeRejected: {
    background: "#FEE2E2",
    color: "#991B1B",
  },
  actions: {
    display: "flex",
    gap: 12,
    marginTop: 12,
    flexWrap: "wrap",
  },
  button: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    textDecoration: "none",
  },
  approve: {
    background: "#16A34A",
    color: "#fff",
  },
  reject: {
    background: "#DC2626",
    color: "#fff",
  },
  pdf: {
    background: "#2563EB",
    color: "#fff",
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  toast: {
    position: "fixed",
    bottom: 24,
    right: 24,
    padding: "12px 16px",
    borderRadius: 8,
    color: "#fff",
    fontWeight: 600,
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
    zIndex: 1000,
  },
  toastSuccess: {
    background: "#16A34A",
  },
  toastError: {
    background: "#DC2626",
  },
  center: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};
