import React from "react";

function Plots() {
  const properties = [
    {
      title: "Residential Plot",
      location: "Greater Noida, Uttar Pradesh",
      price: "₹35 Lakh",
      type: "Plot",
      size: "120 Sq.Yd."
    },
    {
      title: "Premium Residential Plot",
      location: "Noida, Uttar Pradesh",
      price: "₹55 Lakh",
      type: "Plot",
      size: "150 Sq.Yd."
    },
    {
      title: "Gated Township Plot",
      location: "Ghaziabad, Uttar Pradesh",
      price: "₹28 Lakh",
      type: "Plot",
      size: "100 Sq.Yd."
    },
    {
      title: "Corner Residential Plot",
      location: "Greater Noida West",
      price: "₹48 Lakh",
      type: "Plot",
      size: "125 Sq.Yd."
    },
    {
      title: "Premium Farm Plot",
      location: "Yamuna Expressway",
      price: "₹32 Lakh",
      type: "Plot",
      size: "200 Sq.Yd."
    },
    {
      title: "Investment Plot",
      location: "Jewar, Uttar Pradesh",
      price: "₹22 Lakh",
      type: "Plot",
      size: "100 Sq.Yd."
    }
  ];

  return (
    <main className="page">
      <section className="page-hero">
        <span className="badge">PLOTS</span>

        <h1>Find Your Perfect Plot</h1>

        <p>
          Explore residential and investment plots in prime locations
          across India.
        </p>
      </section>

      <section className="property-section">
        <div className="section-heading">
          <h2>Featured Plots</h2>
          <p>Explore verified plot options for living and investment.</p>
        </div>

        <div className="property-grid">
          {properties.map((property, index) => (
            <div className="property-card" key={index}>
              <div className="property-image">
                <span>Plot</span>
              </div>

              <div className="property-content">
                <h3>{property.title}</h3>

                <p className="location">
                  📍 {property.location}
                </p>

                <div className="property-details">
                  <span>{property.type}</span>
                  <span>{property.size}</span>
                </div>

                <div className="property-bottom">
                  <strong>{property.price}</strong>

                  <button
                    onClick={() =>
                      alert(
                        `Enquiry for ${property.title}`
                      )
                    }
                  >
                    Enquire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Plots;
