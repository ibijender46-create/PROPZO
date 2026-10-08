import React, { useEffect, useMemo, useRef, useState } from "react";
import { getProperties } from "../src/api";

const PROPERTY_TYPES = [
  "All Property Types",
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
  "Office",
  "Shop",
];

const TABS = ["Buy", "Rent", "Commercial", "Plots"];

const POPULAR_LOCATIONS = [
  "Mumbai",
  "Delhi NCR",
  "Noida",
  "Ghaziabad",
  "Gurgaon",
  "Bangalore",
  "Pune",
  "Hyderabad",
];

const CATEGORIES = [
  {
    icon: "🏠",
    title: "Buy Property",
    text: "Homes, apartments, villas and independent houses.",
    type: "Buy",
    color: "#2563eb",
  },
  {
    icon: "🔑",
    title: "Rent Property",
    text: "Rental homes, apartments and residential spaces.",
    type: "Rent",
    color: "#0f766e",
  },
  {
    icon: "🏢",
    title: "Commercial",
    text: "Shops, offices, commercial spaces and investments.",
    type: "Commercial",
    color: "#7c3aed",
  },
  {
    icon: "📍",
    title: "Plots",
    text: "Residential and commercial plots across locations.",
    type: "Plots",
    color: "#ea580c",
  },
];

const FEATURES = [
  {
    icon: "✓",
    title: "Property Discovery",
    text: "Search properties by location, category, budget and property type.",
  },
  {
    icon: "⚡",
    title: "Direct Enquiries",
    text: "Connect with property owners, agents and builders through enquiries.",
  },
  {
    icon: "🔒",
    title: "Transparent Marketplace",
    text: "A simple marketplace designed around property information and direct connections.",
  },
];

const HOW_IT_WORKS = [
  {
    number: "01",
    icon: "🔎",
    title: "Search",
    text: "Choose a property category and search by city, locality or property type.",
  },
  {
    number: "02",
    icon: "🏠",
    title: "Explore",
    text: "Open property details, photos, pricing and available information.",
  },
  {
    number: "03",
    icon: "💬",
    title: "Enquire",
    text: "Send an enquiry and connect with the relevant property professional.",
  },
];

const FAQS = [
  {
    q: "What is PROZPO?",
    a: "PROZPO is a real-estate marketplace where owners, agents and builders can list properties and property seekers can discover and enquire about them.",
  },
  {
    q: "Can I post my property?",
    a: "Yes. Property owners, agents and builders can use the Post Property section to submit their listings.",
  },
  {
    q: "What types of properties can I find?",
    a: "PROZPO supports residential, rental, commercial and plot categories, depending on the listings available on the marketplace.",
  },
  {
    q: "How do property enquiries work?",
    a: "A visitor can open a property and submit an enquiry. The enquiry is stored in the marketplace system for follow-up.",
  },
];

function goToHash(path) {
  window.location.hash = path;
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "Price on Request";
  }

  const number = Number(String(value).replace(/[^0-9.]/g, ""));

  if (!Number.isFinite(number)) {
    return String(value);
  }

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)} Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)} Lakh`;
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

function getPropertyImage(property) {
  return (
    property?.image_url ||
    property?.imageUrl ||
    property?.image ||
    property?.cover_image ||
    property?.coverImage ||
    ""
  );
}

function getPropertyLocation(property) {
  return [
    property?.location,
    property?.city,
    property?.state,
  ]
    .filter(Boolean)
    .filter(
      (value, index, array) =>
        array.indexOf(value) === index
    )
    .join(", ");
}

function getPropertyType(property) {
  return (
    property?.property_type ||
    property?.propertyType ||
    "Property"
  );
}

function getListingType(property) {
  return String(
    property?.listing_type ||
      property?.listingType ||
      ""
  ).toLowerCase();
}

function isRentProperty(property) {
  const value = getListingType(property);

  return (
    value.includes("rent") ||
    value.includes("lease") ||
    value === "rental"
  );
}

function isCommercialProperty(property) {
  const type = String(
    property?.property_type ||
      property?.propertyType ||
      ""
  ).toLowerCase();

  return (
    type.includes("commercial") ||
    type.includes("office") ||
    type.includes("shop") ||
    type.includes("warehouse") ||
    type.includes("retail")
  );
}

function isPlotProperty(property) {
  const type = String(
    property?.property_type ||
      property?.propertyType ||
      ""
  ).toLowerCase();

  return type.includes("plot") || type.includes("land");
}

function isSaleProperty(property) {
  if (isRentProperty(property)) return false;

  return true;
}

function normalizeProperties(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.properties)) {
    return value.properties;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
}

function AutoCarousel({
  items,
  title,
  subtitle,
  label,
  onViewAll,
}) {
  const trackRef = useRef(null);

  useEffect(() => {
    if (!trackRef.current || items.length <= 3) {
      return undefined;
    }

    const element = trackRef.current;

    const interval = window.setInterval(() => {
      if (!element) return;

      const card = element.querySelector(
        ".live-property-card"
      );

      if (!card) return;

      const amount = card.offsetWidth + 18;

      const reachedEnd =
        element.scrollLeft + element.clientWidth >=
        element.scrollWidth - amount;

      if (reachedEnd) {
        element.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        element.scrollBy({
          left: amount,
          behavior: "smooth",
        });
      }
    }, 3500);

    return () => window.clearInterval(interval);
  }, [items.length]);

  function scroll(direction) {
    if (!trackRef.current) return;

    trackRef.current.scrollBy({
      left: direction * 330,
      behavior: "smooth",
    });
  }

  return (
    <section className="live-section">
      <div className="prozpo-container">
        <div className="live-heading">
          <div>
            <span className="section-label">
              LIVE MARKETPLACE
            </span>

            <h2>{title}</h2>

            <p>{subtitle}</p>
          </div>

          <div className="live-controls">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Previous properties"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Next properties"
            >
              →
            </button>

            <button
              type="button"
              className="view-all-link"
              onClick={onViewAll}
            >
              View All →
            </button>
          </div>
        </div>

        {items.length > 0 ? (
          <div
            className="live-property-track"
            ref={trackRef}
          >
            {items.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        ) : (
          <div className="property-empty-card">
            <div className="empty-icon">🏠</div>
            <div>
              <strong>No listings available yet</strong>
              <p>
                Be the first owner, agent or builder to
                post a property on PROZPO.
              </p>
            </div>

            <button
              type="button"
              className="primary-cta"
              onClick={() => goToHash("post-property")}
            >
              Post Property →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function PropertyCard({ property }) {
  const image = getPropertyImage(property);
  const location = getPropertyLocation(property);
  const type = getPropertyType(property);

  function openProperty() {
    if (!property?.id) return;

    goToHash(
      `property-detail?id=${encodeURIComponent(
        property.id
      )}`
    );
  }

  return (
    <article
      className="live-property-card"
      onClick={openProperty}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          openProperty();
        }
      }}
    >
      <div className="property-image-wrap">
        {image ? (
          <img
            src={image}
            alt={property?.title || "Property"}
            loading="lazy"
          />
        ) : (
          <div className="property-image-placeholder">
            <div className="placeholder-building">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <div className="property-image-gradient" />

        <span className="property-type-badge">
          {type}
        </span>

        <button
          type="button"
          className="property-favorite"
          onClick={(event) => {
            event.stopPropagation();
            goToHash(
              `property-detail?id=${encodeURIComponent(
                property.id
              )}`
            );
          }}
          aria-label="Open property"
        >
          ♡
        </button>
      </div>

      <div className="property-card-body">
        <div className="property-card-top">
          <span>{location || "India"}</span>

          <small>
            {isRentProperty(property)
              ? "FOR RENT"
              : "FOR SALE"}
          </small>
        </div>

        <h3>
          {property?.title || "Premium Property"}
        </h3>

        <div className="property-card-meta">
          <span>
            {property?.area
              ? `${property.area} ${
                  property?.area_unit || "sq.ft."
                }`
              : "Area available"}
          </span>

          {property?.bedrooms ? (
            <span>{property.bedrooms} BHK</span>
          ) : null}

          {property?.bathrooms ? (
            <span>{property.bathrooms} Bath</span>
          ) : null}
        </div>

        <div className="property-card-bottom">
          <strong>
            {formatPrice(property?.price)}
          </strong>

          <span>View →</span>
        </div>
      </div>
    </article>
  );
}

function Home() {
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState(
    "All Property Types"
  );
  const [activeTab, setActiveTab] = useState("Buy");

  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] =
    useState(true);

  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProperties() {
      try {
        setLoadingProperties(true);

        const result = await getProperties();
        const rows = normalizeProperties(result);

        if (active) {
          setProperties(rows);
        }
      } catch (error) {
        console.error(
          "PROZPO Home property loading error:",
          error
        );

        if (active) {
          setProperties([]);
        }
      } finally {
        if (active) {
          setLoadingProperties(false);
        }
      }
    }

    loadProperties();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const elements =
      document.querySelectorAll(
        ".home-reveal"
      );

    if (!elements.length) return undefined;

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "home-reveal-visible"
              );
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
        }
      );

    elements.forEach((element) =>
      observer.observe(element)
    );

    return () => observer.disconnect();
  }, [properties.length]);

  const filteredLocations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return POPULAR_LOCATIONS;
    }

    return POPULAR_LOCATIONS.filter((location) =>
      location.toLowerCase().includes(value)
    );
  }, [search]);

  const saleProperties = useMemo(
    () =>
      properties
        .filter(isSaleProperty)
        .filter(
          (property) =>
            !isCommercialProperty(property) &&
            !isPlotProperty(property)
        ),
    [properties]
  );

  const rentProperties = useMemo(
    () =>
      properties.filter(isRentProperty),
    [properties]
  );

  const commercialProperties = useMemo(
    () =>
      properties.filter(isCommercialProperty),
    [properties]
  );

  const plotProperties = useMemo(
    () => properties.filter(isPlotProperty),
    [properties]
  );

  const latestProperties = useMemo(
    () => properties.slice(0, 12),
    [properties]
  );

  const marketplaceCities = useMemo(() => {
    const values = properties
      .map(
        (property) =>
          property?.city ||
          property?.location ||
          ""
      )
      .map((value) => String(value).trim())
      .filter(Boolean);

    return [...new Set(values)];
  }, [properties]);

  function handleSearch() {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("location", search.trim());
    }

    if (propertyType !== "All Property Types") {
      params.set("type", propertyType);
    }

    params.set(
      "mode",
      activeTab.toLowerCase()
    );

    goToHash(`search?${params.toString()}`);
  }

  function handleCategory(type) {
    const params = new URLSearchParams();

    params.set(
      "mode",
      type.toLowerCase()
    );

    goToHash(`search?${params.toString()}`);
  }

  function handleLocation(location) {
    setSearch(location);

    const params = new URLSearchParams();

    params.set("location", location);
    params.set(
      "mode",
      activeTab.toLowerCase()
    );

    goToHash(`search?${params.toString()}`);
  }

  function handleEnquiry() {
    goToHash("my-enquiries");
  }

  return (
    <main className="prozpo-home">
      {/* ================= HERO ================= */}

      <section className="prozpo-hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-grid-pattern" />

        <div className="prozpo-container hero-container">
          <div className="hero-copy home-reveal">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              INDIA'S SMART REAL ESTATE MARKETPLACE
            </div>

            <h1>
              Find Your
              <span> Perfect Property</span>
            </h1>

            <p className="hero-description">
              Buy, rent, sell and discover properties
              from owners, agents and builders — all
              from one modern real-estate marketplace.
            </p>

            <div className="hero-search-card">
              <div className="search-tabs">
                {TABS.map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    className={
                      activeTab === tab
                        ? "search-tab active"
                        : "search-tab"
                    }
                    onClick={() =>
                      setActiveTab(tab)
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="search-fields">
                <div className="search-field location-field">
                  <div className="search-icon">
                    ⌕
                  </div>

                  <div className="search-field-content">
                    <label>Location</label>

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          handleSearch();
                        }
                      }}
                      placeholder="City, locality or area"
                    />
                  </div>
                </div>

                <div className="search-divider" />

                <div className="search-field type-field">
                  <div className="search-icon">
                    ⌂
                  </div>

                  <div className="search-field-content">
                    <label>
                      Property Type
                    </label>

                    <select
                      value={propertyType}
                      onChange={(event) =>
                        setPropertyType(
                          event.target.value
                        )
                      }
                    >
                      {PROPERTY_TYPES.map(
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

                <button
                  type="button"
                  className="hero-search-button"
                  onClick={handleSearch}
                >
                  Search
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="hero-popular">
              <strong>Popular:</strong>

              <div className="popular-list">
                {filteredLocations
                  .slice(0, 6)
                  .map((location) => (
                    <button
                      type="button"
                      key={location}
                      onClick={() =>
                        handleLocation(
                          location
                        )
                      }
                    >
                      {location}
                    </button>
                  ))}
              </div>
            </div>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-cta"
                onClick={() =>
                  goToHash("search")
                }
              >
                Explore Properties
                <span>→</span>
              </button>

              <button
                type="button"
                className="secondary-cta"
                onClick={() =>
                  goToHash(
                    "post-property"
                  )
                }
              >
                Post Your Property
              </button>
            </div>

            <div className="hero-mini-trust">
              <span>✓ Owner Listings</span>
              <span>✓ Agent Listings</span>
              <span>✓ Builder Projects</span>
            </div>
          </div>

          {/* HERO VISUAL */}

          <div className="hero-property-area home-reveal">
            <div className="property-glow" />

            <div className="property-visual-card">
              <div className="visual-top-bar">
                <div className="live-status">
                  <span />
                  LIVE MARKETPLACE
                </div>

                <div className="visual-dots">
                  •••
                </div>
              </div>

              <div className="property-scene">
                <div className="scene-sun" />

                <div className="scene-cloud cloud-one" />
                <div className="scene-cloud cloud-two" />

                <div className="scene-building building-main">
                  <div className="building-roof" />

                  <div className="building-top">
                    <div className="building-sign">
                      PROZPO
                    </div>
                  </div>

                  <div className="building-windows">
                    {[1, 2, 3, 4, 5, 6].map(
                      (item) => (
                        <span
                          key={item}
                          className={
                            item % 3 === 0
                              ? "building-window warm"
                              : "building-window"
                          }
                        />
                      )
                    )}
                  </div>

                  <div className="building-door">
                    <span />
                  </div>
                </div>

                <div className="scene-building building-side">
                  <div className="side-roof" />

                  <div className="side-windows">
                    {[1, 2, 3, 4].map(
                      (item) => (
                        <span key={item} />
                      )
                    )}
                  </div>
                </div>

                <div className="scene-tree tree-one">
                  <span className="tree-leaf" />
                  <span className="tree-trunk" />
                </div>

                <div className="scene-tree tree-two">
                  <span className="tree-leaf" />
                  <span className="tree-trunk" />
                </div>

                <div className="scene-ground" />
              </div>

              <div className="visual-bottom">
                <div className="visual-property-info">
                  <span>
                    REAL ESTATE MARKETPLACE
                  </span>

                  <strong>
                    Search. Discover. Enquire.
                  </strong>

                  <small>
                    Built for property seekers
                  </small>
                </div>

                <div className="visual-listing-count">
                  <strong>
                    {properties.length || "—"}
                  </strong>
                  <span>Live Listings</span>
                </div>
              </div>
            </div>

            <div className="floating-property-card">
              <div className="floating-property-icon">
                🏡
              </div>

              <div>
                <strong>
                  Find your dream property
                </strong>

                <span>
                  Properties across India
                </span>
              </div>

              <div className="floating-arrow">
                →
              </div>
            </div>

            <div className="floating-price-card">
              <span>
                MARKETPLACE
              </span>

              <strong>
                {loadingProperties
                  ? "Loading..."
                  : `${properties.length} Listings`}
              </strong>

              <small>
                Updated automatically
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LIVE STATS ================= */}

      <section className="stats-section home-reveal">
        <div className="prozpo-container stats-grid">
          <div className="stat-item">
            <strong>
              {properties.length}
            </strong>
            <span>Live Listings</span>
          </div>

          <div className="stat-separator" />

          <div className="stat-item">
            <strong>
              {marketplaceCities.length}
            </strong>
            <span>Active Locations</span>
          </div>

          <div className="stat-separator" />

          <div className="stat-item">
            <strong>4</strong>
            <span>Marketplace Categories</span>
          </div>

          <div className="stat-separator" />

          <div className="stat-item">
            <strong>24×7</strong>
            <span>Property Discovery</span>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section className="home-section categories-section home-reveal">
        <div className="prozpo-container">
          <div className="section-heading-row">
            <div>
              <span className="section-label">
                EXPLORE
              </span>

              <h2>
                Find Properties Your Way
              </h2>

              <p>
                Search residential, rental,
                commercial and plot properties
                from one marketplace.
              </p>
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={() =>
                goToHash("search")
              }
            >
              View All Properties →
            </button>
          </div>

          <div className="category-grid">
            {CATEGORIES.map((category) => (
              <button
                type="button"
                key={category.title}
                className="category-card"
                onClick={() =>
                  handleCategory(
                    category.type
                  )
                }
              >
                <div
                  className="category-icon"
                  style={{
                    background: `${category.color}14`,
                    color: category.color,
                  }}
                >
                  {category.icon}
                </div>

                <div className="category-content">
                  <h3>{category.title}</h3>

                  <p>{category.text}</p>

                  <span>
                    Explore
                    <b>→</b>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LATEST ================= */}

      <div className="home-reveal">
        <AutoCarousel
          items={latestProperties}
          title="Latest Properties"
          subtitle="Newly available properties posted on the PROZPO marketplace."
          label="LATEST LISTINGS"
          onViewAll={() =>
            goToHash("search")
          }
        />
      </div>

      {/* ================= SALE ================= */}

      <div className="home-reveal">
        <AutoCarousel
          items={saleProperties}
          title="Properties for Sale"
          subtitle="Explore residential properties available for purchase."
          label="FOR SALE"
          onViewAll={() =>
            goToHash("buy")
          }
        />
      </div>

      {/* ================= RENT ================= */}

      <div className="home-reveal">
        <AutoCarousel
          items={rentProperties}
          title="Properties for Rent"
          subtitle="Find rental homes and spaces available in the marketplace."
          label="FOR RENT"
          onViewAll={() =>
            goToHash("rent")
          }
        />
      </div>

      {/* ================= COMMERCIAL ================= */}

      <div className="home-reveal">
        <AutoCarousel
          items={commercialProperties}
          title="Commercial Properties"
          subtitle="Discover shops, offices and other commercial opportunities."
          label="COMMERCIAL"
          onViewAll={() =>
            goToHash("commercial")
          }
        />
      </div>

      {/* ================= PLOTS ================= */}

      <div className="home-reveal">
        <AutoCarousel
          items={plotProperties}
          title="Plots & Land"
          subtitle="Explore residential and commercial plots available on PROZPO."
          label="PLOTS & LAND"
          onViewAll={() =>
            goToHash("plots")
          }
        />
      </div>

      {/* ================= WHY PROZPO ================= */}

      <section className="home-section why-section home-reveal">
        <div className="prozpo-container why-grid">
          <div className="why-content">
            <span className="section-label">
              WHY PROZPO
            </span>

            <h2>
              A Smarter Way
              <span>
                To Find Property
              </span>
            </h2>

            <p className="why-description">
              PROZPO brings property owners,
              buyers, tenants, agents, brokers
              and builders together on one modern
              marketplace.
            </p>

            <div className="feature-list">
              {FEATURES.map((feature) => (
                <div
                  className="feature-item"
                  key={feature.title}
                >
                  <div className="feature-icon">
                    {feature.icon}
                  </div>

                  <div>
                    <h3>
                      {feature.title}
                    </h3>

                    <p>
                      {feature.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="primary-cta compact"
              onClick={handleEnquiry}
            >
              Make an Enquiry
              <span>→</span>
            </button>
          </div>

          <div className="phone-showcase">
            <div className="phone-glow" />

            <div className="phone-device">
              <div className="phone-notch" />

              <div className="phone-header">
                <strong>PROZPO</strong>
                <span>•••</span>
              </div>

              <div className="phone-search">
                🔍
                <span>
                  Search properties
                </span>
              </div>

              {latestProperties
                .slice(0, 2)
                .map((property) => (
                  <div
                    className="phone-property"
                    key={property.id}
                  >
                    <div className="phone-property-image">
                      {getPropertyImage(
                        property
                      ) ? (
                        <img
                          src={getPropertyImage(
                            property
                          )}
                          alt=""
                        />
                      ) : (
                        "🏢"
                      )}
                    </div>

                    <div>
                      <strong>
                        {property.title ||
                          "Premium Property"}
                      </strong>

                      <span>
                        {getPropertyLocation(
                          property
                        ) || "India"}
                      </span>

                      <b>
                        {formatPrice(
                          property.price
                        )}
                      </b>
                    </div>
                  </div>
                ))}

              {latestProperties.length === 0 && (
                <>
                  <div className="phone-property">
                    <div className="phone-property-image">
                      🏢
                    </div>

                    <div>
                      <strong>
                        Premium Property
                      </strong>

                      <span>
                        Discover on PROZPO
                      </span>

                      <b>
                        Explore
                      </b>
                    </div>
                  </div>

                  <div className="phone-property">
                    <div className="phone-property-image villa">
                      🏡
                    </div>

                    <div>
                      <strong>
                        New Listing
                      </strong>

                      <span>
                        Your property could appear here
                      </span>

                      <b>
                        Post Now
                      </b>
                    </div>
                  </div>
                </>
              )}

              <div className="phone-bottom">
                <span>⌂</span>
                <span>♡</span>

                <span className="phone-add">
                  ＋
                </span>

                <span>◉</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MISSION / VISION ================= */}

      <section className="mission-section home-reveal">
        <div className="prozpo-container">
          <div className="mission-intro">
            <span className="section-label light">
              OUR PURPOSE
            </span>

            <h2>
              Building a Better
              <span>Property Discovery Experience</span>
            </h2>

            <p>
              PROZPO is being built to simplify
              how people discover, compare and
              enquire about real estate.
            </p>
          </div>

          <div className="mission-grid">
            <article className="mission-card">
              <div className="mission-icon">
                🎯
              </div>

              <span>OUR MISSION</span>

              <h3>
                Make property discovery simple.
              </h3>

              <p>
                Our mission is to bring useful
                property information, owners,
                agents and builders together so
                users can discover opportunities
                without unnecessary complexity.
              </p>
            </article>

            <article className="mission-card featured">
              <div className="mission-icon">
                🚀
              </div>

              <span>OUR VISION</span>

              <h3>
                One marketplace for every property journey.
              </h3>

              <p>
                We envision PROZPO as a modern
                real-estate ecosystem where
                property discovery, listing,
                enquiries and professional
                connections can happen from one
                trusted platform.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ================= FOUNDER THOUGHT ================= */}

      <section className="founder-section home-reveal">
        <div className="prozpo-container">
          <div className="founder-card">
            <div className="founder-mark">
              “
            </div>

            <div className="founder-content">
              <span className="section-label">
                FOUNDER'S THOUGHT
              </span>

              <h2>
                Property discovery should
                feel simple, transparent
                and accessible.
              </h2>

              <p>
                PROZPO is being built with a
                simple idea: people should be
                able to search property, understand
                the listing and start a conversation
                with the right person without
                unnecessary friction.
              </p>

              <strong>
                — PROZPO Founder
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="home-section how-section home-reveal">
        <div className="prozpo-container">
          <div className="center-heading">
            <span className="section-label">
              HOW IT WORKS
            </span>

            <h2>
              From Search to Enquiry
              <span>in Three Simple Steps</span>
            </h2>

            <p>
              A straightforward property discovery
              journey for buyers, tenants and
              investors.
            </p>
          </div>

          <div className="how-grid">
            {HOW_IT_WORKS.map((item) => (
              <article
                className="how-card"
                key={item.number}
              >
                <div className="how-number">
                  {item.number}
                </div>

                <div className="how-icon">
                  {item.icon}
                </div>

                <h3>{item.title}</h3>

                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= POPULAR CITIES ================= */}

      <section className="home-section locations-section home-reveal">
        <div className="prozpo-container">
          <div className="section-heading-row">
            <div>
              <span className="section-label">
                LOCATIONS
              </span>

              <h2>
                Explore Popular Cities
              </h2>

              <p>
                Search properties across India's
                major real-estate markets.
              </p>
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={() =>
                goToHash("search")
              }
            >
              Search Properties →
            </button>
          </div>

          <div className="city-grid">
            {POPULAR_LOCATIONS.map(
              (location, index) => (
                <button
                  type="button"
                  key={location}
                  className="city-card"
                  onClick={() =>
                    handleLocation(
                      location
                    )
                  }
                >
                  <span className="city-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <strong>
                    {location}
                  </strong>

                  <span className="city-arrow">
                    →
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* ================= TRUST / SAFETY ================= */}

      <section className="trust-section home-reveal">
        <div className="prozpo-container">
          <div className="center-heading">
            <span className="section-label">
              TRUST & SAFETY
            </span>

            <h2>
              Built Around Better
              <span>Property Conversations</span>
            </h2>

            <p>
              PROZPO is designed to keep property
              discovery clear, structured and
              user-focused.
            </p>
          </div>

          <div className="trust-grid">
            <div className="trust-card">
              <div>🛡️</div>
              <h3>
                Clear Property Information
              </h3>
              <p>
                Listings can include location,
                pricing, area, description and
                other useful property information.
              </p>
            </div>

            <div className="trust-card">
              <div>👥</div>
              <h3>
                Multiple Property Professionals
              </h3>
              <p>
                Owners, agents and builders can
                participate in the marketplace.
              </p>
            </div>

            <div className="trust-card">
              <div>💬</div>
              <h3>
                Enquiry Based Connection
              </h3>
              <p>
                Property seekers can initiate
                enquiries instead of relying only
                on generic contact discovery.
              </p>
            </div>

            <div className="trust-card">
              <div>⚙️</div>
              <h3>
                Marketplace Infrastructure
              </h3>
              <p>
                Listings and enquiries are
                connected with the PROZPO backend
                and database infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ENQUIRY CTA ================= */}

      <section className="enquiry-section home-reveal">
        <div className="prozpo-container">
          <div className="enquiry-card">
            <div className="enquiry-decoration one" />
            <div className="enquiry-decoration two" />

            <div className="enquiry-content">
              <span className="enquiry-label">
                NEED HELP FINDING PROPERTY?
              </span>

              <h2>
                Talk to a Property Expert
              </h2>

              <p>
                Tell us what you're looking for
                and start your property enquiry.
              </p>
            </div>

            <div className="enquiry-actions">
              <button
                type="button"
                className="white-cta"
                onClick={handleEnquiry}
              >
                Send Enquiry
                <span>→</span>
              </button>

              <button
                type="button"
                className="glass-cta"
                onClick={() =>
                  goToHash("search")
                }
              >
                Browse Properties
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= POST PROPERTY ================= */}

      <section className="post-property-section home-reveal">
        <div className="prozpo-container">
          <div className="post-property-card">
            <div className="post-property-content">
              <span className="section-label">
                FOR OWNERS • AGENTS • BUILDERS
              </span>

              <h2>
                Have a Property to
                <span>
                  Sell or Rent?
                </span>
              </h2>

              <p>
                List your property on PROZPO and
                connect with people searching for
                real estate.
              </p>

              <button
                type="button"
                className="primary-cta"
                onClick={() =>
                  goToHash(
                    "post-property"
                  )
                }
              >
                Post Your Property
                <span>→</span>
              </button>
            </div>

            <div className="post-property-visual">
              <div className="mini-building">
                <div className="mini-roof" />

                <div className="mini-body">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="mini-circle circle-one" />
              <div className="mini-circle circle-two" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}

      <section className="home-section faq-section home-reveal">
        <div className="prozpo-container faq-grid">
          <div>
            <span className="section-label">
              FAQ
            </span>

            <h2>
              Questions About
              <span>PROZPO?</span>
            </h2>

            <p>
              Find quick answers about property
              discovery and marketplace listings.
            </p>

            <button
              type="button"
              className="primary-cta"
              onClick={() =>
                goToHash("contact")
              }
            >
              Contact PROZPO →
            </button>
          </div>

          <div className="faq-list">
            {FAQS.map((faq, index) => {
              const open =
                openFaq === index;

              return (
                <div
                  className={
                    open
                      ? "faq-item open"
                      : "faq-item"
                  }
                  key={faq.q}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(
                        open ? -1 : index
                      )
                    }
                  >
                    <span>{faq.q}</span>

                    <b>
                      {open ? "−" : "+"}
                    </b>
                  </button>

                  {open && (
                    <div className="faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}

      <section className="final-home-cta">
        <div className="final-glow" />

        <div className="prozpo-container final-cta-content">
          <span className="section-label light">
            START YOUR PROPERTY JOURNEY
          </span>

          <h2>
            Search Smarter.
            <br />
            <span>
              Discover Better.
            </span>
          </h2>

          <p>
            Your next home, investment or business
            property could be one search away.
          </p>

          <div className="final-actions">
            <button
              type="button"
              className="white-cta"
              onClick={() =>
                goToHash("search")
              }
            >
              Start Searching
              <span>→</span>
            </button>

            <button
              type="button"
              className="glass-cta"
              onClick={() =>
                goToHash(
                  "post-property"
                )
              }
            >
              Post Property
            </button>
          </div>
        </div>
      </section>

      {/* ================= COMPLETE FOOTER ================= */}

      <footer className="prozpo-footer">
        <div className="prozpo-container">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                PROZPO
              </div>

              <p>
                India's modern real-estate
                marketplace for property
                discovery, listings and enquiries.
              </p>

              <div className="footer-socials">
                <button
                  type="button"
                  onClick={() =>
                    goToHash("contact")
                  }
                >
                  Contact
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goToHash("help")
                  }
                >
                  Help
                </button>
              </div>
            </div>

            <div className="footer-column">
              <h3>Marketplace</h3>

              <button
                onClick={() =>
                  goToHash("buy")
                }
              >
                Buy
              </button>

              <button
                onClick={() =>
                  goToHash("rent")
                }
              >
                Rent
              </button>

              <button
                onClick={() =>
                  goToHash("commercial")
                }
              >
                Commercial
              </button>

              <button
                onClick={() =>
                  goToHash("plots")
                }
              >
                Plots
              </button>

              <button
                onClick={() =>
                  goToHash("projects")
                }
              >
                Projects
              </button>
            </div>

            <div className="footer-column">
              <h3>For Professionals</h3>

              <button
                onClick={() =>
                  goToHash(
                    "post-property"
                  )
                }
              >
                Post Property
              </button>

              <button
                onClick={() =>
                  goToHash("agents")
                }
              >
                Agents
              </button>

              <button
                onClick={() =>
                  goToHash("builders")
                }
              >
                Builders
              </button>

              <button
                onClick={() =>
                  goToHash("profile")
                }
              >
                My Profile
              </button>
            </div>

            <div className="footer-column">
              <h3>Company</h3>

              <button
                onClick={() =>
                  goToHash("about")
                }
              >
                About PROZPO
              </button>

              <button
                onClick={() =>
                  goToHash("mission")
                }
              >
                Mission
              </button>

              <button
                onClick={() =>
                  goToHash("vision")
                }
              >
                Vision
              </button>

              <button
                onClick={() =>
                  goToHash("contact")
                }
              >
                Contact
              </button>

              <button
                onClick={() =>
                  goToHash("blog")
                }
              >
                Blog
              </button>
            </div>

            <div className="footer-column">
              <h3>Legal</h3>

              <button
                onClick={() =>
                  goToHash("privacy")
                }
              >
                Privacy Policy
              </button>

              <button
                onClick={() =>
                  goToHash("terms")
                }
              >
                Terms & Conditions
              </button>

              <button
                onClick={() =>
                  goToHash("cookies")
                }
              >
                Cookie Policy
              </button>

              <button
                onClick={() =>
                  goToHash("help")
                }
              >
                Help Center
              </button>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} PROZPO.
              All Rights Reserved.
            </span>

            <span>
              Built for India's real-estate
              marketplace.
            </span>
          </div>
        </div>
      </footer>

      {/* ================= FLOATING ENQUIRY ================= */}

      <button
        type="button"
        className="floating-enquiry"
        onClick={handleEnquiry}
        aria-label="Make property enquiry"
      >
        <span className="floating-enquiry-icon">
          💬
        </span>

        <span className="floating-enquiry-text">
          Enquiry
        </span>
      </button>

      {/* ================= CSS ================= */}

      <style>{`
        .prozpo-home {
          --primary: #2563eb;
          --primary-dark: #1d4ed8;
          --navy: #06132d;
          --navy-2: #0b2855;
          --teal: #0f766e;
          --cyan: #22d3ee;
          --green: #35d5a5;
          --text: #0f172a;
          --muted: #64748b;
          --border: #e2e8f0;
          --soft: #f8fafc;

          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #ffffff;
          color: var(--text);

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .prozpo-home *,
        .prozpo-home *::before,
        .prozpo-home *::after {
          box-sizing: border-box;
        }

        .prozpo-home button,
        .prozpo-home input,
        .prozpo-home select {
          font-family: inherit;
        }

        .prozpo-home button {
          -webkit-tap-highlight-color: transparent;
        }

        .prozpo-container {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding-left: 20px;
          padding-right: 20px;
        }

        .home-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity .7s ease,
            transform .7s ease;
        }

        .home-reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* HERO */

        .prozpo-hero {
          position: relative;
          overflow: hidden;
          padding: 70px 0 80px;

          background:
            radial-gradient(
              circle at 85% 15%,
              rgba(37,99,235,.30),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #06132d 0%,
              #0b2855 52%,
              #103e75 100%
            );
        }

        .hero-container {
          position: relative;
          z-index: 3;

          display: grid;
          grid-template-columns:
            minmax(0, 1.04fr)
            minmax(420px, .96fr);

          align-items: center;
          gap: 48px;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(18px);
          pointer-events: none;
        }

        .hero-orb-one {
          width: 460px;
          height: 460px;
          right: -180px;
          top: -180px;
          background: rgba(37,99,235,.18);
        }

        .hero-orb-two {
          width: 340px;
          height: 340px;
          left: -160px;
          bottom: -190px;
          background: rgba(20,184,166,.12);
        }

        .hero-grid-pattern {
          position: absolute;
          inset: 0;
          opacity: .07;

          background-image:
            linear-gradient(
              rgba(255,255,255,.2) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.2) 1px,
              transparent 1px
            );

          background-size: 46px 46px;
        }

        .hero-copy {
          position: relative;
          z-index: 2;
          max-width: 720px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          padding: 9px 14px;

          border: 1px solid rgba(255,255,255,.14);
          border-radius: 999px;

          background: rgba(255,255,255,.08);

          color: #d6eaff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .hero-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #35d5a5;

          box-shadow:
            0 0 0 5px rgba(53,213,165,.08),
            0 0 18px rgba(53,213,165,.8);

          animation:
            prozpoPulse 1.8s infinite;
        }

        .hero-copy h1 {
          margin: 22px 0 16px;

          color: #ffffff;

          font-size:
            clamp(45px, 5.6vw, 72px);

          line-height: 1.01;
          letter-spacing: -3px;
          font-weight: 950;
        }

        .hero-copy h1 span {
          display: block;

          background:
            linear-gradient(
              90deg,
              #55d6ff,
              #70e5bd
            );

          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-description {
          max-width: 680px;
          margin: 0;

          color: #c6d7eb;

          font-size: 17px;
          line-height: 1.7;
        }

        .hero-search-card {
          margin-top: 27px;
          padding: 9px;

          border: 1px solid rgba(255,255,255,.13);
          border-radius: 20px;

          background: rgba(255,255,255,.09);

          box-shadow:
            0 24px 70px rgba(0,0,0,.22);

          backdrop-filter: blur(18px);
        }

        .search-tabs {
          display: flex;
          gap: 4px;

          padding: 2px 3px 9px;
        }

        .search-tab {
          border: 0;
          border-radius: 9px;

          padding: 8px 14px;

          background: transparent;
          color: #b9c9df;

          font-size: 13px;
          font-weight: 850;

          cursor: pointer;
        }

        .search-tab.active {
          background: #ffffff;
          color: #1d4ed8;

          box-shadow:
            0 5px 16px rgba(0,0,0,.12);
        }

        .search-fields {
          display: grid;

          grid-template-columns:
            minmax(0, 1.25fr)
            1px
            minmax(0, 1fr)
            auto;

          align-items: center;
          gap: 12px;

          padding: 8px;

          border-radius: 14px;
          background: #ffffff;
        }

        .search-field {
          min-width: 0;

          display: flex;
          align-items: center;
          gap: 10px;

          padding: 5px 9px;
        }

        .search-icon {
          flex: 0 0 auto;

          width: 32px;
          height: 32px;

          display: grid;
          place-items: center;

          border-radius: 9px;

          background: #eff6ff;
          color: #2563eb;

          font-size: 19px;
          font-weight: 900;
        }

        .search-field-content {
          min-width: 0;
          flex: 1;
        }

        .search-field-content label {
          display: block;

          margin-bottom: 2px;

          color: #64748b;
          font-size: 10px;
          font-weight: 900;

          text-transform: uppercase;
          letter-spacing: .8px;
        }

        .search-field-content input,
        .search-field-content select {
          width: 100%;
          min-width: 0;

          padding: 0;

          border: 0;
          outline: 0;

          background: transparent;
          color: #0f172a;

          font-size: 14px;
          font-weight: 750;
        }

        .search-field-content input::placeholder {
          color: #94a3b8;
        }

        .search-divider {
          width: 1px;
          height: 38px;
          background: #e2e8f0;
        }

        .hero-search-button {
          min-height: 48px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 15px;

          padding: 0 21px;

          border: 0;
          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0ea5e9
            );

          color: #ffffff;

          font-size: 14px;
          font-weight: 900;

          cursor: pointer;

          box-shadow:
            0 10px 24px rgba(37,99,235,.28);

          transition: .2s ease;
        }

        .hero-search-button:hover {
          transform: translateY(-2px);
        }

        .hero-popular {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .hero-popular strong {
          color: #ffffff;
          font-size: 12px;
        }

        .popular-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .popular-list button {
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 999px;

          padding: 6px 10px;

          background: rgba(255,255,255,.07);
          color: #c7d8eb;

          font-size: 11px;
          font-weight: 750;

          cursor: pointer;
          transition: .2s ease;
        }

        .popular-list button:hover {
          background: rgba(255,255,255,.14);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 19px;
        }

        .primary-cta,
        .secondary-cta,
        .white-cta,
        .glass-cta,
        .outline-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          min-height: 46px;
          padding: 11px 18px;

          border-radius: 11px;

          font-size: 14px;
          font-weight: 900;

          cursor: pointer;

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            background .2s ease;
        }

        .primary-cta {
          border: 0;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0ea5e9
            );

          color: #ffffff;

          box-shadow:
            0 10px 24px rgba(37,99,235,.22);
        }

        .primary-cta:hover {
          transform: translateY(-2px);

          box-shadow:
            0 14px 28px rgba(37,99,235,.30);
        }

        .secondary-cta {
          border: 1px solid rgba(255,255,255,.20);
          background: rgba(255,255,255,.08);
          color: #ffffff;
        }

        .secondary-cta:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,.14);
        }

        .hero-mini-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;

          margin-top: 20px;

          color: #b8cce3;

          font-size: 11px;
          font-weight: 750;
        }

        /* HERO VISUAL */

        .hero-property-area {
          position: relative;

          min-height: 540px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .property-glow {
          position: absolute;

          width: 390px;
          height: 390px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(74,222,207,.23),
              transparent 68%
            );

          filter: blur(5px);
        }

        .property-visual-card {
          position: relative;

          width: min(100%, 520px);

          overflow: hidden;

          border: 1px solid rgba(255,255,255,.18);
          border-radius: 27px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.16),
              rgba(255,255,255,.07)
            );

          box-shadow:
            0 30px 90px rgba(0,0,0,.30);

          backdrop-filter: blur(16px);

          transform:
            perspective(1000px)
            rotateY(-4deg);

          animation:
            propertyFloat 5s ease-in-out infinite;
        }

        .visual-top-bar {
          height: 58px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 20px;

          border-bottom: 1px solid rgba(255,255,255,.10);
        }

        .live-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          color: #dffcf3;

          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .live-status span {
          width: 7px;
          height: 7px;
          border-radius: 50%;

          background: #35d5a5;

          box-shadow:
            0 0 13px #35d5a5;
        }

        .visual-dots {
          color: #a9c0dc;
          letter-spacing: 3px;
        }

        .property-scene {
          position: relative;

          height: 340px;

          overflow: hidden;

          background:
            linear-gradient(
              180deg,
              #77cfff 0%,
              #c8f1ff 62%,
              #e9f7e9 100%
            );
        }

        .scene-sun {
          position: absolute;

          top: 38px;
          right: 55px;

          width: 72px;
          height: 72px;

          border-radius: 50%;

          background: #ffe38b;

          box-shadow:
            0 0 45px rgba(255,226,132,.65);
        }

        .scene-cloud {
          position: absolute;

          width: 80px;
          height: 23px;

          border-radius: 30px;

          background: rgba(255,255,255,.65);

          animation:
            cloudMove 8s linear infinite;
        }

        .scene-cloud::before,
        .scene-cloud::after {
          content: "";

          position: absolute;

          border-radius: 50%;

          background: inherit;
        }

        .scene-cloud::before {
          width: 32px;
          height: 32px;
          left: 12px;
          top: -14px;
        }

        .scene-cloud::after {
          width: 40px;
          height: 40px;
          right: 9px;
          top: -18px;
        }

        .cloud-one {
          top: 65px;
          left: 45px;
        }

        .cloud-two {
          top: 112px;
          left: 230px;
          transform: scale(.7);
          animation-delay: -3s;
        }

        .scene-building {
          position: absolute;
          z-index: 4;
        }

        .building-main {
          left: 105px;
          bottom: 46px;

          width: 245px;
          height: 230px;

          border-radius: 4px 4px 0 0;

          background:
            linear-gradient(
              90deg,
              #dbeafe,
              #f8fafc
            );

          box-shadow:
            15px 12px 0 rgba(15,23,42,.06);
        }

        .building-roof {
          position: absolute;

          top: -27px;
          left: -17px;

          width: 280px;
          height: 43px;

          clip-path: polygon(
            0 100%,
            50% 0,
            100% 100%
          );

          background:
            linear-gradient(
              135deg,
              #1e3a8a,
              #2563eb
            );
        }

        .building-top {
          height: 57px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-bottom: 1px solid #bfdbfe;
        }

        .building-sign {
          padding: 6px 13px;

          border-radius: 7px;

          background: #2563eb;
          color: #ffffff;

          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1px;
        }

        .building-windows {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 13px;

          padding: 17px 19px;
        }

        .building-window {
          height: 43px;

          border: 4px solid #93c5fd;

          background: #38bdf8;

          box-shadow:
            inset 0 0 18px rgba(255,255,255,.45);

          animation:
            windowGlow 3s ease-in-out infinite;
        }

        .building-window.warm {
          background: #fbbf24;
        }

        .building-door {
          position: absolute;

          left: 95px;
          bottom: 0;

          width: 55px;
          height: 73px;

          border-radius: 5px 5px 0 0;

          background: #172554;
        }

        .building-door span {
          position: absolute;

          right: 8px;
          top: 37px;

          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #facc15;
        }

        .building-side {
          right: 35px;
          bottom: 45px;

          width: 125px;
          height: 165px;

          background: #e2e8f0;

          transform: skewY(-8deg);

          z-index: 3;
        }

        .side-roof {
          position: absolute;

          left: -8px;
          top: -18px;

          width: 140px;
          height: 28px;

          background: #334155;

          transform: skewY(8deg);
        }

        .side-windows {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 12px;

          padding: 30px 15px;
        }

        .side-windows span {
          height: 36px;

          background: #38bdf8;

          border: 3px solid #94a3b8;
        }

        .scene-tree {
          position: absolute;

          z-index: 7;
          bottom: 50px;
        }

        .tree-one {
          left: 48px;
        }

        .tree-two {
          right: 8px;
          transform: scale(.82);
        }

        .tree-leaf {
          display: block;

          width: 72px;
          height: 72px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle at 35% 30%,
              #86efac,
              #15803d
            );

          box-shadow:
            20px 5px 0 #16a34a,
            -15px 9px 0 #22c55e;
        }

        .tree-trunk {
          display: block;

          width: 14px;
          height: 62px;

          margin: -4px auto 0;

          border-radius: 5px;

          background: #92400e;
        }

        .scene-ground {
          position: absolute;

          left: -5%;
          bottom: 0;

          width: 110%;
          height: 72px;

          background:
            linear-gradient(
              180deg,
              #4ade80,
              #15803d
            );

          border-radius:
            50% 50% 0 0;

          z-index: 8;
        }

        .visual-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          padding: 18px 20px 20px;

          color: #ffffff;
        }

        .visual-property-info span,
        .visual-property-info small {
          display: block;
        }

        .visual-property-info span {
          margin-bottom: 4px;

          color: #86efac;

          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .visual-property-info strong {
          display: block;

          font-size: 17px;
          font-weight: 900;
        }

        .visual-property-info small {
          margin-top: 3px;

          color: #b6c9df;

          font-size: 11px;
        }

        .visual-listing-count {
          text-align: right;
        }

        .visual-listing-count strong {
          display: block;

          color: #ffffff;

          font-size: 25px;
          font-weight: 950;
        }

        .visual-listing-count span {
          color: #a8bdd6;
          font-size: 10px;
        }

        .floating-property-card,
        .floating-price-card {
          position: absolute;
          z-index: 20;

          border: 1px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.95);

          box-shadow:
            0 20px 45px rgba(0,0,0,.20);

          backdrop-filter: blur(14px);
        }

        .floating-property-card {
          left: -12px;
          bottom: 55px;

          display: flex;
          align-items: center;
          gap: 10px;

          min-width: 235px;

          padding: 12px 14px;

          border-radius: 15px;

          animation:
            cardFloat 4s ease-in-out infinite;
        }

        .floating-property-icon {
          width: 39px;
          height: 39px;

          display: grid;
          place-items: center;

          border-radius: 11px;

          background: #eff6ff;

          font-size: 21px;
        }

        .floating-property-card strong,
        .floating-property-card span {
          display: block;
        }

        .floating-property-card strong {
          color: #0f172a;
          font-size: 12px;
        }

        .floating-property-card span {
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
        }

        .floating-arrow {
          margin-left: auto;
          color: #2563eb;
          font-weight: 950;
        }

        .floating-price-card {
          right: -12px;
          top: 105px;

          min-width: 150px;

          padding: 13px 15px;

          border-radius: 15px;

          animation:
            cardFloatReverse 4.5s ease-in-out infinite;
        }

        .floating-price-card span,
        .floating-price-card small {
          display: block;
        }

        .floating-price-card span {
          color: #64748b;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .8px;
        }

        .floating-price-card strong {
          display: block;

          margin: 3px 0;

          color: #0f172a;

          font-size: 17px;
          font-weight: 950;
        }

        .floating-price-card small {
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
        }

        /* STATS */

        .stats-section {
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .stats-grid {
          min-height: 112px;

          display: grid;

          grid-template-columns:
            1fr auto
            1fr auto
            1fr auto
            1fr;

          align-items: center;

          gap: 20px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-item strong {
          display: block;

          color: #0f172a;

          font-size: 27px;
          font-weight: 950;
        }

        .stat-item span {
          display: block;

          margin-top: 4px;

          color: #64748b;

          font-size: 11px;
          font-weight: 700;
        }

        .stat-separator {
          width: 1px;
          height: 42px;
          background: #e2e8f0;
        }

        /* COMMON */

        .home-section {
          padding: 72px 0;
        }

        .section-heading-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 25px;

          margin-bottom: 28px;
        }

        .section-label {
          display: inline-block;

          margin-bottom: 8px;

          color: #2563eb;

          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1.4px;
        }

        .section-heading-row h2,
        .why-content h2,
        .post-property-content h2 {
          margin: 0;

          color: #0f172a;

          font-size:
            clamp(30px, 4vw, 43px);

          line-height: 1.1;
          letter-spacing: -1.5px;
          font-weight: 950;
        }

        .section-heading-row p {
          max-width: 620px;

          margin: 9px 0 0;

          color: #64748b;

          font-size: 14px;
          line-height: 1.65;
        }

        .outline-button {
          flex: 0 0 auto;

          border: 1px solid #cbd5e1;

          background: #ffffff;

          color: #1e3a8a;
        }

        .outline-button:hover {
          border-color: #93c5fd;
          background: #eff6ff;
          transform: translateY(-2px);
        }

        /* CATEGORIES */

        .categories-section {
          background: #f8fafc;
        }

        .category-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 16px;
        }

        .category-card {
          min-height: 210px;

          display: block;

          padding: 21px;

          border: 1px solid #e2e8f0;
          border-radius: 20px;

          background: #ffffff;

          text-align: left;

          cursor: pointer;

          box-shadow:
            0 10px 30px rgba(15,23,42,.04);

          transition:
            transform .22s ease,
            box-shadow .22s ease,
            border-color .22s ease;
        }

        .category-card:hover {
          transform: translateY(-6px);

          border-color: #bfdbfe;

          box-shadow:
            0 22px 48px rgba(15,23,42,.10);
        }

        .category-icon {
          width: 55px;
          height: 55px;

          display: grid;
          place-items: center;

          border-radius: 16px;

          font-size: 26px;
        }

        .category-content h3 {
          margin: 18px 0 6px;

          color: #0f172a;

          font-size: 17px;
          font-weight: 950;
        }

        .category-content p {
          min-height: 44px;

          margin: 0;

          color: #64748b;

          font-size: 12px;
          line-height: 1.6;
        }

        .category-content > span {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          margin-top: 14px;

          color: #2563eb;

          font-size: 12px;
          font-weight: 900;
        }

        /* LIVE PROPERTY SECTIONS */

        .live-section {
          padding: 64px 0;
          background: #ffffff;
        }

        .live-section:nth-of-type(even) {
          background: #f8fafc;
        }

        .live-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 25px;
        }

        .live-heading h2 {
          margin: 0;

          color: #0f172a;

          font-size:
            clamp(27px, 4vw, 38px);

          letter-spacing: -1.2px;
          line-height: 1.1;
          font-weight: 950;
        }

        .live-heading p {
          margin: 8px 0 0;

          color: #64748b;

          font-size: 13px;
        }

        .live-controls {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .live-controls button {
          min-width: 40px;
          height: 40px;

          display: grid;
          place-items: center;

          border: 1px solid #dbe3ed;
          border-radius: 10px;

          background: #ffffff;
          color: #1d4ed8;

          font-weight: 900;

          cursor: pointer;
        }

        .live-controls button:hover {
          background: #eff6ff;
        }

        .live-controls .view-all-link {
          width: auto;

          padding: 0 13px;

          font-size: 11px;
        }

        .live-property-track {
          display: flex;

          gap: 18px;

          overflow-x: auto;

          scroll-behavior: smooth;

          scrollbar-width: none;

          padding:
            3px 3px 18px;
        }

        .live-property-track::-webkit-scrollbar {
          display: none;
        }

        .live-property-card {
          flex: 0 0 310px;

          overflow: hidden;

          border: 1px solid #e2e8f0;
          border-radius: 19px;

          background: #ffffff;

          box-shadow:
            0 12px 32px rgba(15,23,42,.06);

          cursor: pointer;

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .live-property-card:hover {
          transform: translateY(-7px);

          box-shadow:
            0 22px 45px rgba(15,23,42,.12);
        }

        .property-image-wrap {
          position: relative;

          height: 205px;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #ccfbf1
            );
        }

        .property-image-wrap img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          transition:
            transform .45s ease;
        }

        .live-property-card:hover
        .property-image-wrap img {
          transform: scale(1.07);
        }

        .property-image-gradient {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              to bottom,
              transparent 50%,
              rgba(15,23,42,.38)
            );
        }

        .property-type-badge {
          position: absolute;

          left: 13px;
          top: 13px;

          padding: 6px 9px;

          border-radius: 999px;

          background: rgba(255,255,255,.94);

          color: #1d4ed8;

          font-size: 9px;
          font-weight: 900;
        }

        .property-favorite {
          position: absolute;

          right: 13px;
          top: 13px;

          width: 34px;
          height: 34px;

          display: grid;
          place-items: center;

          border: 0;
          border-radius: 50%;

          background: rgba(255,255,255,.94);

          color: #1e3a8a;

          cursor: pointer;
        }

        .property-image-placeholder {
          width: 100%;
          height: 100%;

          display: grid;
          place-items: center;

          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #cffafe
            );
        }

        .placeholder-building {
          position: relative;

          width: 105px;
          height: 105px;

          padding: 25px 13px 10px;

          border-radius: 6px 6px 0 0;

          background: #ffffff;

          box-shadow:
            0 20px 30px rgba(15,23,42,.12);
        }

        .placeholder-building::before {
          content: "";

          position: absolute;

          top: -22px;
          left: -8px;

          width: 121px;
          height: 34px;

          clip-path: polygon(
            0 100%,
            50% 0,
            100% 100%
          );

          background: #2563eb;
        }

        .placeholder-building span {
          display: inline-block;

          width: 28px;
          height: 24px;

          margin: 3px;

          background: #38bdf8;

          border: 3px solid #93c5fd;
        }

        .property-card-body {
          padding: 16px;
        }

        .property-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          margin-bottom: 8px;
        }

        .property-card-top span {
          overflow: hidden;

          color: #64748b;

          font-size: 10px;
          font-weight: 750;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .property-card-top small {
          flex: 0 0 auto;

          color: #0f766e;

          font-size: 8px;
          font-weight: 950;
        }

        .property-card-body h3 {
          margin: 0;

          overflow: hidden;

          color: #0f172a;

          font-size: 17px;
          font-weight: 900;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .property-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          margin-top: 9px;
        }

        .property-card-meta span {
          padding: 5px 7px;

          border-radius: 6px;

          background: #f1f5f9;

          color: #64748b;

          font-size: 9px;
          font-weight: 750;
        }

        .property-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 14px;
        }

        .property-card-bottom strong {
          color: #1d4ed8;

          font-size: 16px;
          font-weight: 950;
        }

        .property-card-bottom span {
          color: #2563eb;

          font-size: 10px;
          font-weight: 900;
        }

        .property-empty-card {
          min-height: 170px;

          display: flex;
          align-items: center;
          gap: 18px;

          padding: 25px;

          border: 1px dashed #cbd5e1;
          border-radius: 18px;

          background: #f8fafc;
        }

        .empty-icon {
          width: 55px;
          height: 55px;

          display: grid;
          place-items: center;

          flex: 0 0 auto;

          border-radius: 15px;

          background: #dbeafe;

          font-size: 25px;
        }

        .property-empty-card strong {
          color: #0f172a;
          font-size: 16px;
        }

        .property-empty-card p {
          margin: 5px 0 0;

          color: #64748b;

          font-size: 12px;
        }

        /* WHY */

        .why-section {
          background: #ffffff;
        }

        .why-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(380px, .75fr);

          align-items: center;

          gap: 70px;
        }

        .why-content h2 span {
          display: block;
          color: #2563eb;
        }

        .why-description {
          max-width: 610px;

          margin: 17px 0 25px;

          color: #64748b;

          font-size: 14px;
          line-height: 1.8;
        }

        .feature-list {
          display: grid;
          gap: 17px;

          margin-bottom: 25px;
        }

        .feature-item {
          display: flex;
          gap: 13px;
          align-items: flex-start;
        }

        .feature-icon {
          flex: 0 0 auto;

          width: 40px;
          height: 40px;

          display: grid;
          place-items: center;

          border-radius: 12px;

          background: #eff6ff;
          color: #2563eb;

          font-size: 18px;
          font-weight: 950;
        }

        .feature-item h3 {
          margin: 0 0 4px;

          color: #0f172a;

          font-size: 15px;
          font-weight: 900;
        }

        .feature-item p {
          margin: 0;

          color: #64748b;

          font-size: 12px;
          line-height: 1.6;
        }

        .phone-showcase {
          position: relative;

          min-height: 500px;

          display: grid;
          place-items: center;
        }

        .phone-glow {
          position: absolute;

          width: 330px;
          height: 330px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(37,99,235,.15),
              transparent 68%
            );
        }

        .phone-device {
          position: relative;
          z-index: 2;

          width: 285px;
          min-height: 500px;

          padding: 22px 16px 15px;

          border: 8px solid #0f172a;
          border-radius: 38px;

          background: #f8fafc;

          box-shadow:
            0 30px 70px rgba(15,23,42,.22);

          transform: rotate(4deg);
        }

        .phone-notch {
          position: absolute;

          top: 7px;
          left: 50%;

          width: 90px;
          height: 18px;

          border-radius:
            0 0 14px 14px;

          background: #0f172a;

          transform:
            translateX(-50%);
        }

        .phone-header {
          display: flex;
          justify-content: space-between;

          padding: 12px 5px 15px;

          color: #0f172a;

          font-size: 12px;
        }

        .phone-search {
          display: flex;
          gap: 8px;
          align-items: center;

          padding: 11px;

          border-radius: 11px;

          background: #ffffff;
          border: 1px solid #e2e8f0;

          color: #64748b;

          font-size: 10px;
        }

        .phone-property {
          display: flex;
          gap: 10px;

          margin-top: 13px;
          padding: 10px;

          border-radius: 13px;

          background: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .phone-property-image {
          flex: 0 0 auto;

          width: 55px;
          height: 55px;

          display: grid;
          place-items: center;

          overflow: hidden;

          border-radius: 10px;

          background: #dbeafe;

          font-size: 25px;
        }

        .phone-property-image img {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .phone-property strong,
        .phone-property span,
        .phone-property b {
          display: block;
        }

        .phone-property strong {
          overflow: hidden;

          color: #0f172a;

          font-size: 11px;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .phone-property span {
          margin-top: 3px;

          color: #64748b;

          font-size: 9px;
        }

        .phone-property b {
          margin-top: 6px;

          color: #2563eb;

          font-size: 11px;
        }

        .phone-bottom {
          position: absolute;

          left: 14px;
          right: 14px;
          bottom: 12px;

          display: flex;
          justify-content: space-around;

          padding: 10px 4px;

          border-radius: 13px;

          background: #ffffff;
          border: 1px solid #e2e8f0;

          color: #64748b;
        }

        .phone-add {
          width: 31px;
          height: 31px;

          display: grid;
          place-items: center;

          margin-top: -8px;

          border-radius: 50%;

          background: #2563eb;
          color: #ffffff;
        }

        /* MISSION */

        .mission-section {
          position: relative;

          overflow: hidden;

          padding: 82px 0;

          background:
            radial-gradient(
              circle at 15% 10%,
              rgba(34,211,238,.14),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #06132d,
              #0b2855
            );
        }

        .mission-intro {
          max-width: 800px;

          margin: 0 auto 38px;

          text-align: center;
        }

        .mission-intro h2 {
          margin: 0;

          color: #ffffff;

          font-size:
            clamp(32px, 5vw, 48px);

          line-height: 1.08;

          letter-spacing: -1.8px;

          font-weight: 950;
        }

        .mission-intro h2 span {
          display: block;

          background:
            linear-gradient(
              90deg,
              #55d6ff,
              #70e5bd
            );

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;
        }

        .mission-intro p {
          max-width: 680px;

          margin: 15px auto 0;

          color: #bfd0e6;

          font-size: 14px;
          line-height: 1.7;
        }

        .mission-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 18px;
        }

        .mission-card {
          position: relative;

          padding: 31px;

          border: 1px solid rgba(255,255,255,.10);
          border-radius: 21px;

          background: rgba(255,255,255,.06);

          backdrop-filter: blur(12px);
        }

        .mission-card.featured {
          background:
            linear-gradient(
              135deg,
              rgba(37,99,235,.27),
              rgba(15,118,110,.20)
            );
        }

        .mission-icon {
          width: 48px;
          height: 48px;

          display: grid;
          place-items: center;

          margin-bottom: 20px;

          border-radius: 13px;

          background: rgba(255,255,255,.10);

          font-size: 22px;
        }

        .mission-card > span {
          color: #67e8f9;

          font-size: 10px;
          font-weight: 950;

          letter-spacing: 1.3px;
        }

        .mission-card h3 {
          margin: 9px 0 10px;

          color: #ffffff;

          font-size: 22px;
          line-height: 1.25;

          font-weight: 900;
        }

        .mission-card p {
          margin: 0;

          color: #b9cce2;

          font-size: 13px;
          line-height: 1.75;
        }

        /* FOUNDER */

        .founder-section {
          padding: 70px 0;

          background: #ffffff;
        }

        .founder-card {
          position: relative;

          display: grid;

          grid-template-columns:
            120px minmax(0, 1fr);

          gap: 25px;

          padding: 42px;

          overflow: hidden;

          border: 1px solid #dbe5f0;
          border-radius: 25px;

          background:
            linear-gradient(
              135deg,
              #f8fbff,
              #ffffff
            );

          box-shadow:
            0 20px 55px rgba(15,23,42,.07);
        }

        .founder-mark {
          font-size: 120px;
          line-height: .8;

          color: #bfdbfe;

          font-family: Georgia, serif;
        }

        .founder-content h2 {
          max-width: 850px;

          margin: 0;

          color: #0f172a;

          font-size:
            clamp(28px, 4vw, 42px);

          line-height: 1.15;

          letter-spacing: -1.4px;

          font-weight: 950;
        }

        .founder-content p {
          max-width: 850px;

          margin: 15px 0;

          color: #64748b;

          font-size: 14px;
          line-height: 1.8;
        }

        .founder-content strong {
          color: #1d4ed8;
          font-size: 13px;
        }

        /* HOW */

        .center-heading {
          max-width: 760px;

          margin: 0 auto 35px;

          text-align: center;
        }

        .center-heading h2 {
          margin: 0;

          color: #0f172a;

          font-size:
            clamp(30px, 4vw, 43px);

          line-height: 1.1;

          letter-spacing: -1.5px;

          font-weight: 950;
        }

        .center-heading h2 span {
          display: block;
          color: #2563eb;
        }

        .center-heading p {
          margin: 12px auto 0;

          color: #64748b;

          font-size: 14px;
          line-height: 1.7;
        }

        .how-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 18px;
        }

        .how-card {
          position: relative;

          padding: 27px;

          border: 1px solid #e2e8f0;
          border-radius: 20px;

          background: #ffffff;

          box-shadow:
            0 12px 35px rgba(15,23,42,.05);

          transition: .25s ease;
        }

        .how-card:hover {
          transform: translateY(-5px);

          box-shadow:
            0 22px 45px rgba(15,23,42,.09);
        }

        .how-number {
          position: absolute;

          right: 20px;
          top: 16px;

          color: #dbeafe;

          font-size: 35px;
          font-weight: 950;
        }

        .how-icon {
          width: 53px;
          height: 53px;

          display: grid;
          place-items: center;

          border-radius: 14px;

          background: #eff6ff;

          font-size: 24px;
        }

        .how-card h3 {
          margin: 19px 0 7px;

          color: #0f172a;

          font-size: 18px;
          font-weight: 950;
        }

        .how-card p {
          margin: 0;

          color: #64748b;

          font-size: 12px;
          line-height: 1.7;
        }

        /* LOCATIONS */

        .locations-section {
          background: #f8fafc;
        }

        .city-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 13px;
        }

        .city-card {
          min-height: 72px;

          display: flex;
          align-items: center;

          gap: 13px;

          padding: 15px 17px;

          border: 1px solid #e2e8f0;
          border-radius: 15px;

          background: #ffffff;

          color: #0f172a;

          text-align: left;

          cursor: pointer;

          transition: .2s ease;
        }

        .city-card:hover {
          transform: translateY(-3px);

          border-color: #93c5fd;

          box-shadow:
            0 12px 28px rgba(15,23,42,.08);
        }

        .city-number {
          color: #94a3b8;

          font-size: 10px;
          font-weight: 900;
        }

        .city-card strong {
          flex: 1;

          font-size: 14px;
          font-weight: 900;
        }

        .city-arrow {
          color: #2563eb;

          font-size: 18px;
          font-weight: 950;
        }

        /* TRUST */

        .trust-section {
          padding: 75px 0;

          background: #ffffff;
        }

        .trust-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 15px;
        }

        .trust-card {
          padding: 23px;

          border: 1px solid #e2e8f0;
          border-radius: 18px;

          background: #f8fafc;
        }

        .trust-card > div {
          width: 45px;
          height: 45px;

          display: grid;
          place-items: center;

          margin-bottom: 15px;

          border-radius: 12px;

          background: #dbeafe;

          font-size: 20px;
        }

        .trust-card h3 {
          margin: 0 0 7px;

          color: #0f172a;

          font-size: 15px;
          font-weight: 950;
        }

        .trust-card p {
          margin: 0;

          color: #64748b;

          font-size: 11px;
          line-height: 1.7;
        }

        /* ENQUIRY */

        .enquiry-section {
          padding: 20px 0 75px;

          background: #ffffff;
        }

        .enquiry-card {
          position: relative;

          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;

          padding: 42px 46px;

          border-radius: 25px;

          background:
            linear-gradient(
              135deg,
              #123b76,
              #2563eb 60%,
              #0f766e
            );

          box-shadow:
            0 25px 60px rgba(37,99,235,.20);
        }

        .enquiry-decoration {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;
        }

        .enquiry-decoration.one {
          width: 230px;
          height: 230px;

          right: -90px;
          top: -100px;

          background:
            rgba(255,255,255,.10);
        }

        .enquiry-decoration.two {
          width: 160px;
          height: 160px;

          left: 40%;
          bottom: -110px;

          background:
            rgba(53,213,165,.13);
        }

        .enquiry-content,
        .enquiry-actions {
          position: relative;
          z-index: 2;
        }

        .enquiry-label {
          color: #bfdbfe;

          font-size: 10px;
          font-weight: 950;

          letter-spacing: 1.3px;
        }

        .enquiry-content h2 {
          margin: 8px 0;

          color: #ffffff;

          font-size:
            clamp(28px, 4vw, 41px);

          line-height: 1.1;
          font-weight: 950;
        }

        .enquiry-content p {
          max-width: 600px;

          margin: 0;

          color: #dbeafe;

          font-size: 13px;
          line-height: 1.7;
        }

        .enquiry-actions {
          display: flex;

          flex-wrap: wrap;

          gap: 10px;

          flex: 0 0 auto;
        }

        .white-cta {
          border: 0;

          background: #ffffff;

          color: #1d4ed8;

          box-shadow:
            0 9px 24px rgba(0,0,0,.13);
        }

        .white-cta:hover {
          transform: translateY(-2px);
        }

        .glass-cta {
          border: 1px solid rgba(255,255,255,.28);

          background: rgba(255,255,255,.10);

          color: #ffffff;
        }

        .glass-cta:hover {
          transform: translateY(-2px);

          background: rgba(255,255,255,.16);
        }

        /* POST PROPERTY */

        .post-property-section {
          padding: 0 0 75px;

          background: #ffffff;
        }

        .post-property-card {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            360px;

          align-items: center;

          overflow: hidden;

          min-height: 340px;

          border-radius: 25px;

          background: #ffffff;

          border: 1px solid #e2e8f0;

          box-shadow:
            0 18px 50px rgba(15,23,42,.07);
        }

        .post-property-content {
          padding: 42px;
        }

        .post-property-content h2 span {
          color: #2563eb;
        }

        .post-property-content p {
          max-width: 590px;

          margin: 14px 0 23px;

          color: #64748b;

          font-size: 14px;
          line-height: 1.75;
        }

        .post-property-visual {
          position: relative;

          height: 340px;

          overflow: hidden;

          display: grid;
          place-items: center;

          background:
            linear-gradient(
              145deg,
              #dbeafe,
              #bfdbfe 55%,
              #ccfbf1
            );
        }

        .mini-building {
          position: relative;
          z-index: 3;

          width: 190px;
          height: 220px;

          margin-top: 40px;

          background: #ffffff;

          border-radius: 5px 5px 0 0;

          box-shadow:
            20px 18px 35px rgba(15,23,42,.14);
        }

        .mini-roof {
          position: absolute;

          top: -34px;
          left: -16px;

          width: 222px;
          height: 47px;

          clip-path: polygon(
            0 100%,
            50% 0,
            100% 100%
          );

          background:
            linear-gradient(
              135deg,
              #1e3a8a,
              #2563eb
            );
        }

        .mini-body {
          display: grid;

          grid-template-columns:
            repeat(2,1fr);

          gap: 13px;

          padding: 28px 22px;
        }

        .mini-body span {
          height: 47px;

          background: #38bdf8;

          border: 5px solid #93c5fd;
        }

        .mini-circle {
          position: absolute;
          border-radius: 50%;
        }

        .circle-one {
          width: 170px;
          height: 170px;

          left: -70px;
          top: -60px;

          background:
            rgba(37,99,235,.13);
        }

        .circle-two {
          width: 220px;
          height: 220px;

          right: -100px;
          bottom: -90px;

          background:
            rgba(20,184,166,.18);
        }

        /* FAQ */

        .faq-section {
          background: #f8fafc;
        }

        .faq-grid {
          display: grid;

          grid-template-columns:
            .8fr 1.2fr;

          gap: 60px;

          align-items: start;
        }

        .faq-grid > div:first-child h2 {
          margin: 0;

          color: #0f172a;

          font-size:
            clamp(30px, 4vw, 43px);

          line-height: 1.1;

          letter-spacing: -1.5px;

          font-weight: 950;
        }

        .faq-grid > div:first-child h2 span {
          display: block;
          color: #2563eb;
        }

        .faq-grid > div:first-child p {
          max-width: 450px;

          margin: 13px 0 23px;

          color: #64748b;

          font-size: 13px;
          line-height: 1.7;
        }

        .faq-list {
          display: grid;
          gap: 10px;
        }

        .faq-item {
          overflow: hidden;

          border: 1px solid #e2e8f0;
          border-radius: 13px;

          background: #ffffff;
        }

        .faq-item > button {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          padding: 17px;

          border: 0;

          background: transparent;

          color: #0f172a;

          text-align: left;

          font-size: 13px;
          font-weight: 900;

          cursor: pointer;
        }

        .faq-item > button b {
          color: #2563eb;

          font-size: 19px;
        }

        .faq-answer {
          padding: 0 17px 17px;

          color: #64748b;

          font-size: 12px;
          line-height: 1.7;
        }

        /* FINAL */

        .final-home-cta {
          position: relative;

          overflow: hidden;

          padding: 92px 0;

          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(37,99,235,.28),
              transparent 36%
            ),
            linear-gradient(
              135deg,
              #06132d,
              #0b2855
            );

          text-align: center;
        }

        .final-glow {
          position: absolute;

          width: 450px;
          height: 450px;

          left: 50%;
          top: -300px;

          border-radius: 50%;

          background:
            rgba(20,184,166,.12);

          filter: blur(25px);

          transform:
            translateX(-50%);
        }

        .final-cta-content {
          position: relative;
          z-index: 2;
        }

        .section-label.light {
          color: #67e8f9;
        }

        .final-cta-content h2 {
          margin: 9px 0 14px;

          color: #ffffff;

          font-size:
            clamp(38px, 5vw, 58px);

          line-height: 1.04;

          letter-spacing: -2px;

          font-weight: 950;
        }

        .final-cta-content h2 span {
          background:
            linear-gradient(
              90deg,
              #55d6ff,
              #70e5bd
            );

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;
        }

        .final-cta-content p {
          max-width: 650px;

          margin: 0 auto;

          color: #bfd0e6;

          font-size: 15px;
          line-height: 1.7;
        }

        .final-actions {
          display: flex;

          justify-content: center;

          flex-wrap: wrap;

          gap: 11px;

          margin-top: 25px;
        }

        /* FOOTER */

        .prozpo-footer {
          padding: 58px 0 0;

          background: #071226;

          color: #ffffff;
        }

        .footer-main {
          display: grid;

          grid-template-columns:
            1.7fr
            repeat(4, 1fr);

          gap: 38px;

          padding-bottom: 45px;
        }

        .footer-logo {
          color: #ffffff;

          font-size: 27px;
          font-weight: 950;

          letter-spacing: -1px;
        }

        .footer-brand p {
          max-width: 310px;

          margin: 11px 0 17px;

          color: #94a9c3;

          font-size: 12px;
          line-height: 1.7;
        }

        .footer-socials {
          display: flex;
          gap: 7px;
        }

        .footer-socials button,
        .footer-column button {
          border: 0;

          background: transparent;

          color: #94a9c3;

          text-align: left;

          cursor: pointer;
        }

        .footer-socials button {
          padding: 7px 10px;

          border: 1px solid #223452;
          border-radius: 8px;

          font-size: 10px;
        }

        .footer-column {
          display: flex;

          flex-direction: column;

          align-items: flex-start;

          gap: 10px;
        }

        .footer-column h3 {
          margin: 0 0 5px;

          color: #ffffff;

          font-size: 12px;
          font-weight: 900;
        }

        .footer-column button {
          padding: 0;

          font-size: 11px;

          transition: .2s ease;
        }

        .footer-column button:hover,
        .footer-socials button:hover {
          color: #67e8f9;
        }

        .footer-bottom {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 18px 0;

          border-top: 1px solid #1b2a42;

          color: #71859f;

          font-size: 10px;
        }

        /* FLOATING ENQUIRY */

        .floating-enquiry {
          position: fixed;

          z-index: 999;

          right: 20px;
          bottom: 22px;

          display: inline-flex;
          align-items: center;

          gap: 8px;

          min-height: 48px;

          padding: 7px 15px 7px 8px;

          border: 0;
          border-radius: 999px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0f766e
            );

          color: #ffffff;

          box-shadow:
            0 14px 35px rgba(15,23,42,.25);

          cursor: pointer;

          font-weight: 900;

          animation:
            enquiryPulse 2.8s infinite;
        }

        .floating-enquiry-icon {
          width: 35px;
          height: 35px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          background: rgba(255,255,255,.16);
        }

        .floating-enquiry-text {
          padding-right: 3px;

          font-size: 12px;
        }

        /* ANIMATIONS */

        @keyframes prozpoPulse {
          0%,100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.18);
          }
        }

        @keyframes propertyFloat {
          0%,100% {
            transform:
              perspective(1000px)
              rotateY(-4deg)
              translateY(0);
          }

          50% {
            transform:
              perspective(1000px)
              rotateY(-4deg)
              translateY(-8px);
          }
        }

        @keyframes cardFloat {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes cardFloatReverse {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(7px);
          }
        }

        @keyframes cloudMove {
          0% {
            margin-left: -10px;
          }

          50% {
            margin-left: 12px;
          }

          100% {
            margin-left: -10px;
          }
        }

        @keyframes windowGlow {
          0%,100% {
            filter: brightness(1);
          }

          50% {
            filter: brightness(1.15);
          }
        }

        @keyframes enquiryPulse {
          0%,100% {
            box-shadow:
              0 14px 35px rgba(15,23,42,.25);
          }

          50% {
            box-shadow:
              0 14px 35px rgba(37,99,235,.34),
              0 0 0 7px rgba(37,99,235,.07);
          }
        }

        /* TABLET */

        @media (max-width: 1050px) {
          .hero-container {
            grid-template-columns: 1fr;
          }

          .hero-copy {
            max-width: 850px;

            margin: 0 auto;

            text-align: center;
          }

          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-popular,
          .hero-actions,
          .hero-mini-trust {
            justify-content: center;
          }

          .hero-property-area {
            max-width: 600px;

            width: 100%;

            margin: 5px auto 0;
          }

          .category-grid {
            grid-template-columns:
              repeat(2, minmax(0,1fr));
          }

          .why-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .why-content {
            max-width: 750px;

            margin: 0 auto;

            text-align: center;
          }

          .why-description {
            margin-left: auto;
            margin-right: auto;
          }

          .feature-item {
            text-align: left;
          }

          .phone-showcase {
            min-height: 510px;
          }

          .city-grid {
            grid-template-columns:
              repeat(2, minmax(0,1fr));
          }

          .trust-grid {
            grid-template-columns:
              repeat(2, minmax(0,1fr));
          }

          .footer-main {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .footer-brand {
            grid-column: 1 / -1;
          }
        }

        /* MOBILE */

        @media (max-width: 760px) {
          .prozpo-container {
            padding-left: 15px;
            padding-right: 15px;
          }

          .prozpo-hero {
            padding: 45px 0 55px;
          }

          .hero-copy h1 {
            font-size:
              clamp(39px, 11vw, 55px);

            letter-spacing: -2px;
          }

          .hero-description {
            font-size: 14px;
          }

          .hero-search-card {
            text-align: left;
            border-radius: 16px;
          }

          .search-tabs {
            overflow-x: auto;
            padding-bottom: 9px;
          }

          .search-tab {
            flex: 0 0 auto;
            white-space: nowrap;
          }

          .search-fields {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .search-divider {
            display: none;
          }

          .search-field {
            width: 100%;
          }

          .hero-search-button {
            width: 100%;
          }

          .hero-property-area {
            min-height: 455px;
            margin-top: 25px;
          }

          .property-visual-card {
            transform: none;
          }

          .property-scene {
            height: 285px;
          }

          .building-main {
            left: 54px;
            bottom: 42px;

            transform: scale(.82);

            transform-origin:
              bottom left;
          }

          .building-side {
            right: 4px;
            bottom: 42px;

            transform:
              skewY(-8deg)
              scale(.72);

            transform-origin:
              bottom right;
          }

          .scene-tree.tree-one {
            left: 10px;

            transform: scale(.72);

            transform-origin:
              bottom left;
          }

          .scene-tree.tree-two {
            right: -13px;
            transform: scale(.62);
          }

          .floating-property-card {
            left: -2px;
            bottom: 25px;

            min-width: 205px;
          }

          .floating-price-card {
            right: -2px;
            top: 65px;
          }

          .stats-grid {
            grid-template-columns:
              1fr 1fr;

            gap: 22px 10px;

            padding-top: 27px;
            padding-bottom: 27px;
          }

          .stat-separator {
            display: none;
          }

          .stat-item strong {
            font-size: 23px;
          }

          .home-section {
            padding: 58px 0;
          }

          .section-heading-row {
            align-items: flex-start;

            flex-direction: column;
          }

          .outline-button {
            width: 100%;
          }

          .category-grid {
            grid-template-columns:
              1fr 1fr;

            gap: 11px;
          }

          .category-card {
            min-height: 200px;

            padding: 16px;
          }

          .category-content h3 {
            font-size: 15px;
          }

          .category-content p {
            min-height: 62px;
            font-size: 11px;
          }

          .live-section {
            padding: 53px 0;
          }

          .live-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .live-controls {
            width: 100%;
          }

          .live-controls button {
            flex: 0 0 auto;
          }

          .live-controls .view-all-link {
            margin-left: auto;
          }

          .live-property-card {
            flex-basis: 82vw;
          }

          .property-empty-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .phone-device {
            transform: rotate(0);
          }

          .mission-section {
            padding: 65px 0;
          }

          .mission-grid {
            grid-template-columns: 1fr;
          }

          .founder-card {
            grid-template-columns: 1fr;

            padding: 28px;
          }

          .founder-mark {
            height: 55px;

            font-size: 85px;
          }

          .how-grid {
            grid-template-columns: 1fr;
          }

          .city-grid {
            grid-template-columns: 1fr;
          }

          .trust-grid {
            grid-template-columns: 1fr;
          }

          .enquiry-card {
            flex-direction: column;

            align-items: flex-start;

            padding: 31px 23px;
          }

          .enquiry-actions {
            width: 100%;
          }

          .enquiry-actions button {
            flex: 1;
          }

          .post-property-card {
            grid-template-columns: 1fr;
          }

          .post-property-content {
            padding: 31px 23px;
          }

          .post-property-visual {
            height: 285px;
          }

          .faq-grid {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .final-home-cta {
            padding: 75px 0;
          }

          .footer-main {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 30px;
          }

          .footer-brand {
            grid-column: 1 / -1;
          }

          .footer-bottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .floating-enquiry {
            right: 12px;
            bottom: 15px;
          }
        }

        @media (max-width: 500px) {
          .hero-badge {
            font-size: 8px;
            letter-spacing: .7px;
          }

          .hero-actions {
            flex-direction: column;
          }

          .hero-actions button {
            width: 100%;
          }

          .hero-mini-trust {
            gap: 8px;
            font-size: 9px;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .category-card {
            min-height: auto;
          }

          .hero-property-area {
            min-height: 420px;
          }

          .property-visual-card {
            width: 100%;
          }

          .property-scene {
            height: 255px;
          }

          .building-main {
            left: 40px;

            transform: scale(.68);
          }

          .building-side {
            right: -13px;

            transform:
              skewY(-8deg)
              scale(.58);
          }

          .scene-sun {
            right: 28px;

            width: 54px;
            height: 54px;
          }

          .floating-property-card {
            left: -3px;
            bottom: 18px;

            min-width: 185px;

            padding: 9px;
          }

          .floating-price-card {
            right: -3px;
            top: 52px;

            min-width: 125px;

            padding: 9px;
          }

          .floating-price-card strong {
            font-size: 14px;
          }

          .visual-bottom {
            padding: 14px;
          }

          .visual-property-info strong {
            font-size: 13px;
          }

          .visual-listing-count strong {
            font-size: 20px;
          }

          .phone-device {
            width: 270px;
          }

          .enquiry-actions {
            flex-direction: column;
          }

          .enquiry-actions button {
            width: 100%;
          }

          .final-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .final-actions button {
            width: 100%;
          }

          .floating-enquiry-text {
            display: none;
          }

          .floating-enquiry {
            width: 50px;
            height: 50px;

            justify-content: center;

            padding: 5px;
          }

          .floating-enquiry-icon {
            width: 40px;
            height: 40px;
          }

          .footer-main {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .prozpo-home *,
          .prozpo-home *::before,
          .prozpo-home *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }

          .home-reveal {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}

export default Home;
