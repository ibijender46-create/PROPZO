import React, { useEffect, useMemo, useState } from "react";
import { getProperties } from "../src/api";

function Rent() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [budget, setBudget] = useState("Any");
  const [sort, setSort] = useState("Newest");

  useEffect(() => {
    let active = true;

    getProperties()
      .then((data) => {
        if (!active) return;

        const list = Array.isArray(data) ? data : [];

        const rentals = list.filter((p) => {
          const purpose = String(
            p.listing_type ||
              p.property_for ||
              p.purpose ||
              ""
          ).toLowerCase();

          return (
            purpose.includes("rent") ||
            purpose.includes("lease") ||
            Number(p.rent || p.monthly_rent || p.rent_price) > 0
          );
        });

        const source = rentals.length ? rentals : list;

        setProperties(
          source.map((p) => ({
            ...p,
            id: p.id,
            title: p.title || "Rental Property",
            location:
              p.location ||
              [p.city, p.state].filter(Boolean).join(", ") ||
              "Location unavailable",
            city: p.city || "",
            state: p.state || "",
            type: p.property_type || "Apartment",
            rent: Number(
              p.rent ||
                p.monthly_rent ||
                p.rent_price ||
                p.price ||
                0
            ),
            bedrooms: Number(p.bedrooms || 0),
            bathrooms: Number(p.bathrooms || 0),
            area: Number(p.area || 0),
            areaUnit: p.area_unit || "Sq.Ft.",
            furnishing: p.furnishing || "",
            image: p.image_url || p.image || "",
          }))
        );
      })
      .catch((error) => {
        console.error("Rent error:", error);
        if (active) setProperties([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const formatRent = (value) => {
    if (!value) return "Rent on Request";
    return `₹${Number(value).toLocaleString("en-IN")} / Month`;
  };

  const filtered = useMemo(() => {
    let result = [...properties];
    const q = search.trim().toLowerCase();

    if (q) {
      result = result.filter((p) =>
        [
          p.title,
          p.location,
          p.city,
          p.state,
          p.type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (type !== "All") {
      result = result.filter((p) =>
        String(p.type).toLowerCase().includes(type.toLowerCase())
      );
    }

    if (budget !== "Any") {
      result = result.filter((p) => {
        const r = Number(p.rent || 0);

        if (budget === "Under ₹15K") return r > 0 && r < 15000;
        if (budget === "₹15K - ₹25K")
          return r >= 15000 && r <= 25000;
        if (budget === "₹25K - ₹50K")
          return r > 25000 && r <= 50000;
        if (budget === "Above ₹50K") return r > 50000;

        return true;
      });
    }

    if (sort === "Low to High") {
      result.sort((a, b) => a.rent - b.rent);
    }

    if (sort === "High to Low") {
      result.sort((a, b) => b.rent - a.rent);
    }

    return result;
  }, [properties, search, type, budget, sort]);

  const clearFilters = () => {
    setSearch("");
    setType("All");
    setBudget("Any");
    setSort("Newest");
  };

  const openProperty = (id) => {
    if (id) window.location.hash = `property/${id}`;
  };

  const enquire = (id) => {
    if (id) {
      window.location.hash = `property/${id}?enquiry=1`;
    } else {
      window.location.hash = "my-enquiries";
    }
  };

  return (
    <main className="rent-page">
      <style>{`
        *{box-sizing:border-box}
        .rent-page{
          min-height:100vh;
          background:#f6f8fc;
          color:#172033;
          font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        }
        .rent-hero{
          background:linear-gradient(135deg,#07162f,#0b3975 65%,#1674e8);
          color:white;
          padding:70px 20px 115px;
          position:relative;
          overflow:hidden;
        }
        .rent-hero:after{
          content:"";
          position:absolute;
          width:420px;
          height:420px;
          border-radius:50%;
          background:rgba(255,255,255,.07);
          right:-180px;
          top:-200px;
        }
        .rent-hero-inner{
          max-width:1180px;
          margin:auto;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:40px;
          position:relative;
          z-index:1;
        }
        .rent-badge{
          display:inline-block;
          padding:8px 13px;
          border:1px solid rgba(255,255,255,.2);
          border-radius:30px;
          background:rgba(255,255,255,.1);
          font-size:11px;
          font-weight:800;
          letter-spacing:1px;
        }
        .rent-hero h1{
          margin:20px 0 15px;
          font-size:clamp(42px,6vw,68px);
          line-height:1;
          letter-spacing:-2px;
        }
        .rent-hero h1 span{color:#69b8ff}
        .rent-hero p{
          max-width:650px;
          color:#d8e7f8;
          font-size:17px;
          line-height:1.7;
        }
        .rent-buttons{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
          margin-top:25px;
        }
        .rent-buttons button,
        .rent-cta button{
          border:0;
          border-radius:10px;
          padding:13px 18px;
          font-weight:800;
          cursor:pointer;
        }
        .rent-primary{background:white;color:#0b3975}
        .rent-secondary{
          background:rgba(255,255,255,.1);
          color:white;
          border:1px solid rgba(255,255,255,.3)!important;
        }
        .rent-hero-card{
          width:310px;
          padding:22px;
          border-radius:22px;
          background:rgba(255,255,255,.11);
          border:1px solid rgba(255,255,255,.18);
          flex-shrink:0;
        }
        .rent-hero-card h3{margin:0 0 5px;font-size:25px}
        .rent-hero-card p{font-size:13px;margin:0;color:#d7e8fa}
        .rent-stat{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:8px;
          margin-top:25px;
        }
        .rent-stat div{
          padding:12px 7px;
          border-radius:10px;
          background:rgba(255,255,255,.08);
          text-align:center;
        }
        .rent-stat strong{display:block;font-size:18px}
        .rent-stat small{font-size:9px;color:#c8d9eb}

        .rent-filter-wrap{
          max-width:1180px;
          margin:-52px auto 0;
          padding:0 20px;
          position:relative;
          z-index:5;
        }
        .rent-filter{
          display:grid;
          grid-template-columns:1.5fr 1fr 1fr auto;
          gap:12px;
          padding:15px;
          background:white;
          border:1px solid #e3eaf2;
          border-radius:18px;
          box-shadow:0 18px 45px rgba(20,45,80,.14);
        }
        .rent-field{
          display:flex;
          flex-direction:column;
          gap:6px;
        }
        .rent-field label{
          font-size:10px;
          font-weight:900;
          color:#68778b;
          letter-spacing:.7px;
        }
        .rent-field input,
        .rent-field select,
        .rent-sort{
          width:100%;
          border:1px solid #dce4ed;
          border-radius:9px;
          padding:12px;
          background:white;
          color:#1d2b40;
          outline:none;
        }
        .rent-search-btn{
          align-self:end;
          border:0;
          border-radius:10px;
          padding:13px 22px;
          background:#1469d8;
          color:white;
          font-weight:800;
          cursor:pointer;
        }

        .rent-content{
          max-width:1180px;
          margin:auto;
          padding:65px 20px 40px;
        }
        .rent-heading{
          display:flex;
          justify-content:space-between;
          align-items:end;
          gap:20px;
          margin-bottom:25px;
        }
        .rent-heading small{
          color:#176bd6;
          font-size:10px;
          font-weight:900;
          letter-spacing:1.5px;
        }
        .rent-heading h2{
          margin:7px 0;
          font-size:34px;
        }
        .rent-heading p{
          margin:0;
          color:#748195;
          font-size:14px;
        }
        .rent-actions{
          display:flex;
          gap:9px;
        }
        .rent-clear{
          border:1px solid #dce4ed;
          background:white;
          border-radius:9px;
          padding:11px 14px;
          cursor:pointer;
          font-weight:700;
        }

        .rent-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:22px;
        }
        .rent-card{
          background:white;
          border:1px solid #e3eaf2;
          border-radius:17px;
          overflow:hidden;
          transition:.25s;
        }
        .rent-card:hover{
          transform:translateY(-5px);
          box-shadow:0 20px 45px rgba(20,45,80,.13);
        }
        .rent-image{
          height:225px;
          position:relative;
          background:linear-gradient(135deg,#cde7ff,#8fc1ee);
          background-size:cover;
          background-position:center;
        }
        .rent-image:after{
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(transparent,rgba(5,20,40,.48));
        }
        .rent-tag,
        .rent-verified{
          position:absolute;
          z-index:2;
          top:12px;
          padding:7px 9px;
          border-radius:20px;
          color:white;
          font-size:10px;
          font-weight:800;
        }
        .rent-tag{
          left:12px;
          background:#1469d8;
        }
        .rent-verified{
          right:12px;
          background:rgba(10,30,55,.75);
        }
        .rent-placeholder{
          position:absolute;
          inset:0;
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          z-index:1;
          color:#16416e;
        }
        .rent-placeholder div{
          font-size:45px;
        }
        .rent-placeholder strong{font-size:18px}
        .rent-card-body{padding:17px}
        .rent-type{
          color:#176bd6;
          font-size:10px;
          font-weight:900;
          text-transform:uppercase;
        }
        .rent-card h3{
          margin:8px 0;
          font-size:18px;
          line-height:1.3;
        }
        .rent-location{
          color:#6d7b8e;
          font-size:13px;
          margin:0 0 13px;
        }
        .rent-details{
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          padding-bottom:13px;
          border-bottom:1px solid #edf1f5;
        }
        .rent-details span{
          padding:6px 8px;
          border-radius:7px;
          background:#f5f8fc;
          color:#536277;
          font-size:10px;
        }
        .rent-bottom{
          display:flex;
          justify-content:space-between;
          align-items:end;
          gap:10px;
          margin-top:15px;
        }
        .rent-price-label{
          display:block;
          color:#8a96a6;
          font-size:8px;
          font-weight:900;
          letter-spacing:1px;
        }
        .rent-price{
          display:block;
          color:#1469d8;
          font-size:17px;
          margin-top:4px;
        }
        .rent-enquire{
          border:0;
          border-radius:9px;
          padding:10px 12px;
          background:#edf5ff;
          color:#1267d6;
          font-weight:800;
          cursor:pointer;
        }
        .rent-details-btn{
          width:100%;
          margin-top:12px;
          padding:10px;
          border:1px solid #dce5ef;
          border-radius:9px;
          background:white;
          color:#24364d;
          font-weight:800;
          cursor:pointer;
        }

        .rent-empty{
          text-align:center;
          background:white;
          border:1px solid #e3eaf2;
          border-radius:17px;
          padding:60px 20px;
        }
        .rent-empty-icon{font-size:42px}
        .rent-empty h3{font-size:22px}
        .rent-empty p{color:#718096}
        .rent-empty button{
          border:0;
          background:#1469d8;
          color:white;
          border-radius:9px;
          padding:11px 17px;
          font-weight:800;
          cursor:pointer;
        }

        .rent-benefits{
          max-width:1180px;
          margin:auto;
          padding:45px 20px 75px;
        }
        .rent-benefits h2{
          margin:5px 0 10px;
          font-size:34px;
        }
        .rent-benefits-intro{
          color:#718096;
          max-width:600px;
          line-height:1.6;
        }
        .rent-benefit-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
          margin-top:25px;
        }
        .rent-benefit{
          background:white;
          border:1px solid #e3eaf2;
          border-radius:15px;
          padding:22px;
        }
        .rent-benefit-icon{
          width:43px;
          height:43px;
          display:grid;
          place-items:center;
          border-radius:11px;
          background:#edf5ff;
          color:#1469d8;
          font-size:19px;
          font-weight:900;
        }
        .rent-benefit h3{font-size:16px}
        .rent-benefit p{
          color:#718096;
          font-size:13px;
          line-height:1.6;
        }

        .rent-cta-wrap{
          max-width:1180px;
          margin:auto;
          padding:0 20px 70px;
        }
        .rent-cta{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:25px;
          padding:38px;
          border-radius:22px;
          background:linear-gradient(135deg,#09264d,#1269d7);
          color:white;
        }
        .rent-cta small{
          color:#8bc7ff;
          font-weight:900;
          letter-spacing:1px;
        }
        .rent-cta h2{
          margin:8px 0;
          font-size:31px;
        }
        .rent-cta p{
          margin:0;
          color:#d3e3f5;
          max-width:650px;
          line-height:1.6;
        }
        .rent-cta button{
          background:white;
          color:#0d376e;
          white-space:nowrap;
        }

        .rent-floating{
          position:fixed;
          right:17px;
          bottom:18px;
          z-index:50;
          border:0;
          border-radius:30px;
          padding:11px 16px;
          background:#1469d8;
          color:white;
          font-weight:800;
          box-shadow:0 10px 25px rgba(20,105,216,.3);
          cursor:pointer;
        }

        @media(max-width:950px){
          .rent-hero-inner{flex-direction:column;align-items:flex-start}
          .rent-hero-card{width:100%;max-width:420px}
          .rent-grid{grid-template-columns:repeat(2,1fr)}
          .rent-benefit-grid{grid-template-columns:repeat(2,1fr)}
        }

        @media(max-width:650px){
          .rent-hero{padding:50px 16px 95px}
          .rent-hero h1{font-size:43px}
          .rent-filter{grid-template-columns:1fr}
          .rent-content{padding-top:50px}
          .rent-heading{flex-direction:column;align-items:flex-start}
          .rent-actions{width:100%}
          .rent-actions>*{flex:1}
          .rent-grid{grid-template-columns:1fr}
          .rent-benefit-grid{grid-template-columns:1fr}
          .rent-cta{flex-direction:column;align-items:flex-start;padding:28px 22px}
          .rent-cta button{width:100%}
        }
      `}</style>

      {/* HERO */}
      <section className="rent-hero">
        <div className="rent-hero-inner">
          <div>
            <span className="rent-badge">
              PROZPO • RENT PROPERTY
            </span>

            <h1>
              Find Your
              <br />
              <span>Perfect Rental</span>
            </h1>

            <p>
              Discover apartments, houses, villas,
              offices and commercial properties
              available for rent across India.
            </p>

            <div className="rent-buttons">
              <button
                className="rent-primary"
                onClick={() =>
                  document
                    .getElementById("rent-results")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Rentals →
              </button>

              <button
                className="rent-secondary"
                onClick={() =>
                  (window.location.hash = "post-property")
                }
              >
                List Your Property
              </button>
            </div>
          </div>

          <div className="rent-hero-card">
            <h3>Rental Properties</h3>
            <p>Search verified listings on PROZPO.</p>

            <div className="rent-stat">
              <div>
                <strong>{properties.length}</strong>
                <small>LISTINGS</small>
              </div>
              <div>
                <strong>24×7</strong>
                <small>ACCESS</small>
              </div>
              <div>
                <strong>✓</strong>
                <small>ENQUIRY</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER */}
      <section className="rent-filter-wrap">
        <div className="rent-filter">
          <div className="rent-field">
            <label>SEARCH LOCATION</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="City, locality or area"
            />
          </div>

          <div className="rent-field">
            <label>PROPERTY TYPE</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="All">All Property Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="House">House</option>
              <option value="Studio">Studio</option>
              <option value="Office">Office</option>
              <option value="Shop">Shop</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div className="rent-field">
            <label>MONTHLY RENT</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              <option value="Any">Any Rent</option>
              <option value="Under ₹15K">Under ₹15,000</option>
              <option value="₹15K - ₹25K">₹15,000 - ₹25,000</option>
              <option value="₹25K - ₹50K">₹25,000 - ₹50,000</option>
              <option value="Above ₹50K">Above ₹50,000</option>
            </select>
          </div>

          <button
            className="rent-search-btn"
            onClick={() =>
              document
                .getElementById("rent-results")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Search →
          </button>
        </div>
      </section>

      {/* RESULTS */}
      <section className="rent-content" id="rent-results">
        <div className="rent-heading">
          <div>
            <small>RENTAL LISTINGS</small>
            <h2>Properties For Rent</h2>
            <p>
              {loading
                ? "Loading rental properties..."
                : `${filtered.length} properties found`}
            </p>
          </div>

          <div className="rent-actions">
            <button
              className="rent-clear"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

            <select
              className="rent-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option>Newest</option>
              <option>Low to High</option>
              <option>High to Low</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="rent-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div className="rent-card" key={n}>
                <div
                  style={{
                    height: 225,
                    background: "#e9eef5",
                  }}
                />
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      height: 18,
                      width: "70%",
                      background: "#e9eef5",
                      borderRadius: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      width: "90%",
                      background: "#e9eef5",
                      borderRadius: 8,
                      marginTop: 15,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rent-empty">
            <div className="rent-empty-icon">🔑</div>
            <h3>No rental properties found</h3>
            <p>
              Try changing your location, property
              type or rent range.
            </p>
            <button onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="rent-grid">
            {filtered.map((property, index) => (
              <article
                className="rent-card"
                key={property.id || index}
              >
                <div
                  className="rent-image"
                  style={
                    property.image
                      ? {
                          backgroundImage: `url("${property.image}")`,
                        }
                      : {}
                  }
                >
                  {!property.image && (
                    <div className="rent-placeholder">
                      <div>🏠</div>
                      <strong>PROZPO</strong>
                    </div>
                  )}

                  <span className="rent-tag">
                    FOR RENT
                  </span>

                  <span className="rent-verified">
                    ✓ Verified
                  </span>
                </div>

                <div className="rent-card-body">
                  <span className="rent-type">
                    {property.type}
                  </span>

                  <h3>{property.title}</h3>

                  <p className="rent-location">
                    📍 {property.location}
                  </p>

                  <div className="rent-details">
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
                        ▣ {property.area} {property.areaUnit}
                      </span>
                    )}
                  </div>

                  <div className="rent-bottom">
                    <div>
                      <span className="rent-price-label">
                        MONTHLY RENT
                      </span>

                      <strong className="rent-price">
                        {formatRent(property.rent)}
                      </strong>
                    </div>

                    <button
                      className="rent-enquire"
                      onClick={() => enquire(property.id)}
                    >
                      Enquire →
                    </button>
                  </div>

                  <button
                    className="rent-details-btn"
                    onClick={() => openProperty(property.id)}
                  >
                    View Full Property Details →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* BENEFITS */}
      <section className="rent-benefits">
        <small
          style={{
            color: "#176bd6",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 1.5,
          }}
        >
          WHY RENT THROUGH PROZPO
        </small>

        <h2>
          A Better Way To Find Your Next Home
        </h2>

        <p className="rent-benefits-intro">
          Search, compare and enquire about rental
          properties from one simple platform.
        </p>

        <div className="rent-benefit-grid">
          <div className="rent-benefit">
            <div className="rent-benefit-icon">✓</div>
            <h3>Verified Listings</h3>
            <p>
              Discover rental properties with clear
              information and verified listing status.
            </p>
          </div>

          <div className="rent-benefit">
            <div className="rent-benefit-icon">⚡</div>
            <h3>Quick Enquiry</h3>
            <p>
              Send enquiries directly from the
              property listing.
            </p>
          </div>

          <div className="rent-benefit">
            <div className="rent-benefit-icon">₹</div>
            <h3>Compare Rent</h3>
            <p>
              Filter properties according to your
              monthly rental budget.
            </p>
          </div>

          <div className="rent-benefit">
            <div className="rent-benefit-icon">🏠</div>
            <h3>Multiple Options</h3>
            <p>
              Apartments, villas, houses, offices
              and commercial spaces.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rent-cta-wrap">
        <div className="rent-cta">
          <div>
            <small>OWN A RENTAL PROPERTY?</small>
            <h2>Find Your Next Tenant</h2>
            <p>
              List your property on PROZPO and connect
              with genuine renters.
            </p>
          </div>

          <button
            onClick={() =>
              (window.location.hash = "post-property")
            }
          >
            List Your Property →
          </button>
        </div>
      </section>

      {/* FLOATING ENQUIRY */}
      <button
        className="rent-floating"
        onClick={() =>
          (window.location.hash = "my-enquiries")
        }
      >
        ? Enquire Now
      </button>
    </main>
  );
}

export default Rent;
