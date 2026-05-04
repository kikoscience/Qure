'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Users, Clock, Hospital, Bell, DoorOpen } from 'lucide-react';

export default function DisplayPage() {
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState([]); // Array of serving patients
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch('/api/queue');
        const data = await res.json();
        setQueue(data);
        
        // Find one active patient for each door
        const doors = ['Door 1', 'Door 2'];
        const serving = doors.map(door => 
          data.find(p => p.status === 'Calling' && p.door === door)
        ).filter(Boolean);
        
        setNowServing(serving);
        setUpcoming(data.filter(p => p.status === 'Pending').slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch queue');
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Premium Header */}
      <header className="p-8 flex justify-between items-center bg-[#111] border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20">
            <Hospital size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter"><span className="text-blue-500">Q</span>URE DISPLAY</h1>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Main Waiting Area Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Current Time</p>
            <p className="text-2xl font-mono font-bold">{new Date().toLocaleTimeString()}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <Volume2 className="text-blue-500 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="p-10 grid grid-cols-12 gap-10">
        {/* Left Side: Now Serving (Grid for Multiple Doors) */}
        <div className="col-span-8 space-y-10">
          <h2 className="text-2xl font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-4">
            <Bell size={24} className="text-blue-500" /> Now Serving
          </h2>
          
          <div className="grid grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {nowServing.map((patient) => (
                <motion.div 
                  key={patient.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[4rem] shadow-2xl shadow-blue-500/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-20">
                    <DoorOpen size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                       <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest">{patient.door || 'DOOR 1'}</span>
                       <span className="text-xs font-bold text-blue-100 uppercase">{patient.classification}</span>
                    </div>
                    <div className="text-[12rem] font-black leading-none tracking-tighter mb-4">{patient.queueNumber}</div>
                    <div className="text-3xl font-bold truncate">{patient.patientName}</div>
                    <div className="mt-4 flex items-center gap-3">
                       <span className="px-4 py-2 bg-white/20 border border-white/10 rounded-xl text-sm font-black uppercase tracking-[0.2em] text-white">
                         {patient.serviceType}
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {nowServing.length === 0 && (
                <div className="col-span-2 p-32 text-center border-4 border-dashed border-white/5 rounded-[4rem]">
                   <p className="text-4xl font-black text-zinc-700 uppercase tracking-widest">Awaiting Calls...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Upcoming Queue */}
        <div className="col-span-4 space-y-10">
          <h2 className="text-2xl font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-4">
            <Users size={24} className="text-zinc-500" /> Upcoming
          </h2>
          
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {upcoming.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white/5 border border-white/10 p-8 rounded-[3rem] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                       <div className="text-5xl font-black text-zinc-100 tracking-tighter">{item.queueNumber}</div>
                       <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.classification}</span>
                    </div>
                    <div className="text-xl text-zinc-400 font-bold">{item.patientName}</div>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-2xl">
                    <Clock className="text-zinc-500" size={24} />
                  </div>
                </motion.div>
              ))}
              
              {upcoming.length === 0 && (
                <p className="text-zinc-600 font-bold italic text-center p-12">No pending patients in queue.</p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      
      {/* Marquee Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-blue-600 p-4">
         <div className="max-w-screen-2xl mx-auto flex items-center gap-8 overflow-hidden whitespace-nowrap text-xl font-black uppercase tracking-widest">
            <p className="animate-marquee">Welcome to QURE Hospital • Please proceed to your assigned door when your number is called • Your health is our priority •</p>
         </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
