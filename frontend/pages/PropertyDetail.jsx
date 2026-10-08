import React, { useEffect, useMemo, useState } from "react";
import {
  getProperty,
  getProperties,
  addFavorite,
  createEnquiry,
  getPropertyImages,
  createRecord,
} from "../src/api";

export default function PropertyDetail() {
  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [relatedProperties, setRelatedProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const [imageIndex, setImageIndex] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [savingFavorite, setSavingFavorite] = useState(false);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [enquiry, setEnquiry] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [report, setReport] = useState({
    reason: "",
    description: "",
  });

  useEffect(() => {
    loadProperty();
  }, []);

  function getPropertyId() {
    const hash = window.location.hash || "";

    const hashMatch = hash.match(
      /property\/([^/?#]+)/
    );

    if (hashMatch) {
      return decodeURIComponent(hashMatch[1]);
    }

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
        throw new Error(
          "Property ID not found."
        );
      }

      const response = await getProperty(id);

      const data =
        response?.property ||
        response?.data ||
        response;

      if (!data || !data.id) {
        throw new Error(
          "Property not found."
        );
      }

      setProperty(data);

      await loadPropertyGallery(id);
      await loadRelatedProperties(data);
    } catch (error) {
      console.error(
        "Property detail error:",
        error
      );

      showMessage(
        error?.message ||
          "Unable to load property.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPropertyGallery(id) {
    try {
      const response =
        await getPropertyImages(id);

      const propertyImages =
        response?.images ||
        response?.data ||
        response ||
        [];

      setImages(
        Array.isArray(propertyImages)
          ? propertyImages
          : []
      );
    } catch (error) {
      console.log(
        "Property gallery unavailable:",
        error
      );

      setImages([]);
    }
  }

  async function loadRelatedProperties(currentProperty) {
    try {
      setRelatedLoading(true);

      const response =
        await getProperties();

      const list =
        response?.properties ||
        response?.data ||
        response ||
        [];

      if (!Array.isArray(list)) {
        setRelatedProperties([]);
        return;
      }

      const filtered = list
        .filter(
          (item) =>
            String(item.id) !==
            String(currentProperty.id)
        )
        .filter((item) => {
          if (
            currentProperty.city &&
            item.city
          ) {
            return (
              String(item.city).toLowerCase() ===
              String(currentProperty.city).toLowerCase()
            );
          }

          return true;
        })
        .slice(0, 4);

      setRelatedProperties(filtered);
    } catch (error) {
      console.log(
        "Related properties unavailable:",
        error
      );

      setRelatedProperties([]);
    } finally {
      setRelatedLoading(false);
    }
  }

  function showMessage(
    text,
    type = "success"
  ) {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, 5000);
  }

  function formatPrice(price) {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "Price on Request";
    }

    const number = Number(price);

    if (Number.isNaN(number)) {
      return String(price);
    }

    if (number >= 10000000) {
      return `₹${(
        number / 10000000
      ).toFixed(2)} Cr`;
    }

    if (number >= 100000) {
      return `₹${(
        number / 100000
      ).toFixed(2)} Lakh`;
    }

    return `₹${number.toLocaleString(
      "en-IN"
    )}`;
  }

  function formatArea() {
    if (
      property?.area === null ||
      property?.area === undefined ||
      property?.area === ""
    ) {
      return "—";
    }

    return `${property.area} ${
      property.area_unit || "Sq. Ft."
    }`;
  }

  function getImageUrl(image) {
    if (!image) {
      return "";
    }

    if (typeof image === "string") {
      return image;
    }

    return (
      image.image_url ||
      image.url ||
      image.image ||
      image.path ||
      ""
    );
  }

  const gallery = useMemo(() => {
    const result = [];

    if (property?.image_url) {
      result.push(property.image_url);
    }

    if (property?.image) {
      result.push(property.image);
    }

    if (
      Array.isArray(property?.images)
    ) {
      result.push(...property.images);
    }

    if (Array.isArray(images)) {
      result.push(...images);
    }

    const unique = [];

    const seen = new Set();

    result.forEach((item) => {
      const url = getImageUrl(item);

      if (url && !seen.has(url)) {
        seen.add(url);
        unique.push(item);
      }
    });

    return unique;
  }, [property, images]);

  const currentImage =
    gallery.length > 0
      ? getImageUrl(
          gallery[
            Math.min(
              imageIndex,
              gallery.length - 1
            )
          ]
        )
      : "";

  function goBack() {
    if (
      window.history.length > 1
    ) {
      window.history.back();
      return;
    }

    window.location.hash = "#/buy";
  }

  function goToProperty(id) {
    window.location.hash =
      `#/property/${encodeURIComponent(id)}`;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      loadProperty();
    }, 50);
  }

  function nextImage() {
    if (!gallery.length) {
      return;
    }

    setImageIndex(
      (current) =>
        (current + 1) %
        gallery.length
    );
  }

  function previousImage() {
    if (!gallery.length) {
      return;
    }

    setImageIndex(
      (current) =>
        (current - 1 + gallery.length) %
        gallery.length
    );
  }

  function selectImage(index) {
    setImageIndex(index);
  }

  async function handleFavorite() {
    if (!property?.id) {
      return;
    }

    try {
      setSavingFavorite(true);

      await addFavorite({
        property_id: property.id,
      });

      showMessage(
        "Property added to your favorites."
      );
    } catch (error) {
      showMessage(
        error?.message ||
          "Please login to save favorites.",
        "error"
      );
    } finally {
      setSavingFavorite(false);
    }
  }

  function handleEnquiryChange(event) {
    const {
      name,
      value,
    } = event.target;

    setEnquiry((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function submitEnquiry(event) {
    event.preventDefault();

    if (!property?.id) {
      return;
    }

    if (
      !enquiry.name.trim() ||
      !enquiry.phone.trim()
    ) {
      showMessage(
        "Please enter your name and phone number.",
        "error"
      );
      return;
    }

    try {
      setSubmittingEnquiry(true);

      await createEnquiry({
        property_id: property.id,
        name: enquiry.name.trim(),
        phone: enquiry.phone.trim(),
        email:
          enquiry.email.trim() || null,
        message:
          enquiry.message.trim() ||
          `I am interested in ${property.title || "this property"}.`,
      });

      setEnquiry({
        name: "",
        phone: "",
        email: "",
        message: "",
      });

      setShowEnquiry(false);

      showMessage(
        "Your enquiry has been submitted successfully."
      );
    } catch (error) {
      showMessage(
        error?.message ||
          "Unable to submit enquiry.",
        "error"
      );
    } finally {
      setSubmittingEnquiry(false);
    }
  }

  function getContactPhone() {
    return String(
      property?.contact_phone ||
        property?.phone ||
        property?.mobile ||
        ""
    ).replace(/\D/g, "");
  }

  function contactWhatsApp() {
    const phone =
      getContactPhone();

    if (!phone) {
      setShowEnquiry(true);
      return;
    }

    const text =
      encodeURIComponent(
        `Hello, I am interested in this property on PROZPO: ${
          property?.title || "Property"
        }`
      );

    window.open(
      `https://wa.me/${phone}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function submitReport(event) {
    event.preventDefault();

    if (!property?.id) {
      return;
    }

    if (!report.reason) {
      showMessage(
        "Please select a report reason.",
        "error"
      );
      return;
    }

    try {
      setSubmittingReport(true);

      await createRecord("reports", {
        property_id: property.id,
        reason: report.reason,
        description:
          report.description.trim() ||
          null,
      });

      setReport({
        reason: "",
        description: "",
      });

      setShowReport(false);

      showMessage(
        "Thank you. Your report has been submitted."
      );
    } catch (error) {
      showMessage(
        error?.message ||
          "Unable to submit report.",
        "error"
      );
    } finally {
      setSubmittingReport(false);
    }
  }

  function shareProperty() {
    const url =
      window.location.href;

    const title =
      property?.title ||
      "Property on PROZPO";

    if (
      navigator.share
    ) {
      navigator
        .share({
          title,
          text: `Check this property on PROZPO: ${title}`,
          url,
        })
        .catch(() => {});
      return;
    }

    if (
      navigator.clipboard
    ) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          showMessage(
            "Property link copied."
          );
        })
        .catch(() => {
          showMessage(
            "Unable to copy property link.",
            "error"
          );
        });

      return;
    }

    showMessage(
      "Copy the property URL from your browser."
    );
  }

  function getListingLabel() {
    const value =
      property?.listing_type ||
      "";

    if (!value) {
      return "PROPERTY";
    }

    return String(value)
      .replace(/_/g, " ")
      .toUpperCase();
  }

  function getPropertyType() {
    return (
      property?.property_type ||
      "Property"
    );
  }

  function getStatusLabel() {
    return (
      property?.status ||
      "Available"
    );
  }

  function getLocationText() {
    const parts = [
      property?.location,
      property?.city,
      property?.state,
    ].filter(Boolean);

    if (!parts.length) {
      return "Location not available";
    }

    return [
      ...new Set(parts),
    ].join(", ");
  }

  function getSellerLabel() {
    if (property?.seller_name) {
      return property.seller_name;
    }

    if (property?.owner_name) {
      return property.owner_name;
    }

    if (property?.user_id) {
      return "Verified Property Owner";
    }

    return "Property Advertiser";
  }

  if (loading) {
    return (
      <>
        <style>{loadingStyles}</style>

        <main className="property-loading-page">
          <div className="loading-card">
            <div className="loading-spinner" />
            <h2>
              Loading Property
            </h2>
            <p>
              Please wait while we fetch the
              property details.
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <style>{errorStyles}</style>

        <main className="property-error-page">
          <div className="error-card">
            <div className="error-icon">
              🏠
            </div>

            <h1>
              Property Not Found
            </h1>

            <p>
              {message ||
                "The requested property could not be found."}
            </p>

            <button
              className="primary-action"
              onClick={goBack}
            >
              ← Go Back
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{pageStyles}</style>

      <main className="property-detail-page">
        <div className="property-detail-container">

          <div className="top-toolbar">
            <button
              className="back-button"
              onClick={goBack}
            >
              ← Back to Properties
            </button>

            <div className="toolbar-actions">
              <button
                className="toolbar-button"
                onClick={shareProperty}
              >
                ↗ Share
              </button>

              <button
                className="toolbar-button"
                onClick={() =>
                  setShowReport(true)
                }
              >
                ⚑ Report
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`detail-message ${
                messageType === "error"
                  ? "detail-message-error"
                  : ""
              }`}
            >
              <span>
                {message}
              </span>

              <button
                onClick={() =>
                  setMessage("")
                }
                aria-label="Close message"
              >
                ×
              </button>
            </div>
          )}

          <section className="gallery-section">

            <div className="main-gallery">

              {currentImage ? (
                <img
                  src={currentImage}
                  alt={
                    property.title ||
                    "Property"
                  }
                  className="main-property-image"
                />
              ) : (
                <div className="image-placeholder">
                  <span>🏠</span>
                  <strong>
                    Property Image
                  </strong>
                  <small>
                    No image available
                  </small>
                </div>
              )}

              {gallery.length > 1 && (
                <>
                  <button
                    className="gallery-arrow gallery-left"
                    onClick={previousImage}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <button
                    className="gallery-arrow gallery-right"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    ›
                  </button>

                  <div className="image-counter">
                    {imageIndex + 1} /{" "}
                    {gallery.length}
                  </div>
                </>
              )}

              <div className="gallery-badge">
                {getListingLabel()}
              </div>
            </div>

            {gallery.length > 0 && (
              <div className="thumbnail-row">
                {gallery
                  .slice(0, 8)
                  .map(
                    (
                      image,
                      index
                    ) => {
                      const url =
                        getImageUrl(image);

                      return (
                        <button
                          key={`${url}-${index}`}
                          className={`thumbnail ${
                            index === imageIndex
                              ? "thumbnail-active"
                              : ""
                          }`}
                          onClick={() =>
                            selectImage(index)
                          }
                        >
                          <img
                            src={url}
                            alt={`Property ${
                              index + 1
                            }`}
                          />
                        </button>
                      );
                    }
                  )}
              </div>
            )}
          </section>

          <div className="property-layout">

            <section className="property-main-card">

              <div className="property-heading-row">

                <div>
                  <div className="property-badges">

                    <span className="type-badge">
                      {getPropertyType()}
                    </span>

                    <span className="status-badge">
                      ●{" "}
                      {getStatusLabel()}
                    </span>

                  </div>

                  <h1 className="property-title">
                    {property.title ||
                      "Property Listing"}
                  </h1>

                  <p className="property-location">
                    <span>
                      📍
                    </span>

                    <span>
                      {getLocationText()}
                    </span>
                  </p>
                </div>

                <div className="price-box">
                  <div className="price-label">
                    Asking Price
                  </div>

                  <div className="property-price">
                    {formatPrice(
                      property.price
                    )}
                  </div>
                </div>

              </div>

              <div className="property-stats">

                <Stat
                  icon="📐"
                  label="Area"
                  value={formatArea()}
                />

                <Stat
                  icon="🛏️"
                  label="Bedrooms"
                  value={
                    property.bedrooms ??
                    "—"
                  }
                />

                <Stat
                  icon="🛁"
                  label="Bathrooms"
                  value={
                    property.bathrooms ??
                    "—"
                  }
                />

                <Stat
                  icon="🛋️"
                  label="Furnishing"
                  value={
                    property.furnishing ||
                    "—"
                  }
                />

              </div>

              <section className="content-section">

                <h2>
                  Property Overview
                </h2>

                <div className="overview-grid">

                  <InfoItem
                    label="Property Type"
                    value={
                      property.property_type ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="Listing Type"
                    value={
                      property.listing_type ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="Area"
                    value={formatArea()}
                  />

                  <InfoItem
                    label="Possession"
                    value={
                      property.possession ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="City"
                    value={
                      property.city ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="State"
                    value={
                      property.state ||
                      "—"
                    }
                  />

                </div>
              </section>

              <section className="content-section">

                <h2>
                  About This Property
                </h2>

                <p className="description">
                  {property.description ||
                    "No detailed description has been added for this property yet."}
                </p>

              </section>

              <section className="content-section">

                <h2>
                  Why Consider This Property?
                </h2>

                <div className="benefit-grid">

                  <Benefit
                    icon="✓"
                    title="Property Details"
                    text="Important property information is displayed in one place."
                  />

                  <Benefit
                    icon="🔎"
                    title="Easy Enquiry"
                    text="Send your requirement directly to the property advertiser."
                  />

                  <Benefit
                    icon="❤️"
                    title="Save Property"
                    text="Add interesting properties to your PROZPO favorites."
                  />

                  <Benefit
                    icon="↗"
                    title="Share Easily"
                    text="Share the property with family, friends or clients."
                  />

                </div>
              </section>

              <section className="content-section">

                <h2>
                  Property Information
                </h2>

                <div className="verification-box">

                  <div className="verification-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Listed on PROZPO
                    </strong>

                    <p>
                      Always verify property documents,
                      ownership, approvals and other
                      legal details before making a
                      purchase decision.
                    </p>
                  </div>

                </div>
              </section>

            </section>

            <aside className="property-sidebar">

              <div className="contact-card">

                <div className="contact-card-top">
                  <div className="seller-avatar">
                    {getSellerLabel()
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="seller-small">
                      Listed By
                    </div>

                    <div className="seller-name">
                      {getSellerLabel()}
                    </div>
                  </div>
                </div>

                <div className="seller-status">
                  <span>●</span>
                  Property enquiry available
                </div>

                <button
                  className="contact-button primary-contact"
                  onClick={() =>
                    setShowEnquiry(true)
                  }
                >
                  📨 Send Enquiry
                </button>

                <button
                  className="contact-button whatsapp-contact"
                  onClick={contactWhatsApp}
                >
                  💬 WhatsApp Enquiry
                </button>

                <button
                  className="contact-button favorite-contact"
                  onClick={handleFavorite}
                  disabled={
                    savingFavorite
                  }
                >
                  {savingFavorite
                    ? "Saving..."
                    : "♡ Save to Favorites"}
                </button>

                <button
                  className="contact-button share-contact"
                  onClick={shareProperty}
                >
                  ↗ Share Property
                </button>

                <div className="secure-note">
                  🔒 Your enquiry details are
                  submitted securely through PROZPO.
                </div>

              </div>

              <div className="quick-info-card">

                <h3>
                  Property Summary
                </h3>

                <SummaryRow
                  label="Price"
                  value={formatPrice(
                    property.price
                  )}
                />

                <SummaryRow
                  label="Type"
                  value={
                    property.property_type ||
                    "—"
                  }
                />

                <SummaryRow
                  label="Listing"
                  value={
                    property.listing_type ||
                    "—"
                  }
                />

                <SummaryRow
                  label="Area"
                  value={formatArea()}
                />

                <SummaryRow
                  label="Location"
                  value={
                    property.city ||
                    property.location ||
                    "—"
                  }
                />

              </div>

            </aside>
          </div>

          <section className="related-section">

            <div className="section-heading">

              <div>
                <span className="section-kicker">
                  EXPLORE MORE
                </span>

                <h2>
                  Similar Properties
                </h2>
              </div>

              <button
                className="view-all-button"
                onClick={() => {
                  window.location.hash =
                    "#/buy";
                }}
              >
                View All →
              </button>

            </div>

            {relatedLoading ? (
              <div className="related-loading">
                Finding similar properties...
              </div>
            ) : relatedProperties.length > 0 ? (
              <div className="related-grid">
                {relatedProperties.map(
                  (item) => (
                    <RelatedPropertyCard
                      key={item.id}
                      property={item}
                      onClick={() =>
                        goToProperty(
                          item.id
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="empty-related">
                <div>
                  🏘️
                </div>

                <strong>
                  More properties coming soon
                </strong>

                <p>
                  Explore PROZPO for more
                  property listings.
                </p>
              </div>
            )}

          </section>

          <section className="bottom-cta">

            <div>
              <span>
                FIND YOUR NEXT PROPERTY
              </span>

              <h2>
                Looking for more properties?
              </h2>

              <p>
                Explore Buy, Rent, Commercial,
                Plots and Projects on PROZPO.
              </p>
            </div>

            <div className="bottom-cta-actions">

              <button
                onClick={() => {
                  window.location.hash =
                    "#/buy";
                }}
              >
                Explore Properties
              </button>

              <button
                onClick={() => {
                  window.location.hash =
                    "#/post-property";
                }}
              >
                Post Property
              </button>

            </div>

          </section>

        </div>
      </main>

      {showEnquiry && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowEnquiry(false);
            }
          }}
        >
          <div className="modal-card">

            <div className="modal-header">

              <div>
                <span className="modal-kicker">
                  PROPERTY ENQUIRY
                </span>

                <h2>
                  Interested in this property?
                </h2>

                <p>
                  Share your details and the
                  advertiser can contact you.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowEnquiry(false)
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={submitEnquiry}
            >

              <label>
                Your Name *
              </label>

              <input
                className="modal-input"
                name="name"
                value={enquiry.name}
                onChange={
                  handleEnquiryChange
                }
                placeholder="Enter your name"
                required
              />

              <label>
                Phone Number *
              </label>

              <input
                className="modal-input"
                name="phone"
                type="tel"
                value={enquiry.phone}
                onChange={
                  handleEnquiryChange
                }
                placeholder="Enter phone number"
                required
              />

              <label>
                Email
              </label>

              <input
                className="modal-input"
                name="email"
                type="email"
                value={enquiry.email}
                onChange={
                  handleEnquiryChange
                }
                placeholder="Enter email address"
              />

              <label>
                Message
              </label>

              <textarea
                className="modal-textarea"
                name="message"
                value={
                  enquiry.message
                }
                onChange={
                  handleEnquiryChange
                }
                placeholder="Tell us what you want to know..."
              />

              <button
                className="modal-submit"
                type="submit"
                disabled={
                  submittingEnquiry
                }
              >
                {submittingEnquiry
                  ? "Submitting..."
                  : "Submit Enquiry →"}
              </button>

            </form>

          </div>
        </div>
      )}

      {showReport && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowReport(false);
            }
          }}
        >
          <div className="modal-card report-modal">

            <div className="modal-header">

              <div>
                <span className="modal-kicker">
                  SAFETY & REPORTING
                </span>

                <h2>
                  Report this property
                </h2>

                <p>
                  Tell us if you think this
                  listing violates PROZPO rules.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowReport(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={submitReport}
            >

              <label>
                Reason *
              </label>

              <select
                className="modal-input"
                value={report.reason}
                onChange={(event) =>
                  setReport({
                    ...report,
                    reason:
                      event.target.value,
                  })
                }
                required
              >
                <option value="">
                  Select a reason
                </option>

                <option value="fake_listing">
                  Fake / misleading listing
                </option>

                <option value="wrong_information">
                  Wrong property information
                </option>

                <option value="duplicate">
                  Duplicate listing
                </option>

                <option value="fraud">
                  Suspected fraud
                </option>

                <option value="inappropriate">
                  Inappropriate content
                </option>

                <option value="other">
                  Other
                </option>
              </select>

              <label>
                Details
              </label>

              <textarea
                className="modal-textarea"
                value={
                  report.description
                }
                onChange={(event) =>
                  setReport({
                    ...report,
                    description:
                      event.target.value,
                  })
                }
                placeholder="Describe the issue..."
              />

              <button
                className="modal-submit report-submit"
                type="submit"
                disabled={
                  submittingReport
                }
              >
                {submittingReport
                  ? "Submitting..."
                  : "Submit Report"}
              </button>

            </form>

          </div>
        </div>
      )}
    </>
  );
}

function Stat({
  icon,
  label,
  value,
}) {
  return (
    <div className="property-stat">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <div className="stat-label">
          {label}
        </div>

        <div className="stat-value">
          {value}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}) {
  return (
    <div className="info-item">
      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}) {
  return (
    <div className="benefit-card">

      <div className="benefit-icon">
        {icon}
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>
      </div>

    </div>
  );
}

function SummaryRow({
  label,
  value,
}) {
  return (
    <div className="summary-row">

      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>

    </div>
  );
}

function RelatedPropertyCard({
  property,
  onClick,
}) {
  const image =
    property?.image_url ||
    property?.image ||
    "";

  return (
    <article
      className="related-card"
      onClick={onClick}
    >

      <div className="related-image">

        {image ? (
          <img
            src={image}
            alt={
              property.title ||
              "Property"
            }
          />
        ) : (
          <div className="related-placeholder">
            🏠
          </div>
        )}

        <span>
          {property.listing_type ||
            property.property_type ||
            "Property"}
        </span>

      </div>

      <div className="related-content">

        <h3>
          {property.title ||
            "Property Listing"}
        </h3>

        <p>
          📍{" "}
          {property.location ||
            property.city ||
            "Location"}
        </p>

        <div className="related-bottom">

          <strong>
            {formatCardPrice(
              property.price
            )}
          </strong>

          <small>
            {property.area
              ? `${property.area} ${
                  property.area_unit ||
                  "Sq. Ft."
                }`
              : ""}
          </small>

        </div>

      </div>

    </article>
  );
}

function formatCardPrice(price) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "Price on Request";
  }

  const number = Number(price);

  if (Number.isNaN(number)) {
    return String(price);
  }

  if (number >= 10000000) {
    return `₹${(
      number / 10000000
    ).toFixed(2)} Cr`;
  }

  if (number >= 100000) {
    return `₹${(
      number / 100000
    ).toFixed(2)} L`;
  }

  return `₹${number.toLocaleString(
    "en-IN"
  )}`;
}

const loadingStyles = `
  .property-loading-page {
    min-height: 75vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background:
      radial-gradient(
        circle at top right,
        rgba(37,99,235,.12),
        transparent 35%
      ),
      #f8fafc;
  }

  .loading-card {
    width: min(420px, 100%);
    padding: 45px 30px;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    background: #fff;
    text-align: center;
    box-shadow: 0 20px 60px rgba(15,23,42,.08);
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    margin: 0 auto 20px;
    border: 5px solid #dbeafe;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: propertySpin .8s linear infinite;
  }

  .loading-card h2 {
    margin: 0 0 8px;
    color: #0f172a;
  }

  .loading-card p {
    margin: 0;
    color: #64748b;
  }

  @keyframes propertySpin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const errorStyles = `
  .property-error-page {
    min-height: 75vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background: #f8fafc;
  }

  .error-card {
    width: min(500px, 100%);
    padding: 45px 30px;
    border-radius: 24px;
    background: #fff;
    border: 1px solid #e2e8f0;
    text-align: center;
    box-shadow: 0 20px 60px rgba(15,23,42,.08);
  }

  .error-icon {
    font-size: 55px;
    margin-bottom: 15px;
  }

  .error-card h1 {
    margin: 0 0 10px;
    color: #0f172a;
  }

  .error-card p {
    margin: 0 auto 25px;
    max-width: 400px;
    color: #64748b;
    line-height: 1.6;
  }

  .primary-action {
    border: 0;
    border-radius: 10px;
    padding: 13px 22px;
    background: #2563eb;
    color: #fff;
    font-weight: 800;
    cursor: pointer;
  }
`;

const pageStyles = `
  * {
    box-sizing: border-box;
  }

  .property-detail-page {
    min-height: 100vh;
    padding: 28px 20px 80px;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(37,99,235,.09),
        transparent 30%
      ),
      radial-gradient(
        circle at 100% 20%,
        rgba(16,185,129,.07),
        transparent 25%
      ),
      #f8fafc;
    color: #0f172a;
  }

  .property-detail-container {
    width: min(1240px, 100%);
    margin: 0 auto;
  }

  .top-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 18px;
  }

  .back-button,
  .toolbar-button {
    border: 1px solid #dbe3ee;
    border-radius: 11px;
    padding: 11px 15px;
    background: #fff;
    color: #334155;
    font-weight: 800;
    cursor: pointer;
    transition: .2s ease;
  }

  .back-button:hover,
  .toolbar-button:hover {
    border-color: #93c5fd;
    background: #eff6ff;
    color: #1d4ed8;
    transform: translateY(-1px);
  }

  .toolbar-actions {
    display: flex;
    gap: 10px;
  }

  .detail-message {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
    padding: 13px 16px;
    border: 1px solid #bfdbfe;
    border-radius: 12px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 14px;
    font-weight: 700;
  }

  .detail-message button {
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 20px;
    cursor: pointer;
  }

  .detail-message-error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b91c1c;
  }

  .gallery-section {
    margin-bottom: 26px;
  }

  .main-gallery {
    position: relative;
    overflow: hidden;
    min-height: 510px;
    border-radius: 25px;
    background: #dbe4ef;
    box-shadow: 0 20px 55px rgba(15,23,42,.12);
  }

  .main-property-image {
    display: block;
    width: 100%;
    height: 510px;
    object-fit: cover;
  }

  .image-placeholder {
    height: 510px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background:
      linear-gradient(
        135deg,
        #dbeafe,
        #e2e8f0
      );
    color: #64748b;
  }

  .image-placeholder span {
    font-size: 75px;
  }

  .image-placeholder strong {
    color: #334155;
    font-size: 18px;
  }

  .image-placeholder small {
    font-size: 13px;
  }

  .gallery-badge {
    position: absolute;
    left: 20px;
    top: 20px;
    padding: 9px 14px;
    border-radius: 30px;
    background: rgba(15,23,42,.78);
    color: #fff;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .5px;
    backdrop-filter: blur(10px);
  }

  .gallery-arrow {
    position: absolute;
    top: 50%;
    width: 48px;
    height: 48px;
    transform: translateY(-50%);
    border: 1px solid rgba(255,255,255,.25);
    border-radius: 50%;
    background: rgba(15,23,42,.72);
    color: #fff;
    font-size: 32px;
    line-height: 1;
    cursor: pointer;
    z-index: 2;
    transition: .2s ease;
  }

  .gallery-arrow:hover {
    background: rgba(15,23,42,.94);
    transform: translateY(-50%) scale(1.06);
  }

  .gallery-left {
    left: 18px;
  }

  .gallery-right {
    right: 18px;
  }

  .image-counter {
    position: absolute;
    right: 18px;
    bottom: 18px;
    padding: 8px 13px;
    border-radius: 20px;
    background: rgba(15,23,42,.75);
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    backdrop-filter: blur(10px);
  }

  .thumbnail-row {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 12px 2px 2px;
  }

  .thumbnail {
    flex: 0 0 82px;
    height: 62px;
    padding: 0;
    overflow: hidden;
    border: 2px solid transparent;
    border-radius: 10px;
    background: #e2e8f0;
    cursor: pointer;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-active {
    border-color: #2563eb;
  }

  .property-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 350px;
    gap: 25px;
    align-items: start;
  }

  .property-main-card,
  .contact-card,
  .quick-info-card {
    border: 1px solid #e2e8f0;
    border-radius: 22px;
    background: #fff;
    box-shadow: 0 12px 35px rgba(15,23,42,.06);
  }

  .property-main-card {
    padding: 30px;
  }

  .property-heading-row {
    display: flex;
    justify-content: space-between;
    gap: 25px;
  }

  .property-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .type-badge,
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 11px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .type-badge {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .status-badge {
    background: #dcfce7;
    color: #15803d;
  }

  .property-title {
    margin: 14px 0 8px;
    color: #0f172a;
    font-size: clamp(29px, 4vw, 43px);
    line-height: 1.12;
    font-weight: 950;
    letter-spacing: -.8px;
  }

  .property-location {
    display: flex;
    gap: 7px;
    margin: 0;
    color: #64748b;
    font-size: 15px;
    line-height: 1.5;
  }

  .price-box {
    min-width: 180px;
    padding: 15px 18px;
    border: 1px solid #dbeafe;
    border-radius: 15px;
    background: #eff6ff;
    text-align: right;
  }

  .price-label {
    margin-bottom: 5px;
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
  }

  .property-price {
    color: #1d4ed8;
    font-size: 28px;
    font-weight: 950;
    white-space: nowrap;
  }

  .property-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin: 30px 0;
    padding: 20px 0;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
  }

  .property-stat {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
    padding: 0 16px;
    border-right: 1px solid #e5e7eb;
  }

  .property-stat:first-child {
    padding-left: 0;
  }

  .property-stat:last-child {
    border-right: 0;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: #f1f5f9;
    font-size: 18px;
  }

  .stat-label {
    margin-bottom: 4px;
    color: #94a3b8;
    font-size: 11px;
  }

  .stat-value {
    color: #0f172a;
    font-size: 14px;
    font-weight: 850;
    word-break: break-word;
  }

  .content-section {
    margin-top: 30px;
  }

  .content-section h2 {
    margin: 0 0 15px;
    color: #0f172a;
    font-size: 21px;
    font-weight: 900;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f8fafc;
  }

  .info-item span {
    color: #64748b;
    font-size: 12px;
  }

  .info-item strong {
    color: #0f172a;
    font-size: 13px;
    text-align: right;
  }

  .description {
    margin: 0;
    color: #475569;
    font-size: 15px;
    line-height: 1.85;
    white-space: pre-line;
  }

  .benefit-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .benefit-card {
    display: flex;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #f8fafc;
  }

  .benefit-icon {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    background: #dbeafe;
    color: #1d4ed8;
    font-weight: 900;
  }

  .benefit-card strong {
    display: block;
    margin-bottom: 4px;
    color: #0f172a;
    font-size: 14px;
  }

  .benefit-card p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.55;
  }

  .verification-box {
    display: flex;
    gap: 13px;
    padding: 17px;
    border: 1px solid #bbf7d0;
    border-radius: 14px;
    background: #f0fdf4;
  }

  .verification-icon {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #16a34a;
    color: #fff;
    font-weight: 900;
  }

  .verification-box strong {
    color: #166534;
    font-size: 14px;
  }

  .verification-box p {
    margin: 5px 0 0;
    color: #4d7c5b;
    font-size: 12px;
    line-height: 1.6;
  }

  .property-sidebar {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: sticky;
    top: 20px;
  }

  .contact-card {
    padding: 22px;
  }

  .contact-card-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .seller-avatar {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: #fff;
    font-size: 19px;
    font-weight: 900;
  }

  .seller-small {
    margin-bottom: 3px;
    color: #94a3b8;
    font-size: 11px;
  }

  .seller-name {
    color: #0f172a;
    font-size: 15px;
    font-weight: 900;
  }

  .seller-status {
    margin: 17px 0;
    padding: 9px 11px;
    border-radius: 9px;
    background: #f0fdf4;
    color: #15803d;
    font-size: 11px;
    font-weight: 750;
  }

  .seller-status span {
    margin-right: 5px;
  }

  .contact-button {
    width: 100%;
    margin-bottom: 10px;
    padding: 14px;
    border: 0;
    border-radius: 11px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    transition: .2s ease;
  }

  .contact-button:hover {
    transform: translateY(-1px);
  }

  .contact-button:disabled {
    opacity: .6;
    cursor: not-allowed;
    transform: none;
  }

  .primary-contact {
    background: #2563eb;
    color: #fff;
  }

  .whatsapp-contact {
    background: #16a34a;
    color: #fff;
  }

  .favorite-contact {
    background: #f1f5f9;
    color: #0f172a;
  }

  .share-contact {
    background: #ede9fe;
    color: #6d28d9;
  }

  .secure-note {
    margin-top: 10px;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.5;
    text-align: center;
  }

  .quick-info-card {
    padding: 21px;
  }

  .quick-info-card h3 {
    margin: 0 0 12px;
    color: #0f172a;
    font-size: 17px;
    font-weight: 900;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 11px 0;
    border-bottom: 1px solid #eef2f7;
  }

  .summary-row:last-child {
    border-bottom: 0;
  }

  .summary-row span {
    color: #94a3b8;
    font-size: 12px;
  }

  .summary-row strong {
    max-width: 60%;
    color: #334155;
    font-size: 12px;
    text-align: right;
    word-break: break-word;
  }

  .related-section {
    margin-top: 50px;
  }

  .section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 18px;
  }

  .section-kicker {
    color: #2563eb;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1.2px;
  }

  .section-heading h2 {
    margin: 5px 0 0;
    color: #0f172a;
    font-size: 28px;
    font-weight: 950;
  }

  .view-all-button {
    border: 0;
    background: transparent;
    color: #2563eb;
    font-weight: 850;
    cursor: pointer;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  .related-card {
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 17px;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(15,23,42,.05);
    transition: .22s ease;
  }

  .related-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 40px rgba(15,23,42,.11);
  }

  .related-image {
    position: relative;
    height: 180px;
    background: #e2e8f0;
  }

  .related-image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .related-image > span {
    position: absolute;
    left: 10px;
    top: 10px;
    padding: 6px 9px;
    border-radius: 15px;
    background: rgba(15,23,42,.76);
    color: #fff;
    font-size: 9px;
    font-weight: 900;
  }

  .related-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 45px;
    background: linear-gradient(135deg,#dbeafe,#e2e8f0);
  }

  .related-content {
    padding: 15px;
  }

  .related-content h3 {
    overflow: hidden;
    margin: 0 0 7px;
    color: #0f172a;
    font-size: 15px;
    font-weight: 900;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .related-content p {
    overflow: hidden;
    margin: 0 0 13px;
    color: #64748b;
    font-size: 11px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .related-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .related-bottom strong {
    color: #2563eb;
    font-size: 14px;
    font-weight: 900;
  }

  .related-bottom small {
    color: #94a3b8;
    font-size: 10px;
  }

  .related-loading,
  .empty-related {
    padding: 45px 20px;
    border: 1px dashed #cbd5e1;
    border-radius: 18px;
    background: #fff;
    color: #64748b;
    text-align: center;
  }

  .empty-related > div {
    margin-bottom: 8px;
    font-size: 35px;
  }

  .empty-related strong {
    display: block;
    color: #334155;
  }

  .empty-related p {
    margin: 5px 0 0;
    font-size: 13px;
  }

  .bottom-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 25px;
    margin-top: 50px;
    padding: 35px;
    overflow: hidden;
    border-radius: 24px;
    background:
      radial-gradient(
        circle at 90% 0%,
        rgba(255,255,255,.22),
        transparent 30%
      ),
      linear-gradient(
        135deg,
        #1d4ed8,
        #4f46e5
      );
    color: #fff;
  }

  .bottom-cta span {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1.2px;
    opacity: .8;
  }

  .bottom-cta h2 {
    margin: 7px 0;
    font-size: 27px;
    font-weight: 950;
  }

  .bottom-cta p {
    margin: 0;
    color: rgba(255,255,255,.78);
    font-size: 13px;
  }

  .bottom-cta-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .bottom-cta-actions button {
    border: 1px solid rgba(255,255,255,.3);
    border-radius: 10px;
    padding: 12px 16px;
    background: #fff;
    color: #1d4ed8;
    font-weight: 900;
    cursor: pointer;
  }

  .bottom-cta-actions button:last-child {
    background: rgba(255,255,255,.12);
    color: #fff;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(15,23,42,.68);
    backdrop-filter: blur(5px);
  }

  .modal-card {
    width: min(520px, 100%);
    max-height: 92vh;
    overflow-y: auto;
    padding: 26px;
    border-radius: 22px;
    background: #fff;
    box-shadow: 0 30px 100px rgba(0,0,0,.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .modal-kicker {
    color: #2563eb;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1px;
  }

  .modal-header h2 {
    margin: 5px 0 6px;
    color: #0f172a;
    font-size: 22px;
    font-weight: 950;
  }

  .modal-header p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }

  .modal-close {
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    border: 0;
    border-radius: 50%;
    background: #f1f5f9;
    color: #334155;
    font-size: 22px;
    cursor: pointer;
  }

  .modal-card label {
    display: block;
    margin: 0 0 6px;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
  }

  .modal-input,
  .modal-textarea {
    width: 100%;
    margin-bottom: 14px;
    padding: 13px 14px;
    border: 1px solid #dbe3ee;
    border-radius: 10px;
    outline: none;
    background: #fff;
    color: #0f172a;
    font-family: inherit;
    font-size: 13px;
    transition: .2s ease;
  }

  .modal-input:focus,
  .modal-textarea:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(37,99,235,.1);
  }

  .modal-textarea {
    min-height: 110px;
    resize: vertical;
  }

  .modal-submit {
    width: 100%;
    margin-top: 4px;
    padding: 14px;
    border: 0;
    border-radius: 10px;
    background: #2563eb;
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .modal-submit:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .report-submit {
    background: #dc2626;
  }

  @media (max-width: 1050px) {
    .property-layout {
      grid-template-columns: minmax(0,1fr) 310px;
    }

    .related-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 850px) {
    .property-heading-row {
      flex-direction: column;
    }

    .price-box {
      width: fit-content;
      text-align: left;
    }

    .property-layout {
      grid-template-columns: 1fr;
    }

    .property-sidebar {
      position: static;
    }

    .property-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
    }

    .property-stat:nth-child(2) {
      border-right: 0;
    }

    .property-stat:nth-child(3),
    .property-stat:nth-child(4) {
      padding-top: 18px;
      border-top: 1px solid #e5e7eb;
    }

    .bottom-cta {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 620px) {
    .property-detail-page {
      padding: 18px 12px 55px;
    }

    .top-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .toolbar-actions {
      width: 100%;
    }

    .toolbar-button {
      flex: 1;
    }

    .main-gallery {
      min-height: 300px;
      border-radius: 18px;
    }

    .main-property-image,
    .image-placeholder {
      height: 300px;
    }

    .gallery-arrow {
      width: 40px;
      height: 40px;
      font-size: 27px;
    }

    .gallery-left {
      left: 10px;
    }

    .gallery-right {
      right: 10px;
    }

    .property-main-card {
      padding: 20px;
      border-radius: 18px;
    }

    .property-title {
      font-size: 29px;
    }

    .property-price {
      font-size: 24px;
    }

    .property-stats {
      gap: 0;
    }

    .property-stat {
      padding: 10px 0;
      border-right: 0;
    }

    .property-stat:nth-child(odd) {
      padding-right: 10px;
    }

    .property-stat:nth-child(even) {
      padding-left: 10px;
    }

    .overview-grid,
    .benefit-grid,
    .related-grid {
      grid-template-columns: 1fr;
    }

    .section-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .bottom-cta {
      padding: 25px;
    }

    .bottom-cta h2 {
      font-size: 23px;
    }

    .bottom-cta-actions {
      width: 100%;
    }

    .bottom-cta-actions button {
      flex: 1;
    }

    .modal-card {
      padding: 20px;
      border-radius: 18px;
    }
  }
`;
