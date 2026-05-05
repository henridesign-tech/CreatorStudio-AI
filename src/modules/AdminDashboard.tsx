import React, { useEffect, useState } from "react";
import { Users, CreditCard, TrendingUp, ShieldCheck, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token]);

  if (loading) return <div>Chargement de l'administration...</div>;
  if (!stats) return <div>Accès refusé.</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Founder Dashboard</h2>
          <p className="text-slate-400">Suivi des KPIs et de l'activité globale du SaaS.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-morphism p-6 rounded-3xl space-y-2">
          <Users className="text-blue-500" />
          <p className="text-sm text-slate-500 font-medium">Utilisateurs Totaux</p>
          <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
        </div>
        <div className="glass-morphism p-6 rounded-3xl space-y-2">
          <Star className="text-yellow-500" />
          <p className="text-sm text-slate-500 font-medium">Abonnés Premium</p>
          <h3 className="text-3xl font-bold text-brand-primary">{stats.premiumUsers}</h3>
        </div>
        <div className="glass-morphism p-6 rounded-3xl space-y-2">
          <CreditCard className="text-emerald-500" />
          <p className="text-sm text-slate-500 font-medium">Revenus (MRR)</p>
          <h3 className="text-3xl font-bold text-emerald-400">{stats.revenue}€</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-morphism rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-2">
            <Activity className="text-slate-400" size={18} />
            <h3 className="font-bold">Activité Récente</h3>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] uppercase text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats.recentActivity.map((act: any, i: number) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-6 py-4">{act.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-white/5 text-xs font-medium">
                        {act.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(act.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-morphism p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
            <TrendingUp size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold">Croissance de 24%</h4>
            <p className="text-slate-400 text-sm">Votre base d'utilisateurs progresse sainement. Continuez à itérer sur les fonctionnalités premium.</p>
          </div>
          <button className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm">
            Exporter le rapport complet
          </button>
        </div>
      </div>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
