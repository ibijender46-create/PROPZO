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
    const { id, property_id } = req.query;

    // GET REVIEWS — PUBLIC
    if (req.method === "GET") {
      let query = supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (property_id) {
        query = query.eq("property_id", property_id);
      }

      if (id) {
        query = query.eq("id", id).single();
      }

      const { data, error } = await query;

      if (error) throw error;

      return res.status(200).json({
        success: true,
        reviews: id ? [data] : data || [],
      });
    }

    // LOGIN REQUIRED FOR CHANGES
    const user = await getUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // CREATE REVIEW
    if (req.method === "POST") {
      const review = {
        ...(req.body || {}),
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("reviews")
        .insert(review)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        review: data,
      });
    }

    // UPDATE REVIEW
    if (req.method === "PUT") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Review ID is required",
        });
      }

      const { data, error } = await supabase
        .from("reviews")
        .update(req.body || {})
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: "Review updated successfully",
        review: data,
      });
    }

    // DELETE REVIEW
    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Review ID is required",
        });
      }

      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: "Review deleted successfully",
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
