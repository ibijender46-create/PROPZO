import React, { useEffect, useMemo, useState } from "react";
import { getEnquiries } from "../src/api";

export default function MyEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function loadEnquiries() {
    try {
      setLoading(true);
      setMessage("");

      const response = await getEnquiries();

      const data =
        response?.enquiries ||
        response?.data ||
        [];

      setEnquiries(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Enquiries loading error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatus(enquiry) {
    return (
      enquiry.status ||
      enquiry.enquiry_status ||
      "New"
    );
  }

  function getPropertyTitle(enquiry) {
    return (
      enquiry.property_title ||
      enquiry.property?.title ||
      enquiry.title ||
      "Property Enquiry"
    );
  }

  function getName(enquiry) {
    return (
      enquiry.name ||
      enquiry.full_name ||
      enquiry.contact_name ||
      "Unknown User"
    );
  }

  function getPhone(enquiry) {
    return (
      enquiry.phone ||
      enquiry.mobile ||
      enquiry.contact_phone ||
      "Not provided"
    );
  }

  const filteredEnquiries = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return enquiries.filter((enquiry) => {
      const enquiryStatus =
        getStatus(enquiry);

      const matchesStatus =
        status === "All" ||
        enquiryStatus.toLowerCase() ===
          status.toLowerCase();

      const searchableText = [
        getPropertyTitle(enquiry),
        getName(enquiry),
        getPhone(enquiry),
        enquiry.email,
        enquiry.message,
        enquiry.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [enquiries, search, status]);

  function openProperty(enquiry) {
    const propertyId =
      enquiry.property_id ||
      enquiry.property?.id;

    if (!propertyId) {
      setSelected(enquiry);
      return;
    }

    window.location.hash =
      `property/${propertyId}`;
  }

  function contactUser(enquiry) {
    const phone = String(
      getPhone(enquiry)
    ).replace(/\D/g, "");

    if (!phone) {
      return;
    }

    const text = encodeURIComponent(
      `Hello ${getName(
        enquiry
      )}, regarding your property enquiry on PROZPO.`
    );

    window.open(
      `https://wa.me/${phone}?text=${text}`,
      "_blank"
    );
  }

  return (
    <>
      <style>{`
        .enquiries-page {
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

        .enquiries-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .enquiries-header {
          margin-bottom: 30px;
        }

        .enquiries-badge {
          display: inline-block;
          padding: 7px 13px;
          margin-bottom: 10px;
          border-radius: 20px;
          background: #ede9fe;
          color: #6d28d9;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .7px;
        }

        .enquiries-header h1 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 5vw, 45px);
          font-weight: 900;
        }

        .enquiries-header p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
        }

        .enquiries-toolbar {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 12px;
          margin-bottom: 22px;
        }

        .enquiry-search,
        .enquiry-filter {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 16px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          background: white;
          color: #0f172a;
          font-size: 14px;
          outline: none;
        }

        .enquiry-search:focus,
        .enquiry-filter:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.10);
        }

        .enquiries-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
          color: #475569;
          font-size: 14px;
          font-weight: 800;
        }

        .refresh-button {
          border: 1px solid #dbe3ee;
          border-radius: 9px;
          padding: 9px 13px;
          background: white;
          color: #334155;
          font-weight: 800;
          cursor: pointer;
        }

        .enquiries-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .enquiry-card {
          padding: 22px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          box-shadow:
            0 10px 30px rgba(15,23,42,.06);
          transition: .2s;
        }

        .enquiry-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 15px 35px rgba(15,23,42,.10);
        }

        .enquiry-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 17px;
        }

        .enquiry-property {
          min-width: 0;
        }

        .enquiry-property h2 {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 18px;
          font-weight: 900;
          line-height: 1.35;
        }

        .enquiry-date {
          color: #94a3b8;
          font-size: 11px;
        }

        .status-badge {
          flex-shrink: 0;
          padding: 6px 10px;
          border-radius: 20px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 10px;
          font-weight: 900;
        }

        .enquiry-info {
          display: grid;
          gap: 10px;
          margin-bottom: 17px;
        }

        .enquiry-info-row {
          display: flex;
          gap: 10px;
          color: #475569;
          font-size: 13px;
          line-height: 1.5;
        }

        .enquiry-info-icon {
          width: 22px;
          flex: 0 0 22px;
        }

        .enquiry-info strong {
          color: #0f172a;
        }

        .enquiry-message {
          padding: 13px;
          margin-bottom: 17px;
          border-radius: 10px;
          background: #f8fafc;
          color: #475569;
          font-size: 13px;
          line-height: 1.6;
        }

        .enquiry-actions {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 8px;
        }

        .enquiry-action {
          padding: 10px 7px;
          border: 0;
          border-radius: 9px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 850;
        }

        .view-enquiry {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .whatsapp-enquiry {
          background: #ecfdf5;
          color: #047857;
        }

        .property-enquiry {
          background: #f1f5f9;
          color: #334155;
        }

        .enquiries-loading,
        .enquiries-empty {
          padding: 55px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          color: #64748b;
          text-align: center;
        }

        .enquiries-empty h2 {
          margin: 0 0 8px;
          color: #0f172a;
        }

        .enquiries-empty p {
          margin: 0;
        }

        .enquiries-message {
          margin-bottom: 20px;
          padding: 12px 15px;
          border-radius: 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 750;
          text-align: center;
        }

        .enquiry-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15,23,42,.65);
        }

        .enquiry-modal {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 25px;
          border-radius: 18px;
          background: white;
          box-shadow:
            0 25px 70px rgba(0,0,0,.25);
        }

        .modal-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .modal-top h2 {
          margin: 0;
          color: #0f172a;
          font-size: 22px;
        }

        .modal-close {
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 50%;
          background: #f1f5f9;
          color: #334155;
          font-size: 20px;
          cursor: pointer;
        }

        .modal-detail {
          display: grid;
          gap: 13px;
        }

        .modal-detail-row {
          padding: 12px;
          border-radius: 9px;
          background: #f8fafc;
        }

        .modal-detail-label {
          margin-bottom: 4px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
        }

        .modal-detail-value {
          color: #334155;
          font-size: 14px;
          line-height: 1.5;
        }

        @media (max-width: 800px) {
          .enquiries-grid {
            grid-template-columns: 1fr;
          }

          .enquiries-toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 550px) {
          .enquiries-page {
            padding: 30px 14px 60px;
          }

          .enquiries-summary {
            align-items: flex-start;
            flex-direction: column;
          }

          .enquiry-card-top {
            flex-direction: column;
          }

          .enquiry-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="enquiries-page">
        <div className="enquiries-container">

          <section className="enquiries-header">
            <span className="enquiries-badge">
              ENQUIRY MANAGEMENT
            </span>

            <h1>
              My Enquiries
            </h1>

            <p>
              View and manage property enquiries
              received through the PROZPO marketplace.
            </p>
          </section>

          {message && (
            <div className="enquiries-message">
              {message}
            </div>
          )}

          <section className="enquiries-toolbar">

            <input
              className="enquiry-search"
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by property, name, phone or message..."
            />

            <select
              className="enquiry-filter"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="All">
                All Status
              </option>
              <option value="New">
                New
              </option>
              <option value="Contacted">
                Contacted
              </option>
              <option value="Interested">
                Interested
              </option>
              <option value="Closed">
                Closed
              </option>
            </select>

          </section>

          <div className="enquiries-summary">
            <span>
              {loading
                ? "Loading enquiries..."
                : `${filteredEnquiries.length} Enquiries Found`}
            </span>

            <button
              className="refresh-button"
              onClick={loadEnquiries}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="enquiries-loading">
              Loading your enquiries...
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="enquiries-empty">
              <div
                style={{
                  fontSize: "55px",
                  marginBottom: "12px",
                }}
              >
                📩
              </div>

              <h2>
                No Enquiries Found
              </h2>

              <p>
                No enquiries are available for
                the selected filters.
              </p>
            </div>
          ) : (
            <section className="enquiries-grid">

              {filteredEnquiries.map(
                (enquiry, index) => (
                  <article
                    className="enquiry-card"
                    key={
                      enquiry.id ||
                      index
                    }
                  >

                    <div className="enquiry-card-top">

                      <div className="enquiry-property">
                        <h2>
                          {getPropertyTitle(
                            enquiry
                          )}
                        </h2>

                        <div className="enquiry-date">
                          Received:{" "}
                          {formatDate(
                            enquiry.created_at ||
                              enquiry.createdAt
                          )}
                        </div>
                      </div>

                      <span className="status-badge">
                        {getStatus(enquiry)}
                      </span>

                    </div>

                    <div className="enquiry-info">

                      <div className="enquiry-info-row">
                        <span className="enquiry-info-icon">
                          👤
                        </span>

                        <span>
                          <strong>
                            Name:
                          </strong>{" "}
                          {getName(enquiry)}
                        </span>
                      </div>

                      <div className="enquiry-info-row">
                        <span className="enquiry-info-icon">
                          📞
                        </span>

                        <span>
                          <strong>
                            Phone:
                          </strong>{" "}
                          {getPhone(enquiry)}
                        </span>
                      </div>

                      {enquiry.email && (
                        <div className="enquiry-info-row">
                          <span className="enquiry-info-icon">
                            ✉️
                          </span>

                          <span>
                            <strong>
                              Email:
                            </strong>{" "}
                            {enquiry.email}
                          </span>
                        </div>
                      )}

                    </div>

                    {enquiry.message && (
                      <div className="enquiry-message">
                        <strong>
                          Message:
                        </strong>{" "}
                        {enquiry.message}
                      </div>
                    )}

                    <div className="enquiry-actions">

                      <button
                        className="enquiry-action view-enquiry"
                        onClick={() =>
                          setSelected(
                            enquiry
                          )
                        }
                      >
                        View
                      </button>

                      <button
                        className="enquiry-action whatsapp-enquiry"
                        onClick={() =>
                          contactUser(
                            enquiry
                          )
                        }
                      >
                        WhatsApp
                      </button>

                      <button
                        className="enquiry-action property-enquiry"
                        onClick={() =>
                          openProperty(
                            enquiry
                          )
                        }
                      >
                        Property
                      </button>

                    </div>

                  </article>
                )
              )}

            </section>
          )}

        </div>
      </main>

      {selected && (
        <div className="enquiry-modal-overlay">

          <div className="enquiry-modal">

            <div className="modal-top">
              <h2>
                Enquiry Details
              </h2>

              <button
                className="modal-close"
                onClick={() =>
                  setSelected(null)
                }
              >
                ×
              </button>
            </div>

            <div className="modal-detail">

              <div className="modal-detail-row">
                <div className="modal-detail-label">
                  PROPERTY
                </div>

                <div className="modal-detail-value">
                  {getPropertyTitle(
                    selected
                  )}
                </div>
              </div>

              <div className="modal-detail-row">
                <div className="modal-detail-label">
                  NAME
                </div>

                <div className="modal-detail-value">
                  {getName(selected)}
                </div>
              </div>

              <div className="modal-detail-row">
                <div className="modal-detail-label">
                  PHONE
                </div>

                <div className="modal-detail-value">
                  {getPhone(selected)}
                </div>
              </div>

              {selected.email && (
                <div className="modal-detail-row">
                  <div className="modal-detail-label">
                    EMAIL
                  </div>

                  <div className="modal-detail-value">
                    {selected.email}
                  </div>
                </div>
              )}

              <div className="modal-detail-row">
                <div className="modal-detail-label">
                  STATUS
                </div>

                <div className="modal-detail-value">
                  {getStatus(selected)}
                </div>
              </div>

              <div className="modal-detail-row">
                <div className="modal-detai
