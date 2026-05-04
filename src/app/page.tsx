'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Hospital, LayoutGrid, Monitor, UserRound, DoorOpen, ArrowRight, FileText, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const staffDoors = [
    { id: '1', label: 'Door 1', services: 'Surgery / ENT' },
    { id: '2', label: 'Door 2', services: 'Medical / Pedia' },
    { id: '3', label: 'Door 3', services: 'OB-Gyne' },
    { id: '4', label: 'Door 4', services: 'Ophtha / Derma' },
    { id: '5', label: 'Door 5', services: 'Psychiatry' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden relative">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-12 min-h-screen flex flex-col relative z-10">
        <header className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_40px_rgba(79,70,229,0.4)]">
              <Hospital size={30} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter italic">QURE <span className="text-indigo-500 not-italic">PLATFORM</span></h1>
              <p className="text-[10px] font-black tracking-[0.5em] uppercase text-zinc-500">Hospital Intelligence Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-8 bg-white/5 px-8 py-3 rounded-2xl border border-white/5 backdrop-blur-xl">
             <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Secure Core</span>
             </div>
             <div className="w-px h-4 bg-white/10"></div>
             <div className="flex items-center gap-3">
                <Zap size={16} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Low Latency</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1 items-center">
          <div className="lg:col-span-5 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-8xl font-black leading-[0.9] tracking-tighter mb-8 italic">
                THE <span className="text-indigo-500 not-italic">FUTURE</span> OF PATIENT CARE.
              </h2>
              <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-xl">
                A high-fidelity ecosystem designed for Conner District Hospital. 
                Synchronize departments, eliminate wait-time anxiety, and empower staff with real-time intelligence.
              </p>
            </motion.div>

            <div className="flex items-center gap-6">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-[#050505] bg-zinc-800 flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Staff" />
                    </div>
                  ))}
               </div>
               <div className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Trusted by <span className="text-white">CDH Medical Staff</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Triage Portal */}
            <Link href="/triage" className="group">
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white/5 p-8 rounded-[3rem] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.08] transition-all duration-500 h-full flex flex-col relative overflow-hidden"
              >
                <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-900/40">
                  <UserRound size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4 italic uppercase tracking-tighter">Triage Control</h3>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-6">
                  Primary intake system for patient sorting and queue assignment.
                </p>
                <div className="mt-auto flex items-center gap-3 text-indigo-400 font-black uppercase tracking-widest text-[10px]">
                   Access Portal <ArrowRight size={14} />
                </div>
              </motion.div>
            </Link>

            {/* Records Portal */}
            <Link href="/records" className="group">
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white/5 p-8 rounded-[3rem] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all duration-500 h-full flex flex-col relative overflow-hidden"
              >
                <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-900/40">
                  <FileText size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4 italic uppercase tracking-tighter">Record Vault</h3>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-6">
                  Manage physical record retrieval and department tracking.
                </p>
                <div className="mt-auto flex items-center gap-3 text-emerald-400 font-black uppercase tracking-widest text-[10px]">
                   Access Portal <ArrowRight size={14} />
                </div>
              </motion.div>
            </Link>

            {/* Staff Station - REMODELED */}
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-900 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <LayoutGrid size={200} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-white backdrop-blur-xl border border-white/10">
                      <LayoutGrid size={40} />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">Staff Consoles</h3>
                      <p className="text-indigo-200 font-bold text-sm tracking-widest uppercase opacity-70 italic">Station Control Center</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {staffDoors.map((door) => (
                      <Link 
                        key={door.id} 
                        href={`/staff?door=${door.id}`}
                        className="bg-black/20 hover:bg-white text-white hover:text-black p-6 rounded-3xl transition-all duration-500 flex flex-col items-center gap-3 border border-white/5 hover:border-transparent hover:scale-105"
                      >
                        <DoorOpen size={24} />
                        <span className="font-black text-xs uppercase tracking-widest">{door.label}</span>
                        <span className="text-[7px] font-bold opacity-40 uppercase tracking-tighter truncate w-full text-center">{door.services}</span>
                      </Link>
                    ))}
                  </div>
               </div>
            </div>

            {/* Display Board */}
            <div className="md:col-span-2 bg-zinc-900/50 p-10 rounded-[4rem] border border-white/5 flex flex-col md:flex-row items-center gap-10 hover:bg-zinc-900/80 transition-all duration-500">
               <div className="flex-1">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white mb-6">
                    <Monitor size={32} />
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Waiting Area Board</h3>
                  <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-8 max-w-sm">
                    Stunning 70/30 infotainment split with real-time patient tracking and priority lanes.
                  </p>
                  <Link href="/display" className="inline-flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-500 hover:text-white transition-all">
                    Launch Unified Board <ArrowRight size={16} />
                  </Link>
               </div>
               <div className="w-full md:w-64 aspect-video bg-black rounded-[2rem] border border-white/10 relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="p-4 flex flex-col gap-2">
                     <div className="w-1/2 h-1 bg-white/20 rounded-full"></div>
                     <div className="w-3/4 h-1 bg-white/10 rounded-full"></div>
                     <div className="mt-4 flex gap-2">
                        <div className="flex-1 aspect-square bg-indigo-500/40 rounded-lg"></div>
                        <div className="flex-1 aspect-square bg-white/5 rounded-lg"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 py-10 border-t border-white/5 flex justify-between items-center text-zinc-600 font-black text-[9px] uppercase tracking-[0.4em]">
          <div className="flex items-center gap-4">
             <span>© 2026 CONNER DISTRICT HOSPITAL</span>
             <span className="w-1.5 h-1.5 rounded-full bg-zinc-800"></span>
             <span className="text-indigo-500">QURE CORE v4.0</span>
          </div>
          <div className="flex gap-10 items-center">
            <div className="flex items-center gap-2">
               <Activity size={12} className="text-emerald-500" />
               <span className="text-emerald-500/50">SQL_UPLINK: ACTIVE</span>
            </div>
            <span>NEXT_GEN_UI</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
