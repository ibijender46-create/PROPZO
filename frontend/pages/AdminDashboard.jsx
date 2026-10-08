import React, { useEffect, useMemo, useState } from "react";
import {
  getProperties,
  getProjects,
  getAgents,
  getBuilders,
  getEnquiries,
  getUsers,
} from "../src/api";

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [agents, setAgents] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        getProperties(),
        getProjects(),
        getAgents(),
        getBuilders(),
        getEnquiries(),
        getUsers(),
      ]);

      function extract(result, key) {
        if (result.status !== "fulfilled") {
          return [];
        }

        const data = result.value;

        if (Array.isArray(data)) {
          return data;
        }

        if (Array.isArray(data?.[key])) {
          return data[key];
        }

        if (Array.isArray(data?.data)) {
          return data.data;
        }

        return [];
      }

      setProperties(extract(results[0], "properties"));
      setProjects(extract(results[1], "projects"));
      setAgents(extract(results[2], "agents"));
      setBuilders(extract(results[3], "builders"));
      setEnquiries(extract(results[4], "enquiries"));
      setUsers(extract(results[5], "users"));
    } catch (error) {
      console.error("Admin dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const activeProperties = properties.filter((item) => {
      const status = String(item.status || "active").toLowerCase();

      return !["sold", "inactive", "rejected"].includes(status);
    }).length;

    const pendingProperties = properties.filter((item) => {
      const status = String(item.status || "").toLowerCase();

      return ["pending", "review", "draft"].includes(status);
    }).length;

    const activeProjects = projects.filter((item) => {
      const status = String(item.status || "active").toLowerCase();

      return !["completed", "inactive"].includes(status);
    }).length;

    const newEnquiries = enquiries.filter((item) => {
      const status = String(item.status || "new").toLowerCase();

      return ["new", "pending"].includes(status);
    }).length;

    return {
      users: users.length,
      properties: properties.length,
      activeProperties,
      pendingProperties,
      projects: projects.length,
      activeProjects,
      agents: agents.length,
      builders: builders.length,
      enquiries: enquiries.length,
      newEnquiries,
    };
  }, [
    users,
    properties,
    projects,
    agents,
    builders,
    enquiries,
  ]);

  const filteredProperties = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return properties;
    }

    return properties.filter((property) =>
      [
        property.title,
        property.location,
        property.city,
        property.state,
        property.property_type,
        property.listing_type,
        property.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [properties, search]);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return users;
    }

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.phone,
        user.city,
        user.state,
        user.role,
        user.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [users, search]);

  const filteredProjects = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return projects;
    }

    return projects.filter((project) =>
      [
        project.name,
        project.title,
        project.developer,
        project.location,
        project.city,
        project.state,
        project.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [projects, search]);

  const filteredEnquiries = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return enquiries;
    }

    return enquiries.filter((enquiry) =>
      [
        enquiry.name,
        enquiry.email,
        enquiry.phone,
        enquiry.message,
        enquiry.status,
        enquiry.property_title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [enquiries, search]);

  function money(value) {
    const amount = Number(value);

    if (!amount) {
      return "Price on Request";
    }

    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }

    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }

    if (amount >= 1000) {
      return `₹${amount.toLocaleString("en-IN")}`;
    }

    return `₹${amount}`;
  }

  function imageFor(property) {
    return (
      property?.image_url ||
      property?.image ||
      property?.thumbnail ||
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80"
    );
  }

  function projectImage(project) {
    return (
      project?.image_url ||
      project?.image ||
      project?.thumbnail ||
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80"
    );
  }

  function viewProperty(id) {
    if (!id) {
      return;
    }

    window.location.hash = `property/${id}`;
  }

  function viewProject(id) {
    if (!id) {
      return;
    }

    window.location.hash = `project/${id}`;
  }

  function postProperty() {
    window.location.hash = "post-property";
  }

  function statusClass(status) {
    const value = String(status || "active").toLowerCase();

    if (
      ["approved", "active", "published", "available"].includes(
        value
      )
    ) {
      return "approved";
    }

    if (
      ["pending", "review", "draft", "new"].includes(
        value
      )
    ) {
      return "pending";
    }

    if (
      ["rejected", "blocked", "inactive", "sold"].includes(
        value
      )
    ) {
      return "rejected";
    }

    return "neutral";
  }

  function roleClass(role) {
    const value = String(role || "user").toLowerCase();

    if (value === "admin") {
      return "admin";
    }

    if (value === "builder") {
      return "builder";
    }

    if (value === "agent") {
      return "agent";
    }

    if (value === "owner") {
      return "owner";
    }

    return "user";
  }

  function getProjectName(enquiry) {
    return (
      enquiry?.property_title ||
      enquiry?.property?.title ||
      enquiry?.project_name ||
      enquiry?.project?.name ||
      "Property Enquiry"
    );
  }

  function getUserName(user) {
    return (
      user?.name ||
      user?.full_name ||
      user?.email ||
      "Unknown User"
    );
  }

  function getEnquiryName(enquiry) {
    return (
      enquiry?.name ||
      enquiry?.full_name ||
      enquiry?.contact_name ||
      "Unknown Customer"
    );
  }

  function getDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <>
        <style>{`
          .admin-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #475569;
            font-family: Inter, system-ui, sans-serif;
            font-size: 18px;
            font-weight: 800;
          }

          .admin-loading-box {
            text-align: center;
          }

          .admin-spinner {
            width: 42px;
            height: 42px;
            margin: 0 auto 14px;
            border: 4px solid #fee2e2;
            border-top-color: #dc2626;
            border-radius: 50%;
            animation: adminSpin .8s linear infinite;
          }

          @keyframes adminSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="admin-loading">
          <div className="admin-loading-box">
            <div className="admin-spinner"></div>
            <div>Loading Admin Dashboard...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .admin-page {
          min-height: 100vh;
          padding: 28px 18px 75px;
          background:
            radial-gradient(
              circle at top right,
              rgba(220,38,38,.08),
              transparent 30%
            ),
            #f8fafc;
          color: #0f172a;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .admin-container {
          width: 100%;
          max-width: 1350px;
          margin: 0 auto;
        }

        .admin-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
          padding: 30px;
          border-radius: 23px;
          color: white;
          background:
            linear-gradient(
              135deg,
              #450a0a,
              #dc2626
            );
          box-shadow:
            0 18px 50px rgba(127,29,29,.17);
        }

        .admin-hero h1 {
          margin: 0 0 7px;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.1;
          font-weight: 950;
        }

        .admin-hero p {
          margin: 0;
          max-width: 700px;
          color: #fee2e2;
          font-size: 14px;
          line-height: 1.6;
        }

        .admin-hero-actions {
          display: flex;
          gap: 8px;
        }

        .admin-btn {
          min-height: 44px;
          border: 0;
          padding: 12px 17px;
          border-radius: 10px;
          background: white;
          color: #b91c1c;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .admin-btn.secondary {
          border: 1px solid rgba(255,255,255,.25);
          background: rgba(255,255,255,.12);
          color: white;
        }

        .admin-tabs {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding: 5px;
          margin-bottom: 22px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: white;
        }

        .admin-tab {
          border: 0;
          padding: 11px 16px;
          border-radius: 9px;
          background: transparent;
          color: #64748b;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
          white-space: nowrap;
        }

        .admin-tab.active {
          background: #dc2626;
          color: white;
        }

        .admin-stats {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .admin-stat {
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: white;
          box-shadow:
            0 7px 25px rgba(15,23,42,.05);
        }

        .admin-stat-icon {
          margin-bottom: 7px;
          font-size: 20px;
        }

        .admin-stat-label {
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
        }

        .admin-stat-value {
          margin-top: 5px;
          color: #0f172a;
          font-size: 25px;
          font-weight: 950;
        }

        .admin-section {
          padding: 23px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: white;
          box-shadow:
            0 8px 28px rgba(15,23,42,.05);
        }

        .admin-section + .admin-section {
          margin-top: 22px;
        }

        .admin-section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .admin-section-head h2 {
          margin: 0;
          color: #0f172a;
          font-size: 21px;
          font-weight: 900;
        }

        .admin-section-head p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .admin-search {
          width: 300px;
          max-width: 100%;
          min-height: 42px;
          padding: 10px 13px;
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          outline: none;
          font-size: 13px;
          color: #0f172a;
        }

        .admin-search:focus {
          border-color: #dc2626;
          box-shadow:
            0 0 0 3px rgba(220,38,38,.08);
        }

        .admin-properties {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 17px;
        }

        .admin-property {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: white;
        }

        .admin-property-image {
          position: relative;
          height: 165px;
          background: #e2e8f0;
        }

        .admin-property-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .admin-status {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .admin-status.approved {
          background: #dcfce7;
          color: #166534;
        }

        .admin-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .admin-status.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .admin-status.neutral {
          background: #f1f5f9;
          color: #475569;
        }

        .admin-property-body {
          padding: 14px;
        }

        .admin-property-body h3 {
          margin: 0 0 5px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 900;
          line-height: 1.35;
        }

        .admin-property-body p {
          margin: 0 0 8px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .admin-property-price {
          margin-bottom: 11px;
          color: #dc2626;
          font-size: 16px;
          font-weight: 950;
        }

        .admin-property-btn {
          width: 100%;
          min-height: 38px;
          padding: 9px;
          border: 0;
          border-radius: 8px;
          background: #dc2626;
          color: white;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .admin-table-wrap {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        .admin-table th {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          color: #64748b;
          background: #f8fafc;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .admin-table td {
          padding: 13px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 12px;
          vertical-align: middle;
        }

        .admin-user-name {
          color: #0f172a;
          font-weight: 850;
        }

        .admin-user-email {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 10px;
        }

        .admin-role {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .admin-role.admin {
          background: #fee2e2;
          color: #991b1b;
        }

        .admin-role.builder {
          background: #ede9fe;
          color: #6d28d9;
        }

        .admin-role.agent {
          background: #dcfce7;
          color: #166534;
        }

        .admin-role.owner {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .admin-role.user {
          background: #f1f5f9;
          color: #475569;
        }

        .admin-status-inline {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 20px;
          background: #ecfdf5;
          color: #047857;
          font-size: 9px;
          font-weight: 900;
        }

        .admin-projects {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .admin-project {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: white;
        }

        .admin-project-image {
          width: 100%;
          height: 145px;
          background: #e2e8f0;
        }

        .admin-project-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .admin-project-body {
          padding: 15px;
        }

        .admin-project h3 {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 900;
        }

        .admin-project p {
          margin: 0 0 8px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .admin-project-price {
          margin-bottom: 10px;
          color: #dc2626;
          font-weight: 900;
          font-size: 14px;
        }

        .admin-project-btn {
          width: 100%;
          border: 0;
          border-radius: 8px;
          padding: 9px;
          background: #991b1b;
          color: white;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .admin-enquiries {
          display: grid;
          gap: 10px;
        }

        .admin-enquiry {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
        }

        .admin-enquiry h3 {
          margin: 0 0 4px;
          color: #0f172a;
          font-size: 13px;
          font-weight: 900;
        }

        .admin-enquiry p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .admin-enquiry-status {
          flex-shrink: 0;
          padding: 6px 9px;
          border-radius: 20px;
          background: #fef3c7;
          color: #92400e;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .admin-overview-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .admin-mini-list {
          display: grid;
          gap: 10px;
        }

        .admin-mini-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #edf2f7;
          border-radius: 10px;
          background: #f8fafc;
        }

        .admin-mini-item strong {
          color: #0f172a;
          font-size: 12px;
        }

        .admin-mini-item span {
          color: #64748b;
          font-size: 11px;
        }

        .admin-mini-number {
          min-width: 32px;
          padding: 5px 8px;
          border-radius: 20px;
          background: #fee2e2;
          color: #b91c1c;
          text-align: center;
          font-size: 10px;
          font-weight: 900;
        }

        .admin-empty {
          padding: 45px 20px;
          border: 1px dashed #cbd5e1;
          border-radius: 14px;
          text-align: center;
          color: #64748b;
        }

        .admin-empty-icon {
          margin-bottom: 9px;
          font-size: 40px;
        }

        .admin-empty h3 {
          margin: 0 0 6px;
          color: #0f172a;
        }

        .admin-empty p {
          margin: 0;
          font-size: 13px;
        }

        .admin-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 25px;
          height: 25px;
          padding: 0 7px;
          margin-left: 7px;
          border-radius: 20px;
          background: #fee2e2;
          color: #b91c1c;
          font-size: 10px;
          font-weight: 900;
        }

        @media (max-width: 1100px) {
          .admin-stats {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .admin-properties,
          .admin-projects {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .admin-overview-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .admin-page {
            padding: 20px 12px 55px;
          }

          .admin-hero {
            align-items: flex-start;
            flex-direction: column;
            padding: 22px;
          }

          .admin-hero-actions {
            width: 100%;
          }

          .admin-btn {
            flex: 1;
          }

          .admin-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .admin-section {
            padding: 16px;
          }

          .admin-section-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .admin-search {
            width: 100%;
          }

          .admin-properties,
          .admin-projects {
            grid-template-columns: 1fr;
          }

          .admin-enquiry {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 450px) {
          .admin-stats {
            grid-template-columns: 1fr;
          }

          .admin-hero-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <main className="admin-page">
        <div className="admin-container">

          {/* HERO */}
          <section className="admin-hero">
            <div>
              <h1>Admin Dashboard</h1>

              <p>
                Complete PROZPO platform overview
                and management control center.
                Manage users, properties, projects
                and enquiries from one place.
              </p>
            </div>

            <div className="admin-hero-actions">
              <button
                type="button"
                className="admin-btn"
                onClick={postProperty}
              >
                + Add Property
              </button>

              <button
                type="button"
                className="admin-btn secondary"
                onClick={loadDashboard}
              >
                ↻ Refresh
              </button>
            </div>
          </section>

          {/* TABS */}
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab ${
                activeTab === "overview"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("overview");
                setSearch("");
              }}
            >
              Overview
            </button>

            <button
              type="button"
              className={`admin-tab ${
                activeTab === "properties"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("properties");
                setSearch("");
              }}
            >
              Properties
            </button>

            <button
              type="button"
              className={`admin-tab ${
                activeTab === "users"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("users");
                setSearch("");
              }}
            >
              Users
            </button>

            <button
              type="button"
              className={`admin-tab ${
                activeTab === "projects"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("projects");
                setSearch("");
              }}
            >
              Projects
            </button>

            <button
              type="button"
              className={`admin-tab ${
                activeTab === "enquiries"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("enquiries");
                setSearch("");
              }}
            >
              Enquiries
              {stats.newEnquiries > 0 && (
                <span className="admin-count">
                  {stats.newEnquiries}
                </span>
              )}
            </button>
          </div>

          {/* STATS */}
          <section className="admin-stats">
            <div className="admin-stat">
              <div className="admin-stat-icon">👥</div>
              <div className="admin-stat-label">
                Total Users
              </div>
              <div className="admin-stat-value">
                {stats.users}
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-icon">🏠</div>
              <div className="admin-stat-label">
                Properties
              </div>
              <div className="admin-stat-value">
                {stats.properties}
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-icon">🟢</div>
              <div className="admin-stat-label">
                Active Properties
              </div>
              <div className="admin-stat-value">
                {stats.activeProperties}
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-icon">⏳</div>
              <div className="admin-stat-label">
                Pending Properties
              </div>
              <div className="admin-stat-value">
                {stats.pendingProperties}
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-icon">📩</div>
              <div className="admin-stat-label">
                New Enquiries
              </div>
              <div className="admin-stat-value">
                {stats.newEnquiries}
              </div>
            </div>
          </section>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <div className="admin-overview-grid">

                <section className="admin-section">
                  <div className="admin-section-head">
                    <div>
                      <h2>Platform Summary</h2>
                      <p>
                        Current marketplace statistics
                      </p>
                    </div>
                  </div>

                  <div className="admin-mini-list">
                    <div className="admin-mini-item">
                      <div>
                        <strong>Projects</strong>
                        <br />
                        <span>
                          Total projects listed
                        </span>
                      </div>
                      <div className="admin-mini-number">
                        {stats.projects}
                      </div>
                    </div>

                    <div className="admin-mini-item">
                      <div>
                        <strong>Active Projects</strong>
                        <br />
                        <span>
                          Ongoing / published
                        </span>
                      </div>
                      <div className="admin-mini-number">
                        {stats.activeProjects}
                      </div>
                    </div>

                    <div className="admin-mini-item">
                      <div>
                        <strong>Agents</strong>
                        <br />
                        <span>
                          Registered agents
                        </span>
                      </div>
                      <div className="admin-mini-number">
                        {stats.agents}
                      </div>
                    </div>

                    <div className="admin-mini-item">
                      <div>
                        <strong>Builders</strong>
                        <br />
                        <span>
                          Registered builders
                        </span>
                      </div>
                      <div className="admin-mini-number">
                        {stats.builders}
                      </div>
                    </div>

                    <div className="admin-mini-item">
                      <div>
                        <strong>Total Enquiries</strong>
                        <br />
                        <span>
                          Customer enquiries
                        </span>
                      </div>
                      <div className="admin-mini-number">
                        {stats.enquiries}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="admin-section">
                  <div className="admin-section-head">
                    <div>
                      <h2>Latest Enquiries</h2>
                      <p>
                        Recent customer activity
                      </p>
                    </div>
                  </div>

                  {enquiries.length === 0 ? (
                    <div className="admin-empty">
                      <div className="admin-empty-icon">
                        📩
                      </div>
                      <h3>No Enquiries Yet</h3>
                      <p>
                        Customer enquiries will appear
                        here.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-enquiries">
                      {enquiries
                        .slice(0, 5)
                        .map((enquiry, index) => (
                          <div
                            className="admin-enquiry"
                            key={
                              enquiry.id ||
                              `enquiry-${index}`
                            }
                          >
                            <div>
                              <h3>
                                {getEnquiryName(
                                  enquiry
                                )}
                              </h3>

                              <p>
                                {getProjectName(
                                  enquiry
                                )}
                              </p>

                              <p>
                                {getDate(
                                  enquiry.created_at
                                )}
                              </p>
                            </div>

                            <span className="admin-enquiry-status">
                              {enquiry.status ||
                                "New"}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </section>

              </div>

              <section className="admin-section">
                <div className="admin-section-head">
                  <div>
                    <h2>Recent Properties</h2>
                    <p>
                      Latest property listings on PROZPO
                    </p>
                  </div>

                  <button
                    type="button"
                    className="admin-property-btn"
                    style={{
                      width: "auto",
                      padding: "10px 15px",
                    }}
                    onClick={() =>
                      setActiveTab("properties")
                    }
                  >
                    View All Properties
                  </button>
                </div>

                {properties.length === 0 ? (
                  <div className="admin-empty">
                    <div className="admin-empty-icon">
                      🏠
                    </div>
                    <h3>No Properties Found</h3>
                    <p>
                      Property listings will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="admin-properties">
                    {properties
                      .slice(0, 6)
                      .map((property, index) => (
                        <article
                          className="admin-property"
                          key={
                            property.id ||
                            `property-${index}`
                          }
                        >
                          <div className="admin-property-image">
                            <img
                              src={imageFor(property)}
                              alt={
                                property.title ||
                                "Property"
                              }
                              loading="lazy"
                            />

                            <span
                              className={`admin-status ${statusClass(
                                property.status
                              )}`}
                            >
                              {property.status ||
                                "Active"}
                            </span>
                          </div>

                          <div className="admin-property-body">
                            <h3>
                              {property.title ||
                                "Untitled Property"}
                            </h3>

                            <p>
                              📍{" "}
                              {property.location ||
                                property.city ||
                                "Location unavailable"}
                            </p>

                            <div className="admin-property-price">
                              {money(property.price)}
                            </div>

                            <button
                              type="button"
                              className="admin-property-btn"
                              onClick={() =>
                                viewProperty(
                                  property.id
                                )
                              }
                            >
                              View Property
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* PROPERTIES */}
          {activeTab === "properties" && (
            <section className="admin-section">
              <div className="admin-section-head">
                <div>
                  <h2>
                    Property Management
                  </h2>
                  <p>
                    Review and manage marketplace
                    property listings.
                  </p>
                </div>

                <input
                  className="admin-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search properties..."
                />
              </div>

              {filteredProperties.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">
                    🔎
                  </div>
                  <h3>
                    No Properties Found
                  </h3>
                  <p>
                    Try another search term.
                  </p>
                </div>
              ) : (
                <div className="admin-properties">
                  {filteredProperties.map(
                    (property, index) => (
                      <article
                        className="admin-property"
                        key={
                          property.id ||
                          `property-${index}`
                        }
                      >
                        <div className="admin-property-image">
                          <img
                            src={imageFor(property)}
                            alt={
                              property.title ||
                              "Property"
                            }
                            loading="lazy"
                          />

                          <span
                            className={`admin-status ${statusClass(
                              property.status
                            )}`}
                          >
                            {property.status ||
                              "Active"}
                          </span>
                        </div>

                        <div className="admin-property-body">
                          <h3>
                            {property.title ||
                              "Untitled Property"}
                          </h3>

                          <p>
                            📍{" "}
                            {property.location ||
                              property.city ||
                              "Location unavailable"}
                          </p>

                          <p>
                            {property.property_type ||
                              "Property"}{" "}
                            •{" "}
                            {property.listing_type ||
                              "Sale"}
                          </p>

                          <div className="admin-property-price">
                            {money(property.price)}
                          </div>

                          <button
                            type="button"
                            className="admin-property-btn"
                            onClick={() =>
                              viewProperty(
                                property.id
                              )
                            }
                          >
                            View Property
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <section className="admin-section">
              <div className="admin-section-head">
                <div>
                  <h2>User Management</h2>
                  <p>
                    Registered PROZPO users and account
                    roles.
                  </p>
                </div>

                <input
                  className="admin-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search users..."
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">
                    👥
                  </div>
                  <h3>
                    No Users Found
                  </h3>
                  <p>
                    No users match your search.
                  </p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>City</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map(
                        (user, index) => (
                          <tr
                            key={
                              user.id ||
                              user.user_id ||
                              `user-${index}`
                            }
                          >
                            <td>
                              <div className="admin-user-name">
                                {getUserName(user)}
                              </div>

                              {user.email && (
                                <div className="admin-user-email">
                                  {user.email}
                                </div>
                              )}
                            </td>

                            <td>
                              {user.phone ||
                                "Not provided"}
                            </td>

                            <td>
                              <span
                                className={`admin-role ${roleClass(
                                  user.role
                                )}`}
                              >
                                {user.role ||
                                  "user"}
                              </span>
                            </td>

                            <td>
                              {user.city ||
                                user.state ||
                                "—"}
                            </td>

                            <td>
                              <span className="admin-status-inline">
                                {user.status ||
                                  "Active"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* PROJECTS */}
          {activeTab === "projects" && (
            <section className="admin-section">
              <div className="admin-section-head">
                <div>
                  <h2>Project Management</h2>
                  <p>
                    Builder projects and developments
                    listed on PROZPO.
                  </p>
                </div>

                <input
                  className="admin-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search projects..."
                />
              </div>

              {filteredProjects.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">
                    🏗️
                  </div>
                  <h3>
                    No Projects Found
                  </h3>
                  <p>
                    Projects will appear here.
                  </p>
                </div>
              ) : (
                <div className="admin-projects">
                  {filteredProjects.map(
                    (project, index) => (
                      <article
                        className="admin-project"
                        key={
                          project.id ||
                          `project-${index}`
                        }
                      >
                        <div className="admin-project-image">
                          <img
                            src={projectImage(project)}
                            alt={
                              project.name ||
                              "Project"
                            }
                            loading="lazy"
                          />
                        </div>

                        <div className="admin-project-body">
                          <h3>
                            {project.name ||
                              project.title ||
                              "Untitled Project"}
                          </h3>

                          <p>
                            📍{" "}
                            {project.location ||
                              project.city ||
                              "Location unavailable"}
                          </p>

                          <p>
                            Developer:{" "}
                            {project.developer ||
                              "Not specified"}
                          </p>

                          <div className="admin-project-price">
                            {money(
                              project.price_from
                            )}
                          </div>

                          <button
                            type="button"
                            className="admin-project-btn"
                            onClick={() =>
                              viewProject(
                                project.id
                              )
                            }
                          >
                            View Project
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* ENQUIRIES */}
          {activeTab === "enquiries" && (
            <section className="admin-section">
              <div className="admin-section-head">
                <div>
                  <h2>Enquiry Management</h2>
                  <p>
                    Customer enquiries received across
                    the marketplace.
                  </p>
                </div>

                <input
                  className="admin-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search enquiries..."
                />
              </div>

              {filteredEnquiries.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">
                    📩
                  </div>
                  <h3>
                    No Enquiries Found
                  </h3>
                  <p>
                    Customer enquiries will appear here.
                  </p>
                </div>
              ) : (
                <div className="admin-enquiries">
                  {filteredEnquiries.map(
                    (enquiry, index) => (
                      <div
                        className="admin-enquiry"
                        key={
                          enquiry.id ||
                          `enquiry-${index}`
                        }
                      >
                        <div>
                          <h3>
                            {getEnquiryName(
                              enquiry
                            )}
                          </h3>

                          <p>
                            Property:{" "}
                            {getProjectName(
                              enquiry
                            )}
                          </p>

                          <p>
                            Phone:{" "}
                            {enquiry.phone ||
                              "Not provided"}
                          </p>

                          {enquiry.email && (
                            <p>
                              Email:{" "}
                              {enquiry.email}
                            </p>
                          )}

                          {enquiry.message && (
                            <p>
                              Message:{" "}
                              {enquiry.message}
                            </p>
                          )}

                          <p>
                            Received:{" "}
                            {getDate(
                              enquiry.created_at
                            )}
                          </p>
                        </div>

                        <span className="admin-enquiry-status">
                          {enquiry.status ||
                            "New"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          )}

        </div>
      </main>
    </>
  );
}
