import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, ShieldCheck, Calculator, Leaf, DollarSign, 
  BarChart3, Sun, FileText, Sparkles, Loader2, AlertCircle, 
  MessageSquareQuote, Zap, Shield, Clock, Briefcase, ChevronRight,
  Eye, EyeOff, Compass
} from 'lucide-react';

const App = () => {
  // --- CONFIGURAZIONE GEMINI API ---
  const apiKey = ""; 
  const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

  // --- PARAMETRI BUSINESS REAIR ---
  const MARGINE_SOCI_TARGET = 0.40;     
  const PROVVIGIONE_AGENTE_FISSA = 0.07; 
  const COSTO_ORARIO_POSA = 40;
  const ORE_LAVORO_PER_LITRO = 6;
  const TAX_DEDUCTION = 0.50;           
  const MQ_PER_KW = 6.5; // Stima mq per kWp

  const PRODUCTS = {
    rm20: {
      id: 'rm20',
      name: 'Clean Coating RM 20',
      listPrice: 399,
      yield_mq_l: 40,
      scontoAcquisto: 0.30,
      durability: '96+ mesi (8 anni)',
      focus: 'Protezione Covalente'
    },
    pa_plus: {
      id: 'pa_plus',
      name: 'PhotoActive Plus',
      listPrice: 195,
      yield_mq_l: 60,
      scontoAcquisto: 0.25, 
      durability: '48+ mesi (4 anni)',
      focus: 'ESG & Autopulizia'
    }
  };

  // --- STATO ---
  const [kwp, setKwp] = useState(300);
  const [selectedProductId, setSelectedProductId] = useState('rm20');
  const [bonusFirma, setBonusFirma] = useState(true);
  const [vincolo96Mesi, setVincolo96Mesi] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  
  const [aiContent, setAiContent] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- LOGICA CALCOLO MARGINI E PREZZI ---
  const calculations = useMemo(() => {
    const product = PRODUCTS[selectedProductId];
    const mqTotali = kwp * MQ_PER_KW;
    const litri = Math.ceil(mqTotali / product.yield_mq_l);
    
    // Costi Diretti
    const costoProdottoNetto = litri * (product.listPrice * (1 - product.scontoAcquisto));
    const orePosa = litri * ORE_LAVORO_PER_LITRO;
    const costoPosa = orePosa * COSTO_ORARIO_POSA;
    const costiVivi = costoProdottoNetto + costoPosa;

    // Formula Prezzo per garantire 40% utile soci e 7% agente
    // PrezzoScontato = Costi / (1 - 0.40 - 0.07) = Costi / 0.53
    const prezzoScontatoCliente = costiVivi / 0.53;
    
    // Gestione Sconti per risalire al listino "pieno" da mostrare
    const scontoFirmaPerc = bonusFirma ? 0.05 : 0;
    const scontoVincoloPerc = vincolo96Mesi ? 0.02 : 0;
    const scontoTotalePerc = scontoFirmaPerc + scontoVincoloPerc;

    const prezzoSenzaSconti = prezzoScontatoCliente / (1 - scontoTotalePerc);
    const provvigioneAgenteValore = prezzoScontatoCliente * PROVVIGIONE_AGENTE_FISSA;
    const utileTotale = prezzoScontatoCliente - costiVivi - provvigioneAgenteValore;
    
    const detrazioneFiscale = prezzoScontatoCliente * TAX_DEDUCTION;
    const costoNettoCliente = prezzoScontatoCliente - detrazioneFiscale;

    return {
      product,
      litri,
      costoProdottoNetto,
      costoPosa,
      orePosa,
      prezzoScontatoCliente,
      prezzoSenzaSconti,
      provvigioneAgenteValore,
      utileTotale,
      utileSocio: utileTotale / 2,
      costoNettoCliente,
      detrazioneFiscale,
      scontoTotalePerc,
      kgNoxAbbattuti: (kwp * 0.388).toFixed(1),
      alberiEquivalenti: Math.round(kwp * 0.388 * 2.4)
    };
  }, [kwp, selectedProductId, bonusFirma, vincolo96Mesi]);

  // --- GENERAZIONE AI ---
  const generateAI = async (type) => {
    setIsAiLoading(true);
    const prompt = type === 'pitch' 
      ? `Progetto: ${kwp}kWp con ${calculations.product.name}. Prezzo finale: €${calculations.prezzoScontatoCliente.toLocaleString()}. Detrazione 50%. Focus: ${calculations.product.focus}. Sconto firma e vincolo inclusi.`
      : `Dati: ${calculations.kgNoxAbbattuti}kg NOx abbattuti, ${calculations.alberiEquivalenti} alberi equivalenti.`;
    
    const sys = type === 'pitch'
      ? "Sei un Sales Director di ReAir. Genera un pitch di vendita fulmineo (3 righe) molto persuasivo."
      : "Genera una dichiarazione ESG professionale per l'azienda cliente basata sull'abbattimento inquinanti.";

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: sys }] }
        })
      });
      const data = await response.json();
      setAiContent(data.candidates?.[0]?.content?.parts?.[0]?.text || "Nessuna risposta AI.");
    } catch (e) {
      setAiContent("Connessione API fallita.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${isClientMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* NAVBAR MOBILE-READY */}
      <nav className={`sticky top-0 z-30 border-b px-4 md:px-6 py-4 flex justify-between items-center ${isClientMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20"><Sun className="text-white w-5 h-5" /></div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-blue-600">ReAir <span className={isClientMode ? 'text-blue-400' : 'text-blue-600'}>Field</span></h1>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{isClientMode ? 'Presentazione' : 'Partner Dashboard'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${isClientMode ? 'bg-white/5 border-white/10 text-blue-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <Compass className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Strategy</span>
          </div>
          <button 
            onClick={() => setIsClientMode(!isClientMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-black text-[10px] md:text-xs transition-all active:scale-95 ${isClientMode ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-200 text-slate-600'}`}
          >
            {isClientMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {isClientMode ? 'VISTA CLIENTE' : 'VISTA PARTNER'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* CONFIGURAZIONE */}
        <div className={`lg:col-span-4 space-y-6 ${isClientMode ? 'order-2 lg:order-1' : ''}`}>
          <section className={`p-6 rounded-3xl border transition-all ${isClientMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h2 className="text-xs font-black mb-6 uppercase tracking-widest flex items-center gap-2 opacity-50">
              <Calculator className="w-4 h-4" /> Parametri Impianto
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black opacity-50 uppercase mb-2 tracking-tight">Potenza Impianto (kWp)</label>
                <input 
                  type="number" 
                  value={kwp} 
                  onChange={(e) => setKwp(Number(e.target.value))}
                  className={`w-full border-2 rounded-2xl py-4 px-5 font-black text-2xl outline-none transition-all ${isClientMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-600'}`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black opacity-50 uppercase mb-3">Soluzione Proposta</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(PRODUCTS).map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedProductId === p.id 
                        ? (isClientMode ? 'border-blue-500 bg-blue-500/10' : 'border-blue-600 bg-blue-50') 
                        : (isClientMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-white')}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-sm">{p.name}</span>
                        {p.id === 'rm20' ? <Shield className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
                      </div>
                      <p className="text-[10px] opacity-60 font-bold uppercase tracking-tight">Durata: {p.durability}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/20">
                <label className="block text-[10px] font-black opacity-50 uppercase mb-3">Incentivi alla Firma</label>
                <div className="space-y-2">
                  <button 
                    onClick={() => setBonusFirma(!bonusFirma)}
                    className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all font-bold text-[10px] ${bonusFirma ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-slate-700 opacity-40'}`}
                  >
                    <span>BONUS FIRMA IMMEDIATA</span>
                    <span className="bg-green-500 text-white px-2 py-0.5 rounded">-5%</span>
                  </button>
                  <button 
                    onClick={() => setVincolo96Mesi(!vincolo96Mesi)}
                    className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all font-bold text-[10px] ${vincolo96Mesi ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-slate-700 opacity-40'}`}
                  >
                    <span>VINCOLO FEDELTÀ 96 MESI</span>
                    <span className="bg-indigo-500 text-white px-2 py-0.5 rounded">-2%</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* VISTA PARTNER - RISERVATA */}
          {!isClientMode && (
            <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Briefcase className="w-24 h-24" /></div>
              <h2 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-6">Analisi Margini Soci (40% Garantito)</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[9px] font-bold opacity-40 uppercase">Utile Netto Totale</p>
                    <p className="text-3xl font-black text-green-400">€ {calculations.utileTotale.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold opacity-40 uppercase">Provv. Agente (7%)</p>
                    <p className="text-sm font-black text-blue-400">€ {calculations.provvigioneAgenteValore.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black opacity-40 block uppercase mb-1">Socio A (50%)</span>
                    <span className="text-lg font-black tracking-tight">€ {calculations.utileSocio.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black opacity-40 block uppercase mb-1">Socio B (50%)</span>
                    <span className="text-lg font-black tracking-tight">€ {calculations.utileSocio.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl text-[9px] font-bold text-center opacity-40 italic uppercase tracking-tighter">
                  Costi Operativi Totali: € {(calculations.costoProdottoNetto + calculations.costoPosa).toLocaleString()}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* PROPOSTA COMMERCIALE */}
        <div className={`lg:col-span-8 space-y-6 ${isClientMode ? 'order-1 lg:order-2' : ''}`}>
          
          {/* AI ASSISTANT */}
          <div className={`rounded-3xl border-2 transition-all ${isClientMode ? 'bg-slate-800 border-blue-500/30 shadow-blue-500/10 shadow-lg' : 'bg-white border-blue-100'}`}>
            <div className={`px-6 py-4 flex justify-between items-center border-b ${isClientMode ? 'border-slate-700' : 'border-blue-50'}`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className={`text-[10px] font-black uppercase tracking-tight ${isClientMode ? 'text-blue-400' : 'text-blue-900'}`}>Intelligenza Artificiale ReAir</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => generateAI('pitch')} disabled={isAiLoading} className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 uppercase">
                   {isAiLoading ? '...' : 'Sales Pitch'}
                </button>
                <button onClick={() => generateAI('esg')} disabled={isAiLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 uppercase">
                   ESG Report
                </button>
              </div>
            </div>
            <div className="p-6">
              {aiContent ? (
                <div className={`p-4 rounded-2xl flex gap-4 ${isClientMode ? 'bg-slate-900/50' : 'bg-blue-50'}`}>
                  <MessageSquareQuote className="w-6 h-6 text-blue-500 shrink-0" />
                  <p className={`text-sm italic font-medium leading-relaxed ${isClientMode ? 'text-blue-100' : 'text-slate-700'}`}>"{aiContent}"</p>
                </div>
              ) : (
                <p className="text-center text-[10px] opacity-40 font-black uppercase tracking-widest italic py-4">Scegli una funzione AI per potenziare la trattativa.</p>
              )}
            </div>
          </div>

          {/* VISTA PROPOSTA */}
          <div className={`rounded-[40px] shadow-2xl overflow-hidden border transition-all ${isClientMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-slate-200'}`}>
            <div className={`p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-blue-600 text-white`}>
              <div className="flex items-center gap-4 text-white">
                <div className="bg-white/20 p-3 rounded-2xl"><ShieldCheck className="w-8 h-8" /></div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-black tracking-tighter leading-tight text-white">Proposta Tecnologica</h2>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-white/80">Efficientamento Fotovoltaico Certificato</p>
                </div>
              </div>
              <div className="bg-white/10 px-6 py-2 rounded-2xl border border-white/20 text-center backdrop-blur-md">
                <span className="text-[10px] font-black opacity-60 uppercase block">Codice Preventivo</span>
                <span className="font-mono text-lg font-black tracking-widest uppercase">RE-{kwp}</span>
              </div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 text-slate-900">
              {/* MONEY AREA */}
              <div className="md:col-span-5 space-y-6">
                <div className="relative">
                  <div className={`p-6 rounded-3xl border-2 text-center transition-all ${isClientMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-[10px] font-black opacity-40 uppercase block mb-1">Prezzo Chiavi in Mano</span>
                    <span className="text-lg font-black opacity-20 line-through">€ {calculations.prezzoSenzaSconti.toLocaleString()}</span>
                    <span className={`text-3xl font-black block mt-1 ${isClientMode ? 'text-white' : 'text-slate-900'}`}>€ {calculations.prezzoScontatoCliente.toLocaleString()}</span>
                  </div>
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                    SCONTO APPLICATO -{(calculations.scontoTotalePerc*100).toFixed(0)}%
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border-2 text-center ${isClientMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-100'}`}>
                  <span className={`text-[10px] font-black uppercase block mb-1 ${isClientMode ? 'text-blue-400' : 'text-blue-600'}`}>Agevolazione Fiscale 50%</span>
                  <span className={`text-3xl font-black ${isClientMode ? 'text-blue-400' : 'text-blue-700'}`}>- € {calculations.detrazioneFiscale.toLocaleString()}</span>
                </div>

                <div className="p-8 bg-green-600 rounded-[32px] text-white shadow-2xl transform hover:scale-105 transition-all text-center">
                  <span className="text-[10px] font-black opacity-60 uppercase block mb-1 tracking-widest">Investimento Netto Finale</span>
                  <span className="text-4xl font-black tracking-tighter">€ {calculations.costoNettoCliente.toLocaleString()}</span>
                </div>
              </div>

              {/* ROI CHART AREA */}
              <div className="md:col-span-7 space-y-8">
                <div className={`p-6 rounded-3xl border ${isClientMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-8 flex justify-between items-center">
                    <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" /> Andamento Rientro (ROI)</span>
                    <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[8px] font-black">BE: 16 MESI</span>
                  </h3>
                  
                  <div className="h-48 w-full relative px-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                      <line x1="0" y1="150" x2="400" y2="150" className={isClientMode ? "stroke-slate-700" : "stroke-slate-200"} strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="150" x2="400" y2="150" className={isClientMode ? "stroke-slate-600" : "stroke-slate-300"} strokeWidth="2" />
                      
                      {[0, 8, 16, 24, 32].map((m, i) => (
                        <g key={i}>
                          <line x1={(m/32)*400} y1="150" x2={(m/32)*400} y2="155" className={isClientMode ? "stroke-slate-600" : "stroke-slate-300"} strokeWidth="2" />
                          <text x={(m/32)*400} y="175" textAnchor="middle" className={`text-[10px] font-black uppercase ${isClientMode ? "fill-slate-500" : "fill-slate-400"}`}>{m}m</text>
                        </g>
                      ))}

                      {/* ROI Curve Lineare */}
                      <path 
                        d={`M 0 190 L ${(16/32)*400} 150 L 400 110`} 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                        className="drop-shadow-lg"
                      />

                      <circle cx={(16/32)*400} r="8" cy="150" fill="#3b82f6" className="animate-pulse" />
                      <text x={(16/32)*400} y="135" textAnchor="middle" className="text-[10px] font-black fill-blue-500 uppercase tracking-tighter">Pareggio</text>
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-5 rounded-3xl border transition-all ${isClientMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <Leaf className="w-5 h-5 text-green-500 mb-3" />
                    <span className="text-2xl font-black block tracking-tighter text-green-500">{calculations.alberiEquivalenti}</span>
                    <span className="text-[9px] font-black opacity-40 uppercase tracking-widest leading-none">Alberi Equivalenti</span>
                  </div>
                  <div className={`p-5 rounded-3xl border transition-all ${isClientMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <TrendingUp className="w-5 h-5 text-blue-500 mb-3" />
                    <span className="text-2xl font-black block tracking-tighter text-blue-500">+15%</span>
                    <span className="text-[9px] font-black opacity-40 uppercase tracking-widest leading-none">Extra Resa Stimata</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={`text-center py-10 text-[9px] font-black tracking-[0.3em] uppercase transition-colors ${isClientMode ? 'text-slate-700' : 'text-slate-400'}`}>
        REAIR S.R.L. | NANOTECHNOLOGY EXCELLENCE 2026
      </footer>
    </div>
  );
};

export default App;
