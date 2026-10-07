import React, { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
} from "../src/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  role: "user",
  bio: "",
};

export default function Profile() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setMessage("");

      const response = await getProfile();

      const profile =
        response?.profile ||
        response?.data ||
        {};

      setForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        city: profile.city || "",
        state: profile.state || "",
        role: profile.role || "user",
        bio: profile.bio || "",
      });
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load profile."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setMessage("Name is required.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        bio: form.bio.trim(),
      });

      setMessage(
        "Profile updated successfully!"
      );
      setMessageType("success");
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to update profile."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  function getInitials() {
    const name = form.name.trim();

    if (!name) return "P";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((item) =>
        item.charAt(0).toUpperCase()
      )
      .join("");
  }

  function roleName() {
    const roles = {
      user: "Property User",
      owner: "Property Owner",
      agent: "Agent / Broker",
      builder: "Builder / Developer",
      admin: "Administrator",
    };

    return (
      roles[form.role] ||
      "PROZPO User"
    );
  }

  if (loading) {
    return (
      <>
        <style>{`
          .profile-loading {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #475569;
            font-size: 18px;
            font-weight: 800;
          }
        `}</style>

        <div className="profile-loading">
          Loading profile...
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .profile-page {
          min-height: 100vh;
          padding: 45px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.09),
              transparent 35%
            ),
            #f8fafc;
        }

        .profile-container {
          max-width: 950px;
          margin: 0 auto;
        }

        .profile-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .profile-badge {
          display: inline-block;
          padding: 7px 13px;
          margin-bottom: 10px;
          border-radius: 20px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .7px;
        }

        .profile-header h1 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 5vw, 45px);
          font-weight: 900;
        }

        .profile-header p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
        }

        .profile-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: white;
          box-shadow:
            0 18px 50px rgba(15,23,42,.08);
        }

        .profile-cover {
          height: 150px;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0f172a
            );
        }

        .profile-summary {
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 20px;
          padding: 0 30px 25px;
        }

        .profile-avatar {
          width: 105px;
          height: 105px;
          margin-top: -52px;
          flex: 0 0 105px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 5px solid white;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
          font-size: 34px;
          font-weight: 900;
          box-shadow:
            0 8px 25px rgba(15,23,42,.12);
        }

        .profile-summary-info {
          min-width: 0;
          flex: 1;
        }

        .profile-summary-info h2 {
          margin: 0 0 5px;
          color: #0f172a;
          font-size: 25px;
          font-weight: 900;
        }

        .profile-summary-info p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .profile-role {
          display: inline-block;
          margin-top: 8px;
          padding: 5px 9px;
          border-radius: 20px;
          background: #ecfdf5;
          color: #047857;
          font-size: 10px;
          font-weight: 900;
        }

        .profile-form {
          padding: 30px;
        }

        .profile-section {
          margin-bottom: 28px;
        }

        .profile-section-title {
          margin: 0 0 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
          color: #0f172a;
          font-size: 19px;
          font-weight: 900;
        }

        .profile-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .profile-group {
          display: flex;
          flex-direction: column;
        }

        .profile-full {
          grid-column: 1 / -1;
        }

        .profile-label {
          margin-bottom: 7px;
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .profile-input,
        .profile-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          background: white;
          color: #0f172a;
          font-size: 14px;
          outline: none;
        }

        .profile-input:focus,
        .profile-textarea:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.10);
        }

        .profile-input:disabled {
          background: #f8fafc;
          color: #64748b;
          cursor: not-allowed;
        }

        .profile-textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.6;
        }

        .profile-help {
          margin-top: 5px;
          color: #94a3b8;
          font-size: 11px;
        }

        .profile-save {
          width: 100%;
          padding: 15px;
          border: 0;
          border-radius: 11px;
          background: #2563eb;
          color: white;
          font-size: 15px;
          font-weight: 850;
          cursor: pointer;
        }

        .profile-save:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .profile-save:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .profile-message {
          margin-top: 18px;
          padding: 13px 15px;
          border-radius: 10px;
          text-align: center;
          font-size: 13px;
          font-weight: 750;
        }

        .profile-message.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
        }

        .profile-message.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        @media (max-width: 700px) {
          .profile-page {
            padding: 30px 14px 60px;
          }

          .profile-summary {
            align-items: center;
            flex-direction: column;
            padding: 0 20px 22px;
            text-align: center;
          }

          .profile-form {
            padding: 20px;
          }

          .profile-grid {
            grid-template-columns: 1fr;
          }

          .profile-full {
            grid-column: auto;
          }
        }
      `}</style>

      <main className="profile-page">
        <div className="profile-container">

          <section className="profile-header">
            <span className="profile-badge">
              ACCOUNT SETTINGS
            </span>

            <h1>
              My Profile
            </h1>

            <p>
              Manage your personal information
              and PROZPO account details.
            </p>
          </section>

          <div className="profile-card">

            <div className="profile-cover" />

            <div className="profile-summary">

              <div className="profile-avatar">
                {getInitials()}
              </div>

              <div className="profile-summary-info">
                <h2>
                  {form.name ||
                    "PROZPO User"}
                </h2>

                <p>
                  {form.email ||
                    "Email not available"}
                </p>

                <span className="profile-role">
                  {roleName()}
                </span>
              </div>

            </div>

            <form
              className="profile-form"
              onSubmit={handleSubmit}
            >

              <section className="profile-section">
                <h2 className="profile-section-title">
                  👤 Personal Information
                </h2>

                <div className="profile-grid">

                  <div className="profile-group">
                    <label className="profile-label">
                      Full Name
                    </label>

                    <input
                      className="profile-input"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="profile-group">
                    <label className="profile-label">
                      Email Address
                    </label>

                    <input
                      className="profile-input"
                      name="email"
                      type="email"
                      value={form.email}
                      disabled
                      placeholder="Email address"
                    />

                    <span className="profile-help">
                      Email is linked to your
                      account.
                    </span>
                  </div>

                  <div className="profile-group">
                    <label className="profile-label">
                      Phone Number
                    </label>

                    <input
                      className="profile-input"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Mobile number"
                    />
                  </div>

                  <div className="profile-group">
                    <label className="profile-label">
                      Account Role
                    </label>

                    <input
                      className="profile-input"
                      value={roleName()}
                      disabled
                    />
                  </div>

                </div>
              </section>

              <section className="profile-section">
                <h2 className="profile-section-title">
                  📍 Location
                </h2>

                <div className="profile-grid">

                  <div className="profile-group">
                    <label className="profile-label">
                      City
                    </label>

                    <input
                      className="profile-input"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Your city"
                    />
                  </div>

                  <div className="profile-group">
                    <label className="profile-label">
                      State
                    </label>

                    <input
                      className="profile-input"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Your state"
                    />
                  </div>

                </div>
              </section>

              <section className="profile-section">
                <h2 className="profile-section-title">
                  📝 About You
                </h2>

                <div className="profile-grid">

                  <div className="profile-group profile-full">
                    <label className="profile-label">
                      Bio
                    </label>

                    <textarea
                      className="profile-textarea"
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tell something about yourself..."
                    />
                  </div>

                </div>
              </section>

              <button
                type="submit"
                className="profile-save"
                disabled={saving}
              >
                {saving
                  ? "Saving Profile..."
                  : "✓ Save Profile"}
              </button>

              {message && (
                <div
                  className={`profile-message ${messageType}`}
                >
                  {message}
                </div>
              )}

            </form>

          </div>
        </div>
      </main>
    </>
  );
}
