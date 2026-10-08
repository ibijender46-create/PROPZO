import React, { useEffect, useState } from "react";
import { getProperty, updateProperty } from "../src/api";

const DEFAULT_FORM = {
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
  const [form, setForm] = useState(DEFAULT_FORM);
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProperty();
  }, []);

  function getId() {
    const hash = window.location.hash || "";
    const match = hash.match(/edit-property\/([^/?#]+)/);

    if (match) return match[1];

    return new URLSearchParams(
      window.location.search
    ).get("id");
  }

  async function loadProperty() {
    try {
      const id = getId();

      if (!id) {
        throw new Error("Property ID not found.");
      }

      setPropertyId(id);

      const result = await getProperty(id);

      const property =
        result?.property ||
        result?.data ||
        result;

      if (!property?.id) {
        throw new Error("Property not found.");
      }

      setForm({
        title: property.title || "",
        location: property.location || "",
        price: property.price ?? "",
        property_type:
          property.property_type || "Residential",
        listing_type:
          property.listing_type || "Sale",
        description:
          property.description || "",
        bedrooms: property.bedrooms ?? "",
        bathrooms: property.bathrooms ?? "",
        area: property.area ?? "",
        area_unit:
          property.area_unit || "sq ft",
        furnishing:
          property.furnishing || "Unfurnished",
        possession:
          property.possession || "Ready to Move",
      });
    } catch (error) {
      console.error(error);
      setMessage(
        error?.message ||
          "Unable to load property."
      );
    } finally {
      setLoading(false);
    }
  }

  function changeField(event) {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));

    setMessage("");
    setSuccess(false);
  }

  function validate() {
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

  async function saveProperty(event) {
    event.preventDefault();

    const error = validate();

    if (error) {
      setMessage(error);
      setSuccess(false);
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await updateProperty(propertyId, {
        title: form.title.trim(),
        location: form.location.trim(),
        price: Number(form.price),
        property_type: form.property_type,
        listing_type: form.listing_type,
        description: form.description.trim(),
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
      });

      setMessage(
        "Property updated successfully!"
      );
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setMessage(
        error?.message ||
          "Unable to update property."
      );
      setSuccess(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="ep-loading">
        <style>{`
          .ep-loading{
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f5f8fc;
            font-family:system-ui,sans-serif;
          }
          .ep-loader{
            width:42px;
            height:42px;
            border:4px solid #dbeafe;
            border-top-color:#2563eb;
            border-radius:50%;
            animation:spin .8s linear infinite;
          }
          .ep-loading p{
            margin-left:12px;
            color:#475569;
            font-weight:700;
          }
          @keyframes spin{
            to{transform:rotate(360deg)}
          }
        `}</style>

        <div className="ep-loader"></div>
        <p>Loading property...</p>
      </div>
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
          padding:30px 15px 70px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.10),
              transparent 32%
            ),
            #f5f8fc;
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
          width:100%;
          max-width:950px;
          margin:auto;
        }

        .ep-back{
          border:1px solid #dbe3ed;
          background:#fff;
          color:#334155;
          border-radius:10px;
          padding:10px 16px;
          font-weight:800;
          cursor:pointer;
          margin-bottom:24px;
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
          margin:12px 0 7px;
          font-size:clamp(32px,5vw,48px);
          line-height:1.1;
          font-weight:900;
        }

        .ep-header p{
          margin:0 auto;
          max-width:620px;
          color:#64748b;
          line-height:1.6;
        }

        .ep-card{
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:20px;
          padding:28px;
          box-shadow:0 18px 55px rgba(15,23,42,.08);
        }

        .ep-section{
          margin-bottom:30px;
        }

        .ep-title{
          margin:0 0 18px;
          padding-bottom:10px;
          border-bottom:1px solid #e5e7eb;
          font-size:19px;
          font-weight:900;
        }

        .ep-grid{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
        }

        .ep-full{
          grid-column:1/-1;
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
          background:#fff;
          color:#0f172a;
          padding:12px;
          font-family:inherit;
          font-size:15px;
          outline:none;
        }

        .ep-input,
        .ep-select{
          min-height:46px;
        }

        .ep-textarea{
          min-height:145px;
          resize:vertical;
          line-height:1.6;
        }

        .ep-input:focus,
        .ep-select:focus,
        .ep-textarea:focus{
          border-color:#2563eb;
          box-shadow:0 0 0 3px rgba(37,99,235,.10);
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
          padding:12px 18px;
          font-family:inherit;
          font-weight:900;
          cursor:pointer;
        }

        .ep-cancel{
          background:#f1f5f9;
          color:#334155;
        }

        .ep-save{
          background:#2563eb;
          color:#fff;
        }

        .ep-save:hover:not(:disabled){
          background:#1d4ed8;
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
          font-size:14px;
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
          gap:8px;
        }

        .ep-mini{
          width:16px;
          height:16px;
          border:2px solid rgba(255,255,255,.4);
          border-top-color:#fff;
          border-radius:50%;
          animation:spin .7s linear infinite;
        }

        @media(max-width:700px){
          .ep-page{
            padding:22px 10px 55px;
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
        }
      `}</style>

      <div className="ep-container">

        <button
          type="button"
          className="ep-back"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <header className="ep-header">
          <span className="ep-badge">
            PROZPO • MANAGE PROPERTY
          </span>

          <h1>Edit Property</h1>

          <p>
            Update your property details,
            specifications and listing information.
          </p>
        </header>

        <section className="ep-card">
          <form onSubmit={saveProperty}>

            <div className="ep-section">
              <h2 className="ep-title">
                🏠 Basic Details
              </h2>

              <div className="ep-grid">

                <div className="ep-full">
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
                    onChange={changeField}
                    placeholder="Example: 3 BHK Premium Apartment"
                    required
                  />
                </div>

                <div>
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
                    onChange={changeField}
                    placeholder="City / Locality / Area"
                    required
                  />
                </div>

                <div>
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
                    onChange={changeField}
                    placeholder="Property price"
                    required
                  />
                </div>

                <div>
                  <label className="ep-label">
                    Property Type
                  </label>

                  <select
                    className="ep-select"
                    name="property_type"
                    value={form.property_type}
                    onChange={changeField}
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

                <div>
                  <label className="ep-label">
                    Listing Type
                  </label>

                  <select
                    className="ep-select"
                    name="listing_type"
                    value={form.listing_type}
                    onChange={changeField}
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

            <div className="ep-section">
              <h2 className="ep-title">
                📐 Property Specifications
              </h2>

              <div className="ep-grid">

                <div>
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
                    onChange={changeField}
                    placeholder="Property area"
                  />
                </div>

                <div>
                  <label className="ep-label">
                    Area Unit
                  </label>

                  <select
                    className="ep-select"
                    name="area_unit"
                    value={form.area_unit}
                    onChange={changeField}
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

                <div>
                  <label className="ep-label">
                    Bedrooms
                  </label>

                  <select
                    className="ep-select"
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={changeField}
                  >
                    <option value="">
                      Select Bedrooms
                    </option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>

                <div>
                  <label className="ep-label">
                    Bathrooms
                  </label>

                  <select
                    className="ep-select"
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={changeField}
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

                <div>
                  <label className="ep-label">
                    Furnishing
                  </label>

                  <select
                    className="ep-select"
                    name="furnishing"
                    value={form.furnishing}
                    onChange={changeField}
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

                <div>
                  <label className="ep-label">
                    Possession
                  </label>

                  <select
                    className="ep-select"
                    name="possession"
                    value={form.possession}
                    onChange={changeField}
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

            <div className="ep-section">
              <h2 className="ep-title">
                📝 Description
              </h2>

              <label className="ep-label">
                Property Description
              </label>

              <textarea
                className="ep-textarea"
                name="description"
                value={form.description}
                onChange={changeField}
                placeholder="Describe the property, location, features and nearby facilities..."
              />
            </div>

            <div className="ep-actions">

              <button
                type="button"
                className="ep-btn ep-cancel"
                onClick={() => window.history.back()}
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
                    <span className="ep-mini"></span>
                    Saving...
                  </span>
                ) : (
                  "✓ Update Property"
                )}
              </button>

            </div>

            {message && (
              <div
                className={
                  "ep-message " +
                  (success
                    ? "ep-success"
                    : "ep-error")
                }
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
