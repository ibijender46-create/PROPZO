import React, { useEffect, useMemo, useState } from "react";
import { getProperties } from "../src/api";

const DEFAULT_FILTERS = {
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

function extractNumber(value) {
  const number = Number(
    String(value ?? "").replace(/[^0-9.]/g, "")
  );

  return Number.isFinite(number) ? number : 0;
}

function money(value) {
  const amount = Number(value);

  if (!amount) return "Price on Request";

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

function getImage(property) {
  return (
    property?.image_url ||
    property?.image ||
    property?.thumbnail ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
  );
}

export default function SearchProperties() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
  });
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
      listingType: params.get("listing_type") || "",
      propertyType: params.get("property_type") || "",
      city: params.get("city") || "",
      minPrice: params.get("min_price") || "",
      maxPrice: params.get("max_price") || "",
    }));
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);

      const response = await getProperties();

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.properties)) {
        data = response.properties;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      }

      setProperties(data);
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
    setFilters({
      ...DEFAULT_FILTERS,
    });
  }

  const cities = useMemo(() => {
    return [
      ...new Set(
        properties
          .map(
            (property) =>
              property.city ||
              property.location ||
              ""
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [properties]);

  const propertyTypes = useMemo(() => {
    return [
      ...new Set(
        properties
          .map(
            (property) =>
              property.property_type || ""
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    const keyword = String(
      filters.keyword || ""
    )
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
          property.furnishing,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      );
    }

    if (filters.listingType) {
      const wanted =
        filters.listingType.toLowerCase();

      result = result.filter((property) =>
        String(
          property.listing_type || ""
        )
          .toLowerCase()
          .includes(wanted)
      );
    }

    if (filters.propertyType) {
      const wanted =
        filters.propertyType.toLowerCase();

      result = result.filter((property) =>
        String(
          property.property_type || ""
        )
          .toLowerCase()
          .includes(wanted)
      );
    }

    if (filters.city) {
      const wanted =
        filters.city.toLowerCase().trim();

      result = result.filter((property) =>
        [
          property.city,
          property.location,
          property.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(wanted)
      );
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
          extractNumber(property.area) >=
          Number(filters.minArea)
      );
    }

    if (filters.maxArea) {
      result = result.filter(
        (property) =>
          extractNumber(property.area) <=
          Number(filters.maxArea)
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
      const wanted =
        filters.furnishing.toLowerCase();

      result = result.filter(
        (property) =>
          String(
            property.furnishing || ""
          ).toLowerCase() === wanted
      );
    }

    if (filters.possession) {
      const wanted =
        filters.possession.toLowerCase();

      result = result.filter(
        (property) =>
          String(
            property.possession || ""
          ).toLowerCase() === wanted
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
      result.sort((a, b) => {
        const dateA = new Date(
          a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.created_at || 0
        ).getTime();

        return dateB - dateA;
      });
    }

    return result;
  }, [properties, filters, sortBy]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        key !== "keyword" &&
        String(value || "").trim()
    ).length;
  }, [filters]);

  function viewProperty(id) {
    if (!id) return;

    window.location.hash =
      `property/${id}`;
  }

  function postProperty() {
    window.location.hash =
      "post-property";
  }

  function getLocation(property) {
    return (
      property.location ||
      property.city ||
      property.state ||
      "Location unavailable"
    );
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
            font-family: Inter, system-ui, sans-serif;
            font-size: 18px;
            font-weight: 800;
          }

          .search-loader {
            width: 38px;
            height: 38px;
            margin-right: 12px;
            border: 4px solid #dbeafe;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: searchSpin .8s linear infinite;
          }

          @keyframes searchSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="search-loading">
          <div className="search-loader"></div>
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
              rgba(37,99,235,.09),
              transparent 30%
            ),
            #f8fafc;
          color: #0f172a;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .search-container {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
        }

        .search-header {
          margin-bottom: 22px;
        }

        .search-header h1 {
          margin: 0 0 7px;
          color: #0f172a;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 950;
          line-height: 1.1;
        }

        .search-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .mobile-filter-btn {
          display: none;
          width: 100%;
          margin-bottom: 13px;
          padding: 12px;
          border: 0;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
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
            0 8px 28px rgba(15,23,42,.05);
        }

        .filter-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .filter-heading h2 {
          margin: 0;
          color: #0f172a;
          font-size: 18px;
          font-weight: 950;
        }

        .clear-btn {
          border: 0;
          background: transparent;
          color: #dc2626;
          font-size: 11px;
          font-weight: 900;
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
          font-weight: 900;
        }

        .filter-input,
        .filter-select {
          width: 100%;
          box-sizing: border-box;
          min-height: 40px;
          padding: 9px 11px;
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
            rgba(37,99,235,.09);
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
          justify-content: space-between;
          align-items: center;
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
          min-height: 38px;
          padding: 8px 11px;
          border: 1px solid #dbe3ee;
          border-radius: 9px;
          outline: none;
          background: white;
          color: #334155;
          font-size: 11px;
          font-weight: 800;
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
          border-radius: 16px;
          background: white;
          box-shadow:
            0 7px 25px rgba(15,23,42,.04);
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .property-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 16px 35px
            rgba(15,23,42,.09);
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
          font-weight: 950;
          text-transform: uppercase;
        }

        .property-type-badge {
          position: absolute;
          right: 10px;
          top: 10px;
          padding: 5px 8px;
          border-radius: 20px;
          background: rgba(15,23,42,.78);
          color: white;
          font-size: 9px;
          font-weight: 900;
        }

        .property-card-body {
          padding: 15px;
        }

        .property-title {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 16px;
          font-weight: 950;
          line-height: 1.35;
        }

        .property-location {
          margin: 0 0 10px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .property-price {
          margin-bottom: 11px;
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
          font-weight: 850;
        }

        .view-property {
          width: 100%;
          min-height: 38px;
          padding: 9px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: white;
          font-size: 11px;
          font-weight: 950;
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
          font-weight: 950;
        }

        .empty-results p {
          margin: 0 0 18px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .post-property-btn {
          padding: 11px 17px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: white;
          font-size: 12px;
          font-weight: 950;
          cursor: pointer;
        }

        .post-property-btn:hover {
          background: #1d4ed8;
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
              advanced search and smart filters.
            </p>
          </header>

          <button
            type="button"
            className="mobile-filter-btn"
            onClick={() =>
              setShowFilters(
                (previous) => !previous
              )
            }
          >
            ⚙️{" "}
            {showFilters
              ? "Hide Filters"
              : "Show Filters"}

            {activeFilterCount > 0
              ? ` (${activeFilterCount})`
              : ""}
          </button>

          <div className="search-main">

            <aside
              className={`search-sidebar ${
                showFilters ? "open" : ""
              }`}
            >
              <div className="filter-heading">
                <h2>Filters</h2>

                <button
                  type="button"
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
                  type="search"
                  className="filter-input"
                  value={filters.keyword}
                  onChange={(event) =>
                    updateFilter(
                      "keyword",
                      event.target.value
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
                  onChange={(event) =>
                    updateFilter(
                      "listingType",
                      event.target.value
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
                  onChange={(event) =>
                    updateFilter(
                      "propertyType",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Types
                  </option>

                  {propertyTypes.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}

                  {!propertyTypes.some(
                    (type) =>
                      String(type).toLowerCase() ===
                      "apartment"
                  ) && (
                    <option value="Apartment">
                      Apartment
                    </option>
                  )}

                  {!propertyTypes.some(
                    (type) =>
                      String(type).toLowerCase() ===
                      "villa"
                  ) && (
                    <option value="Villa">
                      Villa
                    </option>
                  )}

                  {!propertyTypes.some(
                    (type) =>
                      String(type).toLowerCase() ===
                      "plot"
                  ) && (
                    <option value="Plot">
                      Plot
                    </option>
                  )}

                  {!propertyTypes.some(
                    (type) =>
                      String(type).toLowerCase() ===
                      "commercial"
                  ) && (
                    <option value="Commercial">
                      Commercial
                    </option>
                  )}

                  {!propertyTypes.some(
                    (type) =>
                      String(type).toLowerCase() ===
                      "house"
                  ) && (
                    <option value="House">
                      House
                    </option>
                  )}
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
                  onChange={(event) =>
                    updateFilter(
                      "city",
                      event.target.value
                    )
                  }
                  placeholder="Delhi, Noida, Mumbai..."
                />

                <datalist id="property-cities">
                  {cities.map((city) => (
                    <option
                      key={city}
                      value={city}
                    />
                  ))}
                </datalist>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Price Range
                </label>

                <div className="price-grid">
                  <input
                    type="number"
                    className="filter-input"
                    value={filters.minPrice}
                    onChange={(event) =>
                      updateFilter(
                        "minPrice",
                        event.target.value
                      )
                    }
                    placeholder="Min ₹"
                    min="0"
                  />

                  <input
                    type="number"
                    className="filter-input"
                    value={filters.maxPrice}
                    onChange={(event) =>
                      updateFilter(
                        "maxPrice",
                        event.target.value
                      )
                    }
                    placeholder="Max ₹"
                    min="0"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Area
                </label>

                <div className="price-grid">
                  <input
                    type="number"
                    className="filter-input"
                    value={filters.minArea}
                    onChange={(event) =>
                      updateFilter(
                        "minArea",
                        event.target.value
                      )
                    }
                    placeholder="Min area"
                    min="0"
                  />

                  <input
                    type="number"
                    className="filter-input"
                    value={filters.maxArea}
                    onChange={(event) =>
                      updateFilter(
                        "maxArea",
                        event.target.value
                      )
                    }
                    placeholder="Max area"
                    min="0"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Bedrooms
                </label>

                <select
                  className="filter-select"
                  value={filters.bedrooms}
                  onChange={(event) =>
                    updateFilter(
                      "bedrooms",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Any
                  </option>
                  <option value="1">
                    1+ BHK
                  </option>
                  <option value="2">
                    2+ BHK
                  </option>
                  <option value="3">
                    3+ BHK
                  </option>
                  <option value="4">
                    4+ BHK
                  </option>
                  <option value="5">
                    5+ BHK
                  </option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Bathrooms
                </label>

                <select
                  className="filter-select"
                  value={filters.bathrooms}
                  onChange={(event) =>
                    updateFilter(
                      "bathrooms",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Any
                  </option>
                  <option value="1">
                    1+
                  </option>
                  <option value="2">
                    2+
                  </option>
                  <option value="3">
                    3+
                  </option>
                  <option value="4">
                    4+
                  </option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Furnishing
                </label>

                <select
                  className="filter-select"
                  value={filters.furnishing}
                  onChange={(event) =>
                    updateFilter(
                      "furnishing",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Any
                  </option>
                  <option value="Furnished">
                    Furnished
                  </option>
                  <option value="Semi-Furnished">
                    Semi-Furnished
                  </option>
                  <option value="Unfurnished">
                    Unfurnished
                  </option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Possession
                </label>

                <select
                  className="filter-select"
                  value={filters.possession}
                  onChange={(event) =>
                    updateFilter(
                      "possession",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Any
                  </option>
                  <option value="Ready to Move">
                    Ready to Move
                  </option>
                  <option value="Under Construction">
                    Under Construction
                  </option>
                  <option value="Upcoming">
                    Upcoming
                  </option>
                </select>
              </div>
            </aside>

            <section className="search-results">

              <div className="results-toolbar">
                <div className="results-count">
                  <strong>
                    {filteredProperties.length}
                  </strong>{" "}
                  properties found
                </div>

                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                >
                  <option value="newest">
                    Newest First
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="area-high">
                    Largest Area First
                  </option>
                </select>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="empty-results">
                  <div className="empty-results-icon">
                    🏠
                  </div>

                  <h2>
                    No Properties Found
                  </h2>

                  <p>
                    We could not find any property
                    matching your current filters.
                    Try changing the search criteria.
                  </p>

                  <button
                    type="button"
                    className="post-property-btn"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="property-grid">
                  {filteredProperties.map(
                    (property, index) => (
                      <article
                        className="property-card"
                        key={
                          property.id ||
                          `search-property-${index}`
                        }
                      >
                        <div className="property-image">
                          <img
                            src={getImage(property)}
                            alt={
                              property.title ||
                              "PROZPO Property"
                            }
                            loading="lazy"
                          />

                          {property.listing_type && (
                            <span className="property-listing">
                              {property.listing_type}
                            </span>
                          )}

                          {property.property_type && (
                            <span className="property-type-badge">
                              {property.property_type}
                            </span>
                          )}
                        </div>

                        <div className="property-card-body">
                          <h2 className="property-title">
                            {property.title ||
                              "Property Listing"}
                          </h2>

                          <p className="property-location">
                            📍 {getLocation(property)}
                          </p>

                          <div className="property-price">
                            {money(property.price)}
                          </div>

                          <div className="property-meta">
                            {property.area && (
                              <span>
                                📐 {property.area}{" "}
                                {property.area_unit ||
                                  "sq ft"}
                              </span>
                            )}

                            {property.bedrooms && (
                              <span>
                                🛏{" "}
                                {property.bedrooms} BHK
                              </span>
                            )}

                            {property.bathrooms && (
                              <span>
                                🛁{" "}
                                {property.bathrooms} Bath
                              </span>
                            )}

                            {property.furnishing && (
                              <span>
                                {property.furnishing}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="view-property"
                            onClick={() =>
                              viewProperty(
                                property.id
                              )
                            }
                          >
                            View Property
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}

              {filteredProperties.length > 0 && (
                <div
                  style={{
                    marginTop: "25px",
                    padding: "22px",
                    borderRadius: "16px",
                    background:
                      "linear-gradient(135deg,#0f172a,#2563eb)",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "21px",
                      fontWeight: 950,
                      marginBottom: "6px",
                    }}
                  >
                    Have a Property to Sell or Rent?
                  </div>

                  <div
                    style={{
                      marginBottom: "15px",
                      color: "#dbeafe",
                      fontSize: "12px",
                    }}
                  >
                    List your property on PROZPO and
                    reach potential buyers and tenants.
                  </div>

                  <button
                    type="button"
                    className="post-property-btn"
                    style={{
                      background: "white",
                      color: "#1d4ed8",
                    }}
                    onClick={postProperty}
                  >
                    + Post Your Property
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
