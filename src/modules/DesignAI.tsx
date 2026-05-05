import React, { useState, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { useAuth } from "../context/AuthContext";
import { Loader2, Palette, Sparkles, Download, Wand2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const designTypes = [
  { id: "logo", label: "Logo", emoji: "🔠", ratio: "1:1", promptHint: "Minimalist professional vector logo, clean lines, flat icon" },
  { id: "thumbnail", label: "Miniature YouTube", emoji: "📹", ratio: "16:9", promptHint: "High-clickthrough YouTube thumbnail, vibrant colors, expressive" },
  { id: "flyer", label: "Flyer / Affiche", emoji: "📄", ratio: "3:4", promptHint: "Professional marketing flyer, clean layout, vertical composition" },
  { id: "banner", label: "Bannière", emoji: "🌅", ratio: "16:9", promptHint: "Horizontal background banner, cinematic perspective" },
  { id: "social", label: "Post Insta", emoji: "📱", ratio: "1:1", promptHint: "Square social media post, trendy design" },
];

const styles = [
  { id: "photorealistic", label: "Photorealiste", emoji: "📸" },
  { id: "3d-render", label: "Rendu 3D", emoji: "🧊" },
  { id: "flat-design", label: "Flat Design", emoji: "🎨" },
  { id: "abstract", label: "Abstrait", emoji: "✨" },
  { id: "isometric", label: "Isométrique", emoji: "📐" },
  { id: "pop-art", label: "Pop Art", emoji: "💥" },
];

export default function DesignAI() {
  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState(designTypes[1].id);
  const [selectedStyle, setSelectedStyle] = useState(styles[0].id);
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();
  
  const currentType = designTypes.find(t => t.id === selectedType) || designTypes[0];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setInputImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const generateImage = async () => {
    if (!prompt.trim() && !inputImage) return;
    
    setLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("designType", currentType.label);
      formData.append("style", selectedStyle);
      if (inputImage) formData.append("image", inputImage);
      
      const response = await fetch("/api/design/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur serveur lors de la génération");
      
      const data = await response.json();
      
      // Placeholder: handle result
      console.log(data);
      setGeneratedImageUrl("https://via.placeholder.com/500?text=Generated+Result");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <Palette size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-sans tracking-tight">Design AI Studio</h2>
            <p className="text-slate-400">Le futur de la création visuelle pour vos projets.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Sidebar Configuration */}
        <div className="xl:col-span-4 space-y-6">
          <div className="glass-morphism p-8 rounded-3xl space-y-8 border border-white/5">
            {/* Project Type */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                Type de Projet
              </label>
              <div className="grid grid-cols-2 gap-2">
                {designTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-3 ${
                      selectedType === type.id 
                        ? "bg-brand-primary shadow-lg shadow-brand-primary/20 border-brand-primary text-white" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-2xl">{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Wand2 size={16} className="text-brand-primary" />
                Description du visuel
              </label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Un lion majestueux..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 min-h-[140px] outline-none"
              />
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Image de référence (Optionnel)</label>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-2xl p-4 text-center cursor-pointer hover:border-brand-primary/50">
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  {previewImage ? <img src={previewImage} className="max-h-20 mx-auto" /> : <Upload className="mx-auto text-slate-500" />}
                </div>
              </div>
            </div>

            {/* Style Selector */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Style Artistique</label>
              <div className="flex flex-wrap gap-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all ${
                      selectedStyle === style.id 
                        ? "bg-white text-slate-900 border-white" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {style.emoji} {style.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="w-full py-5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 disabled:opacity-50 disabled:grayscale rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-primary/20 uppercase tracking-widest group"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="animate-pulse">Génération...</span>
                </div>
              ) : (
                <>
                  <Sparkles size={20} className="group-hover:scale-125 transition-transform" /> 
                  Générer le Design
                </>
              )}
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="xl:col-span-8">
          <div className="relative group">
            <div className="glass-morphism rounded-[40px] aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden border border-white/5 shadow-2xl">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-8"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                      <Palette className="absolute inset-0 m-auto text-brand-primary animate-pulse" size={32} />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">Création en cours...</h3>
                      <p className="text-slate-500 text-sm italic">L'intelligence artificielle Imagen 3 affine chaque pixel</p>
                    </div>
                  </motion.div>
                ) : generatedImageUrl ? (
                  <motion.div 
                    key="image"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full p-4 flex flex-col"
                  >
                    <div className="flex-1 relative rounded-[32px] overflow-hidden shadow-2xl bg-slate-900 group/canvas">
                      <img 
                        src={generatedImageUrl} 
                        alt="Generated design" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/canvas:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-sm gap-4">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center scale-90 group-hover/canvas:scale-100 transition-transform">
                          <p className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-tighter">Prêt à l'emploi</p>
                          <div className="flex items-center gap-3">
                            <a 
                              href={generatedImageUrl} 
                              download={`design-ia-${selectedType}.png`}
                              className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
                            >
                              <Download size={20} />
                              Télécharger HD
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center p-12 space-y-8">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                        <Palette size={56} className="text-slate-700" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-brand-primary p-2 rounded-xl shadow-lg animate-bounce duration-[2000ms]">
                        <Sparkles size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black tracking-tight">Studio Virtuel</h3>
                      <p className="text-slate-400 max-w-sm mx-auto text-lg leading-relaxed">
                        Configurez votre projet à gauche et laissez la puissance de <span className="text-white font-bold italic">Imagen 3</span> donner vie à vos idées.
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {error && (
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-red-500/20 border border-red-500/30 rounded-3xl text-red-400 text-sm text-center backdrop-blur-xl animate-shake">
                  <p className="font-bold mb-1">Désolé, une erreur est survenue</p>
                  {error}
                </div>
              )}
            </div>
            
            {/* Format info badges */}
            {generatedImageUrl && !loading && (
              <div className="absolute -bottom-4 right-10 flex gap-2">
                <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-xl">
                  Format: {currentType.ratio}
                </div>
                <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-xl">
                  {currentType.label}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
