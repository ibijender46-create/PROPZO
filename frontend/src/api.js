const API_BASE =
  import.meta.env.VITE_API_URL || "/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body
      ? JSON.stringify(options.body)
      : undefined
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || "API request failed"
    );
  }

  return result;
}

/* =========================
   HEALTH
========================= */

export async function healthCheck() {
  const result = await request("/health");
  return result;
}

/* =========================
   AUTH
========================= */

export async function registerUser({
  email,
  password,
  name
}) {
  const result = await request("/auth", {
    method: "POST",
    body: {
      action: "register",
      email,
      password,
      name
    }
  });

  return result;
}

export async function loginUser({
  email,
  password
}) {
  const result = await request("/auth", {
    method: "POST",
    body: {
      action: "login",
      email,
      password
    }
  });

  return result;
}

/* =========================
   GENERIC CRUD
========================= */

export async function getRecords(
  resource,
  id = null
) {
  const endpoint = id
    ? `/${resource}/${id}`
    : `/${resource}`;

  const result = await request(endpoint);

  return result.data || [];
}

export async function createRecord(
  resource,
  data
) {
  const result = await request(`/${resource}`, {
    method: "POST",
    body: data
  });

  return result.data;
}

export async function updateRecord(
  resource,
  id,
  data
) {
  const result = await request(
    `/${resource}/${id}`,
    {
      method: "PUT",
      body: data
    }
  );

  return result.data;
}

export async function deleteRecord(
  resource,
  id
) {
  const result = await request(
    `/${resource}/${id}`,
    {
      method: "DELETE"
    }
  );

  return result.data;
}

/* =========================
   PROPERTIES
========================= */

export async function getProperties() {
  return getRecords("properties");
}

export async function getProperty(id) {
  return getRecords("properties", id);
}

export async function createProperty(data) {
  return createRecord("properties", data);
}

export async function updateProperty(id, data) {
  return updateRecord("properties", id, data);
}

export async function deleteProperty(id) {
  return deleteRecord("properties", id);
}

/* =========================
   PROJECTS
========================= */

export async function getProjects() {
  return getRecords("projects");
}

export async function getProject(id) {
  return getRecords("projects", id);
}

export async function createProject(data) {
  return createRecord("projects", data);
}

export async function updateProject(id, data) {
  return updateRecord("projects", id, data);
}

export async function deleteProject(id) {
  return deleteRecord("projects", id);
}

/* =========================
   AGENTS
========================= */

export async function getAgents() {
  return getRecords("agents");
}

export async function getAgent(id) {
  return getRecords("agents", id);
}

export async function createAgent(data) {
  return createRecord("agents", data);
}

export async function updateAgent(id, data) {
  return updateRecord("agents", id, data);
}

export async function deleteAgent(id) {
  return deleteRecord("agents", id);
}

/* =========================
   BUILDERS
========================= */

export async function getBuilders() {
  return getRecords("builders");
}

export async function getBuilder(id) {
  return getRecords("builders", id);
}

export async function createBuilder(data) {
  return createRecord("builders", data);
}

export async function updateBuilder(id, data) {
  return updateRecord("builders", id, data);
}

export async function deleteBuilder(id) {
  return deleteRecord("builders", id);
}

/* =========================
   ENQUIRIES
========================= */

export async function getEnquiries() {
  return getRecords("enquiries");
}

export async function createEnquiry(data) {
  return createRecord("enquiries", data);
}

export async function updateEnquiry(id, data) {
  return updateRecord("enquiries", id, data);
}

export async function deleteEnquiry(id) {
  return deleteRecord("enquiries", id);
}

/* =========================
   FAVORITES
========================= */

export async function getFavorites() {
  return getRecords("favorites");
}

export async function createFavorite(data) {
  return createRecord("favorites", data);
}

export async function deleteFavorite(id) {
  return deleteRecord("favorites", id);
}

/* =========================
   PROPERTY IMAGES
========================= */

export async function getPropertyImages() {
  return getRecords("property-images");
}

export async function createPropertyImage(data) {
  return createRecord(
    "property-images",
    data
  );
}

export async function deletePropertyImage(id) {
  return deleteRecord(
    "property-images",
    id
  );
}

/* =========================
   REVIEWS
========================= */

export async function getReviews() {
  return getRecords("reviews");
}

export async function createReview(data) {
  return createRecord("reviews", data);
}

export async function updateReview(id, data) {
  return updateRecord("reviews", id, data);
}

export async function deleteReview(id) {
  return deleteRecord("reviews", id);
}

/* =========================
   NOTIFICATIONS
========================= */

export async function getNotifications() {
  return getRecords("notifications");
}

/* =========================
   PROFILES
========================= */

export async function getProfiles() {
  return getRecords("profiles");
}

export async function getProfile(id) {
  return getRecords("profiles", id);
}

export async function createProfile(data) {
  return createRecord("profiles", data);
}

export async function updateProfile(id, data) {
  return updateRecord("profiles", id, data);
}

/* =========================
   LOCATIONS
========================= */

export async function getLocations() {
  return getRecords("locations");
}

/* =========================
   AMENITIES
========================= */

export async function getAmenities() {
  return getRecords("amenities");
}

/* =========================
   SAVED SEARCHES
========================= */

export async function getSavedSearches() {
  return getRecords("saved_searches");
}

export async function createSavedSearch(data) {
  return createRecord(
    "saved_searches",
    data
  );
}

export async function deleteSavedSearch(id) {
  return deleteRecord(
    "saved_searches",
    id
  );
}

/* =========================
   REPORTS
========================= */

export async function getReports() {
  return getRecords("reports");
}

export async function createReport(data) {
  return createRecord("reports", data);
}

/* =========================
   PROPERTY VIEWS
========================= */

export async function getPropertyViews() {
  return getRecords("property_views");
}

export async function createPropertyView(data) {
  return createRecord(
    "property_views",
    data
  );
}
