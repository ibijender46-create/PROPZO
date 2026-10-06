const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const tableMap = {
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
  "saved-searches": "saved_searches"
};

function getPath(req) {
  return req.url
    .split("?")[0]
    .replace(/^\/api\/?/, "")
    .split("/")
    .filter(Boolean);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
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
    const path = getPath(req);

    const route = path[0] || "health";
    const id = path[1];

    /* HEALTH */
    if (route === "health") {
      return res.status(200).json({
        success: true,
        message: "PROZPO Backend is running"
      });
    }

    /* AUTH */
    if (route === "auth") {
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          message: "Method not allowed"
        });
      }

      const {
        action,
        email,
        password,
        name
      } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
      }

      if (action === "register") {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name || ""
              }
            }
          });

        if (error) throw error;

        return res.status(200).json({
          success: true,
          message: "Registration successful",
          user: data.user,
          session: data.session
        });
      }

      if (action === "login") {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;

        return res.status(200).json({
          success: true,
          message: "Login successful",
          user: data.user,
          session: data.session
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid auth action"
      });
    }

    const table = tableMap[route];

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "API route not found"
      });
    }

    /* GET */
    if (req.method === "GET") {
      let query = supabase
        .from(table)
        .select("*");

      if (id) {
        query = query.eq("id", id).maybeSingle();
      }

      const { data, error } = await query;

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || []
      });
    }

    /* POST */
    if (req.method === "POST") {
      const body = req.body || {};

      const { data, error } =
        await supabase
          .from(table)
          .insert(body)
          .select()
          .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data
      });
    }

    /* PUT */
    if (req.method === "PUT") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Record ID is required"
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
        data
      });
    }

    /* DELETE */
    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Record ID is required"
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
        data
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};
