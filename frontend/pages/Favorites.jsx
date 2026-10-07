import React, { useEffect, useState } from "react";
import {
  getFavorites,
  deleteFavorite,
} from "../src/api";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      setLoading(true);
      setMessage("");

      const response = await getFavorites();

      const data =
        response?.favorites ||
        response?.data ||
        [];

      setFavorites(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Favorites loading error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load favorites."
      );
    } finally {
      setLoading(false);
    }
  }

  function getProperty(favorite) {
    return (
      favorite.property ||
      favorite.properties ||
      {}
    );
  }

  function getPropertyId(favorite) {
    return (
      favorite.property_id ||
      favorite.property?.id ||
      favorite.properties?.id
    );
  }

  function getImage(property) {
    return (
      property.image_url ||
      property.image ||
      property.thumbnail ||
      ""
    );
  }

  function formatPrice(price) {
    if (!price) {
      return "Price on Request";
    }

    const value = Number(price);

    if (Number.isNaN(value)) {
      return price;
    }

    if (value >= 10000000) {
      return `₹${(
        value / 10000000
      ).toFixed(2)} Cr`;
    }

    if (value >= 100000) {
      return `₹${(
        value / 100000
      ).toFixed(2)} Lakh`;
    }

    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  }

  function openProperty(id) {
    if (!id) {
      setMessage(
        "Property details are unavailable."
      );
      return;
    }

    window.location.hash =
      `property/${id}`;
  }

  async function removeFavorite(favorite) {
    const favoriteId =
      favorite.id;

    if (!favoriteId) {
      setMessage(
        "Favorite record ID not found."
      );
      return;
    }

    try {
      setRemovingId(favoriteId);
      setMessage("");

      await deleteFavorite(
        favoriteId
      );

      setFavorites((previous) =>
        previous.filter(
          (item) =>
            item.id !== favoriteId
        )
      );

      setMessage(
        "Property removed from favorites."
      );
    } catch (error) {
      console.error(
        "Remove favorite error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to remove favorite."
      );
    } finally {
      setRemovingId(null);
    }
  }

  const filteredFavorites =
    favorites.filter((favorite) => {
      const property =
        getProperty(favorite);

      const query =
        search.toLowerCase().trim();

      if (!query) return true;

      const searchableText = [
        property.title,
        property.location,
        property.property_type,
        property.listing_type,
        property.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        query
      );
    });

  return (
    <>
      <style>{`
        .favorites-page {
          min-height: 100vh;
          padding: 45px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(239,68,68,.07),
              transparent 35%
            ),
            #f8fafc;
        }

        .favorites-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .favorites-header {
          margin-bottom: 30px;
        }

        .favorites-badge {
          display: inline-block;
          padding: 7px 13px;
          margin-bottom: 10px;
          border-radius: 20px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .7px;
        }

        .favorites-header h1 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 5vw, 45px);
          font-weight: 900;
        }

        .favorites-header p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
        }

        .favorites-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .favorite-search {
          width: 100%;
          max-width: 550px;
          padding: 14px 16px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          background: white;
          color: #0f172a;
          font-size: 14px;
          outline: none;
        }

        .favorite-search:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.10);
        }

        .favorite-count {
          color: #475569;
          font-size: 14px;
          font-weight: 800;
          white-space: nowrap;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .favorite-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          box-shadow:
            0 10px 30px rgba(15,23,42,.06);
          transition: .25s;
        }

        .favorite-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 18px 40px rgba(15,23,42,.10);
        }

        .favorite-image-wrap {
          position: relative;
          height: 210px;
          background:
            linear-gradient(
              135deg,
              #fee2e2,
              #e2e8f0
            );
        }

        .favorite-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .favorite-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
        }

        .heart-icon {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          color: #dc2626;
          font-size: 20px;
        }

        .favorite-content {
          padding: 20px;
        }

        .favorite-content h2 {
          margin: 0 0 7px;
          color: #0f172a;
          font-size: 19px;
          line-height: 1.3;
          font-weight: 900;
        }

        .favorite-location {
          margin: 0 0 12px;
          color: #64748b;
          font-size: 13px;
        }

        .favorite-price {
          margin-bottom: 15px;
          color: #2563eb;
          font-size: 21px;
          font-weight: 900;
        }

        .favorite-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 18px;
        }

        .favorite-meta-item {
          padding: 6px 9px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
          font-weight: 750;
        }

        .favorite-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .favorite-button {
          padding: 11px 8px;
          border: 0;
          border-radius: 9px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 850;
        }

        .view-favorite {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .remove-favorite {
          background: #fef2f2;
          color: #b91c1c;
        }

        .favorite-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .favorites-loading,
        .favorites-empty {
          padding: 55px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          color: #64748b;
          text-align: center;
        }

        .favorites-empty h2 {
          margin: 0 0 8px;
          color: #0f172a;
        }

        .favorites-empty p {
          margin: 0;
        }

        .favorites-message {
          margin-bottom: 20px;
          padding: 12px 15px;
          border-radius: 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 750;
          text-align: center;
        }

        @media (max-width: 1000px) {
          .favorites-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .favorites-page {
            padding: 30px 14px 60px;
          }

          .favorites-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .favorite-count {
            white-space: normal;
          }

          .favorites-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="favorites-page">
        <div className="favorites-container">

          <section className="favorites-header">
            <span className="favorites-badge">
              SAVED PROPERTIES
            </span>

            <h1>
              My Favorites
            </h1>

            <p>
              Keep your shortlisted properties
              in one place and access them anytime.
            </p>
          </section>

          {message && (
            <div className="favorites-message">
              {message}
            </div>
          )}

          <section className="favorites-toolbar">

            <input
              className="favorite-search"
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search saved properties..."
            />

            <div className="favorite-count">
              {loading
                ? "Loading..."
                : `${filteredFavorites.length} Saved Properties`}
            </div>

          </section>

          {loading ? (
            <div className="favorites-loading">
              Loading your favorites...
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="favorites-empty">

              <div
                style={{
                  fontSize: "55px",
                  marginBottom: "12px",
                }}
              >
                ❤️
              </div>

              <h2>
                No Favorite Properties
              </h2>

              <p>
                Save properties you like and
                they will appear here.
              </p>

            </div>
          ) : (
            <section className="favorites-grid">

              {filteredFavorites.map(
                (favorite, index) => {
                  const property =
                    getProperty(favorite);

                  const propertyId =
                    getPropertyId(
                      favorite
                    );

                  const image =
                    getImage(property);

                  return (
                    <article
                      className="favorite-card"
                      key={
                        favorite.id ||
                        propertyId ||
                        index
                      }
                    >

                      <div className="favorite-image-wrap">

                        {image ? (
                          <img
                            className="favorite-image"
                            src={image}
                            alt={
                              property.title ||
                              "Saved Property"
                            }
                          />
                        ) : (
                          <div className="favorite-placeholder">
                            🏠
                          </div>
                        )}

                        <span className="heart-icon">
                          ♥
                        </span>

                      </div>

                      <div className="favorite-content">

                        <h2>
                          {property.title ||
                            "Saved Property"}
                        </h2>

                        <p className="favorite-location">
                          📍{" "}
                          {property.location ||
                            "Location unavailable"}
                        </p>

                        <div className="favorite-price">
                          {formatPrice(
                            property.price
                          )}
                        </div>

                        <div className="favorite-meta">

                          {property.property_type && (
                            <span className="favorite-meta-item">
                              🏠{" "}
                              {
                                property.property_type
                              }
                            </span>
                          )}

                          {property.area && (
                            <span className="favorite-meta-item">
                              📐{" "}
                              {property.area} Sq. Ft.
                            </span>
                          )}

                          {property.bedrooms !==
                            null &&
                            property.bedrooms !==
                              undefined && (
                              <span className="favorite-meta-item">
                                🛏️{" "}
                                {
                                  property.bedrooms
                                } BHK
                              </span>
                            )}

                          {property.bathrooms !==
                            null &&
                            property.bathrooms !==
                              undefined && (
                              <span className="favorite-meta-item">
                                🚿{" "}
                                {
                                  property.bathrooms
                                } Bath
                              </span>
                            )}

                        </div>

                        <div className="favorite-actions">

                          <button
                            className="favorite-button view-favorite"
                            onClick={() =>
                              openProperty(
                                propertyId
                              )
                            }
                          >
                            View Property
                          </button>

                          <button
                            className="favorite-button remove-favorite"
                            disabled={
                              removingId ===
                              favorite.id
                            }
                            onClick={() =>
                              removeFavorite(
                                favorite
                              )
                            }
                          >
                            {removingId ===
                            favorite.id
                              ? "Removing..."
                              : "Remove"}
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </section>
          )}

        </div>
      </main>
    </>
  );
}
