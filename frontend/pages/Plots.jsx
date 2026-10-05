import React from "react";

function Plots() {
  const properties = [
    {
      title: "Residential Plot",
      location: "Greater Noida, Uttar Pradesh",
      price: "₹45 Lakh",
      type: "Residential Plot",
      size: "100 Sq. Yds.",
    },
    {
      title: "Premium Residential Plot",
      location: "Noida Extension, Uttar Pradesh",
      price: "₹65 Lakh",
      type: "Residential Plot",
      size: "150 Sq. Yds.",
    },
    {
      title: "Corner Residential Plot",
      location: "Ghaziabad, Uttar Pradesh",
      price: "₹55 Lakh",
      type: "Residential Plot",
      size: "120 Sq. Yds.",
    },
    {
      title: "Farmhouse Plot",
      location: "Yamuna Expressway, Uttar Pradesh",
      price: "₹80 Lakh",
      type: "Farmhouse Plot",
      size: "200 Sq. Yds.",
    },
    {
      title: "Premium Investment Plot",
      location: "Jewar, Uttar Pradesh",
      price: "₹35 Lakh",
      type: "Investment Plot",
      size: "100 Sq. Yds.",
    },
  ];

  return (
    <main>
      <section className="page-section">
        <div className="page-header">
          <span className="badge">PLOTS</span>

          <h1>
            Find Your <span>Perfect Plot</span>
          </h1>

          <p>
            Explore residential, farmhouse and investment plots
            available at promising locations.
          </p>
        </div>

        <div className="property-grid">
          {properties.map((property, index) => (
            <div className="property-card" key={index}>
              <div className="property-image">
                <div className="image-placeholder">
                  Plot Image
                </div>
              </div>

              <div className="property-info">
                <span className="property-type">
                  {property.type}
                </span>

                <h2>{property.title}</h2>

                <p className="location">
                  📍 {property.location}
                </p>

                <div className="property-details">
                  <span>📐 {property.size}</span>
                  <span>🌳 Plot</span>
                </div>

                <div className="property-bottom">
                  <strong>{property.price}</strong>

                  <button
                    onClick={() =>
                      alert(`Enquiry for ${property.title}`)
                    }
                  >
                    Enquire Now
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
