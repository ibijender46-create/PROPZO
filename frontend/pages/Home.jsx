import React from "react";

function Home() {
  return (
    <main>

      {/* HERO SECTION */}
      <section className="hero">

        <div className="hero-content">

          <span className="badge">
            INDIA'S REAL ESTATE MARKETPLACE
          </span>

          <h1>
            Find Your
            <span> Perfect Property</span>
          </h1>

          <p>
            Buy, rent, sell and discover verified properties,
            agents and builders.
          </p>

          {/* SEARCH BOX */}
          <div className="search-box">

            <input
              type="text"
              placeholder="Search city, location or area"
            />

            <select>
              <option>Property Type</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Plot</option>
              <option>Commercial</option>
            </select>

            <button>
              Search Property
            </button>

          </div>

        </div>

      </section>

      {/* CATEGORIES */}
      <section className="categories">

        <h2>Explore Properties</h2>

        <p>
          Find the right property for your needs
        </p>

        <div className="cards">

          <div className="card">
            <div className="icon">🏠</div>
            <h3>Buy Property</h3>
            <p>Find your dream home</p>
          </div>

          <div className="card">
            <div className="icon">🔑</div>
            <h3>Rent Property</h3>
            <p>Homes and apartments for rent</p>
          </div>

          <div className="card">
            <div className="icon">🏢</div>
            <h3>Commercial</h3>
            <p>Shops, offices and spaces</p>
          </div>

          <div className="card">
            <div className="icon">📍</div>
            <h3>Plots</h3>
            <p>Residential and commercial plots</p>
          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;
