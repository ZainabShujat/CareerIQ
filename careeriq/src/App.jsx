// src/App.jsx
import React from "react";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import ModalAuth from "./components/ModalAuth";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/Home";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Careers from "./pages/Careers";
import CareerDetail from "./pages/CareerDetail";
import Insights from "./pages/Insights";
import SkillTests from "./pages/SkillTests";
import About from "./pages/About";
import Profile from "./pages/Profile";

/* Category pages (create simple placeholder pages if missing) */
import Category from "./pages/Category";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Core pages */}
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:id" element={<CareerDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/skill-tests" element={<SkillTests />} />
          <Route path="/about" element={<About />} />
          <Route path="/personality-test" element={<Quiz />} />
          <Route path="/happiness-index" element={<Results />} />

          {/* Category routes (explicit named pages) */}

          {/* Generic category route that reads a tag param (e.g. /category/engineering) */}
          <Route path="/category/:tag" element={<Category />} />

        </Routes>

        {/* global modal rendered once at top-level */}
        <ModalAuth />
      </BrowserRouter>
    </AuthProvider>
  );
}
