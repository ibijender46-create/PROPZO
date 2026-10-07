import React, { useEffect, useMemo, useState } from "react";
import { getProperties } from "../src/api";

function Rent() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState(
    "All Property Types"
  );
  const [budget, setBudget] = useState("Any Rent");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    let mounted = true;

    getProperties()
      .then((data) => {
        if (!mounted) return;

        const list = Array.isArray(data) ? data : [];

        /*
         * We keep all properties from the API and identify rental
         * listings using common rental fields.
         */
        const rentalProperties = list.filter((p) => {
          const purpose = String(
            p.listing_type ||
              p.property_for ||
              p.purpose ||
              p.transaction_type ||
              ""
          ).toLowerCase();

          const title = String(p.title || "").toLowerCase();
          const description = String(
            p.description || ""
          ).toLowerCase();

          const rent =
            p.rent ||
            p.monthly_rent ||
            p.rent_price;

          return (
            purpose.includes("rent") ||
            purpose.includes("lease") ||
            rent ||
            title.includes("rent") ||
            description.includes("rent")
          );
        });

        const finalList =
          rentalProperties.length > 0
            ? rentalProperties
            : list;

        setProperties(
          finalList.map((p) => ({
            ...p,
            id: p.id,
            title: p.title || "Premium Rental Property",
            location:
              p.location || "Location not available",
            rent: Number(
              p.rent ||
                p.monthly_rent ||
                p.rent_price ||
                p.price ||
                0
            ),
            type:
              p.property_type ||
              p.type ||
              "Apartment",
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            area: p.area || 0,
            description:
              p.description ||
              "Premium rental property available on PROZPO.",
            image:
              p.image_url ||
              p.image ||
              p.thumbnail ||
              "",
          }))
        );
      })
      .catch((error) => {
        console.error("Rental properties error:", error);
        if (mounted) setProperties([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatRent = (rent) => {
    if (!rent) return "Rent on Request";

    return `₹${Number(rent).toLocaleString(
      "en-IN"
    )} / Month`;
  };

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((property) => {
        return (
          property.title?.toLowerCase().includes(query) ||
          property.location?.toLowerCase().includes(query) ||
          property.type?.toLowerCase().includes(query)
        );
      });
    }

    if (propertyType !== "All Property Types") {
      result = result.filter((property) =>
        String(property.type || "")
          .toLowerCase()
          .includes(propertyType.toLowerCase())
      );
    }

    if (budget !== "Any Rent") {
      result = result.filter((property) => {
        const rent = Number(property.rent || 0);

        if (budget === "Under ₹15,000") {
          return rent > 0 && rent < 15000;
        }

        if (budget === "₹15,000 - ₹25,000") {
          return rent >= 15000 && rent <= 25000;
        }

        if (budget === "₹25,000 - ₹50,000") {
          return rent > 25000 && rent <= 50000;
        }

        if (budget === "Above ₹50,000") {
          return rent > 50000;
        }

        return true;
      });
    }

    if (sortBy === "Low to High") {
      result.sort(
        (a, b) =>
          Number(a.rent || 0) -
          Number(b.rent || 0)
      );
    }

    if (sortBy === "High to Low") {
      result.sort(
        (a, b) =>
          Number(b.rent || 0) -
          Number(a.rent || 0)
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
    setPropertyType("All Property Types");
    setBudget("Any Rent");
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
      return;
    }

    window.location.hash = "post-property";
  };

  return (
    <main style={styles.page}>

      {/* HERO HEADER */}
      <section style={styles.hero}>
        <div style={styles.heroGlow}></div>

        <div style={styles.heroInner}>
          <div>
            <span style={styles.badge}>
              PROZPO • RENT PROPERTY
            </span>

            <h1 style={styles.title}>
              Find Your
              <span style={styles.highlight}>
                {" "}Perfect Rental
              </span>
            </h1>

            <p style={styles.subtitle}>
              Discover apartments, houses, villas and
              commercial spaces available for rent
              across major Indian cities.
            </p>
          </div>

          <div style={styles.heroStat}>
            <strong>{properties.length}</strong>
            <span>Rental Listings</span>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section style={styles.filterWrapper}>
        <div style={styles.filterBox}>

          <div style={styles.searchField}>
            <span style={styles.searchIcon}>⌕</span>

            <div style={styles.fieldContent}>
              <label>SEARCH LOCATION</label>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="City, locality or area"
              />
            </div>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.filterField}>
            <label>PROPERTY TYPE</label>

            <select
              value={propertyType}
              onChange={(e) =>
                setPropertyType(e.target.value)
              }
            >
              <option>
                All Property Types
              </option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Independent House</option>
              <option>Studio</option>
              <option>Commercial</option>
              <option>Office</option>
              <option>Shop</option>
            </select>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.filterField}>
            <label>MONTHLY RENT</label>

            <select
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value)
              }
            >
              <option>Any Rent</option>
              <option>Under ₹15,000</option>
              <option>
                ₹15,000 - ₹25,000
              </option>
              <option>
                ₹25,000 - ₹50,000
              </option>
              <option>Above ₹50,000</option>
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

      {/* CONTENT */}
      <section style={styles.content}>

        <div style={styles.resultHeader}>
          <div>
            <span style={styles.eyebrow}>
              RENTAL LISTINGS
            </span>

            <h2 style={styles.resultTitle}>
              Properties For Rent
            </h2>

            <p style={styles.resultText}>
              {loading
                ? "Loading rental properties..."
                : `${filteredProperties.length} rental properties found`}
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
              <option>Low to High</option>
              <option>High to Low</option>
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
          filteredProperties.length === 0 && (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                🔑
              </div>

              <h3>
                No rental properties found
              </h3>

              <p>
                Try changing your location,
                property type or rent range.
              </p>

              <button
                onClick={clearFilters}
                style={styles.emptyButton}
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
                          <span>🏠</span>
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
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        style={
                          styles.favorite
                        }
                      >
                        ♡
                      </button>

                      <span
                        style={styles.rentTag}
                      >
                        FOR RENT
                      </span>
                    </div>

                    {/* DETAILS */}
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
                        📍 {property.location}
                      </p>

                      <div
                        style={
                          styles.details
                        }
                      >
                        {property.bedrooms >
                          0 && (
                          <span>
                            🛏{" "}
                            {
                              property.bedrooms
                            }{" "}
                            BHK
                          </span>
                        )}

                        {property.bathrooms >
                          0 && (
                          <span>
                            🛁{" "}
                            {
                              property.bathrooms
                            }{" "}
                            Bath
                          </span>
                        )}

                        {property.area >
                          0 && (
                          <span>
                            ▣{" "}
                            {property.area}{" "}
                            Sq.Ft.
                          </span>
                        )}
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
                            MONTHLY RENT
                          </span>

                          <strong
                            style={
                              styles.price
                            }
                          >
                            {formatRent(
                              property.rent
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
              style={styles.ctaEyebrow}
            >
              OWN A RENTAL PROPERTY?
            </span>

            <h2>
              Find Your Next Tenant
            </h2>

            <p>
              List your property on PROZPO
              and connect with genuine
              renters.
            </p>
          </div>

          <button
            onClick={() =>
              (window.location.hash =
                "post-property")
            }
            style={styles.ctaButton}
          >
            List Your Property
            <span>→</span>
          </button>

        </div>
      </section>

      <style>{`
        .prozpo-rent-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(20,45,80,.12);
        }

        @media (max-width: 950px) {
          .prozpo-rent-filter {
            grid-template-columns: 1fr 1fr !important;
          }

          .prozpo-rent-divider {
            display: none !important;
          }

          .prozpo-rent-search {
            grid-column: 1 / -1 !important;
          }

          .prozpo-rent-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }

        @media (max-width: 650px) {
          .prozpo-rent-hero {
            padding: 45px 18px 90px !important;
          }

          .prozpo-rent-hero-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .prozpo-rent-title {
            font-size: 42px !important;
          }

          .prozpo-rent-filter {
            grid-template-columns: 1fr !important;
          }

          .prozpo-rent-search {
            grid-column: auto !important;
          }

          .prozpo-rent-grid {
            grid-template-columns: 1fr !important;
          }

          .prozpo-rent-result {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .prozpo-rent-actions {
            width: 100% !important;
          }

          .prozpo-rent-cta {
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
    width: "430px",
    height: "430px",
    right: "-150px",
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
    fontSize: "56px",
    lineHeight: 1.05,
    letterSpacing: "-2px",
  },

  highlight: {
    color: "#5ed5b2",
  },

  subtitle: {
    margin: 0,
    maxWidth: "670px",
    color: "#c6d7eb",
    fontSize: "16px",
    lineHeight: 1.65,
  },

  heroStat: {
    minWidth: "170px",
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

  rentTag: {
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
    fontSize: "17px",
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

export default Rent;
