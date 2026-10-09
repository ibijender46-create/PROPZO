const { createClient } = require("@supabase/supabase-js");
const { askOpenAI, askGemini } = require("../lib/ai");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// ==========================================
// PROZPO API CONTRACT
// Keep existing frontend route names stable.
// ==========================================

const TABLES = {
  properties: "properties",
  projects: "projects",
  agents: "agents",
  builders: "builders",
  enquiries: "enquiries",
  favorites: "favorites",
  "property-images": "property_images",
  reviews: "reviews",
  notifications: "notifications",
  profiles: "profiles",
  amenities: "amenities",
  locations: "locations",
  "property-amenities": "property_amenities",
  "property-views": "property_views",
  reports: "reports",
  "saved-searches": "saved_searches",
};

const FIELDS = {
  properties: [
    "user_id",
    "title",
    "location",
    "city",
    "state",
    "property_type",
    "listing_type",
    "price",
    "area",
    "area_unit",
    "bedrooms",
    "bathrooms",
    "furnishing",
    "possession",
    "description",
    "image_url",
    "status",
  ],

  projects: [
    "user_id",
    "name",
    "description",
    "developer",
    "location",
    "city",
    "state",
    "price_from",
    "price_to",
    "status",
    "image_url",
  ],

  agents: [
    "user_id",
    "name",
    "phone",
    "email",
    "company",
    "city",
    "state",
    "bio",
    "image_url",
    "status",
  ],

  builders: [
    "user_id",
    "company_name",
    "name",
    "phone",
    "email",
    "city",
    "state",
    "description",
    "image_url",
    "status",
  ],

  enquiries: [
    "property_id",
    "project_id",
    "user_id",
    "name",
    "email",
    "phone",
    "message",
    "status",
  ],

  favorites: [
    "user_id",
    "property_id",
    "project_id",
  ],

  "property-images": [
    "property_id",
    "image_url",
    "is_primary",
    "sort_order",
    "user_id",
    "media_type",
    "storage_path",
    "file_name",
  ],

  reviews: [
    "property_id",
    "user_id",
    "rating",
    "review",
    "status",
  ],

  notifications: [
    "user_id",
    "title",
    "message",
    "type",
    "is_read",
  ],

  profiles: [
    "user_id",
    "name",
    "email",
    "phone",
    "city",
    "state",
    "role",
    "status",
    "bio",
  ],

  amenities: ["name", "icon"],

  locations: [
    "city",
    "state",
    "locality",
    "pincode",
  ],

  "property-amenities": [
    "property_id",
    "amenity_id",
  ],

  "property-views": [
    "property_id",
    "user_id",
    "session_id",
  ],

  reports: [
    "user_id",
    "property_id",
    "project_id",
    "reason",
    "description",
    "status",
  ],

  "saved-searches": [
    "user_id",
    "name",
    "filters",
  ],
};

const ORDERABLE_TABLES = new Set([
  "properties",
  "projects",
  "agents",
  "builders",
  "enquiries",
  "favorites",
  "property-images",
  "reviews",
  "notifications",
  "profiles",
  "property-views",
  "reports",
  "saved-searches",
]);

const PUBLIC_GET = new Set([
  "properties",
  "projects",
  "agents",
  "builders",
  "amenities",
  "locations",
  "property-amenities",
  "property-images",
  "reviews",
]);

const USER_OWNED = new Set([
  "properties",
  "projects",
  "agents",
  "builders",
  "enquiries",
  "favorites",
  "property-images",
  "reviews",
  "notifications",
  "profiles",
  "property-views",
  "reports",
  "saved-searches",
]);

const PUBLIC_CREATE = new Set([
  "enquiries",
  "property-views",
]);

// ==========================================
// RESPONSE HELPERS
// ==========================================

function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  });
}

function getRoute(req) {
  const pathname = (req.url || "/")
    .split("?")[0]
    .replace(/^\/api\/?/, "");

  return pathname.split("/").filter(Boolean);
}

function getBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return {};
}

function cleanFields(route, body) {
  const allowed = FIELDS[route] || [];
  const result = {};

  for (const field of allowed) {
    if (
      Object.prototype.hasOwnProperty.call(body, field) &&
      body[field] !== undefined
    ) {
      result[field] = body[field];
    }
  }

  return result;
}

function responseKey(route) {
  const keys = {
    "property-images": "images",
    "property-amenities": "property_amenities",
    "property-views": "property_views",
    "saved-searches": "saved_searches",
  };

  return keys[route] || route;
}

function sendRecords(res, route, data) {
  return res.status(200).json({
    success: true,
    [responseKey(route)]: data || [],
  });
}

// ==========================================
// CORS
// ==========================================

function setCors(req, res) {
  const configuredOrigin = (
    process.env.FRONTEND_URL || ""
  ).replace(/\/+$/, "");

  const requestOrigin = req.headers.origin;

  if (
    requestOrigin &&
    (!configuredOrigin || requestOrigin === configuredOrigin)
  ) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      requestOrigin
    );
  }

  res.setHeader("Vary", "Origin");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.setHeader("Access-Control-Max-Age", "86400");
}

// ==========================================
// AUTHENTICATION
// ==========================================

async function getUser(req) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ") || !supabase) {
    return null;
  }

  const token = header.slice(7).trim();

  if (!token) return null;

  const { data, error } =
    await supabase.auth.getUser(token);

  if (error || !data?.user) return null;

  return data.user;
}

async function requireUser(req, res) {
  const user = await getUser(req);

  if (!user) {
    sendError(res, 401, "Authentication required");
    return null;
  }

  return user;
}

async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function isAdmin(userId) {
  const profile = await getProfile(userId);

  return (
    String(profile?.role || "").toLowerCase() === "admin"
  );
}

// ==========================================
// FILTERS
// ==========================================

function applyFilters(query, route, req) {
  const {
    id,
    property_id,
    project_id,
    city,
    state,
  } = req.query || {};

  // Supports GET /api/properties/:id
  if (id) {
    query = query.eq("id", id);
  }

  if (
    property_id &&
    [
      "enquiries",
      "favorites",
      "property-images",
      "property-views",
      "reviews",
      "reports",
      "property-amenities",
    ].includes(route)
  ) {
    query = query.eq("property_id", property_id);
  }

  if (
    project_id &&
    ["enquiries", "favorites", "reports"].includes(route)
  ) {
    query = query.eq("project_id", project_id);
  }

  if (
    city &&
    ["properties", "projects", "agents", "builders"].includes(route)
  ) {
    query = query.ilike(
      "city",
      `%${String(city).slice(0, 100)}%`
    );
  }

  if (
    state &&
    ["properties", "projects", "agents", "builders"].includes(route)
  ) {
    query = query.ilike(
      "state",
      `%${String(state).slice(0, 100)}%`
    );
  }

  return query;
}

// ==========================================
// OWNERSHIP VALIDATION
// ==========================================

async function ensureRelatedPropertyOwnership(
  route,
  body,
  user,
  admin
) {
  if (admin) return true;

  if (
    route === "property-amenities" ||
    route === "property-images"
  ) {
    const propertyId = body.property_id;

    if (!propertyId || !user) return false;

    const { data, error } = await supabase
      .from("properties")
      .select("id,user_id")
      .eq("id", propertyId)
      .maybeSingle();

    if (error) throw error;

    return Boolean(
      data && data.user_id === user.id
    );
  }

  return true;
}

// ==========================================
// MAIN API HANDLER
// ==========================================

module.exports = async (req, res) => {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!supabase) {
    return sendError(
      res,
      500,
      "Backend configuration missing: check SUPABASE_URL and SUPABASE_SECRET_KEY"
    );
  }

  try {
    const path = getRoute(req);
    const route =
      path[0] || req.query?.route || "health";
    const id = path[1] || req.query?.id || null;
    const body = getBody(req);

    // ========================================
    // HEALTH CHECK
    // GET /api/health
    // ========================================

    if (route === "health") {
      if (req.method !== "GET") {
        return sendError(res, 405, "Method not allowed");
      }

      const { error } = await supabase
        .from("properties")
        .select("id")
        .limit(1);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: "PROZPO Backend + Supabase connected",
        database: "connected",
        version: "3.0.0",
      });
    }

    // ========================================
    // AUTHENTICATION
    // POST /api/auth
    // Body: { action, email, password, name? }
    // ========================================

    if (route === "auth") {
      if (req.method !== "POST") {
        return sendError(res, 405, "Method not allowed");
      }

      const action = String(body.action || "")
        .trim()
        .toLowerCase();

      const email = String(body.email || "")
        .trim()
        .toLowerCase();

      const password = String(body.password || "");
      const name = String(body.name || "").trim();

      if (!email || !password) {
        return sendError(
          res,
          400,
          "Email and password are required"
        );
      }

      if (action === "register") {
        if (!name) {
          return sendError(res, 400, "Name is required");
        }

        if (password.length < 6) {
          return sendError(
            res,
            400,
            "Password must be at least 6 characters"
          );
        }

        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
            },
          });

        if (error) throw error;

        if (data.user) {
          const { error: profileError } =
            await supabase
              .from("profiles")
              .upsert(
                {
                  user_id: data.user.id,
                  name,
                  email,
                  role: "owner",
                  status: "active",
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
              );

          if (profileError) throw profileError;
        }

        // Return the complete session when Supabase
        // issues one. The frontend can persist it later.
        return res.status(200).json({
          success: true,
          message: data.session
            ? "Registration successful"
            : "Registration successful. Confirm your email if required.",
          user: data.user,
          session: data.session,
        });
      }

      if (action === "login") {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        return res.status(200).json({
          success: true,
          message: "Login successful",
          user: data.user,
          session: data.session,
        });
      }

      return sendError(res, 400, "Invalid auth action");
    }

    // ========================================
    // AI
    // POST /api/ai
    // ========================================

    if (route === "ai") {
      if (req.method !== "POST") {
        return sendError(res, 405, "Method not allowed");
      }

      const prompt = String(body.prompt || "").trim();
      const provider = String(
        body.provider || "openai"
      ).toLowerCase();

      if (!prompt) {
        return sendError(res, 400, "Prompt is required");
      }

      if (prompt.length > 12000) {
        return sendError(
          res,
          400,
          "Prompt is too long"
        );
      }

      const answer =
        provider === "gemini"
          ? await askGemini(prompt)
          : await askOpenAI(prompt);

      return res.status(200).json({
        success: true,
        provider:
          provider === "gemini" ? "gemini" : "openai",
        answer,
      });
    }

    // ========================================
    // PROFILE
    // GET /api/profile
    // PUT/PATCH/POST /api/profile
    // ========================================

    if (
      route === "profile" ||
      route === "profiles"
    ) {
      const user = await requireUser(req, res);
      if (!user) return;

      if (req.method === "GET") {
        const profile = await getProfile(user.id);

        return res.status(200).json({
          success: true,
          profile,
        });
      }

      if (
        ["PUT", "PATCH", "POST"].includes(req.method)
      ) {
        const profileData = {};

        for (const field of [
          "name",
          "phone",
          "city",
          "state",
          "bio",
        ]) {
          if (
            Object.prototype.hasOwnProperty.call(
              body,
              field
            )
          ) {
            profileData[field] = body[field];
          }
        }

        profileData.email = user.email || null;
        profileData.user_id = user.id;
        profileData.updated_at =
          new Date().toISOString();

        const { data, error } = await supabase
          .from("profiles")
          .upsert(profileData, {
            onConflict: "user_id",
          })
          .select()
          .single();

        if (error) throw error;

        return res.status(200).json({
          success: true,
          profile: data,
        });
      }

      return sendError(res, 405, "Method not allowed");
    }

    // ========================================
    // ROUTE VALIDATION
    // ========================================

    const table = TABLES[route];

    if (!table) {
      return sendError(
        res,
        404,
        `API route not found: ${route}`
      );
    }

    // ========================================
    // GET RECORDS
    // ========================================

    if (req.method === "GET") {
      let query = supabase.from(table).select("*");

      const mine =
        String(req.query?.mine || "") === "true";

      if (USER_OWNED.has(route) && mine) {
        const user = await requireUser(req, res);
        if (!user) return;

        query = query.eq("user_id", user.id);
      } else if (
        [
          "favorites",
          "notifications",
          "saved-searches",
          "reports",
        ].includes(route)
      ) {
        const user = await requireUser(req, res);
        if (!user) return;

        query = query.eq("user_id", user.id);
      } else if (!PUBLIC_GET.has(route)) {
        const user = await requireUser(req, res);
        if (!user) return;

        if (USER_OWNED.has(route)) {
          query = query.eq("user_id", user.id);
        }
      }

      query = applyFilters(query, route, req);

      if (ORDERABLE_TABLES.has(route)) {
        query = query.order("created_at", {
          ascending: false,
          nullsFirst: false,
        });
      }

      const parsedLimit = Number.parseInt(
        req.query?.limit,
        10
      );

      const limit = Number.isFinite(parsedLimit)
        ? Math.min(Math.max(parsedLimit, 1), 500)
        : 100;

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      return sendRecords(res, route, data);
    }

    // ========================================
    // CREATE RECORD
    // ========================================

    if (req.method === "POST") {
      const needsAuth = !PUBLIC_CREATE.has(route);

      const user = needsAuth
        ? await requireUser(req, res)
        : await getUser(req);

      if (needsAuth && !user) return;

      const insertData = cleanFields(route, body);

      // Never trust a user_id sent by the browser.
      if (
        user &&
        FIELDS[route].includes("user_id")
      ) {
        insertData.user_id = user.id;
      } else if (
        FIELDS[route].includes("user_id")
      ) {
        insertData.user_id = null;
      }

      // Property validation
      if (route === "properties") {
        if (!user) {
          return sendError(
            res,
            401,
            "Authentication required"
          );
        }

        if (!String(insertData.title || "").trim()) {
          return sendError(
            res,
            400,
            "Property title is required"
          );
        }

        if (
          !String(insertData.location || "").trim()
        ) {
          return sendError(
            res,
            400,
            "Property location is required"
          );
        }

        if (
          insertData.price === undefined ||
          insertData.price === null ||
          insertData.price === "" ||
          !Number.isFinite(Number(insertData.price)) ||
          Number(insertData.price) < 0
        ) {
          return sendError(
            res,
            400,
            "A valid property price is required"
          );
        }

        insertData.price = Number(insertData.price);

        if (
          insertData.area !== undefined &&
          insertData.area !== null &&
          insertData.area !== ""
        ) {
          insertData.area = Number(insertData.area);

          if (
            !Number.isFinite(insertData.area) ||
            insertData.area < 0
          ) {
            return sendError(
              res,
              400,
              "Area must be a valid non-negative number"
            );
          }
        } else {
          insertData.area = null;
        }

        for (const field of [
          "bedrooms",
          "bathrooms",
        ]) {
          if (
            insertData[field] === "" ||
            insertData[field] === undefined
          ) {
            insertData[field] = null;
          } else if (insertData[field] !== null) {
            insertData[field] = Number(
              insertData[field]
            );

            if (
              !Number.isFinite(insertData[field]) ||
              insertData[field] < 0
            ) {
              return sendError(
                res,
                400,
                `${field} must be a valid non-negative number`
              );
            }
          }
        }

        insertData.status =
          insertData.status || "active";
      }

      // Public enquiries
      if (route === "enquiries") {
        if (!String(insertData.name || "").trim()) {
          return sendError(
            res,
            400,
            "Name is required for an enquiry"
          );
        }

        if (
          !String(insertData.message || "").trim()
        ) {
          return sendError(
            res,
            400,
            "Enquiry message is required"
          );
        }

        // Use authenticated identity only.
        insertData.user_id = user ? user.id : null;
      }

      // Anonymous or authenticated property views
      if (route === "property-views") {
        insertData.user_id = user ? user.id : null;
      }

      // Verify ownership before attaching images or amenities.
      if (
        [
          "property-images",
          "property-amenities",
        ].includes(route)
      ) {
        const admin = user
          ? await isAdmin(user.id)
          : false;

        const allowed =
          await ensureRelatedPropertyOwnership(
            route,
            insertData,
            user,
            admin
          );

        if (!allowed) {
          return sendError(
            res,
            403,
            "You can only add details to your own property"
          );
        }
      }

      const { data, error } = await supabase
        .from(table)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data,
        [responseKey(route)]: data,
      });
    }

    // ========================================
    // UPDATE RECORD
    // ========================================

    if (
      ["PUT", "PATCH"].includes(req.method)
    ) {
      if (!id) {
        return sendError(
          res,
          400,
          "Record ID is required"
        );
      }

      const user = await requireUser(req, res);
      if (!user) return;

      const admin = await isAdmin(user.id);
      const updateData = cleanFields(route, body);

      // Never allow client-controlled ownership or roles.
      delete updateData.user_id;
      delete updateData.id;
      delete updateData.role;

      if (route === "profiles") {
        for (const key of Object.keys(updateData)) {
          if (
            ![
              "name",
              "phone",
              "city",
              "state",
              "bio",
            ].includes(key)
          ) {
            delete updateData[key];
          }
        }

        updateData.updated_at =
          new Date().toISOString();

        const { data, error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("user_id", user.id)
          .select()
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          return sendError(
            res,
            404,
            "Profile not found"
          );
        }

        return res.status(200).json({
          success: true,
          profile: data,
        });
      }

      let query = supabase
        .from(table)
        .update(updateData)
        .eq("id", id);

      if (!admin && USER_OWNED.has(route)) {
        query = query.eq("user_id", user.id);
      } else if (
        !admin &&
        !USER_OWNED.has(route)
      ) {
        return sendError(
          res,
          403,
          "You are not allowed to update this resource"
        );
      }

      const { data, error } = await query
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return sendError(
          res,
          404,
          "Record not found or access denied"
        );
      }

      return res.status(200).json({
        success: true,
        data,
        [responseKey(route)]: data,
      });
    }

    // ========================================
    // DELETE RECORD
    // ========================================

    if (req.method === "DELETE") {
      if (!id) {
        return sendError(
          res,
          400,
          "Record ID is required"
        );
      }

      const user = await requireUser(req, res);
      if (!user) return;

      const admin = await isAdmin(user.id);

      if (!admin && !USER_OWNED.has(route)) {
        return sendError(
          res,
          403,
          "You are not allowed to delete this resource"
        );
      }

      let query = supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (!admin && USER_OWNED.has(route)) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return sendError(
          res,
          404,
          "Record not found or access denied"
        );
      }

      return res.status(200).json({
        success: true,
        message: "Record deleted successfully",
        data,
      });
    }

    return sendError(res, 405, "Method not allowed");
  } catch (error) {
    console.error("PROZPO API error:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });

    const status = Number(error?.status) || 500;

    return res
      .status(
        status >= 400 && status <= 599
          ? status
          : 500
      )
      .json({
        success: false,
        message:
          status < 500
            ? error.message || "Request failed"
            : "Server error. Check backend logs and Supabase configuration.",
        ...(process.env.NODE_ENV !== "production" &&
        error?.code
          ? { code: error.code }
          : {}),
      });
  }
};
