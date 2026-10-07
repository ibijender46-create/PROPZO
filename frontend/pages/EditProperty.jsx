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
  furnishing: "Unfurnished",
  possession: "Ready to Move",
  parking: "",
  floor: "",
  total_floors: "",
  amenities: "",
  contact_name: "",
  contact_phone: "",
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

    const match = hash.match(
      /edit-property\/([^/?#]+)/
    );

    if (match) {
      return match[1];
    }

    const params = new URLSearchParams(
      window.location.search
    );

    return params.get("id");
  }

  async function loadProperty() {
    try {
      setLoading(true);

      const id = getPropertyId();

      if (!id) {
        throw new Error(
          "Property ID not found."
        );
      }

      setPropertyId(id);

      const response = await getProperty(id);

      const property =
        response?.property ||
        response?.data ||
        response;

      if (!property) {
        throw new Error(
          "Property not found."
        );
      }

      setForm({
        title: property.title || "",
        location:
          property.location ||
          property.address ||
          "",
        price:
          property.price !== null &&
          property.price !== undefined
            ? property.price
            : "",
        property_type:
          property.property_type ||
          "Residential",
        listing_type:
          property.listing_type ||
          "Sale",
        description:
          property.description || "",
        bedrooms:
          property.bedrooms ??
          "",
        bathrooms:
          property.bathrooms ??
          "",
        area:
          property.area ??
          "",
        furnishing:
          property.furnishing ||
          "Unfurnished",
        possession:
          property.possession ||
          "Ready to Move",
        parking:
          property.parking ??
          "",
        floor:
          property.floor ??
          "",
        total_floors:
          property.total_floors ??
          "",
        amenities: Array.isArray(
          property.amenities
        )
          ? property.amenities.join(", ")
          : property.amenities || "",
        contact_name:
          property.contact_name ||
          property.owner_name ||
          "",
        contact_phone:
          property.contact_phone ||
          property.phone ||
          "",
      });
    } catch (error) {
      console.error(
        "Edit property loading error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load property."
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

    if (!form.price) {
      return "Property price is required.";
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

    const validationError =
      validateForm();

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

        bedrooms: form.bedrooms
          ? Number(form.bedrooms)
          : null,

        bathrooms: form.bathrooms
          ? Number(form.bathrooms)
          : null,

        area: form.area
          ? Number(form.area)
          : null,

        furnishing:
          form.furnishing,

        possession:
          form.possession,

        parking: form.parking
          ? Number(form.parking)
          : null,

        floor: form.floor
          ? Number(form.floor)
          : null,

        total_floors:
          form.total_floors
            ? Number(form.total_floors)
            : null,

        amenities: form.amenities
          ? form.amenities
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          : [],

        contact_name:
          form.contact_name.trim() ||
          null,

        contact_phone:
          form.contact_phone.trim() ||
          null,

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
      <>
        <style>{`
          .edit-loading {
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

        <div className="edit-loading">
          Loading property...
        </div>
      </>
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
            #f8fafc;
        }

        .edit-property-container {
          max-width: 950px;
          margin: 0 auto;
        }

        .edit-top {
          margin-bottom: 25px;
        }

        .edit-back {
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          padding: 10px 16px;
          background: #fff;
          color: #334155;
          font-weight: 800;
          cursor: pointer;
        }

        .edit-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .edit-badge {
          display: inline-block;
          padding: 8px 15px;
          border-radius: 30px;
          background: #fef3c7;
          color: #92400e;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .7px;
          margin-bottom: 14px;
        }

        .edit-header h1 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 900;
        }

        .edit-header p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
        }

        .edit-card {
          padding: 30px;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: #fff;
          box-shadow:
            0 18px 50px rgba(15,23,42,.08);
        }

        .edit-section {
          margin-bottom: 30px;
        }

        .edit-section-title {
          margin: 0 0 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
          color: #0f172a;
          font-size: 19px;
          font-weight: 900;
        }

        .edit-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .edit-group {
          display: flex;
          flex-direction: column;
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
          box-sizing: border-box;
          padding: 13px 14px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          background: #fff;
          color: #0f172a;
          font-size: 15px;
          outline: none;
        }

        .edit-input:focus,
        .edit-select:focus,
        .edit-textarea:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.10);
        }

        .edit-textarea {
          min-height: 140px;
          resize: vertical;
          line-height: 1.6;
        }

        .edit-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 10px;
        }

        .edit-button {
          padding: 15px;
          border: 0;
          border-radius: 11px;
          font-size: 15px;
          font-weight: 850;
          cursor: pointer;
        }

        .edit-save {
          background: #2563eb;
          color: #fff;
        }

        .edit-save:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .edit-cancel {
          background: #f1f5f9;
          color: #334155;
        }

        .edit-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .edit-message {
          margin-top: 18px;
          padding: 13px 15px;
          border-radius: 10px;
          text-align: center;
          font-size: 14px;
          font-weight: 750;
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

        @media (max-width: 700px) {
          .edit-property-page {
            padding: 30px 14px 60px;
          }

          .edit-card {
            padding: 20px;
            border-radius: 17px;
          }

          .edit-grid {
            grid-template-columns: 1fr;
          }

          .edit-full {
            grid-column: auto;
          }

          .edit-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="edit-property-page">
        <div className="edit-property-container">

          <div className="edit-top">
            <button
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

              <section className="edit-section">
                <h2 className="edit-section-title">
                  📐 Property Specifications
                </h2>

                <div className="edit-grid">

                  <div className="edit-group">
                    <label className="edit-label">
                      Area (Sq. Ft.)
                    </label>

                    <input
                      className="edit-input"
                      name="area"
                      type="number"
                      min="0"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="Area"
                    />
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">
                      Bedrooms
                    </label>

                    <input
                      className="edit-input"
                      name="bedrooms"
                      type="number"
                      min="0"
                      value={form.bedrooms}
                      onChange={handleChange}
                      placeholder="Bedrooms"
                    />
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">
                      Bathrooms
                    </label>

                    <input
                      className="edit-input"
                      name="bathrooms"
                      type="number"
                      min="0"
                      value={form.bathrooms}
                      onChange={handleChange}
                      placeholder="Bathrooms"
                    />
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">
                      Parking
                    </label>

                    <input
                      className="edit-input"
                      name="parking"
                      type="number"
                      min="0"
                      value={form.parking}
                      onChange={handleChange}
                      placeholder="Parking Spaces"
                    />
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">
                      Floor
                    </label>

                    <input
                      className="edit-input"
                      name="floor"
                      type="number"
                      min="0"
                      value={form.floor}
                      onChange={handleChange}
                      placeholder="Current Floor"
                    />
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">
                      Total Floors
                    </label>

                    <input
                      className="edit-input"
                      name="total_floors"
                      type="number"
                      min="0"
                      value={form.total_floors}
                      onChange={handleChange}
                      placeholder="Total Floors"
                    />
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">
                      Furnishing
                    </label>

                    <select
                      className="edit-select"
                      name="furnishing"
                      value={form.furnishing}
                      onChange={handleChange}
                    >
                      <option value="Unfurnished">
                        Unfurnish
