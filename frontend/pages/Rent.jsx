import React, { useEffect, useMemo, useState } from "react";
import { getProperties } from "../src/api";

function Rent() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("All Property Types");
  const [budget, setBudget] = useState("Any Rent");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    let mounted = true;

    async function loadProperties() {
      try {
        const data = await getProperties();

        if (!mounted) return;

        const list = Array.isArray(data) ? data : [];

        const rentalProperties = list.filter((p) => {
          const listingType = String(
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
            listingType.includes("rent") ||
            listingType.includes("lease") ||
            Number(rent) > 0 ||
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

            title:
              p.title ||
              "Premium Rental Property",

            location:
              p.location ||
              [p.city, p.state]
                .filter(Boolean)
                .join(", ") ||
              "Location not available",

            city: p.city || "",

            state: p.state || "",

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

            bedrooms: Number(p.bedrooms || 0),

            bathrooms: Number(p.bathrooms || 0),

            area: Number(p.area || 0),

            areaUnit:
              p.area_unit ||
              "Sq.Ft.",

            furnishing:
              p.furnishing ||
              "",

            possession:
              p.possession ||
              "",

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
      } catch (error) {
        console.error(
          "Rental properties error:",
          error
        );

        if (mounted) {
          setProperties([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      mounted = false;
    };
  }, []);

  const formatRent = (rent) => {
    if (!rent || Number(rent) <= 0) {
      return "Rent on Request";
    }

    return `₹${Number(rent).toLocaleString(
      "en-IN"
    )} / Month`;
  };

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((property) => {
        const searchableText = [
          property.title,
          property.location,
          property.city,
          property.state,
          property.type,
          property.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    if (propertyType !== "All Property Types") {
      result = result.filter((property) =>
        String(property.type || "")
          .toLowerCase()
          .includes(
            propertyType.toLowerCase()
          )
      );
    }

    if (budget !== "Any Rent") {
      result = result.filter((property) => {
        const rent = Number(
          property.rent || 0
        );

        if (budget === "Under ₹15,000") {
          return rent > 0 && rent < 15000;
        }

        if (
          budget ===
          "₹15,000 - ₹25,000"
        ) {
          return (
            rent >= 15000 &&
            rent <= 25000
          );
        }

        if (
          budget ===
          "₹25,000 - ₹50,000"
        ) {
          return (
            rent > 25000 &&
            rent <= 50000
          );
        }

        if (
          budget === "Above ₹50,000"
        ) {
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
    setPropertyType(
      "All Property Types"
    );
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

    window.location.hash =
      "my-enquiries";
  };

  const listProperty = () => {
    window.location.hash =
      "post-property";
  };

  return (
    <main style={styles.page}>

      {/* ================= HERO ================= */}

      <section
        style={styles.hero}
        className="prozpo-rent-hero"
      >
        <div style={styles.heroGlowOne}></div>
        <div style={styles.heroGlowTwo}></div>

        <div
          style={styles.heroInner}
          className="prozpo-rent-hero-inner"
        >
          <div style={styles.heroContent}>

            <div style={styles.badge}>
              <span style={styles.badgeDot}></span>
              PROZPO • RENT PROPERTY
            </div>

            <h1
              style={styles.title}
              className="prozpo-rent-title"
            >
              Find Your
              <span style={styles.highlight}>
                {" "}Perfect Rental
              </span>
            </h1>

            <p style={styles.subtitle}>
              Discover apartments, houses,
              villas, offices and commercial
              spaces available for rent across
              major Indian cities.
            </p>

            <div style={styles.heroButtons}>
              <button
                onClick={() =>
                  document
                    .getElementById(
                      "rent-properties"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                style={styles.primaryHeroButton}
              >
                Explore Rentals
                <span>→</span>
              </button>

              <button
                onClick={listProperty}
                style={styles.secondaryHeroButton}
              >
                List Your Property
              </button>
            </div>
          </div>

          <div style={styles.heroCard}>

            <div style={styles.heroCardTop}>
              <span>AVAILABLE NOW</span>
              <span style={styles.liveDot}>
                ● LIVE
              </span>
            </div>

            <div style={styles.heroHouse}>
              <div style={styles.houseRoof}></div>

              <div style={styles.houseBody}>
                <div style={styles.houseWindow}></div>
                <div style={styles.houseWindow}></div>
                <div style={styles.houseDoor}></div>
              </div>

              <div style={styles.houseGround}></div>
            </div>

            <div style={styles.heroCardInfo}>
              <strong>
                Rental Homes
              </strong>

              <span>
                Verified properties on PROZPO
              </span>
            </div>

            <div style={styles.heroStatRow}>
              <div>
                <strong>
                  {properties.length}
                </strong>
                <span>Listings</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Easy Enquiry</span>
              </div>

              <div>
                <strong>24×7</strong>
                <span>Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FILTER ================= */}

      <section
        style={styles.filterWrapper}
        id="rent-properties"
      >
        <div
          style={styles.filterBox}
          className="prozpo-rent-filter"
        >

          <div
            style={styles.searchField}
            className="prozpo-rent-search"
          >
            <span style={styles.searchIcon}>
              ⌕
            </span>

            <div style={styles.fieldContent}>
              <label>
                SEARCH LOCATION
              </label>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="City, locality or area"
              />
            </div>
          </div>

          <div
            style={styles.divider}
            className="prozpo-rent-divider"
          ></div>

          <div style={styles.filterField}>
            <label>
              PROPERTY TYPE
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
                All Property Types
              </option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>
                Independent House
              </option>
              <option>Studio</option>
              <option>Commercial</option>
              <option>Office</option>
              <option>Shop</option>
            </select>
          </div>

          <div
            style={styles.divider}
            className="prozpo-rent-divider"
          ></div>

          <div style={styles.filterField}>
            <label>
              MONTHLY RENT
            </label>

            <select
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value)
              }
            >
              <option>
                Any Rent
              </option>
              <option>
                Under ₹15,000
              </option>
              <option>
                ₹15,000 - ₹25,000
              </option>
              <option>
                ₹25,000 - ₹50,000
              </option>
              <option>
                Above ₹50,000
              </option>
            </select>
          </div>

          <button
            onClick={() =>
              document
                .getElementById(
                  "rent-results"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
            style={styles.searchButton}
          >
            Search
            <span>→</span>
          </button>
        </div>
      </section>

      {/* ================= CONTENT ================= */}

      <section
        style={styles.content}
        id="rent-results"
      >

        <div
          style={styles.resultHeader}
          className="prozpo-rent-result"
        >
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
                : `${filteredProperties.length} rental ${
                    filteredProperties.length === 1
                      ? "property"
                      : "properties"
                  } found`}
            </p>
          </div>

          <div
            style={styles.actions}
            className="prozpo-rent-actions"
          >
            <button
              onClick={clearFilters}
              style={styles.clearButton}
            >
              ↺ Clear Filters
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

        {/* ================= LOADING ================= */}

        {loading && (
          <div
            style={styles.grid}
            className="prozpo-rent-grid"
          >
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
                      width: "68%",
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

        {/* ================= EMPTY ================= */}

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
                property type or monthly
                rent range.
              </p>

              <div style={styles.emptyButtons}>
                <button
                  onClick={clearFilters}
                  style={styles.emptyButton}
                >
                  Clear Filters
                </button>

                <button
                  onClick={listProperty}
                  style={styles.emptySecondary}
                >
                  List a Property
                </button>
              </div>
            </div>
          )}

        {/* ================= PROPERTY GRID ================= */}

        {!loading &&
          filteredProperties.length > 0 && (
            <div
              style={styles.grid}
              className="prozpo-rent-grid"
            >
              {filteredProperties.map(
                (property, index) => (
                  <article
                    key={
                      property.id ||
                      `${property.title}-${index}`
                    }
                    style={styles.card}
                    className="prozpo-rent-card"
                  >

                    {/* IMAGE */}

                    <div
                      style={{
                        ...styles.image,
                        ...(property.image
                          ? {
                              backgroundImage:
                                `url("${property.image}")`,
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
                          <div
                            style={
                              styles.placeholderBuilding
                            }
                          >
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                          </div>

                          <strong>
                            PROZPO
                          </strong>

                          <span>
                            Rental Property
                          </span>
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

                      <span
                        style={
                          styles.rentTag
                        }
                      >
                        FOR RENT
                      </span>

                      <button
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                        style={
                          styles.favorite
                        }
                        aria-label="Add to favorites"
                      >
                        ♡
                      </button>
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
                          ✓ Verified
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
                        {property.bedrooms >
                          0 && (
                          <span>
                            ?
