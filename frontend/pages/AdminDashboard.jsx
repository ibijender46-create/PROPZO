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

      const extract = (result, key) => {
        if (result.status !== "fulfilled") {
          return [];
        }

        const data = result.value;

        return (
          data?.[key] ||
          data?.data ||
          []
        );
      };

      setProperties(
        extract(results[0], "properties")
      );

      setProjects(
        extract(results[1], "projects")
      );

      setAgents(
        extract(results[2], "agents")
      );

      setBuilders(
        extract(results[3], "builders")
      );

      setEnquiries(
        extract(results[4], "enquiries")
      );

      setUsers(
        extract(results[5], "users")
      );
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const activeProperties =
      properties.filter(
        (item) =>
          !["sold", "inactive", "rejected"].includes(
            String(
              item.status || "active"
            ).toLowerCase()
          )
      ).length;

    const pendingProperties =
      properties.filter((item) =>
        ["pending", "review", "draft"].includes(
          String(
            item.status || ""
          ).toLowerCase()
        )
      ).length;

    const activeProjects =
      projects.filter((item) =>
        !["completed", "inactive"].includes(
          String(
            item.status || "active"
          ).toLowerCase()
        )
      ).length;

    const newEnquiries =
      enquiries.filter((item) =>
        ["new", "pending"].includes(
          String(
            item.status || "new"
          ).toLowerCase()
        )
      ).length;

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
    const keyword =
      search.toLowerCase().trim();

    if (!keyword) return properties;

    return properties.filter((property) =>
      [
        property.title,
        property.location,
        property.city,
        property.property_type,
        property.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [properties, search]);

  const filteredUsers = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    if (!keyword) return users;

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.phone,
        user.role,
        user.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [users, search]);

  function money(value) {
    const amount = Number(value);

    if (!amount) {
      return "Price on Request";
    }

    if (amount >= 10000000) {
      return `₹${(
        amount / 10000000
      ).toFixed(2)} Cr`;
    }

    if (amount >= 100000) {
      return `₹${(
        amount / 100000
      ).toFixed(2)} L`;
    }

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  }

  function imageFor(property) {
    return (
      property.image_url ||
      property.image ||
      property.thumbnail ||
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80"
    );
  }

  function viewProperty(id) {
    if (!id) return;

    window.location.hash =
      `property/${id}`;
  }

  function viewProject(id) {
    if (!id) return;

    window.location.hash =
      `project/${id}`;
  }

  function postProperty() {
    window.location.hash =
      "post-property";
  }

  function statusClass(status) {
    const value = String(
      status || "active"
    ).toLowerCase();

    if (
      ["approved", "active", "published"].includes(
        value
      )
    ) {
      return "approved";
    }

    if (
      ["pending", "review", "draft"].includes(
        value
      )
    ) {
      return "pending";
    }

    if (
      ["rejected", "blocked", "inactive"].includes(
        value
      )
    ) {
      return "rejected";
    }

    return "neutral";
  }

  function roleClass(role) {
    const value = String(
      role || "user"
    ).toLowerCase();

    if (value === "admin") return "admin";
    if (value === "builder") return "builder";
    if (value === "agent") return "agent";
    if (value === "owner") return "owner";

    return "user";
  }

  if (loading) {
    return (
      <>
        <style>{`
          .admin-loading {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #475569;
            font-size: 18px;
            font-weight: 800;
          }
        `}</style>

        <div className="admin-loading">
          Loading Admin Dashboard...
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
        }

        .admin-container {
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
            0 18px 50px
            rgba(127,29,29,.17);
        }

        .admin-hero h1 {
          margin: 0 0 7px;
          font-size: clamp(
            28px,
            4vw,
            40px
          );
          font-weight: 950;
        }

        .admin-hero p {
          margin: 0;
          color: #fee2e2;
          font-size: 14px;
          line-height: 1.6;
        }

        .admin-hero-actions {
          display: flex;
          gap: 8px;
        }

        .admin-btn {
          border: 0;
          padding: 13px 17px;
          border-radius: 10px;
          background: white;
          color: #b91c1c;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .admin-btn.secondary {
          border: 1px solid
            rgba(255,255,255,.25);
          background:
            rgba(255,255,255,.12);
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
            0 7px 25px
            rgba(15,23,42,.05);
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
            0 8px 28px
            rgba(15,23,42,.05);
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

        .admin-search {
          width: 300px;
          max-width: 100%;
          padding: 11px 13px;
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          outline: none;
          font-size: 13px;
        }

        .admin-search:focus {
          border-color: #dc2626;
          box-shadow:
            0 0 0 3px
            rgba(220,38,38,.08);
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
        }

        .admin-property-body p {
          margin: 0 0 8px;
          color: #64748b;
          font-size: 11px;
        }

        .admin-property-price {
          margin-bottom: 11px;
          color: #dc2626;
          font-size: 16px;
          font-weight: 950;
        }

        .admin-property-btn {
          width: 100%;
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
          min-width: 720px;
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
        }

        .admin-user-name {
          color: #0f172a;
          font-weight: 850;
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
          padding: 17px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
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
        }

        .admin-project-price {
          color: #dc2626;
          font-weight: 900;
          font-size: 14px;
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
        }

        .admin-empty {
          padding: 45px 20px;
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
      `}</style>

      <main className="admin-page">
        <div className="admin-container">

          <section className="admin-hero">

            <div>
              <h1>
                Admin Dashboard
              </h1>

              <p>
                Complete PROZPO platform
                overview and management
                control center.
              </p>
            </div>

            <div className="admin-hero-actions">

              <button
                className="admin-btn"
                onClick={postProperty}
              >
                + Add Property
              </button>

              <button
                className="admin-btn secondary"
                onClick={loadDashboard}
              >
                ↻ Refresh
              </button>

            </div>

          </section>

          <div className="admin-tabs">

            <button
              className={`admin-tab ${
                activeTab === "overview"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("overview")
              }
            >
              Overview
            </button>

            <button
              className={`admin-tab ${
                activeTab === "properties"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("properties")
              }
            >
              Properties
            </button>

            <button
              className={`admin-tab ${
                activeTab === "users"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("users")
              }
            >
              Users
            </button>

            <button
              className={`admin-tab ${
                activeTab === "projects"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("projects")
              }
            >
              Projects
            </button>

            <button
              className={`admin-tab ${
                activeTab === "enquiries"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("enquiries")
              }
            >
              Enquiries
            </button>

          </div>

          <section className="admin-stats">

            <div className="admin-stat">
              <div className="admin-stat-icon">
                👥
              </div>
              <div className="admin-stat-label">
                Total Users
              </div>
              <div className="admin-stat-value">
                {stats.users}
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-icon">
                🏠
              </div>
              <div className="admin-stat-label">
                Properties
              </div>
              <div cla
