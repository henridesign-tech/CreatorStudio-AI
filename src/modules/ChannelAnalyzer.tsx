import React, { useState } from "react";
import { BarChart3, Search, Send, Loader2, CheckCircle2, AlertCircle, TrendingUp, Calendar, Target } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";

import { generateContent as generateAIContent } from "@/src/services/geminiService";

export default function ChannelAnalyzer() {
  const [links, setLinks] = useState("");
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const performAnalysis = async () => {
    if (!niche || !description) return;
    setLoading(true);
    try {
      const prompt = `Agis en tant qu'expert en stratégie de contenu et analyse de chaînes sociales. 
      Analyse une chaîne avec les informations suivantes :
      - Niche : ${niche}
      - Description : ${description}
      - Liens vidéos (fournis par l'utilisateur) : ${links}

      Fournis une analyse complète structurée comme suit :
      1. Score de performance globale (/100).
      2. Points Forts (3-5 points).
      3. Faiblesses & Erreurs Critiques (3-5 points).
      4. Recommandations Concrètes (stratégie, branding, hooks).
      5. Plan d'Action sur 30 Jours étape par étape.
      6. 5 Idées de contenu personnalisées pour booster la viralité.

      Réponds en français, format Markdown, utilise des icônes et une structure claire.`;

      const text = await generateAIContent(prompt);
      setAnalysis(text || "Erreur d'analyse");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
          <BarChart3 size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Channel Analyzer</h2>
          <p className="text-slate-400">Audit complet de votre stratégie sociale et plan de croissance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-morphism p-8 rounded-3xl space-y-6 self-start">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Niche de la chaîne</label>
              <input 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="ex: Tech, Recettes Healthy, Vlog Voyage..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Description / Bio</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre chaîne, vos objectifs, votre cible..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-500/50 transition-all h-32 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Liens de vos dernières vidéos (3-10)</label>
              <textarea 
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                placeholder="Collez les URLs YouTube, TikTok ou Instagram ici..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-500/50 transition-all h-32 resize-none font-mono text-sm"
              />
            </div>
          </div>

          <button 
            onClick={performAnalysis}
            disabled={loading || !niche || !description}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyse IA en cours...
              </>
            ) : (
              <>
                <Search size={20} />
                Lancer l'Audit
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {!analysis && !loading && (
            <div className="glass-morphism rounded-3xl p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp size={40} className="text-orange-500" />
              </div>
              <div className="max-w-sm mx-auto">
                <h4 className="text-xl font-bold mb-2">Prêt pour la croissance ?</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Remplissez les informations à gauche pour obtenir un audit détaillé de votre chaîne et un plan d'action personnalisé sous 30 jours.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-4">
                <div className="flex items-center gap-3 text-sm text-slate-400 px-4 py-2 rounded-xl bg-white/5">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Analyse des Hooks & Storytelling</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400 px-4 py-2 rounded-xl bg-white/5">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Détection d'erreurs stratégiques</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400 px-4 py-2 rounded-xl bg-white/5">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Plan de contenu sur mesure</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="glass-morphism rounded-3xl p-12 text-center space-y-8 animate-pulse">
              <div className="space-y-4">
                <div className="w-48 h-8 bg-white/10 rounded-full mx-auto"></div>
                <div className="w-72 h-4 bg-white/5 rounded-full mx-auto"></div>
              </div>
              <div className="space-y-6 pt-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-white/5 rounded-2xl"></div>
                ))}
              </div>
            </div>
          )}

          {analysis && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-morphism rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/5"
            >
              <div className="p-4 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-between">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-widest px-2 flex items-center gap-2">
                  <Target size={14} /> Audit de Chaîne Terminé
                </span>
                <button 
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-all"
                >
                  Exporter PDF
                </button>
              </div>
              <div className="p-8 prose prose-invert prose-orange max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
