const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const {
      action,
      email,
      password,
      name,
    } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    /* =========================
       REGISTER
    ========================= */

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
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (data.user) {
        const { error: profileError } =
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

        if (profileError) {
          console.error(
            "Profile creation error:",
            profileError.message
          );
        }
      }

      return res.status(200).json({
        success: true,
        message:
          "Registration successful. Please check your email if confirmation is required.",
        user: data.user,
        session: data.session,
      });
    }

    /* =========================
       LOGIN
    ========================= */

    if (action === "login") {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
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
      message: "Invalid authentication action",
    });
  } catch (error) {
    console.error("Auth API error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Authentication failed",
    });
  }
};
