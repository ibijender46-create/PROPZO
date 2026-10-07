import React, { useEffect, useMemo, useState } from "react";
import { getBuilders } from "../src/api";

function Builders() {
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [error, setError] = useState("");

  const demoBuilders = [
    {
      id: "demo-1",
      name: "ABC Developers",
      location: "Noida, Uttar Pradesh",
      experience: "15+ Years",
      speciality: "Residential Projects",
      projects: "25+ Projects",
      verified: true,
      phone: "9876543210",
    },
    {
      id: "demo-2",
      name: "Prime Buildtech",
      location: "Greater Noida, Uttar Pradesh",
      experience: "12+ Years",
      speciality: "Luxury Apartments",
      projects: "18+ Projects",
      verified: true,
      phone: "9876543211",
    },
    {
      id: "demo-3",
      name: "Urban Heights Group",
      location: "Gurugram, Haryana",
      experience: "20+ Years",
      speciality: "Premium & Luxury Homes",
      projects: "35+ Projects",
      verified: true,
      phone: "9876543212",
    },
    {
      id: "demo-4",
      name: "Green Valley Developers",
      location: "Ghaziabad, Uttar Pradesh",
      experience: "10+ Years",
      speciality: "Plots & Gated Townships",
      projects: "15+ Projects",
      verified: true,
      phone: "9876543213",
    },
  ];

  useEffect(() => {
    loadBuilders();
  }, []);

  async function loadBuilders() {
    try {
      setLoading(true);
      setError("");

      const response = await getBuilders();

      const apiBuilders =
        response?.builders ||
        response?.data ||
        [];

      setBuilders(
        Array.isArray(apiBuilders) && apiBuilders.length
          ? apiBuilders
          : demoBuilders
      );
    } catch (err) {
      console.error("Builders loading error:", err);
      setError("Unable to load live builders.");
      setBuilders(demoBuilders);
    } finally {
      setLoading(false);
    }
  }

  const locations = useMemo(() => {
    const uniqueLocations = [
      ...new Set(
        builders
          .map((builder) => builder.location)
          .filter(Boolean)
      ),
    ];

    return ["All Locations", ...uniqueLocations];
  }, [builders]);

  const filteredBuilders = useMemo(() => {
    const query = search.toLowerCase().trim();

    return builders.filter((builder) => {
      const searchableText = [
        builder.name,
        builder.location,
        builder.speciality,
        builder.specialization,
        builder.experience,
        builder.projects,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesLocation =
        location === "All Locations" ||
        builder.location === location;

      return matchesSearch && matchesLocation;
    });
  }, [builders, search, location]);

  function getPhone(builder) {
    return String(
      builder.phone ||
        builder.mobile ||
        builder.contact ||
        ""
    ).replace(/\D/g, "");
  }

  function contactBuilder(builder) {
    const phone = getPhone(builder);

    if (!phone) {
      alert("Builder contact number is not available.");
      return;
    }

    const message = encodeURIComponent(
      `Hello ${builder.name || "Builder"}, I found your company on PROZPO and would like to know about your property projects.`
    );

    window.open(
      `https://wa.me/${phone}?text=${message}`,
      "_blank"
    );
  }

  function viewBuilder(builder) {
    if (!builder.id || String(builder.id).startsWith("demo-")) {
      alert(
        `${builder.name} profile is currently available as demo data.`
      );
      return;
    }

    window.location.hash = `builder/${builder.id}`;
  }

  function getExperience(builder) {
    if (builder.experience) {
      return builder.experience;
    }

    if (builder.experience_years) {
      return `${builder.experience_years}+ Years`;
    }

    return "Experienced Developer";
  }

  function getProjects(builder) {
    if (builder.projects) {
      return builder.projects;
    }

    if (builder.project_count !== undefined) {
      return `${builder.project_count}+ Projects`;
    }

    return "Multiple Projects";
  }

  return (
    <>
      <style>{`
        .builders-page {
          min-height: 100vh;
          padding: 50px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37, 99, 235, 0.08),
              transparent 35%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(16, 185, 129, 0.07),
              transparent 35%
            ),
            #f8fafc;
        }

        .builders-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .builders-header {
          max-width: 800px;
          margin: 0 auto 35px;
          text-align: center;
        }

        .builders-badge {
          display: inline-block;
          padding: 8px 15px;
          border-radius: 30px;
          background: #ecfdf5;
          color: #047857;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          margin-bottom: 15px;
        }

        .builders-header h1 {
          margin: 0 0 14px;
          color: #0f172a;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1.1;
          font-weight: 900;
        }

        .builders-header p {
          margin: 0;
          color: #64748b;
          font-size: 17px;
          line-height: 1.7;
        }

        .builders-search {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 12px;
          max-width: 850px;
          margin: 30px auto 40px;
        }

        .builders-search input,
        .builders-search select {
          width: 100%;
          box-sizing: border-box;
          padding: 15px 16px;
          border: 1px solid #dbe3ee;
          border-radius: 12px;
          background: #fff;
          color: #0f172a;
          font-size: 15px;
          outline: none;
          transition: 0.2s;
        }

        .builders-search input:focus,
        .builders-search select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .builders-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
        }

        .builders-count {
          color: #475569;
          font-weight: 700;
        }

        .builders-error {
          color: #b45309;
          font-size: 13px;
        }

        .builders-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .builder-card {
          overflow: hidden;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .builder-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.11);
        }

        .builder-top {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 24px;
          background: linear-gradient(
            135deg,
            #eff6ff,
            #f8fafc
          );
          border-bottom: 1px solid #e5e7eb;
        }

        .builder-logo {
          width: 82px;
          height: 82px;
          flex: 0 0 82px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 18px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #0f172a
          );
          color: #fff;
          font-size: 34px;
          font-weight: 900;
        }

        .builder-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .builder-name-area {
          min-width: 0;
          flex: 1;
        }

        .builder-name-area h2 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 22px;
          line-height: 1.25;
          font-weight: 850;
        }

        .verified-builder {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border: 1px solid #a7f3d0;
          border-radius: 20px;
          background: #ecfdf5;
          color: #047857;
          font-size: 11px;
          font-weight: 800;
        }

        .builder-body {
          padding: 22px 24px 24px;
        }

        .builder-info {
          display: grid;
          gap: 12px;
          margin-bottom: 22px;
        }

        .builder-info-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #475569;
          font-size: 14px;
          line-height: 1.5;
        }

        .builder-info-icon {
          width: 25px;
          flex: 0 0 25px;
          text-align: center;
        }

        .builder-info strong {
          color: #0f172a;
        }

        .builder-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .builder-btn {
          padding: 13px 15px;
          border: 0;
          border-radius: 11px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 800;
          transition: 0.2s;
        }

        .builder-btn:hover {
          transform: translateY(-1px);
        }

        .builder-btn-primary {
          background: #2563eb;
          color: #fff;
        }

        .builder-btn-primary:hover {
          background: #1d4ed8;
        }

        .builder-btn-whatsapp {
          background: #16a34a;
          color: #fff;
        }

        .builder-btn-whatsapp:hover {
          background: #15803d;
        }

        .builders-loading,
        .builders-empty {
          padding: 45px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #fff;
          color: #64748b;
          text-align: center;
        }

        .builders-empty h2 {
          margin: 0 0 8px;
          color: #0f172a;
        }

        .builders-empty p {
          margin: 0;
        }

        @media (max-width: 800px) {
          .builders-grid {
            grid-template-columns: 1fr;
          }

          .builders-search {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .builders-page {
            padding: 35px 14px 60px;
          }

          .builder-top {
            padding: 18px;
          }

          .builder-body {
            padding: 18px;
          }

          .builder-logo {
            width: 68px;
            height: 68px;
            flex-basis: 68px;
            font-size: 28px;
            border-radius: 15px;
          }

          .builder-name-area h2 {
            font-size: 19px;
          }

          .builder-actions {
            grid-template-columns: 1fr;
          }

          .builders-status {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <main className="builders-page">
        <div className="builders-container">

          <section className="builders-header">
            <span className="builders-badge">
              TRUSTED DEVELOPERS
            </span>

            <h1>
              Find Trusted Property Builders
            </h1>

            <p>
              Explore verified builders and developers
              offering residential, commercial and plotted
              development projects.
            </p>
          </section>

          <section className="builders-search">
            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search builder, location or speciality..."
            />

            <select
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            >
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </section>

          <div className="builders-status">
            <div className="builders-count">
              {loading
                ? "Loading builders..."
                : `${filteredBuilders.length} Builders Found`}
            </div>

            {error && (
              <div className="builders-error">
                {error}
              </div>
            )}
          </div>

          {loading ? (
            <div className="builders-loading">
              Loading trusted builders...
            </div>
          ) : filteredBuilders.length === 0 ? (
            <div className="builders-empty">
              <h2>No builders found</h2>
              <p>
                Try another builder name, location or
                speciality.
              </p>
            </div>
          ) : (
            <section className="builders-grid">
              {filteredBuilders.map((builder, index) => {
                const logo =
                  builder.logo ||
                  builder.logo_url ||
                  builder.image;

                return (
                  <article
                    className="builder-card"
                    key={builder.id || index}
                  >
                    <div className="builder-top">

                      <div className="builder-logo">
                        {logo ? (
                          <img
                            src={logo}
                            alt={
                              builder.name ||
                              "Property Builder"
                            }
                          />
                        ) : (
                          <span>🏗️</span>
                        )}
                      </div>

                      <div className="builder-name-area">
                        <h2>
                          {builder.name ||
                            builder.company_name ||
                            "Property Developer"}
                        </h2>

                        {builder.verified !== false && (
                          <span className="verified-builder">
                            ✓ Verified Builder
                          </span>
                        )}
                      </div>

                    </div>

                    <div className="builder-body">

                      <div className="builder-info">

                        <div className="builder-info-row">
                          <span className="builder-info-icon">
                            📍
                          </span>
                          <span>
                            <strong>Location:</strong>{" "}
                            {builder.location ||
                              builder.city ||
                              "India"}
                          </span>
                        </div>

                        <div className="builder-info-row">
                          <span className="builder-info-icon">
                            ⭐
                          </span>
                          <span>
                            <strong>Experience:</strong>{" "}
                            {getExperience(builder)}
                          </span>
                        </div>

                        <div className="builder-info-row">
                          <span className="builder-info-icon">
                            🏠
                          </span>
                          <span>
                            <strong>Speciality:</strong>{" "}
                            {builder.speciality ||
                              builder.specialization ||
                              "Real Estate Projects"}
                          </span>
                        </div>

                        <div className="builder-info-row">
                          <span className="builder-info-icon">
                            🏢
                          </span>
                          <span>
                            <strong>Projects:</strong>{" "}
                            {getProjects(builder)}
                          </span>
                        </div>

                      </div>

                      <div className="builder-actions">

                        <button
                          className="builder-btn builder-btn-primary"
                          onClick={() =>
                            viewBuilder(builder)
                          }
                        >
                          View Builder
                        </button>

                        <button
                          className="builder-btn builder-btn-whatsapp"
                          onClick={() =>
                            contactBuilder(builder)
                          }
                        >
                          WhatsApp
                        </button>

                      </div>

                    </div>
                  </article>
                );
              })}
            </section>
          )}

        </div>
      </main>
    </>
  );
}

export default Builders;
