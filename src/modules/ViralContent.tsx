import React, { useState } from "react";
import { Zap, Send, Copy, RefreshCcw, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";

import { generateContent as generateAIContent } from "@/src/services/geminiService";

export default function ViralContent() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("YouTube Shorts");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generateContent = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const prompt = `Génère une idée de contenu viral complète pour la plateforme ${platform} dans la niche ${niche}. 
      Inclus : 
      1. Un titre accrocheur.
      2. Un Hook (l'accroche des 3 premières secondes).
      3. Un script structuré (Introduction, Corps, Conclusion/CTA).
      4. 5 Hashtags pertinents.
      5. Conseils de storytelling pour maximiser la rétention.
      Réponds en français, avec un style professionnel et structuré en Markdown.`;

      const text = await generateAIContent(prompt);
      setResult(text || "Erreur de génération");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert("Copié !");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary">
          <Zap size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Contenu Viral</h2>
          <p className="text-slate-400">Générez des idées et des scripts optimisés pour la viralité.</p>
        </div>
      </header>

      <div className="glass-morphism p-8 rounded-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Votre Niche / Sujet</label>
            <input 
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="ex: Fitness, Finance, IA, Gaming..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Plateforme</label>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-all appearance-none"
            >
              <option className="bg-slate-900">YouTube Shorts</option>
              <option className="bg-slate-900">TikTok</option>
              <option className="bg-slate-900">Instagram Reels</option>
              <option className="bg-slate-900">YouTube Long Format</option>
              <option className="bg-slate-900">LinkedIn Post</option>
            </select>
          </div>
        </div>

        <button 
          onClick={generateContent}
          disabled={loading || !niche}
          className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-primary/20"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Génération en cours...
            </>
          ) : (
            <>
              <Send size={20} />
              Générer le Script
            </>
          )}
        </button>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism rounded-3xl overflow-hidden"
        >
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest px-2">Script Généré</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                title="Copier"
              >
                <Copy size={18} />
              </button>
              <button 
                onClick={generateContent}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                title="Régénérer"
              >
                <RefreshCcw size={18} />
              </button>
            </div>
          </div>
          <div className="p-8 prose prose-invert max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
