const API_BASE = "https://kend-opal.vercel.app/api";

export async function getProperties() {
  const response = await fetch(`${API_BASE}/properties`);

  if (!response.ok) {
    throw new Error("Failed to load properties");
  }

  const result = await response.json();

  return result.properties || [];
}

export async function getProjects() {
  const response = await fetch(`${API_BASE}/projects`);

  if (!response.ok) {
    throw new Error("Failed to load projects");
  }

  const result = await response.json();

  return result.projects || [];
}

export async function getAgents() {
  const response = await fetch(`${API_BASE}/agents`);

  if (!response.ok) {
    throw new Error("Failed to load agents");
  }

  const result = await response.json();

  return result.agents || [];
}

export async function getBuilders() {
  const response = await fetch(`${API_BASE}/builders`);

  if (!response.ok) {
    throw new Error("Failed to load builders");
  }

  const result = await response.json();

  return result.builders || [];
}

export async function createEnquiry(data) {
  const response = await fetch(`${API_BASE}/enquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to create enquiry");
  }

  return await response.json();
}
