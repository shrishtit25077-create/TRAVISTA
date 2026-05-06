import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Hotel, Ticket, Download, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';

const Bookings = () => {
  const bookings = [
    { 
      id: 'BK-1029', 
      type: 'flight', 
      title: 'Emirates EK-412', 
      detail: 'London (LHR) → Bali (DPS)', 
      date: '12 June, 2024', 
      status: 'confirmed',
      icon: Plane,
      color: 'text-blue-500 bg-blue-50'
    },
    { 
      id: 'BK-5521', 
      type: 'hotel', 
      title: 'Four Seasons Resort', 
      detail: 'Sayan, Ubud, Bali', 
      date: '14 - 20 June, 2024', 
      status: 'confirmed',
      icon: Hotel,
      color: 'text-teal bg-teal/10'
    },
    { 
      id: 'BK-9902', 
      type: 'activity', 
      title: 'Ubud Jungle Swing', 
      detail: 'Guided tour & Lunch', 
      date: '15 June, 2024', 
      status: 'pending',
      icon: Ticket,
      color: 'text-accent bg-accent/10'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Your Bookings</h2>
          <p className="text-gray-500 mt-1">Manage your flights, hotels and experiences in one place.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-6 py-3 rounded-xl flex items-center gap-2 border-teal/20">
            <span className="w-3 h-3 bg-teal rounded-full animate-pulse" />
            <span className="font-bold text-teal">2 Active Trips</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {bookings.map((booking, i) => (
          <motion.div 
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-center gap-8 group"
          >
            <div className={`p-5 rounded-2xl ${booking.color} shadow-inner`}>
              <booking.icon className="w-8 h-8" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{booking.type}</span>
                <span className="text-xs font-bold text-gray-300">#{booking.id}</span>
              </div>
              <h3 className="text-2xl font-bold text-primary group-hover:text-teal transition-colors">{booking.title}</h3>
              <p className="text-gray-500">{booking.detail}</p>
            </div>

            <div className="md:border-l border-gray-100 md:pl-8 space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</p>
              <div className="flex items-center gap-2 font-bold text-primary">
                <Clock className="w-4 h-4 text-teal" />
                {booking.date}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {booking.status === 'confirmed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {booking.status.toUpperCase()}
              </div>
              
              <button className="p-3 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-primary transition-all border border-transparent hover:border-gray-100">
                <Download className="w-6 h-6" />
              </button>
              
              <button className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-teal hover:text-white transition-all">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 hover:border-teal/30 hover:bg-teal/5 transition-all cursor-pointer">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
          <Ticket className="w-8 h-8 text-gray-300" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-400">Add a new booking</h4>
          <p className="text-gray-400 text-sm">Upload your ticket or hotel confirmation to sync it with your trip.</p>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
