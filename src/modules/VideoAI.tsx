import { useAuth } from "../context/AuthContext";
import React, { useState, useRef, useEffect } from "react";
import { 
  Video, 
  Upload, 
  Sparkles, 
  Type, 
  Scissors, 
  Smartphone, 
  Download, 
  Play, 
  Pause,
  Loader2,
  CheckCircle2,
  Clock,
  Layers,
  Settings2,
  Maximize2,
  Palette,
  Trash2,
  Undo,
  Redo,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed";
  progress: number;
}

interface Subtitle {
  id: string;
  start: number;
  end: number;
  text: string;
}

export default function VideoAI() {
  const { token } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [inputImage, setInputImage] = useState<File | null>(null);
  
  // New States for Editor
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<"ai" | "edit" | "style" | "gen">("ai");
  const [subtitleColor, setSubtitleColor] = useState("#facc15"); // Yellow
  const [subtitleSize, setSubtitleSize] = useState(32);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);

  const [subtitles, setSubtitles] = useState<Subtitle[]>([
    { id: "1", start: 1, end: 4, text: "DÉCOUVREZ L'IA GÉNÉRATIVE" },
    { id: "2", start: 5, end: 8, text: "TRANSFORMEZ VOS RUSHES" },
    { id: "3", start: 9, end: 12, text: "VITESSE DE CRÉATION X10" },
    { id: "4", start: 13, end: 16, text: "ABONNE-TOI POUR PLUS !" },
  ]);

  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "analyze", label: "Analyse du contenu", status: "pending", progress: 0 },
    { id: "subtitles", label: "Génération des sous-titres dynamiques", status: "pending", progress: 0 },
    { id: "crop", label: "Recadrage vertical intelligent", status: "pending", progress: 0 },
    { id: "cuts", label: "Suppression automatique des silences", status: "pending", progress: 0 },
  ]);

  // Update current subtitle based on time
  useEffect(() => {
    const active = subtitles.find(s => currentTime >= s.start && currentTime <= s.end);
    setCurrentSubtitle(active ? active.text : null);
  }, [currentTime, subtitles]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setShowResult(false);
      setCurrentTime(0);
    }
  };

  const startProcessing = async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setProcessingProgress(10);
    
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      
      setSteps(prev => prev.map(s => s.id === "analyze" ? { ...s, status: "processing", progress: 50 } : s));
      
      const response = await fetch("/api/video/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur serveur lors de l'analyse");
      
      const data = await response.json();
      
      setSubtitles(data.subtitles);
      setSteps(prev => prev.map(s => s.status === "pending" ? { ...s, status: "completed", progress: 100 } : s));
      
      setIsProcessing(false);
      setShowResult(true);
      setActiveTab("edit");

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert("Erreur lors de l'analyse vidéo.");
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const setTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <Video size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-black font-sans tracking-tight">CapCut AI Pro</h2>
            <p className="text-slate-400 text-sm">Édition automatique & sous-titres intelligents.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {videoFile && !isProcessing && !showResult && (
            <button 
              onClick={startProcessing}
              className="px-8 py-3 bg-brand-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
            >
              <Zap size={18} fill="white" />
              Auto-Edit IA
            </button>
          )}
          {showResult && (
            <button 
              onClick={() => {
                if (videoUrl) {
                  const link = document.createElement("a");
                  link.href = videoUrl;
                  link.download = `video-ia-${videoFile?.name || "final"}.mp4`;
                  link.click();
                }
              }}
              className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Download size={18} />
              Exporter
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
        {/* Left Toolbar */}
        <div className="xl:col-span-1 hidden xl:flex flex-col gap-4 bg-slate-900/50 backdrop-blur-xl border border-white/5 p-4 rounded-[32px]">
          <ToolIcon icon={<Scissors size={20} />} label="Couper" active />
          <ToolIcon icon={<Maximize2 size={20} />} label="Zoom" />
          <ToolIcon icon={<Type size={20} />} label="Texte" />
          <ToolIcon icon={<Smartphone size={20} />} label="Format" />
          <div className="mt-auto pt-4 border-t border-white/5 space-y-4">
            <ToolIcon icon={<Undo size={20} />} label="Undo" />
            <ToolIcon icon={<Redo size={20} />} label="Redo" />
          </div>
        </div>

        {/* Center Preview Area */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <div className="flex-1 glass-morphism rounded-[32px] overflow-hidden relative flex items-center justify-center bg-slate-950 border border-white/5 shadow-inner group">
            {!videoUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-4 cursor-pointer hover:scale-105 transition-transform"
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-500">
                  <Upload size={32} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Uploader le rush</p>
              </div>
            ) : (
              <div className={cn(
                "h-full transition-all duration-700 relative",
                showResult ? "aspect-[9/16]" : "w-full aspect-video"
              )}>
                <video 
                  ref={videoRef}
                  src={videoUrl} 
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
                
                {/* Dynamic Subtitles Overlay */}
                <AnimatePresence>
                  {currentSubtitle && showResult && (
                    <motion.div 
                      key={currentSubtitle}
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 1.1, opacity: 0 }}
                      className="absolute inset-x-0 bottom-[20%] flex justify-center pointer-events-none px-10"
                    >
                      <span 
                        className="font-black text-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] px-4 py-2 rounded-lg"
                        style={{ 
                          color: subtitleColor, 
                          fontSize: `${subtitleSize}px`,
                          WebkitTextStroke: "2px black" 
                        }}
                      >
                        {currentSubtitle.toUpperCase()}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:scale-110 transition-transform"
                  >
                    {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} className="ml-1" fill="white" />}
                  </button>
                </div>
              </div>
            )}

            {/* AI Floating Badges */}
            {showResult && (
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="bg-brand-primary text-[10px] font-black text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                  <Zap size={12} fill="white" />
                  OPTIMISÉ PAR IA
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="glass-morphism p-4 rounded-[24px] border border-white/5 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-4">
                 <ToolIcon icon={<Scissors size={14} />} label="" variant="ghost" />
                 <ToolIcon icon={<Trash2 size={14} />} label="" variant="ghost" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatTime(duration)}</span>
            </div>

            <div className="relative h-20 bg-slate-900/50 rounded-xl overflow-hidden border border-white/5 cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              setTime(percent * duration);
            }}>
              {/* Waveform Visualization */}
              <div className="absolute inset-0 flex items-center gap-0.5 px-1 pb-4">
                {Array.from({ length: 120 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex-1 rounded-full transition-all",
                      (i / 120) * duration < currentTime ? "bg-brand-primary" : "bg-slate-700"
                    )}
                    style={{ height: `${Math.random() * 40 + 20}%` }}
                  />
                ))}
              </div>

              {/* Subtitle segments in timeline */}
              {showResult && subtitles.map(s => (
                <div 
                  key={s.id}
                  className="absolute bottom-0 h-4 bg-brand-primary/30 border-x border-brand-primary/50 flex items-center justify-center overflow-hidden"
                  style={{ 
                    left: `${(s.start / duration) * 100}%`, 
                    width: `${((s.end - s.start) / duration) * 100}%` 
                  }}
                >
                  <span className="text-[6px] font-bold text-white uppercase whitespace-nowrap px-1 opacity-50">{s.text}</span>
                </div>
              ))}

              {/* Playhead */}
              <div 
                className="absolute top-0 w-0.5 h-full bg-white shadow-[0_0_10px_white] z-20 pointer-events-none"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-brand-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Configuration Tabs */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="flex gap-1 p-1 bg-slate-900 border border-white/5 rounded-2xl">
            <button 
              onClick={() => setActiveTab("ai")}
              className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
              activeTab === "ai" ? "bg-brand-primary text-white" : "text-slate-500 hover:text-slate-300")}
            >
              <Sparkles size={14} /> IA
            </button>
            <button 
              onClick={() => setActiveTab("style")}
              className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
              activeTab === "style" ? "bg-brand-primary text-white" : "text-slate-500 hover:text-slate-300")}
            >
              <Palette size={14} /> Style
            </button>
            <button 
              onClick={() => setActiveTab("edit")}
              className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
              activeTab === "edit" ? "bg-brand-primary text-white" : "text-slate-500 hover:text-slate-300")}
            >
              <Settings2 size={14} /> Édit
            </button>
            <button 
              onClick={() => setActiveTab("gen")}
              className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
              activeTab === "gen" ? "bg-brand-primary text-white" : "text-slate-500 hover:text-slate-300")}
            >
              <Sparkles size={14} /> Génération
            </button>
          </div>

          <div className="flex-1 glass-morphism rounded-[32px] p-6 border border-white/5 overflow-y-auto">
            {activeTab === "gen" && (
              <div className="space-y-6">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Vidéo Génération</h3>
                 <div className="space-y-4">
                    <textarea 
                      placeholder="Prompt pour la vidéo..."
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-white text-sm"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <input type="file" accept="image/*" onChange={(e) => setInputImage(e.target.files?.[0] || null)} />
                    <button 
                      onClick={async () => {
                         const formData = new FormData();
                         formData.append("prompt", prompt);
                         if (inputImage) formData.append("image", inputImage);
                         const res = await fetch("/api/video/generate", {
                             method: "POST",
                             headers: { Authorization: `Bearer ${token}` },
                             body: formData
                         });
                         const data = await res.json();
                         alert(data.message);
                      }}
                      className="w-full p-4 bg-brand-primary text-white font-black rounded-2xl hover:brightness-110"
                    >
                      Générer la vidéo
                    </button>
                 </div>
              </div>
            )}
            {activeTab === "ai" && (
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Automatisation</h3>
                <div className="space-y-3">
                   <OptionToggle 
                      active={true} 
                      icon={<Type size={18} />} 
                      label="Captions IA" 
                      description="Sous-titres dynamiques optimisés" 
                   />
                   <OptionToggle 
                      active={true} 
                      icon={<Smartphone size={18} />} 
                      label="Smart Crop" 
                      description="Focus visage (Portrait 9:16)" 
                   />
                   <OptionToggle 
                      active={false} 
                      icon={<Zap size={18} />} 
                      label="Auto-Highlight" 
                      description="Détection des meilleurs moments" 
                   />
                </div>

                {isProcessing && (
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    {steps.map(step => (
                      <div key={step.id} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             {step.status === "completed" ? <CheckCircle2 size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border border-white/10" />}
                             <span className={cn("text-xs font-medium", step.status === "pending" ? "text-slate-600" : "text-white")}>{step.label}</span>
                         </div>
                         {step.status === "processing" && <Loader2 size={14} className="animate-spin text-brand-primary" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "style" && (
              <div className="space-y-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Styles Sous-titres</h3>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Couleur de texte</label>
                  <div className="flex flex-wrap gap-2">
                    {["#ffffff", "#facc15", "#ef4444", "#3b82f6", "#22c55e"].map(color => (
                      <button 
                        key={color}
                        onClick={() => setSubtitleColor(color)}
                        className={cn("w-10 h-10 rounded-xl border-2 transition-transform hover:scale-110", subtitleColor === color ? "border-white" : "border-transparent")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Taille de police: {subtitleSize}px</label>
                  <input 
                    type="range" 
                    min="16" max="64" 
                    value={subtitleSize} 
                    onChange={(e) => setSubtitleSize(parseInt(e.target.value))}
                    className="w-full accent-brand-primary" 
                  />
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Presets Influencer</label>
                    <div className="grid grid-cols-2 gap-2">
                       <PresetBtn label="Hormozi" bg="#ef4444" />
                       <PresetBtn label="MrBeast" bg="#3b82f6" />
                       <PresetBtn label="Minimal" bg="#ffffff" />
                       <PresetBtn label="Impact" bg="#facc15" />
                    </div>
                </div>
              </div>
            )}

            {activeTab === "edit" && (
               <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Édition Manuelle</h3>
                  <div className="space-y-4">
                    {subtitles.map(s => (
                      <div key={s.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2 hover:border-brand-primary/30 transition-all group">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-brand-primary uppercase">{formatTime(s.start)} - {formatTime(s.end)}</span>
                          <button 
                            onClick={() => setSubtitles(prev => prev.filter(sub => sub.id !== s.id))}
                            className="text-slate-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input 
                          value={s.text}
                          onChange={(e) => {
                            setSubtitles(prev => prev.map(sub => sub.id === s.id ? { ...sub, text: e.target.value } : sub));
                          }}
                          className="w-full bg-transparent text-sm font-bold outline-none border-b border-transparent focus:border-brand-primary/30"
                        />
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                        const newId = (subtitles.length + 1).toString();
                        setSubtitles([...subtitles, { id: newId, start: currentTime, end: currentTime + 2, text: "Nouveau sous-titre" }]);
                    }}
                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-xs font-bold text-slate-500 hover:border-brand-primary/30 hover:text-slate-300 transition-all">
                    + Ajouter un segment
                  </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolIcon({ icon, label, active = false, variant = "default" }: { icon: React.ReactNode, label: string, active?: boolean, variant?: "default" | "ghost" }) {
  return (
    <div className="group relative flex flex-col items-center">
      <button className={cn(
        "p-4 rounded-2xl transition-all border",
        variant === "ghost" ? "border-transparent text-slate-500 hover:text-white" :
        active ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20" : 
        "bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-white"
      )}>
        {icon}
      </button>
      {label && <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[8px] font-bold text-white uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
        {label}
      </span>}
    </div>
  );
}

function PresetBtn({ label, bg }: { label: string, bg: string }) {
  return (
    <button className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-left">
      <span className="text-[10px] font-black uppercase block mb-1 opacity-50">Style</span>
      <span className="text-xs font-bold" style={{ color: bg }}>{label}</span>
    </button>
  );
}

function OptionToggle({ active, icon, label, description }: { active: boolean, icon: React.ReactNode, label: string, description: string }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all flex items-start gap-4",
      active ? "bg-white/5 border-white/10 border-brand-primary/30 shadow-lg" : "bg-transparent border-transparent opacity-60"
    )}>
      <div className={cn(
        "p-2 rounded-xl",
        active ? "bg-brand-primary/20 text-brand-primary" : "bg-white/5 text-slate-500"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-black text-white leading-tight uppercase tracking-tighter">{label}</p>
        <p className="text-[10px] text-slate-500 mt-1">{description}</p>
      </div>
      <div suppressHydrationWarning className={cn(
        "w-8 h-4 rounded-full relative transition-colors",
        active ? "bg-brand-primary" : "bg-slate-800"
      )}>
        <div className={cn(
          "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
          active ? "left-[18px]" : "left-0.5"
        )} />
      </div>
    </div>
  );
}
