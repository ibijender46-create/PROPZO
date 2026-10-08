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

    if (match) {
      return match[1];
    }

    const params = new URLSearchParams(window.location.search);

    return params.get("id");
  }

  async function loadProperty() {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const id = getPropertyId();

      if (!id) {
        throw new Error("Property ID not found.");
      }

      setPropertyId(id);

      const response = await getProperty(id);

      const property =
        response?.property ||
        response?.data ||
        response;

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
        description: property.description || "",
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
        area_unit: property.area_unit || "sq ft",
        furnishing:
          property.furnishing || "Unfurnished",
        possession:
          property.possession || "Ready to Move",
      });
    } catch (error) {
      console.error("Edit property loading error:", error);

      setMessage(
        error?.message || "Unable to load property."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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
      form.price === null ||
      Number(form.price) <= 0
    ) {
      return "Enter a valid property price.";
    }

    if (!form.description.trim()) {
      return "Property description is required.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);

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
          form.bedrooms !== ""
            ? Number(form.bedrooms)
            : null,

        bathrooms:
          form.bathrooms !== ""
            ? Number(form.bathrooms)
            : null,

        area:
          form.area !== ""
            ? Number(form.area)
            : null,

        area_unit:
          form.area_unit || "sq ft",

        furnishing:
          form.furnishing,

        possession:
          form.possession,

        updated_at:
          new Date().toISOString(),
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
      <div className="edit-loading">
        <div className="edit-loading-box">
          <div className="edit-spinner"></div>
          <p>Loading property...</p>
        </div>

        <style>{`
          .edit-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background:
              radial-gradient(
                circle at top left,
                rgba(37,99,235,.12),
                transparent 35%
              ),
              #f8fafc;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .edit-loading-box {
            text-align: center;
            color: #475569;
          }

          .edit-loading-box p {
            margin: 14px 0 0;
            font-weight: 800;
          }

          .edit-spinner {
            width: 42px;
            height: 42px;
            margin: 0 auto;
            border: 4px solid #dbeafe;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: editSpin .8s linear infinite;
          }

          @keyframes editSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .edit-property-page {
          min-height: 100vh;
          padding: 40px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.09),
              transparent 35%
            ),
            linear-gradient(
              180deg,
              #f8fafc 0%,
              #eef4ff 100%
            );
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .edit-property-container {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
        }

        .edit-top {
          margin-bottom: 24px;
        }

        .edit-back {
          min-height: 44px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          padding: 10px 17px;
          background: #ffffff;
          color: #334155;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 5px 18px rgba(15,23,42,.05);
          transition: .2s ease;
        }

        .edit-back:hover {
          transform: translateY(-1px);
          border-color: #93c5fd;
          color: #1d4ed8;
        }

        .edit-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .edit-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 15px;
          border-radius: 999px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .8px;
        }

        .edit-header h1 {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(32px, 5vw, 48px);
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: -1.5px;
        }

        .edit-header p {
          margin: 0 auto;
          max-width: 650px;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
        }

        .edit-card {
          padding: 32px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          background: rgba(255,255,255,.98);
          box-shadow:
            0 20px 60px rgba(15,23,42,.08);
        }

        .edit-section {
          margin-bottom: 32px;
        }

        .edit-section:last-child {
          margin-bottom: 0;
        }

        .edit-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #0f172a;
          font-size: 19px;
          line-height: 1.3;
          font-weight: 900;
        }

        .edit-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .edit-group {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .edit-full {
          grid-column: 1 / -1;
        }

        .edit-label {
          margin-bottom: 7px;
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .edit-required {
          color: #dc2626;
        }

        .edit-input,
        .edit-select,
        .edit-textarea {
          width: 100%;
          min-height: 46px;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid #cbd5e1;
          border-radius: 11px;
          background: #ffffff;
          color: #0f172a;
          font-family: inherit;
          font-size: 15px;
          outline: none;
          transition:
            border-color .18s ease,
            box-shadow .18s ease;
        }

        .edit-input:focus,
        .edit-select:focus,
        .edit-textarea:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.10);
        }

        .edit-input::placeholder,
        .edit-textarea::placeholder {
          color: #94a3b8;
        }

        .edit-textarea {
          min-height: 150px;
          resize: vertical;
          line-height: 1.6;
        }

        .edit-help {
          margin-top: 6px;
          color: #94a3b8;
          font-size: 12px;
        }

        .edit-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 8px;
        }

        .edit-button {
          min-height: 50px;
          padding: 14px 18px;
          border: 0;
          border-radius: 12px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform .18s ease,
            background .18s ease,
            opacity .18s ease;
        }

        .edit-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .edit-save {
          background: #2563eb;
          color: #ffffff;
          box-shadow:
            0 9px 22px rgba(37,99,235,.20);
        }

        .edit-save:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .edit-cancel {
          background: #f1f5f9;
          color: #334155;
        }

        .edit-cancel:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .edit-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .edit-message {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 11px;
          text-align: center;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.5;
        }

        .edit-message.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
        }

        .edit-message.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .edit-saving {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .edit-mini-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,.45);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: editSpin .7s linear infinite;
        }

        @media (max-width: 700px) {
          .edit-property-page {
            padding: 28px 14px 60px;
          }

          .edit-card {
            padding: 20px;
            border-radius: 18px;
          }

          .edit-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .edit-full {
            grid-column: auto;
          }

          .edit-actions {
            grid-template-columns: 1fr;
          }

          .edit-header {
            margin-bottom: 22px;
          }

          .edit-header h1 {
            font-size: 34px;
          }
        }

        @media (max-width: 480px) {
          .edit-property-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .edit-card {
            padding: 16px;
          }

          .edit-section-title {
            font-size: 17px;
          }

          .edit-input,
          .edit-select,
          .edit-textarea {
            font-size: 16px;
          }
        }
      `}</style>

      <main className="edit-property-page">
        <div className="edit-property-container">

          <div className="edit-top">
            <button
              type="button"
              className="edit-back"
              onClick={goBack}
            >
              ← Back
            </button>
          </div>

          <section className="edit-header">
            <span className="edit-badge">
              MANAGE PROPERTY
            </span>

            <h1>
              Edit Property
            </h1>

            <p>
              Update your property information
              and keep your listing accurate.
            </p>
          </section>

          <div className="edit-card">

            <form onSubmit={handleSubmit}>

              {/* BASIC DETAILS */}
              <section className="edit-section">
                <h2 className="edit-section-title">
                  🏠 Basic Details
                </h2>

                <div className="edit-grid">

                  <div className="edit-group edit-full">
                    <label className="edit-label">
                      Property Title{" "}
                      <span className="edit-required">
                        *
                      </span>
                    </label>

                    <input
                      className="edit-input"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Property Title"
                      required
                    />
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">
                      Location{" "}
                      <span className="edit-required">
                        *
                      </span>
                    </label>

                    <input
                      className="edit-input"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="City / Area / Locality"
                      required
                    />
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">
                      Price{" "}
                      <span className="edit-required">
                        *
                      </span>
                    </label>

                    <input
                      className="edit-input"
                      name="price"
                      type="number"
                      min="0"
                      step="any"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="Property Price"
                      required
                    />
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">
                      Property Type
                    </label>

                    <select
                      className="edit-select"
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

                  <div className="edit-group">
                    <label className="edit-label">
                      Listing Type
                    </label>

                    <select
                      className="edit-select"
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
              </section>

              {/* SPECIFICATIONS */}
              <section className="edit-section">
                <h2 className="edit-section-title">
                  📐 Property Specifications
                </h2>

                <div className="edit-grid">

                  <div className="edit-group">
                    <label className="edit-label">
                      Area
                    </label>

                    <input
                      className="edit-input"
                      name="area"
                      type="number"
                      min="0"
                      step="any"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="Property Area"
               
