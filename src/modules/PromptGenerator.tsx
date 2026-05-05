import React, { useState } from "react";
import { FileTerminal, Sparkles, Copy, Loader2, Image as ImageIcon, Camera, Layout } from "lucide-react";
import { motion } from "motion/react";

const styles = [
  { id: "cinematic", label: "Cinématique", icon: Camera },
  { id: "realistic", label: "Réaliste / Photo", icon: ImageIcon },
  { id: "branding", label: "Branding / Logos", icon: Layout },
  { id: "creative", label: "Art Créatif", icon: Sparkles },
];

import { generateContent as generateAIContent } from "@/src/services/geminiService";

export default function PromptGenerator() {
  const [concept, setConcept] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);

  const generatePrompts = async () => {
    if (!concept) return;
    setLoading(true);
    try {
      const prompt = `Génère 3 variantes de prompts détaillés et optimisés pour une IA de génération d'images (comme Midjourney ou DALL-E 3) basés sur le concept suivant : "${concept}".
      Style demandé : ${selectedStyle}.
      Chaque prompt doit être en anglais (car les IA d'images préfèrent l'anglais) mais donne une brève explication en français de l'intention de chaque variante.
      Formatte la réponse comme une liste simple avec chaque prompt commençant par un tiret "-".
      
      Exemple de format :
      - [Variante 1] : Prompt en anglais... (Explication en français)
      - [Variante 2] : Prompt en anglais... (Explication en français)
      - [Variante 3] : Prompt en anglais... (Explication en français)`;

      const text = await generateAIContent(prompt);
      const lines = (text || "").split("\n").filter((line: string) => line.trim().startsWith("-"));
      setPrompts(lines.length > 0 ? lines : [text || "Erreur"]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <FileTerminal size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Prompt Generator</h2>
          <p className="text-slate-400">Transformez vos idées simples en prompts IA ultra-puissants.</p>
        </div>
      </header>

      <div className="glass-morphism p-8 rounded-3xl space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-400">Quel est votre concept ?</label>
          <textarea 
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="ex: Un astronaute qui boit un café sur Mars dans un style néon cyberpunk..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all h-32 resize-none text-lg"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-400">Style Visuel</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  selectedStyle === style.id 
                    ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10" 
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                }`}
              >
                <style.icon size={24} />
                <span className="text-xs font-bold uppercase tracking-wider">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={generatePrompts}
          disabled={loading || !concept}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Génération des Prompts...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Optimiser mon Prompt
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {prompts.map((prompt, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className="glass-morphism p-6 rounded-2xl group flex items-start gap-4 hover:border-indigo-500/30 transition-all"
          >
            <div className="flex-1 text-slate-300 text-sm leading-relaxed">
              {prompt.replace(/^- /, "")}
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(prompt.replace(/^- /, ""));
                alert("Copié !");
              }}
              className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg text-slate-500 hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100"
            >
              <Copy size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
