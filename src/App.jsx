import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, ShieldCheck, Calculator, Leaf, DollarSign, 
  BarChart3, Sun, FileText, Sparkles, Loader2, AlertCircle, 
  MessageSquare, Zap, Shield, Clock, Briefcase, ChevronRight,
  Eye, EyeOff, Compass
} from 'lucide-react';

const App = () => {
  // --- CONFIGURAZIONE GEMINI API ---
  // Inserisci qui la tua chiave API (AIzaSy...)
  const apiKey = "AIzaSyBhaSB7be2AZmzk-EjjzRaH4VDUZd5V3So"; 
  
  // Usiamo il modello standard 1.5-flash
  const MODEL_NAME = "gemini-1.5-flash";

  // --- PARAMETRI BUSINESS REAIR 2026 ---
  const TAX_DEDUCTION = 0.50;           
  const MQ_PER_KW = 6.5; 

  const PRODUCTS = {
    rm20: {
      id: 'rm20',
      name: 'Clean Coating RM 20',
      listPrice: 399,
      yield_mq_l: 40,
      scontoAcquisto: 0.30,
      durability: '96+ mesi',
      focus: 'Protezione Totale'
    },
    pa_plus: {
      id: 'pa_plus',
      name: 'PhotoActive Plus',
      listPrice: 195,
      yield_mq_l: 60,
      scontoAcquisto: 0.25, 
      durability: '48+ mesi',
      focus: 'ESG & Autopulizia'
    }
  };

  const [kwp, setKwp] = useState(300);
  const [selectedProductId, setSelectedProductId] = useState('rm20');
  const [bonusFirma, setBonusFirma] = useState(true);
  const [vincolo96Mesi, setVincolo96Mesi] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const calculations = useMemo(() => {
    const product = PRODUCTS[selectedProductId];
    const mqTotali = kwp * MQ_PER_KW;
    const litri = Math.ceil(mqTotali / product.yield_mq_l);
    const costoProdottoNetto = litri * (product.listPrice * (1 - product.scontoAcquisto));
    const costoPosa = (litri * 6) * 40;
    const costiVivi = costoProdottoNetto + costoPosa;
    const prezzoScontatoCliente = costiVivi / 0.53;
    const scontoFirmaPerc = bonusFirma ? 0.05 : 0;
    const scontoVincoloPerc = vincolo96Mesi ? 0.02 : 0;
    const prezzoSenzaSconti = prezzoScontatoCliente / (1 - (scontoFirmaPerc + scontoVincoloPerc));
    const utileTotale = prezzoScontatoCliente - costiVivi - (prezzoScontatoCliente * 0.07);

    return {
      product,
      prezzoScontatoCliente,
      prezzoSenzaSconti,
      utileTotale,
      utileSocio: utileTotale / 2,
      costoNettoCliente: prezzoScontatoCliente * 0.50,
      kgNox: (kwp * 0.388).toFixed(1),
      alberi: Math.round(kwp * 0.388 * 2.4)
    };
  }, [kwp, selectedProductId, bonusFirma, vincolo96Mesi]);

  const generateAI = async (type) => {
    if (!apiKey || apiKey.length < 10) {
      setAiContent("ERRORE: Incolla la chiave API alla riga 12 del codice su GitHub.");
      return;
    }
    setIsAiLoading(true);
    setAiContent("");
    
    const prompt = type === 'pitch' 
      ? `Genera un pitch di vendita di 2 righe in italiano per un impianto da ${kwp}kWp. Prezzo finale: €${calculations.costoNettoCliente.toLocaleString()}. Usa un tono da chiusura immediata.`
      : `Scrivi un breve testo ESG per: ${calculations.kgNox}kg NOx abbattuti e ${calculations.alberi} alberi equivalenti grazie a ReAir.`;

    try {
      // ENDPOINT V1 (STABILE) - Nessuna beta, nessuna incertezza.
      const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${apiKey.trim()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Errore Server");
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiContent(text || "L'AI non ha risposto. Riprova.");
    } catch (e) {
      setAiContent(`ERRORE TECNICO: ${e.message}. Assicurati di aver salvato la Versione 5 su GitHub.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-all ${isClientMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* BOLLINO DI VERIFICA V5 */}
      <div className="bg-red-600 text-white text-[10px] font-black text-center py-1 uppercase tracking-widest">
        Versione 5.0 - Sistema Stabile v1
      </div>

      <nav className={`sticky top-0 z-30 border-b px-4 py-3 flex justify-between items-center ${isClientMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2">
          <Sun className="text-blue-600 w-5 h-5" />
          <h1 className="text-sm font-black uppercase tracking-tighter">ReAir <span className="text-blue-600">Field</span></h1>
        </div>
        <button onClick={() => setIsClientMode(!isClientMode)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase">
          {isClientMode ? 'VISTA PARTNER' : 'VISTA CLIENTE'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* CONFIGURATORE */}
        <section className={`p-6 rounded-3xl border ${isClientMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-6 opacity-40 uppercase text-[10px] font-black">
            <Calculator className="w-4 h-4" /> Configurazione Rapida
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">Potenza Impianto (kWp)</label>
              <input type="number" value={kwp} onChange={(e) => setKwp(Number(e.target.value))} className="w-full bg-transparent border-b-2 border-blue-600 py-2 text-3xl font-black outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(PRODUCTS).map(p => (
                <button key={p.id} onClick={() => setSelectedProductId(p.id)} className={`p-3 rounded-2xl border-2 text-left transition-all ${selectedProductId === p.id ? 'border-blue-600 bg-blue-600/10' : 'border-transparent bg-slate-100/50'}`}>
                  <span className="font-black text-[11px] block">{p.name}</span>
                  <span className="text-[9px] opacity-60 uppercase font-bold">{p.durability}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* AI PANEL */}
        <section className={`p-6 rounded-3xl border-2 ${isClientMode ? 'bg-slate-900 border-blue-900' : 'bg-white border-blue-50'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Strategy</span>
            <div className="flex gap-2">
              <button onClick={() => generateAI('pitch')} disabled={isAiLoading} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase flex items-center gap-2">
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Pitch'}
              </button>
              <button onClick={() => generateAI('esg')} disabled={isAiLoading} className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase flex items-center gap-2">
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ESG'}
              </button>
            </div>
          </div>
          {aiContent && <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20"><p className="text-sm italic font-medium leading-relaxed">"{aiContent}"</p></div>}
        </section>

        {/* PROPOSTA ECONOMICA */}
        <div className={`rounded-[40px] overflow-hidden border shadow-2xl ${isClientMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
            <div><h2 className="text-2xl font-black tracking-tighter uppercase">Offerta ReAir</h2><p className="text-[10px] opacity-60 font-bold tracking-widest uppercase">Efficientamento Nanotecnologico</p></div>
            <div className="font-mono font-bold opacity-30">RE-{kwp}</div>
          </div>
          
          <div className="p-8 space-y-8 text-slate-900">
            <div className="space-y-4">
              <div className={`p-6 rounded-3xl border-2 text-center ${isClientMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-[10px] font-black opacity-30 uppercase block mb-1">Valore della Commessa</span>
                <span className="text-lg line-through opacity-20">€ {calculations.prezzoSenzaSconti.toLocaleString()}</span>
                <span className={`text-4xl font-black block ${isClientMode ? 'text-white' : 'text-slate-900'}`}>€ {calculations.prezzoScontatoCliente.toLocaleString()}</span>
              </div>

              <div className="p-8 bg-green-600 rounded-[32px] text-white text-center shadow-xl">
                <span className="text-[10px] font-black opacity-60 uppercase block mb-1">Investimento Netto d'Impresa</span>
                <span className="text-5xl font-black tracking-tighter text-white">€ {calculations.costoNettoCliente.toLocaleString()}</span>
                <p className="text-[10px] mt-2 font-bold opacity-80 uppercase tracking-widest">Post-Detrazione Fiscale 50%</p>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border ${isClientMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase opacity-40">Tempo di Rientro (ROI)</span>
                <span className="text-blue-500 font-black text-xs uppercase">Break-Even: 16 Mesi</span>
              </div>
              <div className="h-24 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                  <path d="M 0 190 L 200 150 L 400 110" fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="200" cy="150" r="10" fill="#3b82f6" className="animate-pulse" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                <Leaf className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <span className="text-2xl font-black block">{calculations.alberi}</span>
                <span className="text-[9px] opacity-40 uppercase font-black">Alberi Equiv.</span>
              </div>
              <div className="text-center p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <span className="text-2xl font-black block">+15%</span>
                <span className="text-[9px] opacity-40 uppercase font-black">Resa Energia</span>
              </div>
            </div>
          </div>
        </div>

        {/* MARGINI PARTNER - SOLO VISTA PARTNER */}
        {!isClientMode && (
          <section className="bg-slate-900 text-white p-8 rounded-[40px] border border-white/5 shadow-2xl">
            <h2 className="text-[10px] font-black uppercase opacity-50 mb-6 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Analisi Margini Partner</h2>
            <div className="text-4xl font-black text-green-400 mb-8 tracking-tighter">€ {calculations.utileTotale.toLocaleString()} <span className="text-xs opacity-50 font-bold ml-2">UTILE NETTO</span></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5"><span className="text-[9px] opacity-40 block uppercase mb-1">Socio A</span><span className="text-lg font-black text-white">€ {calculations.utileSocio.toLocaleString()}</span></div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5"><span className="text-[9px] opacity-40 block uppercase mb-1">Socio B</span><span className="text-lg font-black text-white">€ {calculations.utileSocio.toLocaleString()}</span></div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between text-[10px] font-black opacity-40 uppercase tracking-widest">
              <span>Provvigione Agente (7%)</span>
              <span className="text-blue-400">Garantita</span>
            </div>
          </section>
        )}
      </main>

      <footer className="text-center py-10 text-[9px] font-black tracking-[0.4em] opacity-20 uppercase">
        ReAir S.R.L. | Milano 2026 | Sistema Certificato
      </footer>
    </div>
  );
};

export default App;
