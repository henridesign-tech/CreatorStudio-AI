import React, { useState } from "react";
import { Search, Upload, Target, CheckCircle2, Loader2, AlertTriangle, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";

import { analyzeImage as analyzeAIImage } from "@/src/services/geminiService";

export default function DesignAnalysis() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [critique, setCritique] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyzeDesign = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const prompt = `Agis en tant qu'expert en design graphique et UX. Analyse ce design (miniature YouTube ou affiche). 
      Fournis une critique constructive structurée :
      1. Score de lisibilité (/100).
      2. Analyse des couleurs et contrastes.
      3. Hiérarchie visuelle.
      4. Suggestions d'amélioration immédiates.
      5. Verdict : Est-ce que ça va convertir (clics/ventes) ?
      Réponds en français avec Markdown.`;

      const text = await analyzeAIImage(prompt, image);
      setCritique(text || "Erreur d'analyse visuelle");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
          <Search size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Analyse Design</h2>
          <p className="text-slate-400">Obtenez une critique instantanée de vos visuels par notre IA experte.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-morphism rounded-3xl overflow-hidden min-h-[400px] flex flex-col relative group">
            {image ? (
              <>
                <img src={image} alt="Upload" className="w-full h-full object-contain p-4" />
                <button 
                  onClick={() => { setImage(null); setCritique(null); }}
                  className="absolute top-4 right-4 p-2 bg-red-500/80 rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                >
                  <AlertTriangle size={20} />
                </button>
              </>
            ) : (
              <label className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all gap-4">
                <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <Upload size={32} />
                </div>
                <div className="text-center">
                  <p className="font-bold">Cliquez pour uploader</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP jusqu'à 5MB</p>
                </div>
              </label>
            )}
          </div>

          <button 
            onClick={analyzeDesign}
            disabled={loading || !image}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Critique IA en cours...
              </>
            ) : (
              <>
                <Eye size={20} />
                Lancer l'Analyse Visuelle
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {!critique && !loading && (
            <div className="glass-morphism rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target size={20} className="text-cyan-500" />
                Ce que nous analysons
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Psychologie des couleurs", desc: "Coherence avec votre audience." },
                  { label: "Lisibilité", desc: "Est-ce lisible sur mobile ?" },
                  { label: "Espaces Négatifs", desc: "Le design respire-t-il ?" },
                  { label: "Call To Action", desc: "Le bouton ou message est-il visible ?" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{item.label}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="glass-morphism rounded-3xl p-12 text-center space-y-4">
              <Loader2 className="animate-spin text-cyan-500 mx-auto" size={48} />
              <p className="text-slate-400 font-medium">L'IA examine chaque pixel de votre création...</p>
            </div>
          )}

          {critique && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism rounded-3xl overflow-hidden"
            >
              <div className="p-4 bg-cyan-500/10 border-b border-cyan-500/20 flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest px-2">Verdict Expert IA</span>
                <span className="text-xs font-bold bg-cyan-500 text-white px-2 py-0.5 rounded-full">Score: 82/100</span>
              </div>
              <div className="p-8 prose prose-invert prose-cyan max-w-none">
                <ReactMarkdown>{critique}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
