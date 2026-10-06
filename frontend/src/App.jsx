import React, { useState } from "react";
import "./App.css";

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

function App() {
  const [page, setPage] = useState("home");

  const navigate = (pageName) => {
    setPage(pageName);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page) {
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
        return <Auth />;

      case "post-property":
        return <PostProperty />;

      case "home":
      default:
        return <Home />;
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">

        {/* LOGO */}
        <div
          className="logo"
          onClick={() => navigate("home")}
        >
          PROPZO
        </div>

        {/* NAVIGATION */}
        <nav>

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

        </nav>

        {/* POST PROPERTY */}
        <button
          className="post-btn"
          onClick={() => navigate("post-property")}
        >
          Post Property
        </button>

      </header>

      {/* PAGE CONTENT */}
      <main>
        {renderPage()}
      </main>

      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-logo">
          PROPZO
        </div>

        <p>
          India's Real Estate Marketplace
        </p>

        <div className="footer-links">

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

        </div>

        <p className="copyright">
          © 2026 PROPZO. All Rights Reserved.
        </p>

      </footer>

    </div>
  );
}

export default App;
