import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Wallet, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;

async function callAI(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ClimateMatcher = () => {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState(25);
  const [budget, setBudget] = useState(50000);
  const [month, setMonth] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    setLoading(true);
    setResults('');
    const prompt = `Suggest 5 travel destinations from India for someone who:
- Prefers ${temp}°C temperature
- Has a budget of ₹${Number(budget || 0).toLocaleString()}
- Wants to travel in ${month || 'any month'}
Return a clean numbered list with destination name, best temp, and one-line reason. Keep it concise.`;
    const res = await callAI(prompt);
    setResults(res);
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-8">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-8 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-100 dark:bg-sky-900/40 text-sky-600 rounded-xl flex items-center justify-center">
            <Thermometer size={18} />
          </div>
          <div className="text-left">
            <div className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest">Climate Matcher</div>
            <div className="text-xs text-slate-400 font-medium">AI finds destinations that match your perfect weather</div>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 pt-2 space-y-6 border-t border-slate-100 dark:border-slate-700">
              {/* Temperature slider */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex justify-between">
                  <span>Preferred Temperature</span>
                  <span className="text-slate-700 dark:text-slate-300">{temp}°C</span>
                </label>
                <input
                  type="range" min={5} max={45} value={temp}
                  onChange={e => setTemp(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                  <span>5°C Cold</span><span>45°C Hot</span>
                </div>
              </div>

              {/* Budget slider */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex justify-between">
                  <span><Wallet size={12} className="inline mr-1" />Budget</span>
                  <span className="text-slate-700 dark:text-slate-300">₹{Number(budget || 0).toLocaleString()}</span>
                </label>
                <input
                  type="range" min={10000} max={300000} step={5000} value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                  <span>₹10k</span><span>₹3L</span>
                </div>
              </div>

              {/* Month pills */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Travel Month</label>
                <div className="flex flex-wrap gap-2">
                  {MONTHS.map(m => (
                    <button
                      key={m}
                      onClick={() => setMonth(month === m ? '' : m)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                        month === m
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                          : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleMatch}
                disabled={loading}
                className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Finding matches...</>
                ) : (
                  <><Sparkles size={14} /> Find My Destinations</>
                )}
              </button>

              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-600"
                >
                  <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">✨ AI Recommendations</div>
                  <pre className="text-sm text-slate-700 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">{results}</pre>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClimateMatcher;
