import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Documents from "./pages/Documents.jsx";
import Upload from "./pages/Upload.jsx";
import Chat from "./pages/Chat.jsx";
import Summarize from "./pages/Summarize.jsx";
import Review from "./pages/Review.jsx";
import Evaluation from "./pages/Evaluation.jsx";
import BiasFairness from "./pages/BiasFairness.jsx";
import Settings from "./pages/Settings.jsx";
import Admin from "./pages/Admin.jsx";

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
      <Route path="/reset-password" element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/summarize" element={<ProtectedRoute><Summarize /></ProtectedRoute>} />
      <Route path="/review" element={<ProtectedRoute><Review /></ProtectedRoute>} />
      <Route path="/evaluation" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
      <Route path="/bias-fairness" element={<ProtectedRoute><BiasFairness /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default App;
