import React, { useEffect, useState } from "react";
import { getProperties } from "../src/api";

function Buy() {
    const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProperties()
      .then((data) => {
        const formatted = data.map((p) => ({
          title: p.title || "Property",
          location: p.location || "Location",
          price: p.price
            ? `₹${Number(p.price).toLocaleString("en-IN")}`
            : "Price on Request",
          type: p.property_type || p.type || "Property",
          beds: p.bedrooms
            ? `${p.bedrooms} BHK`
            : p.area
            ? `${p.area} Sq. Ft.`
            : "Details"
        }));

        setProperties(formatted);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="buy-page">

      <section className="page-header">
        <span className="badge">PROPZO BUY</span>

        <h1>Find Your Dream Property</h1>

        <p>
          Explore verified properties available for sale
          across prime locations.
        </p>
      </section>

      <section className="property-search">

        <input
          type="text"
          placeholder="Search city or location"
        />

        <select>
          <option>All Property Types</option>
          <option>Apartment</option>
          <option>Villa</option>
          <option>Plot</option>
          <option>Commercial</option>
        </select>

        <select>
          <option>Any Budget</option>
          <option>Under ₹50 Lakh</option>
          <option>₹50 Lakh - ₹1 Cr</option>
          <option>₹1 Cr - ₹2 Cr</option>
          <option>Above ₹2 Cr</option>
        </select>

        <button>Search</button>

      </section>

      <section className="property-section">

        <div className="section-heading">
          <div>
            <h2>Properties For Sale</h2>
            <p>Discover properties that match your requirements.</p>
          </div>

          <span>6 Properties</span>
        </div>

        <div className="property-grid">

          {properties.map((property, index) => (
            <div className="property-card" key={index}>

              <div className="property-image">
                <span>PROPZO</span>
                <div className="property-tag">
                  Verified Property
                </div>
              </div>

              <div className="property-content">

                <span className="property-type">
                  {property.type}
                </span>

                <h3>{property.title}</h3>

                <p className="location">
                  📍 {property.location}
                </p>

                <div className="property-details">
                  <span>{property.beds}</span>
                  <span>Verified</span>
                </div>

                <div className="property-bottom">
                  <strong>{property.price}</strong>

                  <button>View Details</button>
                </div>

              </div>

            </div>
          ))}

        </div>

      </section>

    </main>
  );
}

export default Buy;
