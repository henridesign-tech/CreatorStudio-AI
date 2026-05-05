import React, { useState } from "react";
import { Briefcase, FileText, Download, Send, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function ClientBusiness() {
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("Design Miniature");
  const [services, setServices] = useState([{ description: "", price: "" }]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addService = () => setServices([...services, { description: "", price: "" }]);
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index));
  
  const updateService = (index: number, field: string, value: string) => {
    const newServices = [...services];
    (newServices[index] as any)[field] = value;
    setServices(newServices);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Header
      page.drawText("DEVIS PROFESSIONNEL", { x: 50, y: height - 60, size: 24, font: boldFont, color: rgb(0.05, 0.65, 0.94) });
      page.drawText(`Client: ${clientName}`, { x: 50, y: height - 100, size: 14, font });
      page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: height - 120, size: 12, font });

      page.drawText("Services:", { x: 50, y: height - 170, size: 16, font: boldFont });
      
      let currentY = height - 200;
      let total = 0;

      services.forEach((service, index) => {
        page.drawText(`${index + 1}. ${service.description}`, { x: 50, y: currentY, size: 12, font });
        page.drawText(`${service.price} €`, { x: 500, y: currentY, size: 12, font, color: rgb(0.1, 0.1, 0.1) });
        currentY -= 25;
        total += parseFloat(service.price || "0");
      });

      page.drawLine({
        start: { x: 50, y: currentY - 10 },
        end: { x: 550, y: currentY - 10 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });

      page.drawText(`TOTAL: ${total} €`, { x: 450, y: currentY - 40, size: 18, font: boldFont, color: rgb(0.05, 0.65, 0.94) });

      page.drawText("Conditions de paiement: 50% à la commande, 50% à la livraison.", { x: 50, y: 100, size: 10, font });
      page.drawText("Généré par Creator Studio AI", { x: 50, y: 80, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Devis_${clientName.replace(/\s+/g, "_")}.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
          <Briefcase size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Client & Business</h2>
          <p className="text-slate-400">Gérez vos contrats, devis et briefs clients en un clic.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-morphism p-8 rounded-3xl space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-brand-primary" size={20} />
              Nouveau Devis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Nom du Client</label>
                <input 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="ex: Jean Dupont / Entreprise X"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Type de Projet</label>
                <select 
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-all text-sm appearance-none"
                >
                  <option>Design Miniature</option>
                  <option>Montage Vidéo</option>
                  <option>Stratégie Sociale</option>
                  <option>Gestion de Chaîne</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-slate-500">Prestations</label>
                <button 
                  onClick={addService}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Ajouter
                </button>
              </div>
              {services.map((service, index) => (
                <div key={index} className="flex gap-4">
                  <input 
                    value={service.description}
                    onChange={(e) => updateService(index, "description", e.target.value)}
                    placeholder="Description du service"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-all text-sm"
                  />
                  <input 
                    value={service.price}
                    onChange={(e) => updateService(index, "price", e.target.value)}
                    placeholder="Priz (€)"
                    className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-all text-sm text-right"
                  />
                  <button 
                    onClick={() => removeService(index)}
                    className="p-3 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={generatePDF}
            disabled={isGenerating || !clientName}
            className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-primary/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Génération...
              </>
            ) : (
              <>
                <Download size={20} />
                Générer & Télécharger le PDF
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass-morphism rounded-3xl p-6 space-y-4">
            <h4 className="font-bold">Brief Client IA</h4>
            <p className="text-xs text-slate-400">Besoin d'aide pour structurer votre proposition ?</p>
            <button className="w-full py-3 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 rounded-xl text-sm font-bold transition-all">
              Générer Brief Auto
            </button>
          </div>

          <div className="glass-morphism rounded-3xl p-6 space-y-4 border-emerald-500/10">
            <h4 className="font-bold">Recent Invoices</h4>
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs hover:bg-white/10 transition-colors cursor-pointer">
                  <span>INV-2024-00{i}</span>
                  <span className="font-bold text-brand-primary">Payé</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
