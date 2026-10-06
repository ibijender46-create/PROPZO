const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { error } = await supabase
      .from("properties")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "PROZPO Backend + Supabase connected",
      database: "connected",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
};
