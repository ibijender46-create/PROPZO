const supabase = require("./supabase");

module.exports = async (req, res) => {
  try {
    const { error } = await supabase
      .from("properties")
      .select("id")
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Supabase connection failed",
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: "PROZPO Backend connected to Supabase"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
