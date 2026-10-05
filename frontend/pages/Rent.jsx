import React from "react";

function Rent() {
  const properties = [
    {
      title: "Premium 2 BHK Flat",
      location: "Noida, Uttar Pradesh",
      rent: "₹25,000 / Month",
      type: "Apartment",
      beds: "2 BHK",
    },
    {
      title: "Luxury 3 BHK Apartment",
      location: "Gurugram, Haryana",
      rent: "₹40,000 / Month",
      type: "Apartment",
      beds: "3 BHK",
    },
    {
      title: "Modern 1 BHK Apartment",
      location: "Greater Noida, Uttar Pradesh",
      rent: "₹15,000 / Month",
      type: "Apartment",
      beds: "1 BHK",
    },
    {
      title: "Spacious 2 BHK Family Home",
      location: "Ghaziabad, Uttar Pradesh",
      rent: "₹20,000 / Month",
      type: "Independent House",
      beds: "2 BHK",
    },
    {
      title: "Fully Furnished 3 BHK",
      location: "Delhi NCR",
      rent: "₹45,000 / Month",
      type: "Furnished Apartment",
      beds: "3 BHK",
    },
  ];

  return (
    <main>
      <section className="page-section">
        <div className="page-header">
          <span className="badge">RENT PROPERTY</span>

          <h1>
            Find Your <span>Perfect Rental Property</span>
          </h1>

          <p>
            Explore verified rental properties, apartments and homes
            available across major locations.
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
                  <span>🛏 {property.beds}</span>
                  <span>🏠 For Rent</span>
                </div>

                <div className="property-bottom">
                  <strong>{property.rent}</strong>

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

export default Rent;
