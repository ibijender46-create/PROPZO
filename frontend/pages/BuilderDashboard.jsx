import React, { useEffect, useMemo, useState } from "react";
import {
  getProjects,
  getProperties,
  getEnquiries,
} from "../src/api";

export default function BuilderDashboard() {
  const [projects, setProjects] = useState([]);
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboard();
  }, []);

  function normalizeList(result, keys = []) {
    if (Array.isArray(result)) return result;

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    for (const key of keys) {
      if (Array.isArray(result?.[key])) {
        return result[key];
      }
    }

    return [];
  }

  async function loadDashboard() {
    try {
      setRefreshing(true);

      const results = await Promise.allSettled([
        getProjects(),
        getProperties(),
        getEnquiries(),
      ]);

      if (results[0].status === "fulfilled") {
        setProjects(
          normalizeList(results[0].value, [
            "projects",
          ])
        );
      } else {
        setProjects([]);
      }

      if (results[1].status === "fulfilled") {
        setProperties(
          normalizeList(results[1].value, [
            "properties",
          ])
        );
      } else {
        setProperties([]);
      }

      if (results[2].status === "fulfilled") {
        setEnquiries(
          normalizeList(results[2].value, [
            "enquiries",
          ])
        );
      } else {
        setEnquiries([]);
      }
    } catch (error) {
      console.error(
        "Builder dashboard error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filteredProjects = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    if (!keyword) return projects;

    return projects.filter((project) =>
      [
        project.name,
        project.title,
        project.location,
        project.city,
        project.state,
        project.developer,
        project.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [projects, search]);

  const filteredProperties = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    if (!keyword) return properties;

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

  const stats = useMemo(() => {
    const activeProjects = projects.filter(
      (project) => {
        const status = String(
          project.status || "active"
        ).toLowerCase();

        return (
          status === "active" ||
          status === "ongoing" ||
          status.includes("construction") ||
          status.includes("launch")
        );
      }
    ).length;

    const completed = projects.filter(
      (project) => {
        const status = String(
          project.status || ""
        ).toLowerCase();

        return (
          status === "completed" ||
          status === "complete"
        );
      }
    ).length;

    const availableProperties =
      properties.filter((property) => {
        const status = String(
          property.status || "active"
        ).toLowerCase();

        return (
          status !== "sold" &&
          status !== "inactive"
        );
      }).length;

    return {
      projects: projects.length,
      activeProjects,
      completed,
      properties: properties.length,
      availableProperties,
      enquiries: enquiries.length,
    };
  }, [
    projects,
    properties,
    enquiries,
  ]);

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

  function projectImage(project) {
    return (
      project.image_url ||
      project.image ||
      project.thumbnail ||
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
    );
  }

  function propertyImage(property) {
    return (
      property.image_url ||
      property.image ||
      property.thumbnail ||
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80"
    );
  }

  function projectStatus(status) {
    const value = String(
      status || "Active"
    ).toLowerCase();

    if (
      value.includes("complete")
    ) {
      return "completed";
    }

    if (
      value.includes("ongoing") ||
      value.includes("construction")
    ) {
      return "ongoing";
    }

    return "active";
  }

  function projectStatusText(status) {
    const type = projectStatus(status);

    if (type === "completed") {
      return "Completed";
    }

    if (type === "ongoing") {
      return "Ongoing";
    }

    return "Active";
  }

  function viewProject(id) {
    if (!id) return;

    window.location.hash =
      `project/${id}`;
  }

  function viewProperty(id) {
    if (!id) return;

    window.location.hash =
      `property/${id}`;
  }

  function postProperty() {
    window.location.hash =
      "post-property";
  }

  function enquiryWhatsApp(enquiry) {
    const phone =
      enquiry?.phone ||
      enquiry?.mobile;

    if (!phone) {
      window.alert(
        "Customer phone number is not available."
      );
      return;
    }

    let cleanPhone = String(phone).replace(
      /[^0-9]/g,
      ""
    );

    if (
      cleanPhone.length === 10
    ) {
      cleanPhone = `91${cleanPhone}`;
    }

    window.open(
      `https://wa.me/${cleanPhone}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function enquiryName(enquiry) {
    return (
      enquiry?.name ||
      enquiry?.customer_name ||
      "Property Enquiry"
    );
  }

  function enquiryMessage(enquiry) {
    return (
      enquiry?.message ||
      "Customer has submitted a property enquiry."
    );
  }

  if (loading) {
    return (
      <>
        <style>{`
          .builder-loading {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #475569;
            font-family: Inter, system-ui, sans-serif;
            font-size: 18px;
            font-weight: 800;
          }

          .builder-loader {
            width: 38px;
            height: 38px;
            margin-right: 12px;
            border: 4px solid #ede9fe;
            border-top-color: #7c3aed;
            border-radius: 50%;
            animation: builderSpin .8s linear infinite;
          }

          @keyframes builderSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="builder-loading">
          <div className="builder-loader"></div>
          Loading Builder Dashboard...
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .builder-page {
          min-height: 100vh;
          padding: 30px 18px 75px;
          background:
            radial-gradient(
              circle at top left,
              rgba(124,58,237,.09),
              transparent 32%
            ),
            #f8fafc;
          color: #172033;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .builder-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
        }

        .builder-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
          padding: 30px;
          border-radius: 23px;
          color: #fff;
          background:
            linear-gradient(
              135deg,
              #3b0764 0%,
              #6d28d9 55%,
              #8b5cf6 100%
            );
          box-shadow:
            0 18px 50px
            rgba(88,28,135,.17);
        }

        .builder-hero h1 {
          margin: 0 0 7px;
          font-size: clamp(28px,4vw,40px);
          line-height: 1.1;
          font-weight: 950;
        }

        .builder-hero p {
          margin: 0;
          max-width: 650px;
          color: #ede9fe;
          font-size: 14px;
          line-height: 1.6;
        }

        .builder-hero-actions {
          display: flex;
          gap: 8px;
        }

        .builder-btn-primary,
        .builder-btn-secondary {
          min-height: 45px;
          padding: 12px 17px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .builder-btn-primary {
          border: 0;
          background: #fff;
          color: #6d28d9;
        }

        .builder-btn-secondary {
          border: 1px solid rgba(255,255,255,.28);
          background: rgba(255,255,255,.12);
          color: #fff;
        }

        .builder-btn-primary:hover,
        .builder-btn-secondary:hover {
          transform: translateY(-1px);
        }

        .builder-tabs {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding: 5px;
          margin-bottom: 22px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #fff;
        }

        .builder-tab {
          border: 0;
          padding: 11px 17px;
          border-radius: 9px;
          background: transparent;
          color: #64748b;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          white-space: nowrap;
        }

        .builder-tab.active {
          background: #7c3aed;
          color: #fff;
        }

        .builder-stats {
          display: grid;
          grid-template-columns:
            repeat(6,minmax(0,1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .builder-stat {
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: #fff;
          box-shadow:
            0 7px 25px
            rgba(15,23,42,.05);
        }

        .builder-stat-icon {
          margin-bottom: 7px;
          font-size: 21px;
        }

        .builder-stat-label {
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .3px;
        }

        .builder-stat-value {
          margin-top: 5px;
          color: #0f172a;
          font-size: 25px;
          font-weight: 950;
        }

        .builder-section {
          padding: 23px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #fff;
          box-shadow:
            0 8px 28px
            rgba(15,23,42,.05);
        }

        .builder-section + .builder-section {
          margin-top: 22px;
        }

        .builder-section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .builder-section-head h2 {
          margin: 0;
          color: #0f172a;
          font-size: 21px;
          font-weight: 900;
        }

        .builder-section-head p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .builder-search {
          width: 290px;
          max-width: 100%;
          min-height: 43px;
          padding: 11px 13px;
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          outline: none;
          font-size: 13px;
          background: #fff;
        }

        .builder-search:focus {
          border-color: #7c3aed;
          box-shadow:
            0 0 0 3px
            rgba(124,58,237,.08);
        }

        .builder-projects {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 18px;
        }

        .builder-project {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          transition: .2s ease;
        }

        .builder-project:hover {
          transform: translateY(-4px);
          box-shadow:
            0 18px 35px
            rgba(15,23,42,.10);
        }

        .builder-project-image {
          position: relative;
          height: 190px;
          background: #e2e8f0;
        }

        .builder-project-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .builder-project-status {
          position: absolute;
          top: 11px;
          left: 11px;
          padding: 6px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .builder-project-status.active {
          background: #ede9fe;
          color: #6d28d9;
        }

        .builder-project-status.ongoing {
          background: #fef3c7;
          color: #92400e;
        }

        .builder-project-status.completed {
          background: #dcfce7;
          color: #166534;
        }

        .builder-project-body {
          padding: 16px;
        }

        .builder-project-title {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 17px;
          font-weight: 900;
        }

        .builder-project-location {
          margin: 0 0 12px;
          color: #64748b;
          font-size: 12px;
        }

        .builder-project-price {
          color: #6d28d9;
          font-size: 17px;
          font-weight: 950;
        }

        .builder-project-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 12px 0;
        }

        .builder-meta {
          padding: 5px 7px;
          border-radius: 7px;
          background: #f5f3ff;
          color: #6d28d9;
          font-size: 10px;
          font-weight: 800;
        }

        .builder-view {
          width: 100%;
          padding: 10px;
          border: 0;
          border-radius: 9px;
          background: #7c3aed;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .builder-view:hover {
          background: #6d28d9;
        }

        .builder-properties {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 18px;
        }

        .builder-property {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: #fff;
          transition: .2s ease;
        }

        .builder-property:hover {
          transform: translateY(-4px);
          box-shadow:
            0 18px 35px
            rgba(15,23,42,.10);
        }

        .builder-property-image {
          position: relative;
          height: 160px;
          background: #e2e8f0;
        }

        .builder-property-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .builder-property-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 5px 8px;
          border-radius: 20px;
          background: #fff;
          color: #6d28d9;
          font-size: 9px;
          font-weight: 900;
        }

        .builder-property-body {
          padding: 14px;
        }

        .builder-property-body h3 {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 900;
        }

        .builder-property-body p {
          margin: 0 0 8px;
          color: #64748b;
          font-size: 11px;
        }

        .builder-property-price {
          color: #6d28d9;
          font-size: 16px;
          font-weight: 950;
        }

        .builder-property-details {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 10px 0;
        }

        .builder-property-detail {
          padding: 5px 7px;
          border-radius: 7px;
          background: #f8fafc;
          color: #475569;
          font-size: 10px;
          font-weight: 800;
        }

        .builder-enquiries {
          display: grid;
          gap: 11px;
        }

        .builder-enquiry {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .builder-enquiry-main {
          min-width: 0;
        }

        .builder-enquiry h3 {
          margin: 0 0 5px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 900;
        }

        .builder-enquiry p {
          margin: 0 0 4px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .builder-enquiry-message {
          color: #475569 !important;
        }

        .builder-enquiry-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .builder-status {
          padding: 6px 9px;
          border-radius: 20px;
          background: #f5f3ff;
          color: #6d28d9;
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
        }

        .builder-wa {
          border: 0;
          padding: 8px 11px;
          border-radius: 8px;
          background: #16a34a;
          color: #fff;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
          white-space: nowrap;
        }

        .builder-wa:hover {
          background: #15803d;
        }

        .builder-empty {
          padding: 45px 20px;
          text-align: center;
          color: #64748b;
        }

        .builder-empty-icon {
          margin-bottom: 9px;
          font-size: 40px;
        }

        .builder-empty h3 {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 18px;
        }

        .builder-empty p {
          margin: 0 0 16px;
          font-size: 13px;
        }

        .builder-empty-button {
          border: 0;
          border-radius: 9px;
          padding: 10px 15px;
          background: #7c3aed;
          color: #fff;
          font-weight: 900;
          cursor: pointer;
        }

        .builder-refreshing {
          opacity: .65;
          pointer-events: none;
        }

        @media (max-width: 1100px) {
          .builder-stats {
            grid-template-columns:
              repeat(3,minmax(0,1fr));
          }

          .builder-projects,
          .builder-properties {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }
        }

        @media (max-width: 700px) {
          .builder-page {
            padding: 20px 12px 55px;
          }

          .builder-hero {
            align-items: flex-start;
            flex-direction: column;
            padding: 22px;
          }

          .builder-hero-actions {
            width: 100%;
          }

          .builder-btn-primary,
          .builder-btn-secondary {
            flex: 1;
          }

          .builder-stats {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .builder-section {
            padding: 16px;
          }

          .builder-section-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .builder-search {
            width: 100%;
          }

          .builder-projects,
          .builder-properties {
            grid-template-columns: 1fr;
          }

          .builder-enquiry {
            align-items: flex-start;
            flex-direction: column;
          }

          .builder-enquiry-actions {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 430px) {
          .builder-stats {
            grid-template-columns: 1fr;
          }

          .builder-hero-actions {
            flex-direction: column;
          }

          .builder-btn-primary,
          .builder-btn-secondary {
            width: 100%;
          }
        }
      `}</style>

      <main className="builder-page">
        <div className="builder-container">

          {/* HERO */}

          <section className="builder-hero">
            <div>
              <h1>
                Builder Dashboard
              </h1>

              <p>
                Manage your projects,
                properties and customer
                enquiries from your PROZPO
                builder panel.
              </p>
            </div>

            <div className="builder-hero-actions">
              <button
                type="button"
                className="builder-btn-primary"
                onClick={postProperty}
              >
                + Add Property
              </button>

              <button
                type="button"
                className="builder-btn-secondary"
                onClick={loadDashboard}
                disabled={refreshing}
              >
                {refreshing
                  ? "Refreshing..."
                  : "↻ Refresh"}
              </button>
            </div>
          </section>

          {/* TABS */}

          <div className="builder-tabs">
            {[
              ["overview", "Overview"],
              ["projects", "Projects"],
              ["properties", "Properties"],
              ["enquiries", "Enquiries"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`builder-tab ${
                  activeTab === value
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(value)
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* STATS */}

          <section className="builder-stats">
            <div className="builder-stat">
              <div className="builder-stat-icon">
                🏗️
              </div>
              <div className="builder-stat-label">
                Total Projects
              </div>
              <div className="builder-stat-value">
                {stats.projects}
              </div>
            </div>

            <div className="builder-stat">
              <div className="builder-stat-icon">
                🚧
              </div>
              <div className="builder-stat-label">
                Active Projects
              </div>
              <div className="builder-stat-value">
                {stats.activeProjects}
              </div>
            </div>

            <div className="builder-stat">
              <div className="builder-stat-icon">
                ✅
              </div>
              <div className="builder-stat-label">
                Completed
              </div>
              <div className="builder-stat-value">
                {stats.completed}
              </div>
            </div>

            <div className="builder-stat">
              <div className="builder-stat-icon">
                🏠
              </div>
              <div className="builder-stat-label">
                Properties
              </div>
              <div className="builder-stat-value">
                {stats.properties}
              </div>
            </div>

            <div className="builder-stat">
              <div className="builder-stat-icon">
                🟢
              </div>
              <div className="builder-stat-label">
                Available
              </div>
              <div className="builder-stat-value">
                {stats.availableProperties}
              </div>
            </div>

            <div className="builder-stat">
              <div className="builder-stat-icon">
                📩
              </div>
              <div className="builder-stat-label">
                Enquiries
              </div>
              <div className="builder-stat-value">
                {stats.enquiries}
              </div>
            </div>
          </section>

          {/* OVERVIEW */}

          {activeTab === "overview" && (
            <>
              <section className="builder-section">
                <div className="builder-section-head">
                  <div>
                    <h2>
                      Recent Projects
                    </h2>
                    <p>
                      Manage your latest
                      development projects.
                    </p>
                  </div>

                  <input
                    className="builder-search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search projects..."
                  />
                </div>

                {filteredProjects.length ===
                0 ? (
                  <div className="builder-empty">
                    <div className="builder-empty-icon">
                      🏗️
                    </div>

                    <h3>
                      No projects found
                    </h3>

                    <p>
                      Add projects to start
                      managing your builder
                      portfolio.
                    </p>
                  </div>
                ) : (
                  <div className="builder-projects">
                    {filteredProjects
                      .slice(0, 6)
                      .map((project) => (
                        <article
                          className="builder-project"
                          key={
                            project.id ||
                            project.name
                          }
                        >
                          <div className="builder-project-image">
                            <img
                              src={projectImage(
                                project
                              )}
                              alt={
                                project.name ||
                                "PROZPO Project"
                              }
                              onError={(
                                event
                              ) => {
                                event.currentTarget.src =
                                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80";
                              }}
                            />

                            <span
                              className={`builder-project-status ${projectStatus(
                                project.status
                              )}`}
                            >
                              {projectStatusText(
                                project.status
                              )}
                            </span>
                          </div>

                          <div className="builder-project-body">
                            <h3 className="builder-project-title">
                              {project.name ||
                                project.title ||
                                "Untitled Project"}
                            </h3>

                            <p className="builder-project-location">
                              📍{" "}
                              {project.location ||
                                project.city ||
                                "Location not available"}
                            </p>

                            <div className="builder-project-price">
                              {project.price_from
                                ? money(
                                    project.price_from
                                  )
                                : "Price on Request"}
                              {project.price_to
                                ? ` - ${money(
                                    project.price_to
                                  )}`
                                : ""}
                            </div>

                            <div className="builder-project-meta">
                              {project.developer && (
                                <span className="builder-meta">
                                  🏢{" "}
                                  {
                                    project.developer
                                  }
                                </span>
                              )}

                              {project.city && (
                                <span className="builder-meta">
                                  📍{" "}
                                  {project.city}
                                </span>
                              )}

                              <span className="builder-meta">
                                PROZPO
                              </span>
                            </div>

                            <button
                              type="button"
                              className="builder-view"
                              onClick={() =>
                                viewProject(
                                  project.id
                                )
                              }
                            >
                              View Project →
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                )}
              </section>

              <section className="builder-section">
                <div className="builder-section-head">
                  <div>
                    <h2>
                      Latest Properties
                    </h2>
                    <p>
                      Properties connected
                      with your builder account.
                    </p>
                  </div>
                </div>

                {properties.length === 0 ? (
                  <div className="builder-empty">
                    <div className="builder-empty-icon">
                      🏠
                    </div>

                    <h3>
                      No properties found
                    </h3>

                    <p>
                      Add your first property
                      to PROZPO.
                    </p>

                    <button
                      type="button"
                      className="builder-empty-button"
                      onClick={postProperty}
                    >
                      + Add Property
                    </button>
                  </div>
                ) : (
                  <div className="builder-properties">
                    {properties
                      .slice(0, 6)
                      .map((property) => (
                        <article
                          className="builder-property"
                          key={
                            property.id ||
                            property.title
                          }
                        >
                          <div className="builder-property-image">
                            <img
                              src={propertyImage(
                                property
                              )}
                              alt={
                                property.title ||
                                "PROZPO Property"
                              }
                              onError={(
                                event
                              ) => {
                                event.currentTarget.src =
                                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80";
                              }}
                            />

                            <span className="builder-property-badge">
                              {property.listing_type ||
                                "PROPERTY"}
                            </span>
                          </div>

                          <div className="builder-property-body">
                            <h3>
                              {property.title ||
                                "Untitled Property"}
                            </h3>

                            <p>
                              📍{" "}
                              {property.location ||
                                property.city ||
                                "Location not available"}
                            </p>

                            <div className="builder-property-price">
                              {money(
                                property.price
                              )}
                            </div>

                            <div className="builder-property-details">
                              {property.bedrooms && (
                                <span className="builder-property-detail">
                                  🛏{" "}
                                  {
                                    property.bedrooms
                                  }{" "}
                                  BHK
                                </span>
                              )}

                              {property.bathrooms && (
                                <span className="builder-property-detail">
                                  🛁{" "}
                                  {
                                    property.bathrooms
                                  }{" "}
                                  Bath
                                </span>
                              )}

                              {property.area && (
                                <span className="builder-property-detail">
                                  ▣{" "}
                                  {
                                    property.area
                                  }{" "}
                                  {property.area_unit ||
                                    "sq ft"}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              className="builder-view"
                              onClick={() =>
                                viewProperty(
                                  property.id
                                )
                              }
                            >
                              View Property →
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* PROJECTS */}

          {activeTab === "projects" && (
            <section className="builder-section">
              <div className="builder-section-head">
                <div>
                  <h2>
                    All Builder Projects
                  </h2>
                  <p>
                    Search and manage all
                    projects.
                  </p>
                </div>

                <input
                  className="builder-search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search projects..."
                />
              </div>

              {filteredProjects.length ===
              0 ? (
                <div className="builder-empty">
                  <div className="builder-empty-icon">
                    🏗️
                  </div>

                  <h3>
                    No projects found
                  </h3>

                  <p>
                    No project matches your
                    search.
                  </p>
                </div>
              ) : (
                <div className="builder-projects">
                  {filteredProjects.map(
                    (project) => (
                      <article
                        className="builder-project"
                        key={
                          project.id ||
                          project.name
                        }
                      >
                        <div className="builder-project-image">
                          <img
                            src={projectImage(
                              project
                            )}
                            alt={
                              project.name ||
                              "Project"
                            }
                          />

                          <span
                            className={`builder-project-status ${projectStatus(
                              project.status
                            )}`}
                          >
                            {projectStatusText(
                              project.status
                            )}
                          </span>
                        </div>

                        <div className="builder-project-body">
                          <h3 className="builder-project-title">
                            {project.name ||
                              project.title ||
                              "Untitled Project"}
                          </h3>

                          <p className="builder-project-location">
                            📍{" "}
                            {project.location ||
                              project.city ||
                              "Location not available"}
                          </p>

                          <div className="builder-project-price">
                            {project.price_from
                              ? money(
                                  project.price_from
                                )
                              : "Price on Request"}
                            {project.price_to
                              ? ` - ${money(
                                  project.price_to
                                )}`
                              : ""}
                          </div>

                          <div className="builder-project-meta">
                            {project.developer && (
                              <span className="builder-meta">
                                🏢{" "}
                                {
                                  project.developer
                                }
                              </span>
                            )}

                            {project.state && (
                              <span className="builder-meta">
                                📍{" "}
                                {project.state}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="builder-view"
                            onClick={() =>
                              viewProject(
                                project.id
                              )
                            }
                          >
                            View Project →
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* PROPERTIES */}

          {activeTab === "properties" && (
            <section className="builder-section">
              <div className="builder-section-head">
                <div>
                  <h2>
                    Builder Properties
                  </h2>
                  <p>
                    Manage all listed
                    properties.
                  </p>
                </div>

                <input
                  className="builder-search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search properties..."
                />
              </div>

              {filteredProperties.length ===
              0 ? (
                <div className="builder-empty">
                  <div className="builder-empty-icon">
                    🏠
                  </div>

                  <h3>
                    No properties found
                  </h3>

                  <p>
                    Add a property to start
                    building your inventory.
                  </p>

                  <button
                    type="button"
                    className="builder-empty-button"
                    onClick={postProperty}
                  >
                    + Add Property
                  </button>
                </div>
              ) : (
                <div className="builder-properties">
                  {filteredProperties.map(
                    (property) => (
                      <article
                        className="builder-property"
                        key={
                          property.id ||
                          property.title
                        }
                      >
                        <div className="builder-property-image">
                          <img
                            src={propertyImage(
                              property
                            )}
                            alt={
                              property.title ||
                              "Property"
                            }
                          />

                          <span className="builder-property-badge">
                            {property.listing_type ||
                              "PROPERTY"}
                          </span>
                        </div>

                        <div className="builder-property-body">
                          <h3>
                            {property.title ||
                              "Untitled Property"}
                          </h3>

                          <p>
                            📍{" "}
                            {property.location ||
                              property.city ||
                              "Location not available"}
                          </p>

                          <div className="builder-property-price">
                            {money(
                              property.price
                            )}
                          </div>

                          <div className="builder-property-details">
                            {property.property_type && (
                              <span className="builder-property-detail">
                                🏠{" "}
                                {
                                  property.property_type
                                }
                              </span>
                            )}

                            {property.bedrooms && (
                              <span className="builder-property-detail">
                                🛏{" "}
                                {
                                  property.bedrooms
                                }{" "}
                                BHK
                              </span>
                            )}

                            {property.area && (
                              <span className="builder-property-detail">
                                ▣{" "}
                                {property.area}{" "}
                                {property.area_unit ||
                                  "sq ft"}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="builder-view"
                            onClick={() =>
                              viewProperty(
                                property.id
                              )
                            }
                          >
                            View Property →
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
            <section className="builder-section">
              <div className="builder-section-head">
                <div>
                  <h2>
                    Customer Enquiries
                  </h2>
                  <p>
                    Respond to leads and
                    property enquiries.
                  </p>
                </div>
              </div>

              {enquiries.length === 0 ? (
                <div className="builder-empty">
                  <div className="builder-empty-icon">
                    📩
                  </div>

                  <h3>
                    No enquiries yet
                  </h3>

                  <p>
                    New customer enquiries
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="builder-enquiries">
                  {enquiries.map(
                    (enquiry) => (
                      <div
                        className="builder-enquiry"
                        key={
                          enquiry.id ||
                          `${enquiry.name}-${enquiry.phone}`
                        }
                      >
                        <div className="builder-enquiry-main">
                          <h3>
                            {enquiryName(
                              enquiry
                            )}
                          </h3>

                          <p>
                            📞{" "}
                            {enquiry.phone ||
                              enquiry.mobile ||
                              "Phone not available"}
                          </p>

                          <p>
                            ✉️{" "}
                            {enquiry.email ||
                              "Email not available"}
                          </p>

                          <p className="builder-enquiry-message">
                            {enquiryMessage(
                              enquiry
                            )}
                          </p>
                        </div>

                        <div className="builder-enquiry-actions">
                          <span className="builder-status">
                            {enquiry.status ||
                              "New"}
                          </span>

                          <button
                            type="button"
                            className="builder-wa"
                            onClick={() =>
                              enquiryWhatsApp(
                                enquiry
                              )
                            }
                          >
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* BOTTOM CTA */}

          <section
            className="builder-section"
            style={{
              marginTop: "22px",
              background:
                "linear-gradient(135deg,#faf5ff,#f5f3ff)",
              borderColor: "#ddd6fe",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#4c1d95",
                    fontSize: "22px",
                    fontWeight: 950,
                  }}
                >
                  Grow Your Property
                  Business with PROZPO
                </h2>

                <p
                  style={{
                    margin:
                      "7px 0 0",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Add more properties,
                  manage enquiries and
                  showcase your projects.
                </p>
              </div>

              <button
                type="button"
                onClick={postProperty}
                style={{
                  border: 0,
                  borderRadius: "10px",
                  padding: "13px 18px",
                  background: "#7c3aed",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                + Add New Property
              </button>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
