import React, { useEffect, useMemo, useState } from "react";
import {
  getProperties,
  getEnquiries,
  getAgents,
} from "../src/api";

export default function AgentDashboard() {
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        getProperties(),
        getEnquiries(),
        getAgents(),
      ]);

      const propertyResult = results[0];
      const enquiryResult = results[1];
      const agentResult = results[2];

      if (propertyResult.status === "fulfilled") {
        const data = propertyResult.value;

        setProperties(
          data?.properties ||
            data?.data ||
            []
        );
      }

      if (enquiryResult.status === "fulfilled") {
        const data = enquiryResult.value;

        setEnquiries(
          data?.enquiries ||
            data?.data ||
            []
        );
      }

      if (agentResult.status === "fulfilled") {
        const data = agentResult.value;

        setAgents(
          data?.agents ||
            data?.data ||
            []
        );
      }
    } catch (error) {
      console.error(
        "Agent dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

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
        property.listing_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [properties, search]);

  const stats = useMemo(() => {
    const active = properties.filter(
      (property) =>
        String(
          property.status || "active"
        ).toLowerCase() === "active"
    ).length;

    const sold = properties.filter(
      (property) =>
        String(
          property.status || ""
        ).toLowerCase() === "sold"
    ).length;

    const closedEnquiries =
      enquiries.filter((item) =>
        ["closed", "completed"].includes(
          String(
            item.status || ""
          ).toLowerCase()
        )
      ).length;

    return {
      listings: properties.length,
      active,
      enquiries: enquiries.length,
      closed: closedEnquiries,
      team: agents.length,
    };
  }, [properties, enquiries, agents]);

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

  function propertyImage(property) {
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

  function postProperty() {
    window.location.hash =
      "post-property";
  }

  function viewEnquiry(enquiry) {
    const phone =
      enquiry.phone ||
      enquiry.mobile;

    if (phone) {
      const cleanPhone =
        String(phone).replace(
          /[^0-9]/g,
          ""
        );

      window.open(
        `https://wa.me/${cleanPhone}`,
        "_blank"
      );
      return;
    }

    window.alert(
      "Customer contact number is not available."
    );
  }

  if (loading) {
    return (
      <>
        <style>{`
          .agent-loading {
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

        <div className="agent-loading">
          Loading Agent Dashboard...
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .agent-page {
          min-height: 100vh;
          padding: 30px 18px 70px;
          background:
            radial-gradient(
              circle at top right,
              rgba(16,185,129,.09),
              transparent 30%
            ),
            #f8fafc;
        }

        .agent-container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .agent-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 28px;
          margin-bottom: 22px;
          border-radius: 22px;
          color: white;
          background:
            linear-gradient(
              135deg,
              #064e3b,
              #059669
            );
          box-shadow:
            0 18px 45px
            rgba(6,78,59,.16);
        }

        .agent-hero h1 {
          margin: 0 0 7px;
          font-size: clamp(
            27px,
            4vw,
            38px
          );
          font-weight: 950;
        }

        .agent-hero p {
          margin: 0;
          color: #d1fae5;
          font-size: 14px;
          line-height: 1.5;
        }

        .agent-hero-actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .agent-primary-btn,
        .agent-secondary-btn {
          border: 0;
          padding: 13px 17px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .agent-primary-btn {
          background: white;
          color: #047857;
        }

        .agent-secondary-btn {
          background:
            rgba(255,255,255,.14);
          color: white;
          border: 1px solid
            rgba(255,255,255,.25);
        }

        .agent-primary-btn:hover {
          background: #ecfdf5;
        }

        .agent-tabs {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding: 5px;
          margin-bottom: 22px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: white;
        }

        .agent-tab {
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

        .agent-tab.active {
          background: #059669;
          color: white;
        }

        .agent-stats {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .agent-stat {
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: white;
          box-shadow:
            0 7px 25px
            rgba(15,23,42,.05);
        }

        .agent-stat-icon {
          margin-bottom: 8px;
          font-size: 20px;
        }

        .agent-stat-label {
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
        }

        .agent-stat-value {
          margin-top: 5px;
          color: #0f172a;
          font-size: 27px;
          font-weight: 950;
        }

        .agent-section {
          padding: 23px;
          border: 1px solid #e2e8f0;
          border-radius: 19px;
          background: white;
          box-shadow:
            0 8px 28px
            rgba(15,23,42,.05);
        }

        .agent-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 19px;
        }

        .agent-section-head h2 {
          margin: 0;
          color: #0f172a;
          font-size: 21px;
          font-weight: 900;
        }

        .agent-search {
          width: 290px;
          max-width: 100%;
          padding: 11px 13px;
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          outline: none;
          font-size: 13px;
        }

        .agent-search:focus {
          border-color: #059669;
          box-shadow:
            0 0 0 3px
            rgba(5,150,105,.08);
        }

        .agent-properties {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .agent-property {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: white;
        }

        .agent-property-image {
          height: 170px;
          position: relative;
          background: #e2e8f0;
        }

        .agent-property-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .agent-property-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 5px 9px;
          border-radius: 20px;
          background: #ecfdf5;
          color: #047857;
          font-size: 10px;
          font-weight: 900;
        }

        .agent-property-body {
          padding: 15px;
        }

        .agent-property-title {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.35;
        }

        .agent-property-location {
          margin: 0 0 10px;
          color: #64748b;
          font-size: 12px;
        }

        .agent-property-price {
          color: #047857;
          font-size: 18px;
          font-weight: 950;
        }

        .agent-property-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 11px 0;
        }

        .agent-meta {
          padding: 5px 7px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          font-weight: 750;
        }

        .agent-view-btn {
          width: 100%;
          padding: 10px;
          border: 0;
          border-radius: 9px;
          background: #059669;
          color: white;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .agent-view-btn:hover {
          background: #047857;
        }

        .agent-enquiries {
          display: grid;
          gap: 12px;
        }

        .agent-enquiry {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .agent-enquiry-main {
          min-width: 0;
        }

        .agent-enquiry-name {
          margin: 0 0 5px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 900;
        }

        .agent-enquiry-property {
          margin: 0 0 4px;
          color: #475569;
          font-size: 12px;
        }

        .agent-enquiry-contact {
          margin: 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .agent-enquiry-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .agent-enquiry-status {
          padding: 6px 9px;
          border-radius: 20px;
          background: #ecfdf5;
          color: #047857;
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
        }

        .agent-wa {
          border: 0;
          padding: 8px 11px;
          border-radius: 8px;
          background: #16a34a;
          color: white;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .agent-empty {
          padding: 45px 20px;
          text-align: center;
          color: #64748b;
        }

        .agent-empty-icon {
          margin-bottom: 9px;
          font-size: 40px;
        }

        .agent-empty h3 {
          margin: 0 0 6px;
          color: #0f172a;
        }

        .agent-team {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .agent-member {
          padding: 17px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #fff;
        }

        .agent-member-avatar {
          width: 45px;
          height: 45px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #ecfdf5;
          color: #047857;
          font-weight: 950;
        }

        .agent-member h3 {
          margin: 0 0 4px;
          color: #0f172a;
          font-size: 14px;
        }

        .agent-member p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
        }

        @media (max-width: 1050px) {
          .agent-stats {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .agent-properties {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .agent-team {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .agent-page {
            padding: 20px 12px 55px;
          }

          .agent-hero {
            align-items: flex-start;
            flex-direction: column;
            padding: 22px;
          }

          .agent-hero-actions {
            width: 100%;
          }

          .agent-primary-btn,
          .agent-secondary-btn {
            flex: 1;
          }

          .agent-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .agent-section {
            padding: 16px;
          }

          .agent-section-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .agent-search {
            width: 100%;
          }

          .agent-properties {
            grid-template-columns: 1fr;
          }

          .agent-team {
            grid-template-columns: 1fr;
          }

          .agent-enquiry {
            align-items: flex-start;
            flex-direction: column;
          }

          .agent-enquiry-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>

      <main className="agent-page">
        <div className="agent-container">

          <section className="agent-hero">
            <div>
              <h1>
                Agent Dashboard
              </h1>

              <p>
                Manage listings, enquiries
                and your real-estate sales
                activity.
              </p>
            </div>

            <div className="agent-hero-actions">
              <button
                className="agent-primary-btn"
                onClick={postProperty}
              >
                + Add Property
              </button>

              <button
                className="agent-secondary-btn"
                onClick={loadDashboard}
              >
                ↻ Refresh
              </button>
            </div>
          </section>

          <div className="agent-tabs">

            <button
              className={`agent-tab ${
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
              className={`agent-tab ${
                activeTab === "listings"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("listings")
              }
            >
              Listings
            </button>

            <button
              className={`agent-tab ${
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

            <button
              className={`agent-tab ${
                activeTab === "team"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("team")
              }
            >
              Team
            </button>

          </div>

          <section className="agent-stats">

            <div className="agent-stat">
              <div className="agent-stat-icon">
                🏠
              </div>

              <div className="agent-stat-label">
                Total Listings
              </div>

              <div className="agent-stat-value">
                {stats.listings}
              </div>
            </div>

            <div className="agent-stat">
              <div className="agent-stat-icon">
                🟢
              </div>

              <div className="agent-stat-label">
                Active Listings
              </div>

              <div className="agent-stat-value">
                {stats.active}
              </div>
            </div>

            <div className="agent-stat">
              <div className="agent-stat-icon">
                📩
              </div>

              <div className="agent-stat-label">
                Enquiries
              </div>

              <div className="agent-stat-value">
                {stats.enquiries}
              </div>
            </div>

            <div className="agent-stat">
              <div className="agent-stat-icon">
                ✅
              </div>

              <div className="agent-stat-label">
                Closed
              </div>

              <div className="agent-stat-value">
                {stats.closed}
              </div>
            </div>

            <div className="agent-stat">
              <div className="agent-stat-icon">
                👥
              </div>

              <div className="agent-stat-label">
                Agents
              </div>

              <div className="agent-stat-value">
                {stats.team}
              </div>
            </div>

          </section>

          {(activeTab === "overview" ||
            activeTab === "listings") && (
            <section className="agent-section">

              <div className="agent-section-head">
                <h2>
                  Property Listings
                </h2>

                <input
                  className="agent-search"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search listings..."
                />
              </div>

              {filteredProperties.length === 0 ? (
                <div className="agent-empty">
                  <div className="agent-empty-icon">
                    🏠
                  </div>

                  <h3>
                    No listings found
                  </h3>

                  <p>
                    Add your first property
                    listing to get started.
                 
