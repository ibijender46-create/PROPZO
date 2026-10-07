import React, { useEffect, useMemo, useState } from "react";
import { getProperties } from "../src/api";

function Buy() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("All Property Types");
  const [budget, setBudget] = useState("Any Budget");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    let mounted = true;

    getProperties()
      .then((data) => {
        if (!mounted) return;

        const list = Array.isArray(data) ? data : [];

        setProperties(
          list.map((p) => ({
            ...p,
            id: p.id,
            title: p.title || "Premium Property",
            location: p.location || "Location not available",
            price: p.price ? Number(p.price) : null,
            type: p.property_type || p.type || "Property",
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            area: p.area || 0,
            description:
              p.description ||
              "Premium property available on PROZPO.",
            image:
              p.image_url ||
              p.image ||
              p.thumbnail ||
              "",
          }))
        );
      })
      .catch((error) => {
        console.error("Properties loading error:", error);
        if (mounted) setProperties([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatPrice = (price) => {
    if (!price) return "Price on Request";

    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }

    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    const searchText = search.trim().toLowerCase();

    if (searchText) {
      result = result.filter((property) => {
        return (
          property.title?.toLowerCase().includes(searchText) ||
          property.location?.toLowerCase().includes(searchText) ||
          property.type?.toLowerCase().includes(searchText)
        );
      });
    }

    if (propertyType !== "All Property Types") {
      result = result.filter((property) => {
        const type = property.type?.toLowerCase() || "";
        return type.includes(propertyType.toLowerCase());
      });
    }

    if (budget !== "Any Budget") {
      result = result.filter((property) => {
        const price = Number(property.price || 0);

        if (budget === "Under ₹50 Lakh") {
          return price > 0 && price < 5000000;
        }

        if (budget === "₹50 Lakh - ₹1 Cr") {
          return price >= 5000000 && price <= 10000000;
        }

        if (budget === "₹1 Cr - ₹2 Cr") {
          return price > 10000000 && price <= 20000000;
        }

        if (budget === "Above ₹2 Cr") {
          return price > 20000000;
        }

        return true;
      });
    }

    if (sortBy === "Low to High") {
      result.sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0)
      );
    }

    if (sortBy === "High to Low") {
      result.sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0)
      );
    }

    return result;
  }, [properties, search, propertyType, budget, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setPropertyType("All Property Types");
    setBudget("Any Budget");
    setSortBy("Newest");
  };

  const openProperty = (property) => {
    if (!property?.id) return;

    window.location.hash = `property/${property.id}`;
  };

  return (
    <main style={styles.page}>
      {/* HEADER */}
      <section style={styles.header}>
        <div style={styles.headerGlow}></div>

        <div style={styles.headerInner}>
          <div>
            <span style={styles.badge}>
              PROZPO • BUY PROPERTY
            </span>

            <h1 style={styles.title}>
              Find Your
              <span style={styles.titleHighlight}>
                {" "}
                Dream Property
              </span>
            </h1>

            <p style={styles.subtitle}>
              Explore properties for sale from owners, agents
              and builders across India.
            </p>
          </div>

          <div style={styles.headerStats}>
            <strong>{properties.length || 0}</strong>
            <span>Listed Properties</span>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <section style={styles.filterWrapper}>
        <div style={styles.filterBox}>
          <div style={styles.searchField}>
            <span style={styles.searchIcon}>⌕</span>

            <div style={styles.fieldInner}>
              <label>SEARCH LOCATION</label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="City, locality or property name"
              />
            </div>
          </div>

          <div style={styles.filterDivider}></div>

          <div style={styles.filterField}>
            <label>PROPERTY TYPE</label>

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option>All Property Types</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Independent House</option>
              <option>Plot</option>
              <option>Commercial</option>
              <option>Office</option>
              <option>Shop</option>
            </select>
          </div>

          <div style={styles.filterDivider}></div>

          <div style={styles.filterField}>
            <label>BUDGET</label>

            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              <option>Any Budget</option>
              <option>Under ₹50 Lakh</option>
              <option>₹50 Lakh - ₹1 Cr</option>
              <option>₹1 Cr - ₹2 Cr</option>
              <option>Above ₹2 Cr</option>
            </select>
          </div>

          <button
            onClick={() => {}}
            style={styles.searchButton}
          >
            Search
          </button>
        </div>
      </section>

      {/* RESULTS */}
      <section style={styles.content}>
        <div style={styles.resultHeader}>
          <div>
            <span style={styles.eyebrow}>PROPERTY LISTINGS</span>

            <h2 style={styles.resultTitle}>
              Properties For Sale
            </h2>

            <p style={styles.resultText}>
              {loading
                ? "Loading available properties..."
                : `${filteredProperties.length} properties matching your search`}
            </p>
          </div>

          <div style={styles.resultActions}>
            <button
              onClick={clearFilters}
              style={styles.clearButton}
            >
              Clear Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option>Newest</option>
              <option>Low to High</option>
              <option>High to Low</option>
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={styles.loadingGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} style={styles.skeletonCard}>
                <div style={styles.skeletonImage}></div>

                <div style={styles.skeletonLine}></div>
                <div
                  style={{
                    ...styles.skeletonLine,
                    width: "65%",
                  }}
                ></div>

                <div
                  style={{
                    ...styles.skeletonLine,
                    width: "45%",
                  }}
                ></div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredProperties.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⌂</div>

            <h3>No properties found</h3>

            <p>
              We couldn't find properties matching your current
              filters.
            </p>

            <button
              onClick={clearFilters}
              style={styles.emptyButton}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* PROPERTY GRID */}
        {!loading && filteredProperties.length > 0 && (
          <div style={styles.grid}>
            {filteredProperties.map((property) => (
              <article
                key={property.id || property.title}
                style={styles.card}
              >
                {/* IMAGE */}
                <div
                  style={{
                    ...styles.image,
                    ...(property.image
                      ? {
                          backgroundImage: `url(${property.image})`,
                        }
                      : {}),
                  }}
                >
                  {!property.image && (
                    <div style={styles.imagePlaceholder}>
                      <span>🏠</span>
                      <strong>PROZPO</strong>
                    </div>
                  )}

                  <div style={styles.imageOverlay}></div>

                  <span style={styles.verified}>
                    ✓ Verified
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    style={styles.favorite}
                    aria-label="Add to favorites"
                  >
                    ♡
                  </button>

                  <span style={styles.saleTag}>
                    FOR SALE
                  </span>
                </div>

                {/* CONTENT */}
                <div style={styles.cardContent}>
                  <div style={styles.typeRow}>
                    <span style={styles.type}>
                      {property.type}
                    </span>

                    <span style={styles.listed}>
                      Verified Listing
                    </span>
                  </div>

                  <h3 style={styles.cardTitle}>
                    {property.title}
                  </h3>

                  <p style={styles.location}>
                    <span>📍</span>
                    {property.location}
                  </p>

                  <div style={styles.details}>
                    {property.bedrooms > 0 && (
                      <span>
                        🛏 {property.bedrooms} BHK
                      </span>
                    )}

                    {property.bathrooms > 0 && (
                      <span>
                        🛁 {property.bathrooms} Bath
                      </span>
                    )}

                    {property.area > 0 && (
                      <span>
                        ▣ {property.area} Sq.Ft.
                      </span>
                    )}
                  </div>

                  <div style={styles.cardBottom}>
                    <div>
                      <span style={styles.priceLabel}>
                        PRICE
                      </span>

                      <strong style={styles.price}>
                        {formatPrice(property.price)}
                      </strong>
                    </div>

                    <button
                      onClick={() =>
                        openProperty(property)
                      }
                      style={styles.viewButton}
                    >
                      View Details
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* POST PROPERTY CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.cta}>
          <div>
            <span style={styles.ctaEyebrow}>
              SELL OR RENT YOUR PROPERTY
            </span>

            <h2>
              Have a property to sell?
            </h2>

            <p>
              List your property on PROZPO and reach
              genuine property seekers.
            </p>
          </div>

          <button
            onClick={() =>
              (window.location.hash =
                "post-property")
            }
            style={styles.ctaButton}
          >
            Post Your Property
            <span>→</span>
          </button>
        </div>
      </section>

      <style>{`
        .buy-property-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(20,45,80,.12);
          border-color: #d9e5f3;
        }

        .buy-property-button:hover {
          transform: translateY(-1px);
        }

        .buy-category-input:focus {
          border-color: #1769d2;
        }

        @media (max-width: 950px) {
          .buy-filter-box {
            grid-template-columns: 1fr 1fr !important;
          }

          .buy-filter-divider {
            display: none !important;
          }

          .buy-search-field {
            grid-column: 1 / -1 !important;
          }

          .buy-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 650px) {
          .buy-header {
            padding: 45px 18px !important;
          }

          .buy-header-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .buy-title {
            font-size: 42px !important;
          }

          .buy-filter-box {
            grid-template-columns: 1fr !important;
          }

          .buy-search-field {
            grid-column: auto !important;
          }

          .buy-grid {
            grid-template-columns: 1fr !important;
          }

          .buy-result-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .buy-result-actions {
            width: 100% !important;
          }

          .buy-sort {
            flex: 1 !important;
          }

          .buy-content {
            padding: 55px 16px !important;
          }

          .buy-cta {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 30px 24px !important;
          }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7f9fc",
    color: "#172033",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg,#07152f 0%,#0c2d5d 60%,#1769d2 100%)",
    padding: "70px 24px 105px",
  },

  headerGlow: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    right: "-160px",
    top: "-230px",
    background: "rgba(91,210,255,.13)",
    filter: "blur(20px)",
  },

  headerInner: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
  },

  badge: {
    display: "inline-block",
    padding: "8px 13px",
    borderRadius: "20px",
    background: "rgba(255,255,255,.1)",
    border: "1px solid rgba(255,255,255,.15)",
    color: "#cce7ff",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1.4px",
  },

  title: {
    margin: "20px 0 13px",
    color: "#ffffff",
    fontSize: "56px",
    lineHeight: 1.05,
    letterSpacing: "-2px",
  },

  titleHighlight: {
    color: "#5ed5b2",
  },

  subtitle: {
    margin: 0,
    maxWidth: "650px",
    color: "#c6d7eb",
    fontSize: "16px",
    lineHeight: 1.65,
  },

  headerStats: {
    minWidth: "160px",
    padding: "18px 22px",
    borderRadius: "17px",
    background: "rgba(255,255,255,.1)",
    border: "1px solid rgba(255,255,255,.14)",
    color: "#ffffff",
    textAlign: "center",
  },

  headerStatsStrong: {
    display: "block",
  },

  filterWrapper: {
    position: "relative",
    zIndex: 5,
    maxWidth: "1150px",
    margin: "-48px auto 0",
    padding: "0 20px",
  },

  filterBox: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1px 1fr 1px 1fr auto",
    alignItems: "center",
    gap: "15px",
    padding: "10px",
    background: "#ffffff",
    border: "1px solid #e5eaf0",
    borderRadius: "18px",
    boxShadow: "0 20px 55px rgba(12,35,65,.14)",
  },

  searchField: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "7px 10px",
  },

  searchIcon: {
    width: "39px",
    height: "39px",
    display: "grid",
    placeItems: "center",
    borderRadius: "11px",
    background: "#edf5ff",
    color: "#1769d2",
    fontSize: "23px",
  },

  fieldInner: {
    flex: 1,
    minWidth: 0,
  },

  fieldInnerLabel: {},

  filterField: {
    minWidth: 0,
    padding: "5px 8px",
  },

  filterFieldLabel: {},

  filterBoxLabel: {},

  filterDivider: {
    width: "1px",
    height: "42px",
    background: "#e5eaf0",
  },

  searchButton: {
    border: "none",
    borderRadius: "12px",
    minHeight: "52px",
    padding: "0 23px",
    background:
      "linear-gradient(135deg,#1769d2,#0c55b5)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 850,
    cursor: "pointer",
  },

  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "75px 24px 80px",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "30px",
  },

  eyebrow: {
    display: "block",
    color: "#1769d2",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1.5px",
    marginBottom: "7px",
  },

  resultTitle: {
    margin: 0,
    fontSize: "32px",
    letterSpacing: "-.8px",
  },

  resultText: {
    margin: "7px 0 0",
    color: "#778294",
    fontSize: "13px",
  },

  resultActions: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  clearButton: {
    border: "1px solid #dfe5ec",
    background: "#ffffff",
    color: "#667285",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  sortSelect: {
    border: "1px solid #dfe5ec",
    background: "#ffffff",
    color: "#334056",
    borderRadius: "10px",
    padding: "11px 13px",
    fontSize: "12px",
    fontWeight: 700,
    outline: "none",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: "18px",
    overflow: "hidden",
    transition: "all .25s ease",
    boxShadow: "0 7px 25px rgba(17,35,55,.045)",
  },

  image: {
    position: "relative",
    height: "225px",
    backgroundColor: "#dceaf7",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflow: "hidden",
  },

  imageOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top,rgba(5,20,40,.55),transparent 55%)",
  },

  imagePlaceholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#d9eafa,#eef6fc)",
    color: "#1769d2",
    gap: "8px",
  },

  verified: {
    position: "absolute",
    top: "13px",
    left: "13px",
    zIndex: 2,
    padding: "7px 10px",
    borderRadius: "20px",
    background: "#ffffff",
    color: "#0a9669",
    fontSize: "10px",
    fontWeight: 850,
    boxShadow: "0 5px 15px rgba(0,0,0,.1)",
  },

  favorite: {
    position: "absolute",
    top: "12px",
    right: "12px",
    zIndex: 2,
    width: "37px",
    height: "37px",
    borderRadius: "50%",
    border: "none",
    background: "#ffffff",
    color: "#445269",
    fontSize: "20px",
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(0,0,0,.1)",
  },

  saleTag: {
    position: "absolute",
    left: "13px",
    bottom: "13px",
    zIndex: 2,
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1px",
  },

  cardContent: {
    padding: "18px",
  },

  typeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  type: {
    color: "#1769d2",
    fontSize: "10px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".7px",
  },

  listed: {
    color: "#0b9b6c",
    fontSize: "9px",
    fontWeight: 800,
  },

  cardTitle: {
    margin: "9px 0 7px",
    fontSize: "18px",
    color: "#172033",
    lineHeight: 1.3,
  },

  location: {
    margin: 0,
    color: "#727e90",
    fontSize: "12px",
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },

  details: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid #edf0f4",
  },

  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "12px",
    marginTop: "17px",
  },

  priceLabel: {
    display: "block",
    color: "#8b95a4",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: ".7px",
    marginBottom: "3px",
  },

  price: {
    color: "#172033",
    fontSize: "19px",
  },

  viewButton: {
    border: "none",
    borderRadius: "9px",
    padding: "10px 12px",
    background: "#edf5ff",
    color: "#1769d2",
    fontSize: "11px",
    fontWeight: 850,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  loadingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "22px",
  },

  skeletonCard: {
    height: "390px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    padding: "15px",
  },

  skeletonImage: {
    height: "220px",
    borderRadius: "13px",
    background:
      "linear-gradient(90deg,#eef1f5,#f7f8fa,#eef1f5)",
  },

  skeletonLine: {
    height: "13px",
    width: "80%",
    marginTop: "18px",
    borderRadius: "8px",
    background: "#eef1f5",
  },

  emptyState: {
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: "20px",
    padding: "65px 20px",
  },

  emptyIcon: {
    width: "65px",
    height: "65px",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 18px",
    borderRadius: "20px",
    background: "#edf5ff",
    color: "#1769d2",
    fontSize: "28px",
  },

  emptyStateH3: {},

  emptyButton: {
    border: "none",
    background: "#1769d2",
    color: "#ffffff",
    padding: "11px 18px",
    borderRadius: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  ctaSection: {
    padding: "0 24px 80px",
  },

  cta: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "38px 42px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg,#092650,#1769d2)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
    boxShadow: "0 25px 60px rgba(23,105,210,.18)",
  },

  ctaEyebrow: {
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1.4px",
    color: "#b9ddff",
  },

  ctaH2: {},

  ctaP: {},

  ctaButton: {
    border: "none",
    borderRadius: "11px",
    padding: "14px 20px",
    background: "#ffffff",
    color: "#1769d2",
    fontWeight: 850,
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};

export default Buy;
