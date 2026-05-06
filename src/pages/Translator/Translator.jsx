import React, { useState } from 'react';
import { Globe, Languages, Volume2, Copy, Sparkles, Check, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;

async function callAI(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

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
    if (!text.trim()) return;
    setLoading(true);
    try {
      const prompt = `Translate '${text}' to ${language}. Return ONLY JSON: {"translated": "...", "pronunciation": "...", "literal": "..."}`;
      const raw = await callAI(prompt);
      const cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      setTranslated(JSON.parse(cleaned));
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
    setPhrases([]);
    try {
      const prompt = `Give 12 essential tourist phrases in the primary language of ${dest}: Hello, Thank you, How much?, Where is...?, Help!, I'm lost, Do you speak English?, The bill please, Delicious!, Excuse me, Yes, No. Return ONLY a JSON array: [{"english":"Hello","local":"Bonjour","pronunciation":"bohn-zhoor"}]`;
      const raw = await callAI(prompt);
      const cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      setPhrases(JSON.parse(cleaned));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPhrases(false);
    }
  };

  const speak = (word) => {
    const langMap = { French: 'fr-FR', Spanish: 'es-ES', Japanese: 'ja-JP', Italian: 'it-IT', German: 'de-DE', Hindi: 'hi-IN', Arabic: 'ar-SA', Thai: 'th-TH', Korean: 'ko-KR' };
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = langMap[language] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-6 py-12 pb-32 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 mx-auto rounded-2xl flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
            <Globe className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase italic" style={{ color: 'var(--text-primary)' }}>
            AI <span className="text-emerald-500">Translator</span>
          </h1>
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Break language barriers effortlessly.</p>
        </div>

        {/* Live Translator Card */}
        <div className="rounded-3xl p-8 shadow-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <div className="flex gap-3 items-center mb-6">
            <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Languages className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Live Translation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input side */}
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type anything to translate..."
                rows={5}
                className="w-full rounded-2xl p-5 outline-none resize-none font-medium text-sm transition-all focus:ring-2 focus:ring-emerald-500 border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <div className="flex gap-3">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="flex-1 rounded-xl px-4 py-3 outline-none font-bold text-sm border transition-all focus:ring-2 focus:ring-emerald-500"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button
                  onClick={handleTranslate}
                  disabled={loading || !text.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-emerald-500/20"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Sparkles className="w-4 h-4" />}
                  Translate
                </button>
              </div>
            </div>

            {/* Result side */}
            <div
              className="rounded-2xl p-6 border relative flex flex-col justify-center min-h-[160px] transition-all"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              {translated ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-3xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>{translated.translated}</h3>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => speak(translated.translated)}
                        className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCopy}
                        className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-emerald-500 font-semibold italic text-sm">{translated.pronunciation}</div>
                    <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                      Literal: {translated.literal}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Translation will appear here.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phrasebook Card */}
        <div className="rounded-3xl p-8 shadow-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Quick Phrasebook
              </h2>
              <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Essential phrases for your destination.</p>
            </div>
            <select
              value={phraseDest}
              onChange={e => loadPhrases(e.target.value)}
              className="rounded-xl px-4 py-3 outline-none font-bold text-sm border focus:ring-2 focus:ring-emerald-500 transition-all"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {loadingPhrases ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
              ))}
            </div>
          ) : phrases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phrases.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 rounded-2xl border group hover:border-emerald-400 transition-all"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>{p.english}</div>
                  <div className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>{p.local}</div>
                  <div className="flex justify-between items-end">
                    <div className="text-emerald-500 text-sm italic font-medium">{p.pronunciation}</div>
                    <button
                      onClick={() => { const u = new SpeechSynthesisUtterance(p.local); window.speechSynthesis.speak(u); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm"
                      style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)' }}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={() => loadPhrases(phraseDest)}
                className="bg-emerald-500/10 text-emerald-500 px-8 py-3 rounded-full font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 mx-auto"
              >
                <Globe className="w-4 h-4" />
                Load Phrases for {phraseDest}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Translator;
