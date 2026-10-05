import React from "react";

function Buy() {
  const properties = [
    {
      title: "Premium 2 BHK Apartment",
      location: "Noida, Uttar Pradesh",
      price: "₹65 Lakh",
      type: "Apartment",
      beds: "2 BHK",
    },
    {
      title: "Luxury 3 BHK Apartment",
      location: "Gurugram, Haryana",
      price: "₹1.25 Cr",
      type: "Apartment",
      beds: "3 BHK",
    },
    {
      title: "Residential Plot",
      location: "Greater Noida, Uttar Pradesh",
      price: "₹45 Lakh",
      type: "Plot",
      beds: "120 Sq. Yds.",
    },
    {
      title: "Premium Villa",
      location: "Noida Extension",
      price: "₹1.10 Cr",
      type: "Villa",
      beds: "3 BHK",
    },
    {
      title: "Commercial Office Space",
      location: "Sector 62, Noida",
      price: "₹85 Lakh",
      type: "Commercial",
      beds: "1200 Sq. Ft.",
    },
    {
      title: "Modern 2 BHK Home",
      location: "Ghaziabad, Uttar Pradesh",
      price: "₹52 Lakh",
      type: "Apartment",
      beds: "2 BHK",
    },
  ];

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
