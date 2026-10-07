import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("PROZPO Application Error:", error);
    console.error("PROZPO Error Info:", errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.hash = "";
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.icon}>!</div>

          <div style={styles.badge}>PROZPO SYSTEM</div>

          <h1 style={styles.title}>
            Something Went Wrong
          </h1>

          <p style={styles.text}>
            PROZPO could not load this section correctly.
            You can reload the application or return to the
            homepage.
          </p>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={this.handleReload}
              style={styles.primary}
            >
              Reload Application
            </button>

            <button
              type="button"
              onClick={this.handleHome}
              style={styles.secondary}
            >
              Go to Home
            </button>
          </div>

          {this.state.error?.message && (
            <details style={styles.details}>
              <summary style={styles.summary}>
                Technical Details
              </summary>

              <pre style={styles.errorText}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background:
      "linear-gradient(135deg,#eff6ff 0%,#f8fafc 50%,#eef2ff 100%)",
    fontFamily:
      "Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "560px",
    padding: "42px 30px",
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    boxShadow: "0 25px 70px rgba(15,23,42,.12)",
  },

  icon: {
    width: "64px",
    height: "64px",
    margin: "0 auto 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    background: "#fee2e2",
    color: "#dc2626",
    fontSize: "32px",
    fontWeight: 900,
  },

  badge: {
    display: "inline-block",
    marginBottom: "10px",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "1.5px",
  },

  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "clamp(25px,6vw,36px)",
    fontWeight: 900,
    letterSpacing: "-1px",
  },

  text: {
    maxWidth: "450px",
    margin: "13px auto 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  actions: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "26px",
  },

  primary: {
    minHeight: "46px",
    border: 0,
    borderRadius: "12px",
    padding: "12px 18px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondary: {
    minHeight: "46px",
    border: "1px solid #dbe2ea",
    borderRadius: "12px",
    padding: "12px 18px",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
  },

  details: {
    marginTop: "24px",
    textAlign: "left",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "16px",
  },

  summary: {
    cursor: "pointer",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 800,
  },

  errorText: {
    marginTop: "12px",
    padding: "12px",
    overflowX: "auto",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "11px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
};
