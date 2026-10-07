import React, { useEffect, useMemo, useState } from "react";
import {
  getProperties,
  getEnquiries,
  deleteProperty,
} from "../src/api";

export default function OwnerDashboard() {
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [propertyResponse, enquiryResponse] =
        await Promise.all([
          getProperties(),
          getEnquiries(),
        ]);

      setProperties(
        propertyResponse?.properties ||
          propertyResponse?.data ||
          []
      );

      setEnquiries(
        enquiryResponse?.enquiries ||
          enquiryResponse?.data ||
          []
      );
    } catch (error) {
      console.error(
        "Owner dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredProperties = useMemo(() => {
    const keyword = search.toLowerCase().trim();

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
      (item) =>
        String(item.status || "active").toLowerCase() ===
        "active"
    ).length;

    const sold = properties.filter(
      (item) =>
        String(item.status || "").toLowerCase() ===
        "sold"
    ).length;

    const pending = enquiries.filter(
      (item) =>
        !["closed", "completed"].includes(
          String(item.status || "").toLowerCase()
        )
    ).length;

    return {
      total: properties.length,
      active,
      sold,
      enquiries: enquiries.length,
      pending,
    };
  }, [properties, enquiries]);

  function money(value) {
    const amount = Number(value);

    if (!amount) return "Price on Request";

    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }

    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }

    return `₹${amount.toLocaleString("en-IN")}`;
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
    window.location.hash = `property/${id}`;
  }

  function editProperty(id) {
    if (!id) return;
    window.location.hash = `edit-property/${id}`;
  }

  function postProperty() {
    window.location.hash = "post-property";
  }

  async function handleDelete(id) {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      await deleteProperty(id);

      setProperties((previous) =>
        previous.filter(
          (property) => property.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete property error:",
        error
      );

      window.alert(
        error?.message ||
          "Unable to delete property."
      );
    } finally {
      setDeleting(null);
    }
  }

  function statusClass(status) {
    const value = String(
      status || "active"
    ).toLowerCase();

    if (value === "sold") return "sold";
    if (value === "pending") return "pending";

    return "active";
  }

  if (loading) {
    return (
      <>
        <style>{`
          .owner-loading {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 800;
            color: #475569;
            background: #f8fafc;
          }
        `}</style>

        <div className="owner-loading">
          Loading Owner Dashboard...
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .owner-page {
          min-height: 100vh;
          padding: 32px 18px 70px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.08),
              transparent 32%
            ),
            #f8fafc;
        }

        .owner-container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .owner-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
          padding: 28px;
          border-radius: 22px;
          color: white;
          background:
            linear-gradient(
              135deg,
              #0f172a,
              #1d4ed8
            );
          box-shadow:
            0 18px 45px rgba(15,23,42,.15);
        }

        .owner-hero h1 {
          margin: 0 0 7px;
          font-size: clamp(27px, 4vw, 38px);
          font-weight: 900;
        }

        .owner-hero p {
          margin: 0;
          color: #dbeafe;
          font-size: 14px;
        }

        .owner-post-btn {
          border: 0;
          padding: 14px 19px;
          border-radius: 11px;
          background: white;
          color: #1d4ed8;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .owner-post-btn:hover {
          background: #eff6ff;
        }

        .owner-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin-bottom: 22px;
          padding: 5px;
          border-radius: 13px;
          background: white;
          border: 1px solid #e2e8f0;
        }

        .owner-tab {
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

        .owner-tab.active {
          background: #2563eb;
          color: white;
        }

        .owner-stats {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .owner-stat {
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: white;
          box-shadow:
            0 7px 25px rgba(15,23,42,.05);
        }

        .owner-stat-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 750;
        }

        .owner-stat-value {
          margin-top: 7px;
          color: #0f172a;
          font-size: 27px;
          font-weight: 950;
        }

        .owner-section {
          padding: 23px;
          border: 1px solid #e2e8f0;
          border-radius: 19px;
          background: white;
          box-shadow:
            0 8px 28px rgba(15,23,42,.05);
        }

        .owner-section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .owner-section-head h2 {
          margin: 0;
          color: #0f172a;
          font-size: 21px;
          font-weight: 900;
        }

        .owner-search {
          width: 280px;
          max-width: 100%;
          padding: 11px 13px;
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          outline: none;
          font-size: 13px;
        }

        .owner-search:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.08);
        }

        .owner-properties {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .owner-property {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: white;
        }

        .owner-property-image {
          position: relative;
          height: 175px;
          background: #e2e8f0;
        }

        .owner-property-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .owner-status {
          position: absolute;
          top: 11px;
          left: 11px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .owner-status.active {
          background: #dcfce7;
          color: #166534;
        }

        .owner-status.sold {
          background: #fee2e2;
          color: #991b1b;
        }

        .owner-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .owner-property-body {
          padding: 15px;
        }

        .owner-property-title {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.35;
        }

        .owner-property-location {
          margin: 0 0 10px;
          color: #64748b;
          font-size: 12px;
        }

        .owner-property-price {
          color: #2563eb;
          font-size: 18px;
          font-weight: 950;
        }

        .owner-property-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin: 12px 0;
        }

        .owner-meta {
          padding: 5px 7px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          font-weight: 750;
        }

        .owner-actions {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 7px;
          margin-top: 12px;
        }

        .owner-action {
          padding: 9px 6px;
          border: 1px solid #dbe3ee;
          border-radius: 8px;
          background: white;
          color: #334155;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .owner-action:hover {
          border-color: #2563eb;
          color: #2563eb;
        }

        .owner-action.danger:hover {
          border-color: #dc2626;
          color: #dc2626;
        }

        .owner-empty {
          padding: 50px 20px;
          text-align: center;
          color: #64748b;
        }

        .owner-empty-icon {
          margin-bottom: 10px;
          font-size: 40px;
        }

        .owner-empty h3 {
          margin: 0 0 7px;
          color: #0f172a;
        }

        .owner-enquiries {
          display: grid;
          gap: 12px;
        }

        .owner-enquiry {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .owner-enquiry h3 {
          margin: 0 0 5px;
          color: #0f172a;
          font-size: 14px;
        }

        .owner-enquiry p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .owner-enquiry-status {
          padding: 6px 9px;
          border-radius: 20px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
        }

        @media (max-width: 1050px) {
          .owner-stats {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .owner-properties {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .owner-page {
            padding: 20px 12px 55px;
          }

          .owner-hero {
            align-items: flex-start;
            flex-direction: column;
            padding: 22px;
          }

          .owner-post-btn {
            width: 100%;
          }

          .owner-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .owner-section {
            padding: 16px;
          }

          .owner-section-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .owner-search {
            width: 100%;
          }

          .owner-properties {
            grid-template-columns: 1fr;
          }

          .owner-enquiry {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <main className="owner-page">
        <div className="owner-container">

          <section className="owner-hero">
            <div>
              <h1>
                Owner Dashboard
              </h1>

              <p>
                Manage your properties,
                enquiries and listings from
                one place.
              </p>
            </div>

            <button
              className="owner-post-btn"
              onClick={postProperty}
            >
              + Post New Property
            </button>
          </section>

          <div className="owner-tabs">
            <button
              className={`owner-tab ${
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
              className={`owner-tab ${
                activeTab === "properties"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("properties")
              }
            >
              My Properties
            </button>

            <button
              className={`owner-tab ${
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

          <section className="owner-stats">

            <div className="owner-stat">
              <div className="owner-stat-label">
                Total Properties
              </div>
              <div className="owner-stat-value">
                {stats.total}
              </div>
            </div>

            <div className="owner-stat">
              <div className="owner-stat-label">
                Active Listings
              </div>
              <div className="owner-stat-value">
                {stats.active}
              </div>
            </div>

            <div className="owner-stat">
              <div className="owner-stat-label">
                Sold
              </div>
              <div className="owner-stat-value">
                {stats.sold}
              </div>
            </div>

            <div className="owner-stat">
              <div className="owner-stat-label">
                Total Enquiries
              </div>
              <div className="owner-stat-value">
                {stats.enquiries}
              </div>
            </div>

            <div className="owner-stat">
              <div className="owner-stat-label">
                Pending Enquiries
              </div>
              <div className="owner-stat-value">
                {stats.pending}
              </div>
            </div>

          </section>

          {(activeTab === "overview" ||
            activeTab === "properties") && (
            <section className="owner-section">

              <div className="owner-section-head">
                <h2>
                  My Properties
                </h2>

                <input
                  className="owner-search"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search your properties..."
                />
              </div>

              {filteredProperties.length === 0 ? (
                <div className="owner-empty">
                  <div className="owner-empty-icon">
                    🏠
                  </div>

                  <h3>
                    No properties found
                  </h3>

                  <p>
                    Start by posting your first
                    property on PROZPO.
                  </p>
                </div>
              ) : (
                <div className="owner-properties">

                  {filteredProperties.map(
                    (property) => (
                      <article
                        className="owner-property"
                        key={property.id}
                      >

                        <div className="owner-property-image">

                          <img
                            src={propertyImage(
                              property
                            )}
                            alt={
                              property.title ||
                              "Property"
                            }
                            loading="lazy"
                          />

                          <span
                            className={`owner-status ${statusClass(
                              property.status
                            )}`}
                          >
                            {property.status ||
                              "Active"}
                          </span>

                        </div>

                        <div className="owner-property-body">

                          <h3 className="owner-property-title">
                            {property.title ||
                              "Untitled Property"}
                          </h3>

                          <p className="owner-property-location">
                            📍{" "}
                            {property.location ||
                              property.city ||
                              "Location not available"}
                          </p>

                          <div className="owner-property-price">
                            {money(
                              property.price
                            )}
                          </div>

                          <div className="owner-property-meta">

                            {property.property_type && (
                              <span className="owner-meta">
                                {property.property_type}
                              </span>
                            )}

                            {property.bedrooms && (
                              <span className="owner-meta">
                                🛏{" "}
                                {property.bedrooms} Beds
                              </span>
                            )}

                            {property.bathrooms && (
                              <span className="owner-meta">
                                🛁{" "}
                                {property.bathrooms} Baths
                              </span>
                            )}

                            {property.area && (
                              <span className="owner-meta">
                                📐 {property.area}
                              </span>
                            )
