import React, { useState, useEffect } from "react";
import { Mic2, Play, Download, Settings2, Trash2, Volume2, Music, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { generateContent as generateAIContent } from "@/src/services/geminiService";

const emotions = [
  { id: "neutral", label: "Neutre", pitch: 1, rate: 1, color: "bg-slate-500" },
  { id: "joy", label: "Joie", pitch: 1.4, rate: 1.2, color: "bg-yellow-400" },
  { id: "sadness", label: "Tristesse", pitch: 0.6, rate: 0.8, color: "bg-blue-400" },
  { id: "anger", label: "Colère", pitch: 0.5, rate: 1.3, color: "bg-red-500" },
  { id: "fear", label: "Peur", pitch: 1.2, rate: 1.5, color: "bg-purple-500" },
  { id: "calm", label: "Calme", pitch: 0.9, rate: 0.9, color: "bg-emerald-400" },
];

export default function VoiceAI() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState("neutral");
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      // Try to find a French voice by default
      if (!voice && availableVoices.length > 0) {
        const frVoice = availableVoices.find(v => v.lang.startsWith("fr"));
        setVoice(frVoice || availableVoices[0]);
      }
    };
    updateVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }
  }, [voice]);

  const handleEmotionSelect = (emotionId: string) => {
    const emotion = emotions.find(e => e.id === emotionId);
    if (emotion) {
      setSelectedEmotion(emotionId);
      setPitch(emotion.pitch);
      setRate(emotion.rate);
    }
  };

  const optimizeWithAI = async () => {
    if (!text) return;
    setIsOptimizing(true);
    try {
      const emotion = emotions.find(e => e.id === selectedEmotion);
      const prompt = `Agis en tant qu'expert en narration vocale. Réécris légèrement le texte suivant pour qu'il exprime intensément l'émotion "${emotion?.label}". 
      Ajoute de la ponctuation expressive (points d'exclamation, suspensions) et des petits marqueurs sonores textuels si nécessaire pour guider l'IA de synthèse vocale.
      Reste fidèle au sens original. 
      Texte original : "${text}"`;

      const optimizedText = await generateAIContent(prompt);
      if (optimizedText) setText(optimizedText);
    } catch (error) {
      console.error("Failed to optimize text:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const speak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!text) return;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.pitch = pitch;
    utterance.rate = rate;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onstart = () => setIsSpeaking(true);
    
    setIsSpeaking(true);
    synth.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-500">
          <Mic2 size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Voix AI</h2>
          <p className="text-slate-400">Transformez vos textes en narration professionnelle avec émotions.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-morphism p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-widest">Script Audio</label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={optimizeWithAI}
                  disabled={isOptimizing || !text}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-500 text-xs font-bold hover:bg-pink-500/20 disabled:opacity-50 transition-all"
                >
                  {isOptimizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Optimiser avec IA
                </button>
                <button 
                  onClick={() => setText("")}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Saisissez le texte à convertir en voix..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-pink-500/50 transition-all h-64 resize-none text-lg leading-relaxed"
            />
            
            <button 
              onClick={speak}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl ${
                isSpeaking 
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                  : "bg-pink-500 hover:bg-pink-600 shadow-pink-500/20"
              }`}
            >
              <Play size={20} fill="currentColor" />
              {isSpeaking ? "Arrêter l'Aperçu" : "Écouter l'Aperçu"}
            </button>
          </div>

          <div className="glass-morphism p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Émotion de la Voix</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => handleEmotionSelect(emotion.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                    selectedEmotion === emotion.id 
                      ? "bg-white/10 border-white/20 scale-105" 
                      : "bg-white/5 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${emotion.color}`} />
                  <span className="text-[10px] font-bold uppercase">{emotion.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-morphism p-6 rounded-3xl space-y-8">
            <h3 className="font-bold flex items-center gap-2">
              <Settings2 size={18} className="text-pink-500" />
              Paramètres Vocal
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Voix</label>
                <select 
                  value={voice?.name || ""}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none appearance-none"
                  onChange={(e) => setVoice(voices.find(v => v.name === e.target.value) || null)}
                >
                  {voices.map(v => (
                    <option key={v.name} value={v.name} className="bg-slate-900">
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Vitesse (Rate)</span>
                  <span>{rate.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2" step="0.1" value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Hauteur (Pitch)</span>
                  <span>{pitch.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="0" max="2" step="0.1" value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                <Music size={16} /> Ajouter une Musique
              </button>
              <button disabled className="w-full py-3 bg-white text-slate-900 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all opacity-50 cursor-not-allowed">
                <Download size={16} /> Export MP3 (Premium)
              </button>
            </div>
          </div>

          <div className="glass-morphism p-6 rounded-3xl bg-gradient-to-br from-pink-500/10 to-indigo-500/10 border-pink-500/20">
            <h4 className="font-bold flex items-center gap-2 text-sm mb-2">
              <Volume2 size={16} /> Mode Émotionnel
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-bold tracking-tighter">Mise à jour : Support multi-émotions</p>
            <p className="text-xs text-slate-300 mt-2">
              Notre moteur peut désormais ajuster dynamiquement la vitesse et la tonalité pour simuler des états émotionnels complexes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
