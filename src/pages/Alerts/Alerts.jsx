import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Search, TrendingDown, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';

const AlertCard = ({ alert, onDelete }) => {
  const navigate = useNavigate();
  const { photoUrl } = useDestinationPhoto(alert.destination);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const key = import.meta.env.VITE_OPENROUTER_KEY;
        const prompt = `Current average flight price from India to ${alert.destination} in ${alert.month}? Return ONLY JSON: {"avgPrice": number, "isGoodTime": boolean, "tip": "string"}`;
        
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
          setInsight(JSON.parse(cleaned));
        }
      } catch (e) {
        console.error("Alert insight failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [alert]);

  const isGood = insight && insight.avgPrice <= alert.targetPrice;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden border border-slate-100 dark:border-[#2a2a2a] shadow-sm flex flex-col md:flex-row">
      <div className="md:w-48 h-48 md:h-auto relative shrink-0">
        <img src={photoUrl || `https://picsum.photos/seed/${alert.destination}/400/400`} className="w-full h-full object-cover" alt={alert.destination} />
        {isGood && (
          <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <TrendingDown className="w-3 h-3" /> Good time to book!
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{alert.destination}</h3>
            <div className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{alert.month}</div>
          </div>
          <button onClick={() => onDelete(alert.id)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-[#0f0f0f] text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-end gap-4 mb-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Price</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">₹{Number(alert.targetPrice || 0).toLocaleString()}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Current Avg</div>
            {loading ? (
              <div className="h-7 w-20 bg-slate-100 dark:bg-[#2a2a2a] rounded animate-pulse" />
            ) : (
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{(insight?.avgPrice || 0).toLocaleString()}</div>
            )}
          </div>
        </div>

        {insight?.tip && <p className="text-xs text-slate-500 italic mb-4">"{insight.tip}"</p>}

        <button 
          onClick={() => navigate(`/flights?to=${alert.destination}`)}
          className="w-full py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors"
        >
          <Plane className="w-4 h-4" /> Search Flights
        </button>
      </div>
    </motion.div>
  );
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('travista_alerts');
      if (stored) setAlerts(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const handleDelete = (id) => {
    const newAlerts = alerts.filter(a => a.id !== id);
    setAlerts(newAlerts);
    localStorage.setItem('travista_alerts', JSON.stringify(newAlerts));
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] dark:bg-[#0f0f0f] px-8 py-16 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Price Drop <span className="text-emerald-600">Alerts</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            We're watching the skies for you.
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-white dark:bg-[#1a1a1a] rounded-[3rem] border border-slate-100 dark:border-[#2a2a2a] shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-[#0f0f0f] rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-10 h-10 text-slate-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight italic">No alerts set yet.</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto">Click the bell icon on any destination card to set a flight price alert.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alerts.map(a => <AlertCard key={a.id} alert={a} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
