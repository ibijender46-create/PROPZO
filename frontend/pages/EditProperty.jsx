import React, { useEffect, useState } from "react";
import { getProperty, updateProperty } from "../src/api";

const initialForm = {
  title: "",
  location: "",
  price: "",
  property_type: "Residential",
  listing_type: "Sale",
  description: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  area_unit: "sq ft",
  furnishing: "Unfurnished",
  possession: "Ready to Move",
};

export default function EditProperty() {
  const [form, setForm] = useState(initialForm);
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadProperty();
  }, []);

  function getPropertyId() {
    const hash = window.location.hash || "";
    const match = hash.match(/edit-property\/([^/?#]+)/);

    if (match) return match[1];

    const params = new URLSearchParams(
      window.location.search
    );

    return params.get("id");
  }

  async function loadProperty() {
    try {
      setLoading(true);
      setMessage("");

      const id = getPropertyId();

      if (!id) {
        throw new Error("Property ID not found.");
      }

      setPropertyId(id);

      const property = await getProperty(id);

      if (!property || !property.id) {
        throw new Error("Property not found.");
      }

      setForm({
        title: property.title || "",
        location: property.location || "",
        price:
          property.price !== null &&
          property.price !== undefined
            ? property.price
            : "",
        property_type:
          property.property_type || "Residential",
        listing_type:
          property.listing_type || "Sale",
        description:
          property.description || "",
        bedrooms:
          property.bedrooms !== null &&
          property.bedrooms !== undefined
            ? property.bedrooms
            : "",
        bathrooms:
          property.bathrooms !== null &&
          property.bathrooms !== undefined
            ? property.bathrooms
            : "",
        area:
          property.area !== null &&
          property.area !== undefined
            ? property.area
            : "",
        area_unit:
          property.area_unit || "sq ft",
        furnishing:
          property.furnishing || "Unfurnished",
        possession:
          property.possession || "Ready to Move",
      });
    } catch (error) {
      console.error("Edit property error:", error);
      setMessage(
        error?.message ||
          "Unable to load property."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (message) {
      setMessage("");
      setMessageType("");
    }
  }

  function validateForm() {
    if (!form.title.trim()) {
      return "Property title is required.";
    }

    if (!form.location.trim()) {
      return "Property location is required.";
    }

    if (
      form.price === "" ||
      Number(form.price) <= 0
    ) {
      return "Enter a valid property price.";
    }

    if (
      form.area !== "" &&
      Number(form.area) < 0
    ) {
      return "Enter a valid property area.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      setMessage(errorMessage);
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      const propertyData = {
        title: form.title.trim(),
        location: form.location.trim(),
        price: Number(form.price),

        property_type:
          form.property_type,

        listing_type:
          form.listing_type,

        description:
          form.description.trim(),

        bedrooms:
          form.bedrooms === ""
            ? null
            : Number(form.bedrooms),

        bathrooms:
          form.bathrooms === ""
            ? null
            : Number(form.bathrooms),

        area:
          form.area === ""
            ? null
            : Number(form.area),

        area_unit:
          form.area_unit || "sq ft",

        furnishing:
          form.furnishing || "Unfurnished",

        possession:
          form.possession || "Ready to Move",
      };

      await updateProperty(
        propertyId,
        propertyData
      );

      setMessage(
        "Property updated successfully!"
      );
      setMessageType("success");
    } catch (error) {
      console.error(
        "Property update error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to update property."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    window.history.back();
  }

  if (loading) {
    return (
      <>
        <style>{`
          .ep-loading{
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f6f8fc;
            font-family:Inter,system-ui,sans-serif;
          }
          .ep-loading-box{
            text-align:center;
            color:#475569;
          }
          .ep-spinner{
            width:42px;
            height:42px;
            margin:auto;
            border:4px solid #dbeafe;
            border-top-color:#2563eb;
            border-radius:50%;
            animation:epSpin .8s linear infinite;
          }
          @keyframes epSpin{
            to{transform:rotate(360deg)}
          }
        `}</style>

        <div className="ep-loading">
          <div className="ep-loading-box">
            <div className="ep-spinner"></div>
            <p>Loading property...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <main className="ep-page">
      <style>{`
        *{
          box-sizing:border-box;
        }

        .ep-page{
          min-height:100vh;
          padding:35px 16px 70px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.10),
              transparent 35%
            ),
            #f6f8fc;
          color:#172033;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .ep-container{
          max-width:980px;
          margin:auto;
        }

        .ep-back{
          border:1px solid #dbe3ed;
          background:#fff;
          color:#334155;
          border-radius:10px;
          padding:11px 16px;
          font-weight:800;
          cursor:pointer;
          margin-bottom:25px;
        }

        .ep-header{
          text-align:center;
          margin-bottom:28px;
        }

        .ep-badge{
          display:inline-block;
          padding:7px 13px;
          border-radius:30px;
          background:#eff6ff;
          border:1px solid #bfdbfe;
          color:#1d4ed8;
          font-size:11px;
          font-weight:900;
          letter-spacing:.8px;
        }

        .ep-header h1{
          margin:13px 0 8px;
          font-size:clamp(32px,5vw,48px);
          line-height:1.1;
          letter-spacing:-1.5px;
        }

        .ep-header p{
          margin:0 auto;
          max-width:620px;
          color:#64748b;
          line-height:1.6;
          font-size:14px;
        }

        .ep-card{
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:20px;
          padding:30px;
          box-shadow:
            0 20px 55px rgba(15,23,42,.08);
        }

        .ep-section{
          margin-bottom:30px;
        }

        .ep-section-title{
          margin:0 0 18px;
          padding-bottom:11px;
          border-bottom:1px solid #e5e7eb;
          font-size:19px;
          font-weight:900;
        }

        .ep-grid{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:17px;
        }

        .ep-full{
          grid-column:1/-1;
        }

        .ep-group{
          min-width:0;
        }

        .ep-label{
          display:block;
          margin-bottom:7px;
          color:#334155;
          font-size:13px;
          font-weight:800;
        }

        .ep-required{
          color:#dc2626;
        }

        .ep-input,
        .ep-select,
        .ep-textarea{
          width:100%;
          border:1px solid #cbd5e1;
          border-radius:10px;
          padding:12px;
          background:#fff;
          color:#0f172a;
          font-family:inherit;
          font-size:15px;
          outline:none;
        }

        .ep-input,
        .ep-select{
          min-height:46px;
        }

        .ep-textarea{
          min-height:140px;
          resize:vertical;
          line-height:1.6;
        }

        .ep-input:focus,
        .ep-select:focus,
        .ep-textarea:focus{
          border-color:#2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.10);
        }

        .ep-help{
          margin-top:5px;
          color:#94a3b8;
          font-size:11px;
        }

        .ep-actions{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        }

        .ep-btn{
          min-height:50px;
          border:0;
          border-radius:11px;
          padding:13px 18px;
          font-family:inherit;
          font-size:14px;
          font-weight:900;
          cursor:pointer;
        }

        .ep-save{
          background:#2563eb;
          color:#fff;
          box-shadow:
            0 9px 22px rgba(37,99,235,.20);
        }

        .ep-save:hover:not(:disabled){
          background:#1d4ed8;
        }

        .ep-cancel{
          background:#f1f5f9;
          color:#334155;
        }

        .ep-btn:disabled{
          opacity:.6;
          cursor:not-allowed;
        }

        .ep-message{
          margin-top:18px;
          padding:13px 15px;
          border-radius:10px;
          text-align:center;
          font-size:13px;
          font-weight:800;
        }

        .ep-success{
          background:#ecfdf5;
          border:1px solid #a7f3d0;
          color:#047857;
        }

        .ep-error{
          background:#fef2f2;
          border:1px solid #fecaca;
          color:#b91c1c;
        }

        .ep-saving{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
        }

        .ep-mini-spin{
          width:16px;
          height:16px;
          border:2px solid rgba(255,255,255,.4);
          border-top-color:#fff;
          border-radius:50%;
          animation:epSpin .7s linear infinite;
        }

        @media(max-width:700px){
          .ep-page{
            padding:25px 10px 55px;
          }

          .ep-card{
            padding:18px;
            border-radius:16px;
          }

          .ep-grid{
            grid-template-columns:1fr;
          }

          .ep-full{
            grid-column:auto;
          }

          .ep-actions{
            grid-template-columns:1fr;
          }

          .ep-header h1{
            font-size:35px;
          }
        }
      `}</style>

      <div className="ep-container">

        <button
          type="button"
          className="ep-back"
          onClick={goBack}
        >
          ← Back
        </button>

        <header className="ep-header">
          <span className="ep-badge">
            MANAGE PROPERTY
          </span>

          <h1>
            Edit Property
          </h1>

          <p>
            Update your property information
            and keep your PROZPO listing
            accurate and up to date.
          </p>
        </header>

        <section className="ep-card">

          <form onSubmit={handleSubmit}>

            {/* BASIC DETAILS */}

            <div className="ep-section">
              <h2 className="ep-section-title">
                🏠 Basic Details
              </h2>

              <div className="ep-grid">

                <div className="ep-group ep-full">
                  <label className="ep-label">
                    Property Title
                    <span className="ep-required">
                      {" "}*
                    </span>
                  </label>

                  <input
                    className="ep-input"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Example: 3 BHK Premium Apartment"
                    required
                  />
                </div>

                <div className="ep-group">
                  <label className="ep-label">
                    Location
                    <span className="ep-required">
                      {" "}*
                    </span>
                  </label>

                  <input
                    className="ep-input"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, locality or area"
                    required
                  />
                </div>

                <div className="ep-group">
                  <label className="ep-label">
                    Price
                    <span className="ep-required">
                      {" "}*
                    </span>
                  </label>

                  <input
                    className="ep-input"
                    name="price"
                    type="number"
                    min="0"
                    step="any"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Property price"
                    required
                  />
                </div>

                <div className="ep-group">
                  <label className="ep-label">
                    Property Type
                  </label>

                  <select
                    className="ep-select"
                    name="property_type"
                    value={form.property_type}
                    onChange={handleChange}
                  >
                    <option value="Residential">
                      Residential
                    </option>
                    <option value="Apartment">
                      Apartment
                    </option>
                    <option value="Villa">
                      Villa
                    </option>
                    <option value="House">
                      Independent House
                    </option>
                    <option value="Plot">
                      Plot
                    </option>
                    <option value="Commercial">
                      Commercial
                    </option>
                    <option value="Office">
                      Office
                    </option>
                    <option value="Shop">
                      Shop
                    </option>
                    <option value="Warehouse">
                      Warehouse
                    </option>
                  </select>
                </div>

                <div className="ep-group">
                  <label className="ep-label">
                    Listing Type
                  </label>

                  <select
                    className="ep-select"
                    name="listing_type"
                    value={form.listing_type}
                    onChange={handleChange}
                  >
                    <option value="Sale">
                      For Sale
                    </option>
                    <option value="Rent">
                      For Rent
                    </option>
                    <option value="Lease">
                      For Lease
                    </option>
                  </select>
                </div>

              </div>
            </div>

            {/* SPECIFICATIONS */}

            <div className="ep-section">
              <h2 className="ep-section-title">
                📐 Property Specifications
              </h2>

              <div className="ep-grid">

                <div className="ep-group">
                  <label className="ep-label">
                    Area
                  </label>

                  <input
                    className="ep-input"
                    name="area"
                    type="number"
                    min="0"
                    step="any"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="Property area"
                  />
                </div>

                <div className="ep-group">
                  <label className="ep-label">
                    Area Unit
                  </label>

                  <select
                    className="ep-select"
                    name="area_unit"
                    value={form.area_unit}
                    onChange={handleChange}
                  >
                    <option value="sq ft">
                      Sq. Ft.
                    </option>
                    <option value="sq yd">
                      Sq. Yd.
                    </option>
                    <option value="sq m">
                      Sq. M.
                    </option>
                    <option value="acre">
                      Acre
                    </option>
                    <option value="bigha">
                      Bigha
                    </option>
                    <option value="gaj">
                      Gaj
                    </option>
                  </select>
                </div>

                <div className="ep-group">
                  <label className="ep-label">
                    Bedrooms
                  </label>

                  <select
                    className="ep-select"
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Bedrooms
                    </option>
                    <option value="1">
                      1 BHK
                    </option>
                    <option value="2">
                      2 BHK
                    </option>
                    <option value="3">
                      3 BHK
                    </option>
                    <option value="4">
                      4 BHK
                    </option>
                    <option value="5">
                      5+ BHK
                    </option>
                  </select>
                </div>

                <div className="ep-group">
                  <label className="ep-label">
                    Bathrooms
                  </label>

                  <select
                    className="ep-select"
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Bathrooms
                    </option>
                    <option value="1">
                      1 Bathroom
                    </option>
                    <option value="2">
                      2 Bathrooms
                    </option>
                    <option value="3">
                      3 Bathrooms
                    </option>
                    <option value="4">
                      4 Bathrooms
                    </option>
                    <option value="5">
                      5+ Bathrooms
                    </option>
                  </select>
                </div>

                <div className="ep-group">
                  <label className="ep-label">
                    Furnishing
                  </label>

                  <select
                    className="ep-select"
                    name="furnishing"
                    value={form.furnishing}
                    onChange={handleChange}
                  >
                    <option value="Unfurnished">
                      Unfurnished
                    </option>
                    <option value="Semi Furnished">
                      Semi Furnished
                    </option>
                    <option value="Fully Furnished">
                      Fully Furnished
                    </option>
                  </select>
                </div>

                <div className="ep-group">
                  <label className="ep-label">
                    Possession
                  </label>

                  <select
                    className="ep-select"
                    name="possession"
                    value={form.possession}
                    onChange={handleChange}
                  >
                    <option value="Ready to Move">
                      Ready to Move
                    </option>
                    <option value="Under Construction">
                      Under Construction
                    </option>
                    <option value="New Launch">
                      New Launch
                    </option>
                    <option value="Immediate">
                      Immediate
                    </option>
                  </select>
                </div>

              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="ep-section">
              <h2 className="ep-section-title">
                📝 Property Description
              </h2>

              <div className="ep-group">
                <label className="ep-label">
                  Description
                </label>

                <textarea
                  className="ep-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the property, location, features, nearby facilities and other important details..."
                />

                <div className="ep-help">
                  Give buyers or tenants clear
                  information about the property.
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="ep-actions">

              <button
                type="button"
                className="ep-btn ep-cancel"
                onClick={goBack}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="ep-btn ep-save"
                disabled={saving}
              >
                {saving ? (
                  <span className="ep-saving">
                    <span className="ep-mini-spin"></span>
                    Saving Property...
                  </span>
                ) : (
                  "✓ Update Property"
                )}
              </button>

            </div>

            {message && (
              <div
                className={`ep-message ${
                  messageType === "success"
                    ? "ep-success"
                    : "ep-error"
                }`}
              >
                {message}
              </div>
            )}

          </form>
        </section>
      </div>
    </main>
  );
}
