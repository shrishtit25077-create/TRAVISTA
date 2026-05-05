import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MapPin, Star, Sparkles, Navigation, Calendar, Wallet, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';
import { track } from '../../services/trackingService';

const DestinationDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { savedPlaces, toggleSave, addItinerary } = useAuth();
  const data = location.state;
  const { photoUrl, loading: photoLoading } = useDestinationPhoto(data?.name);

  React.useEffect(() => {
    if (!data) return;
    const start = Date.now();
    return () => {
      const end = Date.now();
      const seconds = Math.floor((end - start) / 1000);
      track.timeSpent(data.name, seconds);
    };
  }, [data]);

  if (!data) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
       <div className="text-center space-y-4">
          <Navigation className="w-12 h-12 text-slate-200 mx-auto animate-bounce" />
          <h2 className="text-2xl font-black text-slate-800">Destination Not Found</h2>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold">Go Home</button>
       </div>
    </div>
  );

  const isSaved = savedPlaces.some(p => p.id === data.id);

  const handleQuickPlan = () => {
    const newTrip = {
      id: Date.now(),
      destination: data.name,
      createdAt: new Date().toISOString(),
      budget: { stay: 18000, food: 6000, travel: 12000, activities: 5000, total: 41000 },
      days: [
        {
          day: 1,
          activities: [
            { id: `a-${Date.now()}-1`, time: "Morning", title: `Arrival in ${data.name} & Check-in` },
            { id: `a-${Date.now()}-2`, time: "Afternoon", title: "Explore Local Landmarks" },
            { id: `a-${Date.now()}-3`, time: "Evening", title: "Traditional Dinner Experience" },
          ]
        }
      ]
    };
    addItinerary(newTrip);
    navigate(`/itinerary/${newTrip.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {photoLoading ? (
          <div className="absolute inset-0 shimmer" />
        ) : (
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={photoUrl} 
            className="absolute inset-0 w-full h-full object-cover"
            alt={data.name} 
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${encodeURIComponent(data.name)}/1600/900`;
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40 z-[1]" />
        
        {/* Top Actions */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => toggleSave(data)}
            className={`w-12 h-12 backdrop-blur-xl rounded-full flex items-center justify-center border transition-all ${isSaved ? 'bg-red-500 text-white border-red-500' : 'bg-white/20 text-white border-white/20 hover:bg-white hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-8 -translate-y-20 relative z-10">
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] w-fit">
               <Sparkles className="w-3 h-3" /> Editorial Pick
            </div>
            <div className="flex justify-between items-start">
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{data.name}</h1>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-lg font-black text-slate-800">{data.rating}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-slate-400 font-bold text-sm uppercase tracking-widest">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {data.category}</span>
              <span className="flex items-center gap-2"><Wallet className="w-4 h-4 text-sky-500" /> Starting from {data.price}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">About the Journey</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Experience the magic of {data.name}. This destination offers a unique blend of {data.tags?.join(', ')} and stunning landscapes. Whether you're looking for a peaceful retreat or an adventurous getaway, {data.name.split(',')[0]} has something for everyone.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Estimated Budget</h4>
                  <span className="text-emerald-600 font-black">{data.price}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Accomodation</span><span>₹15k+</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[70%]" />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Flights</span><span>₹25k+</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full w-[45%]" />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleQuickPlan}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                Plan Itinerary to {data.name.split(',')[0]} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
