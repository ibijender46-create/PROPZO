const API_BASE =
  import.meta.env.VITE_API_URL || "/api";

/* =========================
   REQUEST HELPER
========================= */

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("prozpo_access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });

  let result = {};

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid server response");
  }

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
  return request("/health");
}

/* =========================
   AUTH
========================= */

export async function registerUser({
  email,
  password,
  name,
}) {
  const result = await request("/auth", {
    method: "POST",
    body: {
      action: "register",
      email,
      password,
      name,
    },
  });

  if (result.session?.access_token) {
    localStorage.setItem(
      "prozpo_access_token",
      result.session.access_token
    );
  }

  return result;
}

export async function loginUser({
  email,
  password,
}) {
  const result = await request("/auth", {
    method: "POST",
    body: {
      action: "login",
      email,
      password,
    },
  });

  if (result.session?.access_token) {
    localStorage.setItem(
      "prozpo_access_token",
      result.session.access_token
    );
  }

  return result;
}

export function logoutUser() {
  localStorage.removeItem("prozpo_access_token");
}

/* =========================
   GENERIC CRUD
========================= */

export async function getRecords(
  resource,
  id = null
) {
  const endpoint = id
    ? `/${resource}?id=${encodeURIComponent(id)}`
    : `/${resource}`;

  const result = await request(endpoint);

  return (
    result.data ||
    result[resource] ||
    result[resource.replace("-", "_")] ||
    []
  );
}

export async function createRecord(
  resource,
  data
) {
  const result = await request(`/${resource}`, {
    method: "POST",
    body: data,
  });

  return (
    result.data ||
    result[resource] ||
    result[resource.replace("-", "_")] ||
    result
  );
}

export async function updateRecord(
  resource,
  id,
  data
) {
  const result = await request(
    `/${resource}?id=${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: data,
    }
  );

  return (
    result.data ||
    result[resource] ||
    result[resource.replace("-", "_")] ||
    result
  );
}

export async function deleteRecord(
  resource,
  id
) {
  const result = await request(
    `/${resource}?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  return result;
}

/* =========================
   PROPERTIES
========================= */

export async function getProperties() {
  return getRecords("properties");
}

export async function getProperty(id) {
  const result = await request(
    `/properties?id=${encodeURIComponent(id)}`
  );

  return result.properties?.[0] || null;
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
  const result = await request(
    `/projects?id=${encodeURIComponent(id)}`
  );

  return result.projects?.[0] || null;
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
  const result = await request(
    `/agents?id=${encodeURIComponent(id)}`
  );

  return result.agents?.[0] || null;
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
  const result = await request(
    `/builders?id=${encodeURIComponent(id)}`
  );

  return result.builders?.[0] || null;
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

export async function getPropertyImages(
  propertyId = null
) {
  const endpoint = propertyId
    ? `/property-images?property_id=${encodeURIComponent(
        propertyId
      )}`
    : "/property-images";

  const result = await request(endpoint);

  return result.images || [];
}

export async function createPropertyImage(data) {
  return createRecord(
    "property-images",
    data
  );
}

export async function updatePropertyImage(
  id,
  data
) {
  return updateRecord(
    "property-images",
    id,
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

export async function getReviews(
  propertyId = null
) {
  const endpoint = propertyId
    ? `/reviews?property_id=${encodeURIComponent(
        propertyId
      )}`
    : "/reviews";

  const result = await request(endpoint);

  return result.reviews || [];
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
  const result = await request(
    "/notifications"
  );

  return result.notifications || [];
}

export async function createNotification(data) {
  return createRecord(
    "notifications",
    data
  );
}

export async function updateNotification(
  id,
  data
) {
  return updateRecord(
    "notifications",
    id,
    data
  );
}

export async function deleteNotification(id) {
  return deleteRecord(
    "notifications",
    id
  );
}

/* =========================
   PROFILE
========================= */

export async function getProfile() {
  const result = await request("/profile");

  return result.profile || null;
}

export async function saveProfile(data) {
  const result = await request("/profile", {
    method: "POST",
    body: data,
  });

  return result.profile || null;
}

export async function updateProfile(data) {
  const result = await request("/profile", {
    method: "PUT",
    body: data,
  });

  return result.profile || null;
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
  return createRecord(
    "reports",
    data
  );
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

/* =========================
   AI
========================= */

export async function askAI(
  prompt,
  provider = "openai"
) {
  const result = await request("/ai", {
    method: "POST",
    body: {
      prompt,
      provider,
    },
  });

  return result.answer || "";
}

/* =========================
   AI SHORTCUTS
========================= */

export async function askOpenAI(prompt) {
  return askAI(prompt, "openai");
}

export async function askGemini(prompt) {
  return askAI(prompt, "gemini");
                            }
