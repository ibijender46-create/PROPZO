const { createClient } = require("@supabase/supabase-js");
const { askOpenAI, askGemini } = require("../lib/ai");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

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

function getRoute(req) {
  return req.url
    .split("?")[0]
    .replace(/^\/api\/?/, "")
    .split("/")
    .filter(Boolean);
}

async function getUser(req) {
  const auth =
    req.headers.authorization || "";

  if (!auth.startsWith("Bearer ")) {
    return null;
  }

  const token = auth.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  return user;
}

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
    "property-amenities": "property_amenities",
    "property-views": "property_views",
    reports: "reports",
    "saved-searches": "saved_searches",
  };

  return {
    success: true,
    [keyMap[route] || "data"]: data || [],
  };
}

module.exports = async (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const path = getRoute(req);
    const route = path[0] || "health";
    const id = path[1] || req.query?.id;

    /* =========================
       HEALTH
    ========================= */

    if (route === "health") {
      const { error } = await supabase
        .from("properties")
        .select("id")
        .limit(1);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message:
          "PROZPO Backend + Supabase connected",
        database: "connected",
      });
    }

    /* =========================
       AUTH
    ========================= */

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
      } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required",
        });
      }

      if (action === "register") {
        if (!name) {
          return res.status(400).json({
            success: false,
            message: "Name is required",
          });
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
          await supabase
            .from("profiles")
            .upsert(
              {
                user_id: data.user.id,
                name,
                email,
                role: "user",
                status: "active",
              },
              {
                onConflict: "user_id",
              }
            );
        }

        return res.status(200).json({
          success: true,
          message:
            "Registration successful",
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

      return res.status(400).json({
        success: false,
        message: "Invalid auth action",
      });
    }

    /* =========================
       AI
    ========================= */

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
      } = req.body || {};

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: "Prompt is required",
        });
      }

      const answer =
        provider === "gemini"
          ? await askGemini(prompt)
          : await askOpenAI(prompt);

      return res.status(200).json({
        success: true,
        provider,
        answer,
      });
    }

    /* =========================
       PROFILE
    ========================= */

    if (route === "profile") {
      const user = await getUser(req);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (req.method === "GET") {
        const { data, error } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) throw error;

        return res.status(200).json({
          success: true,
          profile: data,
        });
      }

      if (
        req.method === "POST" ||
        req.method === "PUT"
      ) {
        const body = req.body || {};

        const { data, error } =
          await supabase
            .from("profiles")
            .upsert(
              {
                ...body,
                user_id: user.id,
                email:
                  body.email || user.email,
                updated_at:
                  new Date().toISOString(),
              },
              {
                onConflict: "user_id",
              }
            )
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({
          success: true,
          profile: data,
        });
      }
    }

    /* =========================
       DATABASE TABLES
    ========================= */

    const table = tables[route];

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "API route not found",
      });
    }

    /* GET */

    if (req.method === "GET") {
      let query = supabase
        .from(table)
        .select("*");

      if (route === "favorites" ||
          route === "notifications") {
        const user = await getUser(req);

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Authentication required",
          });
        }

        query = query.eq(
          "user_id",
          user.id
        );
      }

      if (id) {
        query = query.eq("id", id);
      }

      const { data, error } = await query;

      if (error) throw error;

      return res.status(200).json(
        responseData(route, data)
      );
    }

    /* POST */

    if (req.method === "POST") {
      const body = req.body || {};

      if (
        route !== "enquiries" &&
        route !== "properties"
      ) {
        const user = await getUser(req);

        if (!user) {
          return res.status(401).json({
            success: false,
            message:
              "Authentication required",
          });
        }

        if (
          route === "favorites" ||
          route === "reviews" ||
          route === "notifications"
        ) {
          body.user_id = user.id;
        }
      }

      const { data, error } =
        await supabase
          .from(table)
          .insert(body)
          .select()
          .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data,
      });
    }

    /* PUT */

    if (req.method === "PUT") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Record ID is required",
        });
      }

      const user = await getUser(req);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { data, error } =
        await supabase
          .from(table)
          .update(req.body || {})
          .eq("id", id)
          .select()
          .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data,
      });
    }

    /* DELETE */

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Record ID is required",
        });
      }

      const user = await getUser(req);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { data, error } =
        await supabase
          .from(table)
          .delete()
          .eq("id", id)
          .select();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error",
    });
  }
};
