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
    const { id } = req.query;

    // PUBLIC: CREATE ENQUIRY
    if (req.method === "POST") {
      const { data, error } = await supabase
        .from("enquiries")
        .insert(req.body || {})
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: "Enquiry submitted successfully",
        enquiry: data,
      });
    }

    // LOGIN REQUIRED FOR VIEW/UPDATE/DELETE
    const user = await getUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.method === "GET") {
      let query = supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (id) {
        query = query.eq("id", id).single();
      }

      const { data, error } = await query;

      if (error) throw error;

      return res.status(200).json({
        success: true,
        enquiries: id ? [data] : data || [],
      });
    }

    if (req.method === "PUT") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Enquiry ID is required",
        });
      }

      const { data, error } = await supabase
        .from("enquiries")
        .update(req.body || {})
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: "Enquiry updated successfully",
        enquiry: data,
      });
    }

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Enquiry ID is required",
        });
      }

      const { error } = await supabase
        .from("enquiries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: "Enquiry deleted successfully",
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
