import React, { useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
} from "../src/api";

function Auth() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const existingToken =
      localStorage.getItem("prozpo_access_token");

    if (existingToken) {
      setMessage(
        "You are already logged in. You can continue to PROZPO."
      );
      setMessageType("success");
    }
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      let result;

      if (mode === "login") {
        result = await loginUser({
          email: cleanEmail,
          password,
        });
      } else {
        if (!cleanName) {
          throw new Error("Please enter your full name.");
        }

        result = await registerUser({
          name: cleanName,
          email: cleanEmail,
          password,
        });
      }

      if (!result?.success) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Authentication failed."
        );
      }

      /* ---------------------------------------------
         SAVE USER
      --------------------------------------------- */

      if (result.user) {
        localStorage.setItem(
          "propzo_user",
          JSON.stringify(result.user)
        );
      }

      /* ---------------------------------------------
         SAVE SESSION
      --------------------------------------------- */

      if (result.session) {
        localStorage.setItem(
          "propzo_session",
          JSON.stringify(result.session)
        );

        if (result.session.access_token) {
          localStorage.setItem(
            "prozpo_access_token",
            result.session.access_token
          );
        }
      }

      /* ---------------------------------------------
         LOGIN SUCCESS
      --------------------------------------------- */

      if (mode === "login") {
        setMessage(
          "Login successful. Redirecting..."
        );
        setMessageType("success");

        setTimeout(() => {
          window.location.hash = "post-property";
        }, 500);

        return;
      }

      /* ---------------------------------------------
         REGISTER SUCCESS
      --------------------------------------------- */

      if (result.session?.access_token) {
        setMessage(
          "Account created successfully. Redirecting..."
        );
        setMessageType("success");

        setTimeout(() => {
          window.location.hash = "post-property";
        }, 700);
      } else {
        setMessage(
          "Account created successfully. Please check your email if confirmation is required, then login."
        );
        setMessageType("success");

        setTimeout(() => {
          setMode("login");
          setPassword("");
          setMessage("");
          setMessageType("");
        }, 2200);
      }
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to connect to PROZPO server."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessage("");
    setMessageType("");
    setPassword("");
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "prozpo_access_token"
    );

    localStorage.removeItem(
      "propzo_user"
    );

    localStorage.removeItem(
      "propzo_session"
    );

    setMessage(
      "Logged out successfully."
    );
    setMessageType("success");
  };

  return (
    <main className="prozpo-auth-page">

      <div className="auth-background-orb auth-orb-one" />
      <div className="auth-background-orb auth-orb-two" />

      <section className="prozpo-auth-card">

        {/* BRAND */}

        <div className="auth-brand">
          <div className="auth-logo">
            P
          </div>

          <div>
            <strong>PROZPO</strong>
            <span>
              India's Real Estate Marketplace
            </span>
          </div>
        </div>

        {/* HEADING */}

        <div className="auth-heading">

          <span className="auth-label">
            {mode === "login"
              ? "WELCOME BACK"
              : "JOIN PROZPO"}
          </span>

          <h1>
            {mode === "login"
              ? "Login to PROZPO"
              : "Create your account"}
          </h1>

          <p>
            {mode === "login"
              ? "Access your properties, enquiries and marketplace account."
              : "Buy, rent, sell and manage properties from one account."}
          </p>

        </div>

        {/* FORM */}

        <form
          className="auth-form"
          onSubmit={submit}
        >

          {mode === "register" && (
            <div className="auth-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />

            </div>
          )}

          <div className="auth-field">

            <label>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

          </div>

          <div className="auth-field">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Minimum 6 characters"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              minLength={6}
              required
            />

          </div>

          {mode === "login" && (
            <div className="auth-helper">
              <span>
                🔐 Secure PROZPO account access
              </span>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner" />
                Please wait...
              </>
            ) : (
              <>
                {mode === "login"
                  ? "Login to PROZPO"
                  : "Create PROZPO Account"}

                <span>→</span>
              </>
            )}
          </button>

        </form>

        {/* MESSAGE */}

        {message && (
          <div
            className={
              messageType === "success"
                ? "auth-message success"
                : "auth-message error"
            }
          >
            <span>
              {messageType === "success"
                ? "✓"
                : "!"}
            </span>

            <p>{message}</p>
          </div>
        )}

        {/* SWITCH */}

        <div className="auth-switch">

          {mode === "login" ? (
            <>
              <span>
                Don't have a PROZPO account?
              </span>

              <button
                type="button"
                onClick={() =>
                  switchMode("register")
                }
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <span>
                Already have a PROZPO account?
              </span>

              <button
                type="button"
                onClick={() =>
                  switchMode("login")
                }
              >
                Login
              </button>
            </>
          )}

        </div>

        {/* ACCOUNT STATUS */}

        {localStorage.getItem(
          "prozpo_access_token"
        ) && (
          <button
            type="button"
            className="auth-logout"
            onClick={handleLogout}
          >
            Logout from this device
          </button>
        )}

        {/* TRUST */}

        <div className="auth-trust">

          <div>
            🔒
          </div>

          <p>
            Your account information is securely
            handled by PROZPO's authentication system.
          </p>

        </div>

      </section>

      <div className="auth-footer">
        © 2026 PROZPO • India's Real Estate Marketplace
      </div>

      <style>{`

        .prozpo-auth-page {
          --primary: #2563eb;
          --primary-dark: #1d4ed8;
          --cyan: #0ea5e9;
          --navy: #07152f;
          --text: #0f172a;
          --muted: #64748b;
          --border: #e2e8f0;

          position: relative;
          min-height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 55px 20px 80px;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(37,99,235,.12),
              transparent 28%
            ),
            radial-gradient(
              circle at 85% 85%,
              rgba(14,165,233,.10),
              transparent 28%
            ),
            #f8fafc;
        }

        .prozpo-auth-page *,
        .prozpo-auth-page *::before,
        .prozpo-auth-page *::after {
          box-sizing: border-box;
        }

        .prozpo-auth-page button,
        .prozpo-auth-page input {
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .auth-background-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(10px);
        }

        .auth-orb-one {
          width: 330px;
          height: 330px;
          top: -140px;
          left: -130px;
          background: rgba(37,99,235,.08);
          animation: authOrbOne 8s ease-in-out infinite;
        }

        .auth-orb-two {
          width: 280px;
          height: 280px;
          right: -110px;
          bottom: -110px;
          background: rgba(20,184,166,.08);
          animation: authOrbTwo 9s ease-in-out infinite;
        }

        .prozpo-auth-card {
          position: relative;
          z-index: 2;
          width: min(100%, 470px);
          padding: 34px;
          border: 1px solid rgba(226,232,240,.9);
          border-radius: 26px;
          background:
            rgba(255,255,255,.96);
          box-shadow:
            0 30px 80px rgba(15,23,42,.12);
          backdrop-filter: blur(18px);
          animation: authCardIn .55s ease both;
        }

        /* BRAND */

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 34px;
        }

        .auth-logo {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0ea5e9
            );

          color: #ffffff;
          font-size: 23px;
          font-weight: 950;

          box-shadow:
            0 10px 25px rgba(37,99,235,.25);
        }

        .auth-brand strong,
        .auth-brand span {
          display: block;
        }

        .auth-brand strong {
          color: #2563eb;
          font-size: 21px;
          font-weight: 950;
          letter-spacing: -.7px;
        }

        .auth-brand span {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
        }

        /* HEADING */

        .auth-heading {
          margin-bottom: 25px;
        }

        .auth-label {
          color: #2563eb;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1.4px;
        }

        .auth-heading h1 {
          margin: 8px 0 8px;
          color: #0f172a;
          font-size: 32px;
          line-height: 1.1;
          letter-spacing: -1.3px;
          font-weight: 950;
        }

        .auth-heading p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        /* FORM */

        .auth-form {
          display: grid;
          gap: 17px;
        }

        .auth-field {
          display: grid;
          gap: 7px;
        }

        .auth-field label {
          color: #334155;
          font-size: 12px;
          font-weight: 900;
        }

        .auth-field input {
          width: 100%;
          height: 51px;
          padding: 0 15px;
          border: 1px solid #dbe3ee;
          border-radius: 12px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          font-size: 14px;
          font-weight: 650;
          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            transform .2s ease;
        }

        .auth-field input::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }

        .auth-field input:focus {
          border-color: #60a5fa;
          box-shadow:
            0 0 0 4px rgba(37,99,235,.09);
        }

        .auth-helper {
          display: flex;
          align-items: center;
          margin-top: -5px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
        }

        .auth-submit {
          width: 100%;
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 2px;
          border: 0;
          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0ea5e9
            );

          color: #ffffff;
          font-size: 14px;
          font-weight: 950;

          cursor: pointer;

          box-shadow:
            0 12px 27px rgba(37,99,235,.22);

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            opacity .2s ease;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 17px 32px rgba(37,99,235,.30);
        }

        .auth-submit:disabled {
          cursor: not-allowed;
          opacity: .72;
        }

        .auth-submit span {
          font-size: 18px;
        }

        .auth-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: authSpin .7s linear infinite;
        }

        /* MESSAGE */

        .auth-message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 18px;
          padding: 12px 13px;
          border-radius: 12px;
          font-size: 12px;
          line-height: 1.55;
        }

        .auth-message span {
          flex: 0 0 auto;
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-weight: 950;
        }

        .auth-message p {
          margin: 0;
          font-weight: 700;
        }

        .auth-message.success {
          border: 1px solid #bbf7d0;
          background: #f0fdf4;
          color: #166534;
        }

        .auth-message.success span {
          background: #22c55e;
          color: #ffffff;
        }

        .auth-message.error {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .auth-message.error span {
          background: #ef4444;
          color: #ffffff;
        }

        /* SWITCH */

        .auth-switch {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 25px;
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }

        .auth-switch button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #2563eb;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .auth-switch button:hover {
          text-decoration: underline;
        }

        /* LOGOUT */

        .auth-logout {
          display: block;
          margin: 17px auto 0;
          padding: 7px 10px;
          border: 0;
          background: transparent;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .auth-logout:hover {
          color: #dc2626;
        }

        /* TRUST */

        .auth-trust {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 25px;
          padding-top: 19px;
          border-top: 1px solid #eef2f7;
        }

        .auth-trust > div {
          flex: 0 0 auto;
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #eff6ff;
          font-size: 13px;
        }

        .auth-trust p {
          margin: 0;
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.6;
        }

        .auth-footer {
          position: relative;
          z-index: 2;
          margin-top: 24px;
          color: #94a3b8;
          font-size: 10px;
          text-align: center;
        }

        /* ANIMATIONS */

        @keyframes authCardIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes authSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes authOrbOne {
          0%,100% {
            transform: translate(0,0);
          }

          50% {
            transform: translate(25px,18px);
          }
        }

        @keyframes authOrbTwo {
          0%,100% {
            transform: translate(0,0);
          }

          50% {
            transform: translate(-20px,-20px);
          }
        }

        /* MOBILE */

        @media (max-width: 560px) {

          .prozpo-auth-page {
            min-height: calc(100vh - 60px);
            padding: 30px 14px 65px;
          }

          .prozpo-auth-card {
            padding: 25px 19px;
            border-radius: 22px;
          }

          .auth-brand {
            margin-bottom: 27px;
          }

          .auth-heading h1 {
            font-size: 28px;
          }

          .auth-heading p {
            font-size: 12px;
          }

          .auth-field input {
            height: 49px;
          }

          .auth-submit {
            min-height: 51px;
          }

        }

        @media (prefers-reduced-motion: reduce) {

          .prozpo-auth-page *,
          .prozpo-auth-page *::before,
          .prozpo-auth-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }

        }

      `}</style>
    </main>
  );
}

export default Auth;
