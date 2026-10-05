import React from "react";

function Builders() {
  const builders = [
    {
      name: "ABC Developers",
      location: "Noida, Uttar Pradesh",
      experience: "15+ Years",
      speciality: "Residential Projects",
      projects: "25+ Projects"
    },
    {
      name: "Prime Buildtech",
      location: "Greater Noida, Uttar Pradesh",
      experience: "12+ Years",
      speciality: "Luxury Apartments",
      projects: "18+ Projects"
    },
    {
      name: "Urban Heights Group",
      location: "Gurugram, Haryana",
      experience: "20+ Years",
      speciality: "Premium & Luxury Homes",
      projects: "35+ Projects"
    },
    {
      name: "Green Valley Developers",
      location: "Ghaziabad, Uttar Pradesh",
      experience: "10+ Years",
      speciality: "Plots & Gated Townships",
      projects: "15+ Projects"
    }
  ];

  return (
    <main className="page-container">

      <section className="page-header">
        <span className="badge">TRUSTED DEVELOPERS</span>

        <h1>Find Trusted Property Builders</h1>

        <p>
          Explore verified builders and developers offering residential,
          commercial and plotted development projects.
        </p>
      </section>

      <section className="property-grid">

        {builders.map((builder, index) => (
          <div className="property-card" key={index}>

            <div className="property-image agent-avatar">
              <span>🏗️</span>
            </div>

            <div className="property-content">

              <h2>{builder.name}</h2>

              <p>
                <strong>📍 Location:</strong> {builder.location}
              </p>

              <p>
                <strong>⭐ Experience:</strong> {builder.experience}
              </p>

              <p>
                <strong>🏠 Speciality:</strong> {builder.speciality}
              </p>

              <p>
                <strong>🏢 Projects:</strong> {builder.projects}
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  window.open(
                    "https://wa.me/919876543210?text=Hello%2C%20I%20want%20to%20know%20about%20your%20property%20projects.",
                    "_blank"
                  )
                }
              >
                View Builder Projects
              </button>

            </div>

          </div>
        ))}

      </section>

    </main>
  );
}

export default Builders;
