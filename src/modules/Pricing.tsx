import React, { useState } from "react";
import { Check, Loader2, Sparkles, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";

const plans = [
  {
    name: "Free",
    price: "0",
    features: ["Idées virales limitées", "Audit de chaîne basique", "Exports avec filigrane"],
    color: "bg-slate-500/10",
    text: "text-slate-400",
  },
  {
    name: "Premium",
    price: "19",
    features: ["Tout en illimité", "Analyse design poussée", "Générateur de PDF pro", "Support prioritaire", "Nouveautés en avance"],
    color: "bg-brand-primary/10",
    text: "text-brand-primary",
    popular: true,
  },
];

export default function Pricing() {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        alert("Félicitations ! Vous êtes maintenant Premium.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyPromo = async () => {
    setPromoError("");
    setPromoSuccess("");
    try {
      const res = await fetch("/api/subscription/promo", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setPromoSuccess("Code promo appliqué avec succès !");
        setPromoCode("");
      } else {
        setPromoError(data.error);
      }
    } catch (err) {
      setPromoError("Une erreur est survenue.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">Passez au niveau supérieur</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Débloquez toute la puissance de l'IA pour vos contenus et accélérez votre croissance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`glass-morphism rounded-3xl p-8 relative overflow-hidden flex flex-col ${plan.popular ? "border-brand-primary/50 shadow-2xl shadow-brand-primary/10" : ""}`}
          >
            {plan.popular && (
              <div className="absolute top-4 right-4 bg-brand-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                Plus populaire
              </div>
            )}
            
            <div className={`w-12 h-12 ${plan.color} rounded-xl flex items-center justify-center mb-6`}>
              {plan.name === "Free" ? <Star className="text-slate-400" /> : <Sparkles className="text-brand-primary" />}
            </div>

            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold">{plan.price}€</span>
              <span className="text-slate-500">/mois</span>
            </div>

            <ul className="space-y-4 flex-1 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-emerald-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={plan.name === "Premium" ? handleSubscribe : undefined}
              disabled={loading || (plan.name === "Free" && user?.plan === "free") || (plan.name === "Premium" && user?.plan !== "free")}
              className={`w-full py-4 rounded-2xl font-bold transition-all ${
                plan.name === "Premium" 
                  ? "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg" 
                  : "bg-white/5 text-slate-500 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : (user?.plan === plan.name.toLowerCase() ? "Plan Actuel" : "Sélectionner")}
            </button>
          </div>
        ))}
      </div>

      <div className="glass-morphism p-8 rounded-3xl max-w-xl mx-auto space-y-6">
        <h4 className="font-bold flex items-center gap-2">
          <Star className="text-yellow-400" size={20} />
          Vous avez un code promotionnel ?
        </h4>
        <div className="flex gap-4">
          <input 
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Entrez votre code (ex: FOUNDER2026)"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-all text-sm"
          />
          <button 
            onClick={applyPromo}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all"
          >
            Appliquer
          </button>
        </div>
        {promoError && <p className="text-xs text-red-500">{promoError}</p>}
        {promoSuccess && <p className="text-xs text-emerald-500">{promoSuccess}</p>}
      </div>
    </div>
  );
}
