import React from "react";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">PROPZO</div>

        <nav>
          <a href="#">Home</a>
          <a href="#">Buy</a>
          <a href="#">Rent</a>
          <a href="#">Commercial</a>
          <a href="#">Projects</a>
          <a href="#">Agents</a>
          <a href="#">Builders</a>
        </nav>

        <button className="post-btn">Post Property</button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="badge">INDIA'S REAL ESTATE MARKETPLACE</span>

            <h1>
              Find Your
              <span> Perfect Property</span>
            </h1>

            <p>
              Buy, rent, sell and discover verified properties from owners,
              agents and builders.
            </p>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search city, location or property..."
              />

              <select>
                <option>Property Type</option>
                <option>Apartment</option>
                <option>Villa</option>
                <option>Plot</option>
                <option>Commercial</option>
              </select>

              <button>Search Property</button>
            </div>
          </div>
        </section>

        <section className="categories">
          <h2>Explore Properties</h2>
          <p>Find the right property for your needs</p>

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
    </div>
  );
}

export default App;
