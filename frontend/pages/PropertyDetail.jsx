import React, { useEffect, useState } from "react";
import {
  getProperty,
  addFavorite,
  createEnquiry,
  getPropertyImages,
} from "../src/api";

export default function PropertyDetail() {
  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [message, setMessage] = useState("");

  const [enquiry, setEnquiry] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    loadProperty();
  }, []);

  function getPropertyId() {
    const hash = window.location.hash || "";

    const match = hash.match(
      /property\/([^/?#]+)/
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

      const response = await getProperty(id);

      const data =
        response?.property ||
        response?.data ||
        response;

      setProperty(data);

      try {
        const imageResponse =
          await getPropertyImages(id);

        const propertyImages =
          imageResponse?.images ||
          imageResponse?.data ||
          [];

        setImages(
          Array.isArray(propertyImages)
            ? propertyImages
            : []
        );
      } catch (imageError) {
        console.log(
          "Property images unavailable:",
          imageError
        );
      }
    } catch (error) {
      console.error(
        "Property detail error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load property."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(price) {
    if (!price) {
      return "Price on Request";
    }

    const number = Number(price);

    if (Number.isNaN(number)) {
      return price;
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

  function getImageUrl(image) {
    if (!image) return "";

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

  function getPropertyImages() {
    const result = [];

    if (property?.image) {
      result.push(property.image);
    }

    if (property?.image_url) {
      result.push(property.image_url);
    }

    if (property?.images) {
      if (Array.isArray(property.images)) {
        result.push(...property.images);
      }
    }

    if (images.length) {
      result.push(...images);
    }

    return [
      ...new Map(
        result
          .map((item) => [
            getImageUrl(item),
            item,
          ])
          .filter(([url]) => url)
      ).values(),
    ];
  }

  function goBack() {
    window.history.back();
  }

  function nextImage() {
    const gallery = getPropertyImages();

    if (!gallery.length) return;

    setImageIndex(
      (current) =>
        (current + 1) % gallery.length
    );
  }

  function previousImage() {
    const gallery = getPropertyImages();

    if (!gallery.length) return;

    setImageIndex(
      (current) =>
        (current - 1 + gallery.length) %
        gallery.length
    );
  }

  async function handleFavorite() {
    if (!property?.id) return;

    try {
      setSavingFavorite(true);

      await addFavorite({
        property_id: property.id,
      });

      setMessage(
        "Property added to your favorites."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Please login to save favorites."
      );
    } finally {
      setSavingFavorite(false);
    }
  }

  function handleEnquiryChange(e) {
    setEnquiry({
      ...enquiry,
      [e.target.name]: e.target.value,
    });
  }

  async function submitEnquiry(e) {
    e.preventDefault();

    if (!property?.id) return;

    try {
      setMessage("");

      await createEnquiry({
        property_id: property.id,
        name: enquiry.name,
        phone: enquiry.phone,
        email: enquiry.email,
        message:
          enquiry.message ||
          `I am interested in ${property.title}.`,
      });

      setMessage(
        "Your enquiry has been submitted successfully."
      );

      setEnquiry({
        name: "",
        phone: "",
        email: "",
        message: "",
      });

      setShowEnquiry(false);
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to submit enquiry."
      );
    }
  }

  function contactWhatsApp() {
    const phone = String(
      property?.contact_phone ||
        property?.phone ||
        property?.mobile ||
        ""
    ).replace(/\D/g, "");

    if (!phone) {
      setShowEnquiry(true);
      return;
    }

    const text = encodeURIComponent(
      `Hello, I am interested in this property on PROZPO: ${property.title}`
    );

    window.open(
      `https://wa.me/${phone}?text=${text}`,
      "_blank"
    );
  }

  if (loading) {
    return (
      <>
        <style>{`
          .property-loading {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #475569;
            font-size: 18px;
            font-weight: 700;
          }
        `}</style>

        <div className="property-loading">
          Loading property details...
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <style>{`
          .property-error {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            background: #f8fafc;
            text-align: center;
          }

          .property-error h2 {
            color: #0f172a;
            margin-bottom: 10px;
          }

          .property-error p {
            color: #64748b;
          }

          .property-error button {
            border: 0;
            border-radius: 10px;
            padding: 12px 20px;
            background: #2563eb;
            color: white;
            font-weight: 800;
            cursor: pointer;
          }
        `}</style>

        <div className="property-error">
          <h2>
            Property Not Found
          </h2>

          <p>
            {message ||
              "The requested property could not be found."}
          </p>

          <button onClick={goBack}>
            Go Back
          </button>
        </div>
      </>
    );
  }

  const gallery = getPropertyImages();

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

  return (
    <>
      <style>{`
        .property-detail-page {
          min-height: 100vh;
          padding: 30px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.08),
              transparent 35%
            ),
            #f8fafc;
        }

        .property-detail-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-button {
          margin-bottom: 20px;
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          padding: 10px 16px;
          background: #fff;
          color: #334155;
          font-weight: 800;
          cursor: pointer;
        }

        .back-button:hover {
          background: #f1f5f9;
        }

        .property-gallery {
          position: relative;
          overflow: hidden;
          min-height: 480px;
          border-radius: 22px;
          background: #e2e8f0;
          box-shadow:
            0 15px 40px rgba(15,23,42,.10);
        }

        .property-main-image {
          width: 100%;
          height: 480px;
          object-fit: cover;
          display: block;
        }

        .image-placeholder {
          height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #e2e8f0
            );
          color: #64748b;
          font-size: 70px;
        }

        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 50%;
          background: rgba(15,23,42,.70);
          color: white;
          font-size: 24px;
          cursor: pointer;
        }

        .gallery-arrow:hover {
          background: rgba(15,23,42,.90);
        }

        .gallery-left {
          left: 18px;
        }

        .gallery-right {
          right: 18px;
        }

        .image-count {
          position: absolute;
          right: 18px;
          bottom: 18px;
          padding: 8px 12px;
          border-radius: 20px;
          background: rgba(15,23,42,.75);
          color: white;
          font-size: 12px;
          font-weight: 800;
        }

        .property-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 350px;
          gap: 25px;
          margin-top: 25px;
        }

        .property-main-card,
        .property-contact-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow:
            0 10px 30px rgba(15,23,42,.06);
        }

        .property-main-card {
          padding: 28px;
        }

        .property-type-badge {
          display: inline-block;
          padding: 7px 12px;
          border-radius: 20px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .property-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.15;
          font-weight: 900;
        }

        .property-location {
          margin: 0;
          color: #64748b;
          font-size: 16px;
        }

        .property-price {
          margin: 22px 0;
          color: #2563eb;
          font-size: 32px;
          font-weight: 900;
        }

        .property-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          padding: 20px 0;
          margin-bottom: 25px;
        }

        .property-stat {
          padding: 0 15px;
          border-right: 1px solid #e5e7eb;
        }

        .property-stat:first-child {
          padding-left: 0;
        }

        .property-stat:last-child {
          border-right: 0;
        }

        .property-stat-label {
          color: #94a3b8;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .property-stat-value {
          color: #0f172a;
          font-size: 15px;
          font-weight: 850;
        }

        .section-title {
          margin: 0 0 12px;
          color: #0f172a;
          font-size: 21px;
          font-weight: 850;
        }

        .property-description {
          color: #475569;
          line-height: 1.8;
          white-space: pre-line;
        }

        .amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 18px;
        }

        .amenity {
          padding: 8px 12px;
          border-radius: 20px;
          background: #f1f5f9;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .property-contact-card {
          position: sticky;
          top: 20px;
          height: fit-content;
          padding: 23px;
        }

        .contact-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 22px;
          font-weight: 900;
        }

        .contact-subtitle {
          margin: 0 0 20px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .contact-button {
          width: 100%;
          padding: 14px;
          margin-bottom: 10px;
          border: 0;
          border-radius: 11px;
          color: white;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
        }

        .enquiry-button {
          background: #2563eb;
        }

        .whatsapp-button {
          background: #16a34a;
        }

        .favorite-button {
          background: #f1f5f9;
          color: #0f172a;
        }

        .seller-box {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .seller-label {
          color: #94a3b8;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .seller-name {
          color: #0f172a;
          font-size: 16px;
          font-weight: 850;
        }

        .enquiry-overlay {
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
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 25px;
          border-radius: 18px;
          background: white;
          box-shadow:
            0 25px 70px rgba(0,0,0,.25);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          margin: 0;
          color: #0f172a;
          font-size: 23px;
        }

        .close-button {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 50%;
          background: #f1f5f9;
          color: #334155;
          font-size: 20px;
          cursor: pointer;
        }

        .modal-input,
        .modal-textarea {
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 12px;
          padding: 13px 14px;
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          outline: none;
          font-size: 14px;
        }

        .modal-textarea {
          min-height: 110px;
          resize: vertical;
        }

        .modal-submit {
          width: 100%;
          padding: 14px;
          border: 0;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          font-weight: 850;
          cursor: pointer;
        }

        .detail-message {
          margin: 20px 0 0;
          padding: 12px 15px;
          border-radius: 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
        }

        @media (max-width: 850px) {
          .property-layout {
            grid-template-columns: 1fr;
          }

          .property-contact-card {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .property-detail-page {
            padding: 20px 14px 60px;
          }

          .property-gallery,
          .property-main-image,
          .image-placeholder {
            min-height: 300px;
            height: 300px;
          }

          .property-main-card {
            padding: 20px;
          }

          .property-stats {
            grid-template-columns:
              repeat(2, 1fr);
            gap: 18px;
          }

          .property-stat {
            border-right: 0;
            padding: 0;
          }

          .property-stat:nth-child(1),
          .property-stat:nth-child(2) {
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
        }
      `}</style>

      <main className="property-detail-page">
        <div className="property-detail-container">

          <button
            className="back-button"
            onClick={goBack}
          >
            ← Back to Properties
          </button>

          <section className="property-gallery">

            {currentImage ? (
              <img
                className="property-main-image"
                src={currentImage}
                alt={
                  property.title ||
                  "Property"
                }
              />
            ) : (
              <div className="image-placeholder">
                🏠
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

                <div className="image-count">
                  {imageIndex + 1} /{" "}
                  {gallery.length}
                </div>
              </>
            )}

          </section>

          <div className="property-layout">

            <section className="property-main-card">

              <span className="property-type-badge">
                {property.listing_type ||
                  property.property_type ||
                  "Property"}
              </span>

              <h1 className="property-title">
                {property.title ||
                  "Property Listing"}
              </h1>

              <p className="property-location">
                📍{" "}
                {property.location ||
                  property.address ||
                  "Location not available"}
              </p>

              <div className="property-price">
                {formatPrice(
                  property.price
                )}
              </div>

              <div className="property-stats">

                <div className="property-stat">
                  <div className="property-stat-label">
                    Area
                  </div>

                  <div className="property-stat-value">
                    {property.area
                      ? `${property.area} Sq. Ft.`
                      : "—"}
                  </div>
                </div>

                <div className="property-stat">
                  <div className="property-stat-label">
                    Bedrooms
                  </div>

                  <div className="property-stat-value">
                    {property.bedrooms ??
                      "—"}
                  </div>
                </div>

                <div className="property-stat">
                  <div className="property-stat-label">
                    Bathrooms
                  </div>

                  <div className="property-stat-value">
                    {property.bathrooms ??
                      "—"}
                  </div>
                </div>

                <div c
