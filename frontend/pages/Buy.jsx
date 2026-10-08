import React, { useEffect, useMemo, useState } from "react";
import {
  getProperties,
  addFavorite,
} from "../src/api";

export default function Buy() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] =
    useState("All Property Types");
  const [budget, setBudget] =
    useState("Any Budget");
  const [bhk, setBhk] = useState("Any BHK");
  const [sortBy, setSortBy] =
    useState("Newest");

  const [favoriteLoading, setFavoriteLoading] =
    useState(null);

  const [notice, setNotice] =
    useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);

      const response =
        await getProperties();

      const list =
        response?.properties ||
        response?.data ||
        response ||
        [];

      if (!Array.isArray(list)) {
        setProperties([]);
        return;
      }

      const normalized = list.map(
        (property) => ({
          ...property,

          id: property.id,

          title:
            property.title ||
            "Premium Property",

          location:
            property.location ||
            property.city ||
            "Location not available",

          city:
            property.city ||
            "",

          state:
            property.state ||
            "",

          price:
            property.price !== null &&
            property.price !== undefined &&
            property.price !== ""
              ? Number(property.price)
              : null,

          type:
            property.property_type ||
            "Property",

          listingType:
            property.listing_type ||
            "Sale",

          bedrooms:
            Number(property.bedrooms) ||
            0,

          bathrooms:
            Number(property.bathrooms) ||
            0,

          area:
            Number(property.area) ||
            0,

          areaUnit:
            property.area_unit ||
            "Sq. Ft.",

          furnishing:
            property.furnishing ||
            "",

          possession:
            property.possession ||
            "",

          description:
            property.description ||
            "Premium property available on PROZPO.",

          image:
            property.image_url ||
            property.image ||
            "",
        })
      );

      setProperties(normalized);
    } catch (error) {
      console.error(
        "Properties loading error:",
        error
      );

      setProperties([]);

      showNotice(
        error?.message ||
          "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  }

  function showNotice(text) {
    setNotice(text);

    window.setTimeout(() => {
      setNotice("");
    }, 4000);
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

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    const searchText =
      search.trim().toLowerCase();

    if (searchText) {
      result = result.filter(
        (property) => {
          const searchableText = [
            property.title,
            property.location,
            property.city,
            property.state,
            property.type,
            property.listingType,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            searchText
          );
        }
      );
    }

    if (
      propertyType !==
      "All Property Types"
    ) {
      result = result.filter(
        (property) =>
          String(property.type)
            .toLowerCase()
            .includes(
              propertyType.toLowerCase()
            )
      );
    }

    if (budget !== "Any Budget") {
      result = result.filter(
        (property) => {
          const price =
            Number(property.price) || 0;

          if (
            budget ===
            "Under ₹50 Lakh"
          ) {
            return (
              price > 0 &&
              price < 5000000
            );
          }

          if (
            budget ===
            "₹50 Lakh - ₹1 Cr"
          ) {
            return (
              price >= 5000000 &&
              price <= 10000000
            );
          }

          if (
            budget ===
            "₹1 Cr - ₹2 Cr"
          ) {
            return (
              price > 10000000 &&
              price <= 20000000
            );
          }

          if (
            budget ===
            "Above ₹2 Cr"
          ) {
            return price > 20000000;
          }

          return true;
        }
      );
    }

    if (bhk !== "Any BHK") {
      const selected =
        Number(
          bhk.replace(" BHK", "")
        );

      result = result.filter(
        (property) =>
          Number(property.bedrooms) ===
          selected
      );
    }

    if (sortBy === "Low to High") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === "High to Low") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === "Area: High to Low") {
      result.sort(
        (a, b) =>
          Number(b.area || 0) -
          Number(a.area || 0)
      );
    }

    return result;
  }, [
    properties,
    search,
    propertyType,
    budget,
    bhk,
    sortBy,
  ]);

  function clearFilters() {
    setSearch("");
    setPropertyType(
      "All Property Types"
    );
    setBudget("Any Budget");
    setBhk("Any BHK");
    setSortBy("Newest");
  }

  function openProperty(property) {
    if (!property?.id) {
      return;
    }

    window.location.hash =
      `#/property/${encodeURIComponent(
        property.id
      )}`;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleFavorite(
    event,
    property
  ) {
    event.stopPropagation();

    if (!property?.id) {
      return;
    }

    try {
      setFavoriteLoading(
        property.id
      );

      await addFavorite({
        property_id: property.id,
      });

      showNotice(
        "Property added to favorites."
      );
    } catch (error) {
      showNotice(
        error?.message ||
          "Please login to save favorites."
      );
    } finally {
      setFavoriteLoading(null);
    }
  }

  function goToPostProperty() {
    window.location.hash =
      "#/post-property";
  }

  return (
    <>
      <style>{styles}</style>

      <main className="buy-page">

        {/* TOP HERO */}

        <section className="buy-hero">

          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />

          <div className="buy-hero-inner">

            <div className="hero-content">

              <span className="hero-badge">
                PROZPO • BUY PROPERTY
              </span>

              <h1>
                Find Your
                <span>
                  {" "}Dream Property
                </span>
              </h1>

              <p>
                Discover verified property listings
                from owners, agents and builders
                across India.
              </p>

              <div className="hero-points">

                <span>
                  ✓ Residential
                </span>

                <span>
                  ✓ Commercial
                </span>

                <span>
                  ✓ Plots
                </span>

                <span>
                  ✓ Projects
                </span>

              </div>

            </div>

            <div className="hero-stat-card">

              <div className="hero-stat-number">
                {properties.length}
              </div>

              <div className="hero-stat-label">
                Properties Listed
              </div>

              <div className="hero-stat-line">
                Live PROZPO inventory
              </div>

            </div>

          </div>
        </section>

        {/* SEARCH PANEL */}

        <section className="search-wrapper">

          <div className="search-panel">

            <div className="search-main">

              <div className="search-icon">
                ⌕
              </div>

              <div className="search-content">

                <label>
                  LOCATION OR PROPERTY
                </label>

                <input
                  className="search-input"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search city, locality or property name"
                />

              </div>

            </div>

            <div className="filter-divider" />

            <div className="search-filter">

              <label>
                PROPERTY TYPE
              </label>

              <select
                value={propertyType}
                onChange={(event) =>
                  setPropertyType(
                    event.target.value
                  )
                }
              >
                <option>
                  All Property Types
                </option>

                <option>
                  Apartment
                </option>

                <option>
                  Villa
                </option>

                <option>
                  Independent House
                </option>

                <option>
                  Plot
                </option>

                <option>
                  Commercial
                </option>

                <option>
                  Office
                </option>

                <option>
                  Shop
                </option>
              </select>

            </div>

            <div className="filter-divider" />

            <div className="search-filter">

              <label>
                BUDGET
              </label>

              <select
                value={budget}
                onChange={(event) =>
                  setBudget(
                    event.target.value
                  )
                }
              >
                <option>
                  Any Budget
                </option>

                <option>
                  Under ₹50 Lakh
                </option>

                <option>
                  ₹50 Lakh - ₹1 Cr
                </option>

                <option>
                  ₹1 Cr - ₹2 Cr
                </option>

                <option>
                  Above ₹2 Cr
                </option>
              </select>

            </div>

            <button
              className="search-action"
              onClick={() =>
                document
                  .getElementById(
                    "property-results"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Search
            </button>

          </div>

        </section>

        {/* NOTICE */}

        {notice && (
          <div className="notice">
            <span>
              {notice}
            </span>

            <button
              onClick={() =>
                setNotice("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* RESULTS */}

        <section
          id="property-results"
          className="results-section"
        >

          <div className="results-header">

            <div>

              <span className="section-kicker">
                PROPERTY MARKETPLACE
              </span>

              <h2>
                Properties For Sale
              </h2>

              <p>
                {loading
                  ? "Loading available properties..."
                  : `${filteredProperties.length} ${
                      filteredProperties.length === 1
                        ? "property"
                        : "properties"
                    } matching your search`}
              </p>

            </div>

            <div className="result-tools">

              <select
                className="bhk-select"
                value={bhk}
                onChange={(event) =>
                  setBhk(
                    event.target.value
                  )
                }
              >
                <option>
                  Any BHK
                </option>

                <option>
                  1 BHK
                </option>

                <option>
                  2 BHK
                </option>

                <option>
                  3 BHK
                </option>

                <option>
                  4 BHK
                </option>

                <option>
                  5 BHK
                </option>
              </select>

              <select
                className="sort-select"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
              >
                <option>
                  Newest
                </option>

                <option>
                  Low to High
                </option>

                <option>
                  High to Low
                </option>

                <option>
                  Area: High to Low
                </option>
              </select>

              <button
                className="clear-button"
                onClick={
                  clearFilters
                }
              >
                Clear
              </button>

            </div>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="property-grid">

              {Array.from({
                length: 6,
              }).map(
                (_, index) => (
                  <div
                    className="skeleton-card"
                    key={index}
                  >

                    <div className="skeleton-image" />

                    <div className="skeleton-content">

                      <div className="skeleton-line small" />

                      <div className="skeleton-line large" />

                      <div className="skeleton-line medium" />

                      <div className="skeleton-line price" />

                    </div>

                  </div>
                )
              )}

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            filteredProperties.length ===
              0 && (
              <div className="empty-state">

                <div className="empty-icon">
                  🏠
                </div>

                <h3>
                  No Properties Found
                </h3>

                <p>
                  We couldn't find properties
                  matching your current filters.
                </p>

                <button
                  onClick={
                    clearFilters
                  }
                >
                  Clear Search
                </button>

              </div>
            )}

          {/* PROPERTY CARDS */}

          {!loading &&
            filteredProperties.length >
              0 && (
              <div className="property-grid">

                {filteredProperties.map(
                  (property) => (
                    <article
                      key={
                        property.id ||
                        property.title
                      }
                      className="property-card"
                      onClick={() =>
                        openProperty(
                          property
                        )
                      }
                    >

                      {/* IMAGE */}

                      <div className="property-image">

                        {property.image ? (
                          <img
                            src={
                              property.image
                            }
                            alt={
                              property.title
                            }
                            loading="lazy"
                          />
                        ) : (
                          <div className="property-placeholder">

                            <div>
                              🏠
                            </div>

                            <strong>
                              PROZPO
                            </strong>

                            <small>
                              Property Image
                            </small>

                          </div>
                        )}

                        <div className="image-gradient" />

                        <span className="sale-badge">
                          FOR SALE
                        </span>

                        <span className="verified-badge">
                          ✓ Verified
                        </span>

                        <button
                          className="favorite-button"
                          onClick={(
                            event
                          ) =>
                            handleFavorite(
                              event,
                              property
                            )
                          }
                          disabled={
                            favoriteLoading ===
                            property.id
                          }
                          aria-label="Save property"
                        >
                          {favoriteLoading ===
                          property.id
                            ? "..."
                            : "♡"}
                        </button>

                        <div className="image-bottom-info">
                          {property.city ||
                            property.location}
                        </div>

                      </div>

                      {/* CARD CONTENT */}

                      <div className="card-content">

                        <div className="card-top-row">

                          <span className="property-type">
                            {
                              property.type
                            }
                          </span>

                          <span className="listing-status">
                            Active
                          </span>

                        </div>

                        <h3>
                          {
                            property.title
                          }
                        </h3>

                        <p className="card-location">
                          <span>
                            📍
                          </span>

                          {
                            property.location
                          }

                          {property.city &&
                            property.location !==
                              property.city && (
                              <>
                                ,{" "}
                                {
                                  property.city
                                }
                              </>
                            )}
                        </p>

                        <div className="property-features">

                          {property.bedrooms >
                            0 && (
                            <span>
                              🛏{" "}
                              {
                                property.bedrooms
                              } BHK
                            </span>
                          )}

                          {property.bathrooms >
                            0 && (
                            <span>
                              🛁{" "}
                              {
                                property.bathrooms
                              } Bath
                            </span>
                          )}

                          {property.area >
                            0 && (
                            <span>
                              ▣{" "}
                              {
                                property.area
                              }{" "}
                              {
                                property.areaUnit
                              }
                            </span>
                          )}

                        </div>

                        <div className="card-footer">

                          <div>

                            <span className="price-caption">
                              PRICE
                            </span>

                            <strong>
                              {formatPrice(
                                property.price
                              )}
                            </strong>

                          </div>

                          <button
                            className="view-button"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              openProperty(
                                property
                              );
                            }}
                          >
                            View
                            <span>
                              →
                            </span>
                          </button>

                        </div>

                      </div>

                    </article>
                  )
                )}

              </div>
            )}

        </section>

        {/* WHY PROZPO */}

        <section className="why-section">

          <div className="why-inner">

            <div className="why-heading">

              <span className="section-kicker">
                WHY PROZPO
              </span>

              <h2>
                A Smarter Way To Find Property
              </h2>

              <p>
                PROZPO brings property discovery,
                enquiries and listings together
                in one marketplace.
              </p>

            </div>

            <div className="why-grid">

              <div className="why-card">
                <div>
                  ✓
                </div>

                <h3>
                  Multiple Property Types
                </h3>

                <p>
                  Explore apartments, villas,
                  houses, plots and commercial
                  properties.
                </p>
              </div>

              <div className="why-card">
                <div>
                  🔎
                </div>

                <h3>
                  Powerful Search
                </h3>

                <p>
                  Search by location, type,
                  budget and BHK.
                </p>
              </div>

              <div className="why-card">
                <div>
                  💬
                </div>

                <h3>
                  Direct Enquiry
                </h3>

                <p>
                  Connect with property advertisers
                  through the property page.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* CTA */}

        <section className="post-section">

          <div className="post-cta">

            <div className="post-content">

              <span>
                SELL • RENT • LIST
              </span>

              <h2>
                Have a property to sell?
              </h2>

              <p>
                Post your property on PROZPO
                and reach property seekers
                looking for their next investment.
              </p>

            </div>

            <button
              onClick={
                goToPostProperty
              }
            >
              Post Your Property
              <span>
                →
              </span>
            </button>

          </div>

        </section>

      </main>
    </>
  );
}

const styles = `
  .buy-page {
    min-height: 100vh;
    background: #f7f9fc;
    color: #172033;
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .buy-page * {
    box-sizing: border-box;
  }

  /* HERO */

  .buy-hero {
    position: relative;
    overflow: hidden;
    padding: 72px 22px 112px;
    background:
      radial-gradient(
        circle at 85% 10%,
        rgba(78,211,181,.17),
        transparent 28%
      ),
      linear-gradient(
        135deg,
        #06152e 0%,
        #0b2b59 58%,
        #1769d2 100%
      );
  }

  .buy-hero-inner {
    position: relative;
    z-index: 2;
    width: min(1200px, 100%);
    margin: auto;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 35px;
  }

  .hero-content {
    max-width: 760px;
  }

  .hero-badge {
    display: inline-flex;
    padding: 8px 13px;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 30px;
    background: rgba(255,255,255,.09);
    color: #cfe8ff;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1.3px;
  }

  .hero-content h1 {
    margin: 20px 0 13px;
    color: #fff;
    font-size: clamp(42px, 6vw, 62px);
    line-height: 1.02;
    letter-spacing: -2.5px;
    font-weight: 950;
  }

  .hero-content h1 span {
    color: #5ed5b2;
  }

  .hero-content p {
    max-width: 680px;
    margin: 0;
    color: #c5d7ea;
    font-size: 16px;
    line-height: 1.7;
  }

  .hero-points {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 22px;
  }

  .hero-points span {
    padding: 8px 11px;
    border-radius: 20px;
    background: rgba(255,255,255,.08);
    color: #e7f1fb;
    font-size: 11px;
    font-weight: 750;
  }

  .hero-stat-card {
    min-width: 185px;
    padding: 22px;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 20px;
    background: rgba(255,255,255,.09);
    color: #fff;
    text-align: center;
    backdrop-filter: blur(12px);
  }

  .hero-stat-number {
    font-size: 38px;
    font-weight: 950;
    line-height: 1;
  }

  .hero-stat-label {
    margin-top: 8px;
    color: #dceafa;
    font-size: 12px;
    font-weight: 800;
  }

  .hero-stat-line {
    margin-top: 12px;
    color: #8fb1d4;
    font-size: 10px;
  }

  .hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(2px);
    pointer-events: none;
  }

  .hero-orb-one {
    width: 340px;
    height: 340px;
    right: -100px;
    top: -150px;
    background: rgba(89,214,255,.12);
  }

  .hero-orb-two {
    width: 230px;
    height: 230px;
    left: -130px;
    bottom: -150px;
    background: rgba(77,219,181,.09);
  }

  /* SEARCH */

  .search-wrapper {
    position: relative;
    z-index: 5;
    width: min(1160px, calc(100% - 32px));
    margin: -50px auto 0;
  }

  .search-panel {
    display: grid;
    grid-template-columns:
      minmax(260px, 1.55fr)
      1px
      minmax(150px, 1fr)
      1px
      minmax(150px, 1fr)
      auto;
    align-items: center;
    gap: 13px;
    padding: 10px;
    border: 1px solid #e3e8ef;
    border-radius: 19px;
    background: #fff;
    box-shadow:
      0 22px 55px rgba(12,35,65,.14);
  }

  .search-main {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
    padding: 6px 9px;
  }

  .search-icon {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #edf5ff;
    color: #1769d2;
    font-size: 24px;
  }

  .search-content {
    min-width: 0;
    flex: 1;
  }

  .search-content label,
  .search-filter label {
    display: block;
    margin-bottom: 6px;
    color: #8a96a8;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .8px;
  }

  .search-input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #172033;
    font-size: 13px;
    font-weight: 650;
  }

  .search-input::placeholder {
    color: #a4afbd;
  }

  .search-filter {
    min-width: 0;
    padding: 5px 9px;
  }

  .search-filter select {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #334056;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
  }

  .filter-divider {
    width: 1px;
    height: 44px;
    background: #e6eaf0;
  }

  .search-action {
    min-height: 53px;
    padding: 0 23px;
    border: 0;
    border-radius: 12px;
    background:
      linear-gradient(
        135deg,
        #1769d2,
        #0c55b5
      );
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    box-shadow:
      0 8px 20px rgba(23,105,210,.2);
    transition: .2s ease;
  }

  .search-action:hover {
    transform: translateY(-2px);
  }

  /* NOTICE */

  .notice {
    position: fixed;
    z-index: 9999;
    right: 22px;
    top: 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    max-width: 360px;
    padding: 13px 15px;
    border: 1px solid #bfdbfe;
    border-radius: 12px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 750;
    box-shadow:
      0 15px 40px rgba(15,23,42,.16);
  }

  .notice button {
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 20px;
    cursor: pointer;
  }

  /* RESULTS */

  .results-section {
    width: min(1200px, 100%);
    margin: 0 auto;
    padding: 75px 22px 85px;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 25px;
    margin-bottom: 28px;
  }

  .section-kicker {
    display: block;
    margin-bottom: 7px;
    color: #1769d2;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 1.5px;
  }

  .results-header h2 {
    margin: 0;
    color: #142033;
    font-size: 33px;
    font-weight: 950;
    letter-spacing: -.9px;
  }

  .results-header p {
    margin: 7px 0 0;
    color: #788597;
    font-size: 13px;
  }

  .result-tools {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bhk-select,
  .sort-select,
  .clear-button {
    height: 42px;
    border: 1px solid #dfe5ec;
    border-radius: 10px;
    background: #fff;
    color: #334056;
    font-size: 11px;
    font-weight: 750;
    outline: none;
    cursor: pointer;
  }

  .bhk-select,
  .sort-select {
    padding: 0 11px;
  }

  .clear-button {
    padding: 0 13px;
  }

  .clear-button:hover {
    border-color: #93c5fd;
    background: #eff6ff;
    color: #1769d2;
  }

  /* GRID */

  .property-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 22px;
  }

  .property-card {
    overflow: hidden;
    border: 1px solid #e4e9ef;
    border-radius: 18px;
    background: #fff;
    box-shadow:
      0 7px 25px rgba(17,35,55,.045);
    cursor: pointer;
    transition:
      transform .25s ease,
      box-shadow .25s ease,
      border-color .25s ease;
  }

  .property-card:hover {
    transform: translateY(-5px);
    border-color: #cfdceb;
    box-shadow:
      0 20px 45px rgba(20,45,80,.12);
  }

  .property-image {
    position: relative;
    height: 230px;
    overflow: hidden;
    background: #dceaf7;
  }

  .property-image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .5s ease;
  }

  .property-card:hover
  .property-image img {
    transform: scale(1.045);
  }

  .image-gradient {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to top,
        rgba(4,18,38,.62),
        transparent 57%
      );
    pointer-events: none;
  }

  .property-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background:
      linear-gradient(
        135deg,
        #dbeafe,
        #e2e8f0
      );
    color: #52637a;
  }

  .property-placeholder div {
    font-size: 52px;
    margin-bottom: 5px;
  }

  .property-placeholder strong {
    color: #334155;
    font-size: 15px;
  }

  .property-placeholder small {
    margin-top: 3px;
    color: #64748b;
    font-size: 10px;
  }

  .sale-badge {
    position: absolute;
    left: 12px;
    top: 12px;
    padding: 7px 10px;
    border-radius: 20px;
    background: rgba(15,23,42,.82);
    color: #fff;
    font-size: 9px;
    font-weight: 950;
    letter-spacing: .5px;
  }

  .verified-badge {
    position: absolute;
    left: 12px;
    bottom: 12px;
    padding: 7px 10px;
    border-radius: 20px;
    background: #16a34a;
    color: #fff;
    font-size: 9px;
    font-weight: 900;
  }

  .favorite-button {
    position: absolute;
    right: 12px;
    top: 12px;
    width: 39px;
    height: 39px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.3);
    border-radius: 50%;
    background: rgba(255,255,255,.92);
    color: #172033;
    font-size: 21px;
    cursor: pointer;
    transition: .2s ease;
  }

  .favorite-button:hover {
    transform: scale(1.08);
    color: #dc2626;
  }

  .image-bottom-info {
    position: absolute;
    right: 12px;
    bottom: 13px;
    max-width: 48%;
    overflow: hidden;
    color: #fff;
    font-size: 9px;
    font-weight: 750;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .card-content {
    padding: 17px;
  }

  .card-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 9px;
  }

  .property-type {
    padding: 6px 9px;
    border-radius: 15px;
    background: #edf5ff;
    color: #1769d2;
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .listing-status {
    color: #16a34a;
    font-size: 9px;
    font-weight: 850;
  }

  .card-content h3 {
    overflow: hidden;
    margin: 0 0 7px;
    color: #142033;
    font-size: 17px;
    line-height: 1.3;
    font-weight: 900;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .card-location {
    display: flex;
    gap: 5px;
    overflow: hidden;
    margin: 0;
    color: #758296;
    font-size: 11px;
    line-height: 1.5;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .property-features {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 14px 0;
    padding: 12px 0;
    border-top: 1px solid #edf0f4;
    border-bottom: 1px solid #edf0f4;
  }

  .property-features span {
    padding: 6px 8px;
    border-radius: 7px;
    background: #f6f8fb;
    color: #5e6d81;
    font-size: 9px;
    font-weight: 700;
  }

  .card-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px;
  }

  .price-caption {
    display: block;
    margin-bottom: 3px;
    color: #9aa5b4;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .8px;
  }

  .card-footer strong {
    color: #1769d2;
    font-size: 18px;
    font-weight: 950;
  }

  .view-button {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 11px;
    border: 0;
    border-radius: 9px;
    background: #172033;
    color: #fff;
    font-size: 10px;
    font-weight: 850;
    cursor: pointer;
    transition: .2s ease;
  }

  .view-button:hover {
    background: #1769d2;
    transform: translateY(-1px);
  }

  /* SKELETON */

  .skeleton-card {
    overflow: hidden;
    border: 1px solid #e4e9ef;
    border-radius: 18px;
    background: #fff;
  }

  .skeleton-image {
    height: 230px;
    background:
      linear-gradient(
        90deg,
        #eef2f6 25%,
        #f8fafc 50%,
        #eef2f6 75%
      );
    background-size: 200% 100%;
    animation: skeletonMove 1.4s infinite;
  }

  .skeleton-content {
    padding: 17px;
  }

  .skeleton-line {
    height: 11px;
    margin-bottom: 13px;
    border-radius: 8px;
    background:
      linear-gradient(
        90deg,
        #eef2f6 25%,
        #f8fafc 50%,
        #eef2f6 75%
      );
    background-size: 200% 100%;
    animation: skeletonMove 1.4s infinite;
  }

  .skeleton-line.small {
    width: 28%;
  }

  .skeleton-line.medium {
    width: 55%;
  }

  .skeleton-line.large {
    width: 82%;
    height: 18px;
  }

  .skeleton-line.price {
    width: 42%;
    height: 20px;
    margin-top: 20px;
  }

  @keyframes skeletonMove {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }

  /* EMPTY */

  .empty-state {
    padding: 70px 20px;
    border: 1px dashed #cbd5e1;
    border-radius: 20px;
    background: #fff;
    text-align: center;
  }

  .empty-icon {
    font-size: 55px;
    margin-bottom: 12px;
  }

  .empty-state h3 {
    margin: 0 0 7px;
    color: #172033;
    font-size: 22px;
  }

  .empty-state p {
    margin: 0 auto 20px;
    max-width: 450px;
    color: #7a8798;
    font-size: 13px;
    line-height: 1.6;
  }

  .empty-state button {
    border: 0;
    border-radius: 10px;
    padding: 12px 18px;
    background: #1769d2;
    color: #fff;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
  }

  /* WHY */

  .why-section {
    padding: 75px 22px;
    background: #fff;
    border-top: 1px solid #e9edf2;
    border-bottom: 1px solid #e9edf2;
  }

  .why-inner {
    width: min(1200px, 100%);
    margin: auto;
  }

  .why-heading {
    max-width: 650px;
  }

  .why-heading h2 {
    margin: 0;
    color: #142033;
    font-size: 33px;
    font-weight: 950;
    letter-spacing: -.8px;
  }

  .why-heading p {
    margin: 9px 0 0;
    color: #788597;
    font-size: 13px;
    line-height: 1.7;
  }

  .why-grid {
    display: grid;
    grid-template-columns:
      repeat(3, 1fr);
    gap: 18px;
    margin-top: 28px;
  }

  .why-card {
    padding: 22px;
    border: 1px solid #e4e9ef;
    border-radius: 17px;
    background: #f9fbfd;
  }

  .why-card > div {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    margin-bottom: 15px;
    border-radius: 12px;
    background: #eaf3ff;
    color: #1769d2;
    font-size: 18px;
    font-weight: 900;
  }

  .why-card h3 {
    margin: 0 0 7px;
    color: #172033;
    font-size: 16px;
    font-weight: 900;
  }

  .why-card p {
    margin: 0;
    color: #718096;
    font-size: 12px;
    line-height: 1.65;
  }

  /* CTA */

  .post-section {
    padding: 70px 22px;
    background: #f7f9fc;
  }

  .post-cta {
    width: min(1200px, 100%);
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 25px;
    padding: 38px;
    overflow: hidden;
    border-radius: 25px;
    background:
      radial-gradient(
        circle at 90% 10%,
        rgba(255,255,255,.17),
        transparent 30%
      ),
      linear-gradient(
        135deg,
        #1769d2,
        #4f46e5
      );
    color: #fff;
  }

  .post-content > span {
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 1.4px;
    opacity: .8;
  }

  .post-content h2 {
    margin: 8px 0 7px;
    font-size: 29px;
    font-weight: 950;
  }

  .post-content p {
    max-width: 650px;
    margin: 0;
    color: rgba(255,255,255,.8);
    font-size: 13px;
    line-height: 1.65;
  }

  .post-cta > button {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    padding: 14px 19px;
    border: 0;
    border-radius: 11px;
    background: #fff;
    color: #1769d2;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    transition: .2s ease;
  }

  .post-cta > button:hover {
    transform: translateY(-2px);
  }

  /* RESPONSIVE */

  @media (max-width: 1050px) {
    .search-panel {
      grid-template-columns:
        1.5fr
        1fr
        1fr;
    }

    .filter-divider {
      display: none;
    }

    .search-main {
      grid-column: 1 / -1;
    }

    .search-action {
      min-height: 48px;
    }

    .property-grid {
      grid-template-columns:
        repeat(2, minmax(0,1fr));
    }
  }

  @media (max-width: 760px) {
    .buy-hero {
      padding:
        55px 18px
        100px;
    }

    .buy-hero-inner {
      flex-direction: column;
      align-items: flex-start;
    }

    .hero-stat-card {
      width: 100%;
    }

    .search-wrapper {
      width: calc(100% - 24px);
    }

    .search-panel {
      grid-template-columns: 1fr;
    }

    .search-main {
      grid-column: auto;
    }

    .results-section {
      padding:
        60px 16px
        65px;
    }

    .results-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .result-tools {
      width: 100%;
      flex-wrap: wrap;
    }

    .bhk-select,
    .sort-select,
    .clear-button {
      flex: 1;
    }

    .property-grid {
      grid-template-columns: 1fr;
    }

    .why-section {
      padding:
        60px 16px;
    }

    .why-grid {
      grid-template-columns: 1fr;
    }

    .post-section {
      padding:
        55px 16px;
    }

    .post-cta {
      flex-direction: column;
      align-items: flex-start;
      padding: 28px 23px;
    }

    .post-cta > button {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .hero-content h1 {
      font-size: 40px;
    }

    .hero-content p {
      font-size: 14px;
    }

    .hero-points span {
      font-size: 9px;
    }

    .results-header h2 {
      font-size: 28px;
    }

    .property-image {
      height: 215px;
    }

    .skeleton-image {
      height: 215px;
    }

    .card-footer strong {
      font-size: 16px;
    }

    .notice {
      left: 12px;
      right: 12px;
      top: 12px;
    }
  }
`;
