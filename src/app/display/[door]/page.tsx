'use client';

import { useEffect, useState, use, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Hospital, DoorOpen, BellRing, Clock } from 'lucide-react';

export default function DoorDisplayPage({ params }: { params: Promise<{ door: string }> }) {
  const doorParam = use(params).door;
  const doorId = doorParam.replace('door', 'Door '); // door1 -> Door 1
  const [servingList, setServingList] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const prevIdsRef = useRef([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const maskName = (name) => {
    if (!name) return '';
    return name.split(' ').map(word => {
      if (word.length <= 1) return word;
      return word.charAt(0) + '*'.repeat(word.length - 1);
    }).join(' ');
  };

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch('/api/queue');
        const data = await res.json();
        
        // Find all patients for this specific door
        const activeList = data.filter(p => 
          p.status === 'Calling' && 
          p.door && 
          p.door.trim().toLowerCase() === doorId.trim().toLowerCase()
        );
        
        // Notification Logic
        const currentStates = activeList.map(p => `${p.id}|${p.updatedAt || ''}`);
        const prevStates = prevIdsRef.current;
        const newStates = currentStates.filter(state => !prevStates.includes(state));
        
        if (newStates.length > 0 && prevStates.length > 0) {
           if ('speechSynthesis' in window) {
               window.speechSynthesis.cancel();
           }
           newStates.forEach(state => {
               const id = state.split('|')[0];
               const p = activeList.find(x => String(x.id) === id);
               if (p && 'speechSynthesis' in window) {
                   setIsSpeaking(true);
                   const safeNumber = p.queueNumber.replace(/-/g, ' ');
                   const msg = new SpeechSynthesisUtterance(`Calling patient number ${safeNumber}, please proceed to ${p.door}`);
                   msg.rate = 0.85;
                   msg.pitch = 1.1;
                   msg.onend = () => setIsSpeaking(false);
                   window.speechSynthesis.speak(msg);
               }
           });
        }
        prevIdsRef.current = currentStates;

        setServingList(activeList);
        
        setUpcoming(data.filter(p => p.status === 'Pending').slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch queue');
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [doorId]);

  const ClassificationRibbon = ({ classification }) => {
    const configs = {
      'Senior Citizen': 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]',
      'PWD': 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]',
      'Pregnant Women': 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]',
      'Infants': 'bg-blue-400 text-white shadow-[0_0_15px_rgba(96,165,250,0.5)]',
      'Breast Feeding Moms': 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]',
      'Immno Compromised Patients': 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]',
      'CDH Employees': 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]',
      'Regular': 'bg-zinc-700 text-white shadow-[0_0_15px_rgba(63,63,70,0.5)]'
    };

    const config = configs[classification] || configs['Regular'];
    
    return (
      <div className={`absolute top-16 -left-20 w-80 py-4 text-center transform -rotate-45 font-black text-lg uppercase tracking-widest z-20 shadow-2xl ${config}`}>
        {classification}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col">
      {/* Top Banner */}
      <div className="bg-indigo-600 p-6 flex justify-between items-center shadow-2xl relative z-20">
         <div className="flex items-center gap-6">
            <div className="bg-white/20 p-3 rounded-2xl">
               <Hospital size={32} />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-tighter uppercase">{doorId} STATION</h1>
               <p className="text-indigo-200 font-bold tracking-widest text-[10px] uppercase">Live Consultation Dashboard</p>
            </div>
         </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
               <p className="text-3xl font-mono font-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
            <div className={`p-3 rounded-2xl transition-all ${isSpeaking ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'bg-white/10 text-white'}`}>
               <Volume2 size={24} className={isSpeaking ? 'animate-pulse' : ''} />
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 flex flex-col overflow-hidden">
         <AnimatePresence mode="popLayout">
            {servingList.length > 0 ? (
               <div className={`grid gap-8 h-full ${servingList.length === 1 ? 'grid-cols-1' : servingList.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {servingList.map((serving) => (
                    <motion.div 
                      key={serving.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                      className="bg-zinc-900/50 border border-white/5 rounded-[4rem] p-10 flex flex-col justify-center text-center relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                         <BellRing size={120} />
                      </div>
                      <ClassificationRibbon classification={serving.classification} />
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 font-black uppercase tracking-widest text-[10px] mb-6">
                          Now Calling
                        </div>
                        <div className={`font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-6 ${servingList.length === 1 ? 'text-[22rem]' : 'text-[12rem]'}`}>
                          {serving.queueNumber}
                        </div>
                        <div className="space-y-4">
                           <h2 className={`${servingList.length === 1 ? 'text-7xl' : 'text-4xl'} font-black uppercase tracking-tight truncate`}>{maskName(serving.patientName)}</h2>
                           <div className="flex items-center justify-center gap-3">
                              <span className="px-5 py-2 bg-indigo-600 rounded-xl text-sm font-black text-white tracking-widest uppercase shadow-lg shadow-indigo-600/20">
                                {serving.serviceType}
                              </span>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
            ) : (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
               >
                  <div className="w-32 h-32 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                     <DoorOpen size={64} className="text-zinc-700" />
                  </div>
                  <h2 className="text-5xl font-black text-zinc-700 uppercase tracking-widest">Station Available</h2>
                  <p className="text-xl text-zinc-500 font-medium tracking-wide">Awaiting next consultation assignment</p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Footer Bar */}
      <div className="bg-zinc-950 border-t border-white/5 p-8 relative z-20">
         <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-12">
               <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black text-zinc-600 uppercase tracking-[0.2em]">Live Queue Feed</span>
               </div>
               <div className="flex gap-10">
                  {upcoming.map(p => (
                     <div key={p.id} className="flex flex-col border-l border-white/10 pl-6">
                        <span className="text-3xl font-black text-indigo-500 leading-none tracking-tighter">{p.queueNumber}</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter truncate w-32 mt-1">{maskName(p.patientName)}</span>
                     </div>
                  ))}
               </div>
            </div>
            <div className="text-zinc-700 font-black text-xs uppercase tracking-[0.3em]">
               QURE HOSPITAL SYSTEMS
            </div>
         </div>
      </div>
    </div>
  );
}
