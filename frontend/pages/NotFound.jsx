import React from "react";

export default function NotFound() {
  function goHome() {
    window.location.hash = "";
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      goHome();
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundOne} />
      <div style={styles.backgroundTwo} />

      <main style={styles.card}>
        <div style={styles.logo}>P</div>

        <div style={styles.code}>404</div>

        <h1 style={styles.title}>Page Not Found</h1>

        <p style={styles.text}>
          The page you are looking for does not exist, has been moved,
          or the URL may be incorrect.
        </p>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={goHome}
            style={styles.primaryButton}
          >
            Go to Home
          </button>

          <button
            type="button"
            onClick={goBack}
            style={styles.secondaryButton}
          >
            Go Back
          </button>
        </div>

        <div style={styles.helpBox}>
          <div style={styles.helpIcon}>⌕</div>

          <div>
            <strong style={styles.helpTitle}>
              Looking for a property?
            </strong>

            <p style={styles.helpText}>
              Explore available properties, projects and listings
              on PROZPO.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 16px",
    background:
      "linear-gradient(135deg, #eff6ff 0%, #f8fafc 48%, #eef2ff 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    color: "#0f172a",
  },

  backgroundOne: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "rgba(37,99,235,0.08)",
    top: "-160px",
    left: "-120px",
  },

  backgroundTwo: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(124,58,237,0.07)",
    bottom: "-190px",
    right: "-140px",
  },

  card: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "620px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "28px",
    padding: "48px 34px",
    textAlign: "center",
    boxShadow: "0 25px 80px rgba(15,23,42,0.12)",
  },

  logo: {
    width: "58px",
    height: "58px",
    margin: "0 auto 18px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 900,
    boxShadow: "0 12px 28px rgba(37,99,235,0.25)",
  },

  code: {
    fontSize: "clamp(72px, 18vw, 150px)",
    lineHeight: 0.95,
    fontWeight: 950,
    letterSpacing: "-8px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "5px 0 12px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(25px, 5vw, 36px)",
    fontWeight: 900,
    letterSpacing: "-1px",
  },

  text: {
    maxWidth: "470px",
    margin: "12px auto 0",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.75,
  },

  actions: {
    display: "flex",
    gap: "11px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "28px",
  },

  primaryButton: {
    minHeight: "46px",
    border: 0,
    borderRadius: "12px",
    padding: "12px 22px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 9px 22px rgba(37,99,235,0.2)",
  },

  secondaryButton: {
    minHeight: "46px",
    border: "1px solid #dbe2ea",
    borderRadius: "12px",
    padding: "12px 22px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  helpBox: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    marginTop: "30px",
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  helpIcon: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "23px",
    fontWeight: 900,
  },

  helpTitle: {
    display: "block",
    fontSize: "13px",
    fontWeight: 900,
    marginBottom: "3px",
  },

  helpText: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};
