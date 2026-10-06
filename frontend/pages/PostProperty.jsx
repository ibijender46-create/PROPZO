import { useState } from "react";
import { createProperty } from "../src/api";

export default function PostProperty() {
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    property_type: "Residential",
    description: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await createProperty({
        title: form.title,
        location: form.location,
        price: form.price
          ? Number(form.price)
          : null,
        property_type: form.property_type,
        description: form.description,
        bedrooms: form.bedrooms
          ? Number(form.bedrooms)
          : null,
        bathrooms: form.bathrooms
          ? Number(form.bathrooms)
          : null,
        area: form.area
          ? Number(form.area)
          : null,
      });

      setMessage(
        "Property posted successfully!"
      );

      setForm({
        title: "",
        location: "",
        price: "",
        property_type: "Residential",
        description: "",
        bedrooms: "",
        bathrooms: "",
        area: "",
      });
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to post property"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          Post Your Property
        </h1>

        <p style={styles.subtitle}>
          Add your property to PROZPO marketplace
        </p>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Property Title"
            required
            style={styles.input}
          />

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            required
            style={styles.input}
          />

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            style={styles.input}
          />

          <select
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="Residential">
              Residential
            </option>
            <option value="Rent">
              Rent
            </option>
            <option value="Commercial">
              Commercial
            </option>
            <option value="Plot">
              Plot
            </option>
            <option value="Villa">
              Villa
            </option>
            <option value="Apartment">
              Apartment
            </option>
          </select>

          <div style={styles.row}>
            <input
              name="bedrooms"
              type="number"
              value={form.bedrooms}
              onChange={handleChange}
              placeholder="Bedrooms"
              style={styles.input}
            />

            <input
              name="bathrooms"
              type="number"
              value={form.bathrooms}
              onChange={handleChange}
              placeholder="Bathrooms"
              style={styles.input}
            />
          </div>

          <input
            name="area"
            type="number"
            value={form.area}
            onChange={handleChange}
            placeholder="Area (Sq. Ft.)"
            style={styles.input}
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Property Description"
            rows="5"
            style={styles.textarea}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Posting..."
              : "Post Property"}
          </button>
        </form>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px",
    background:
      "linear-gradient(135deg, #eef4ff, #ffffff)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "700px",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow:
      "0 10px 35px rgba(0,0,0,0.10)",
    boxSizing: "border-box",
  },

  title: {
    margin: "0 0 8px",
    fontSize: "32px",
    fontWeight: "800",
    color: "#172554",
  },

  subtitle: {
    margin: "0 0 25px",
    color: "#64748b",
    fontSize: "15px",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    border: "1px solid #dbe2ea",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    border: "1px solid #dbe2ea",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box",
    resize: "vertical",
  },

  row: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
  },

  button: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  message: {
    marginTop: "20px",
    padding: "12px",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#0f172a",
    textAlign: "center",
    fontWeight: "600",
  },
};
