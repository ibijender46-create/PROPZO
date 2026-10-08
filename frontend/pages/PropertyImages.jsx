import React, { useEffect, useMemo, useState } from "react";
import {
  getProperties,
  getProjects,
  getEnquiries,
  getFavorites,
  deleteProperty,
} from "../src/api";

export default function OwnerDashboard() {
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setMessage("");

      const results = await Promise.allSettled([
        getProperties(),
        getProjects(),
        getEnquiries(),
        getFavorites(),
      ]);

      const extract = (result, key) => {
        if (result.status !== "fulfilled") return [];

        const data = result.value;

        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.[key])) return data[key];
        if (Array.isArray(data?.data)) return data.data;

        return [];
      };

      setProperties(extract(results[0], "properties"));
      setProjects(extract(results[1], "projects"));
      setEnquiries(extract(results[2], "enquiries"));
      setFavorites(extract(results[3], "favorites"));
    } catch (error) {
      console.error("Owner dashboard error:", error);
      setMessage(error?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const activeProperties = properties.filter((property) => {
      const status = String(property?.status || "active").toLowerCase();

      return !["sold", "inactive", "rejected"].includes(status);
    }).length;

    const pendingProperties = properties.filter((property) => {
      const status = String(property?.status || "").toLowerCase();

      return ["pending", "review", "draft"].includes(status);
    }).length;

    const soldProperties = properties.filter((property) => {
      return String(property?.status || "").toLowerCase() === "sold";
    }).length;

    const newEnquiries = enquiries.filter((enquiry) => {
      const status = String(enquiry?.status || "new").toLowerCase();

      return ["new", "pending"].includes(status);
    }).length;

    return {
      totalProperties: properties.length,
      activeProperties,
      pendingProperties,
      soldProperties,
      enquiries: enquiries.length,
      newEnquiries,
      favorites: favorites.length,
      projects: projects.length,
    };
  }, [properties, enquiries, favorites, projects]);

  const filteredProperties = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return properties;

    return properties.filter((property) =>
      [
        property?.title,
        property?.location,
        property?.city,
        property?.state,
        property?.property_type,
        property?.listing_type,
        property?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [properties, search]);

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
      property?.image_url ||
      property?.image ||
      property?.thumbnail ||
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
    );
  }

  function propertyTitle(property) {
    return property?.title || "Untitled Property";
  }

  function propertyLocation(property) {
    return (
      property?.location ||
      property?.city ||
      property?.state ||
      "Location unavailable"
    );
  }

  function propertyStatus(status) {
    const value = String(status || "active").toLowerCase();

    if (
      ["approved", "active", "published", "available"].includes(value)
    ) {
      return "active";
    }

    if (["pending", "review", "draft"].includes(value)) {
      return "pending";
    }

    if (
      ["sold", "rejected", "inactive", "blocked"].includes(value)
    ) {
      return "danger";
    }

    return "neutral";
  }

  function viewProperty(id) {
    if (!id) return;
    window.location.hash = `property/${id}`;
  }

  function editProperty(id) {
    if (!id) return;
    window.location.hash = `edit-property/${id}`;
  }

  function addProperty() {
    window.location.hash = "post-property";
  }

  function openEnquiries() {
    window.location.hash = "my-enquiries";
  }

  function openFavorites() {
    window.location.hash = "favorites";
  }

  function openProfile() {
    window.location.hash = "profile";
  }

  async function removeProperty(id) {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      await deleteProperty(id);

      setProperties((current) =>
        current.filter((property) => property?.id !== id)
      );

      setMessage("Property deleted successfully.");
    } catch (error) {
      setMessage(error?.message || "Unable to delete property.");
    }
  }

  function contactEnquiry(enquiry) {
    const phone = String(
      enquiry?.phone ||
        enquiry?.mobile ||
        enquiry?.contact_phone ||
        ""
    ).replace(/\D/g, "");

    if (!phone) {
      window.alert("Customer phone number is not available.");
      return;
    }

    const customer = enquiry?.name || enquiry?.full_name || "Customer";

    const text = encodeURIComponent(
      `Hello ${customer}, regarding your property enquiry on PROZPO.`
    );

    window.open(
      `https://wa.me/${phone}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function switchTab(tab) {
    setActiveTab(tab);
    if (tab !== "properties") {
      setSearch("");
    }
  }

  if (loading) {
    return (
      <>
        <style>{`
          .owner-loading{
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f8fafc;
            color:#475569;
            font-family:Inter,system-ui,sans-serif;
          }

          .owner-loading-box{
            text-align:center;
            font-weight:800;
          }

          .owner-spinner{
            width:42px;
            height:42px;
            margin:0 auto 14px;
            border:4px solid #dbeafe;
            border-top-color:#2563eb;
            border-radius:50%;
            animation:ownerSpin .8s linear infinite;
          }

          @keyframes ownerSpin{
            to{transform:rotate(360deg);}
          }
        `}</style>

        <div className="owner-loading">
          <div className="owner-loading-box">
            <div className="owner-spinner" />
            Loading Owner Dashboard...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        *{
          box-sizing:border-box;
        }

        .owner-page{
          min-height:100vh;
          padding:28px 18px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.10),
              transparent 32%
            ),
            #f8fafc;
          color:#0f172a;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .owner-container{
          width:100%;
          max-width:1280px;
          margin:0 auto;
        }

        .owner-hero{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:20px;
          padding:30px;
          margin-bottom:22px;
          border-radius:24px;
          color:white;
          background:linear-gradient(135deg,#0f172a,#2563eb);
          box-shadow:0 20px 55px rgba(37,99,235,.18);
        }

        .owner-hero h1{
          margin:0 0 8px;
          font-size:clamp(28px,4vw,42px);
          font-weight:950;
          line-height:1.1;
        }

        .owner-hero p{
          margin:0;
          max-width:680px;
          color:#dbeafe;
          font-size:14px;
          line-height:1.6;
        }

        .owner-actions{
          display:flex;
          gap:8px;
        }

        .owner-btn{
          min-height:44px;
          padding:12px 17px;
          border:0;
          border-radius:10px;
          background:white;
          color:#1d4ed8;
          font-size:13px;
          font-weight:900;
          cursor:pointer;
          white-space:nowrap;
        }

        .owner-btn.secondary{
          border:1px solid rgba(255,255,255,.25);
          background:rgba(255,255,255,.12);
          color:white;
        }

        .owner-tabs{
          display:flex;
          gap:7px;
          overflow-x:auto;
          padding:5px;
          margin-bottom:22px;
          border:1px solid #e2e8f0;
          border-radius:13px;
          background:white;
        }

        .owner-tab{
          border:0;
          padding:11px 17px;
          border-radius:9px;
          background:transparent;
          color:#64748b;
          font-size:12px;
          font-weight:900;
          cursor:pointer;
          white-space:nowrap;
        }

        .owner-tab.active{
          background:#2563eb;
          color:white;
        }

        .owner-stats{
          display:grid;
          grid-template-columns:repeat(5,minmax(0,1fr));
          gap:14px;
          margin-bottom:22px;
        }

        .owner-stat{
          padding:18px;
          border:1px solid #e2e8f0;
          border-radius:17px;
          background:white;
          box-shadow:0 8px 25px rgba(15,23,42,.05);
        }

        .owner-stat-icon{
          margin-bottom:7px;
          font-size:21px;
        }

        .owner-stat-label{
          color:#64748b;
          font-size:10px;
          font-weight:900;
          text-transform:uppercase;
        }

        .owner-stat-value{
          margin-top:5px;
          color:#0f172a;
          font-size:26px;
          font-weight:950;
        }

        .owner-section{
          padding:23px;
          border:1px solid #e2e8f0;
          border-radius:20px;
          background:white;
          box-shadow:0 8px 28px rgba(15,23,42,.05);
        }

        .owner-section + .owner-section{
          margin-top:22px;
        }

        .owner-section-head{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
          margin-bottom:20px;
        }

        .owner-section-head h2{
          margin:0;
          color:#0f172a;
          font-size:21px;
          font-weight:950;
        }

        .owner-section-head p{
          margin:5px 0 0;
          color:#64748b;
          font-size:12px;
        }

        .owner-search{
          width:300px;
          max-width:100%;
          min-height:42px;
          padding:10px 13px;
          border:1px solid #dbe3ee;
          border-radius:10px;
          outline:none;
          color:#0f172a;
          font-size:13px;
        }

        .owner-search:focus{
          border-color:#2563eb;
          box-shadow:0 0 0 3px rgba(37,99,235,.09);
        }

        .owner-message{
          margin-bottom:20px;
          padding:12px 15px;
          border-radius:10px;
          background:#eff6ff;
          color:#1d4ed8;
          font-size:13px;
          font-weight:800;
          text-align:center;
        }

        .owner-overview{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:22px;
        }

        .owner-grid{
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:17px;
        }

        .owner-card{
          overflow:hidden;
          border:1px solid #e2e8f0;
          border-radius:16px;
          background:white;
          transition:.2s;
        }

        .owner-card:hover{
          transform:translateY(-3px);
          box-shadow:0 15px 35px rgba(15,23,42,.09);
        }

        .owner-card-image{
          position:relative;
          height:175px;
          background:#e2e8f0;
        }

        .owner-card-image img{
          width:100%;
          height:100%;
          display:block;
          object-fit:cover;
        }

        .owner-status{
          position:absolute;
          top:10px;
          left:10px;
          padding:6px 9px;
          border-radius:20px;
          font-size:9px;
          font-weight:950;
          text-transform:uppercase;
        }

        .owner-status.active{
          background:#dcfce7;
          color:#166534;
        }

        .owner-status.pending{
          background:#fef3c7;
          color:#92400e;
        }

        .owner-status.danger{
          background:#fee2e2;
          color:#991b1b;
        }

        .owner-status.neutral{
          background:#f1f5f9;
          color:#475569;
        }

        .owner-card-body{
          padding:15px;
        }

        .owner-card-body h3{
          margin:0 0 6px;
          color:#0f172a;
          font-size:16px;
          font-weight:950;
          line-height:1.35;
        }

        .owner-location{
          margin:0 0 8px;
          color:#64748b;
          font-size:11px;
          line-height:1.5;
        }

        .owner-meta{
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          margin-bottom:11px;
        }

        .owner-chip{
          padding:5px 7px;
          border-radius:7px;
          background:#eff6ff;
          color:#1d4ed8;
          font-size:9px;
          font-weight:900;
        }

        .owner-price{
          margin-bottom:12px;
          color:#2563eb;
          font-size:17px;
          font-weight:950;
        }

        .owner-card-actions{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:6px;
        }

        .owner-card-btn{
          min-height:35px;
          border:0;
          border-radius:8px;
          cursor:pointer;
          font-size:10px;
          font-weight:900;
        }

        .owner-view{
          background:#eff6ff;
          color:#1d4ed8;
        }

        .owner-edit{
          background:#f1f5f9;
          color:#334155;
        }

        .owner-delete{
          background:#fee2e2;
          color:#b91c1c;
        }

        .owner-mini-list{
          display:grid;
          gap:10px;
        }

        .owner-mini-item{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          padding:13px;
          border:1px solid #edf2f7;
          border-radius:10px;
          background:#f8fafc;
        }

        .owner-mini-item strong{
          color:#0f172a;
          font-size:12px;
        }

        .owner-mini-item span{
          color:#64748b;
          font-size:10px;
        }

        .owner-mini-number{
          min-width:34px;
          padding:6px 8px;
          border-radius:20px;
          background:#dbeafe;
          color:#1d4ed8;
          text-align:center;
          font-size:10px;
          font-weight:950;
        }

        .owner-quick{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:10px;
        }

        .owner-quick-btn{
          min-height:105px;
          padding:16px;
          border:1px solid #e2e8f0;
          border-radius:14px;
          background:white;
          color:#0f172a;
          text-align:left;
          cursor:pointer;
          transition:.2s;
        }

        .owner-quick-btn:hover{
          transform:translateY(-2px);
          border-color:#bfdbfe;
          background:#eff6ff;
        }

        .owner-quick-icon{
          margin-bottom:8px;
          font-size:24px;
        }

        .owner-quick-title{
          font-size:12px;
          font-weight:950;
        }

        .owner-quick-text{
          margin-top:3px;
          color:#64748b;
          font-size:10px;
        }

        .owner-enquiries{
          display:grid;
          gap:10px;
        }

        .owner-enquiry{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
          padding:14px;
          border:1px solid #e2e8f0;
          border-radius:11px;
        }

        .owner-enquiry h3{
          margin:0 0 5px;
          color:#0f172a;
          font-size:13px;
          font-weight:950;
        }

        .owner-enquiry p{
          margin:0 0 3px;
          color:#64748b;
          font-size:11px;
        }

        .owner-enquiry-actions{
          display:flex;
          align-items:center;
          gap:7px;
        }

        .owner-enquiry-status{
          padding:6px 9px;
          border-radius:20px;
          background:#fef3c7;
          color:#92400e;
          font-size:9px;
          font-weight:950;
          white-space:nowrap;
        }

        .owner-wa{
          border:0;
          padding:8px 11px;
          border-radius:8px;
          background:#16a34a;
          color:white;
          font-size:10px;
          font-weight:900;
          cursor:pointer;
        }

        .owner-empty{
          padding:45px 20px;
          border:1px dashed #cbd5e1;
          border-radius:14px;
          color:#64748b;
          text-align:center;
        }

        .owner-empty-icon{
          margin-bottom:9px;
          font-size:42px;
        }

        .owner-empty h3{
          margin:0 0 6px;
          color:#0f172a;
        }

        .owner-empty p{
          margin:0;
          font-size:13px;
        }

        .owner-project-list{
          display:grid;
          gap:10px;
        }

        .owner-project{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
          padding:14px;
          border:1px solid #e2e8f0;
          border-radius:11px;
          background:#fff;
        }

        .owner-project h3{
          margin:0 0 4px;
          font-size:13px;
          font-weight:900;
        }

        .owner-project p{
          margin:0;
          color:#64748b;
          font-size:11px;
        }

        .owner-project-count{
          min-width:40px;
          padding:7px 10px;
          border-radius:20px;
          background:#eff6ff;
          color:#1d4ed8;
          font-size:10px;
          font-weight:900;
          text-align:center;
        }

        @media(max-width:1100px){
          .owner-stats{
            grid-template-columns:repeat(3,minmax(0,1fr));
          }

          .owner-grid{
            grid-template-columns:repeat(2,minmax(0,1fr));
          }
        }

        @media(max-width:800px){
          .owner-overview{
            grid-template-columns:1fr;
          }
        }

        @media(max-width:700px){
          .owner-page{
            padding:20px 12px 55px;
          }

          .owner-hero{
            align-items:flex-start;
            flex-direction:column;
            padding:22px;
          }

          .owner-actions{
            width:100%;
          }

          .owner-btn{
            flex:1;
          }

          .owner-stats{
            grid-template-columns:repeat(2,minmax(0,1fr));
          }

          .owner-section{
            padding:16px;
          }

          .owner-section-head{
            align-items:flex-start;
            flex-direction:column;
          }

          .owner-search{
            width:100%;
          }

          .owner-grid{
            grid-template-columns:1fr;
          }

          .owner-enquiry{
            align-items:flex-start;
            flex-direction:column;
          }

          .owner-enquiry-actions{
            width:100%;
            justify-content:space-between;
          }
        }

        @media(max-width:450px){
          .owner-stats{
            grid-template-columns:1fr;
          }

          .owner-actions{
            flex-direction:column;
          }

          .owner-quick{
            grid-template-columns:1fr;
          }

          .owner-card-actions{
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <main className="owner-page">
        <div className="owner-container">

          <section className="owner-hero">
            <div>
              <h1>Owner Dashboard</h1>

              <p>
                Manage your properties, track enquiries,
                monitor listing status and manage your
                PROZPO account from one place.
              </p>
            </div>

            <div className="owner-actions">
              <button
                type="button"
                className="owner-btn"
                onClick={addProperty}
              >
                + Post Property
              </button>

              <button
                type="button"
                className="owner-btn secondary"
                onClick={loadDashboard}
              >
                ↻ Refresh
              </button>
            </div>
          </section>

          {message && (
            <div className="owner-message">
              {message}
            </div>
          )}

          <div className="owner-tabs">
            <button
              type="button"
              className={`owner-tab ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => switchTab("overview")}
            >
              Overview
            </button>

            <button
              type="button"
              className={`owner-tab ${
                activeTab === "properties" ? "active" : ""
              }`}
              onClick={() => switchTab("properties")}
            >
              My Properties
            </button>

            <button
              type="button"
              className={`owner-tab ${
                activeTab === "enquiries" ? "active" : ""
              }`}
              onClick={() => switchTab("enquiries")}
            >
              Enquiries
            </button>

            <button
              type="button"
              className="owner-tab"
              onClick={openFavorites}
            >
              Favorites
            </button>
          </div>

          <section className="owner-stats">
            <div className="owner-stat">
              <div className="owner-stat-icon">🏠</div>
              <div className="owner-stat-label">Total Properties</div>
              <div className="owner-stat-value">
                {stats.totalProperties}
              </div>
            </div>

            <div className="owner-stat">
              <div className="owner-stat-icon">🟢</div>
              <div className="owner-stat-label">Active</div>
              <div className="owner-stat-value">
                {stats.activeProperties}
              </div>
            </div>

            <div className="owner-stat">
              <div className="owner-stat-icon">⏳</div>
              <div className="owner-stat-label">Pending</div>
              <div className="owner-stat-value">
                {stats.pendingProperties}
              </div>
            </div>

            <div className="owner-stat">
              <div className="owner-stat-icon">📩</div>
              <div className="owner-stat-label">Enquiries</div>
              <div className="owner-stat-value">
                {stats.enquiries}
              </div>
            </div>

            <div className="owner-stat">
              <div className="owner-stat-icon">❤️</div>
              <div className="owner-stat-label">Favorites</div>
              <div className="owner-stat-value">
                {stats.favorites}
              </div>
            </div>
          </section>

          {activeTab === "overview" && (
            <>
              <div className="owner-overview">

                <section className="owner-section">
                  <div className="owner-section-head">
                    <div>
                      <h2>Property Summary</h2>
                      <p>Current listing performance</p>
                    </div>
                  </div>

                  <div className="owner-mini-list">

                    <div className="owner-mini-item">
                      <div>
                        <strong>Active Properties</strong>
                        <br />
                        <span>Currently available</span>
                      </div>
                      <div className="owner-mini-number">
                        {stats.activeProperties}
                      </div>
                    </div>

                    <div className="owner-mini-item">
                      <div>
                        <strong>Pending Properties</strong>
                        <br />
                        <span>Waiting for review</span>
                      </div>
                      <div className="owner-mini-number">
                        {stats.pendingProperties}
                      </div>
                    </div>

                    <div className="owner-mini-item">
                      <div>
                        <strong>Sold Properties</strong>
                        <br />
                        <span>Completed listings</span>
                      </div>
                      <div className="owner-mini-number">
                        {stats.soldProperties}
                      </div>
                    </div>

                    <div className="owner-mini-item">
                      <div>
                        <strong>New Enquiries</strong>
                        <br />
                        <span>Need your attention</span>
                      </div>
                      <div className="owner-mini-number">
                        {stats.newEnquiries}
                      </div>
                    </div>

                  </div>
                </section>

                <section className="owner-section">
                  <div className="owner-section-head">
                    <div>
                      <h2>Quick Actions</h2>
                      <p>Frequently used owner tools</p>
                    </div>
                  </div>

                  <div className="owner-quick">

                    <button
                      type="button"
                      className="owner-quick-btn"
                      onClick={addProperty}
                    >
                      <div className="owner-quick-icon">➕</div>
                      <div className="owner-quick-title">
                        Post Property
                      </div>
                      <div className="owner-quick-text">
                        Add a new listing
                      </div>
                    </button>

                    <button
                      type="button"
                      className="owner-quick-btn"
                      onClick={openEnquiries}
                    >
                      <div className="owner-quick-icon">📩</div>
                      <div className="owner-quick-title">
                        Enquiries
                      </div>
                      <div className="owner-quick-text">
                        View customer leads
                      </div>
                    </button>

                    <button
                      type="button"
                      className="owner-quick-btn"
                      onClick={openFavorites}
                    >
                      <div className="owner-quick-icon">❤️</div>
                      <div className="owner-quick-title">
                        Favorites
                      </div>
                      <div className="owner-quick-text">
                        Saved properties
                      </div>
                    </button>

                    <button
                      type="button"
                      className="owner-quick-btn"
                      onClick={openProfile}
                    >
                      <div className="owner-quick-icon">👤</div>
                      <div className="owner-quick-title">
                        Profile
                      </div>
                      <div className="owner-quick-text">
                        Manage your account
                      </div>
                    </button>

                  </div>
                </section>

              </div>

              <section className="owner-section">
                <div className="owner-section-head">
                  <div>
                    <h2>Recent Properties</h2>
                    <p>Your latest property listings</p>
                  </div>

                  <button
                    type="button"
                    className="owner-btn"
                    style={{
                      minHeight: "38px",
                      padding: "9px 14px",
                      border: "1px solid #dbeafe",
                      background: "#eff6ff",
                    }}
                    onClick={() => switchTab("properties")}
                  >
                    View All
                  </button>
                </div>

                {properties.length === 0 ? (
                  <div className="owner-empty">
                    <div className="owner-empty-icon">🏠</div>
                    <h3>No Properties Yet</h3>
                    <p>
                      Start by posting your first property
                      on PROZPO.
                    </p>
                  </div>
                ) : (
                  <div className="owner-grid">
                    {properties.slice(0, 6).map((property, index) => (
                      <PropertyCard
                        key={property?.id || `property-${index}`}
                        property={property}
                        propertyImage={propertyImage}
                        propertyTitle={propertyTitle}
                        propertyLocation={propertyLocation}
                        propertyStatus={propertyStatus}
                        money={money}
                        viewProperty={viewProperty}
                        editProperty={editProperty}
                        removeProperty={removeProperty}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="owner-section">
                <div className="owner-section-head">
                  <div>
                    <h2>Recent Enquiries</h2>
                    <p>
                      Latest customer interest in your
                      properties
                    </p>
                  </div>
                </div>

                <EnquiryList
                  enquiries={enquiries.slice(0, 5)}
                  contactEnquiry={contactEnquiry}
                  formatDate={formatDate}
                />
              </section>

              <section className="owner-section">
                <div className="owner-section-head">
                  <div>
                    <h2>My Projects</h2>
                    <p>
                      Projects associated with your account
                    </p>
                  </div>
                </div>

                {projects.length === 0 ? (
                  <div className="owner-empty">
                    <div className="owner-empty-icon">🏗️</div>
                    <h3>No Projects Found</h3>
                    <p>
                      Your projects will appear here when
                      available.
                    </p>
                  </div>
                ) : (
                  <div className="owner-project-list">
                    {projects.slice(0, 5).map((project, index) => (
                      <div
                        className="owner-project"
                        key={project?.id || `project-${index}`}
                      >
                        <div>
                          <h3>
                            {project?.name ||
                              project?.title ||
                              "Project"}
                          </h3>
                          <p>
                            {project?.location ||
                              project?.city ||
                              "Location unavailable"}
                          </p>
                        </div>

                        <div className="owner-project-count">
                          {project?.status || "Active"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {activeTab === "properties" && (
            <section className="owner-section">
              <div className="owner-section-head">
                <div>
                  <h2>My Properties</h2>
                  <p>Manage all your property listings</p>
                </div>

                <input
                  type="search"
                  className="owner-search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search your properties..."
                />
              </div>

              {filteredProperties.length === 0 ? (
                <div className="owner-empty">
                  <div className="owner-empty-icon">🔎</div>
                  <h3>No Properties Found</h3>
                  <p>
                    Try another search term or post a new
                    property.
                  </p>
                </div>
              ) : (
                <div className="owner-grid">
                  {filteredProperties.map((property, index) => (
                    <PropertyCard
                      key={property?.id || `property-${index}`}
                      property={property}
                      propertyImage={propertyImage}
                      propertyTitle={propertyTitle}
                      propertyLocation={propertyLocation}
                      propertyStatus={propertyStatus}
                      money={money}
                      viewProperty={viewProperty}
                      editProperty={editProperty}
                      removeProperty={removeProperty}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "enquiries" && (
            <section className="owner-section">
              <div className="owner-section-head">
                <div>
                  <h2>Property Enquiries</h2>
                  <p>
                    Manage customer leads and enquiries
                  </p>
                </div>
              </div>

              <EnquiryList
                enquiries={enquiries}
                contactEnquiry={contactEnquiry}
                formatDate={formatDate}
                detailed
              />
            </section>
          )}

        </div>
      </main>
    </>
  );
}

function PropertyCard({
  property,
  propertyImage,
  propertyTitle,
  propertyLocation,
  propertyStatus,
  money,
  viewProperty,
  editProperty,
  removeProperty,
}) {
  return (
    <article className="owner-card">
      <div className="owner-card-image">
        <img
          src={propertyImage(property)}
          alt={propertyTitle(property)}
          loading="lazy"
        />

        <span
          className={`owner-status ${propertyStatus(
            property?.status
          )}`}
        >
          {property?.status || "Active"}
        </span>
      </div>

      <div className="owner-card-body">
        <h3>{propertyTitle(property)}</h3>

        <p className="owner-location">
          📍 {propertyLocation(property)}
        </p>

        <div className="owner-meta">
          {property?.property_type && (
            <span className="owner-chip">
              {property.property_type}
            </span>
          )}

          {property?.listing_type && (
            <span className="owner-chip">
              {property.listing_type}
            </span>
          )}

          {property?.area && (
            <span className="owner-chip">
              {property.area} {property.area_unit || "sq ft"}
            </span>
          )}

          {property?.bedrooms && (
            <span className="owner-chip">
              {property.bedrooms} BHK
            </span>
          )}
        </div>

        <div className="owner-price">
          {money(property?.price)}
        </div>

        <div className="owner-card-actions">
          <button
            type="button"
            className="owner-card-btn owner-view"
            onClick={() => viewProperty(property?.id)}
          >
            View
          </button>

          <button
            type="button"
            className="owner-card-btn owner-edit"
            onClick={() => editProperty(property?.id)}
          >
            Edit
          </button>

          <button
            type="button"
            className="owner-card-btn owner-delete"
            onClick={() => removeProperty(property?.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function EnquiryList({
  enquiries,
  contactEnquiry,
  formatDate,
  detailed = false,
}) {
  if (!enquiries || enquiries.length === 0) {
    return (
      <div className="owner-empty">
        <div className="owner-empty-icon">📩</div>

        <h3>No Enquiries Yet</h3>

        <p>
          Customer enquiries will appear here when someone
          contacts you.
        </p>
      </div>
    );
  }

  return (
    <div className="owner-enquiries">
      {enquiries.map((enquiry, index) => (
        <div
          className="owner-enquiry"
          key={enquiry?.id || `enquiry-${index}`}
        >
          <div>
            <h3>
              {enquiry?.name ||
                enquiry?.full_name ||
                "Customer"}
            </h3>

            <p>
              Property:{" "}
              {enquiry?.property_title ||
                enquiry?.property?.title ||
                enquiry?.title ||
                "Property Enquiry"}
            </p>

            <p>
              Phone:{" "}
              {enquiry?.phone ||
                enquiry?.mobile ||
                "Not provided"}
            </p>

            {detailed && (
              <>
                <p>
                  Email:{" "}
                  {enquiry?.email || "Not provided"}
                </p>

                {enquiry?.message && (
                  <p>
                    Message: {enquiry.message}
                  </p>
                )}
              </>
            )}

            <p>
              Received:{" "}
              {formatDate(enquiry?.created_at)}
            </p>
          </div>

          <div className="owner-enquiry-actions">
            <span className="owner-enquiry-status">
              {enquiry?.status || "New"}
            </span>

            <button
              type="button"
              className="owner-wa"
              onClick={() => contactEnquiry(enquiry)}
            >
              WhatsApp
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
