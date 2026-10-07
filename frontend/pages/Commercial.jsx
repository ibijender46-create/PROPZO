import React, { useEffect, useMemo, useState } from "react";
import { getProperties } from "../src/api";

function Commercial() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState(
    "All Commercial Types"
  );
  const [budget, setBudget] = useState("Any Budget");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    let mounted = true;

    getProperties()
      .then((data) => {
        if (!mounted) return;

        const list = Array.isArray(data) ? data : [];

        const commercialProperties = list.filter((p) => {
          const type = String(
            p.property_type || p.type || ""
          ).toLowerCase();

          const title = String(
            p.title || ""
          ).toLowerCase();

          const description = String(
            p.description || ""
          ).toLowerCase();

          return (
            type.includes("commercial") ||
            type.includes("shop") ||
            type.includes("office") ||
            type.includes("showroom") ||
            type.includes("warehouse") ||
            type.includes("retail") ||
            title.includes("commercial") ||
            title.includes("office") ||
            title.includes("shop") ||
            description.includes("commercial")
          );
        });

        const finalList =
          commercialProperties.length > 0
            ? commercialProperties
            : list.filter((p) => {
                const type = String(
                  p.property_type || p.type || ""
                ).toLowerCase();

                return (
                  type.includes("commercial") ||
                  type.includes("shop") ||
                  type.includes("office") ||
                  type.includes("showroom")
                );
              });

        setProperties(
          finalList.map((p) => ({
            ...p,
            id: p.id,
            title:
              p.title ||
              "Premium Commercial Property",
            location:
              p.location ||
              "Location not available",
            price: Number(p.price || 0),
            type:
              p.property_type ||
              p.type ||
              "Commercial",
            area: p.area || p.size || 0,
            description:
              p.description ||
              "Premium commercial property available on PROZPO.",
            image:
              p.image_url ||
              p.image ||
              p.thumbnail ||
              "",
          }))
        );
      })
      .catch((error) => {
        console.error(
          "Commercial properties error:",
          error
        );

        if (mounted) {
          setProperties([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatPrice = (price) => {
    if (!price) {
      return "Price on Request";
    }

    if (price >= 10000000) {
      return `₹${(
        price / 10000000
      ).toFixed(2)} Cr`;
    }

    if (price >= 100000) {
      return `₹${(
        price / 100000
      ).toFixed(2)} Lakh`;
    }

    return `₹${Number(
      price
    ).toLocaleString("en-IN")}`;
  };

  const formatArea = (area) => {
    if (!area) {
      return "Area on Request";
    }

    if (
      typeof area === "string" &&
      area.toLowerCase().includes("sq")
    ) {
      return area;
    }

    return `${Number(area).toLocaleString(
      "en-IN"
    )} Sq.Ft.`;
  };

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    const query = search
      .trim()
      .toLowerCase();

    if (query) {
      result = result.filter((property) => {
        return (
          property.title
            ?.toLowerCase()
            .includes(query) ||
          property.location
            ?.toLowerCase()
            .includes(query) ||
          property.type
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    if (
      propertyType !==
      "All Commercial Types"
    ) {
      result = result.filter((property) => {
        const type = String(
          property.type || ""
        ).toLowerCase();

        return type.includes(
          propertyType.toLowerCase()
        );
      });
    }

    if (budget !== "Any Budget") {
      result = result.filter((property) => {
        const price = Number(
          property.price || 0
        );

        if (budget === "Under ₹50 Lakh") {
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
          budget === "Above ₹2 Cr"
        ) {
          return price > 20000000;
        }

        return true;
      });
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

    return result;
  }, [
    properties,
    search,
    propertyType,
    budget,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setPropertyType(
      "All Commercial Types"
    );
    setBudget("Any Budget");
    setSortBy("Newest");
  };

  const openProperty = (property) => {
    if (!property?.id) return;

    window.location.hash =
      `property/${property.id}`;
  };

  const enquireProperty = (property) => {
    if (property?.id) {
      window.location.hash =
        `property/${property.id}?enquiry=1`;
    } else {
      window.location.hash =
        "post-property";
    }
  };

  return (
    <main style={styles.page}>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroGlow}></div>

        <div style={styles.heroInner}>
          <div>
            <span style={styles.badge}>
              PROZPO • COMMERCIAL PROPERTY
            </span>

            <h1 style={styles.title}>
              Find Your
              <span style={styles.highlight}>
                {" "}Perfect Commercial Space
              </span>
            </h1>

            <p style={styles.subtitle}>
              Discover shops, offices, showrooms,
              warehouses and premium commercial
              properties at prime locations.
            </p>
          </div>

          <div style={styles.heroStat}>
            <strong>
              {properties.length}
            </strong>
            <span>
              Commercial Listings
            </span>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section style={styles.filterWrapper}>
        <div style={styles.filterBox}>

          <div style={styles.searchField}>
            <span style={styles.searchIcon}>
              ⌕
            </span>

            <div style={styles.fieldContent}>
              <label>
                SEARCH LOCATION
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="City, locality or commercial area"
              />
            </div>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.filterField}>
            <label>
              COMMERCIAL TYPE
            </label>

            <select
              value={propertyType}
              onChange={(e) =>
                setPropertyType(
                  e.target.value
                )
              }
            >
              <option>
                All Commercial Types
              </option>
              <option>Shop</option>
              <option>Office</option>
              <option>Showroom</option>
              <option>Warehouse</option>
              <option>Retail</option>
              <option>Commercial Building</option>
            </select>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.filterField}>
            <label>
              BUDGET
            </label>

            <select
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value)
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
            <span style={styles.eyebrow}>
              COMMERCIAL LISTINGS
            </span>

            <h2 style={styles.resultTitle}>
              Commercial Properties
            </h2>

            <p style={styles.resultText}>
              {loading
                ? "Loading commercial properties..."
                : `${filteredProperties.length} commercial properties found`}
            </p>
          </div>

          <div style={styles.actions}>
            <button
              onClick={clearFilters}
              style={styles.clearButton}
            >
              Clear Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              style={styles.sort}
            >
              <option>Newest</option>
              <option>
                Low to High
              </option>
              <option>
                High to Low
              </option>
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  style={styles.skeleton}
                >
                  <div
                    style={
                      styles.skeletonImage
                    }
                  ></div>

                  <div
                    style={
                      styles.skeletonLine
                    }
                  ></div>

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
              )
            )}
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          filteredProperties.length ===
            0 && (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                🏢
              </div>

              <h3>
                No commercial properties found
              </h3>

              <p>
                Try changing your location,
                property type or budget.
              </p>

              <button
                onClick={clearFilters}
                style={
                  styles.emptyButton
                }
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* PROPERTY GRID */}
        {!loading &&
          filteredProperties.length > 0 && (
            <div style={styles.grid}>

              {filteredProperties.map(
                (property) => (
                  <article
                    key={
                      property.id ||
                      property.title
                    }
                    style={styles.card}
                  >

                    {/* IMAGE */}
                    <div
                      style={{
                        ...styles.image,
                        ...(property.image
                          ? {
                              backgroundImage:
                                `url(${property.image})`,
                            }
                          : {}),
                      }}
                    >

                      {!property.image && (
                        <div
                          style={
                            styles.placeholder
                          }
                        >
                          <span>🏢</span>
                          <strong>
                            PROZPO
                          </strong>
                        </div>
                      )}

                      <div
                        style={
                          styles.imageOverlay
                        }
                      ></div>

                      <span
                        style={
                          styles.verified
                        }
                      >
                        ✓ Verified
                      </span>

                      <button
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                        style={
                          styles.favorite
                        }
                      >
                        ♡
                      </button>

                      <span
                        style={styles.saleTag}
                      >
                        COMMERCIAL
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div
                      style={
                        styles.cardContent
                      }
                    >

                      <div
                        style={
                          styles.typeRow
                        }
                      >
                        <span
                          style={styles.type}
                        >
                          {property.type}
                        </span>

                        <span
                          style={
                            styles.verifiedText
                          }
                        >
                          Verified Listing
                        </span>
                      </div>

                      <h3
                        style={
                          styles.cardTitle
                        }
                      >
                        {property.title}
                      </h3>

                      <p
                        style={
                          styles.location
                        }
                      >
                        📍{" "}
                        {property.location}
                      </p>

                      <div
                        style={
                          styles.details
                        }
                      >
                        <span>
                          📐{" "}
                          {formatArea(
                            property.area
                          )}
                        </span>

                        <span>
                          🏢 Commercial
                        </span>
                      </div>

                      <div
                        style={
                          styles.bottom
                        }
                      >
                        <div>
                          <span
                            style={
                              styles.priceLabel
                            }
                          >
                            PROPERTY PRICE
                          </span>

                          <strong
                            style={
                              styles.price
                            }
                          >
                            {formatPrice(
                              property.price
                            )}
                          </strong>
                        </div>

                        <button
                          onClick={() =>
                            enquireProperty(
                              property
                            )
                          }
                          style={
                            styles.enquire
                          }
                        >
                          Enquire
                          <span>→</span>
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          openProperty(
                            property
                          )
                        }
                        style={
                          styles.detailsButton
                        }
                      >
                        View Full Property Details
                      </button>

                    </div>
                  </article>
                )
              )}

            </div>
          )}
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.cta}>

          <div>
            <span
              style={
                styles.ctaEyebrow
              }
            >
              FOR COMMERCIAL OWNERS
            </span>

            <h2>
              Have a Commercial Property?
            </h2>

            <p>
              List your shop, office,
              showroom or commercial
              property on PROZPO.
            </p>
          </div>

          <button
            onClick={() =>
              (window.location.hash =
                "post-property")
            }
            style={styles.ctaButton}
          >
            List Commercial Property
            <span>→</span>
          </button>

        </div>
      </section>

      <style>{`
        @media (max-width: 950px) {
          .prozpo-commercial-filter {
            grid-template-columns: 1fr 1fr !important;
          }

          .prozpo-commercial-divider {
            display: none !important;
          }

          .prozpo-commercial-search {
            grid-column: 1 / -1 !important;
          }

          .prozpo-commercial-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }

        @media (max-width: 650px) {
          .prozpo-commercial-hero {
            padding: 45px 18px 90px !important;
          }

          .prozpo-commercial-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .prozpo-commercial-title {
            font-size: 40px !important;
          }

          .prozpo-commercial-filter {
            grid-template-columns: 1fr !important;
          }

          .prozpo-commercial-search {
            grid-column: auto !important;
          }

          .prozpo-commercial-grid {
            grid-template-columns: 1fr !important;
          }

          .prozpo-commercial-result {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .prozpo-commercial-actions {
            width: 100% !important;
          }

          .prozpo-commercial-cta {
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

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg,#07152f 0%,#0c2d5d 60%,#1769d2 100%)",
    padding: "70px 24px 105px",
  },

  heroGlow: {
    position: "absolute",
    width: "440px",
    height: "440px",
    right: "-160px",
    top: "-220px",
    borderRadius: "50%",
    background:
      "rgba(70,210,255,.14)",
    filter: "blur(25px)",
  },

  heroInner: {
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
    background:
      "rgba(255,255,255,.1)",
    border:
      "1px solid rgba(255,255,255,.15)",
    color: "#cce7ff",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1.4px",
  },

  title: {
    margin: "20px 0 13px",
    color: "#ffffff",
    fontSize: "55px",
    lineHeight: 1.05,
    letterSpacing: "-2px",
  },

  highlight: {
    color: "#5ed5b2",
  },

  subtitle: {
    margin: 0,
    maxWidth: "700px",
    color: "#c6d7eb",
    fontSize: "16px",
    lineHeight: 1.65,
  },

  heroStat: {
    minWidth: "180px",
    padding: "18px 22px",
    borderRadius: "17px",
    background:
      "rgba(255,255,255,.1)",
    border:
      "1px solid rgba(255,255,255,.14)",
    color: "#ffffff",
    textAlign: "center",
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
    gridTemplateColumns:
      "1.5fr 1px 1fr 1px 1fr auto",
    alignItems: "center",
    gap: "15px",
    padding: "10px",
    background: "#ffffff",
    border:
      "1px solid #e5eaf0",
    borderRadius: "18px",
    boxShadow:
      "0 20px 55px rgba(12,35,65,.14)",
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

  fieldContent: {
    flex: 1,
    minWidth: 0,
  },

  divider: {
    width: "1px",
    height: "42px",
    background: "#e5eaf0",
  },

  filterField: {
    minWidth: 0,
    padding: "5px 8px",
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

  actions: {
    display: "flex",
    gap: "9px",
    alignItems: "center",
  },

  clearButton: {
    border:
      "1px solid #dfe5ec",
    background: "#ffffff",
    color: "#667285",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  sort: {
    border:
      "1px solid #dfe5ec",
    background: "#ffffff",
    color: "#334056",
    borderRadius: "10px",
    padding: "11px 13px",
    fontSize: "12px",
    fontWeight: 700,
    outline: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3,1fr)",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    border:
      "1px solid #e7ebf0",
    borderRadius: "18px",
    overflow: "hidden",
    transition: "all .25s ease",
    boxShadow:
      "0 7px 25px rgba(17,35,55,.045)",
  },

  image: {
    position: "relative",
    height: "225px",
    backgroundColor: "#dceaf7",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflow: "hidden",
  },

  placeholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background:
      "linear-gradient(135deg,#d9eafa,#eef6fc)",
    color: "#1769d2",
    fontSize: "16px",
  },

  imageOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top,rgba(5,20,40,.55),transparent 55%)",
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
    gap: "8px",
  },

  type: {
    color: "#1769d2",
    fontSize: "10px",
    fontWeight: 900,
    textTransform: "uppercase",
  },

  verifiedText: {
    color: "#0b9b6c",
    fontSize: "9px",
    fontWeight: 800,
  },

  cardTitle: {
    margin: "9px 0 7px",
    fontSize: "18px",
    lineHeight: 1.3,
  },

  location: {
    margin: 0,
    color: "#727e90",
    fontSize: "12px",
  },

  details: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "16px",
    paddingTop: "14px",
    borderTop:
      "1px solid #edf0f4",
  },

  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "10px",
    marginTop: "17px",
  },

  priceLabel: {
    display: "block",
    color: "#8b95a4",
    fontSize: "9px",
    fontWeight: 800,
    marginBottom: "3px",
  },

  price: {
    color: "#172033",
    fontSize: "19px",
  },

  enquire: {
    border: "none",
    borderRadius: "9px",
    padding: "10px 12px",
    background: "#edf5ff",
    color: "#1769d2",
    fontSize: "11px",
    fontWeight: 850,
    cursor: "pointer",
  },

  detailsButton: {
    width: "100%",
    marginTop: "12px",
    padding: "10px",
    borderRadius: "9px",
    border:
      "1px solid #dfe7ef",
    background: "#ffffff",
    color: "#334056",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },

  skeleton: {
    height: "390px",
    padding: "15px",
    borderRadius: "18px",
    background: "#ffffff",
    border:
      "1px solid #e7ebf0",
  },

  skeletonImage: {
    height: "220px",
    borderRadius: "13px",
    background: "#eef1f5",
  },

  skeletonLine: {
    width: "80%",
    height: "13px",
    marginTop: "18px",
    borderRadius: "8px",
    background: "#eef1f5",
  },

  empty: {
    textAlign: "center",
    background: "#ffffff",
    border:
      "1px solid #e7ebf0",
    borderRadius: "20px",
    padding: "65px 20px",
  },

  emptyIcon: {
    width: "65px",
    height: "65px",
    margin: "0 auto 18px",
    display: "grid",
    placeItems: "center",
    borderRadius: "20px",
    background: "#edf5ff",
    fontSize: "27px",
  },

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
  },

  ctaEyebrow: {
    color: "#b9ddff",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1.4px",
  },

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

export default Commercial;
