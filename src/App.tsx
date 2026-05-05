import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./modules/Dashboard";
import ViralContent from "./modules/ViralContent";
import ChannelAnalyzer from "./modules/ChannelAnalyzer";
import PromptGenerator from "./modules/PromptGenerator";
import ClientBusiness from "./modules/ClientBusiness";
import VoiceAI from "./modules/VoiceAI";
import DesignAnalysis from "./modules/DesignAnalysis";
import DesignAI from "./modules/DesignAI";
import VideoAI from "./modules/VideoAI";
import Login from "./modules/Login";
import Signup from "./modules/Signup";
import Pricing from "./modules/Pricing";
import AdminDashboard from "./modules/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ProtectedRoute component for admin-only pages
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== "admin") return <Navigate to="/" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/*" 
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/viral" element={<ViralContent />} />
                  <Route path="/design" element={<DesignAI />} />
                  <Route path="/video" element={<VideoAI />} />
                  <Route path="/voice" element={<VoiceAI />} />
                  <Route path="/analyze" element={<DesignAnalysis />} />
                  <Route path="/channel" element={<ChannelAnalyzer />} />
                  <Route path="/business" element={<ClientBusiness />} />
                  <Route path="/prompts" element={<PromptGenerator />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Layout>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
