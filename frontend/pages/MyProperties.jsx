import React, { useEffect, useState } from "react";
import {
  getProperties,
  deleteProperty,
} from "../src/api";

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);
      setMessage("");

      const response = await getProperties();

      const data =
        response?.properties ||
        response?.data ||
        [];

      setProperties(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "My properties error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load your properties."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(price) {
    if (!price) return "Price on Request";

    const value = Number(price);

    if (Number.isNaN(value)) {
      return price;
    }

    if (value >= 10000000) {
      return `₹${(
        value / 10000000
      ).toFixed(2)} Cr`;
    }

    if (value >= 100000) {
      return `₹${(
        value / 100000
      ).toFixed(2)} Lakh`;
    }

    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  }

  function getImage(property) {
    return (
      property.image_url ||
      property.image ||
      property.thumbnail ||
      ""
    );
  }

  function openProperty(id) {
    window.location.hash =
      `property/${id}`;
  }

  function editProperty(id) {
    window.location.hash =
      `edit-property/${id}`;
  }

  async function handleDelete(property) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(property.id);
      setMessage("");

      await deleteProperty(property.id);

      setProperties((previous) =>
        previous.filter(
          (item) =>
            item.id !== property.id
        )
      );

      setMessage(
        "Property deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete property error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to delete property."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProperties =
    properties.filter((property) => {
      const query =
        search.toLowerCase().trim();

      if (!query) return true;

      const text = [
        property.title,
        property.location,
        property.property_type,
        property.listing_type,
        property.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });

  return (
    <>
      <style>{`
        .my-properties-page {
          min-height: 100vh;
          padding: 45px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.08),
              transparent 35%
            ),
            #f8fafc;
        }

        .my-properties-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .my-properties-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .my-properties-badge {
          display: inline-block;
          margin-bottom: 10px;
          padding: 7px 13px;
          border-radius: 20px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .7px;
        }

        .my-properties-header h1 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 5vw, 45px);
          font-weight: 900;
        }

        .my-properties-header p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
        }

        .post-new-property {
          border: 0;
          border-radius: 11px;
          padding: 13px 18px;
          background: #2563eb;
          color: white;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
          white-space: nowrap;
        }

        .post-new-property:hover {
          background: #1d4ed8;
        }

        .properties-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .property-search {
          width: 100%;
          max-width: 550px;
          padding: 14px 16px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          background: white;
          color: #0f172a;
          font-size: 14px;
          outline: none;
        }

        .property-search:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.10);
        }

        .property-count {
          color: #475569;
          font-size: 14px;
          font-weight: 800;
          white-space: nowrap;
        }

        .properties-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .my-property-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          box-shadow:
            0 10px 30px rgba(15,23,42,.06);
          transition: .25s;
        }

        .my-property-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 18px 40px rgba(15,23,42,.10);
        }

        .property-image-wrap {
          position: relative;
          height: 205px;
          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #e2e8f0
            );
        }

        .property-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .property-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
        }

        .property-status {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 10px;
          border-radius: 20px;
          background: rgba(15,23,42,.80);
          color: white;
          font-size: 10px;
          font-weight: 900;
        }

        .my-property-content {
          padding: 20px;
        }

        .my-property-content h2 {
          margin: 0 0 7px;
          color: #0f172a;
          font-size: 19px;
          font-weight: 900;
          line-height: 1.3;
        }

        .property-location {
          margin: 0 0 12px;
          color: #64748b;
          font-size: 13px;
        }

        .property-price {
          margin-bottom: 15px;
          color: #2563eb;
          font-size: 21px;
          font-weight: 900;
        }

        .property-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 18px;
        }

        .meta-item {
          padding: 6px 9px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
          font-weight: 750;
        }

        .property-actions {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 7px;
        }

        .property-action {
          padding: 10px 7px;
          border: 0;
          border-radius: 9px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 850;
        }

        .view-action {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .edit-action {
          background: #fef3c7;
          color: #92400e;
        }

        .delete-action {
          background: #fef2f2;
          color: #b91c1c;
        }

        .property-action:hover {
          filter: brightness(.96);
        }

        .properties-loading,
        .properties-empty {
          padding: 55px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          color: #64748b;
          text-align: center;
        }

        .properties-empty h2 {
          margin: 0 0 8px;
          color: #0f172a;
        }

        .properties-empty p {
          margin: 0 0 20px;
        }

        .empty-post-button {
          border: 0;
          border-radius: 10px;
          padding: 12px 18px;
          background: #2563eb;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .properties-message {
          margin-bottom: 20px;
          padding: 12px 15px;
          border-radius: 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 750;
          text-align: center;
        }

        @media (max-width: 1000px) {
          .properties-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .my-properties-page {
            padding: 30px 14px 60px;
          }

          .my-properties-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .properties-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .property-count {
            white-space: normal;
          }

          .properties-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="my-properties-page">
        <div className="my-properties-container">

          <section className="my-properties-header">
            <div>
              <span className="my-properties-badge">
                PROPERTY MANAGEMENT
              </span>

              <h1>
                My Properties
              </h1>

              <p>
                Manage, edit and track all your
                property listings from one place.
              </p>
            </div>

            <button
              className="post-new-property"
              onClick={() => {
                window.location.hash =
                  "post-property";
              }}
            >
              + Post New Property
            </button>
          </section>

          {message && (
            <div className="properties-message">
              {message}
            </div>
          )}

          <section className="properties-toolbar">

            <input
              className="property-search"
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search your properties..."
            />

            <div className="property-count">
              {loading
                ? "Loading..."
                : `${filteredProperties.length} Properties`}
            </div>

          </section>

          {loading ? (
            <div className="properties-loading">
              Loading your properties...
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="properties-empty">

              <div
                style={{
                  fontSize: "55px",
                  marginBottom: "12px",
                }}
              >
                🏠
              </div>

              <h2>
                No Properties Found
              </h2>

              <p>
                You have not posted any properties
                yet, or no property matches your
                search.
              </p>

              <button
                className="empty-post-button"
                onClick={() => {
                  window.location.hash =
                    "post-property";
                }}
              >
                Post Your First Property
              </button>

            </div>
          ) : (
            <section className="properties-grid">

              {filteredProperties.map(
                (property) => {
                  const image =
                    getImage(property);

                  return (
                    <article
                      className="my-property-card"
                      key={property.id}
                    >

                      <div className="property-image-wrap">

                        {image ? (
                          <img
                            className="property-image"
                            src={image}
                            alt={
                              property.title ||
                              "Property"
                            }
                          />
                        ) : (
                          <div className="property-placeholder">
                            🏠
                          </div>
                        )}

                        <span className="property-status">
                          {property.listing_type ||
                            "ACTIVE"}
                        </span>

                      </div>

                      <div className="my-property-content">

                        <h2>
                          {property.title ||
                            "Property Listing"}
                        </h2>

                        <p className="property-location">
                          📍{" "}
                          {property.location ||
                            "Location unavailable"}
                        </p>

                        <div className="property-price">
                          {formatPrice(
                            property.price
                          )}
                        </div>

                        <div className="property-meta">

                          {property.property_type && (
                            <span className="meta-item">
                              🏠{" "}
                              {
                                property.property_type
                              }
                            </span>
                          )}

                          {property.area && (
                            <span className="meta-item">
                              📐{" "}
                              {property.area} Sq. Ft.
                            </span>
                          )}

                          {property.bedrooms !==
                            null &&
                            property.bedrooms !==
                              undefined && (
                              <span className="meta-item">
                                🛏️{" "}
                                {
                                  property.bedrooms
                                } BHK
                              </span>
                            )}

                          {property.bathrooms !==
                            null &&
                            property.bathrooms !==
                              undefined && (
                              <span className="meta-item">
                                🚿{" "}
                                {
                                  property.bathrooms
                                } Bath
                              </span>
                            )}

                        </div>

                        <div className="property-actions">

                          <button
                            className="property-action view-action"
                            onClick={() =>
                              openProperty(
                                property.id
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            className="property-action edit-action"
                            onClick={() =>
                              editProperty(
                                property.id
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="property-action delete-action"
                            disabled={
                              deletingId ===
                              property.id
                            }
                            onClick={() =>
                              handleDelete(
                                property
                              )
                            }
                          >
                            {deletingId ===
                            property.id
                              ? "..."
                              : "Delete"}
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </section>
          )}

        </div>
      </main>
    </>
  );
        }
