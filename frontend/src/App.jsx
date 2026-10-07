import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import ErrorBoundary from "./ErrorBoundary";

import Auth from "../pages/Auth";
import Home from "../pages/Home";
import Buy from "../pages/Buy";
import Rent from "../pages/Rent";
import Commercial from "../pages/Commercial";
import Plots from "../pages/Plots";
import Projects from "../pages/Projects";
import Agents from "../pages/Agents";
import Builders from "../pages/Builders";
import PostProperty from "../pages/PostProperty";

import PropertyDetail from "../pages/PropertyDetail";
import EditProperty from "../pages/EditProperty";
import MyProperties from "../pages/MyProperties";
import MyEnquiries from "../pages/MyEnquiries";
import Favorites from "../pages/Favorites";
import Notifications from "../pages/Notifications";
import Profile from "../pages/Profile";

import OwnerDashboard from "../pages/OwnerDashboard";
import AgentDashboard from "../pages/AgentDashboard";
import BuilderDashboard from "../pages/BuilderDashboard";
import AdminDashboard from "../pages/AdminDashboard";

import SearchProperties from "../pages/SearchProperties";
import PropertyImages from "../pages/PropertyImages";
import RoleBasedAccess from "../pages/RoleBasedAccess";

import NotFound from "../pages/NotFound";

function getHashRoute() {
  const hash = window.location.hash || "";

  return hash
    .replace(/^#/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function getRouteParts() {
  const route = getHashRoute();

  const [path, queryString = ""] = route.split("?");

  const parts = path
    .split("/")
    .filter(Boolean);

  return {
    route: path || "home",
    parts,
    query: new URLSearchParams(queryString),
  };
}

function App() {
  const [route, setRoute] = useState(getHashRoute());

  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getHashRoute());
      setMobileMenu(false);
      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    };

    window.addEventListener(
      "hashchange",
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );
    };
  }, []);

  const navigate = (pageName) => {
    const cleanPage = String(pageName || "")
      .replace(/^#/, "")
      .replace(/^\/+/, "");

    window.location.hash = cleanPage;
    setMobileMenu(false);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  const routeInfo = useMemo(
    () => getRouteParts(),
    [route]
  );

  const { route: currentRoute, parts, query } = routeInfo;

  const propertyId =
    parts[1] ||
    query.get("id") ||
    "";

  const renderPage = () => {
    switch (parts[0] || "home") {
      /* =====================================================
         MAIN PAGES
         ===================================================== */

      case "":
      case "home":
        return <Home />;

      case "buy":
        return <Buy />;

      case "rent":
        return <Rent />;

      case "commercial":
        return <Commercial />;

      case "plots":
        return <Plots />;

      case "projects":
        return <Projects />;

      case "agents":
        return <Agents />;

      case "builders":
        return <Builders />;

      case "auth":
      case "login":
      case "register":
        return <Auth />;

      case "post-property":
        return <PostProperty />;

      /* =====================================================
         PROPERTY
         ===================================================== */

      case "property":
      case "property-detail":
        return propertyId ? (
          <PropertyDetail />
        ) : (
          <SearchProperties />
        );

      case "edit-property":
        return propertyId ? (
          <EditProperty />
        ) : (
          <NotFound />
        );

      case "property-images":
        return propertyId ? (
          <PropertyImages />
        ) : (
          <NotFound />
        );

      case "search":
      case "search-properties":
        return <SearchProperties />;

      /* =====================================================
         USER AREA
         ===================================================== */

      case "my-properties":
        return <MyProperties />;

      case "my-enquiries":
        return <MyEnquiries />;

      case "favorites":
      case "favourites":
        return <Favorites />;

      case "notifications":
        return <Notifications />;

      case "profile":
        return <Profile />;

      /* =====================================================
         DASHBOARDS
         ===================================================== */

      case "dashboard":
      case "role-access":
      case "role-based-access":
        return <RoleBasedAccess />;

      case "owner-dashboard":
        return <OwnerDashboard />;

      case "agent-dashboard":
        return <AgentDashboard />;

      case "builder-dashboard":
        return <BuilderDashboard />;

      case "admin-dashboard":
        return <AdminDashboard />;

      /* =====================================================
         PROJECT ROUTES
         ===================================================== */

      case "project":
      case "project-detail":
        return <Projects />;

      /* =====================================================
         FALLBACK
         ===================================================== */

      default:
        return <NotFound />;
    }
  };

  const isAuthPage =
    currentRoute === "auth" ||
    currentRoute === "login" ||
    currentRoute === "register";

  const isDashboard =
    currentRoute.includes("dashboard") ||
    currentRoute === "role-access" ||
    currentRoute === "role-based-access";

  return (
    <ErrorBoundary>
      <div className="app prozpo-app">

        {/* =================================================
            GLOBAL STYLE
            ================================================= */}

        <style>
          {`
            * {
              box-sizing: border-box;
            }

            html {
              scroll-behavior: smooth;
            }

            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }

            .prozpo-app {
              min-height: 100vh;
              background: #f8fafc;
              color: #0f172a;
            }

            .prozpo-header {
              position: sticky;
              top: 0;
              z-index: 1000;
              width: 100%;
              background: rgba(255,255,255,.96);
              backdrop-filter: blur(14px);
              border-bottom: 1px solid #e2e8f0;
            }

            .prozpo-header-inner {
              width: 100%;
              max-width: 1280px;
              min-height: 72px;
              margin: 0 auto;
              padding: 0 20px;
              display: flex;
              align-items: center;
              gap: 22px;
            }

            .prozpo-logo {
              border: 0;
              background: transparent;
              color: #2563eb;
              font-size: 25px;
              font-weight: 950;
              letter-spacing: -1px;
              cursor: pointer;
              padding: 8px 0;
              white-space: nowrap;
            }

            .prozpo-nav {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 3px;
            }

            .prozpo-nav button,
            .prozpo-footer-links button {
              border: 0;
              background: transparent;
              color: #475569;
              padding: 9px 10px;
              border-radius: 9px;
              font-size: 13px;
              font-weight: 750;
              cursor: pointer;
            }

            .prozpo-nav button:hover,
            .prozpo-footer-links button:hover {
              background: #eff6ff;
              color: #2563eb;
            }

            .prozpo-post-btn {
              border: 0;
              border-radius: 11px;
              padding: 11px 16px;
              background: #2563eb;
              color: white;
              font-size: 13px;
              font-weight: 850;
              cursor: pointer;
              white-space: nowrap;
              box-shadow: 0 7px 18px rgba(37,99,235,.2);
            }

            .prozpo-post-btn:hover {
              background: #1d4ed8;
            }

            .prozpo-mobile-btn {
              display: none;
              width: 42px;
              height: 42px;
              border: 1px solid #e2e8f0;
              border-radius: 11px;
              background: #fff;
              color: #0f172a;
              font-size: 21px;
              cursor: pointer;
            }

            .prozpo-mobile-menu {
              display: none;
            }

            .prozpo-main {
              min-height: calc(100vh - 72px);
            }

            .prozpo-footer {
              margin-top: 50px;
              background: #0f172a;
              color: #cbd5e1;
              padding: 42px 20px 25px;
            }

            .prozpo-footer-inner {
              width: 100%;
              max-width: 1180px;
              margin: 0 auto;
            }

            .prozpo-footer-top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 30px;
            }

            .prozpo-footer-logo {
              color: #ffffff;
              font-size: 25px;
              font-weight: 950;
              margin-bottom: 7px;
            }

            .prozpo-footer p {
              margin: 0;
              color: #94a3b8;
              font-size: 13px;
            }

            .prozpo-footer-links {
              display: flex;
              flex-wrap: wrap;
              justify-content: flex-end;
              gap: 3px;
            }

            .prozpo-footer-links button {
              color: #cbd5e1;
            }

            .prozpo-copyright {
              margin-top: 30px !important;
              padding-top: 18px;
              border-top: 1px solid rgba(255,255,255,.1);
              text-align: center;
              font-size: 12px !important;
            }

            @media (max-width: 1050px) {
              .prozpo-nav {
                gap: 0;
              }

              .prozpo-nav button {
                padding-left: 7px;
                padding-right: 7px;
                font-size: 12px;
              }

              .prozpo-header-inner {
                gap: 12px;
              }
            }

            @media (max-width: 850px) {
              .prozpo-header-inner {
                min-height: 64px;
                padding: 0 14px;
                justify-content: space-between;
              }

              .prozpo-nav {
                display: none;
              }

              .prozpo-post-btn {
                display: none;
              }

              .prozpo-mobile-btn {
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .prozpo-mobile-menu {
                position: absolute;
                top: 64px;
                left: 0;
                right: 0;
                display: flex;
                flex-direction: column;
                padding: 10px 14px 16px;
                background: #ffffff;
                border-bottom: 1px solid #e2e8f0;
                box-shadow: 0 15px 30px rgba(15,23,42,.08);
              }

              .prozpo-mobile-menu button {
                width: 100%;
                border: 0;
                background: #f8fafc;
                color: #334155;
                text-align: left;
                border-radius: 10px;
                padding: 12px 14px;
                margin-top: 5px;
                font-weight: 750;
                cursor: pointer;
              }

              .prozpo-mobile-menu button:hover {
                background: #eff6ff;
                color: #2563eb;
              }

              .prozpo-footer-top {
                flex-direction: column;
              }

              .prozpo-footer-links {
                justify-content: flex-start;
              }
            }

            @media (max-width: 480px) {
              .prozpo-logo {
                font-size: 22px;
              }

              .prozpo-footer {
                padding-left: 14px;
                padding-right: 14px;
              }

              .prozpo-footer-links {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                width: 100%;
              }

              .prozpo-footer-links button {
                text-align: left;
              }
            }
          `}
        </style>

        {/* =================================================
            HEADER
            ================================================= */}

        {!isAuthPage && (
          <header className="prozpo-header">

            <div className="prozpo-header-inner">

              <button
                type="button"
                className="prozpo-logo"
                onClick={() => navigate("home")}
              >
                PROPZO
              </button>

              <nav className="prozpo-nav">

                <button
                  type="button"
                  onClick={() => navigate("home")}
                >
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => navigate("buy")}
                >
                  Buy
                </button>

                <button
                  type="button"
                  onClick={() => navigate("rent")}
                >
                  Rent
                </button>

                <button
                  type="button"
                  onClick={() => navigate("commercial")}
                >
                  Commercial
                </button>

                <button
                  type="button"
                  onClick={() => navigate("plots")}
                >
                  Plots
                </button>

                <button
                  type="button"
                  onClick={() => navigate("projects")}
                >
                  Projects
                </button>

                <button
                  type="button"
                  onClick={() => navigate("agents")}
                >
                  Agents
                </button>

                <button
                  type="button"
                  onClick={() => navigate("builders")}
                >
                  Builders
                </button>

                <button
                  type="button"
                  onClick={() => navigate("search-properties")}
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => navigate("favorites")}
                >
                  Favorites
                </button>

                <button
                  type="button"
                  onClick={() => navigate("profile")}
                >
                  Profile
                </button>

              </nav>

              <button
                type="button"
                className="prozpo-post-btn"
                onClick={() => navigate("post-property")}
              >
                + Post Property
              </button>

              <button
                type="button"
                className="prozpo-mobile-btn"
                onClick={() => setMobileMenu(!mobileMenu)}
                aria-label="Open navigation"
              >
                {mobileMenu ? "×" : "☰"}
              </button>

            </div>

            {mobileMenu && (
              <div className="prozpo-mobile-menu">

                <button onClick={() => navigate("home")}>
                  Home
                </button>

                <button onClick={() => navigate("buy")}>
                  Buy Property
                </button>

                <button onClick={() => navigate("rent")}>
                  Rent Property
                </button>

                <button onClick={() => navigate("commercial")}>
                  Commercial
                </button>

                <button onClick={() => navigate("plots")}>
                  Plots
                </button>

                <button onClick={() => navigate("projects")}>
                  Projects
                </button>

                <button onClick={() => navigate("agents")}>
                  Agents
                </button>

                <button onClick={() => navigate("builders")}>
                  Builders
                </button>

                <button onClick={() => navigate("search-properties")}>
                  Search Properties
                </button>

                <button onClick={() => navigate("my-properties")}>
                  My Properties
                </button>

                <button onClick={() => navigate("my-enquiries")}>
                  My Enquiries
                </button>

                <button onClick={() => navigate("favorites")}>
                  Favorites
                </button>

                <button onClick={() => navigate("notifications")}>
                  Notifications
                </button>

                <button onClick={() => navigate("profile")}>
                  Profile
                </button>

                <button onClick={() => navigate("dashboard")}>
                  My Dashboard
                </button>

                <button
                  onClick={() => navigate("post-property")}
                  style={{
                    background: "#2563eb",
                    color: "#ffffff",
                  }}
                >
                  + Post Property
                </button>

              </div>
            )}

          </header>
        )}

        {/* =================================================
            MAIN
            ================================================= */}

        <main className="prozpo-main">
          {renderPage()}
        </main>

        {/* =================================================
            FOOTER
            ================================================= */}

        {!isAuthPage && !isDashboard && (
          <footer className="prozpo-footer">

            <div className="prozpo-footer-inner">

              <div className="prozpo-footer-top">

                <div>
                  <div className="prozpo-footer-logo">
                    PROPZO
                  </div>

                  <p>
                    India's Real Estate Marketplace
                  </p>
                </div>

                <div className="prozpo-footer-links">

                  <button onClick={() => navigate("home")}>
                    Home
                  </button>

                  <button onClick={() => navigate("buy")}>
                    Buy
                  </button>

                  <button onClick={() => navigate("rent")}>
                    Rent
                  </button>

                  <button onClick={() => navigate("commercial")}>
                    Commercial
                  </button>

                  <button onClick={() => navigate("plots")}>
                    Plots
                  </button>

                  <button onClick={() => navigate("projects")}>
                    Projects
                  </button>

                  <button onClick={() => navigate("agents")}>
                    Agents
                  </button>

                  <button onClick={() => navigate("builders")}>
                    Builders
                  </button>

                  <button onClick={() => navigate("post-property")}>
                    Post Property
                  </button>

                  <button onClick={() => navigate("search-properties")}>
                    Search
                  </button>

                  <button onClick={() => navigate("profile")}>
                    Profile
                  </button>

                </div>

              </div>

              <p className="prozpo-copyright">
                © 2026 PROPZO. All Rights Reserved.
              </p>

            </div>

          </footer>
        )}

      </div>
    </ErrorBoundary>
  );
}

export default App;
