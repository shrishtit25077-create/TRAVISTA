import React, { useState } from 'react';
import { Globe, Languages, Volume2, Copy, Sparkles, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Translator = () => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('French');
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [phraseDest, setPhraseDest] = useState('Paris');
  const [phrases, setPhrases] = useState([]);
  const [loadingPhrases, setLoadingPhrases] = useState(false);

  const languages = ['French', 'Spanish', 'Japanese', 'Hindi', 'Arabic', 'Italian', 'German', 'Thai', 'Korean', 'Mandarin'];
  const destinations = ['Paris', 'Tokyo', 'Bali', 'Rome', 'Dubai', 'Barcelona', 'Istanbul', 'Bangkok'];

  const handleTranslate = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const key = import.meta.env.VITE_OPENROUTER_KEY;
      const prompt = `Translate '${text}' to ${language}. Return ONLY JSON: {"translated": "...", "pronunciation": "...", "literal": "..."}`;
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: prompt }]
        }),
      });
      const data = await res.json();
      const textResponse = data.choices?.[0]?.message?.content;
      if (textResponse) {
        const cleaned = textResponse.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        setTranslated(JSON.parse(cleaned));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (translated?.translated) {
      navigator.clipboard.writeText(translated.translated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadPhrases = async (dest) => {
    setPhraseDest(dest);
    setLoadingPhrases(true);
    try {
      const key = import.meta.env.VITE_OPENROUTER_KEY;
      const prompt = `Give these 12 phrases in the primary language of ${dest} for a tourist: Hello, Thank you, How much?, Where is...?, Help!, I'm lost, Do you speak English?, The bill please, Delicious!, Excuse me, Yes/No, Cheers!. Return ONLY a JSON array: [{"english": "Hello", "local": "Bonjour", "pronunciation": "bohn-zhoor"}]`;
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: prompt }]
        }),
      });
      const data = await res.json();
      const textResponse = data.choices?.[0]?.message?.content;
      if (textResponse) {
        const cleaned = textResponse.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        setPhrases(JSON.parse(cleaned));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPhrases(false);
    }
  };

  const speak = (text, lang) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // basic lang matching
    const langMap = { 'French': 'fr-FR', 'Spanish': 'es-ES', 'Japanese': 'ja-JP', 'Italian': 'it-IT', 'German': 'de-DE' };
    utterance.lang = langMap[language] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] dark:bg-[#0f0f0f] px-8 py-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mx-auto rounded-2xl flex items-center justify-center mb-6">
            <Globe className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
            AI <span className="text-emerald-500">Translator</span>
          </h1>
          <p className="text-slate-400 font-medium">Break language barriers effortlessly.</p>
        </div>

        {/* Live Translator */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-[#2a2a2a]">
          <div className="flex gap-4 items-center mb-6">
            <Languages className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Translation</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <textarea 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type anything to translate..."
                className="w-full h-40 bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-[#2a2a2a] rounded-2xl p-5 outline-none focus:border-emerald-500 resize-none dark:text-white"
              />
              <div className="flex gap-4">
                <select 
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 outline-none dark:text-white font-medium"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button 
                  onClick={handleTranslate}
                  disabled={loading || !text}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Translate
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-[#2a2a2a] rounded-2xl p-6 relative flex flex-col justify-center min-h-[160px]">
              {translated ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">{translated.translated}</h3>
                    <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-emerald-500">
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <div>
                    <div className="text-emerald-600 font-medium italic mb-1 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 cursor-pointer" onClick={() => speak(translated.translated, language)} />
                      {translated.pronunciation}
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Literal: {translated.literal}</div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-slate-400 font-medium">Translation will appear here.</div>
              )}
            </div>
          </div>
        </div>

        {/* Phrasebook */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-[#2a2a2a]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Quick Phrasebook
              </h2>
              <p className="text-sm text-slate-500 mt-1">Essential phrases for your destination.</p>
            </div>
            <select 
              value={phraseDest}
              onChange={e => loadPhrases(e.target.value)}
              className="bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 outline-none dark:text-white font-medium"
            >
              {destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {loadingPhrases ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_,i) => <div key={i} className="h-24 bg-slate-100 dark:bg-[#2a2a2a] animate-pulse rounded-2xl" />)}
            </div>
          ) : phrases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phrases.map((p, i) => (
                <div key={i} className="bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-[#2a2a2a] p-5 rounded-2xl group hover:border-emerald-300 transition-colors">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{p.english}</div>
                  <div className="text-lg font-black text-slate-800 dark:text-white mb-1">{p.local}</div>
                  <div className="flex justify-between items-end">
                    <div className="text-emerald-600 text-sm italic">{p.pronunciation}</div>
                    <button onClick={() => speak(p.local, '')} className="w-8 h-8 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-emerald-500">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <button onClick={() => loadPhrases(phraseDest)} className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 px-6 py-3 rounded-full font-bold">Load Phrases for {phraseDest}</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Translator;
