import React, { useEffect, useMemo, useState } from "react";
import { getProperties } from "../src/api";

const defaultFilters = {
  keyword: "",
  listingType: "",
  propertyType: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  bedrooms: "",
  bathrooms: "",
  furnishing: "",
  possession: "",
};

export default function SearchProperties() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    setFilters((previous) => ({
      ...previous,
      keyword: params.get("q") || "",
      listingType:
        params.get("listing_type") || "",
      propertyType:
        params.get("property_type") || "",
      city: params.get("city") || "",
      minPrice:
        params.get("min_price") || "",
      maxPrice:
        params.get("max_price") || "",
    }));
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);

      const response =
        await getProperties();

      setProperties(
        response?.properties ||
          response?.data ||
          []
      );
    } catch (error) {
      console.error(
        "Search properties error:",
        error
      );

      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(name, value) {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  const cities = useMemo(() => {
    return [
      ...new Set(
        properties
          .map(
            (property) =>
              property.city ||
              property.location
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [properties]);

  const propertyTypes = useMemo(() => {
    return [
      ...new Set(
        properties
          .map(
            (property) =>
              property.property_type
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    const keyword =
      filters.keyword
        .toLowerCase()
        .trim();

    if (keyword) {
      result = result.filter((property) =>
        [
          property.title,
          property.location,
          property.city,
          property.state,
          property.property_type,
          property.listing_type,
          property.description,
          property.bedrooms,
          property.bathrooms,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      );
    }

    if (filters.listingType) {
      result = result.filter(
        (property) =>
          String(
            property.listing_type || ""
          ).toLowerCase() ===
          filters.listingType.toLowerCase()
      );
    }

    if (filters.propertyType) {
      result = result.filter(
        (property) =>
          String(
            property.property_type || ""
          ).toLowerCase() ===
          filters.propertyType.toLowerCase()
      );
    }

    if (filters.city) {
      result = result.filter((property) => {
        const value = String(
          property.city ||
            property.location ||
            ""
        ).toLowerCase();

        return value.includes(
          filters.city.toLowerCase()
        );
      });
    }

    if (filters.minPrice) {
      result = result.filter(
        (property) =>
          Number(property.price || 0) >=
          Number(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      result = result.filter(
        (property) =>
          Number(property.price || 0) <=
          Number(filters.maxPrice)
      );
    }

    if (filters.minArea) {
      result = result.filter(
        (property) =>
          Number(
            String(
              property.area || 0
            ).replace(/[^0-9.]/g, "")
          ) >= Number(filters.minArea)
      );
    }

    if (filters.maxArea) {
      result = result.filter(
        (property) =>
          Number(
            String(
              property.area || 0
            ).replace(/[^0-9.]/g, "")
          ) <= Number(filters.maxArea)
      );
    }

    if (filters.bedrooms) {
      result = result.filter(
        (property) =>
          Number(property.bedrooms || 0) >=
          Number(filters.bedrooms)
      );
    }

    if (filters.bathrooms) {
      result = result.filter(
        (property) =>
          Number(property.bathrooms || 0) >=
          Number(filters.bathrooms)
      );
    }

    if (filters.furnishing) {
      result = result.filter(
        (property) =>
          String(
            property.furnishing || ""
          ).toLowerCase() ===
          filters.furnishing.toLowerCase()
      );
    }

    if (filters.possession) {
      result = result.filter(
        (property) =>
          String(
            property.possession || ""
          ).toLowerCase() ===
          filters.possession.toLowerCase()
      );
    }

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === "area-high") {
      result.sort(
        (a, b) =>
          extractNumber(b.area) -
          extractNumber(a.area)
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ).getTime() -
          new Date(
            a.created_at || 0
          ).getTime()
      );
    }

    return result;
  }, [properties, filters, sortBy]);

  function extractNumber(value) {
    return Number(
      String(value || 0).replace(
        /[^0-9.]/g,
        ""
      )
    );
  }

  function money(value) {
    const amount = Number(value);

    if (!amount) {
      return "Price on Request";
    }

    if (amount >= 10000000) {
      return `₹${(
        amount / 10000000
      ).toFixed(2)} Cr`;
    }

    if (amount >= 100000) {
      return `₹${(
        amount / 100000
      ).toFixed(2)} L`;
    }

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  }

  function imageFor(property) {
    return (
      property.image_url ||
      property.image ||
      property.thumbnail ||
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80"
    );
  }

  function viewProperty(id) {
    if (!id) return;

    window.location.hash =
      `property/${id}`;
  }

  function postProperty() {
    window.location.hash =
      "post-property";
  }

  function activeFilterCount() {
    return Object.entries(filters)
      .filter(
        ([key, value]) =>
          key !== "keyword" &&
          String(value).trim()
      ).length;
  }

  if (loading) {
    return (
      <>
        <style>{`
          .search-loading {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #475569;
            font-size: 18px;
            font-weight: 800;
          }
        `}</style>

        <div className="search-loading">
          Loading Properties...
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .search-page {
          min-height: 100vh;
          padding: 30px 18px 75px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.08),
              transparent 30%
            ),
            #f8fafc;
        }

        .search-container {
          max-width: 1300px;
          margin: 0 auto;
        }

        .search-header {
          margin-bottom: 20px;
        }

        .search-header h1 {
          margin: 0 0 7px;
          color: #0f172a;
          font-size: clamp(
            28px,
            4vw,
            40px
          );
          font-weight: 950;
        }

        .search-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .search-main {
          display: grid;
          grid-template-columns: 285px minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }

        .search-sidebar {
          position: sticky;
          top: 15px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          box-shadow:
            0 8px 28px
            rgba(15,23,42,.05);
        }

        .filter-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
        }

        .filter-heading h2 {
          margin: 0;
          color: #0f172a;
          font-size: 18px;
          font-weight: 900;
        }

        .clear-btn {
          border: 0;
          background: transparent;
          color: #dc2626;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .filter-group {
          margin-bottom: 15px;
        }

        .filter-label {
          display: block;
          margin-bottom: 6px;
          color: #334155;
          font-size: 11px;
          font-weight: 850;
        }

        .filter-input,
        .filter-select {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 11px;
          border: 1px solid #dbe3ee;
          border-radius: 9px;
          outline: none;
          background: white;
          color: #0f172a;
          font-size: 12px;
        }

        .filter-input:focus,
        .filter-select:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37,99,235,.08);
        }

        .price-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .search-results {
          min-width: 0;
        }

        .results-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 15px;
          padding: 13px 15px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: white;
        }

        .results-count {
          color: #334155;
          font-size: 13px;
          font-weight: 850;
        }

        .results-count strong {
          color: #2563eb;
        }

        .sort-select {
          padding: 9px 11px;
          border: 1px solid #dbe3ee;
          border-radius: 9px;
          outline: none;
          color: #334155;
          background: white;
          font-size: 11px;
          font-weight: 750;
        }

        .mobile-filter-btn {
          display: none;
          width: 100%;
          margin-bottom: 12px;
          padding: 12px;
          border: 0;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .property-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 17px;
        }

        .property-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: white;
          box-shadow:
            0 7px 25px
            rgba(15,23,42,.04);
        }

        .property-image {
          position: relative;
          height: 185px;
          background: #e2e8f0;
        }

        .property-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .property-listing {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 5px 9px;
          border-radius: 20px;
          background: #2563eb;
          color: white;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .property-card-body {
          padding: 15px;
        }

        .property-title {
          margin: 0 0 5px;
          color: #0f172a;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.35;
        }

        .property-location {
          margin: 0 0 9px;
          color: #64748b;
          font-size: 11px;
        }

        .property-price {
          margin-bottom: 10px;
          color: #2563eb;
          font-size: 18px;
          font-weight: 950;
        }

        .property-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 12px;
        }

        .property-meta span {
          padding: 5px 7px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #475569;
          font-size: 9px;
          font-weight: 800;
        }

        .view-property {
          width: 100%;
          padding: 10px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: white;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .view-property:hover {
          background: #1d4ed8;
        }

        .empty-results {
          padding: 70px 25px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: white;
          text-align: center;
        }

        .empty-results-icon {
          margin-bottom: 10px;
          font-size: 45px;
        }

        .empty-results h2 {
          margin: 0 0 7px;
          color: #0f172a;
          font-size: 21px;
        }

        .empty-results p {
          margin: 0 0 18px;
          color: #64748b;
          font-size: 13px;
        }

        .post-property-btn {
          padding: 11px 17px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: white;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        @media (max-width: 1100px) {
          .property-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .search-main {
            display: block;
          }

          .mobile-filter-btn {
            display: block;
          }

          .search-sidebar {
            position: static;
            display: none;
            margin-bottom: 15px;
          }

          .search-sidebar.open {
            display: block;
          }

          .property-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 550px) {
          .search-page {
            padding: 20px 12px 55px;
          }

          .results-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .sort-select {
            width: 100%;
          }

          .property-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="search-page">
        <div className="search-container">

          <header className="search-header">
            <h1>
              Search Properties
            </h1>

            <p>
              Find your ideal property using
              advanced search and filters.
            </p>
          </header>

          <button
            className="mobile-filter-btn"
            onClick={() =>
              setShowFilters(
                (previous) => !previous
              )
            }
          >
            ⚙{" "}
            {showFilters
              ? "Hide Filters"
              : "Show Filters"}
            {activeFilterCount() > 0
              ? ` (${activeFilterCount()})`
              : ""}
          </button>

          <div className="search-main">

            <aside
              className={`search-sidebar ${
                showFilters
                  ? "open"
                  : ""
              }`}
            >

              <div className="filter-heading">
                <h2>
                  Filters
                </h2>

                <button
                  className="clear-btn"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Search
                </label>

                <input
                  className="filter-input"
                  value={filters.keyword}
                  onChange={(e) =>
                    updateFilter(
                      "keyword",
                      e.target.value
                    )
                  }
                  placeholder="Property, location..."
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Listing Type
                </label>

                <select
                  className="filter-select"
                  value={filters.listingType}
                  onChange={(e) =>
                    updateFilter(
                      "listingType",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    All
                  </option>
                  <option value="sale">
                    For Sale
                  </option>
                  <option value="rent">
                    For Rent
                  </option>
                  <option value="lease">
                    For Lease
                  </option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Property Type
                </label>

                <select
                  className="filter-select"
                  value={filters.propertyType}
                  onChange={(e) =>
                    updateFilter(
                      "propertyType",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    All Types
                  </option>

                  {propertyTypes.map(
                    (type) => (
                      <option
                        value={type}
                        key={type}
                      >
                        {type}
                      </option>
                    )
                  )}

                  <option value="Apartment">
                    Apartment
                  </option>

                  <option value="Villa">
                    Villa
                  </option>

                  <option value="Plot">
                    Plot
                  </option>

                  <option value="Commercial">
                    Commercial
                  </option>

                  <option value="House">
                    House
                  </option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  City / Location
                </label>

                <input
                  className="filter-input"
                  list="property-cities"
                  value={filters.city}
                  onChange={(e) =>
                
