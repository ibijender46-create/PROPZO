import React, { useEffect, useMemo, useState } from "react";
import { getAgents } from "../src/api";

function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [error, setError] = useState("");

  const demoAgents = [
    {
      id: "demo-1",
      name: "Rahul Sharma",
      location: "Noida, Uttar Pradesh",
      experience: "8 Years",
      speciality: "Residential Properties",
      phone: "9876543210",
      verified: true,
    },
    {
      id: "demo-2",
      name: "Amit Verma",
      location: "Gurugram, Haryana",
      experience: "6 Years",
      speciality: "Luxury Apartments",
      phone: "9876543211",
      verified: true,
    },
    {
      id: "demo-3",
      name: "Neha Kapoor",
      location: "Greater Noida, Uttar Pradesh",
      experience: "5 Years",
      speciality: "Plots & Villas",
      phone: "9876543212",
      verified: true,
    },
    {
      id: "demo-4",
      name: "Vikas Singh",
      location: "Ghaziabad, Uttar Pradesh",
      experience: "10 Years",
      speciality: "Commercial Properties",
      phone: "9876543213",
      verified: true,
    },
  ];

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      setLoading(true);
      setError("");

      const response = await getAgents();

      const apiAgents =
        response?.agents ||
        response?.data ||
        [];

      setAgents(
        Array.isArray(apiAgents) && apiAgents.length
          ? apiAgents
          : demoAgents
      );
    } catch (err) {
      console.error("Agents loading error:", err);
      setError("Unable to load live agents.");
      setAgents(demoAgents);
    } finally {
      setLoading(false);
    }
  }

  const locations = useMemo(() => {
    const unique = [
      ...new Set(
        agents
          .map((agent) => agent.location)
          .filter(Boolean)
      ),
    ];

    return ["All Locations", ...unique];
  }, [agents]);

  const filteredAgents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return agents.filter((agent) => {
      const searchableText = [
        agent.name,
        agent.location,
        agent.speciality,
        agent.experience,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesLocation =
        location === "All Locations" ||
        agent.location === location;

      return matchesSearch && matchesLocation;
    });
  }, [agents, search, location]);

  function getPhone(agent) {
    return String(
      agent.phone ||
        agent.mobile ||
        agent.contact ||
        ""
    ).replace(/\D/g, "");
  }

  function contactAgent(agent) {
    const phone = getPhone(agent);

    if (!phone) {
      alert("Agent contact number is not available.");
      return;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(
        `Hello ${agent.name || "Agent"}, I found your profile on PROZPO and would like to know about available properties.`
      )}`,
      "_blank"
    );
  }

  function viewAgent(agent) {
    if (!agent.id || String(agent.id).startsWith("demo-")) {
      alert(
        `${agent.name} profile is currently available as demo data.`
      );
      return;
    }

    window.location.hash = `agent/${agent.id}`;
  }

  return (
    <>
      <style>{`
        .agents-page {
          min-height: 100vh;
          padding: 50px 20px 80px;
          background:
            radial-gradient(circle at top left, rgba(37,99,235,.08), transparent 35%),
            radial-gradient(circle at bottom right, rgba(16,185,129,.07), transparent 35%),
            #f8fafc;
        }

        .agents-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .agents-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 35px;
        }

        .agents-badge {
          display: inline-block;
          padding: 8px 14px;
          border-radius: 30px;
          background: #e0f2fe;
          color: #0369a1;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .8px;
          margin-bottom: 15px;
        }

        .agents-header h1 {
          margin: 0 0 14px;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1.1;
          color: #0f172a;
          font-weight: 900;
        }

        .agents-header p {
          margin: 0;
          color: #64748b;
          font-size: 17px;
          line-height: 1.7;
        }

        .agents-search {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 12px;
          margin: 30px auto 40px;
          max-width: 850px;
        }

        .agents-search input,
        .agents-search select {
          width: 100%;
          box-sizing: border-box;
          padding: 15px 16px;
          border: 1px solid #dbe3ee;
          border-radius: 12px;
          background: #fff;
          color: #0f172a;
          font-size: 15px;
          outline: none;
          transition: .2s;
        }

        .agents-search input:focus,
        .agents-search select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.10);
        }

        .agents-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          gap: 15px;
        }

        .agents-count {
          color: #475569;
          font-weight: 700;
        }

        .agents-error {
          color: #b45309;
          font-size: 13px;
        }

        .agents-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .agent-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(15,23,42,.06);
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .agent-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 40px rgba(15,23,42,.11);
        }

        .agent-top {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 24px;
          background: linear-gradient(135deg, #eff6ff, #f8fafc);
          border-bottom: 1px solid #e5e7eb;
        }

        .agent-avatar {
          width: 82px;
          height: 82px;
          flex: 0 0 82px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2563eb, #0f172a);
          color: #fff;
          font-size: 34px;
          font-weight: 900;
          overflow: hidden;
        }

        .agent-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .agent-name-area {
          min-width: 0;
          flex: 1;
        }

        .agent-name-area h2 {
          margin: 0 0 7px;
          color: #0f172a;
          font-size: 22px;
          font-weight: 850;
        }

        .verified {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
        }

        .agent-body {
          padding: 22px 24px 24px;
        }

        .agent-info {
          display: grid;
          gap: 12px;
          margin-bottom: 22px;
        }

        .agent-info-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          color: #475569;
          font-size: 14px;
          line-height: 1.5;
        }

        .agent-info-icon {
          width: 25px;
          flex: 0 0 25px;
          text-align: center;
        }

        .agent-info strong {
          color: #0f172a;
        }

        .agent-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .agent-btn {
          border: 0;
          border-radius: 11px;
          padding: 13px 15px;
          cursor: pointer;
          font-weight: 800;
          font-size: 14px;
          transition: .2s;
        }

        .agent-btn:hover {
          transform: translateY(-1px);
        }

        .agent-btn-primary {
          background: #2563eb;
          color: #fff;
        }

        .agent-btn-primary:hover {
          background: #1d4ed8;
        }

        .agent-btn-whatsapp {
          background: #16a34a;
          color: #fff;
        }

        .agent-btn-whatsapp:hover {
          background: #15803d;
        }

        .agents-empty,
        .agents-loading {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 45px 20px;
          text-align: center;
          color: #64748b;
        }

        @media (max-width: 800px) {
          .agents-grid {
            grid-template-columns: 1fr;
          }

          .agents-search {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .agents-page {
            padding: 35px 14px 60px;
          }

          .agent-top {
            padding: 18px;
          }

          .agent-body {
            padding: 18px;
          }

          .agent-avatar {
            width: 68px;
            height: 68px;
            flex-basis: 68px;
            font-size: 28px;
          }

          .agent-name-area h2 {
            font-size: 19px;
          }

          .agent-actions {
            grid-template-columns: 1fr;
          }

          .agents-status {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <main className="agents-page">
        <div className="agents-container">

          <section className="agents-header">
            <span className="agents-badge">
              VERIFIED PROFESSIONALS
            </span>

            <h1>
              Find Trusted Real Estate Agents
            </h1>

            <p>
              Connect with experienced property agents,
              brokers and real estate professionals for
              buying, selling and renting properties.
            </p>
          </section>

          <section className="agents-search">
            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search agent, location or speciality..."
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

          <div className="agents-status">
            <div className="agents-count">
              {loading
                ? "Loading agents..."
                : `${filteredAgents.length} Agents Found`}
            </div>

            {error && (
              <div className="agents-error">
                {error}
              </div>
            )}
          </div>

          {loading ? (
            <div className="agents-loading">
              Loading professional agents...
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="agents-empty">
              <h2>No agents found</h2>
              <p>
                Try another agent name, location or speciality.
              </p>
            </div>
          ) : (
            <section className="agents-grid">
              {filteredAgents.map((agent, index) => {
                const phone = getPhone(agent);

                return (
                  <article
                    className="agent-card"
                    key={agent.id || index}
                  >
                    <div className="agent-top">

                      <div className="agent-avatar">
                        {agent.image ||
                        agent.avatar ||
                        agent.profile_image ? (
                          <img
                            src={
                              agent.image ||
                              agent.avatar ||
                              agent.profile_image
                            }
                            alt={agent.name || "Agent"}
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>

                      <div className="agent-name-area">
                        <h2>
                          {agent.name ||
                            agent.full_name ||
                            "Real Estate Agent"}
                        </h2>

                        {agent.verified !== false && (
                          <span className="verified">
                            ✓ Verified Agent
                          </span>
                        )}
                      </div>

                    </div>

                    <div className="agent-body">

                      <div className="agent-info">

                        <div className="agent-info-row">
                          <span className="agent-info-icon">
                            📍
                          </span>
                          <span>
                            <strong>Location:</strong>{" "}
                            {agent.location ||
                              agent.city ||
                              "India"}
                          </span>
                        </div>

                        <div className="agent-info-row">
                          <span className="agent-info-icon">
                            ⭐
                          </span>
                          <span>
                            <strong>Experience:</strong>{" "}
                            {agent.experience ||
                              agent.experience_years
                                ? `${agent.experience || agent.experience_years} Years`
                                : "Professional"}
                          </span>
                        </div>

                        <div className="agent-info-row">
                          <span className="agent-info-icon">
                            🏠
                          </span>
                          <span>
                            <strong>Speciality:</strong>{" "}
                            {agent.speciality ||
                              agent.specialization ||
                              agent.specialty ||
                              "Real Estate"}
                          </span>
                        </div>

                        {phone && (
                          <div className="agent-info-row">
                            <span className="agent-info-icon">
                              📞
                            </span>
                            <span>
                              <strong>Contact:</strong>{" "}
                              {agent.phone ||
                                agent.mobile ||
                                agent.contact}
                            </span>
                          </div>
                        )}

                      </div>

                      <div className="agent-actions">

                        <button
                          className="agent-btn agent-btn-primary"
                          onClick={() =>
                            viewAgent(agent)
                          }
                        >
                          View Profile
                        </button>

                        <button
                          className="agent-btn agent-btn-whatsapp"
                          onClick={() =>
                            contactAgent(agent)
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

export default Agents;
