import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Download, Save, Map as MapIcon, Calendar, DollarSign, Lightbulb, Navigation, Users, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import L from 'leaflet';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AIPlanner() {
  const { addItinerary } = useAuth();
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(false);
  
  // Step 1: User Input Form State
  const [formData, setFormData] = useState({
    startLocation: '',
    destinations: [''],
    startDate: '',
    endDate: '',
    travelers: 2,
    style: 'Relaxing',
    transport: 'driving-car',
  });

  // Generated Plan State
  const [plan, setPlan] = useState(null);
  const [routeData, setRouteData] = useState(null);

  const handleAddDestination = () => {
    setFormData({ ...formData, destinations: [...formData.destinations, ''] });
  };

  const handleDestChange = (index, value) => {
    const newDests = [...formData.destinations];
    newDests[index] = value;
    setFormData({ ...formData, destinations: newDests });
  };

  // Step 2 & 3: API Calls
  const handleGenerate = async () => {
    if (!formData.startLocation || !formData.destinations[0] || !formData.startDate) {
      toast.error('Please fill in the starting location, at least one destination, and dates.');
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: OpenRouteService API Integration
      // fetch('https://api.openrouteservice.org/v2/directions/' + formData.transport, ...)
      
      // MOCK ROUTE DATA
      const mockRoute = {
        distance: 450,
        time: '5 hours 30 mins',
        geometry: [
          [28.6139, 77.2090], // Delhi
          [27.1767, 78.0081], // Agra
          [26.9124, 75.7873]  // Jaipur
        ],
        markers: [
          { name: formData.startLocation || 'Start', coords: [28.6139, 77.2090] },
          { name: formData.destinations[0] || 'Destination', coords: [26.9124, 75.7873] }
        ]
      };
      
      // MOCK AI ITINERARY
      const mockPlan = {
        title: `Trip to ${formData.destinations.join(', ')}`,
        days: [
          {
            day: 1,
            activities: [
              { time: 'Morning', title: 'Arrival & Check-in', desc: 'Arrive at your destination and settle into your hotel.' },
              { time: 'Afternoon', title: 'Local Exploration', desc: 'Walk around the main square and enjoy local street food.' },
              { time: 'Evening', title: 'Welcome Dinner', desc: 'Dine at a highly-rated local restaurant.' }
            ]
          }
        ],
        budget: { transport: 120, food: 200, stay: 350, activities: 150, total: 820 },
        tips: { packing: ['Comfortable walking shoes', 'Light jacket', 'Sunscreen'], local: ['Always carry some cash', 'Respect local customs when visiting temples'] }
      };

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      
      setRouteData(mockRoute);
      setPlan(mockPlan);
      setActiveTab('itinerary');
      toast.success('Your trip has been generated!');
    } catch (error) {
      toast.error('Failed to generate trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Save & Export
  const handleSave = () => {
    if (!plan) return;
    addItinerary({
      id: Date.now(),
      destination: formData.destinations.join(', '),
      days: plan.days,
      budget: plan.budget
    });
    toast.success('Trip saved to My Itineraries!');
  };

  const handleDownloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(plan.title, 20, 20);
    doc.setFontSize(12);
    doc.text('Powered by Travista AI', 20, 30);
    doc.save('travista-itinerary.pdf');
    toast.success('PDF downloaded!');
  };

  return (
    <div className="flex-1 min-w-0 w-full flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc]">
      
      {/* ─── Left Sidebar: Input Form ─── */}
      <div className="w-full md:w-[400px] h-full overflow-y-auto bg-white border-r border-slate-200 p-6 shadow-sm z-10 flex flex-col">
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Navigation className="text-emerald-600" /> Plan Your Trip
        </h2>

        <div className="space-y-5 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Starting Location</label>
            <input type="text" value={formData.startLocation} onChange={e => setFormData({...formData, startLocation: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition-all" placeholder="E.g. New York, USA" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destinations</label>
            {formData.destinations.map((dest, i) => (
              <input key={i} type="text" value={dest} onChange={e => handleDestChange(i, e.target.value)} className="w-full p-3 mb-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition-all" placeholder="E.g. Paris, France" />
            ))}
            <button onClick={handleAddDestination} className="text-emerald-600 text-sm font-bold mt-1 hover:text-emerald-700">+ Add another stop</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Travelers</label>
              <select value={formData.travelers} onChange={e => setFormData({...formData, travelers: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Person{n>1?'s':''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transport</label>
              <select value={formData.transport} onChange={e => setFormData({...formData, transport: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="driving-car">Driving</option>
                <option value="foot-walking">Walking</option>
                <option value="cycling-regular">Cycling</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Travel Style</label>
            <div className="flex flex-wrap gap-2">
              {['Adventure', 'Relaxing', 'Cultural', 'Food', 'Budget'].map(style => (
                <button key={style} onClick={() => setFormData({...formData, style})} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.style === style ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} className="w-full py-4 mt-8 bg-slate-900 text-white font-black text-lg rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
          {loading ? 'Generating...' : 'Build My Itinerary'} 
        </button>
      </div>

      {/* ─── Right Area: Results & Tabs ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
        {!plan ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <MapIcon size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No active trip plan</h3>
            <p className="max-w-md">Fill out the form on the left to generate an AI-powered itinerary complete with routes, budgets, and daily activities.</p>
          </div>
        ) : (
          <>
            {/* Header & Tabs */}
            <div className="bg-white px-8 pt-8 pb-4 border-b border-slate-200 shrink-0">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">{plan.title}</h1>
                  <p className="text-slate-500 font-medium flex gap-4">
                    <span className="flex items-center gap-1"><Calendar size={16}/> {formData.startDate}</span>
                    <span className="flex items-center gap-1"><Users size={16}/> {formData.travelers} Travelers</span>
                    <span className="flex items-center gap-1"><Activity size={16}/> {formData.style}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 flex items-center gap-2 transition-colors">
                    <Save size={18} /> Save Trip
                  </button>
                  <button onClick={handleDownloadPDF} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 flex items-center gap-2 transition-colors">
                    <Download size={18} /> Export PDF
                  </button>
                </div>
              </div>

              <div className="flex gap-6">
                {[
                  { id: 'map', label: 'Route Map', icon: MapIcon },
                  { id: 'itinerary', label: 'Itinerary', icon: Calendar },
                  { id: 'budget', label: 'Budget', icon: DollarSign },
                  { id: 'tips', label: 'Local Tips', icon: Lightbulb }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-3 font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    <tab.icon size={18} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              
              {/* TAB 1: MAP */}
              {activeTab === 'map' && routeData && (
                <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                  <MapContainer center={routeData.geometry[0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    {routeData.markers.map((m, i) => (
                      <Marker key={i} position={m.coords}>
                        <Popup>{m.name}</Popup>
                      </Marker>
                    ))}
                    <Polyline positions={routeData.geometry} color="#059669" weight={4} opacity={0.8} />
                  </MapContainer>
                  <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg z-[1000] border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-1">Trip Summary</h4>
                    <p className="text-sm text-slate-500">Distance: <span className="font-bold text-slate-700">{routeData.distance} km</span></p>
                    <p className="text-sm text-slate-500">Est. Time: <span className="font-bold text-slate-700">{routeData.time}</span></p>
                  </div>
                </div>
              )}

              {/* TAB 2: ITINERARY */}
              {activeTab === 'itinerary' && (
                <div className="max-w-3xl space-y-8 pb-12">
                  {plan.days.map((day, idx) => (
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: idx*0.1}} key={day.day} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-black text-slate-800 mb-4 border-b border-slate-100 pb-3">Day {day.day}</h3>
                      <div className="space-y-4">
                        {day.activities.map((act, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-24 shrink-0 text-sm font-bold text-emerald-600 pt-1">{act.time}</div>
                            <div>
                              <h4 className="font-bold text-slate-800">{act.title}</h4>
                              <p className="text-slate-500 text-sm mt-1 leading-relaxed">{act.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* TAB 3: BUDGET */}
              {activeTab === 'budget' && (
                <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">Estimated Cost</h3>
                    <p className="text-3xl font-black">${plan.budget.total}</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                      <span className="font-medium text-slate-600">Transport</span>
                      <span className="font-bold text-slate-800">${plan.budget.transport}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                      <span className="font-medium text-slate-600">Accommodation</span>
                      <span className="font-bold text-slate-800">${plan.budget.stay}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                      <span className="font-medium text-slate-600">Food & Dining</span>
                      <span className="font-bold text-slate-800">${plan.budget.food}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                      <span className="font-medium text-slate-600">Activities</span>
                      <span className="font-bold text-slate-800">${plan.budget.activities}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TIPS */}
              {activeTab === 'tips' && (
                <div className="max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-100/50">
                    <h3 className="text-lg font-black text-emerald-800 mb-4">Packing Checklist</h3>
                    <ul className="space-y-3">
                      {plan.tips.packing.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-emerald-700 font-medium">
                          <span className="mt-1 shrink-0 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm shadow-amber-100/50">
                    <h3 className="text-lg font-black text-amber-800 mb-4">Local Customs & Tips</h3>
                    <ul className="space-y-3">
                      {plan.tips.local.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-amber-700 font-medium">
                          <span className="mt-1 shrink-0 w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">!</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
