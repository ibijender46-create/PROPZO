const supabase = require("./supabase");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        properties: data
      });
    }

    if (req.method === "POST") {
      const { data, error } = await supabase
        .from("properties")
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        property: data
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
