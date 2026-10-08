import React, { useMemo, useState } from "react";
import { createProperty } from "../src/api";

const initialForm = {
  title: "",
  location: "",
  city: "",
  state: "",
  price: "",
  property_type: "Apartment",
  listing_type: "Sale",
  area: "",
  area_unit: "Sq. Ft.",
  bedrooms: "",
  bathrooms: "",
  furnishing: "Unfurnished",
  possession: "Ready to Move",
  image_url: "",
  description: "",
};

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
  "Office",
  "Shop",
  "Warehouse",
];

const AMENITIES = [
  "Parking",
  "Swimming Pool",
  "Gym",
  "Lift",
  "CCTV",
  "Security",
  "Power Backup",
  "Park",
  "Club House",
  "Gated Community",
  "Visitor Parking",
  "24x7 Water",
];

const LISTING_TYPES = [
  "Sale",
  "Rent",
  "Lease",
];

const AREA_UNITS = [
  "Sq. Ft.",
  "Sq. Yards",
  "Sq. M.",
  "Acres",
  "Bigha",
];

const FURNISHING_TYPES = [
  "Unfurnished",
  "Semi-Furnished",
  "Fully Furnished",
];

const POSSESSION_TYPES = [
  "Ready to Move",
  "Under Construction",
  "Upcoming",
];

function formatPrice(value) {
  const number = Number(value);

  if (!number || Number.isNaN(number)) {
    return "₹ Price";
  }

  if (number >= 10000000) {
    return `₹ ${(number / 10000000).toFixed(2)} Cr`;
  }

  if (number >= 100000) {
    return `₹ ${(number / 100000).toFixed(2)} L`;
  }

  if (number >= 1000) {
    return `₹ ${(number / 1000).toFixed(1)}K`;
  }

  return `₹ ${number.toLocaleString("en-IN")}`;
}

function getInitials(value) {
  if (!value) return "P";

  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function PostProperty() {
  const [form, setForm] = useState(initialForm);
  const [selectedAmenities, setSelectedAmenities] =
    useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");

  const [previewImageError, setPreviewImageError] =
    useState(false);

  const [step, setStep] = useState(1);

  const progress = useMemo(() => {
    if (step === 1) return 33;
    if (step === 2) return 66;
    return 100;
  }, [step]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "image_url") {
      setPreviewImageError(false);
    }
  }

  function toggleAmenity(amenity) {
    setSelectedAmenities((previous) => {
      if (previous.includes(amenity)) {
        return previous.filter(
          (item) => item !== amenity
        );
      }

      return [...previous, amenity];
    });
  }

  function validateStepOne() {
    if (!form.title.trim()) {
      return "Property title is required.";
    }

    if (!form.location.trim()) {
      return "Property location is required.";
    }

    if (!form.city.trim()) {
      return "City is required.";
    }

    if (!form.state.trim()) {
      return "State is required.";
    }

    if (!form.price) {
      return "Property price is required.";
    }

    if (Number(form.price) <= 0) {
      return "Please enter a valid property price.";
    }

    return "";
  }

  function validateStepTwo() {
    if (form.area && Number(form.area) <= 0) {
      return "Please enter a valid property area.";
    }

    if (
      form.bedrooms &&
      Number(form.bedrooms) < 0
    ) {
      return "Please enter valid bedrooms.";
    }

    if (
      form.bathrooms &&
      Number(form.bathrooms) < 0
    ) {
      return "Please enter valid bathrooms.";
    }

    return "";
  }

  function nextStep() {
    setMessage("");
    setMessageType("");

    if (step === 1) {
      const error = validateStepOne();

      if (error) {
        setMessage(error);
        setMessageType("error");
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      const error = validateStepTwo();

      if (error) {
        setMessage(error);
        setMessageType("error");
        return;
      }

      setStep(3);
    }
  }

  function previousStep() {
    setMessage("");
    setMessageType("");

    if (step > 1) {
      setStep((previous) => previous - 1);
    }
  }

  function validateFinalForm() {
    const stepOneError = validateStepOne();

    if (stepOneError) {
      return stepOneError;
    }

    const stepTwoError = validateStepTwo();

    if (stepTwoError) {
      return stepTwoError;
    }

    if (!form.description.trim()) {
      return "Please add a property description.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const token =
      localStorage.getItem(
        "prozpo_access_token"
      );

    if (!token) {
      setMessage(
        "Please login before posting a property."
      );
      setMessageType("error");

      setTimeout(() => {
        window.location.hash = "auth";
      }, 900);

      return;
    }

    const validationError =
      validateFinalForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      let finalDescription =
        form.description.trim();

      if (selectedAmenities.length > 0) {
        finalDescription +=
          `\n\nAmenities: ${selectedAmenities.join(
            ", "
          )}`;
      }

      const propertyData = {
        title: form.title.trim(),

        location: form.location.trim(),

        city: form.city.trim(),

        state: form.state.trim(),

        price: Number(form.price),

        property_type:
          form.property_type,

        listing_type:
          form.listing_type,

        area: form.area
          ? Number(form.area)
          : null,

        area_unit:
          form.area_unit,

        bedrooms: form.bedrooms
          ? Number(form.bedrooms)
          : null,

        bathrooms: form.bathrooms
          ? Number(form.bathrooms)
          : null,

        furnishing:
          form.furnishing,

        possession:
          form.possession,

        description:
          finalDescription,

        image_url:
          form.image_url.trim() || null,

        status: "active",
      };

      const result =
        await createProperty(
          propertyData
        );

      if (!result) {
        throw new Error(
          "Property could not be created."
        );
      }

      setMessage(
        "🎉 Property posted successfully on PROZPO!"
      );

      setMessageType("success");

      setForm(initialForm);
      setSelectedAmenities([]);
      setStep(1);

      setTimeout(() => {
        window.location.hash =
          "my-properties";
      }, 1400);
    } catch (error) {
      console.error(
        "PROZPO property posting error:",
        error
      );

      const errorMessage =
        error?.message ||
        "Unable to post property. Please try again.";

      if (
        errorMessage
          .toLowerCase()
          .includes("authentication")
      ) {
        localStorage.removeItem(
          "prozpo_access_token"
        );

        setMessage(
          "Your login session has expired. Please login again."
        );

        setTimeout(() => {
          window.location.hash = "auth";
        }, 1200);
      } else {
        setMessage(errorMessage);
      }

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="prozpo-post-page">

      {/* BACKGROUND DECORATION */}

      <div className="post-orb post-orb-one" />
      <div className="post-orb post-orb-two" />
      <div className="post-grid" />

      <div className="post-container">

        {/* HEADER */}

        <header className="post-header">

          <div className="post-badge">
            <span className="post-badge-dot" />
            PROZPO PROPERTY LISTING
          </div>

          <h1>
            List Your Property
            <span>
              Find the Right Buyer
            </span>
          </h1>

          <p>
            Add your property to India's modern
            real-estate marketplace and connect
            with genuine buyers, tenants and
            property seekers.
          </p>

          <div className="post-trust-row">

            <span>
              ✓ Easy Listing
            </span>

            <span>
              ✓ Reach Buyers
            </span>

            <span>
              ✓ Fast Enquiries
            </span>

            <span>
              ✓ PROZPO Marketplace
            </span>

          </div>

        </header>

        {/* PROGRESS */}

        <section className="post-progress-card">

          <div className="progress-top">

            <div>
              <span>
                STEP {step} OF 3
              </span>

              <strong>
                {step === 1 &&
                  "Property Information"}

                {step === 2 &&
                  "Property Specifications"}

                {step === 3 &&
                  "Description & Publish"}
              </strong>
            </div>

            <div className="progress-percent">
              {progress}%
            </div>

          </div>

          <div className="progress-track">
            <div
              className="progress-value"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="progress-steps">

            <div
              className={
                step >= 1
                  ? "progress-step active"
                  : "progress-step"
              }
            >
              <span>1</span>
              <small>Basic Details</small>
            </div>

            <div
              className={
                step >= 2
                  ? "progress-step active"
                  : "progress-step"
              }
            >
              <span>2</span>
              <small>Specifications</small>
            </div>

            <div
              className={
                step >= 3
                  ? "progress-step active"
                  : "progress-step"
              }
            >
              <span>3</span>
              <small>Publish</small>
            </div>

          </div>

        </section>

        {/* MAIN LAYOUT */}

        <div className="post-layout">

          {/* FORM */}

          <section className="post-form-card">

            <form onSubmit={handleSubmit}>

              {/* STEP 1 */}

              {step === 1 && (
                <div className="form-step">

                  <div className="step-heading">

                    <div className="step-icon">
                      🏠
                    </div>

                    <div>
                      <span>
                        STEP 01
                      </span>

                      <h2>
                        Basic Property Details
                      </h2>

                      <p>
                        Tell buyers what kind of
                        property you are listing.
                      </p>
                    </div>

                  </div>

                  <div className="form-grid">

                    <div className="field full">

                      <label>
                        Property Title
                        <b>*</b>
                      </label>

                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Premium 3 BHK Apartment in Noida"
                        required
                      />

                      <small>
                        Use a clear and attractive
                        title for better enquiries.
                      </small>

                    </div>

                    <div className="field">

                      <label>
                        Property Location
                        <b>*</b>
                      </label>

                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Sector 62, Noida"
                        required
                      />

                    </div>

                    <div className="field">

                      <label>
                        City
                        <b>*</b>
                      </label>

                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Noida"
                        required
                      />

                    </div>

                    <div className="field">

                      <label>
                        State
                        <b>*</b>
                      </label>

                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="Uttar Pradesh"
                        required
                      />

                    </div>

                    <div className="field">

                      <label>
                        Price
                        <b>*</b>
                      </label>

                      <div className="input-with-prefix">
                        <span>₹</span>

                        <input
                          name="price"
                          type="number"
                          min="1"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="8500000"
                          required
                        />
                      </div>

                    </div>

                  </div>

                  {/* LISTING TYPE */}

                  <div className="choice-section">

                    <label className="choice-label">
                      Listing Type
                    </label>

                    <div className="choice-grid">

                      {LISTING_TYPES.map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            className={
                              form.listing_type ===
                              type
                                ? "choice-card selected"
                                : "choice-card"
                            }
                            onClick={() =>
                              setForm(
                                (previous) => ({
                                  ...previous,
                                  listing_type:
                                    type,
                                })
                              )
                            }
                          >
                            <span>
                              {type ===
                                "Sale" &&
                                "🏷️"}

                              {type ===
                                "Rent" &&
                                "🔑"}

                              {type ===
                                "Lease" &&
                                "📄"}
                            </span>

                            <strong>
                              For {type}
                            </strong>

                            {form.listing_type ===
                              type && (
                              <i>
                                ✓
                              </i>
                            )}
                          </button>
                        )
                      )}

                    </div>

                  </div>

                  {/* PROPERTY TYPE */}

                  <div className="choice-section">

                    <label className="choice-label">
                      Property Type
                    </label>

                    <div className="type-grid">

                      {PROPERTY_TYPES.map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            className={
                              form.property_type ===
                              type
                                ? "type-card selected"
                                : "type-card"
                            }
                            onClick={() =>
                              setForm(
                                (previous) => ({
                                  ...previous,
                                  property_type:
                                    type,
                                })
                              )
                            }
                          >
                            <span>
                              {type ===
                                "Apartment" &&
                                "🏢"}

                              {type ===
                                "Villa" &&
                                "🏡"}

                              {type ===
                                "Independent House" &&
                                "🏠"}

                              {type ===
                                "Plot" &&
                                "📐"}

                              {type ===
                                "Commercial" &&
                                "🏬"}

                              {type ===
                                "Office" &&
                                "💼"}

                              {type ===
                                "Shop" &&
                                "🛍️"}

                              {type ===
                                "Warehouse" &&
                                "🏭"}
                            </span>

                            <strong>
                              {type}
                            </strong>
                          </button>
                        )
                      )}

                    </div>

                  </div>

                  <div className="step-actions">

                    <button
                      type="button"
                      className="next-button"
                      onClick={nextStep}
                    >
                      Continue to Specifications
                      <span>→</span>
                    </button>

                  </div>

                </div>
              )}

              {/* STEP 2 */}

              {step === 2 && (
                <div className="form-step">

                  <div className="step-heading">

                    <div className="step-icon green">
                      📐
                    </div>

                    <div>
                      <span>
                        STEP 02
                      </span>

                      <h2>
                        Property Specifications
                      </h2>

                      <p>
                        Add important property
                        specifications for buyers.
                      </p>
                    </div>

                  </div>

                  <div className="form-grid">

                    <div className="field">

                      <label>
                        Property Area
                      </label>

                      <input
                        name="area"
                        type="number"
                        min="0"
                        value={form.area}
                        onChange={handleChange}
                        placeholder="1200"
                      />

                    </div>

                    <div className="field">

                      <label>
                        Area Unit
                      </label>

                      <select
                        name="area_unit"
                        value={form.area_unit}
                        onChange={handleChange}
                      >
                        {AREA_UNITS.map(
                          (unit) => (
                            <option
                              key={unit}
                              value={unit}
                            >
                              {unit}
                            </option>
                          )
                        )}
                      </select>

                    </div>

                    <div className="field">

                      <label>
                        Bedrooms
                      </label>

                      <select
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
                          5 BHK
                        </option>

                        <option value="6">
                          6+ BHK
                        </option>
                      </select>

                    </div>

                    <div className="field">

                      <label>
                        Bathrooms
                      </label>

                      <select
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

                    <div className="field">

                      <label>
                        Furnishing
                      </label>

                      <select
                        name="furnishing"
                        value={form.furnishing}
                        onChange={handleChange}
                      >
                        {FURNISHING_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          )
                        )}
                      </select>

                    </div>

                    <div className="field">

                      <label>
                        Possession
                      </label>

                      <select
                        name="possession"
                        value={form.possession}
                        onChange={handleChange}
                      >
                        {POSSESSION_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          )
                        )}
                      </select>

                    </div>

                  </div>

                  {/* AMENITIES */}

                  <div className="amenity-section">

                    <div className="amenity-heading">

                      <div>
                        <label>
                          Property Amenities
                        </label>

                        <small>
                          Select available
                          facilities.
                        </small>
                      </div>

                      <span>
                        {selectedAmenities.length}
                        {" "}selected
                      </span>

                    </div>

                    <div className="amenity-grid">

                      {AMENITIES.map(
                        (amenity) => {
                          const selected =
                            selectedAmenities.includes(
                              amenity
                            );

                          return (
                            <button
                              key={amenity}
                              type="button"
                              className={
                                selected
                                  ? "amenity-chip selected"
                                  : "amenity-chip"
                              }
                              onClick={() =>
                                toggleAmenity(
                                  amenity
                                )
                              }
                            >
                              <span>
                                {selected
                                  ? "✓"
                                  : "+"}
                              </span>

                              {amenity}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* IMAGE */}

                  <div className="image-url-section">

                    <label>
                      Property Image URL
                    </label>

                    <input
                      name="image_url"
                      value={form.image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/property-image.jpg"
                    />

                    <small>
                      Add a direct public image URL.
                      The image will be shown on
                      property cards and details.
                    </small>

                  </div>

                  <div className="step-actions two">

                    <button
                      type="button"
                      className="back-button"
                      onClick={previousStep}
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      className="next-button"
                      onClick={nextStep}
                    >
                      Continue to Publish
                      <span>→</span>
                    </button>

                  </div>

                </div>
              )}

              {/* STEP 3 */}

              {step === 3 && (
                <div className="form-step">

                  <div className="step-heading">

                    <div className="step-icon orange">
                      🚀
                    </div>

                    <div>
                      <span>
                        STEP 03
                      </span>

                      <h2>
                        Description & Publish
                      </h2>

                      <p>
                        Add the final details and
                        publish your property.
                      </p>
                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="field full">

                    <label>
                      Property Description
                      <b>*</b>
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe your property, location advantages, nearby facilities, connectivity, investment benefits and other important details..."
                      required
                    />

                    <small>
                      A detailed description can
                      help generate better enquiries.
                    </small>

                  </div>

                  {/* SELECTED AMENITIES */}

                  {selectedAmenities.length >
                    0 && (
                    <div className="selected-amenities-box">

                      <strong>
                        Selected Amenities
                      </strong>

                      <div>
                        {selectedAmenities.map(
                          (amenity) => (
                            <span
                              key={amenity}
                            >
                              ✓ {amenity}
                            </span>
                          )
                        )}
                      </div>

                    </div>
                  )}

                  {/* IMAGE PREVIEW */}

                  <div className="final-image-preview">

                    <div className="preview-heading">
                      <span>
                        PROPERTY PREVIEW
                      </span>

                      <strong>
                        Live Listing Preview
                      </strong>
                    </div>

                    <div className="preview-card">

                      <div className="preview-image">

                        {form.image_url &&
                        !previewImageError ? (
                          <img
                            src={form.image_url}
                            alt={
                              form.title ||
                              "Property"
                            }
                            onError={() =>
                              setPreviewImageError(
                                true
                              )
                            }
                          />
                        ) : (
                          <div className="preview-placeholder">

                            <div>
                              {getInitials(
                                form.title
                              )}
                            </div>

                            <span>
                              Property Image
                            </span>

                          </div>
                        )}

                        <div className="preview-badge">
                          {form.listing_type}
                        </div>

                      </div>

                      <div className="preview-content">

                        <div className="preview-price">
                          {formatPrice(
                            form.price
                          )}
                        </div>

                        <h3>
                          {form.title ||
                            "Your Property Title"}
                        </h3>

                        <p>
                          📍{" "}
                          {form.location ||
                            "Property Location"}
                          {form.city
                            ? `, ${form.city}`
                            : ""}
                        </p>

                        <div className="preview-meta">

                          {form.area && (
                            <span>
                              📐 {form.area}{" "}
                              {form.area_unit}
                            </span>
                          )}

                          {form.bedrooms && (
                            <span>
                              🛏️{" "}
                              {form.bedrooms} BHK
                            </span>
                          )}

                          {form.bathrooms && (
                            <span>
                              🚿{" "}
                              {form.bathrooms} Bath
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* PUBLISH */}

                  <div className="publish-info">

                    <div className="publish-icon">
                      ✓
                    </div>

                    <div>
                      <strong>
                        Ready to publish?
                      </strong>

                      <p>
                        Your property will be saved
                        as an active PROZPO listing.
                        It can then appear on relevant
                        property sections based on its
                        listing type and property type.
                      </p>
                    </div>

                  </div>

                  <div className="step-actions two">

                    <button
                      type="button"
                      className="back-button"
                      onClick={previousStep}
                      disabled={loading}
                    >
                      ← Back
                    </button>

                    <button
                      type="submit"
                      className="publish-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="button-spinner" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          🚀 Publish Property
                          <span>→</span>
                        </>
                      )}
                    </button>

                  </div>

                </div>
              )}

              {/* MESSAGE */}

              {message && (
                <div
                  className={
                    messageType === "success"
                      ? "post-message success"
                      : "post-message error"
                  }
                >
                  <span>
                    {messageType === "success"
                      ? "✓"
                      : "!"}
                  </span>

                  <p>{message}</p>
                </div>
              )}

            </form>

          </section>

          {/* RIGHT PREVIEW */}

          <aside className="post-sidebar">

            {/* LIVE PREVIEW */}

            <div className="sidebar-card live-preview-card">

              <div className="sidebar-card-heading">

                <div>
                  <span>
                    LIVE PREVIEW
                  </span>

                  <strong>
                    Your Property
                  </strong>
                </div>

                <div className="live-dot">
                  <span />
                  LIVE
                </div>

              </div>

              <div className="side-property">

                <div className="side-property-image">

                  {form.image_url &&
                  !previewImageError ? (
                    <img
                      src={form.image_url}
                      alt={
                        form.title ||
                        "Property preview"
                      }
                      onError={() =>
                        setPreviewImageError(
                          true
                        )
                      }
                    />
                  ) : (
                    <div className="side-placeholder">
                      🏠
                    </div>
                  )}

                  <span>
                    {form.listing_type}
                  </span>

                </div>

                <div className="side-property-body">

                  <strong>
                    {form.title ||
                      "Your Property"}
                  </strong>

                  <p>
                    📍{" "}
                    {form.city ||
                      "City"}
                    {form.state
                      ? `, ${form.state}`
                      : ""}
                  </p>

                  <b>
                    {formatPrice(
                      form.price
                    )}
                  </b>

                  <div className="side-property-meta">

                    <span>
                      {form.property_type}
                    </span>

                    {form.area && (
                      <span>
                        {form.area}{" "}
                        {form.area_unit}
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* BENEFITS */}

            <div className="sidebar-card">

              <div className="sidebar-title">
                Why List on PROZPO?
              </div>

              <div className="benefit-list">

                <div className="benefit">
                  <span>👥</span>
                  <div>
                    <strong>
                      Reach Property Seekers
                    </strong>
                    <p>
                      Showcase your property
                      to people actively
                      looking for real estate.
                    </p>
                  </div>
                </div>

                <div className="benefit">
                  <span>⚡</span>
                  <div>
                    <strong>
                      Quick Enquiries
                    </strong>
                    <p>
                      Make it easier for buyers
                      and tenants to discover
                      your listing.
                    </p>
                  </div>
                </div>

                <div className="benefit">
                  <span>📍</span>
                  <div>
                    <strong>
                      Location Discovery
                    </strong>
                    <p>
                      Your city and location
                      help users find relevant
                      properties.
                    </p>
                  </div>
                </div>

                <div className="benefit">
                  <span>📱</span>
                  <div>
                    <strong>
                      Marketplace Visibility
                    </strong>
                    <p>
                      Your active listing can
                      appear across relevant
                      PROZPO sections.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* LISTING FLOW */}

            <div className="sidebar-card listing-flow">

              <div className="sidebar-title">
                PROZPO Listing Flow
              </div>

              <div className="flow-item">
                <span>1</span>
                <div>
                  <strong>
                    Create Listing
                  </strong>
                  <small>
                    Add property details
                  </small>
                </div>
              </div>

              <div className="flow-line" />

              <div className="flow-item">
                <span>2</span>
                <div>
                  <strong>
                    Publish
                  </strong>
                  <small>
                    Listing becomes active
                  </small>
                </div>
              </div>

              <div className="flow-line" />

              <div className="flow-item">
                <span>3</span>
                <div>
                  <strong>
                    Property Discovery
                  </strong>
                  <small>
                    Relevant sections can
                    show your property
                  </small>
                </div>
              </div>

              <div className="flow-line" />

              <div className="flow-item">
                <span>4</span>
                <div>
                  <strong>
                    Enquiries
                  </strong>
                  <small>
                    Connect with property seekers
                  </small>
                </div>
              </div>

            </div>

          </aside>

        </div>

      </div>

      <style>{`

        .prozpo-post-page {
          --primary: #2563eb;
          --primary-dark: #1d4ed8;
          --cyan: #0ea5e9;
          --green: #10b981;
          --orange: #f97316;
          --navy: #07152f;
          --text: #0f172a;
          --muted: #64748b;
          --border: #e2e8f0;

          position: relative;
          min-height: 100vh;
          padding: 68px 20px 100px;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 10% 5%,
              rgba(37,99,235,.12),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 30%,
              rgba(20,184,166,.09),
              transparent 25%
            ),
            #f8fafc;
          color: var(--text);
        }

        .prozpo-post-page *,
        .prozpo-post-page *::before,
        .prozpo-post-page *::after {
          box-sizing: border-box;
        }

        .prozpo-post-page button,
        .prozpo-post-page input,
        .prozpo-post-page select,
        .prozpo-post-page textarea {
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .post-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(15px);
        }

        .post-orb-one {
          width: 420px;
          height: 420px;
          left: -230px;
          top: 180px;
          background: rgba(37,99,235,.08);
          animation: postOrbOne 8s ease-in-out infinite;
        }

        .post-orb-two {
          width: 360px;
          height: 360px;
          right: -190px;
          bottom: 80px;
          background: rgba(16,185,129,.07);
          animation: postOrbTwo 9s ease-in-out infinite;
        }

        .post-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .35;
          background-image:
            linear-gradient(
              rgba(148,163,184,.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(148,163,184,.08) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 80%
            );
        }

        .post-container {
          position: relative;
          z-index: 2;
          width: min(100%, 1240px);
          margin: 0 auto;
        }

        /* HEADER */

        .post-header {
          max-width: 850px;
          margin: 0 auto 38px;
          text-align: center;
          animation: postFadeUp .65s ease both;
        }

        .post-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 9px 14px;
          border: 1px solid #bfdbfe;
          border-radius: 999px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1.2px;
        }

        .post-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow:
            0 0 0 5px rgba(16,185,129,.09),
            0 0 15px rgba(16,185,129,.65);
          animation: postPulse 1.8s infinite;
        }

        .post-header h1 {
          margin: 20px 0 13px;
          color: #0f172a;
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.02;
          letter-spacing: -2.8px;
          font-weight: 950;
        }

        .post-header h1 span {
          display: block;
          background:
            linear-gradient(
              90deg,
              #2563eb,
              #0ea5e9,
              #10b981
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .post-header > p {
          max-width: 730px;
          margin: 0 auto;
          color: #64748b;
          font-size: 15px;
          line-height: 1.75;
        }

        .post-trust-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 20px;
        }

        .post-trust-row span {
          padding: 7px 11px;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          background: rgba(255,255,255,.8);
          color: #475569;
          font-size: 10px;
          font-weight: 800;
        }

        /* PROGRESS */

        .post-progress-card {
          max-width: 900px;
          margin: 0 auto 25px;
          padding: 20px 22px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: rgba(255,255,255,.92);
          box-shadow:
            0 12px 35px rgba(15,23,42,.06);
          backdrop-filter: blur(12px);
          animation: postFadeUp .7s ease both;
        }

        .progress-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .progress-top span {
          display: block;
          margin-bottom: 3px;
          color: #2563eb;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 1px;
        }

        .progress-top strong {
          display: block;
          color: #0f172a;
          font-size: 14px;
          font-weight: 900;
        }

        .progress-percent {
          color: #2563eb;
          font-size: 18px;
          font-weight: 950;
        }

        .progress-track {
          height: 7px;
          margin-top: 14px;
          overflow: hidden;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .progress-value {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #2563eb,
              #0ea5e9,
              #10b981
            );
          transition: width .45s ease;
        }

        .progress-steps {
          display: grid;
          grid-template-columns:
            repeat(3,1fr);
          gap: 10px;
          margin-top: 14px;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #94a3b8;
        }

        .progress-step span {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          font-size: 10px;
          font-weight: 950;
        }

        .progress-step small {
          font-size: 10px;
          font-weight: 800;
        }

        .progress-step.active {
          color: #2563eb;
        }

        .progress-step.active span {
          background: #2563eb;
          color: #ffffff;
          box-shadow:
            0 5px 12px rgba(37,99,235,.22);
        }

        /* LAYOUT */

        .post-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            330px;
          align-items: start;
          gap: 22px;
        }

        .post-form-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: #ffffff;
          box-shadow:
            0 18px 55px rgba(15,23,42,.08);
          animation: postFadeUp .8s ease both;
        }

        .form-step {
          padding: 32px;
          animation: stepIn .35s ease both;
        }

        .step-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 28px;
        }

        .step-icon {
          flex: 0 0 auto;
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #eff6ff;
          font-size: 22px;
          box-shadow:
            inset 0 0 0 1px #dbeafe;
        }

        .step-icon.green {
          background: #ecfdf5;
          box-shadow:
            inset 0 0 0 1px #bbf7d0;
        }

        .step-icon.orange {
          background: #fff7ed;
          box-shadow:
            inset 0 0 0 1px #fed7aa;
        }

        .step-heading span {
          color: #2563eb;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 1.2px;
        }

        .step-heading h2 {
          margin: 3px 0 5px;
          color: #0f172a;
          font-size: 23px;
          font-weight: 950;
          letter-spacing: -.6px;
        }

        .step-heading p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        /* FORM */

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 17px;
        }

        .field {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label,
        .choice-label,
        .image-url-section > label,
        .amenity-heading label {
          color: #334155;
          font-size: 11px;
          font-weight: 900;
        }

        .field label b {
          margin-left: 3px;
          color: #dc2626;
        }

        .field small,
        .image-url-section small {
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.5;
        }

        .field input,
        .field select,
        .field textarea,
        .image-url-section input {
          width: 100%;
          min-height: 48px;
          padding: 12px 13px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          font-size: 13px;
          font-weight: 650;
          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            transform .2s ease;
        }

        .field textarea {
          min-height: 170px;
          resize: vertical;
          line-height: 1.7;
        }

        .field input::placeholder,
        .field textarea::placeholder,
        .image-url-section input::placeholder {
          color: #a0aec0;
          font-weight: 500;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus,
        .image-url-section input:focus {
          border-color: #60a5fa;
          box-shadow:
            0 0 0 4px rgba(37,99,235,.08);
        }

        .input-with-prefix {
          position: relative;
        }

        .input-with-prefix > span {
          position: absolute;
          z-index: 2;
          left: 13px;
          top: 50%;
          color: #2563eb;
          font-weight: 950;
          transform: translateY(-50%);
        }

        .input-with-prefix input {
          padding-left: 30px;
        }

        /* CHOICES */

        .choice-section {
          margin-top: 26px;
        }

        .choice-label {
          display: block;
          margin-bottom: 10px;
        }

        .choice-grid {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 10px;
        }

        .choice-card {
          position: relative;
          min-height: 72px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #ffffff;
          color: #334155;
          text-align: left;
          cursor: pointer;
          transition: .2s ease;
        }

        .choice-card:hover,
        .choice-card.selected {
          border-color: #60a5fa;
          background: #eff6ff;
          transform: translateY(-2px);
        }

        .choice-card > span {
          font-size: 20px;
        }

        .choice-card strong {
          font-size: 12px;
          font-weight: 900;
        }

        .choice-card i {
          position: absolute;
          top: 7px;
          right: 8px;
          width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #2563eb;
          color: #ffffff;
          font-size: 9px;
          font-style: normal;
        }

        .type-grid {
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 9px;
        }

        .type-card {
          min-height: 75px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding: 9px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: .2s ease;
        }

        .type-card:hover,
        .type-card.selected {
          border-color: #93c5fd;
          background: #eff6ff;
          color: #1d4ed8;
          transform: translateY(-2px);
        }

        .type-card span {
          font-size: 21px;
        }

        .type-card strong {
          font-size: 10px;
          font-weight: 850;
          text-align: center;
        }

        /* AMENITIES */

        .amenity-section {
          margin-top: 27px;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: #f8fafc;
        }

        .amenity-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 13px;
        }

        .amenity-heading label,
        .amenity-heading small {
          display: block;
        }

        .amenity-heading small {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 9px;
        }

        .amenity-heading > span {
          padding: 5px 8px;
          border-radius: 999px;
          background: #ffffff;
          color: #2563eb;
          font-size: 9px;
          font-weight: 900;
        }

        .amenity-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .amenity-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border: 1px solid #dbe3ee;
          border-radius: 999px;
          background: #ffffff;
          color: #475569;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: .18s ease;
        }

        .amenity-chip:hover,
        .amenity-chip.selected {
          border-color: #60a5fa;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .amenity-chip span {
          font-weight: 950;
        }

        /* IMAGE */

        .image-url-section {
          display: grid;
          gap: 7px;
          margin-top: 22px;
        }

        /* ACTIONS */

        .step-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 30px;
        }

        .step-actions.two {
          justify-content: space-between;
        }

        .next-button,
        .publish-button,
        .back-button {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 19px;
          border-radius: 11px;
          font-size: 12px;
          font-weight: 950;
          cursor: pointer;
          transition: .2s ease;
        }

        .next-button,
        .publish-button {
          border: 0;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0ea5e9
            );
          color: #ffffff;
          box-shadow:
            0 10px 24px rgba(37,99,235,.20);
        }

        .next-button:hover,
        .publish-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 14px 30px rgba(37,99,235,.29);
        }

        .back-button {
          border: 1px solid #dbe3ee;
          background: #ffffff;
          color: #475569;
        }

        .back-button:hover:not(:disabled) {
          border-color: #93c5fd;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .publish-button {
          min-width: 210px;
        }

        .publish-button:disabled,
        .back-button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: buttonSpin .7s linear infinite;
        }

        /* SELECTED */

        .selected-amenities-box {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #bbf7d0;
          border-radius: 13px;
          background: #f0fdf4;
        }

        .selected-amenities-box strong {
          display: block;
          margin-bottom: 9px;
          color: #166534;
          font-size: 11px;
        }

        .selected-amenities-box > div {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .selected-amenities-box span {
          padding: 6px 8px;
          border-radius: 999px;
          background: #dcfce7;
          color: #166534;
          font-size: 9px;
          font-weight: 800;
        }

        /* PREVIEW */

        .final-image-preview {
          margin-top: 25px;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #f8fafc;
        }

        .preview-heading {
          margin-bottom: 13px;
        }

        .preview-heading span,
        .preview-heading strong {
          display: block;
        }

        .preview-heading span {
          color: #2563eb;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 1px;
        }

        .preview-heading strong {
          margin-top: 3px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 950;
        }

        .preview-card {
          display: grid;
          grid-template-columns: 190px 1fr;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #ffffff;
        }

        .preview-image {
          position: relative;
          min-height: 180px;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #ccfbf1
            );
        }

        .preview-image img {
          width: 100%;
          height: 100%;
          min-height: 180px;
          display: block;
          object-fit: cover;
        }

        .preview-placeholder {
          width: 100%;
          height: 100%;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #64748b;
        }

        .preview-placeholder div {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #2563eb;
          color: #ffffff;
          font-size: 20px;
          font-weight: 950;
          box-shadow:
            0 10px 22px rgba(37,99,235,.22);
        }

        .preview-placeholder span {
          font-size: 9px;
          font-weight: 800;
        }

        .preview-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 6px 8px;
          border-radius: 999px;
          background: #ffffff;
          color: #1d4ed8;
          font-size: 8px;
          font-weight: 950;
          box-shadow:
            0 5px 15px rgba(15,23,42,.12);
        }

        .preview-content {
          padding: 17px;
        }

        .preview-price {
          color: #2563eb;
          font-size: 18px;
          font-weight: 950;
        }

        .preview-content h3 {
          margin: 5px 0 6px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 950;
        }

        .preview-content p {
          margin: 0;
          color: #64748b;
          font-size: 10px;
        }

        .preview-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 14px;
        }

        .preview-meta span {
          padding: 6px 7px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #475569;
          font-size: 8px;
          font-weight: 800;
        }

        /* PUBLISH INFO */

        .publish-info {
          display: flex;
          gap: 11px;
          margin-top: 22px;
          padding: 15px;
          border: 1px solid #bfdbfe;
          border-radius: 13px;
          background: #eff6ff;
        }

        .publish-icon {
          flex: 0 0 auto;
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #2563eb;
          color: #ffffff;
          font-weight: 950;
        }

        .publish-info strong {
          color: #1e3a8a;
          font-size: 11px;
        }

        .publish-info p {
          margin: 4px 0 0;
          color: #475569;
          font-size: 9px;
          line-height: 1.6;
        }

        /* MESSAGE */

        .post-message {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 18px;
          padding: 13px;
          border-radius: 11px;
          font-size: 11px;
          font-weight: 750;
        }

        .post-message span {
          flex: 0 0 auto;
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #ffffff;
          font-weight: 950;
        }

        .post-message p {
          margin: 0;
        }

        .post-message.success {
          border: 1px solid #a7f3d0;
          background: #ecfdf5;
          color: #047857;
        }

        .post-message.success span {
          background: #10b981;
        }

        .post-message.error {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .post-message.error span {
          background: #ef4444;
        }

        /* SIDEBAR */

        .post-sidebar {
          position: sticky;
          top: 20px;
          display: grid;
          gap: 16px;
        }

        .sidebar-card {
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: rgba(255,255,255,.94);
          box-shadow:
            0 14px 38px rgba(15,23,42,.06);
          backdrop-filter: blur(12px);
        }

        .sidebar-card-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 14px;
        }

        .sidebar-card-heading span:first-child {
          display: block;
          color: #2563eb;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 1px;
        }

        .sidebar-card-heading strong {
          display: block;
          margin-top: 3px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 950;
        }

        .live-dot {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #059669;
          font-size: 8px;
          font-weight: 950;
        }

        .live-dot span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px rgba(16,185,129,.7);
          animation: postPulse 1.6s infinite;
        }

        .side-property {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #ffffff;
        }

        .side-property-image {
          position: relative;
          height: 155px;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #ccfbf1
            );
        }

        .side-property-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .side-placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          font-size: 48px;
          animation: houseFloat 3s ease-in-out infinite;
        }

        .side-property-image > span {
          position: absolute;
          top: 9px;
          left: 9px;
          padding: 6px 8px;
          border-radius: 999px;
          background: #ffffff;
          color: #1d4ed8;
          font-size: 8px;
          font-weight: 950;
          box-shadow:
            0 5px 14px rgba(15,23,42,.12);
        }

        .side-property-body {
          padding: 13px;
        }

        .side-property-body > strong {
          display: block;
          overflow: hidden;
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .side-property-body p {
          margin: 4px 0;
          color: #64748b;
          font-size: 9px;
        }

        .side-property-body > b {
          display: block;
          margin-top: 7px;
          color: #2563eb;
          font-size: 16px;
          font-weight: 950;
        }

        .side-property-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 9px;
        }

        .side-property-meta span {
          padding: 5px 6px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #475569;
          font-size: 7px;
          font-weight: 800;
        }

        .sidebar-title {
          margin-bottom: 15px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 950;
        }

        .benefit-list {
          display: grid;
          gap: 14px;
        }

        .benefit {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .benefit > span {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #eff6ff;
          font-size: 15px;
        }

        .benefit strong,
        .benefit p {
          display: block;
        }

        .benefit strong {
          color: #334155;
          font-size: 10px;
          font-weight: 900;
        }

        .benefit p {
          margin: 3px 0 0;
          color: #94a3b8;
          font-size: 8px;
          line-height: 1.55;
        }

        /* FLOW */

        .flow-item {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .flow-item > span {
          flex: 0 0 auto;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
          font-size: 9px;
          font-weight: 950;
        }

        .flow-item strong,
        .flow-item small {
          display: block;
        }

        .flow-item strong {
          color: #334155;
          font-size: 10px;
          font-weight: 900;
        }

        .flow-item small {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 8px;
        }

        .flow-line {
          width: 1px;
          height: 18px;
          margin-left: 13px;
          background: #dbeafe;
        }

        /* ANIMATIONS */

        @keyframes postFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes stepIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes postPulse {
          0%,100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.2);
          }
        }

        @keyframes postOrbOne {
          0%,100% {
            transform: translate(0,0);
          }

          50% {
            transform: translate(25px,-20px);
          }
        }

        @keyframes postOrbTwo {
          0%,100% {
            transform: translate(0,0);
          }

          50% {
            transform: translate(-25px,20px);
          }
        }

        @keyframes buttonSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes houseFloat {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        /* TABLET */

        @media (max-width: 1000px) {

          .post-layout {
            grid-template-columns: 1fr;
          }

          .post-sidebar {
            position: static;
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .live-preview-card {
            grid-column: 1 / -1;
          }

        }

        /* MOBILE */

        @media (max-width: 700px) {

          .prozpo-post-page {
            padding: 40px 13px 70px;
          }

          .post-header h1 {
            font-size: 39px;
            letter-spacing: -2px;
          }

          .post-header > p {
            font-size: 13px;
          }

          .post-trust-row span {
            font-size: 8px;
          }

          .post-progress-card {
            padding: 15px;
          }

          .progress-steps small {
            display: none;
          }

          .post-sidebar {
            grid-template-columns: 1fr;
          }

          .live-preview-card {
            grid-column: auto;
          }

          .form-step {
            padding: 22px 17px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .choice-grid {
            grid-template-columns: 1fr;
          }

          .type-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .preview-card {
            grid-template-columns: 1fr;
          }

          .preview-image {
            min-height: 200px;
          }

          .preview-image img {
            min-height: 200px;
          }

          .step-actions,
          .step-actions.two {
            flex-direction: column-reverse;
          }

          .next-button,
          .publish-button,
          .back-button {
            width: 100%;
          }

        }

        @media (max-width: 430px) {

          .prozpo-post-page {
            padding-left: 9px;
            padding-right: 9px;
          }

          .post-header h1 {
            font-size: 34px;
          }

          .post-badge {
            font-size: 8px;
          }

          .post-trust-row {
            gap: 5px;
          }

          .post-trust-row span {
            padding: 6px 7px;
          }

          .type-grid {
            grid-template-columns: 1fr 1fr;
          }

          .amenity-grid {
            gap: 5px;
          }

          .amenity-chip {
            padding: 7px 8px;
            font-size: 8px;
          }

        }

        @media (prefers-reduced-motion: reduce) {

          .prozpo-post-page *,
          .prozpo-post-page *::before,
          .prozpo-post-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }

        }

      `}</style>
    </main>
  );
}
