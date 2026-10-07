import React, { useEffect, useMemo, useState } from "react";
import {
  getNotifications,
  deleteNotification,
} from "../src/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      setMessage("");

      const response = await getNotifications();

      const data =
        response?.notifications ||
        response?.data ||
        [];

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Notifications loading error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  function getType(notification) {
    return (
      notification.type ||
      notification.notification_type ||
      "general"
    );
  }

  function getTitle(notification) {
    return (
      notification.title ||
      "PROZPO Notification"
    );
  }

  function getMessage(notification) {
    return (
      notification.message ||
      notification.body ||
      "You have a new notification."
    );
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getIcon(type) {
    const icons = {
      enquiry: "📩",
      property: "🏠",
      favorite: "❤️",
      message: "💬",
      alert: "⚠️",
      success: "✅",
      project: "🏗️",
      account: "👤",
      general: "🔔",
    };

    return icons[type] || "🔔";
  }

  const filteredNotifications = useMemo(() => {
    if (filter === "All") {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        getType(notification).toLowerCase() ===
        filter.toLowerCase()
    );
  }, [notifications, filter]);

  const unreadCount = notifications.filter(
    (notification) =>
      notification.is_read === false ||
      notification.read === false ||
      notification.status === "unread"
  ).length;

  async function removeNotification(
    notification
  ) {
    if (!notification.id) return;

    try {
      setRemovingId(notification.id);
      setMessage("");

      await deleteNotification(
        notification.id
      );

      setNotifications((previous) =>
        previous.filter(
          (item) =>
            item.id !== notification.id
        )
      );

      setMessage(
        "Notification removed."
      );
    } catch (error) {
      console.error(
        "Notification delete error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to remove notification."
      );
    } finally {
      setRemovingId(null);
    }
  }

  function openNotification(notification) {
    const propertyId =
      notification.property_id ||
      notification.property?.id;

    if (propertyId) {
      window.location.hash =
        `property/${propertyId}`;
      return;
    }

    const projectId =
      notification.project_id ||
      notification.project?.id;

    if (projectId) {
      window.location.hash =
        `project/${projectId}`;
    }
  }

  return (
    <>
      <style>{`
        .notifications-page {
          min-height: 100vh;
          padding: 45px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37,99,235,.08),
              transparent 35%
            ),
            #f8fafc;
        }

        .notifications-container {
          max-width: 950px;
          margin: 0 auto;
        }

        .notifications-header {
          margin-bottom: 30px;
        }

        .notifications-badge {
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

        .notifications-header h1 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 5vw, 45px);
          font-weight: 900;
        }

        .notifications-header p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
        }

        .notifications-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .notification-filters {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .filter-button {
          padding: 9px 13px;
          border: 1px solid #dbe3ee;
          border-radius: 20px;
          background: white;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .filter-button.active {
          border-color: #2563eb;
          background: #2563eb;
          color: white;
        }

        .notification-summary {
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .notification-message {
          margin-bottom: 18px;
          padding: 12px 15px;
          border-radius: 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 750;
          text-align: center;
        }

        .notification-list {
          display: grid;
          gap: 12px;
        }

        .notification-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: white;
          box-shadow:
            0 7px 22px rgba(15,23,42,.05);
          transition: .2s;
        }

        .notification-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 12px 30px rgba(15,23,42,.09);
        }

        .notification-card.unread {
          border-left: 4px solid #2563eb;
          background: #f8fbff;
        }

        .notification-icon {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #eff6ff;
          font-size: 22px;
        }

        .notification-content {
          min-width: 0;
          flex: 1;
        }

        .notification-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .notification-title {
          margin: 0 0 5px;
          color: #0f172a;
          font-size: 16px;
          font-weight: 900;
        }

        .notification-time {
          flex-shrink: 0;
          color: #94a3b8;
          font-size: 10px;
        }

        .notification-text {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .notification-actions {
          display: flex;
          gap: 7px;
          margin-top: 12px;
        }

        .notification-action {
          padding: 8px 11px;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .open-notification {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .delete-notification {
          background: #fef2f2;
          color: #b91c1c;
        }

        .notification-action:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .notifications-loading,
        .notifications-empty {
          padding: 55px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          color: #64748b;
          text-align: center;
        }

        .notifications-empty h2 {
          margin: 0 0 8px;
          color: #0f172a;
        }

        .notifications-empty p {
          margin: 0;
        }

        @media (max-width: 650px) {
          .notifications-page {
            padding: 30px 14px 60px;
          }

          .notifications-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .notification-card {
            padding: 15px;
          }

          .notification-title-row {
            flex-direction: column;
            gap: 4px;
          }

          .notification-time {
            order: 2;
          }
        }
      `}</style>

      <main className="notifications-page">
        <div className="notifications-container">

          <section className="notifications-header">
            <span className="notifications-badge">
              ACCOUNT UPDATES
            </span>

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated with your property
              enquiries, saved properties and
              important PROZPO activity.
            </p>
          </section>

          {message && (
            <div className="notification-message">
              {message}
            </div>
          )}

          <section className="notifications-toolbar">

            <div className="notification-filters">

              {[
                "All",
                "Enquiry",
                "Property",
                "Favorite",
                "Project",
              ].map((item) => (
                <button
                  key={item}
                  className={`filter-button ${
                    filter === item
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setFilter(item)
                  }
                >
                  {item}
                </button>
              ))}

            </div>

            <div className="notification-summary">
              {loading
                ? "Loading..."
                : `${unreadCount} Unread`}
            </div>

          </section>

          {loading ? (
            <div className="notifications-loading">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">

              <div
                style={{
                  fontSize: "55px",
                  marginBottom: "12px",
                }}
              >
                🔔
              </div>

              <h2>
                No Notifications
              </h2>

              <p>
                You don't have any notifications
                for this category.
              </p>

            </div>
          ) : (
            <section className="notification-list">

              {filteredNotifications.map(
                (notification, index) => {

                  const isUnread =
                    notification.is_read ===
                      false ||
                    notification.read ===
                      false ||
                    notification.status ===
                      "unread";

                  const type =
                    getType(notification);

                  return (
                    <article
                      className={`notification-card ${
                        isUnread
                          ? "unread"
                          : ""
                      }`}
                      key={
                        notification.id ||
                        index
                      }
                    >

                      <div className="notification-icon">
                        {getIcon(type)}
                      </div>

                      <div className="notification-content">

                        <div className="notification-title-row">

                          <h2 className="notification-title">
                            {getTitle(
                              notification
                            )}
                          </h2>

                          <span className="notification-time">
                            {formatDate(
                              notification.created_at ||
                                notification.createdAt
                            )}
                          </span>

                        </div>

                        <p className="notification-text">
                          {getMessage(
                            notification
                          )}
                        </p>

                        <div className="notification-actions">

                          {(notification.property_id ||
                            notification.project_id) && (
                            <button
                              className="notification-action open-notification"
                              onClick={() =>
                                openNotification(
                                  notification
                                )
                              }
                            >
                              Open
                            </button>
                          )}

                          <button
                            className="notification-action delete-notification"
                            disabled={
                              removingId ===
                              notification.id
                            }
                            onClick={() =>
                              removeNotification(
                                notification
                              )
                            }
                          >
                            {removingId ===
                            notification.id
                              ? "..."
                              : "Remove"}
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </section>
          )}

        </div>
      </main>
    </>
  );
}
