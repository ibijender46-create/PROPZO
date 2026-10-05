import React from "react";

function Agents() {
  const agents = [
    {
      name: "Rahul Sharma",
      location: "Noida, Uttar Pradesh",
      experience: "8 Years",
      speciality: "Residential Properties",
      phone: "+91 98765 43210"
    },
    {
      name: "Amit Verma",
      location: "Gurugram, Haryana",
      experience: "6 Years",
      speciality: "Luxury Apartments",
      phone: "+91 98765 43211"
    },
    {
      name: "Neha Kapoor",
      location: "Greater Noida, Uttar Pradesh",
      experience: "5 Years",
      speciality: "Plots & Villas",
      phone: "+91 98765 43212"
    },
    {
      name: "Vikas Singh",
      location: "Ghaziabad, Uttar Pradesh",
      experience: "10 Years",
      speciality: "Commercial Properties",
      phone: "+91 98765 43213"
    }
  ];

  return (
    <main className="page-container">

      <section className="page-header">
        <span className="badge">VERIFIED PROFESSIONALS</span>

        <h1>Find Trusted Real Estate Agents</h1>

        <p>
          Connect with experienced property agents and get expert assistance
          for buying, selling and renting properties.
        </p>
      </section>

      <section className="property-grid">

        {agents.map((agent, index) => (
          <div className="property-card" key={index}>

            <div className="property-image agent-avatar">
              <span>👤</span>
            </div>

            <div className="property-content">

              <h2>{agent.name}</h2>

              <p>
                <strong>📍 Location:</strong> {agent.location}
              </p>

              <p>
                <strong>⭐ Experience:</strong> {agent.experience}
              </p>

              <p>
                <strong>🏠 Speciality:</strong> {agent.speciality}
              </p>

              <p>
                <strong>📞 Contact:</strong> {agent.phone}
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  window.open(
                    `https://wa.me/${agent.phone.replace(/\D/g, "")}`,
                    "_blank"
                  )
                }
              >
                Contact Agent
              </button>

            </div>

          </div>
        ))}

      </section>

    </main>
  );
}

export default Agents;
