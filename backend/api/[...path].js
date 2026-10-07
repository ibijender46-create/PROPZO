const { createClient } = require("@supabase/supabase-js");
const { askOpenAI, askGemini } = require("../lib/ai");

/* =========================================================
   SUPABASE
   ========================================================= */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

/* =========================================================
   DATABASE TABLE MAP
   ========================================================= */

const tables = {
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

/* =========================================================
   ROUTE
   ========================================================= */

function getRoute(req) {
  const url = req.url || "";

  return url
    .split("?")[0]
    .replace(/^\/api\/?/, "")
    .split("/")
    .filter(Boolean);
}

/* =========================================================
   BODY
   ========================================================= */

function getBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
}

/* =========================================================
   AUTH USER
   ========================================================= */

async function getUser(req) {
  const authorization =
    req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization
    .replace("Bearer ", "")
    .trim();

  if (!token) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

/* =========================================================
   REQUIRE AUTH
   ========================================================= */

async function requireUser(req, res) {
  const user = await getUser(req);

  if (!user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return null;
  }

  return user;
}

/* =========================================================
   GET PROFILE / ROLE
   ========================================================= */

async function getUserProfile(userId) {
  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   ADMIN CHECK
   ========================================================= */

async function isAdmin(userId) {
  const profile = await getUserProfile(userId);

  return (
    String(profile?.role || "")
      .trim()
      .toLowerCase() === "admin"
  );
}

/* =========================================================
   RESPONSE FORMAT
   ========================================================= */

function responseData(route, data) {
  const keyMap = {
    properties: "properties",
    projects: "projects",
    agents: "agents",
    builders: "builders",
    enquiries: "enquiries",
    favorites: "favorites",
    "property-images": "images",
    reviews: "reviews",
    notifications: "notifications",
    profiles: "profiles",
    amenities: "amenities",
    locations: "locations",
    "property-amenities":
      "property_amenities",
    "property-views": "property_views",
    reports: "reports",
    "saved-searches": "saved_searches",
  };

  return {
    success: true,
    [keyMap[route] || "data"]: data || [],
  };
}

/* =========================================================
   SAFE PROFILE UPDATE
   ========================================================= */

function cleanProfileUpdate(body) {
  const allowed = [
    "name",
    "phone",
    "city",
    "state",
    "bio",
  ];

  const clean = {};

  for (const field of allowed) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        field
      )
    ) {
      clean[field] = body[field];
    }
  }

  return clean;
}

/* =========================================================
   OWNER FILTER
   ========================================================= */

function applyOwnerFilter(
  query,
  route,
  userId
) {
  const ownerTables = [
    "properties",
    "projects",
    "agents",
    "builders",
    "enquiries",
    "favorites",
    "property-images",
    "reviews",
    "notifications",
    "reports",
    "saved-searches",
  ];

  if (ownerTables.includes(route)) {
    query = query.eq(
      "user_id",
      userId
    );
  }

  return query;
}

/* =========================================================
   CORS
   ========================================================= */

function setCors(req, res) {
  const configuredOrigin =
    process.env.FRONTEND_URL;

  const requestOrigin =
    req.headers.origin;

  const allowedOrigin =
    configuredOrigin ||
    requestOrigin ||
    "*";

  res.setHeader(
    "Access-Control-Allow-Origin",
    allowedOrigin
  );

  res.setHeader(
    "Vary",
    "Origin"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.setHeader(
    "Access-Control-Max-Age",
    "86400"
  );
}

/* =========================================================
   MAIN API
   ========================================================= */

module.exports = async (req, res) => {
  setCors(req, res);

  /* =======================================================
     OPTIONS
     ======================================================= */

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const path = getRoute(req);

    const route =
      path[0] ||
      req.query?.route ||
      "health";

    const id =
      path[1] ||
      req.query?.id ||
      null;

    const body = getBody(req);

    /* =====================================================
       HEALTH
       ===================================================== */

    if (route === "health") {
      const {
        error,
      } = await supabase
        .from("properties")
        .select("id")
        .limit(1);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        message:
          "PROZPO Backend + Supabase connected",
        database: "connected",
        version: "2.0.0",
      });
    }

    /* =====================================================
       AUTH
       ===================================================== */

    if (route === "auth") {
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          message: "Method not allowed",
        });
      }

      const {
        action,
        email,
        password,
        name,
      } = body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required",
        });
      }

      /* ===================================================
         REGISTER
         =================================================== */

      if (action === "register") {
        if (!name) {
          return res.status(400).json({
            success: false,
            message: "Name is required",
          });
        }

        const {
          data,
          error,
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          const {
            error: profileError,
          } = await supabase
            .from("profiles")
            .upsert(
              {
                user_id: data.user.id,
                name,
                email,
                role: "owner",
                status: "active",
                updated_at:
                  new Date().toISOString(),
              },
              {
                onConflict: "user_id",
              }
            );

          if (profileError) {
            console.error(
              "Profile creation error:",
              profileError
            );
          }
        }

        return res.status(200).json({
          success: true,
          message:
            "Registration successful",
          user: data.user,
          session: data.session,
        });
      }

      /* ===================================================
         LOGIN
         =================================================== */

      if (action === "login") {
        const {
          data,
          error,
        } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          message: "Login successful",
          user: data.user,
          session: data.session,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid auth action",
      });
    }

    /* =====================================================
       AI
       ===================================================== */

    if (route === "ai") {
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          message: "Method not allowed",
        });
      }

      const {
        provider = "openai",
        prompt,
      } = body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: "Prompt is required",
        });
      }

      let answer;

      if (
        String(provider).toLowerCase() ===
        "gemini"
      ) {
        answer = await askGemini(prompt);
      } else {
        answer = await askOpenAI(prompt);
      }

      return res.status(200).json({
        success: true,
        provider,
        answer,
      });
    }

    /* =====================================================
       PROFILE
       ===================================================== */

    if (route === "profile") {
      const user = await requireUser(
        req,
        res
      );

      if (!user) {
        return;
      }

      /* ===================================================
         GET PROFILE
         =================================================== */

      if (req.method === "GET") {
        const profile =
          await getUserProfile(user.id);

        return res.status(200).json({
          success: true,
          profile,
        });
      }

      /* ===================================================
         UPDATE PROFILE
         =================================================== */

      if (
        req.method === "POST" ||
        req.method === "PUT" ||
        req.method === "PATCH"
      ) {
        const clean =
          cleanProfileUpdate(body);

        clean.email =
          user.email || null;

        clean.updated_at =
          new Date().toISOString();

        const {
          data,
          error,
        } = await supabase
          .from("profiles")
          .upsert(
            {
              ...clean,
              user_id: user.id,
            },
            {
              onConflict: "user_id",
            }
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          profile: data,
        });
      }

      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }

    /* =====================================================
       TABLE VALIDATION
       ===================================================== */

    const table = tables[route];

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "API route not found",
        route,
      });
    }

    /* =====================================================
       PUBLIC GET TABLES
       ===================================================== */

    const publicGetRoutes = [
      "properties",
      "projects",
      "agents",
      "builders",
      "amenities",
      "locations",
      "property-amenities",
      "property-images",
      "reviews",
    ];

    /* =====================================================
       GET
       ===================================================== */

    if (req.method === "GET") {
      let query = supabase
        .from(table)
        .select("*");

      const userSpecificRoutes = [
        "favorites",
        "notifications",
        "saved-searches",
        "reports",
      ];

      if (
        userSpecificRoutes.includes(route)
      ) {
        const user =
          await requireUser(req, res);

        if (!user) {
          return;
        }

        query = query.eq(
          "user_id",
          user.id
        );
      }

      /*
       * My Properties
       *
       * Frontend can call:
       * /api/properties?mine=true
       */

      if (
        route === "properties" &&
        String(req.query?.mine) === "true"
      ) {
        const user =
          await requireUser(req, res);

        if (!user) {
          return;
        }

        query = query.eq(
          "user_id",
          user.id
        );
      }

      /*
       * My Projects
       */

      if (
        route === "projects" &&
        String(req.query?.mine) === "true"
      ) {
        const user =
          await requireUser(req, res);

        if (!user) {
          return;
        }

        query = query.eq(
          "user_id",
          user.id
        );
      }

      /*
       * My Enquiries
       */

      if (
        route === "enquiries" &&
        String(req.query?.mine) === "true"
      ) {
        const user =
          await requireUser(req, res);

        if (!user) {
          return;
        }

        query = query.eq(
          "user_id",
          user.id
        );
      }

      /*
       * PROPERTY ID FILTER
       */

      if (
        req.query?.property_id &&
        [
          "properties",
          "enquiries",
          "favorites",
          "property-images",
          "property-views",
          "reviews",
          "reports",
        ].includes(route)
      ) {
        query = query.eq(
          "property_id",
          req.query.property_id
        );
      }

      /*
       * PROJECT ID FILTER
       */

      if (
        req.query?.project_id &&
        [
          "enquiries",
          "favorites",
          "reports",
        ].includes(route)
      ) {
        query = query.eq(
          "project_id",
          req.query.project_id
        );
      }

      /*
       * SINGLE RECORD
       */

      if (id) {
        query = query.eq(
          "id",
          id
        );
      }

      /*
       * LIMIT
       */

      const limit =
        Number(req.query?.limit) || 100;

      query = query.limit(
        Math.min(limit, 500)
      );

      /*
       * ORDER
       */

      query = query.order(
        "created_at",
        {
          ascending: false,
          nullsFirst: false,
        }
      );

      const {
        data,
        error,
      } = await query;

      if (error) {
        throw error;
      }

      return res.status(200).json(
        responseData(route, data)
      );
    }

    /* =====================================================
       POST
       ===================================================== */

    if (req.method === "POST") {
      const protectedRoutes = [
        "properties",
        "projects",
        "agents",
        "builders",
        "favorites",
        "property-images",
        "reviews",
        "notifications",
        "profiles",
        "property-amenities",
        "property-views",
        "reports",
        "saved-searches",
      ];

      let user = null;

      if (
        protectedRoutes.includes(route)
      ) {
        user =
          await requireUser(req, res);

        if (!user) {
          return;
        }
      }

      const insertData = {
        ...body,
      };

      /*
       * Never trust client user_id
       */

      if (user) {
        insertData.user_id =
          user.id;
      }

      /*
       * Property
       */

      if (route === "properties") {
        insertData.user_id =
          user.id;
      }

      /*
       * Project
       */

      if (route === "projects") {
        insertData.user_id =
          user.id;
      }

      /*
       * Enquiry
       *
       * Enquiries can be submitted publicly.
       * If logged in, automatically attach user.
       */

      if (route === "enquiries") {
        const authenticatedUser =
          await getUser(req);

        if (authenticatedUser) {
          insertData.user_id =
            authenticatedUser.id;
        }
      }

      /*
       * Property images
       */

      if (
        route === "property-images"
      ) {
        insertData.user_id =
          user.id;
      }

      /*
       * Reviews
       */

      if (route === "reviews") {
        insertData.user_id =
          user.id;
      }

      /*
       * Notifications
       */

      if (
        route === "notifications"
      ) {
        insertData.user_id =
          user.id;
      }

      /*
       * Reports
       */

      if (route === "reports") {
        insertData.user_id =
          user.id;
      }

      /*
       * Saved Searches
       */

      if (
        route === "saved-searches"
      ) {
        insertData.user_id =
          user.id;
      }

      /*
       * Property Views
       */

      if (
        route === "property-views"
      ) {
        insertData.user_id =
          user?.id || null;
      }

      /*
       * Prevent role escalation
       */

      if (route === "profiles") {
        delete insertData.role;
        delete insertData.status;

        insertData.user_id =
          user.id;
      }

      const {
        data,
        error,
      } = await supabase
        .from(table)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        success: true,
        data,
      });
    }

    /* =====================================================
       PUT / PATCH
       ===================================================== */

    if (
      req.method === "PUT" ||
      req.method === "PATCH"
    ) {
      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Record ID is required",
        });
      }

      const user =
        await requireUser(req, res);

      if (!user) {
        return;
      }

      const admin =
        await isAdmin(user.id);

      let updateData = {
        ...body,
      };

      /*
       * Never allow ownership transfer
       */

      delete updateData.user_id;

      /*
       * Profile
       */

      if (route === "profiles") {
        updateData =
          cleanProfileUpdate(body);

        updateData.email =
          user.email || null;

        updateData.updated_at =
          new Date().toISOString();

        const {
          data,
          error,
        } = await supabase
          .from(table)
          .update(updateData)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          data,
        });
      }

      /*
       * ADMIN CAN UPDATE ANY RECORD
       */

      if (admin) {
        const {
          data,
          error,
        } = await supabase
          .from(table)
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          data,
        });
      }

      /*
       * OWNER-BASED TABLES
       */

      const ownerTables = [
        "properties",
        "projects",
        "agents",
        "builders",
        "favorites",
        "property-images",
        "reviews",
        "notifications",
        "reports",
        "saved-searches",
      ];

      if (
        ownerTables.includes(route)
      ) {
        const {
          data,
          error,
        } = await supabase
          .from(table)
          .update(updateData)
          .eq("id", id)
          .eq(
            "user_id",
            user.id
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          data,
        });
      }

      /*
       * ENQUIRY OWNER UPDATE
       */

      if (route === "enquiries") {
        const {
          data,
          error,
        } = await supabase
          .from(table)
          .update(updateData)
          .eq("id", id)
          .eq(
            "user_id",
            user.id
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          data,
        });
      }

      /*
       * PROPERTY AMENITIES
       */

      if (
        route ===
        "property-amenities"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Direct update is not allowed for property amenities",
        });
      }

      /*
       * DEFAULT
       */

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to update this record",
      });
    }

    /* =====================================================
       DELETE
       ===================================================== */

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Record ID is required",
        });
      }

      const user =
        await requireUser(req, res);

      if (!user) {
        return;
      }

      const admin =
        await isAdmin(user.id);

      /*
       * ADMIN
       */

      if (admin) {
        const {
          data,
          error,
        } = await supabase
          .from(table)
          .delete()
          .eq("id", id)
          .select();

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          data,
        });
      }

      /*
       * OWNER TABLES
       */

      const ownerTables = [
        "properties",
        "projects",
        "agents",
        "builders",
        "favorites",
        "property-images",
        "reviews",
        "notifications",
        "reports",
        "saved-searches",
        "enquiries",
      ];

      if (
        ownerTables.includes(route)
      ) {
        const {
          data,
          error,
        } = await supabase
          .from(table)
          .delete()
          .eq("id", id)
          .eq(
            "user_id",
            user.id
          )
          .select();

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          data,
        });
      }

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to delete this record",
      });
    }

    /* =====================================================
       METHOD NOT ALLOWED
       ===================================================== */

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(
      "PROZPO API ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Server error",
    });
  }
};
