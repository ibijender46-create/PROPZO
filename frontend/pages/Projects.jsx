import React from "react";

function Projects() {
  const projects = [
    {
      title: "Premium Heights",
      location: "Noida, Uttar Pradesh",
      price: "₹75 Lakh Onwards",
      type: "Residential Project",
      units: "2 & 3 BHK"
    },
    {
      title: "Green Valley Residency",
      location: "Greater Noida, Uttar Pradesh",
      price: "₹55 Lakh Onwards",
      type: "Residential Project",
      units: "2 & 3 BHK"
    },
    {
      title: "Urban Square",
      location: "Gurugram, Haryana",
      price: "₹1.10 Cr Onwards",
      type: "Residential Project",
      units: "3 & 4 BHK"
    },
    {
      title: "Royal Garden City",
      location: "Ghaziabad, Uttar Pradesh",
      price: "₹45 Lakh Onwards",
      type: "Residential Project",
      units: "2 & 3 BHK"
    },
    {
      title: "Yamuna Greens",
      location: "Yamuna Expressway",
      price: "₹38 Lakh Onwards",
      type: "Residential Project",
      units: "2 & 3 BHK"
    },
    {
      title: "Skyline Business Hub",
      location: "Noida, Uttar Pradesh",
      price: "₹90 Lakh Onwards",
      type: "Commercial Project",
      units: "Shops & Offices"
    }
  ];

  return (
    <main className="page">

      <section className="page-hero">
        <span className="badge">PROJECTS</span>

        <h1>Explore Premium Projects</h1>

        <p>
          Discover residential and commercial projects in
          high-growth locations.
        </p>
      </section>

      <section className="property-section">

        <div className="section-heading">
          <h2>Featured Projects</h2>

          <p>
            Find the right project for your home or investment.
          </p>
        </div>

        <div className="property-grid">

          {projects.map((project, index) => (

            <div className="property-card" key={index}>

              <div className="property-image">
                <span>Project</span>
              </div>

              <div className="property-content">

                <h3>{project.title}</h3>

                <p className="location">
                  📍 {project.location}
                </p>

                <div className="property-details">
                  <span>{project.type}</span>
                  <span>{project.units}</span>
                </div>

                <div className="property-bottom">

                  <strong>{project.price}</strong>

                  <button
                    onClick={() =>
                      alert(`Enquiry for ${project.title}`)
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

export default Projects;
