const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function getUser(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  return user;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const user = await getUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.query;

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        favorites: data || [],
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};

      const favorite = {
        ...body,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("favorites")
        .insert(favorite)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: "Property added to favorites",
        favorite: data,
      });
    }

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Favorite ID is required",
        });
      }

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: "Favorite removed successfully",
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
