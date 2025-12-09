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
import Culinary from "./pages/Culinary";
import Engineering from "./pages/Engineering";
import Medical from "./pages/Medical";
import Teaching from "./pages/Teaching";
import Civil from "./pages/CIvil";  


/* App is intentionally slim: providers + router + global modal */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:id" element={<CareerDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/skill-tests" element={<SkillTests />} />
          <Route path="/about" element={<About />} />

          {/* category placeholders (you can create pages later) */}
          <Route path="/engineering-careers" element={<Engineering />} />
          <Route path="/medical-careers" element={<Medical />} />
          <Route path="/teaching-careers" element={<Teaching />} />
          <Route path="/culinary-careers" element={<Culinary />} />
          <Route path="/civil-careers" element={<Civil />} />
          <Route path="/personality-test" element={<Quiz />} />
          <Route path="/happiness-index" element={<Results />} />
        </Routes>

        {/* global modal rendered once at top-level */}
        <ModalAuth />
      </BrowserRouter>
    </AuthProvider>
  );
}
