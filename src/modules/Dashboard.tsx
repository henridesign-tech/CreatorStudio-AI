import React from "react";
import { Zap, Palette, Video, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const stats = [
  { label: "Projets Actifs", value: "12", trend: "+2 ce mois", color: "text-blue-400" },
  { label: "Crédits IA", value: "245", trend: "/ 500", color: "text-purple-400" },
  { label: "Vues Générées", value: "12.4k", trend: "+15%", color: "text-emerald-400" },
  { label: "Contrats", value: "3", trend: "En cours", color: "text-orange-400" },
];

const quickActions = [
  { icon: Zap, label: "Script Viral", path: "/viral", color: "bg-blue-500/10 text-blue-400" },
  { icon: Palette, label: "Design Thumbnail", path: "/design", color: "bg-purple-500/10 text-purple-400" },
  { icon: Video, label: "Editer Vidéo", path: "/video", color: "bg-emerald-500/10 text-emerald-400" },
  { icon: BarChart3, label: "Analyser Chaîne", path: "/channel", color: "bg-orange-500/10 text-orange-400" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Bienvenue, Créateur</h2>
        <p className="text-slate-400 mt-2">Voici un aperçu de vos activités récentes et des outils recommandés.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="glass-morphism p-6 rounded-2xl"
          >
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
              <span className="text-xs text-slate-400">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <h3 className="text-xl font-bold mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={action.label} to={action.path}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-morphism p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-brand-primary/50 transition-all"
              >
                <div className={`p-4 rounded-xl ${action.color}`}>
                  <action.icon size={28} />
                </div>
                <span className="font-semibold">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Projects & AI Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-morphism rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold">Projets Récents</h3>
            <button className="text-sm text-brand-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((p) => (
                <div key={p} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">Thumbnail pour YouTube #{p}</h4>
                    <p className="text-xs text-slate-500">Modifié il y a 2 heures</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">Design</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-2xl p-6 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border-brand-primary/20">
          <h3 className="font-bold mb-4">Conseil IA du jour</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Utilisez notre module "Analyse de Miniature" pour comparer votre visuel avec les tendances actuelles de votre niche. Un score de contraste supérieur à 80% augmente souvent le CTR de 15%.
          </p>
          <Link to="/analyze" className="mt-6 block w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all text-center">
            Essayer l'Analyseur
          </Link>
        </div>
      </div>
    </div>
  );
}
