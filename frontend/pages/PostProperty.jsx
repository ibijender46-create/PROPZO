import React, { useEffect, useMemo, useState } from "react";
import { createProperty, createRecord } from "../src/api";
import { supabase } from "../src/supabase";

const initialForm = {
  title: "",
  location: "",
  city: "",
  state: "",
  price: "",
  property_type: "Apartment",
  listing_type: "Sale",
  area: "",
  area_unit: "Sq. Ft.",
  bedrooms: "",
  bathrooms: "",
  furnishing: "Unfurnished",
  possession: "Ready to Move",
  description: "",
};

const PROPERTY_TYPES = [
  "Apartment", "Villa", "Independent House", "Plot",
  "Commercial", "Office", "Shop", "Warehouse",
];
const LISTING_TYPES = ["Sale", "Rent", "Lease"];
const AREA_UNITS = ["Sq. Ft.", "Sq. Yards", "Sq. M.", "Acres", "Bigha"];
const FURNISHING_TYPES = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const POSSESSION_TYPES = ["Ready to Move", "Under Construction", "Upcoming"];
const AMENITIES = [
  "Parking", "Swimming Pool", "Gym", "Lift", "CCTV", "Security",
  "Power Backup", "Park", "Club House", "Gated Community",
  "Visitor Parking", "24x7 Water",
];

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const STORAGE_BUCKET = "property-media";

function formatPrice(value) {
  const n = Number(value);
  if (!n || !Number.isFinite(n)) return "₹ Price";
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹ ${(n / 1000).toFixed(1)}K`;
  return `₹ ${n.toLocaleString("en-IN")}`;
}

function initials(value) {
  return String(value || "Property")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem("propzo_session") || "{}");
  } catch {
    return {};
  }
}

export default function PostProperty() {
  const [form, setForm] = useState(initialForm);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [step, setStep] = useState(1);

  const progress = useMemo(() => step * 100 / 3, [step]);

  useEffect(() => {
    const urls = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));
    setPreviews(urls);

    return () => {
      urls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  function showMessage(text, type = "error") {
    setMessage(text);
    setMessageType(type);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function chooseFiles(event) {
    const incoming = Array.from(event.target.files || []);
    event.target.value = "";

    const combined = [...files, ...incoming];

    if (combined.length > MAX_FILES) {
      showMessage(`Maximum ${MAX_FILES} photos/videos allowed.`);
      return;
    }

    const invalid = incoming.find((file) => {
      const supported =
        file.type.startsWith("image/") ||
        file.type.startsWith("video/");
      return !supported || file.size > MAX_FILE_SIZE;
    });

    if (invalid) {
      showMessage(
        "Only image/video files up to 50 MB each are allowed."
      );
      return;
    }

    setFiles(combined);
    setMessage("");
    setMessageType("");
  }

  function removeFile(index) {
    setFiles((previous) => previous.filter((_, i) => i !== index));
  }

  function toggleAmenity(amenity) {
    setSelectedAmenities((previous) =>
      previous.includes(amenity)
        ? previous.filter((item) => item !== amenity)
        : [...previous, amenity]
    );
  }

  function validateStepOne() {
    if (!form.title.trim()) return "Property title is required.";
    if (!form.location.trim()) return "Property location is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      return "Please enter a valid property price.";
    }
    return "";
  }

  function validateStepTwo() {
    if (form.area && (!Number.isFinite(Number(form.area)) || Number(form.area) <= 0)) {
      return "Please enter a valid property area.";
    }
    if (form.bedrooms && Number(form.bedrooms) < 0) {
      return "Please enter valid bedrooms.";
    }
    if (form.bathrooms && Number(form.bathrooms) < 0) {
      return "Please enter valid bathrooms.";
    }
    return "";
  }

  function nextStep() {
    setMessage("");
    const error = step === 1 ? validateStepOne() : validateStepTwo();

    if (error) {
      showMessage(error);
      return;
    }

    setStep((previous) => Math.min(3, previous + 1));
  }

  function previousStep() {
    setMessage("");
    setStep((previous) => Math.max(1, previous - 1));
  }

  async function getStorageSession() {
    const accessToken = localStorage.getItem("prozpo_access_token");
    const savedSession = readSession();
    const refreshToken = savedSession.refresh_token;

    if (!accessToken) {
      throw new Error("Please login before posting a property.");
    }

    if (!refreshToken) {
      throw new Error(
        "Your login session is incomplete. Please log out and login again."
      );
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !data?.session?.user) {
      throw new Error(
        error?.message || "Login session expired. Please login again."
      );
    }

    localStorage.setItem(
      "prozpo_access_token",
      data.session.access_token
    );
    localStorage.setItem(
      "propzo_session",
      JSON.stringify(data.session)
    );

    return data.session;
  }

  async function uploadMedia(userId) {
    const uploaded = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const safeName = file.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-");

      const path = `${userId}/${Date.now()}-${index}-${safeName}`;

      setUploadProgress(`Uploading file ${index + 1} of ${files.length}...`);

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        throw new Error(
          `Media upload failed: ${error.message}. Check the "${STORAGE_BUCKET}" Storage bucket and its upload policies.`
        );
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

      if (!data?.publicUrl) {
        throw new Error("Could not generate a public URL for an uploaded file.");
      }

      uploaded.push({
        url: data.publicUrl,
        isVideo: file.type.startsWith("video/"),
        name: file.name,
      });
    }

    return uploaded;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    const firstError = validateStepOne();
    const secondError = validateStepTwo();

    if (firstError) {
      setStep(1);
      showMessage(firstError);
      return;
    }

    if (secondError) {
      setStep(2);
      showMessage(secondError);
      return;
    }

    if (!form.description.trim()) {
      setStep(3);
      showMessage("Please add a property description.");
      return;
    }

    setLoading(true);

    let propertyCreated = false;

    try {
      const session = await getStorageSession();
      const userId = session.user.id;

      const uploadedMedia = await uploadMedia(userId);
      const firstImage = uploadedMedia.find((item) => !item.isVideo);

      const descriptionParts = [form.description.trim()];

      if (selectedAmenities.length) {
        descriptionParts.push(
          `Amenities: ${selectedAmenities.join(", ")}`
        );
      }

      const propertyData = {
        title: form.title.trim(),
        location: form.location.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        price: Number(form.price),
        property_type: form.property_type,
        listing_type: form.listing_type,
        area: form.area ? Number(form.area) : null,
        area_unit: form.area_unit,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        furnishing: form.furnishing,
        possession: form.possession,
        description: descriptionParts.join("\n\n"),
        image_url: firstImage?.url || null,
        status: "active",
      };

      setUploadProgress("Saving property details...");

      const created = await createProperty(propertyData);
      const propertyId = created?.id || created?.property?.id;

      if (!propertyId) {
        throw new Error(
          "Property response did not contain an ID. Please check the API response."
        );
      }

      propertyCreated = true;

      const mediaErrors = [];

      for (let index = 0; index < uploadedMedia.length; index += 1) {
        const media = uploadedMedia[index];

        try {
          await createRecord("property-images", {
            property_id: propertyId,
            image_url: media.url,
            is_primary: Boolean(firstImage && media.url === firstImage.url),
            sort_order: index,
          });
      } catch (error) {
          mediaErrors.push(error?.message || "Media record could not be saved.");
        }
      }

      if (mediaErrors.length) {
        showMessage(
          "Property saved, but some media records could not be linked. Please check property_images permissions.",
          "error"
        );
        return;
      }

      showMessage(
        uploadedMedia.length
          ? "Property published successfully with your selected media!"
          : "Property published successfully!",
        "success"
      );

      setForm(initialForm);
      setSelectedAmenities([]);
      setFiles([]);
      setStep(1);

      window.setTimeout(() => {
        window.location.hash = "my-properties";
      }, 1600);
    } catch (error) {
      console.error("PROZPO property posting error:", error);

      let text = error?.message || "Unable to publish property.";

      if (!propertyCreated && /authentication|login session|jwt|token/i.test(text)) {
        localStorage.removeItem("prozpo_access_token");
        showMessage(`${text} Please login again.`);
        window.setTimeout(() => {
          window.location.hash = "auth";
        }, 1400);
      } else {
        showMessage(text);
      }
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  }

  return (
    <main className="prozpo-post-page">
      <div className="post-orb post-orb-one" />
      <div className="post-orb post-orb-two" />
      <div className="post-grid" />

      <div className="post-container">
        <header className="post-header">
          <div className="post-badge">
            <span className="post-badge-dot" />
            PROZPO PROPERTY LISTING
          </div>

          <h1>
            List Your Property
            <span>Find the Right Buyer</span>
          </h1>

          <p>
            Add your property to India's modern real-estate marketplace and
            connect with genuine buyers, tenants and property seekers.
          </p>

          <div className="post-trust-row">
            <span>✓ Easy Listing</span>
            <span>✓ Reach Buyers</span>
            <span>✓ Fast Enquiries</span>
            <span>✓ PROZPO Marketplace</span>
          </div>
        </header>

        <section className="post-progress-card">
          <div className="progress-top">
            <div>
              <span>STEP {step} OF 3</span>
              <strong>
                {step === 1 && "Property Information"}
                {step === 2 && "Property Specifications"}
                {step === 3 && "Description & Publish"}
              </strong>
            </div>
            <div className="progress-percent">{Math.round(progress)}%</div>
          </div>

          <div className="progress-track">
            <div className="progress-value" style={{ width: `${progress}%` }} />
          </div>

          <div className="progress-steps">
            {["Basic Details", "Specifications", "Publish"].map((label, index) => (
              <div
                key={label}
                className={step >= index + 1 ? "progress-step active" : "progress-step"}
              >
                <span>{index + 1}</span>
                <small>{label}</small>
              </div>
            ))}
          </div>
        </section>

        <div className="post-layout">
          <section className="post-form-card">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="form-step">
                  <div className="step-heading">
                    <div className="step-icon">🏠</div>
                    <div>
                      <span>STEP 01</span>
                      <h2>Basic Property Details</h2>
                      <p>Tell buyers what kind of property you are listing.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="field full">
                      <label>Property Title <b>*</b></label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Premium 3 BHK Apartment in Noida"
                        required
                      />
                      <small>Use a clear and attractive title for better enquiries.</small>
                    </div>

                    <div className="field">
                      <label>Property Location <b>*</b></label>
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Sector 62, Noida"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>City <b>*</b></label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Noida"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>State <b>*</b></label>
                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="Uttar Pradesh"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Price <b>*</b></label>
                      <div className="input-with-prefix">
                        <span>₹</span>
                        <input
                          name="price"
                          type="number"
                          min="1"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="8500000"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="choice-section">
                    <label className="choice-label">Listing Type</label>
                    <div className="choice-grid">
                      {LISTING_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={form.listing_type === type ? "choice-card selected" : "choice-card"}
                          onClick={() => setForm((p) => ({ ...p, listing_type: type }))}
                        >
                          <span>{type === "Sale" ? "🏷️" : type === "Rent" ? "🔑" : "📄"}</span>
                          <strong>For {type}</strong>
                          {form.listing_type === type && <i>✓</i>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="choice-section">
                    <label className="choice-label">Property Type</label>
                    <div className="type-grid">
                      {PROPERTY_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={form.property_type === type ? "type-card selected" : "type-card"}
                          onClick={() => setForm((p) => ({ ...p, property_type: type }))}
                        >
                          <span>
                            {{
                              Apartment: "🏢",
                              Villa: "🏡",
                              "Independent House": "🏠",
                              Plot: "📐",
                              Commercial: "🏬",
                              Office: "💼",
                              Shop: "🛍️",
                              Warehouse: "🏭",
                            }[type]}
                          </span>
                          <strong>{type}</strong>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="step-actions">
                    <button type="button" className="next-button" onClick={nextStep}>
                      Continue to Specifications <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="form-step">
                  <div className="step-heading">
                    <div className="step-icon green">📐</div>
                    <div>
                      <span>STEP 02</span>
                      <h2>Property Specifications</h2>
                      <p>Add important property specifications for buyers.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label>Property Area</label>
                      <input
                        name="area"
                        type="number"
                        min="0"
                        value={form.area}
                        onChange={handleChange}
                        placeholder="1200"
                      />
                    </div>

                    <div className="field">
                      <label>Area Unit</label>
                      <select name="area_unit" value={form.area_unit} onChange={handleChange}>
                        {AREA_UNITS.map((unit) => <option key={unit}>{unit}</option>)}
                      </select>
                    </div>

                    <div className="field">
                      <label>Bedrooms</label>
                      <select name="bedrooms" value={form.bedrooms} onChange={handleChange}>
                        <option value="">Select Bedrooms</option>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>{n === 6 ? "6+ BHK" : `${n} BHK`}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Bathrooms</label>
                      <select name="bathrooms" value={form.bathrooms} onChange={handleChange}>
                        <option value="">Select Bathrooms</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{n === 5 ? "5+ Bathrooms" : `${n} Bathroom${n > 1 ? "s" : ""}`}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Furnishing</label>
                      <select name="furnishing" value={form.furnishing} onChange={handleChange}>
                        {FURNISHING_TYPES.map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </div>

                    <div className="field">
                      <label>Possession</label>
                      <select name="possession" value={form.possession} onChange={handleChange}>
                        {POSSESSION_TYPES.map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="amenity-section">
                    <div className="amenity-heading">
                      <div>
                        <label>Property Amenities</label>
                        <small>Select available facilities.</small>
                      </div>
                      <span>{selectedAmenities.length} selected</span>
                    </div>
                    <div className="amenity-grid">
                      {AMENITIES.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          className={selectedAmenities.includes(amenity) ? "amenity-chip selected" : "amenity-chip"}
                          onClick={() => toggleAmenity(amenity)}
                        >
                          <span>{selectedAmenities.includes(amenity) ? "✓" : "+"}</span>
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="media-upload-section">
                    <div className="media-heading">
                      <div>
                        <strong>Property Photos & Videos</strong>
                        <p>Select files directly from your phone or computer.</p>
                      </div>
                      <span>{files.length}/{MAX_FILES}</span>
                    </div>

                    <label className="upload-dropzone">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={chooseFiles}
                        disabled={loading || files.length >= MAX_FILES}
                      />
                      <span className="upload-icon">↑</span>
                      <strong>Choose photos or videos</strong>
                      <small>Up to {MAX_FILES} files · Maximum 50 MB per file</small>
                      <em>JPG, PNG, WEBP, MP4 and other supported device media</em>
                    </label>

                    {previews.length > 0 && (
                      <div className="media-preview-grid">
                        {previews.map((item, index) => (
                          <div className="media-preview-item" key={`${item.file.name}-${index}`}>
                            {item.isVideo ? (
                              <video src={item.url} controls playsInline />
                            ) : (
                              <img src={item.url} alt={item.file.name} />
                            )}
                            <span className="media-kind">{item.isVideo ? "VIDEO" : "PHOTO"}</span>
                            <button
                              type="button"
                              aria-label={`Remove ${item.file.name}`}
                              onClick={() => removeFile(index)}
                              disabled={loading}
                            >
                              ×
                            </button>
                            <small>{item.file.name}</small>
                          </div>
                        ))}
                      </div>
                    )}
                    <small className="upload-note">
                      Files are uploaded to the PROZPO Storage bucket when you publish.
                    </small>
                  </div>

                  <div className="step-actions two">
                    <button type="button" className="back-button" onClick={previousStep}>← Back</button>
                    <button type="button" className="next-button" onClick={nextStep}>
                      Continue to Publish <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="form-step">
                  <div className="step-heading">
                    <div className="step-icon orange">🚀</div>
                    <div>
                      <span>STEP 03</span>
                      <h2>Description & Publish</h2>
                      <p>Add the final details and publish your property.</p>
                    </div>
                  </div>

                  <div className="field full">
                    <label>Property Description <b>*</b></label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the property, location advantages, connectivity, nearby facilities and investment benefits..."
                      required
                    />
                    <small>A detailed description can help generate better enquiries.</small>
                  </div>

                  {selectedAmenities.length > 0 && (
                    <div className="selected-amenities-box">
                      <strong>Selected Amenities</strong>
                      <div>
                        {selectedAmenities.map((item) => <span key={item}>✓ {item}</span>)}
                      </div>
                    </div>
                  )}

                  <div className="final-image-preview">
                    <div className="preview-heading">
                      <span>PROPERTY PREVIEW</span>
                      <strong>Live Listing Preview</strong>
                    </div>
                    <div className="preview-card">
                      <div className="preview-image">
                        {previews[0] ? (
                          previews[0].isVideo ? (
                            <video src={previews[0].url} controls playsInline />
                          ) : (
                            <img src={previews[0].url} alt={form.title || "Property"} />
                          )
                        ) : (
                          <div className="preview-placeholder">
                            <div>{initials(form.title)}</div>
                            <span>Property Image</span>
                          </div>
                        )}
                        <div className="preview-badge">{form.listing_type}</div>
                      </div>
                      <div className="preview-content">
                        <div className="preview-price">{formatPrice(form.price)}</div>
                        <h3>{form.title || "Your Property Title"}</h3>
                        <p>📍 {form.location || "Property Location"}{form.city ? `, ${form.city}` : ""}</p>
                        <div className="preview-meta">
                          {form.area && <span>📐 {form.area} {form.area_unit}</span>}
                          {form.bedrooms && <span>🛏️ {form.bedrooms} BHK</span>}
                          {form.bathrooms && <span>🚿 {form.bathrooms} Bath</span>}
                          <span>{files.length} media file(s)</span>
                        </div>
                      </div>
                    </div>
                    {previews.length > 1 && (
                      <div className="preview-thumbnails">
                        {previews.map((item, index) => (
                          <div key={`${item.file.name}-${index}`}>
                            {item.isVideo ? <video src={item.url} muted /> : <img src={item.url} alt="" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="publish-info">
                    <div className="publish-icon">✓</div>
                    <div>
                      <strong>Ready to publish?</strong>
                      <p>Your property details will be saved to PROZPO. Photos and videos will be uploaded to Storage and linked to the listing.</p>
                    </div>
                  </div>

                  <div className="step-actions two">
                    <button type="button" className="back-button" onClick={previousStep} disabled={loading}>← Back</button>
                    <button type="submit" className="publish-button" disabled={loading}>
                      {loading ? <><span className="button-spinner" /> Publishing...</> : <>🚀 Publish Property <span>→</span></>}
                    </button>
                  </div>

                  {uploadProgress && <div className="upload-progress">{uploadProgress}</div>}
                </div>
              )}

              {message && (
                <div className={`post-message ${messageType}`}>
                  <span>{messageType === "success" ? "✓" : "!"}</span>
                  <p>{message}</p>
                </div>
              )}
            </form>
          </section>

          <aside className="post-sidebar">
            <div className="sidebar-card live-preview-card">
              <div className="sidebar-card-heading">
                <div>
                  <span>LIVE PREVIEW</span>
                  <strong>Your Property</strong>
                </div>
                <div className="live-dot"><span /> LIVE</div>
              </div>

              <div className="side-property">
                <div className="side-property-image">
                  {previews[0] ? (
                    previews[0].isVideo ? (
                      <video src={previews[0].url} muted playsInline />
                    ) : (
                      <img src={previews[0].url} alt={form.title || "Property preview"} />
                    )
                  ) : (
                    <div className="side-placeholder">🏠</div>
                  )}
                  <span>{form.listing_type}</span>
                </div>
                <div className="side-property-body">
                  <strong>{form.title || "Your Property"}</strong>
                  <p>📍 {form.city || "City"}{form.state ? `, ${form.state}` : ""}</p>
                  <b>{formatPrice(form.price)}</b>
                  <div className="side-property-meta">
                    <span>{form.property_type}</span>
                    {form.area && <span>{form.area} {form.area_unit}</span>}
                    {files.length > 0 && <span>{files.length} media</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title">Why List on PROZPO?</div>
              {[
                ["👥", "Reach Property Seekers", "Showcase your property to relevant buyers and tenants."],
                ["⚡", "Quick Enquiries", "Make it easier for users to discover your listing."],
                ["📍", "Location Discovery", "City and locality help users find your property."],
                ["📱", "Media Showcase", "Add photos and videos to present your property."],
              ].map(([icon, title, description]) => (
                <div className="benefit" key={title}>
                  <span>{icon}</span>
                  <div><strong>{title}</strong><p>{description}</p></div>
                </div>
              ))}
            </div>

            <div className="sidebar-card listing-flow">
              <div className="sidebar-title">PROZPO Listing Flow</div>
              {[
                ["1", "Create Listing", "Add property details"],
                ["2", "Publish", "Save your listing"],
                ["3", "Property Discovery", "Appear in relevant sections"],
                ["4", "Enquiries", "Connect with property seekers"],
              ].map(([number, title, description], index) => (
                <React.Fragment key={number}>
                  <div className="flow-item">
                    <span>{number}</span>
                    <div><strong>{title}</strong><small>{description}</small></div>
                  </div>
                  {index < 3 && <div className="flow-line" />}
                </React.Fragment>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .prozpo-post-page {
          --blue:#2563eb; --cyan:#0ea5e9; --green:#10b981;
          --text:#0f172a; --muted:#64748b; --border:#e2e8f0;
          position:relative; min-height:100vh; padding:55px 20px 90px;
          overflow:hidden; color:var(--text);
          background:radial-gradient(circle at 10% 5%,#2563eb1f,transparent 28%),
          radial-gradient(circle at 90% 30%,#14b8a616,transparent 25%),#f8fafc;
        }
        .prozpo-post-page *, .prozpo-post-page *:before, .prozpo-post-page *:after {box-sizing:border-box}
        .prozpo-post-page button,.prozpo-post-page input,.prozpo-post-page select,.prozpo-post-page textarea {font:inherit}
        .post-orb {position:absolute;border-radius:50%;pointer-events:none;filter:blur(15px)}
        .post-orb-one {width:360px;height:360px;left:-230px;top:180px;background:#2563eb12;animation:orbOne 8s ease-in-out infinite}
        .post-orb-two {width:320px;height:320px;right:-190px;bottom:80px;background:#10b98112;animation:orbTwo 9s ease-in-out infinite}
        .post-grid {position:absolute;inset:0;pointer-events:none;opacity:.3;background-image:linear-gradient(#94a3b410 1px,transparent 1px),linear-gradient(90deg,#94a3b410 1px,transparent 1px);background-size:42px 42px}
        .post-container {position:relative;z-index:2;width:min(100%,1240px);margin:auto}
        .post-header {max-width:850px;margin:0 auto 32px;text-align:center;animation:fadeUp .6s ease both}
        .post-badge {display:inline-flex;align-items:center;gap:9px;padding:9px 14px;border:1px solid #bfdbfe;border-radius:99px;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:950;letter-spacing:1.1px}
        .post-badge-dot,.live-dot span {width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 0 5px #10b98118;animation:pulse 1.8s infinite}
        .post-header h1 {margin:19px 0 13px;font-size:clamp(36px,5vw,60px);line-height:1.04;letter-spacing:-2.5px;font-weight:950}
        .post-header h1 span {display:block;background:linear-gradient(90deg,#2563eb,#0ea5e9,#10b981);-webkit-background-clip:text;background-clip:text;color:transparent}
        .post-header>p {max-width:720px;margin:auto;color:var(--muted);font-size:14px;line-height:1.75}
        .post-trust-row {display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-top:18px}
        .post-trust-row span {padding:7px 10px;border:1px solid var(--border);border-radius:99px;background:#ffffffd9;color:#475569;font-size:10px;font-weight:800}
        .post-progress-card {max-width:900px;margin:0 auto 24px;padding:20px 22px;border:1px solid var(--border);border-radius:18px;background:#fffffff0;box-shadow:0 12px 35px #0f172a0f;animation:fadeUp .7s ease both}
        .progress-top {display:flex;justify-content:space-between;align-items:center;gap:20px}
        .progress-top span {display:block;margin-bottom:4px;color:var(--blue);font-size:9px;font-weight:950;letter-spacing:1px}
        .progress-top strong {font-size:14px;font-weight:900}
        .progress-percent {color:var(--blue);font-size:18px;font-weight:950}
        .progress-track {height:7px;margin-top:14px;overflow:hidden;border-radius:99px;background:#e2e8f0}
        .progress-value {height:100%;border-radius:99px;background:linear-gradient(90deg,#2563eb,#0ea5e9,#10b981);transition:width .4s}
        .progress-steps {display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
        .progress-step {display:flex;align-items:center;gap:7px;color:#94a3b8}
        .progress-step span {width:24px;height:24px;display:grid;place-items:center;border-radius:50%;background:#e2e8f0;font-size:10px;font-weight:950}
        .progress-step small {font-size:10px;font-weight:800}
        .progress-step.active {color:var(--blue)}
        .progress-step.active span {background:var(--blue);color:white;box-shadow:0 5px 12px #2563eb38}
        .post-layout {display:grid;grid-template-columns:minmax(0,1fr) 320px;align-items:start;gap:22px}
        .post-form-card,.sidebar-card {border:1px solid var(--border);border-radius:21px;background:#fff;box-shadow:0 18px 50px #0f172a0d}
        .post-form-card {overflow:hidden;animation:fadeUp .8s ease both}
        .form-step {padding:30px;animation:stepIn .3s ease both}
        .step-heading {display:flex;align-items:flex-start;gap:14px;margin-bottom:26px}
        .step-icon {flex:0 0 auto;width:48px;height:48px;display:grid;place-items:center;border-radius:14px;background:#eff6ff;box-shadow:inset 0 0 0 1px #dbeafe;font-size:22px}
        .step-icon.green {background:#ecfdf5;box-shadow:inset 0 0 0 1px #bbf7d0}
        .step-icon.orange {background:#fff7ed;box-shadow:inset 0 0 0 1px #fed7aa}
        .step-heading span {color:var(--blue);font-size:9px;font-weight:950;letter-spacing:1px}
        .step-heading h2 {margin:4px 0 5px;font-size:22px;font-weight:950;letter-spacing:-.5px}
        .step-heading p {margin:0;color:var(--muted);font-size:12px;line-height:1.6}
        .form-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        .field {min-width:0;display:flex;flex-direction:column;gap:7px}
        .field.full {grid-column:1/-1}
        .field label,.choice-label,.amenity-heading label {color:#334155;font-size:11px;font-weight:900}
        .field label b {margin-left:3px;color:#dc2626}
        .field small,.upload-note {color:#94a3b8;font-size:10px;line-height:1.5}
        .field input,.field select,.field textarea {width:100%;min-height:47px;padding:12px 13px;border:1px solid #dbe3ee;border-radius:11px;outline:none;background:white;color:#0f172a;font-size:13px;transition:border-color .2s,box-shadow .2s}
        .field textarea {min-height:160px;resize:vertical;line-height:1.7}
        .field input:focus,.field select:focus,.field textarea:focus {border-color:#60a5fa;box-shadow:0 0 0 4px #2563eb12}
        .input-with-prefix {position:relative}
        .input-with-prefix>span {position:absolute;left:13px;top:50%;z-index:1;color:var(--blue);font-weight:950;transform:translateY(-50%)}
        .input-with-prefix input {padding-left:30px}
        .choice-section {margin-top:25px}
        .choice-label {display:block;margin-bottom:10px}
        .choice-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
        .choice-card {position:relative;min-height:66px;display:flex;align-items:center;gap:9px;padding:11px;border:1px solid var(--border);border-radius:13px;background:white;color:#334155;text-align:left;cursor:pointer;transition:.2s}
        .choice-card:hover,.choice-card.selected,.type-card:hover,.type-card.selected {border-color:#60a5fa;background:#eff6ff;transform:translateY(-2px)}
        .choice-card>span {font-size:20px}.choice-card strong {font-size:12px;font-weight:900}
        .choice-card i {position:absolute;top:6px;right:7px;width:17px;height:17px;display:grid;place-items:center;border-radius:50%;background:var(--blue);color:white;font-size:9px;font-style:normal}
        .type-grid {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
        .type-card {min-height:73px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px;border:1px solid var(--border);border-radius:12px;background:white;color:#475569;cursor:pointer;transition:.2s}
        .type-card span {font-size:21px}.type-card strong {font-size:10px;font-weight:850;text-align:center}
        .amenity-section {margin-top:25px;padding:17px;border:1px solid var(--border);border-radius:15px;background:#f8fafc}
        .amenity-heading,.media-heading {display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}
        .amenity-heading small,.media-heading p {display:block;margin:4px 0 0;color:#94a3b8;font-size:10px}
        .amenity-heading>span,.media-heading>span {padding:6px 9px;border-radius:99px;background:white;color:var(--blue);font-size:10px;font-weight:900}
        .amenity-grid {display:flex;flex-wrap:wrap;gap:7px}
        .amenity-chip {display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid #dbe3ee;border-radius:99px;background:white;color:#475569;font-size:10px;font-weight:800;cursor:pointer;transition:.18s}
        .amenity-chip:hover,.amenity-chip.selected {border-color:#60a5fa;background:#eff6ff;color:#1d4ed8}
        .media-upload-section {margin-top:25px;padding:18px;border:1px solid #bfdbfe;border-radius:16px;background:linear-gradient(135deg,#f8fbff,#f0fdfa)}
        .media-heading strong {font-size:13px;font-weight:950}.upload-dropzone {position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 12px;border:1.5px dashed #93c5fd;border-radius:14px;background:#ffffffc9;text-align:center;cursor:pointer;transition:.2s}
        .upload-dropzone:hover {border-color:var(--blue);background:#eff6ff}
        .upload-dropzone input {position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
        .upload-icon {width:42px;height:42px;display:grid;place-items:center;border-radius:13px;background:#dbeafe;color:var(--blue);font-size:25px;font-weight:900}
        .upload-dropzone strong {font-size:13px;font-weight:900}.upload-dropzone small,.upload-dropzone em {color:#64748b;font-size:10px;font-style:normal}
        .media-preview-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:15px}
        .media-preview-item {position:relative;min-width:0;overflow:hidden;border:1px solid var(--border);border-radius:12px;background:white}
        .media-preview-item img,.media-preview-item video {width:100%;height:105px;display:block;object-fit:cover;background:#e2e8f0}
        .media-preview-item>button {position:absolute;top:5px;right:5px;width:25px;height:25px;border:0;border-radius:50%;background:#dc2626;color:white;font-size:19px;cursor:pointer}
        .media-preview-item>small {display:block;overflow:hidden;padding:7px;color:#475569;font-size:9px;text-overflow:ellipsis;white-space:nowrap}
        .media-kind {position:absolute;top:7px;left:6px;padding:4px 6px;border-radius:6px;background:#0f172acc;color:white;font-size:8px;font-weight:900}
        .upload-note {display:block;margin-top:10px}
        .step-actions {display:flex;justify-content:flex-end;gap:10px;margin-top:28px}
        .step-actions.two {justify-content:space-between}
        .next-button,.publish-button,.back-button {min-height:47px;display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:12px 17px;border-radius:11px;font-size:12px;font-weight:950;cursor:pointer;transition:.2s}
        .next-button,.publish-button {border:0;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:white;box-shadow:0 10px 24px #2563eb33}
        .next-button:hover,.publish-button:hover:not(:disabled) {transform:translateY(-2px);box-shadow:0 14px 28px #2563eb47}
        .back-button {border:1px solid #dbe3ee;background:white;color:#475569}
        .back-button:hover:not(:disabled) {background:#eff6ff;border-color:#93c5fd;color:#1d4ed8}
        .publish-button {min-width:205px}.publish-button:disabled,.back-button:disabled {opacity:.65;cursor:not-allowed}
        .button-spinner {width:16px;height:16px;border:2px solid #ffffff66;border-top-color:white;border-radius:50%;animation:spin .7s linear infinite}
        .selected-amenities-box {margin-top:20px;padding:15px;border:1px solid #bbf7d0;border-radius:13px;background:#f0fdf4}
        .selected-amenities-box strong {display:block;margin-bottom:9px;color:#166534;font-size:11px}
        .selected-amenities-box>div {display:flex;flex-wrap:wrap;gap:6px}
        .selected-amenities-box span {padding:6px 8px;border-radius:99px;background:#dcfce7;color:#166534;font-size:9px;font-weight:800}
        .final-image-preview {margin-top:24px;padding:17px;border:1px solid var(--border);border-radius:16px;background:#f8fafc}
        .preview-heading {margin-bottom:13px}.preview-heading span,.preview-heading strong {display:block}
        .preview-heading span {color:var(--blue);font-size:8px;font-weight:950;letter-spacing:1px}
        .preview-heading strong {margin-top:4px;font-size:14px;font-weight:950}
        .preview-card {display:grid;grid-template-columns:190px minmax(0,1fr);overflow:hidden;border:1px solid var(--border);border-radius:14px;background:white}
        .preview-image {position:relative;min-height:180px;overflow:hidden;background:linear-gradient(135deg,#dbeafe,#ccfbf1)}
        .preview-image img,.preview-image video {width:100%;height:100%;min-height:180px;display:block;object-fit:cover}
        .preview-placeholder {min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#64748b}
        .preview-placeholder div {width:52px;height:52px;display:grid;place-items:center;border-radius:15px;background:var(--blue);color:white;font-size:20px;font-weight:950}
        .preview-placeholder span {font-size:9px;font-weight:800}
        .preview-badge {position:absolute;top:10px;left:10px;padding:6px 8px;border-radius:99px;background:white;color:#1d4ed8;font-size:8px;font-weight:950}
        .preview-content {padding:16px;min-width:0}.preview-price {color:var(--blue);font-size:18px;font-weight:950}
        .preview-content h3 {margin:5px 0 6px;font-size:15px;font-weight:950;overflow-wrap:anywhere}
        .preview-content p {margin:0;color:#64748b;font-size:10px;overflow-wrap:anywhere}
        .preview-meta {display:flex;flex-wrap:wrap;gap:6px;margin-top:13px}
        .preview-meta span {padding:6px 7px;border-radius:7px;background:#f1f5f9;color:#475569;font-size:8px;font-weight:800}
        .preview-thumbnails {display:flex;gap:7px;overflow-x:auto;margin-top:12px}
        .preview-thumbnails>div {flex:0 0 65px;height:55px;overflow:hidden;border-radius:8px;background:#e2e8f0}
        .preview-thumbnails img,.preview-thumbnails video {width:100%;height:100%;object-fit:cover}
        .publish-info {display:flex;gap:11px;margin-top:20px;padding:15px;border:1px solid #bfdbfe;border-radius:13px;background:#eff6ff}
        .publish-icon {flex:0 0 auto;width:31px;height:31px;display:grid;place-items:center;border-radius:9px;background:var(--blue);color:white;font-weight:950}
        .publish-info strong {color:#1e3a8a;font-size:11px}.publish-info p {margin:4px 0 0;color:#475569;font-size:9px;line-height:1.6}
        .post-message {display:flex;align-items:center;gap:9px;margin:18px 20px 20px;padding:13px;border-radius:11px;font-size:11px;font-weight:750;overflow-wrap:anywhere}
        .post-message span {flex:0 0 auto;width:22px;height:22px;display:grid;place-items:center;border-radius:50%;color:white;font-weight:950}
        .post-message p {margin:0}.post-message.success {border:1px solid #a7f3d0;background:#ecfdf5;color:#047857}.post-message.success span {background:#10b981}
        .post-message.error {border:1px solid #fecaca;background:#fef2f2;color:#b91c1c}.post-message.error span {background:#ef4444}
        .upload-progress {margin-top:14px;padding:10px;border-radius:9px;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:800}
        .post-sidebar {position:sticky;top:18px;display:grid;gap:15px}
        .sidebar-card {padding:18px}.sidebar-card-heading {display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:14px}
        .sidebar-card-heading span:first-child {display:block;color:var(--blue);font-size:8px;font-weight:950;letter-spacing:1px}
        .sidebar-card-heading strong {display:block;margin-top:4px;font-size:15px;font-weight:950}
        .live-dot {display:inline-flex;align-items:center;gap:6px;color:#059669;font-size:8px;font-weight:950}
        .side-property {overflow:hidden;border:1px solid var(--border);border-radius:13px;background:white}
        .side-property-image {position:relative;height:155px;overflow:hidden;background:linear-gradient(135deg,#dbeafe,#ccfbf1)}
        .side-property-image img,.side-property-image video {width:100%;height:100%;display:block;object-fit:cover}
        .side-placeholder {height:100%;display:grid;place-items:center;font-size:45px;animation:houseFloat 3s ease-in-out infinite}
        .side-property-image>span {position:absolute;top:9px;left:9px;padding:6px 8px;border-radius:99px;background:white;color:#1d4ed8;font-size:8px;font-weight:950}
        .side-property-body {padding:13px}.side-property-body>strong {display:block;overflow:hidden;font-size:12px;font-weight:950;text-overflow:ellipsis;white-space:nowrap}
        .side-property-body p {margin:5px 0;color:#64748b;font-size:9px}.side-property-body>b {display:block;margin-top:7px;color:var(--blue);font-size:16px;font-weight:950}
        .side-property-meta {display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.side-property-meta span {padding:5px 6px;border-radius:6px;background:#f1f5f9;color:#475569;font-size:7px;font-weight:800}
        .sidebar-title {margin-bottom:15px;font-size:14px;font-weight:950}
        .benefit {display:flex;align-items:flex-start;gap:9px;margin-bottom:14px}.benefit:last-child {margin-bottom:0}
        .benefit>span {flex:0 0 auto;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#eff6ff;font-size:15px}
        .benefit strong {display:block;color:#334155;font-size:10px;font-weight:900}.benefit p {margin:3px 0 0;color:#94a3b8;font-size:8px;line-height:1.55}
        .flow-item {display:flex;align-items:center;gap:9px}.flow-item>span {flex:0 0 auto;width:28px;height:28px;display:grid;place-items:center;border-radius:50%;background:#eff6ff;color:var(--blue);font-size:9px;font-weight:950}
        .flow-item strong,.flow-item small {display:block}.flow-item strong {color:#334155;font-size:10px;font-weight:900}.flow-item small {margin-top:2px;color:#94a3b8;font-size:8px}
        .flow-line {width:1px;height:18px;margin-left:13px;background:#dbeafe}
        @keyframes fadeUp {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes stepIn {from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse {50%{transform:scale(1.2)}}
        @keyframes orbOne {50%{transform:translate(22px,-18px)}}
        @keyframes orbTwo {50%{transform:translate(-22px,18px)}}
        @keyframes spin {to{transform:rotate(360deg)}}
        @keyframes houseFloat {50%{transform:translateY(-6px)}}
        @media(max-width:1000px) {.post-layout{grid-template-columns:1fr}.post-sidebar{position:static;grid-template-columns:repeat(2,minmax(0,1fr))}.live-preview-card{grid-column:1/-1}}
        @media(max-width:700px) {
          .prozpo-post-page{padding:35px 12px 65px}.post-header h1{font-size:38px;letter-spacing:-1.8px}
          .post-header>p{font-size:13px}.post-trust-row span{font-size:8px}
          .post-progress-card{padding:15px}.progress-steps small{font-size:9px}
          .post-sidebar{grid-template-columns:1fr}.live-preview-card{grid-column:auto}
          .form-step{padding:21px 16px}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}
          .choice-grid{grid-template-columns:1fr}.type-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
          .media-preview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
          .preview-card{grid-template-columns:1fr}.preview-image,.preview-image img,.preview-image video{min-height:200px}
          .step-actions,.step-actions.two{flex-direction:column-reverse}.next-button,.publish-button,.back-button{width:100%}
        }
        @media(max-width:430px) {
          .prozpo-post-page{padding-left:9px;padding-right:9px}.post-header h1{font-size:33px}
          .post-badge{font-size:8px}.post-trust-row{gap:5px}.post-trust-row span{padding:6px 7px}
          .media-preview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        }
        @media(prefers-reduced-motion:reduce) {
          .prozpo-post-page *,.prozpo-post-page *:before,.prozpo-post-page *:after {
            animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important
          }
        }
      `}</style>
    </main>
  );
}
