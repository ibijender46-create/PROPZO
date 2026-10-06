import React, { useState } from "react";
import { auth } from "../src/api";

function Auth() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await auth(
        mode === "login" ? "login" : "register",
        {
          name,
          email,
          password
        }
      );

      if (result.success) {
        setMessage(
          mode === "login"
            ? "Login successful."
            : "Registration successful. Please check your email if confirmation is required."
        );

        if (result.session) {
          localStorage.setItem(
            "propzo_session",
            JSON.stringify(result.session)
          );
        }

        if (result.user) {
          localStorage.setItem(
            "propzo_user",
            JSON.stringify(result.user)
          );
        }
      } else {
        setMessage(result.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage(error.message || "Unable to connect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">PROZPO</div>

        <h1>
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>

        <p>
          {mode === "login"
            ? "Login to manage your PROZPO account."
            : "Join India's real estate marketplace."}
        </p>

        <form onSubmit={submit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="6"
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Don't have an account?
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
              >
                Login
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default Auth;
