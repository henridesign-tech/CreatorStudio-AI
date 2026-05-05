import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-primary/20">
            <Zap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold">Commencez ici</h1>
          <p className="text-slate-400 mt-2">Créez votre compte en quelques secondes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-all"
              placeholder="votre@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Mot de passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-all"
              placeholder="6+ caractères"
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Déjà un compte ? <Link to="/login" className="text-brand-primary hover:underline">Connectez-vous</Link>
        </p>
      </motion.div>
    </div>
  );
}
