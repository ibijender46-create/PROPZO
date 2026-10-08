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

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.enquiries)) {
        data = response.enquiries;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      }

      setEnquiries(data);
    } catch (error) {
      console.error("Enquiries loading error:", error);

      setEnquiries([]);

      setMessage(
        error?.message || "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) {
      return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatus(enquiry) {
    return (
      enquiry?.status ||
      enquiry?.enquiry_status ||
      "New"
    );
  }

  function getPropertyTitle(enquiry) {
    return (
      enquiry?.property_title ||
      enquiry?.property?.title ||
      enquiry?.title ||
      "Property Enquiry"
    );
  }

  function getName(enquiry) {
    return (
      enquiry?.name ||
      enquiry?.full_name ||
      enquiry?.contact_name ||
      "Unknown User"
    );
  }

  function getPhone(enquiry) {
    return (
      enquiry?.phone ||
      enquiry?.mobile ||
      enquiry?.contact_phone ||
      "Not provided"
    );
  }

  function getEmail(enquiry) {
    return (
      enquiry?.email ||
      enquiry?.contact_email ||
      ""
    );
  }

  function getLocation(enquiry) {
    return (
      enquiry?.location ||
      enquiry?.property?.location ||
      "Location not available"
    );
  }

  const filteredEnquiries = useMemo(() => {
    const query = search.toLowerCase().trim();

    return enquiries.filter((enquiry) => {
      const enquiryStatus = String(
        getStatus(enquiry)
      );

      const matchesStatus =
        status === "All" ||
        enquiryStatus.toLowerCase() ===
          status.toLowerCase();

      const searchableText = [
        getPropertyTitle(enquiry),
        getName(enquiry),
        getPhone(enquiry),
        getEmail(enquiry),
        enquiry?.message,
        getLocation(enquiry),
        enquiry?.city,
        enquiry?.state,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [enquiries, search, status]);

  function openProperty(enquiry) {
    const propertyId =
      enquiry?.property_id ||
      enquiry?.property?.id;

    if (!propertyId) {
      setSelected(enquiry);
      return;
    }

    window.location.hash =
      `property/${propertyId}`;
  }

  function contactUser(enquiry) {
    const rawPhone = getPhone(enquiry);

    if (
      !rawPhone ||
      rawPhone === "Not provided"
    ) {
      window.alert(
        "Customer phone number is not available."
      );
      return;
    }

    let phone = String(rawPhone).replace(
      /[^0-9]/g,
      ""
    );

    if (!phone) {
      window.alert(
        "Customer phone number is not available."
      );
      return;
    }

    if (
      phone.length === 10 &&
      !phone.startsWith("91")
    ) {
      phone = `91${phone}`;
    }

    const text = encodeURIComponent(
      `Hello ${getName(
        enquiry
      )}, regarding your property enquiry on PROZPO.`
    );

    window.open(
      `https://wa.me/${phone}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function clearFilters() {
    setSearch("");
    setStatus("All");
  }

  function getStatusClass(value) {
    const current = String(
      value || "New"
    ).toLowerCase();

    if (current === "closed") {
      return "status-closed";
    }

    if (current === "contacted") {
      return "status-contacted";
    }

    if (current === "interested") {
      return "status-interested";
    }

    return "status-new";
  }

  if (loading) {
    return (
      <>
        <style>{`
          .enquiries-loading-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            background:
              radial-gradient(
                circle at top left,
                rgba(37,99,235,.10),
                transparent 35%
              ),
              #f8fafc;
            font-family:
              Inter,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .enquiries-loading-box {
            width: 100%;
            max-width: 360px;
            padding: 35px;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            background: #ffffff;
            text-align: center;
            box-shadow:
              0 20px 55px rgba(15,23,42,.08);
          }

          .enquiries-spinner {
            width: 45px;
            height: 45px;
            margin: 0 auto 15px;
            border: 4px solid #dbeafe;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation:
              enquiriesSpin .8s linear infinite;
          }

          .enquiries-loading-box h3 {
            margin: 0 0 6px;
            color: #0f172a;
            font-size: 18px;
          }

          .enquiries-loading-box p {
            margin: 0;
            color: #64748b;
            font-size: 13px;
          }

          @keyframes enquiriesSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="enquiries-loading-page">
          <div className="enquiries-loading-box">
            <div className="enquiries-spinner"></div>

            <h3>
              Loading Enquiries
            </h3>

            <p>
              Please wait while your enquiries
              are being loaded.
            </p>
          </div>
        </div>
      </>
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
            linear-gradient(
              180deg,
              #f8fafc 0%,
              #eef4ff 100%
            );
          color: #172033;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .enquiries-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .enquiries-header {
          margin-bottom: 30px;
        }

        .enquiries-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 13px;
          margin-bottom: 11px;
          border: 1px solid #c4b5fd;
          border-radius: 999px;
          background: #ede9fe;
          color: #6d28d9;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .7px;
        }

        .enquiries-header h1 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: clamp(
            30px,
            5vw,
            45px
          );
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: -1.2px;
        }

        .enquiries-header p {
          max-width: 720px;
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .enquiries-message {
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid #bfdbfe;
          border-radius: 11px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.5;
          text-align: center;
        }

        .enquiries-toolbar {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            210px;
          gap: 12px;
          margin-bottom: 18px;
        }

        .enquiry-search,
        .enquiry-filter {
          width: 100%;
          min-height: 48px;
          box-sizing: border-box;
          padding: 12px 15px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          background: #ffffff;
          color: #0f172a;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition:
            border-color .18s ease,
            box-shadow .18s ease;
        }

        .enquiry-search::placeholder {
          color: #94a3b8;
        }

        .enquiry-search:focus,
        .enquiry-filter:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37,99,235,.10);
        }

        .enquiries-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
          color: #475569;
          font-size: 14px;
          font-weight: 850;
        }

        .summary-count {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .summary-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
        }

        .summary-actions {
          display: flex;
          gap: 8px;
        }

        .refresh-button,
        .clear-filter-button {
          min-height: 38px;
          border-radius: 9px;
          padding: 8px 13px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .refresh-button {
          border: 1px solid #dbe3ee;
          background: #ffffff;
          color: #334155;
        }

        .refresh-button:hover {
          border-color: #93c5fd;
          color: #1d4ed8;
        }

        .clear-filter-button {
          border: 1px solid #ddd6fe;
          background: #f5f3ff;
          color: #6d28d9;
        }

        .enquiries-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .enquiry-card {
          overflow: hidden;
          padding: 22px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #ffffff;
          box-shadow:
            0 10px 30px
            rgba(15,23,42,.06);
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .enquiry-card:hover {
          transform: translateY(-3px);
          border-color: #cbd5e1;
          box-shadow:
            0 18px 40px
            rgba(15,23,42,.10);
        }

        .enquiry-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .enquiry-property {
          min-width: 0;
        }

        .enquiry-property h2 {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 18px;
          line-height: 1.35;
          font-weight: 900;
        }

        .enquiry-date {
          color: #94a3b8;
          font-size: 11px;
        }

        .status-badge {
          flex-shrink: 0;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
        }

        .status-new {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .status-contacted {
          background: #fef3c7;
          color: #92400e;
        }

        .status-interested {
          background: #dcfce7;
          color: #166534;
        }

        .status-closed {
          background: #f1f5f9;
          color: #475569;
        }

        .enquiry-info {
          display: grid;
          gap: 10px;
          margin-bottom: 16px;
        }

        .enquiry-info-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #475569;
          font-size: 13px;
          line-height: 1.5;
        }

        .enquiry-info-icon {
          width: 22px;
          flex: 0 0 22px;
          text-align: center;
        }

        .enquiry-info strong {
          color: #0f172a;
        }

        .enquiry-message {
          margin-bottom: 16px;
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          color: #475569;
          font-size: 13px;
          line-height: 1.6;
        }

        .enquiry-message strong {
          color: #0f172a;
        }

        .enquiry-actions {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 8px;
        }

        .enquiry-action {
          min-height: 40px;
          padding: 9px 7px;
          border: 0;
          border-radius: 9px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          transition: .18s ease;
        }

        .enquiry-action:hover {
          transform: translateY(-1px);
        }

        .view-enquiry {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .view-enquiry:hover {
          background: #dbeafe;
        }

        .whatsapp-enquiry {
          background: #ecfdf5;
          color: #047857;
        }

        .whatsapp-enquiry:hover {
          background: #d1fae5;
        }

        .property-enquiry {
          background: #f1f5f9;
          color: #334155;
        }

        .property-enquiry:hover {
          background: #e2e8f0;
        }

        .enquiries-loading,
        .enquiries-empty {
          padding: 55px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #ffffff;
          color: #64748b;
          text-align: center;
          box-shadow:
            0 10px 30px
            rgba(15,23,42,.05);
        }

        .enquiries-empty-icon {
          margin-bottom: 12px;
          font-size: 55px;
        }

        .enquiries-empty h2 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 22px;
        }

        .enquiries-empty p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .empty-clear {
          margin-top: 17px;
          min-height: 42px;
          padding: 9px 16px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: #ffffff;
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .enquiry-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background:
            rgba(15,23,42,.68);
          backdrop-filter: blur(4px);
        }

        .enquiry-modal {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 25px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #ffffff;
          box-shadow:
            0 30px 80px
            rgba(0,0,0,.25);
        }

        .modal-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }

        .modal-top-left {
          min-width: 0;
        }

        .modal-badge {
          display: inline-block;
          margin-bottom: 7px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .7px;
        }

        .modal-top h2 {
          margin: 0;
          color: #0f172a;
          font-size: 23px;
          line-height: 1.2;
          font-weight: 900;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border: 0;
          border-radius: 50%;
          background: #f1f5f9;
          color: #334155;
          font-size: 21px;
          line-height: 1;
          cursor: pointer;
        }

        .modal-close:hover {
          background: #e2e8f0;
        }

        .modal-detail {
          display: grid;
          gap: 11px;
        }

        .modal-detail-row {
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
        }

        .modal-detail-label {
          margin-bottom: 5px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .6px;
        }

        .modal-detail-value {
          color: #334155;
          font-size: 14px;
          line-height: 1.55;
          word-break: break-word;
        }

        .modal-footer {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 9px;
          margin-top: 18px;
        }

        .modal-footer-button {
          min-height: 44px;
          border: 0;
          border-radius: 10px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .modal-whatsapp {
          background: #16a34a;
          color: #ffffff;
        }

        .modal-property {
          background: #2563eb;
          color: #ffffff;
        }

        @media (max-width: 850px) {
          .enquiries-grid {
            grid-template-columns: 1fr;
          }

          .enquiries-toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .enquiries-page {
            padding: 30px 12px 60px;
          }

          .enquiries-summary {
            align-items: flex-start;
            flex-direction: column;
          }

          .summary-actions {
            width: 100%;
          }

          .refresh-button,
          .clear-filter-button {
            flex: 1;
          }

          .enquiry-card {
            padding: 17px;
            border-radius: 15px;
          }

          .enquiry-card-top {
            flex-direction: column;
          }

          .status-badge {
            align-self: flex-start;
          }

          .enquiry-actions {
            grid-template-columns: 1fr;
          }

          .enquiry-modal-overlay {
            padding: 10px;
          }

          .enquiry-modal {
            padding: 18px;
            border-radius: 16px;
          }

          .modal-footer {
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
              received through the PROZPO
              marketplace.
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by property, name, phone, email or message..."
            />

            <select
              className="enquiry-filter"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
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

            <div className="summary-count">
              <span className="summary-dot"></span>

              <span>
                {filteredEnquiries.length}{" "}
                Enquiries Found
              </span>
            </div>

            <div className="summary-actions">

              {(search || status !== "All") && (
                <button
                  type="button"
                  className="clear-filter-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}

              <button
                type="button"
                className="refresh-button"
                onClick={loadEnquiries}
              >
                ↻ Refresh
              </button>

            </div>

          </div>

          {filteredEnquiries.length === 0 ? (
            <div className="enquiries-empty">

              <div className="enquiries-empty-icon">
                📩
              </div>

              <h2>
                No Enquiries Found
              </h2>

              <p>
                {enquiries.length === 0
                  ? "No property enquiries are available yet."
                  : "No enquiries match the selected search or status filter."}
              </p>

              {(search || status !== "All") && (
                <button
                  type="button"
                  className="empty-clear"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}

            </div>
          ) : (
            <section className="enquiries-grid">

              {filteredEnquiries.map(
                (enquiry, index) => {
                  const enquiryStatus =
                    getStatus(enquiry);

                  return (
                    <article
                      className="enquiry-card"
                      key={
                        enquiry.id ||
                        `enquiry-${index}`
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

                        <span
                          className={`status-badge ${getStatusClass(
                            enquiryStatus
                          )}`}
                        >
                          {enquiryStatus}
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

                        {getEmail(enquiry) && (
                          <div className="enquiry-info-row">

                            <span className="enquiry-info-icon">
                              ✉️
                            </span>

                            <span>
                              <strong>
                                Email:
                              </strong>{" "}
                              {getEmail(enquiry)}
                            </span>

                          </div>
                        )}

                        {getLocation(enquiry) !==
                          "Location not available" && (
                          <div className="enquiry-info-row">

                            <span className="enquiry-info-icon">
                              📍
                            </span>

                            <span>
                              <strong>
                                Location:
                              </strong>{" "}
                              {getLocation(
                                enquiry
                              )}
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
                          type="button"
                          className="enquiry-action view-enquiry"
                          onClick={() =>
                            setSelected(
                              enquiry
                            )
                          }
                        >
                          👁 View
                        </button>

                        <button
                          type="button"
                          className="enquiry-action whatsapp-enquiry"
                          onClick={() =>
                            contactUser(
                              enquiry
                            )
                          }
                        >
                          💬 WhatsApp
                        </button>

                        <button
                          type="button"
                          className="enquiry-action property-enquiry"
                          onClick={() =>
                            openProperty(
                              enquiry
                            )
                          }
                        >
                          🏠 Property
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </section>
          )}

        </div>
      </main>

      {selected && (
        <div
          className="enquiry-modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelected(null);
            }
          }}
        >

          <div className="enquiry-modal">

            <div className="modal-top">

              <div className="modal-top-left">

                <span className="modal-badge">
                  PROZPO ENQUIRY
                </span>

                <h2>
                  Enquiry Details
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelected(null)
                }
                aria-label="Close"
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

              {getEmail(selected) && (
                <div className="modal-detail-row">

                  <div className="modal-detail-label">
                    EMAIL
                  </div>

                  <div className="modal-detail-value">
                    {getEmail(selected)}
                  </div>

                </div>
              )}

              <div className="modal-detail-row">

                <div className="modal-detail-label">
                  LOCATION
                </div>

                <div className="modal-detail-value">
                  {getLocation(selected)}
                </div>

              </div>

              <div className="modal-detail-row">

                <div className="modal-detail-label">
                  STATUS
                </div>

                <div className="modal-detail-value">
                  {getStatus(selected)}
                </div>

              </div>

              <div className="modal-detail-row">

                <div className="modal-detail-label">
                  DATE
                </div>

                <div className="modal-detail-value">
                  {formatDate(
                    selected.created_at ||
                      selected.createdAt
                  )}
                </div>

              </div>

              <div className="modal-detail-row">

                <div className="modal-detail-label">
                  MESSAGE
                </div>

                <div className="modal-detail-value">
                  {selected.message ||
                    "No message provided."}
                </div>

              </div>

            </div>

            <div className="modal-footer">

              <button
                type="button"
                className="modal-footer-button modal-whatsapp"
                onClick={() =>
                  contactUser(selected)
                }
              >
                💬 Contact on WhatsApp
              </button>

              <button
                type="button"
                className="modal-footer-button modal-property"
                onClick={() =>
                  openProperty(selected)
                }
              >
                🏠 View Property
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}
