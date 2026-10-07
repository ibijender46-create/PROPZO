import React, { useEffect, useMemo, useState } from "react";
import { getProfile } from "../src/api";

const ROLE_CONFIG = {
  owner: {
    label: "Owner",
    dashboard: "owner-dashboard",
    color: "#2563eb",
    description: "Manage your properties, enquiries and listings.",
  },
  agent: {
    label: "Agent / Broker",
    dashboard: "agent-dashboard",
    color: "#7c3aed",
    description: "Manage property listings, leads and client enquiries.",
  },
  builder: {
    label: "Builder",
    dashboard: "builder-dashboard",
    color: "#059669",
    description: "Manage projects, properties and enquiries.",
  },
  admin: {
    label: "Administrator",
    dashboard: "admin-dashboard",
    color: "#dc2626",
    description: "Manage the complete PROZPO platform.",
  },
};

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function getRequestedRole() {
  const hash = window.location.hash || "";
  const queryIndex = hash.indexOf("?");

  if (queryIndex === -1) return "";

  const query = new URLSearchParams(hash.substring(queryIndex + 1));
  return normalizeRole(query.get("role"));
}

function getRequestedDashboard() {
  const hash = (window.location.hash || "")
    .replace(/^#/, "")
    .split("?")[0]
    .replace(/\/+$/, "");

  return hash;
}

export default function RoleBasedAccess() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const requestedDashboard = useMemo(
    () => getRequestedDashboard(),
    []
  );

  const requestedRole = useMemo(
    () => getRequestedRole(),
    []
  );

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await getProfile();

        if (!active) return;

        const data =
          response?.profile ||
          response?.data?.profile ||
          response?.data ||
          response ||
          null;

        if (!data) {
          throw new Error("Profile information not found.");
        }

        setProfile(data);
      } catch (err) {
        if (!active) return;

        setError(
          err?.message ||
            "Unable to load your account information."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const role = normalizeRole(profile?.role);

  const config = ROLE_CONFIG[role];

  function goToDashboard(target = config?.dashboard) {
    if (!target) return;

    setRedirecting(true);

    window.location.hash = target;

    window.setTimeout(() => {
      setRedirecting(false);
    }, 300);
  }

  function goHome() {
    window.location.hash = "";
  }

  function retry() {
    window.location.reload();
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <h2 style={styles.title}>Checking Account Access</h2>
          <p style={styles.text}>
            Please wait while PROZPO verifies your account role.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>!</div>

          <h2 style={styles.title}>Access Check Failed</h2>

          <p style={styles.text}>{error}</p>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={retry}
              style={styles.primaryButton}
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={goHome}
              style={styles.secondaryButton}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.warningIcon}>🔒</div>

          <h2 style={styles.title}>Role Not Assigned</h2>

          <p style={styles.text}>
            Your account does not currently have a valid PROZPO
            role assigned.
          </p>

          <div style={styles.roleBox}>
            <span style={styles.roleLabel}>Current Role</span>
            <strong>
              {profile?.role || "Not assigned"}
            </strong>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={goHome}
              style={styles.primaryButton}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dashboardMismatch =
    requestedDashboard &&
    requestedDashboard.includes("dashboard") &&
    requestedDashboard !== config.dashboard;

  const roleMismatch =
    requestedRole &&
    requestedRole !== role;

  if (dashboardMismatch || roleMismatch) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div
            style={{
              ...styles.roleIcon,
              background: config.color,
            }}
          >
            {config.label.charAt(0)}
          </div>

          <div
            style={{
              ...styles.badge,
              color: config.color,
              borderColor: `${config.color}40`,
              background: `${config.color}12`,
            }}
          >
            {config.label}
          </div>

          <h2 style={styles.title}>Access Restricted</h2>

          <p style={styles.text}>
            This section is not available for your current account
            role.
          </p>

          <div style={styles.roleBox}>
            <span style={styles.roleLabel}>Your Dashboard</span>
            <strong>{config.label} Dashboard</strong>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => goToDashboard()}
              disabled={redirecting}
              style={{
                ...styles.primaryButton,
                background: config.color,
                opacity: redirecting ? 0.7 : 1,
              }}
            >
              {redirecting
                ? "Opening..."
                : `Open ${config.label} Dashboard`}
            </button>

            <button
              type="button"
              onClick={goHome}
              style={styles.secondaryButton}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <span style={styles.smallLabel}>PROZPO ACCOUNT</span>
            <h1 style={styles.heading}>Role-Based Access</h1>
            <p style={styles.subHeading}>
              Your account has been verified successfully.
            </p>
          </div>

          <button
            type="button"
            onClick={goHome}
            style={styles.headerButton}
          >
            Home
          </button>
        </div>

        <div style={styles.mainGrid}>
          <section style={styles.profileCard}>
            <div
              style={{
                ...styles.largeAvatar,
                background: config.color,
              }}
            >
              {(profile?.name || profile?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2 style={styles.profileName}>
              {profile?.name || "PROZPO User"}
            </h2>

            <p style={styles.email}>
              {profile?.email || "No email available"}
            </p>

            <div
              style={{
                ...styles.roleBadgeLarge,
                color: config.color,
                borderColor: `${config.color}40`,
                background: `${config.color}12`,
              }}
            >
              {config.label}
            </div>

            <div style={styles.profileDetails}>
              <div style={styles.detailRow}>
                <span>Account Role</span>
                <strong>{config.label}</strong>
              </div>

              <div style={styles.detailRow}>
                <span>Status</span>
                <strong>
                  {profile?.status || "Active"}
                </strong>
              </div>

              {profile?.phone && (
                <div style={styles.detailRow}>
                  <span>Phone</span>
                  <strong>{profile.phone}</strong>
                </div>
              )}

              {profile?.city && (
                <div style={styles.detailRow}>
                  <span>City</span>
                  <strong>{profile.city}</strong>
                </div>
              )}
            </div>
          </section>

          <section style={styles.dashboardCard}>
            <div style={styles.cardTop}>
              <div
                style={{
                  ...styles.dashboardIcon,
                  background: config.color,
                }}
              >
                ↗
              </div>

              <div>
                <span style={styles.smallLabel}>
                  AUTHORIZED AREA
                </span>

                <h2 style={styles.dashboardTitle}>
                  {config.label} Dashboard
                </h2>
              </div>
            </div>

            <p style={styles.dashboardDescription}>
              {config.description}
            </p>

            <div style={styles.permissionList}>
              {getPermissions(role).map((permission) => (
                <div
                  key={permission}
                  style={styles.permissionItem}
                >
                  <span
                    style={{
                      ...styles.check,
                      color: config.color,
                    }}
                  >
                    ✓
                  </span>

                  <span>{permission}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToDashboard()}
              disabled={redirecting}
              style={{
                ...styles.dashboardButton,
                background: config.color,
                opacity: redirecting ? 0.7 : 1,
              }}
            >
              {redirecting
                ? "Opening Dashboard..."
                : `Continue to ${config.label} Dashboard`}
            </button>
          </section>
        </div>

        <div style={styles.securityNote}>
          <span>🔐</span>

          <div>
            <strong>Secure Role Access</strong>
            <p>
              Dashboard access is determined from your authenticated
              PROZPO profile role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPermissions(role) {
  const permissions = {
    owner: [
      "Manage your property listings",
      "View property enquiries",
      "Edit and remove your properties",
      "Track listing performance",
    ],

    agent: [
      "Manage property listings",
      "Handle customer enquiries",
      "Manage broker activities",
      "Track listing performance",
    ],

    builder: [
      "Manage real-estate projects",
      "Manage project properties",
      "View customer enquiries",
      "Track project performance",
    ],

    admin: [
      "Manage platform properties",
      "Manage projects and users",
      "Review agents and builders",
      "Manage enquiries and platform activity",
    ],
  };

  return permissions[role] || [];
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)",
    padding: "40px 18px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    color: "#0f172a",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    margin: "80px auto",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "42px 30px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(15,23,42,0.10)",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "30px",
  },

  smallLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.4px",
    color: "#64748b",
    marginBottom: "6px",
  },

  heading: {
    margin: 0,
    fontSize: "clamp(26px, 4vw, 38px)",
    fontWeight: 900,
    letterSpacing: "-1px",
  },

  subHeading: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  headerButton: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: "12px",
    padding: "11px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 0.8fr) minmax(320px, 1.2fr)",
    gap: "22px",
  },

  profileCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
  },

  largeAvatar: {
    width: "78px",
    height: "78px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: 900,
    marginBottom: "18px",
  },

  profileName: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 900,
  },

  email: {
    margin: "7px 0 16px",
    color: "#64748b",
    fontSize: "14px",
    wordBreak: "break-word",
  },

  roleBadgeLarge: {
    display: "inline-block",
    border: "1px solid",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 800,
  },

  profileDetails: {
    marginTop: "28px",
    borderTop: "1px solid #e2e8f0",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "13px",
  },

  dashboardCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  dashboardIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: 900,
    flexShrink: 0,
  },

  dashboardTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: 900,
  },

  dashboardDescription: {
    color: "#64748b",
    lineHeight: 1.7,
    fontSize: "14px",
    margin: "20px 0",
  },

  permissionList: {
    display: "grid",
    gap: "10px",
    marginBottom: "24px",
  },

  permissionItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "13px",
    fontWeight: 650,
  },

  check: {
    fontWeight: 900,
    fontSize: "17px",
  },

  dashboardButton: {
    width: "100%",
    border: "none",
    color: "#ffffff",
    borderRadius: "14px",
    padding: "15px 18px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  securityNote: {
    marginTop: "22px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px 18px",
    color: "#475569",
    fontSize: "13px",
  },

  roleIcon: {
    width: "62px",
    height: "62px",
    margin: "0 auto 16px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "27px",
    fontWeight: 900,
  },

  badge: {
    display: "inline-block",
    border: "1px solid",
    borderRadius: "999px",
    padding: "7px 12px",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "15px",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "24px",
    fontWeight: 900,
  },

  text: {
    color: "#64748b",
    lineHeight: 1.7,
    fontSize: "14px",
    margin: "0 auto",
  },

  roleBox: {
    marginTop: "22px",
    background: "#f8fafc",
    borderRadius: "14px",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    textAlign: "left",
  },

  roleLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "24px",
    flexWrap: "wrap",
  },

  primaryButton: {
    flex: 1,
    minWidth: "140px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "13px 16px",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    flex: 1,
    minWidth: "120px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: "12px",
    padding: "13px 16px",
    fontWeight: 800,
    cursor: "pointer",
  },

  spinner: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "4px solid #e2e8f0",
    borderTopColor: "#2563eb",
    margin: "0 auto 22px",
    animation: "prozpo-spin 0.8s linear infinite",
  },

  errorIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#fee2e2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: 900,
    margin: "0 auto 20px",
  },

  warningIcon: {
    fontSize: "45px",
    marginBottom: "15px",
  },
};
