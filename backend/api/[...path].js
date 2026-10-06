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
  notifications: "notifications"
};

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
    const path = req.url
      .split("?")[0]
      .replace(/^\/api\/?/, "")
      .split("/")
      .filter(Boolean);

    const route = path[0] || "health";

    if (route === "health") {
      return res.status(200).json({
        success: true,
        message: "PROZPO Backend connected to Supabase"
      });
    }

    if (route === "auth") {
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          message: "Method not allowed"
        });
      }

      const { action, email, password, name } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
      }

      if (action === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || "" }
          }
        });

        if (error) throw error;

        return res.status(200).json({
          success: true,
          message: "Registration successful",
          user: data.user
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
        message: "Invalid action"
      });
    }

    const table = tableMap[route];

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "API route not found"
      });
    }
if (req.method === "GET") {
  if (table === "notifications") {
    const { data, error } = await supabase.rpc("get_notifications");

    if (error) throw error;

    return res.status(200).json({
      success: true,
      notifications: data || []
    });
  }

  const { data, error } = await supabase
    .from(table)
    .select("*");

  if (error) throw error;

  return res.status(200).json({
    success: true,
    [route.replace("-", "_")]: data || []
  });
}

    if (req.method === "POST") {
      const { data, error } = await supabase
        .from(table)
        .insert(req.body || {})
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
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
      message: error.message
    });
  }
};
