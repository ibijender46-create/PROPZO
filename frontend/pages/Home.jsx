import React, { useMemo, useState } from "react";

function Home() {
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("All Property Types");
  const [activeTab, setActiveTab] = useState("Buy");

  const categories = [
    {
      icon: "🏠",
      title: "Buy Property",
      text: "Find homes, apartments and villas",
      type: "Buy",
    },
    {
      icon: "🔑",
      title: "Rent Property",
      text: "Find rental homes and apartments",
      type: "Rent",
    },
    {
      icon: "🏢",
      title: "Commercial",
      text: "Shops, offices and commercial spaces",
      type: "Commercial",
    },
    {
      icon: "📍",
      title: "Plots",
      text: "Residential and commercial plots",
      type: "Plots",
    },
  ];

  const features = [
    {
      icon: "✓",
      title: "Verified Properties",
      text: "Discover genuine property listings from owners, agents and builders.",
    },
    {
      icon: "⚡",
      title: "Fast Enquiries",
      text: "Connect directly with property owners and professionals.",
    },
    {
      icon: "🔒",
      title: "Trusted Marketplace",
      text: "Built to make property discovery simple, transparent and secure.",
    },
  ];

  const popularLocations = [
    "Mumbai",
    "Delhi NCR",
    "Noida",
    "Ghaziabad",
    "Gurgaon",
    "Bangalore",
    "Pune",
    "Hyderabad",
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("location", search.trim());
    }

    if (propertyType !== "All Property Types") {
      params.set("type", propertyType);
    }

    params.set("mode", activeTab.toLowerCase());

    window.location.hash = `search?${params.toString()}`;
  };

  const handleCategory = (type) => {
    const params = new URLSearchParams();
    params.set("mode", type.toLowerCase());

    window.location.hash = `search?${params.toString()}`;
  };

  const filteredLocations = useMemo(() => {
    if (!search.trim()) return popularLocations;

    return popularLocations.filter((location) =>
      location.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroGlowOne}></div>
        <div style={styles.heroGlowTwo}></div>

        <div style={styles.heroInner}>
          <div style={styles.heroContent}>
            <div style={styles.badge}>
              <span style={styles.badgeDot}></span>
              INDIA'S REAL ESTATE MARKETPLACE
            </div>

            <h1 style={styles.heroTitle}>
              Find Your
              <br />
              <span style={styles.heroHighlight}>Perfect Property</span>
            </h1>

            <p style={styles.heroText}>
              Buy, rent, sell and discover properties from owners,
              agents and builders — all in one place.
            </p>

            {/* SEARCH PANEL */}
            <div style={styles.searchPanel}>
              <div style={styles.tabs}>
                {["Buy", "Rent", "Commercial", "Plots"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      ...styles.tab,
                      ...(activeTab === tab ? styles.activeTab : {}),
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div style={styles.searchRow}>
                <div style={styles.searchField}>
                  <span style={styles.fieldIcon}>⌕</span>
                  <div style={styles.fieldContent}>
                    <span style={styles.fieldLabel}>Location</span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="City, locality or area"
                      style={styles.searchInput}
                    />
                  </div>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.selectField}>
                  <span style={styles.fieldIcon}>🏠</span>
                  <div style={styles.fieldContent}>
                    <span style={styles.fieldLabel}>Property Type</span>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      style={styles.select}
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
                </div>

                <button
                  onClick={handleSearch}
                  style={styles.searchButton}
                >
                  <span>Search</span>
                  <span style={styles.searchArrow}>→</span>
                </button>
              </div>
            </div>

            {/* POPULAR LOCATIONS */}
            <div style={styles.popular}>
              <span style={styles.popularTitle}>Popular:</span>

              <div style={styles.locationList}>
                {filteredLocations.slice(0, 6).map((location) => (
                  <button
                    key={location}
                    onClick={() => {
                      setSearch(location);
                    }}
                    style={styles.locationButton}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div style={styles.heroVisual}>
            <div style={styles.visualCard}>
              <div style={styles.visualTop}>
                <span style={styles.liveBadge}>
                  <span style={styles.liveDot}></span>
                  LIVE LISTINGS
                </span>

                <span style={styles.visualMenu}>•••</span>
              </div>

              <div style={styles.buildingIllustration}>
                <div style={styles.sun}></div>

                <div style={styles.building}>
                  <div style={styles.buildingRoof}></div>

                  <div style={styles.buildingBody}>
                    {[1, 2, 3, 4].map((row) => (
                      <div key={row} style={styles.buildingRow}>
                        {[1, 2, 3].map((col) => (
                          <span
                            key={col}
                            style={{
                              ...styles.window,
                              opacity:
                                (row + col) % 2 === 0 ? 1 : 0.7,
                            }}
                          ></span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.ground}></div>
              </div>

              <div style={styles.visualInfo}>
                <div>
                  <strong style={styles.visualTitle}>
                    Your next property
                  </strong>
                  <span style={styles.visualSub}>
                    Starts with PROZPO
                  </span>
                </div>

                <div style={styles.visualCount}>
                  <strong>10K+</strong>
                  <span>Listings</span>
                </div>
              </div>
            </div>

            <div style={styles.floatingCard}>
              <span style={styles.floatingIcon}>🏡</span>
              <div>
                <strong>Find your home</strong>
                <span>Across India</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <section style={styles.statsSection}>
        <div style={styles.statsContainer}>
          <div style={styles.stat}>
            <strong>10K+</strong>
            <span>Property Listings</span>
          </div>

          <div style={styles.statLine}></div>

          <div style={styles.stat}>
            <strong>5K+</strong>
            <span>Verified Owners</span>
          </div>

          <div style={styles.statLine}></div>

          <div style={styles.stat}>
            <strong>1K+</strong>
            <span>Agents & Brokers</span>
          </div>

          <div style={styles.statLine}></div>

          <div style={styles.stat}>
            <strong>500+</strong>
            <span>Builders & Projects</span>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <span style={styles.sectionEyebrow}>EXPLORE</span>
            <h2 style={styles.sectionTitle}>Find Properties Your Way</h2>
            <p style={styles.sectionText}>
              Explore thousands of properties across different categories.
            </p>
          </div>

          <button
            onClick={() => (window.location.hash = "search")}
            style={styles.viewAll}
          >
            View All Properties →
          </button>
        </div>

        <div style={styles.categoryGrid}>
          {categories.map((category) => (
            <button
              key={category.title}
              onClick={() => handleCategory(category.type)}
              style={styles.categoryCard}
            >
              <div style={styles.categoryIcon}>{category.icon}</div>

              <div style={styles.categoryBody}>
                <h3 style={styles.categoryTitle}>{category.title}</h3>
                <p style={styles.categoryText}>{category.text}</p>

                <span style={styles.exploreLink}>
                  Explore <span>→</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* WHY PROZPO */}
      <section style={styles.whySection}>
        <div style={styles.whyContainer}>
          <div style={styles.whyContent}>
            <span style={styles.sectionEyebrow}>WHY PROZPO</span>

            <h2 style={styles.whyTitle}>
              A Smarter Way To
              <span> Find Property</span>
            </h2>

            <p style={styles.whyText}>
              PROZPO brings property owners, buyers, tenants, agents,
              brokers and builders together on one simple marketplace.
            </p>

            <div style={styles.featureList}>
              {features.map((feature) => (
                <div key={feature.title} style={styles.feature}>
                  <div style={styles.featureIcon}>{feature.icon}</div>

                  <div>
                    <h3 style={styles.featureTitle}>
                      {feature.title}
                    </h3>
                    <p style={styles.featureText}>{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.whyVisual}>
            <div style={styles.phoneFrame}>
              <div style={styles.phoneHeader}>
                <strong>PROZPO</strong>
                <span>•••</span>
              </div>

              <div style={styles.phoneSearch}>
                🔍 &nbsp; Search properties
              </div>

              <div style={styles.miniProperty}>
                <div style={styles.miniImage}>🏢</div>

                <div style={styles.miniInfo}>
                  <strong>Premium Property</strong>
                  <span>Delhi NCR</span>
                  <b>₹ 85 Lakh</b>
                </div>
              </div>

              <div style={styles.miniProperty}>
                <div style={styles.miniImage}>🏡</div>

                <div style={styles.miniInfo}>
                  <strong>Luxury Villa</strong>
                  <span>Gurgaon</span>
                  <b>₹ 1.25 Cr</b>
                </div>
              </div>

              <div style={styles.phoneBottom}>
                <span>⌂</span>
                <span>♡</span>
                <span>＋</span>
                <span>◉</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section style={styles.locationSection}>
        <div style={styles.sectionHeader}>
          <div>
            <span style={styles.sectionEyebrow}>LOCATIONS</span>
            <h2 style={styles.sectionTitle}>
              Explore Popular Cities
            </h2>
            <p style={styles.sectionText}>
              Find properties in India's growing real-estate markets.
            </p>
          </div>
        </div>

        <div style={styles.locationGrid}>
          {popularLocations.map((location, index) => (
            <button
              key={location}
              onClick={() => {
                setSearch(location);
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              style={styles.cityCard}
            >
              <span style={styles.cityNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>

              <span style={styles.cityName}>{location}</span>

              <span style={styles.cityArrow}>→</span>
            </button>
          ))}
        </div>
      </section>

      {/* POST PROPERTY CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContainer}>
          <div>
            <span style={styles.ctaBadge}>FOR OWNERS • AGENTS • BUILDERS</span>

            <h2 style={styles.ctaTitle}>
              Have a Property to Sell or Rent?
            </h2>

            <p style={styles.ctaText}>
              List your property on PROZPO and connect with genuine
              property seekers.
            </p>
          </div>

          <button
            onClick={() => (window.location.hash = "post-property")}
            style={styles.ctaButton}
          >
            Post Your Property
            <span>→</span>
          </button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.finalSection}>
        <div style={styles.finalContent}>
          <span style={styles.sectionEyebrow}>START TODAY</span>

          <h2 style={styles.finalTitle}>
            Your Property Journey
            <br />
            Starts Here.
          </h2>

          <p style={styles.finalText}>
            Search smarter. Discover better. Connect directly.
          </p>

          <button
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            style={styles.finalButton}
          >
            Start Searching
            <span>→</span>
          </button>
        </div>
      </section>

      {/* RESPONSIVE CSS */}
      <style>{`
        * {
          box-sizing: border-box;
        }

        button,
        input,
        select {
          font-family: inherit;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        @media (max-width: 1000px) {
          .prozpo-hero-inner {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .prozpo-hero {
            padding: 45px 16px 55px !important;
          }

          .prozpo-search-row {
            flex-direction: column !important;
          }

          .prozpo-divider {
            display: none !important;
          }

          .prozpo-search-field,
          .prozpo-select-field {
            width: 100% !important;
          }

          .prozpo-search-button {
            width: 100% !important;
          }

          .prozpo-stats {
            grid-template-columns: 1fr 1fr !important;
            gap: 22px !important;
          }

          .prozpo-stat-line {
            display: none !important;
          }

          .prozpo-section {
            padding: 65px 16px !important;
          }

          .prozpo-section-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .prozpo-category-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .prozpo-why {
            grid-template-columns: 1fr !important;
          }

          .prozpo-location-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .prozpo-cta {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .prozpo-hero-title {
            font-size: 48px !important;
          }
        }

        @media (max-width: 500px) {
          .prozpo-category-grid,
          .prozpo-location-grid {
            grid-template-columns: 1fr !important;
          }

          .prozpo-hero-title {
            font-size: 40px !important;
          }

          .prozpo-hero-text {
            font-size: 16px !important;
          }

          .prozpo-tabs {
            overflow-x: auto !important;
          }

          .prozpo-tab {
            white-space: nowrap !important;
          }

          .prozpo-floating-card {
            display: none !important;
          }

          .prozpo-visual-card {
            margin-top: 10px !important;
          }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#ffffff",
    color: "#172033",
    overflowX: "hidden",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #07152f 0%, #0c2754 55%, #123d78 100%)",
    padding: "75px 24px 85px",
  },

  heroGlowOne: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(36, 148, 255, 0.15)",
    filter: "blur(20px)",
    top: "-180px",
    right: "-100px",
  },

  heroGlowTwo: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(0, 210, 180, 0.1)",
    filter: "blur(25px)",
    bottom: "-150px",
    left: "-100px",
  },

  heroInner: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1250px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "55px",
    alignItems: "center",
  },

  heroContent: {
    maxWidth: "760px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "9px 14px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#cfe6ff",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.4px",
  },

  badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#35d5a5",
    boxShadow: "0 0 12px rgba(53,213,165,0.8)",
  },

  heroTitle: {
    margin: "24px 0 18px",
    color: "#ffffff",
    fontSize: "68px",
    lineHeight: 1.02,
    letterSpacing: "-2.5px",
    fontWeight: 850,
  },

  heroHighlight: {
    background:
      "linear-gradient(90deg, #55d6ff, #65e0b6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  heroText: {
    maxWidth: "650px",
    margin: 0,
    color: "#c5d5ea",
    fontSize: "18px",
    lineHeight: 1.7,
  },

  searchPanel: {
    marginTop: "34px",
    padding: "10px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.98)",
    boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
  },

  tabs: {
    display: "flex",
    gap: "5px",
    padding: "4px",
    marginBottom: "6px",
  },

  tab: {
    border: "none",
    background: "transparent",
    color: "#657086",
    padding: "9px 15px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  activeTab: {
    background: "#edf5ff",
    color: "#1769d2",
  },

  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px",
  },

  searchField: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1.3,
    minWidth: 0,
    padding: "9px 10px",
  },

  selectField: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: 0,
    padding: "9px 10px",
  },

  fieldIcon: {
    width: "34px",
    height: "34px",
    display: "grid",
    placeItems: "center",
    borderRadius: "9px",
    background: "#edf5ff",
    color: "#1769d2",
    fontSize: "17px",
    flexShrink: 0,
  },

  fieldContent: {
    minWidth: 0,
    flex: 1,
  },

  fieldLabel: {
    display: "block",
    color: "#7b8495",
    fontSize: "10px",
    fontWeight: 700,
    marginBottom: "2px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#182337",
    fontSize: "13px",
    fontWeight: 600,
  },

  select: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#182337",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },

  divider: {
    width: "1px",
    height: "40px",
    background: "#e6eaf0",
  },

  searchButton: {
    border: "none",
    minHeight: "52px",
    padding: "0 20px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #1769d2, #0b54b4)",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(23,105,210,0.25)",
  },

  searchArrow: {
    fontSize: "18px",
  },

  popular: {
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },

  popularTitle: {
    color: "#a9bdd6",
    fontSize: "12px",
    fontWeight: 700,
  },

  locationList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },

  locationButton: {
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "#d7e4f3",
    borderRadius: "20px",
    padding: "6px 11px",
    fontSize: "11px",
    cursor: "pointer",
  },

  heroVisual: {
    position: "relative",
    minHeight: "440px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  visualCard: {
    width: "100%",
    maxWidth: "480px",
    padding: "18px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
  },

  visualTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    color: "#d8f8ee",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#39d7a7",
  },

  visualMenu: {
    color: "#c5d8ed",
    letterSpacing: "2px",
  },

  buildingIllustration: {
    position: "relative",
    height: "285px",
    overflow: "hidden",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg, #6db7e8 0%, #c9e9f6 64%, #b9d9a5 64%, #83ae72 100%)",
  },

  sun: {
    position: "absolute",
    top: "25px",
    right: "35px",
    width: "65px",
    height: "65px",
    borderRadius: "50%",
    background: "#ffe59a",
    boxShadow: "0 0 45px rgba(255,229,154,0.65)",
  },

  building: {
    position: "absolute",
    bottom: "25px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "245px",
  },

  buildingRoof: {
    height: "25px",
    background: "#1c3555",
    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
  },

  buildingBody: {
    background: "#edf2f5",
    padding: "14px",
    border: "5px solid #314c67",
    borderTop: "none",
  },

  buildingRow: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "11px",
  },

  window: {
    width: "43px",
    height: "38px",
    display: "block",
    background: "#68a9cf",
    border: "4px solid #29435e",
    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.3)",
  },

  ground: {
    position: "absolute",
    bottom: "0",
    left: 0,
    right: 0,
    height: "28px",
    background: "#709b62",
  },

  visualInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 4px 3px",
  },

  visualTitle: {
    display: "block",
    color: "#ffffff",
    fontSize: "16px",
    marginBottom: "4px",
  },

  visualSub: {
    display: "block",
    color: "#b8cde3",
    fontSize: "11px",
  },

  visualCount: {
    textAlign: "right",
  },

  visualCountStrong: {
    display: "block",
  },

  visualCount: {
    color: "#ffffff",
  },

  floatingCard: {
    position: "absolute",
    left: "0",
    bottom: "28px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 16px",
    borderRadius: "15px",
    background: "#ffffff",
    boxShadow: "0 18px 45px rgba(0,0,0,0.25)",
  },

  floatingIcon: {
    width: "38px",
    height: "38px",
    display: "grid",
    placeItems: "center",
    borderRadius: "11px",
    background: "#edf6ff",
    fontSize: "19px",
  },

  statsSection: {
    background: "#ffffff",
    borderBottom: "1px solid #edf0f4",
  },

  statsContainer: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "25px 24px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr",
    alignItems: "center",
    gap: "20px",
  },

  stat: {
    textAlign: "center",
  },

  statLine: {
    width: "1px",
    height: "35px",
    background: "#e4e8ed",
  },

  stat: {
    textAlign: "center",
  },

  section: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "85px 24px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "35px",
  },

  sectionEyebrow: {
    display: "block",
    color: "#1769d2",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "1.7px",
    marginBottom: "9px",
  },

  sectionTitle: {
    margin: 0,
    color: "#172033",
    fontSize: "36px",
    lineHeight: 1.15,
    letterSpacing: "-1px",
  },

  sectionText: {
    margin: "10px 0 0",
    color: "#6c7687",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  viewAll: {
    border: "none",
    background: "transparent",
    color: "#1769d2",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "18px",
  },

  categoryCard: {
    textAlign: "left",
    border: "1px solid #e7ebf0",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    cursor: "pointer",
    transition: "all .25s ease",
    boxShadow: "0 8px 30px rgba(18,35,55,0.04)",
  },

  categoryIcon: {
    width: "54px",
    height: "54px",
    display: "grid",
    placeItems: "center",
    borderRadius: "16px",
    background: "#edf5ff",
    fontSize: "25px",
    marginBottom: "22px",
  },

  categoryBody: {},

  categoryTitle: {
    margin: "0 0 7px",
    color: "#1b2638",
    fontSize: "18px",
  },

  categoryText: {
    margin: 0,
    minHeight: "43px",
    color: "#748093",
    fontSize: "13px",
    lineHeight: 1.55,
  },

  exploreLink: {
    display: "inline-flex",
    gap: "7px",
    marginTop: "20px",
    color: "#1769d2",
    fontSize: "12px",
    fontWeight: 800,
  },

  whySection: {
    background: "#f5f8fc",
    padding: "90px 24px",
  },

  whyContainer: {
    maxWidth: "1150px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "70px",
    alignItems: "center",
  },

  whyTitle: {
    margin: 0,
    color: "#172033",
    fontSize: "44px",
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
  },

  whyTitleSpan: {
    color: "#1769d2",
  },

  whyText: {
    maxWidth: "600px",
    color: "#6c7687",
    fontSize: "15px",
    lineHeight: 1.75,
    margin: "18px 0 28px",
  },

  featureList: {
    display: "grid",
    gap: "20px",
  },

  feature: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },

  featureIcon: {
    width: "38px",
    height: "38px",
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: "12px",
    background: "#dff7ed",
    color: "#0b9b6c",
    fontWeight: 900,
  },

  featureTitle: {
    margin: "0 0 5px",
    color: "#1d283a",
    fontSize: "15px",
  },

  featureText: {
    margin: 0,
    color: "#727d8e",
    fontSize: "13px",
    lineHeight: 1.55,
  },

  whyVisual: {
    display: "flex",
    justifyContent: "center",
  },

  phoneFrame: {
    width: "310px",
    minHeight: "500px",
    padding: "20px 17px",
    borderRadius: "32px",
    background: "#102544",
    boxShadow: "0 30px 70px rgba(16,37,68,0.22)",
    border: "7px solid #dfe7f0",
  },

  phoneHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#ffffff",
    padding: "4px 7px 20px",
    fontSize: "14px",
  },

  phoneSearch: {
    padding: "13px",
    borderRadius: "11px",
    background: "#ffffff",
    color: "#8a94a3",
    fontSize: "11px",
    marginBottom: "16px",
  },

  miniProperty: {
    display: "flex",
    gap: "11px",
    padding: "11px",
    marginBottom: "10px",
    borderRadius: "13px",
    background: "#ffffff",
  },

  miniImage: {
    width: "62px",
    height: "62px",
    display: "grid",
    placeItems: "center",
    borderRadius: "10px",
    background: "#e9f3fc",
    fontSize: "25px",
    flexShrink: 0,
  },

  miniInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "3px",
    minWidth: 0,
  },

  phoneBottom: {
    display: "flex",
    justifyContent: "space-around",
    color: "#b9cbe0",
    fontSize: "20px",
    marginTop: "150px",
  },

  locationSection: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "85px 24px",
  },

  locationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },

  cityCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid #e6ebf1",
    background: "#ffffff",
    padding: "17px",
    borderRadius: "14px",
    cursor: "pointer",
    textAlign: "left",
  },

  cityNumber: {
    color: "#a8b1be",
    fontSize: "11px",
    fontWeight: 800,
  },

  cityName: {
    flex: 1,
    color: "#263246",
    fontSize: "14px",
    fontWeight: 750,
  },

  cityArrow: {
    color: "#1769d2",
    fontSize: "17px",
  },

  ctaSection: {
    padding: "0 24px 80px",
  },

  ctaContainer: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "42px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, #0b2854 0%, #1769d2 100%)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    boxShadow: "0 25px 60px rgba(23,105,210,0.2)",
  },

  ctaBadge: {
    color: "#b9dcff",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1.4px",
  },

  ctaTitle: {
    margin: "10px 0 8px",
    color: "#ffffff",
    fontSize: "29px",
  },

  ctaText: {
    margin: 0,
    color: "#c9dbf2",
    fontSize: "14px",
  },

  ctaButton: {
    border: "none",
    padding: "15px 22px",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#135fbf",
    fontWeight: 850,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  finalSection: {
    background: "#07152f",
    padding: "90px 24px",
    textAlign: "center",
  },

  finalContent: {
    maxWidth: "700px",
    margin: "0 auto",
  },

  finalTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "48px",
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
  },

  finalText: {
    color: "#b8c8dc",
    fontSize: "16px",
    margin: "17px 0 25px",
  },

  finalButton: {
    border: "none",
    padding: "14px 23px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #4fd5ff, #53d8a7)",
    color: "#08203e",
    fontSize: "13px",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
  },
};

export default Home;
