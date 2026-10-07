import React, { useState } from "react";
import { createProperty } from "../src/api";

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

export default function PostProperty() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
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
      return "Please add property description.";
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

    setLoading(true);

    try {
      const propertyData = {
        title: form.title.trim(),
        location: form.location.trim(),
        price: Number(form.price),
        property_type: form.property_type,
        listing_type: form.listing_type,
        description: form.description.trim(),

        bedrooms: form.bedrooms
          ? Number(form.bedrooms)
          : null,

        bathrooms: form.bathrooms
          ? Number(form.bathrooms)
          : null,

        area: form.area
          ? Number(form.area)
          : null,

        furnishing: form.furnishing,
        possession: form.possession,

        parking: form.parking
          ? Number(form.parking)
          : null,

        floor: form.floor
          ? Number(form.floor)
          : null,

        total_floors: form.total_floors
          ? Number(form.total_floors)
          : null,

        amenities: form.amenities
          ? form.amenities
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        contact_name:
          form.contact_name.trim() || null,

        contact_phone:
          form.contact_phone.trim() || null,
      };

      await createProperty(propertyData);

      setMessage(
        "Property posted successfully on PROZPO!"
      );
      setMessageType("success");

      setForm(initialForm);
    } catch (error) {
      console.error(
        "Property posting error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to post property. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .post-property-page {
          min-height: 100vh;
          padding: 45px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37, 99, 235, 0.10),
              transparent 35%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(16, 185, 129, 0.08),
              transparent 35%
            ),
            #f8fafc;
        }

        .post-property-container {
          max-width: 950px;
          margin: 0 auto;
        }

        .post-property-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .post-property-badge {
          display: inline-block;
          padding: 8px 15px;
          border-radius: 30px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .7px;
          margin-bottom: 14px;
        }

        .post-property-header h1 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 900;
          line-height: 1.1;
        }

        .post-property-header p {
          margin: 0;
          color: #64748b;
          font-size: 16px;
          line-height: 1.6;
        }

        .post-property-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 30px;
          box-shadow:
            0 18px 50px rgba(15, 23, 42, .08);
        }

        .form-section {
          margin-bottom: 30px;
        }

        .form-section:last-of-type {
          margin-bottom: 10px;
        }

        .form-section-title {
          margin: 0 0 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
          color: #0f172a;
          font-size: 19px;
          font-weight: 850;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-label {
          margin-bottom: 7px;
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .required {
          color: #dc2626;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          background: #fff;
          color: #0f172a;
          padding: 13px 14px;
          font-size: 15px;
          outline: none;
          transition: .2s;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37, 99, 235, .10);
        }

        .form-textarea {
          min-height: 130px;
          resize: vertical;
          line-height: 1.6;
        }

        .form-help {
          margin-top: 6px;
          color: #94a3b8;
          font-size: 11px;
        }

        .submit-area {
          margin-top: 25px;
        }

        .post-button {
          width: 100%;
          padding: 16px 20px;
          border: 0;
          border-radius: 12px;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );
          color: #fff;
          font-size: 16px;
          font-weight: 850;
          cursor: pointer;
          transition: .2s;
          box-shadow:
            0 8px 20px rgba(37, 99, 235, .20);
        }

        .post-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 12px 25px rgba(37, 99, 235, .28);
        }

        .post-button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .form-message {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 11px;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
        }

        .form-message.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
        }

        .form-message.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .post-note {
          margin-top: 18px;
          padding: 13px 15px;
          border-radius: 10px;
          background: #f8fafc;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 700px) {
          .post-property-page {
            padding: 30px 14px 60px;
          }

          .post-property-card {
            padding: 20px;
            border-radius: 17px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }
        }
      `}</style>

      <main className="post-property-page">
        <div className="post-property-container">

          <section className="post-property-header">
            <span className="post-property-badge">
              LIST YOUR PROPERTY
            </span>

            <h1>
              Post Your Property
            </h1>

            <p>
              Add your property to the PROZPO real estate
              marketplace and reach genuine buyers,
              tenants and investors.
            </p>
          </section>

          <div className="post-property-card">

            <form onSubmit={handleSubmit}>

              {/* BASIC DETAILS */}
              <section className="form-section">
                <h2 className="form-section-title">
                  🏠 Basic Property Details
                </h2>

                <div className="form-grid">

                  <div className="form-group full">
                    <label className="form-label">
                      Property Title{" "}
                      <span className="required">*</span>
                    </label>

                    <input
                      className="form-input"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Example: 3 BHK Premium Apartment in Noida"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Location{" "}
                      <span className="required">*</span>
                    </label>

                    <input
                      className="form-input"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="City, Area or Locality"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Property Type
                    </label>

                    <select
                      className="form-select"
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

                  <div className="form-group">
                    <label className="form-label">
                      Listing Type
                    </label>

                    <select
                      className="form-select"
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

                  <div className="form-group">
                    <label className="form-label">
                      Price{" "}
                      <span className="required">*</span>
                    </label>

                    <input
                      className="form-input"
                      name="price"
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="Enter property price"
                      required
                    />
                  </div>

                </div>
              </section>

              {/* PROPERTY SPECIFICATIONS */}
              <section className="form-section">
                <h2 className="form-section-title">
                  📐 Property Specifications
                </h2>

                <div className="form-grid">

                  <div className="form-group">
                    <label className="form-label">
                      Area (Sq. Ft.)
                    </label>

                    <input
                      className="form-input"
                      name="area"
                      type="number"
                      min="0"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="Example: 1200"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Bedrooms
                    </label>

                    <input
                      className="form-input"
                      name="bedrooms"
                      type="number"
                      min="0"
                      value={form.bedrooms}
                      onChange={handleChange}
                      placeholder="Example: 3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Bathrooms
                    </label>

                    <input
                      className="form-input"
                      name="bathrooms"
                      type="number"
                      min="0"
                      value={form.bathrooms}
                      onChange={handleChange}
                      placeholder="Example: 2"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Parking
                    </label>

                    <input
                      className="form-input"
                      name="parking"
                      type="number"
                      min="0"
                      value={form.parking}
                      onChange={handleChange}
                      placeholder="Number of parking spaces"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Floor
                    </label>

                    <input
                      className="form-input"
                      name="floor"
                      type="number"
                      min="0"
                      value={form.floor}
                      onChange={handleChange}
                      placeholder="Current floor"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Total Floors
                    </label>

                    <input
                      className="form-input"
                      name="total_floors"
                      type="number"
                      min="0"
                      value={form.total_floors}
                      onChange={handleChange}
                      placeholder="Total building floors"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Furnishing
                    </label>

                    <select
                      className="form-select"
                      name="furnishing"
                      value={form.furnishing}
                      onChange={handleChange}
                    >
                      <option value="Unfurnished">
                        Unfurnished
                      </option>
                      <option value="Semi-Furnished">
                        Semi-Furnished
                      </option>
                      <option value="Fully Furnished">
                        Fully Furnished
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Possession
                    </label>

                    <select
                      className="form-select"
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
                      <option value="Upcoming">
                        Upcoming
                      </option>
                    </select>
                  </div>

                </div>
              </section>

              {/* DESCRIPTION */}
              <section className="form-section">
                <h2 className="form-section-title">
                  📝 Property Description
                </h2>

                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">
                      Description{" "}
                      <span className="required">*</span>
                    </label>

                    <textarea
                      className="form-textarea"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the property, location advantages, nearby facilities, amenities and other important details..."
                      required
                    />

                    <span className="form-help">
                      Detailed descriptions help buyers
                      understand your property better.
                    </span>
                  </div>

                  <div className="form-group full">
                    <label className="form-label">
                      Amenities
                    </label>

                    <input
                      className="form-input"
                      name="amenities"
                      value={form.amenities}
                      onChange={handleChange}
                      placeholder="Swimming Pool, Gym, Lift, CCTV, Parking"
                    />

                    <span className="form-help">
                      Separate multiple amenities with commas.
                    </span>
                  </div>
                </div>
              </section>

              {/* CONTACT */}
              <section className="form-section">
                <h2 className="form-section-title">
                  📞 Contact Details
                </h2>

                <div className="form-grid">

                  <div className="form-group">
                    <label className="form-label">
                      Contact Name
                    </label>

                    <input
                      className="form-input"
                      name="contact_name"
                      value={form.contact_name}
                      onChange={handleChange}
                      placeholder="Owner / Agent Name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Contact Phone
                    </label>

                    <input
                      className="form-input"
                      name="contact_phone"
                      type="tel"
                      value={form.contact_phone}
                      onChange={handleChange}
                      placeholder="Mobile Number"
                    />
                  </div>

                </div>
              </section>

              <div className="submit-area">
                <button
                  type="submit"
                  className="post-button"
                  disabled={loading}
                >
                  {loading
                    ? "Posting Property..."
                    : "🚀 Post Property on PROZPO"}
                </button>
              </div>

              {message && (
                <div
                  className={`form-message ${messageType}`}
                >
                  {message}
                </div>
              )}

              <div className="post-note">
                By posting this property, you agree to
                PROZPO's marketplace terms and property
                listing guidelines.
              </div>

            </form>

          </div>
        </div>
      </main>
    </>
  );
}
