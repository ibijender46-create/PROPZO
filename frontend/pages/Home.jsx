import React, { useMemo, useState } from "react";

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
    text: "Find homes, apartments and villas",
    type: "Buy",
    color: "#2563eb",
  },
  {
    icon: "🔑",
    title: "Rent Property",
    text: "Find rental homes and apartments",
    type: "Rent",
    color: "#0f766e",
  },
  {
    icon: "🏢",
    title: "Commercial",
    text: "Shops, offices and commercial spaces",
    type: "Commercial",
    color: "#7c3aed",
  },
  {
    icon: "📍",
    title: "Plots",
    text: "Residential and commercial plots",
    type: "Plots",
    color: "#ea580c",
  },
];

const FEATURES = [
  {
    icon: "✓",
    title: "Verified Properties",
    text: "Discover genuine property listings from owners, agents and builders.",
  },
  {
    icon: "⚡",
    title: "Fast Enquiries",
    text: "Connect directly with property owners and real-estate professionals.",
  },
  {
    icon: "🔒",
    title: "Trusted Marketplace",
    text: "A simple, transparent and secure property discovery experience.",
  },
];

function goToHash(path) {
  window.location.hash = path;
}

function Home() {
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState(
    "All Property Types"
  );
  const [activeTab, setActiveTab] = useState("Buy");

  const filteredLocations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return POPULAR_LOCATIONS;
    }

    return POPULAR_LOCATIONS.filter((location) =>
      location.toLowerCase().includes(value)
    );
  }, [search]);

  function handleSearch() {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("location", search.trim());
    }

    if (propertyType !== "All Property Types") {
      params.set("type", propertyType);
    }

    params.set("mode", activeTab.toLowerCase());

    goToHash(`search?${params.toString()}`);
  }

  function handleCategory(type) {
    const params = new URLSearchParams();

    params.set("mode", type.toLowerCase());

    goToHash(`search?${params.toString()}`);
  }

  function handleLocation(location) {
    setSearch(location);

    const params = new URLSearchParams();

    params.set("location", location);
    params.set("mode", activeTab.toLowerCase());

    goToHash(`search?${params.toString()}`);
  }

  function handleEnquiry() {
    goToHash("my-enquiries");
  }

  return (
    <main className="prozpo-home">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="prozpo-hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-grid-pattern" />

        <div className="prozpo-container hero-container">

          <div className="hero-copy">

            <div className="hero-badge">
              <span className="hero-badge-dot" />
              INDIA'S SMART REAL ESTATE MARKETPLACE
            </div>

            <h1>
              Find Your
              <span> Perfect Property</span>
            </h1>

            <p className="hero-description">
              Buy, rent, sell and discover properties from
              owners, agents and builders — all in one trusted
              marketplace.
            </p>

            {/* SEARCH */}
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
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="search-fields">

                <div className="search-field location-field">
                  <div className="search-icon">⌕</div>

                  <div className="search-field-content">
                    <label>Location</label>

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      placeholder="City, locality or area"
                    />
                  </div>
                </div>

                <div className="search-divider" />

                <div className="search-field type-field">
                  <div className="search-icon">⌂</div>

                  <div className="search-field-content">
                    <label>Property Type</label>

                    <select
                      value={propertyType}
                      onChange={(event) =>
                        setPropertyType(event.target.value)
                      }
                    >
                      {PROPERTY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
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

            {/* POPULAR */}
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
                        handleLocation(location)
                      }
                    >
                      {location}
                    </button>
                  ))}
              </div>
            </div>

            {/* HERO CTA */}
            <div className="hero-actions">
              <button
                type="button"
                className="primary-cta"
                onClick={() => goToHash("search")}
              >
                Explore Properties
                <span>→</span>
              </button>

              <button
                type="button"
                className="secondary-cta"
                onClick={() =>
                  goToHash("post-property")
                }
              >
                Post Your Property
              </button>
            </div>

          </div>

          {/* =================================================
              PROPERTY VISUAL
          ================================================= */}
          <div className="hero-property-area">

            <div className="property-glow" />

            <div className="property-visual-card">

              <div className="visual-top-bar">
                <div className="live-status">
                  <span />
                  LIVE LISTINGS
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
                  <span>FEATURED PROPERTY</span>

                  <strong>
                    Your Next Property
                  </strong>

                  <small>
                    Starts with PROZPO
                  </small>
                </div>

                <div className="visual-listing-count">
                  <strong>10K+</strong>
                  <span>Listings</span>
                </div>

              </div>
            </div>

            <div className="floating-property-card">

              <div className="floating-property-icon">
                🏡
              </div>

              <div>
                <strong>
                  Find your dream home
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
              <span>PROPERTY VALUE</span>
              <strong>₹ 85 Lakh</strong>
              <small>Delhi NCR</small>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST STATS
      ===================================================== */}
      <section className="stats-section">
        <div className="prozpo-container stats-grid">

          <div className="stat-item">
            <strong>10K+</strong>
            <span>Property Listings</span>
          </div>

          <div className="stat-separator" />

          <div className="stat-item">
            <strong>5K+</strong>
            <span>Verified Owners</span>
          </div>

          <div className="stat-separator" />

          <div className="stat-item">
            <strong>1K+</strong>
            <span>Agents & Brokers</span>
          </div>

          <div className="stat-separator" />

          <div className="stat-item">
            <strong>500+</strong>
            <span>Builders & Projects</span>
          </div>

        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}
      <section className="home-section categories-section">

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
                Explore properties across residential,
                rental, commercial and plot categories.
              </p>
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={() => goToHash("search")}
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
                  handleCategory(category.type)
                }
              >
                <div
                  className="category-icon"
                  style={{
                    background:
                      `${category.color}14`,
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

      {/* =====================================================
          WHY PROZPO
      ===================================================== */}
      <section className="home-section why-section">

        <div className="prozpo-container why-grid">

          <div className="why-content">

            <span className="section-label">
              WHY PROZPO
            </span>

            <h2>
              A Smarter Way
              <span> To Find Property</span>
            </h2>

            <p className="why-description">
              PROZPO brings property owners, buyers,
              tenants, agents, brokers and builders
              together on one modern marketplace.
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
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
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

              <div className="phone-property">

                <div className="phone-property-image">
                  🏢
                </div>

                <div>
                  <strong>
                    Premium Property
                  </strong>

                  <span>
                    Delhi NCR
                  </span>

                  <b>
                    ₹85 Lakh
                  </b>
                </div>

              </div>

              <div className="phone-property">

                <div className="phone-property-image villa">
                  🏡
                </div>

                <div>
                  <strong>
                    Luxury Villa
                  </strong>

                  <span>
                    Gurgaon
                  </span>

                  <b>
                    ₹1.25 Cr
                  </b>
                </div>

              </div>

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

      {/* =====================================================
          POPULAR LOCATIONS
      ===================================================== */}
      <section className="home-section locations-section">

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
                Find properties in India's major
                real-estate markets.
              </p>
            </div>

          </div>

          <div className="city-grid">

            {POPULAR_LOCATIONS.map(
              (location, index) => (
                <button
                  type="button"
                  key={location}
                  className="city-card"
                  onClick={() =>
                    handleLocation(location)
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

      {/* =====================================================
          ENQUIRY CTA
      ===================================================== */}
      <section className="enquiry-section">

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
                and connect with the right property
                professionals.
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

      {/* =====================================================
          POST PROPERTY
      ===================================================== */}
      <section className="post-property-section">

        <div className="prozpo-container">

          <div className="post-property-card">

            <div className="post-property-content">

              <span className="section-label">
                FOR OWNERS • AGENTS • BUILDERS
              </span>

              <h2>
                Have a Property to
                <span> Sell or Rent?</span>
              </h2>

              <p>
                List your property on PROZPO
                and connect with genuine property
                seekers.
              </p>

              <button
                type="button"
                className="primary-cta"
                onClick={() =>
                  goToHash("post-property")
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

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="final-home-cta">

        <div className="final-glow" />

        <div className="prozpo-container final-cta-content">

          <span className="section-label light">
            START YOUR PROPERTY JOURNEY
          </span>

          <h2>
            Search Smarter.
            <br />
            <span>Discover Better.</span>
          </h2>

          <p>
            Your next home, investment or business
            property could be just one search away.
          </p>

          <div className="final-actions">

            <button
              type="button"
              className="white-cta"
              onClick={() => goToHash("search")}
            >
              Start Searching
              <span>→</span>
            </button>

            <button
              type="button"
              className="glass-cta"
              onClick={() =>
                goToHash("post-property")
              }
            >
              Post Property
            </button>

          </div>

        </div>
      </section>

      {/* =====================================================
          FLOATING ENQUIRY BUTTON
      ===================================================== */}
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

      {/* =====================================================
          COMPLETE HOME CSS
      ===================================================== */}
      <style>{`

        .prozpo-home {
          --primary: #2563eb;
          --primary-dark: #1d4ed8;
          --navy: #07152f;
          --navy-2: #0b2855;
          --teal: #14b8a6;
          --green: #35d5a5;
          --text: #0f172a;
          --muted: #64748b;
          --border: #e2e8f0;
          --soft: #f8fafc;
          width: 100%;
          min-height: 100vh;
          background: #ffffff;
          color: var(--text);
          overflow-x: hidden;
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

        /* HERO */

        .prozpo-hero {
          position: relative;
          overflow: hidden;
          padding: 76px 0 92px;
          background:
            radial-gradient(
              circle at 85% 15%,
              rgba(37,99,235,.28),
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
          gap: 54px;
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
          opacity: .08;
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
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 90%
          );
        }

        .hero-copy {
          position: relative;
          z-index: 2;
          max-width: 760px;
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
          animation: prozpoPulse 1.8s infinite;
        }

        .hero-copy h1 {
          margin: 24px 0 18px;
          color: #ffffff;
          font-size: clamp(46px, 5.8vw, 72px);
          line-height: 1.02;
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
          font-size: 18px;
          line-height: 1.75;
        }

        .hero-search-card {
          margin-top: 30px;
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
          box-shadow: 0 5px 16px rgba(0,0,0,.12);
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

        .search-field-content select {
          cursor: pointer;
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
          box-shadow:
            0 14px 30px rgba(37,99,235,.36);
        }

        .hero-search-button span {
          font-size: 19px;
        }

        .hero-popular {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 15px;
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
          margin-top: 20px;
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

        .primary-cta.compact {
          margin-top: 4px;
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

        /* PROPERTY VISUAL */

        .hero-property-area {
          position: relative;
          min-height: 560px;
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
          transform: perspective(1000px)
            rotateY(-4deg);
          animation: propertyFloat 5s ease-in-out infinite;
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
          box-shadow: 0 0 13px #35d5a5;
        }

        .visual-dots {
          color: #a9c0dc;
          letter-spacing: 3px;
        }

        .property-scene {
          position: relative;
          height: 355px;
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
          filter: blur(.3px);
          animation: cloudMove 8s linear infinite;
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
          animation: windowGlow 3s ease-in-out infinite;
        }

        .building-window:nth-child(2) {
          animation-delay: -.8s;
        }

        .building-window:nth-child(4) {
          animation-delay: -1.4s;
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
          grid-template-columns: 1fr 1fr;
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
          border-radius: 50% 50% 0 0;
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

        .visual-listing-count strong,
        .visual-listing-count span {
          display: block;
        }

        .visual-listing-count strong {
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
          bottom: 60px;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 235px;
          padding: 12px 14px;
          border-radius: 15px;
          animation: cardFloat 4s ease-in-out infinite;
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
          animation: cardFloatReverse 4.5s ease-in-out infinite;
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
          min-height: 126px;
          display: grid;
          grid-template-columns:
            1fr auto
            1fr auto
            1fr auto
            1fr;
          align-items: center;
          gap: 24px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-item strong,
        .stat-item span {
          display: block;
        }

        .stat-item strong {
          color: #0f172a;
          font-size: 28px;
          font-weight: 950;
        }

        .stat-item span {
          margin-top: 4px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .stat-separator {
          width: 1px;
          height: 45px;
          background: #e2e8f0;
        }

        /* COMMON */

        .home-section {
          padding: 82px 0;
        }

        .section-heading-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 32px;
        }

        .section-label {
          display: inline-block;
          margin-bottom: 8px;
          color: #2563eb;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 1.4px;
        }

        .section-heading-row h2,
        .why-content h2,
        .post-property-content h2 {
          margin: 0;
          color: #0f172a;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.1;
          letter-spacing: -1.5px;
          font-weight: 950;
        }

        .section-heading-row p {
          max-width: 620px;
          margin: 10px 0 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
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
          gap: 18px;
        }

        .category-card {
          min-height: 225px;
          display: block;
          padding: 22px;
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
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          font-size: 27px;
        }

        .category-content h3 {
          margin: 20px 0 7px;
          color: #0f172a;
          font-size: 18px;
          font-weight: 950;
        }

        .category-content p {
          min-height: 48px;
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.65;
        }

        .category-content > span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 900;
        }

        .category-content b {
          font-size: 16px;
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
          gap: 80px;
        }

        .why-content h2 span {
          display: block;
          color: #2563eb;
        }

        .why-description {
          max-width: 610px;
          margin: 18px 0 27px;
          color: #64748b;
          font-size: 15px;
          line-height: 1.8;
        }

        .feature-list {
          display: grid;
          gap: 18px;
          margin-bottom: 28px;
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
          font-size: 13px;
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
          filter: blur(4px);
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
          border-radius: 0 0 14px 14px;
          background: #0f172a;
          transform: translateX(-50%);
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
          border-radius: 10px;
          background: #dbeafe;
          font-size: 25px;
        }

        .phone-property-image.villa {
          background: #dcfce7;
        }

        .phone-property strong,
        .phone-property span,
        .phone-property b {
          display: block;
        }

        .phone-property strong {
          color: #0f172a;
          font-size: 11px;
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
          min-height: 76px;
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

        /* ENQUIRY */

        .enquiry-section {
          padding: 20px 0 82px;
          background: #f8fafc;
        }

        .enquiry-card {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          padding: 45px 48px;
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
          background: rgba(255,255,255,.10);
        }

        .enquiry-decoration.two {
          width: 160px;
          height: 160px;
          left: 40%;
          bottom: -110px;
          background: rgba(53,213,165,.13);
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
          margin: 9px 0 9px;
          color: #ffffff;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.1;
          font-weight: 950;
        }

        .enquiry-content p {
          max-width: 620px;
          margin: 0;
          color: #dbeafe;
          font-size: 14px;
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
          padding: 0 0 82px;
          background: #f8fafc;
        }

        .post-property-card {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            360px;
          align-items: center;
          overflow: hidden;
          min-height: 360px;
          border-radius: 26px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow:
            0 18px 50px rgba(15,23,42,.07);
        }

        .post-property-content {
          padding: 45px;
        }

        .post-property-content h2 span {
          color: #2563eb;
        }

        .post-property-content p {
          max-width: 590px;
          margin: 15px 0 24px;
          color: #64748b;
          font-size: 15px;
          line-height: 1.75;
        }

        .post-property-visual {
          position: relative;
          height: 360px;
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
          grid-template-columns: repeat(2,1fr);
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
          background: rgba(37,99,235,.13);
        }

        .circle-two {
          width: 220px;
          height: 220px;
          right: -100px;
          bottom: -90px;
          background: rgba(20,184,166,.18);
        }

        /* FINAL */

        .final-home-cta {
          position: relative;
          overflow: hidden;
          padding: 100px 0;
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
          background: rgba(20,184,166,.12);
          filter: blur(25px);
          transform: translateX(-50%);
        }

        .final-cta-content {
          position: relative;
          z-index: 2;
        }

        .section-label.light {
          color: #67e8f9;
        }

        .final-cta-content h2 {
          margin: 10px 0 15px;
          color: #ffffff;
          font-size: clamp(38px, 5vw, 58px);
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
          font-size: 16px;
          line-height: 1.7;
        }

        .final-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 27px;
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
          animation: enquiryPulse 2.8s infinite;
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
          .hero-actions {
            justify-content: center;
          }

          .hero-property-area {
            max-width: 600px;
            width: 100%;
            margin: 10px auto 0;
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

          .post-property-card {
            grid-template-columns: 1fr 300px;
          }

        }

        /* MOBILE */

        @media (max-width: 760px) {

          .prozpo-container {
            padding-left: 15px;
            padding-right: 15px;
          }

          .prozpo-hero {
            padding: 48px 0 60px;
          }

          .hero-copy h1 {
            font-size: clamp(39px, 11vw, 56px);
            letter-spacing: -2px;
          }

          .hero-description {
            font-size: 15px;
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
            min-height: 470px;
            margin-top: 30px;
          }

          .property-visual-card {
            transform: none;
          }

          .property-scene {
            height: 300px;
          }

          .building-main {
            left: 54px;
            bottom: 42px;
            transform: scale(.82);
            transform-origin: bottom left;
          }

          .building-side {
            right: 4px;
            bottom: 42px;
            transform:
              skewY(-8deg)
              scale(.72);
            transform-origin: bottom right;
          }

          .scene-tree.tree-one {
            left: 10px;
            transform: scale(.72);
            transform-origin: bottom left;
          }

          .scene-tree.tree-two {
            right: -13px;
            transform: scale(.62);
          }

          .floating-property-card {
            left: -2px;
            bottom: 30px;
            min-width: 210px;
          }

          .floating-price-card {
            right: -2px;
            top: 72px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 24px 10px;
            padding-top: 28px;
            padding-bottom: 28px;
          }

          .stat-separator {
            display: none;
          }

          .stat-item strong {
            font-size: 24px;
          }

          .home-section {
            padding: 60px 0;
          }

          .section-heading-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .outline-button {
            width: 100%;
          }

          .category-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .category-card {
            min-height: 205px;
            padding: 17px;
          }

          .category-content h3 {
            font-size: 16px;
          }

          .category-content p {
            min-height: 65px;
            font-size: 12px;
          }

          .phone-device {
            transform: rotate(0);
          }

          .city-grid {
            grid-template-columns: 1fr;
          }

          .enquiry-section {
            padding-bottom: 60px;
          }

          .enquiry-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 32px 24px;
          }

          .enquiry-actions {
            width: 100%;
          }

          .enquiry-actions button {
            flex: 1;
          }

          .post-property-section {
            padding-bottom: 60px;
          }

          .post-property-card {
            grid-template-columns: 1fr;
          }

          .post-property-content {
            padding: 32px 24px;
          }

          .post-property-visual {
            height: 290px;
          }

          .final-home-cta {
            padding: 75px 0;
          }

          .floating-enquiry {
            right: 12px;
            bottom: 15px;
          }

        }

        @media (max-width: 500px) {

          .hero-badge {
            font-size: 9px;
            letter-spacing: .8px;
          }

          .hero-actions {
            flex-direction: column;
          }

          .hero-actions button {
            width: 100%;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .category-card {
            min-height: auto;
          }

          .hero-property-area {
            min-height: 430px;
          }

          .property-visual-card {
            width: 100%;
          }

          .property-scene {
            height: 260px;
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
            bottom: 20px;
            min-width: 190px;
            padding: 10px;
          }

          .floating-price-card {
            right: -3px;
            top: 54px;
            min-width: 128px;
            padding: 10px;
          }

          .floating-price-card strong {
            font-size: 15px;
          }

          .visual-bottom {
            padding: 15px;
          }

          .visual-property-info strong {
            font-size: 14px;
          }

          .visual-listing-count strong {
            font-size: 21px;
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
        }

        @media (prefers-reduced-motion: reduce) {

          .prozpo-home *,
          .prozpo-home *::before,
          .prozpo-home *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }

        }

      `}</style>
    </main>
  );
}

export default Home;
