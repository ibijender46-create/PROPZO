import React from "react";

function Commercial() {
  const properties = [
    {
      title: "Prime Commercial Shop",
      location: "Noida, Uttar Pradesh",
      price: "₹85 Lakh",
      type: "Shop",
      size: "450 Sq.Ft.",
    },
    {
      title: "Premium Office Space",
      location: "Gurugram, Haryana",
      price: "₹1.20 Cr",
      type: "Office",
      size: "850 Sq.Ft.",
    },
    {
      title: "Commercial Showroom",
      location: "Greater Noida, Uttar Pradesh",
      price: "₹1.50 Cr",
      type: "Showroom",
      size: "1200 Sq.Ft.",
    },
    {
      title: "Retail Shop",
      location: "Ghaziabad, Uttar Pradesh",
      price: "₹65 Lakh",
      type: "Shop",
      size: "350 Sq.Ft.",
    },
    {
      title: "Corporate Office Space",
      location: "Delhi NCR",
      price: "₹2.10 Cr",
      type: "Office",
      size: "1600 Sq.Ft.",
    },
  ];

  return (
    <main>
      <section className="page-section">
        <div className="page-header">
          <span className="badge">COMMERCIAL PROPERTY</span>

          <h1>
            Find Your <span>Perfect Commercial Space</span>
          </h1>

          <p>
            Discover shops, offices, showrooms and premium commercial
            properties available at prime locations.
          </p>
        </div>

        <div className="property-grid">
          {properties.map((property, index) => (
            <div className="property-card" key={index}>
              <div className="property-image">
                <div className="image-placeholder">
                  Property Image
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
                  <span>🏢 Commercial</span>
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

export default Commercial;
