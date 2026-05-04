'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, CheckCircle, Clock, RefreshCcw, LogOut, DoorOpen, Settings2, Filter, Check, XCircle, Hospital, ArrowRight } from 'lucide-react';

export default function StaffPage() {
  const [queue, setQueue] = useState([]);
  const [callingPatients, setCallingPatients] = useState([]); // Multiple active patients
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState('Door 1');
  const [selectedServices, setSelectedServices] = useState(['ALL']);
  const [availableServices, setAvailableServices] = useState([]);
  const [authUser, setAuthUser] = useState(null);

  const fetchAuth = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (authData.authenticated) {
        setAuthUser(authData.user);
      } else {
        window.location.href = '/login';
      }
    } catch (e) {}
  };

  const fetchServices = async () => {
    try {
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const yyyy = today.getFullYear();
      const dateStr = `${mm}-${dd}-${yyyy}`;
      
      const res = await fetch(`/api/emr?date=${dateStr}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const services = [...new Set(data.map(p => p.serviceType))].sort();
        setAvailableServices(services);
      }
    } catch (error) {
      console.error('Failed to fetch services');
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (Array.isArray(data)) {
        setQueue(data);
        const actives = data.filter(p => p.status === 'Calling' && p.door === selectedDoor);
        setCallingPatients(actives);
      }
    } catch (error) {
      console.error('Failed to fetch queue');
    }
  };

  useEffect(() => {
    fetchAuth();
    fetchServices();
  }, []);

  useEffect(() => {
    if (isConfigured) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 3000);
      return () => clearInterval(interval);
    }
  }, [isConfigured, selectedDoor]);

  const handleCall = async (id) => {
    setLoading(true);
    try {
      await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Calling', door: selectedDoor }),
      });
      fetchQueue();
    } catch (error) {
      alert('Failed to call patient');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    setLoading(true);
    try {
      await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Completed' }),
      });
      fetchQueue();
    } catch (error) {
      alert('Failed to complete');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const toggleService = (service) => {
    if (service === 'ALL') {
      setSelectedServices(['ALL']);
    } else {
      let newSelection = selectedServices.filter(s => s !== 'ALL');
      if (newSelection.includes(service)) {
        newSelection = newSelection.filter(s => s !== service);
      } else {
        newSelection.push(service);
      }
      if (newSelection.length === 0) newSelection = ['ALL'];
      setSelectedServices(newSelection);
    }
  };

  const filteredQueue = queue.filter(p => 
    p.status === 'Pending' && 
    p.recordStatus === 'Ready' &&
    (selectedServices.includes('ALL') || selectedServices.includes(p.serviceType))
  );

  const ClassificationBadge = ({ classification, size = 'sm' }) => {
    const configs = {
      'Senior Citizen': 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      'PWD': 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
      'Pregnant Women': 'bg-pink-500/10 text-pink-500 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.2)]',
      'Infants': 'bg-blue-400/10 text-blue-400 border-blue-400/20 shadow-[0_0_15px_rgba(96,165,250,0.2)]',
      'Breast Feeding Moms': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      'Immno Compromised Patients': 'bg-violet-500/10 text-violet-500 border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]',
      'CDH Employees': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      'Regular': 'bg-white/10 text-white border-white/10'
    };

    const config = configs[classification] || configs['Regular'];
    
    return (
      <span className={`px-4 py-1.5 rounded-xl border font-black uppercase tracking-[0.2em] whitespace-nowrap ${size === 'lg' ? 'text-xs' : 'text-[9px]'} ${config}`}>
        {classification}
      </span>
    );
  };

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col font-sans overflow-hidden">
        {/* Dynamic Scanline/Grid Effect for Fullscreen Console */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </div>
        
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] -z-0"></div>
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] -z-0"></div>

        <div className="flex-1 flex flex-col p-20 relative z-10">
          <header className="flex justify-between items-end mb-24">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(79,70,229,0.4)] animate-pulse">
                <Settings2 size={48} />
              </div>
              <div>
                <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Console <span className="text-indigo-500 not-italic">Setup</span></h1>
                <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-xs mt-4">System Initialization Protocol v2.0</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-700 font-black text-sm uppercase tracking-widest mb-1 italic">Link_Status</p>
              <p className="text-indigo-500 font-black text-2xl animate-pulse">ENCRYPTED_ONLINE</p>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-24 flex-1">
            <div className="space-y-12">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4">
                <span className="w-12 h-[1px] bg-indigo-500/30"></span>
                STATION_ASSIGNMENT
              </label>
              <div className="grid grid-cols-1 gap-6">
                {['Door 1', 'Door 2'].map(door => (
                  <button
                    key={door}
                    onClick={() => setSelectedDoor(door)}
                    className={`p-12 rounded-[3.5rem] border-2 text-3xl font-black transition-all duration-500 flex items-center justify-between group relative overflow-hidden ${
                      selectedDoor === door 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_60px_rgba(79,70,229,0.4)] scale-[1.02]' 
                        : 'bg-white/5 border-white/5 text-slate-600 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-8 relative z-10">
                      <DoorOpen size={40} className={selectedDoor === door ? 'text-white' : 'text-slate-800 group-hover:text-white transition-colors'} />
                      {door.toUpperCase()}
                    </div>
                    {selectedDoor === door && (
                      <div className="relative z-10 flex items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-200 italic">Primary_Active</span>
                        <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_20px_white] animate-ping"></div>
                      </div>
                    )}
                    {/* Interior glow for selected */}
                    {selectedDoor === door && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4">
                <span className="w-12 h-[1px] bg-indigo-500/30"></span>
                SERVICE_STREAM_SUBSCRIPTION
              </label>
              <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto p-8 scrollbar-hide bg-black/40 rounded-[3.5rem] border border-white/5 shadow-inner">
                <button
                  onClick={() => toggleService('ALL')}
                  className={`p-8 rounded-3xl border-2 text-left flex justify-between items-center transition-all duration-500 ${
                    selectedServices.includes('ALL')
                      ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]'
                      : 'bg-white/5 border-transparent text-slate-700 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="font-black text-lg uppercase tracking-[0.2em] italic">Subscribe_All_Streams</span>
                  {selectedServices.includes('ALL') && <Check size={24} strokeWidth={4} />}
                </button>
                {availableServices.length > 0 ? availableServices.map(service => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`p-7 rounded-2xl border-2 text-left flex justify-between items-center transition-all duration-500 ${
                      selectedServices.includes(service)
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-900/20'
                        : 'bg-white/5 border-transparent text-slate-700 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="font-black text-xs uppercase tracking-[0.2em] truncate max-w-[400px]">{service}</span>
                    {selectedServices.includes(service) && <Check size={20} strokeWidth={4} />}
                  </button>
                )) : (
                  <div className="p-20 text-center text-slate-800 text-xs font-black uppercase tracking-[0.5em] italic animate-pulse">Synchronizing_With_Emr_Core...</div>
                )}
              </div>
            </div>
          </div>

          <footer className="mt-24 grid grid-cols-1 lg:grid-cols-4 gap-10">
            <button 
              onClick={() => setIsConfigured(true)}
              className="lg:col-span-3 py-10 bg-white text-black rounded-[3rem] text-xl font-black uppercase tracking-[0.6em] hover:bg-indigo-500 hover:text-white transition-all duration-700 shadow-2xl hover:shadow-[0_0_100px_rgba(79,70,229,0.6)] transform hover:-translate-y-2 italic flex items-center justify-center gap-6"
            >
              INITIALIZE_STATION_RUNTIME <ArrowRight size={32} />
            </button>
            <button 
              onClick={handleLogout}
              className="py-10 bg-white/5 text-slate-700 border border-white/5 rounded-[3rem] font-black uppercase tracking-[0.4em] text-sm hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-500 flex items-center justify-center gap-4"
            >
              <LogOut size={24} /> TERMINATE
            </button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-slate-300 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent"></div>
      </div>

      <div className="bg-black/40 border-b border-white/5 sticky top-0 z-50 backdrop-blur-2xl">
        <header className="px-10 py-5 flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-5 hover:opacity-80 transition-all duration-500 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-400 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] group-hover:rotate-12 transition-transform duration-500">
              <Hospital size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">QURE <span className="text-indigo-500 not-italic">CONSOLE</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{selectedDoor} | ACTIVE_LINK</p>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hidden xl:flex">
               <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                 OPERATOR: <span className="text-white">{authUser?.actual_name || authUser?.user_name}</span>
               </span>
             </div>
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsConfigured(false)}
                 className="p-4 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50 rounded-2xl text-slate-400 hover:text-white transition-all duration-500 group"
                 title="System Configuration"
               >
                 <Settings2 size={20} className="group-hover:rotate-90 transition-transform duration-700" />
               </button>
               <button 
                 onClick={handleLogout}
                 className="p-4 bg-white/5 hover:bg-rose-600/20 border border-white/10 hover:border-rose-500/50 rounded-2xl text-slate-400 hover:text-rose-400 transition-all duration-500"
                 title="Terminate Session"
               >
                 <LogOut size={20} />
               </button>
             </div>
          </div>
        </header>
      </div>

      <main className="flex-1 p-10 flex flex-col gap-12 w-full overflow-y-auto scrollbar-hide">
        {/* Top Section: Live Sessions (Expanded Grid) */}
        <div className="w-full flex flex-col gap-8">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4">
               <span className="w-8 h-[1px] bg-indigo-500/30"></span>
               Live_Active_Sessions
               <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1 rounded-full text-[10px] font-black">{callingPatients.length}</span>
             </h2>
             {callingPatients.length > 0 && (
               <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">Monitor Link Stable</div>
             )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {callingPatients.map((p) => (
                <motion.div 
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3.5rem] p-10 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative overflow-hidden group border border-white/10"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                         <ClassificationBadge classification={p.classification} size="lg" />
                       </div>
                       <span className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.2em]">{p.serviceType}</span>
                    </div>
                    
                    <div className="text-[9rem] font-black mb-2 tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">{p.queueNumber}</div>
                    <div className="text-3xl font-black truncate mb-10 tracking-tight text-white/90">{p.patientName}</div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleComplete(p.id)}
                        className="flex-1 py-7 bg-white text-indigo-700 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-indigo-50 transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl group/btn"
                      >
                        <CheckCircle size={20} strokeWidth={3} className="group-hover/btn:scale-125 transition-transform" /> FINISH_SESSION
                      </button>
                      <button 
                        onClick={() => handleCall(p.id)}
                        className="p-7 bg-indigo-500/30 hover:bg-indigo-400/50 border border-white/20 rounded-[2rem] transition-all duration-500 flex items-center justify-center"
                        title="Re-broadcast"
                      >
                        <RefreshCcw size={22} className="hover:rotate-180 transition-transform duration-700" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Cyber-UI decorative element */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                </motion.div>
              ))}
              
              {callingPatients.length === 0 && (
                <div className="col-span-full p-32 text-center border-2 border-dashed border-white/5 rounded-[5rem] flex flex-col items-center bg-white/[0.01] backdrop-blur-sm group">
                  <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-slate-800 mb-8 group-hover:text-indigo-500 transition-colors duration-500 border border-white/5">
                    <Users size={48} />
                  </div>
                  <p className="text-slate-700 font-black uppercase tracking-[1em] text-xs">AWAITING_ACTIVE_PROTOCOL</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Section: Data Streams (Departmental Queues) */}
        <div className="w-full flex flex-col gap-10 pb-32">
          <div className="flex items-center justify-between bg-white/[0.03] p-10 rounded-[4rem] border border-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <Filter size={36} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">LIVE_QUEUE_STREAMS</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Direct System Feed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">AGGREGATE_PENDING</p>
              <p className="text-5xl font-black text-indigo-500 tracking-tighter">{filteredQueue.length}</p>
            </div>
          </div>

          <div className="overflow-x-auto pb-8 scrollbar-hide">
            <div className="flex gap-10 min-w-max px-2">
              {(selectedServices.includes('ALL') 
                ? [...new Set([...availableServices, ...queue.map(p => p.serviceType)])].sort() 
                : selectedServices
              ).map(service => {
                const serviceQueue = filteredQueue.filter(p => p.serviceType === service);
                if (serviceQueue.length === 0 && !selectedServices.includes(service)) return null;
                
                return (
                  <div key={service} className="w-[480px] flex flex-col bg-white/[0.01] rounded-[4.5rem] p-12 border border-white/5 backdrop-blur-3xl hover:bg-white/[0.03] transition-all duration-700">
                    <div className="flex items-center justify-between mb-12 px-2">
                      <div className="flex items-center gap-6">
                        <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)]"></div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white truncate max-w-[240px] italic">{service}</h3>
                      </div>
                      <span className="text-[11px] font-black bg-white/5 border border-white/10 px-5 py-2 rounded-2xl text-indigo-400 italic shadow-xl">{serviceQueue.length} PENDING</span>
                    </div>
                    
                    <div className="space-y-6 flex-1 overflow-y-visible">
                      <AnimatePresence mode="popLayout">
                        {serviceQueue.slice(0, 10).map((p) => (
                          <motion.div 
                            key={p.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-8 relative z-10">
                              <div className="flex-1">
                                <div className="mb-3">
                                  <ClassificationBadge classification={p.classification} />
                                </div>
                                <div className="text-7xl font-black text-white tracking-tighter mb-2 leading-none group-hover:text-indigo-400 transition-colors duration-500">{p.queueNumber}</div>
                                <div className="font-black text-slate-500 text-xs truncate max-w-[220px] uppercase italic tracking-wider">
                                  {p.patientName}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleCall(p.id)}
                                disabled={loading}
                                className="w-20 h-20 bg-white text-black rounded-[2rem] hover:bg-indigo-500 hover:text-white transition-all duration-500 shadow-2xl flex items-center justify-center group-hover:scale-110 active:scale-95 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]"
                              >
                                <Play size={28} fill="currentColor" />
                              </button>
                            </div>
                            {/* Card Accent */}
                            <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent"></div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {serviceQueue.length > 10 && (
                        <div className="text-center py-6">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic">+{serviceQueue.length - 10} MORE_IN_STREAM</p>
                        </div>
                      )}

                      {serviceQueue.length === 0 && (
                        <div className="py-40 text-center opacity-5">
                          <CheckCircle size={80} className="mx-auto mb-8" />
                          <p className="text-3xl font-black uppercase tracking-[0.4em] italic">CLEAR</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
