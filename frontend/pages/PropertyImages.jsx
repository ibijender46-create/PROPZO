import React, { useEffect, useMemo, useState } from "react";
import {
  getProperty,
  getPropertyImages,
} from "../src/api";

export default function PropertyImages() {
  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [viewMode, setViewMode] = useState("grid");

  const propertyId = useMemo(() => {
    const hash =
      window.location.hash.replace(
        "#",
        ""
      );

    if (hash.startsWith("property-images/")) {
      return hash.split("/")[1];
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    return params.get("id");
  }, []);

  useEffect(() => {
    if (propertyId) {
      loadGallery();
    } else {
      setLoading(false);
    }
  }, [propertyId]);

  async function loadGallery() {
    try {
      setLoading(true);

      const [propertyResponse, imageResponse] =
        await Promise.all([
          getProperty(propertyId),
          getPropertyImages(propertyId),
        ]);

      const propertyData =
        propertyResponse?.property ||
        propertyResponse?.data ||
        propertyResponse;

      const imageData =
        imageResponse?.images ||
        imageResponse?.data ||
        [];

      setProperty(
        propertyData || null
      );

      setImages(
        normalizeImages(
          imageData,
          propertyData
        )
      );
    } catch (error) {
      console.error(
        "Property gallery error:",
        error
      );

      setProperty(null);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  function normalizeImages(
    apiImages,
    propertyData
  ) {
    const result = [];

    if (Array.isArray(apiImages)) {
      apiImages.forEach((item) => {
        const url =
          typeof item === "string"
            ? item
            : item?.image_url ||
              item?.url ||
              item?.image;

        if (url) {
          result.push({
            id:
              typeof item === "object"
                ? item.id
                : url,
            url,
            title:
              typeof item === "object"
                ? item.title ||
                  item.caption
                : "",
          });
        }
      });
    }

    const mainImage =
      propertyData?.image_url ||
      propertyData?.image ||
      propertyData?.thumbnail;

    if (
      mainImage &&
      !result.some(
        (item) =>
          item.url === mainImage
      )
    ) {
      result.unshift({
        id: "main-property-image",
        url: mainImage,
        title: "Property Main Image",
      });
    }

    if (result.length === 0) {
      result.push({
        id: "fallback",
        url:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=85",
        title: "Property Image",
      });
    }

    return result;
  }

  function money(value) {
    const amount = Number(value);

    if (!amount) {
      return "Price on Request";
    }

    if (amount >= 10000000) {
      return `₹${(
        amount / 10000000
      ).toFixed(2)} Cr`;
    }

    if (amount >= 100000) {
      return `₹${(
        amount / 100000
      ).toFixed(2)} L`;
    }

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  }

  function goBack() {
    window.history.back();
  }

  function openProperty() {
    if (!propertyId) return;

    window.location.hash =
      `property/${propertyId}`;
  }

  function previousImage() {
    setActiveImage((current) =>
      current === 0
        ? images.length - 1
        : current - 1
    );
  }

  function nextImage() {
    setActiveImage((current) =>
      current === images.length - 1
        ? 0
        : current + 1
    );
  }

  function selectImage(index) {
    setActiveImage(index);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      previousImage();
    }

    if (event.key === "ArrowRight") {
      nextImage();
    }

    if (event.key === "Escape") {
      setViewMode("grid");
    }
  }

  useEffect(() => {
    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  });

  if (loading) {
    return (
      <>
        <style>{`
          .gallery-loading {
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

        <div className="gallery-loading">
          Loading Property Gallery...
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <style>{`
          .gallery-error {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            background: #f8fafc;
            text-align: center;
          }

          .gallery-error-icon {
            font-size: 50px;
            margin-bottom: 12px;
          }

          .gallery-error h2 {
            margin: 0 0 7px;
            color: #0f172a;
          }

          .gallery-error p {
            margin: 0 0 18px;
            color: #64748b;
          }

          .gallery-error button {
            padding: 11px 18px;
            border: 0;
            border-radius: 9px;
            background: #2563eb;
            color: white;
            font-weight: 850;
            cursor: pointer;
          }
        `}</style>

        <div className="gallery-error">
          <div className="gallery-error-icon">
            🏠
          </div>

          <h2>
            Property Not Found
          </h2>

          <p>
            The requested property could
            not be loaded.
          </p>

          <button onClick={goBack}>
            Go Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .gallery-page {
          min-height: 100vh;
          padding: 28px 18px 70px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.08),
              transparent 30%
            ),
            #f8fafc;
        }

        .gallery-container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .gallery-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
        }

        .gallery-back {
          border: 1px solid #dbe3ee;
          padding: 10px 14px;
          border-radius: 9px;
          background: white;
          color: #334155;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .gallery-back:hover {
          border-color: #2563eb;
          color: #2563eb;
        }

        .gallery-top-actions {
          display: flex;
          gap: 8px;
        }

        .gallery-view-btn {
          border: 1px solid #dbe3ee;
          padding: 9px 12px;
          border-radius: 9px;
          background: white;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .gallery-view-btn.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .gallery-title {
          margin-bottom: 20px;
        }

        .gallery-title h1 {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: clamp(
            26px,
            4vw,
            37px
          );
          font-weight: 950;
        }

        .gallery-title p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .gallery-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 300px;
          gap: 20px;
          align-items: start;
        }

        .gallery-viewer {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 19px;
          background: #0f172a;
          box-shadow:
            0 15px 40px
            rgba(15,23,42,.10);
        }

        .gallery-main {
          position: relative;
          height: 570px;
          background: #020617;
        }

        .gallery-main img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
        }

        .gallery-arrow {
          position: absolute;
          top: 50%;
          width: 42px;
          height: 42px;
          transform: translateY(-50%);
          border: 0;
          border-radius: 50%;
          background:
            rgba(255,255,255,.9);
          color: #0f172a;
          font-size: 20px;
          font-weight: 900;
          cursor: pointer;
          box-shadow:
            0 5px 20px
            rgba(0,0,0,.2);
        }

        .gallery-arrow.left {
          left: 15px;
        }

        .gallery-arrow.right {
          right: 15px;
        }

        .gallery-arrow:hover {
          background: white;
        }

        .gallery-counter {
          position: absolute;
          right: 15px;
          bottom: 15px;
          padding: 7px 10px;
          border-radius: 20px;
          background:
            rgba(15,23,42,.75);
          color: white;
          font-size: 11px;
          font-weight: 850;
        }

        .gallery-caption {
          padding: 13px 16px;
          background: #0f172a;
          color: #cbd5e1;
          font-size: 12px;
        }

        .gallery-thumbnails {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 8px;
          padding: 12px;
          background: #0f172a;
        }

        .gallery-thumb {
          height: 72px;
          overflow: hidden;
          padding: 0;
          border: 2px solid transparent;
          border-radius: 8px;
          background: #1e293b;
          cursor: pointer;
        }

        .gallery-thumb.active {
          border-color: #60a5fa;
        }

        .gallery-thumb img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .gallery-info {
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          box-shadow:
            0 8px 28px
            rgba(15,23,42,.05);
        }

        .gallery-info h2 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 19px;
          font-weight: 900;
          line-height: 1.35;
        }

        .gallery-location {
          margin: 0 0 15px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .gallery-price {
          margin-bottom: 17px;
          color: #2563eb;
          font-size: 23px;
          font-weight: 950;
        }

        .gallery-stats {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 18px;
        }

        .gallery-stat {
          padding: 10px;
          border-radius: 9px;
          background: #f8fafc;
        }

        .gallery-stat-label {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 800;
        }

        .gallery-stat-value {
          margin-top: 3px;
          color: #334155;
          font-size: 12px;
          font-weight: 900;
        }

        .gallery-open-btn {
          width: 100%;
          padding: 12px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: white;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .gallery-open-btn:hover {
          background: #1d4ed8;
        }

        .gallery-grid-mode {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .gallery-grid-item {
          position: relative;
          overflow: hidden;
          height: 250px;
          border-radius: 14px;
          background: #e2e8f0;
          cursor: pointer;
        }

        .gallery-grid-item img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform .25s ease;
        }

        .gallery-grid-item:hover img {
          transform: scale(1.04);
        }

        .gallery-grid-index {
          position: absolute;
          left: 10px;
          bottom: 10px;
          padding: 5px 8px;
          border-radius: 15px;
          background:
            rgba(15,23,42,.75);
          color: white;
          font-size: 9px;
          font-weight: 850;
        }

        @media (max-width: 900px) {
          .gallery-layout {
            grid-template-columns: 1fr;
          }

          .gallery-info {
            order: 2;
          }

          .gallery-main {
            height: 500px;
          }
        }

        @media (max-width: 600px) {
          .gallery-page {
            padding: 20px 12px 55px;
          }

          .gallery-topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .gallery-top-actions {
            width: 100%;
          }

          .gallery-view-btn {
            flex: 1;
          }

          .gallery-main {
            height: 330px;
          }

          .gallery-thumbnails {
            grid-template-columns:
              repeat(4, minmax(0, 1fr));
          }

          .gallery-thumb {
            height: 60px;
          }

          .gallery-grid-mode {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .gallery-grid-item {
            height: 180px;
          }
        }
      `}</style>

      <main className="gallery-page">
        <div className="gallery-container">

          <div className="gallery-topbar">

            <button
              className="gallery-back"
              onClick={goBack}
            >
              ← Back
            </button>

            <div className="gallery-top-actions">

              <button
                className={`gallery-view-btn ${
                  viewMode === "grid"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setViewMode("grid")
                }
              >
                ▦ Gallery
              </button>

              <button
                className={`gallery-view-btn ${
                  viewMode === "single"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setViewMode("single")
                }
              >
                ◉ Viewer
              </button>

            </div>

          </div>

          <header className="gallery-title">

            <h1>
              {property.title ||
                "Property Gallery"}
            </h1>

            <p>
              📍{" "}
              {property.location ||
                property.city ||
                "Location unavailable"}
              {" • "}
              {images.length}{" "}
              {images.length === 1
                ? "Image"
                : "Images"}
            </p>

          </header>

          {viewMode === "grid" ? (
            <section className="gallery-grid-mode">

              {images.map(
                (image, index) => (
                  <div
                    className="gallery-grid-item"
                    key={
                      image.id ||
                      `${image.url}-${index}`
                    }
                    onClick={() => {
                      setActiveImage(index);
                      setViewMode("single");
                    }}
                  >

                    <img
                      src={image.url}
                      alt={
                        image.title ||
                        property.title ||
                        "Property"
                      }
                      loading="lazy"
                    />

                    <span className="gallery-grid-index">
                      {index + 1}
                    </span>

                  </div>
                )
              )}

            </section>
          ) : (
            <section className="gallery-layout">

              <div className="gallery-viewer">

                <div className="gallery-main">

                  <img
                    src={
                      images[
                        activeImage
                      ]?.url
                    }
                    alt={
                      images[
                        activeImage
                      ]?.title ||
                      property.title ||
                      "Property"
                    }
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        className="gallery-arrow left"
                        onClick={
                          previousImage
                        }
                        aria-label="Previous image"
                      >
                        ‹
                      </button>

                      <button
                        className="gallery-arrow right"
                        onClick={
                          nextImage
                        }
                        aria-label="Next image"
                      >
                        ›
                      </button>
                    </>
                  )}

                  <span className="gallery-counter">
                    {activeImage + 1} /{" "}
                    {images.length}
                  </span>

                </div>

                <div className="gallery-caption">
                  {images[
                    activeImage
                  ]?.title ||
                    "Property Image"}
                </div>

                <div className="gallery-thumbnails">

                  {images.map(
                    (image, index) => (
                      <button
                        className={`gallery-thumb ${
                          activeImage ===
                          index
                            ? "active"
                            : ""
                        }`}
                        key={
                          image.id ||
                          `${image.url}-${index}`
                        }
                        onClick={() =>
                          selectImage(
                            index
                          )
                        }
                      >
                        <img
                          src={image.url}
                          alt=""
                        />
                      </button>
                    )
                  )}

                </div>

              </div>

              <aside className="gallery-info">

                <h2>
                  {property.title ||
                    "Property"}
                </h2>

                <p className="gallery-location">
                  📍{" "}
                  {property.location ||
                    property.city ||
                    "Location unavailable"}
                </p>

                <div className="gallery-price">
                  {money(
                    property.price
                  )}
                </div>

                <div className="
