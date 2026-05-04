'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, CheckCircle, Clock, RefreshCcw, LogOut, DoorOpen, Settings2, Filter, Check, XCircle, Hospital, ArrowRight } from 'lucide-react';

function StaffContent() {
  const searchParams = useSearchParams();
  const [queue, setQueue] = useState([]);
  const [callingPatients, setCallingPatients] = useState([]); // Multiple active patients
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState('Door 1');
  const [selectedServices, setSelectedServices] = useState(['ALL']);
  const [availableServices, setAvailableServices] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [localVideos, setLocalVideos] = useState([]);

  const doorServices = {
    'Door 1': 'Surgery, ENT, Ortho, Urology, ABTC',
    'Door 2': 'Medical, Pediatrics, Nephro',
    'Door 3': 'OB-Gynecology',
    'Door 4': 'Ophthalmology, Dermatology',
    'Door 5': 'Psychiatry / Psych Cases'
  };

  const doorKeywords = {
    'Door 1': ['SURGERY', 'SURGICAL', 'ENT', 'ORTHO', 'UROLOGY', 'ABTC'],
    'Door 2': ['MEDICAL', 'PEDIATRIC', 'NEPHRO'],
    'Door 3': ['OB-GYNE', 'OBSTETRICS', 'GYNECOLOGY'],
    'Door 4': ['OPHTHAL', 'DERMA'],
    'Door 5': ['PSYCH']
  };

  const isRelevant = (serviceType, door) => {
    if (!serviceType) return false;
    const keywords = doorKeywords[door] || [];
    const type = serviceType.toUpperCase();
    return keywords.some(k => type.includes(k));
  };

  useEffect(() => {
    const doorParam = searchParams.get('door');
    if (doorParam) {
      const doorName = `Door ${doorParam}`;
      if (doorServices[doorName]) {
        setSelectedDoor(doorName);
        setSelectedServices(['ALL']); // Auto-subscribe to all relevant door services
        setIsConfigured(true);
      }
    }
  }, [searchParams]);

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
        const actives = data.filter(p => 
          p.status === 'Calling' && 
          p.door === selectedDoor && 
          isRelevant(p.serviceType, selectedDoor)
        );
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
      // Fetch current video URL
      const fetchSettings = async () => {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.video_url) setNewVideoUrl(data.video_url);
        
        // Fetch local video library
        const videoRes = await fetch('/api/videos');
        const videoData = await videoRes.json();
        if (Array.isArray(videoData)) setLocalVideos(videoData);
      };
      fetchSettings();
      const interval = setInterval(fetchQueue, 3000);
      return () => clearInterval(interval);
    }
  }, [isConfigured, selectedDoor]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'video_url', value: newVideoUrl }),
      });
      setIsSettingsOpen(false);
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

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
      alert('Failed to complete session');
    } finally {
      setLoading(false);
    }
  };

  const handleNoShow = async (id) => {
    setLoading(true);
    try {
      await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Skipped', door: null }),
      });
      fetchQueue();
    } catch (error) {
      alert('Failed to skip patient');
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
    isRelevant(p.serviceType, selectedDoor) &&
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
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Console...</p>
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
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">QURE <span className="text-indigo-500 not-italic">CONSOLE</span></h1>
                {(selectedDoor === 'Door 1' || selectedDoor === 'Door 2') && (
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                    Priority Queue Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-0.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">{selectedDoor}</p>
                </div>
                <div className="w-[1px] h-3 bg-white/10"></div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 truncate max-w-[400px]">{doorServices[selectedDoor]}</p>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-md hidden xl:flex shadow-2xl">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                 System Operator: <span className="text-white">{authUser?.actual_name || authUser?.user_name}</span>
               </span>
             </div>
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsSettingsOpen(true)}
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

      <main className="flex-1 px-10 py-6 flex flex-col gap-8 w-full overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Left Column: Live Sessions (3/4) */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4">
                 <span className="w-8 h-[1px] bg-indigo-500/30"></span>
                 Active Sessions
                 <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1 rounded-full text-[10px] font-black">{callingPatients.length}</span>
               </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {callingPatients.map((p) => (
                  <motion.div 
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 relative overflow-hidden group hover:bg-[#0f172a]/60 transition-all duration-500"
                  >
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                         <ClassificationBadge classification={p.classification} />
                         <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 italic">Calling</span>
                      </div>
                       <div className="flex items-center gap-6">
                         <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">{p.queueNumber}</div>
                            <div className="text-xl font-black text-white uppercase truncate tracking-tight">{p.patientName}</div>
                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate mt-1">{p.serviceType}</div>
                         </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
                         <button onClick={() => handleComplete(p.id)} disabled={loading} className="col-span-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"><CheckCircle size={14} /> FINISH</button>
                         <button onClick={() => handleNoShow(p.id)} disabled={loading} className="py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl font-black text-[9px] uppercase transition-all flex items-center justify-center" title="Not Present"><XCircle size={16} /></button>
                         <button onClick={() => handleCall(p.id)} disabled={loading} className="py-3 bg-white/5 hover:bg-indigo-500 text-zinc-400 hover:text-white rounded-xl font-black text-[9px] uppercase transition-all flex items-center justify-center" title="Re-broadcast"><RefreshCcw size={16} /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {callingPatients.length === 0 && (
                  <div className="col-span-full py-16 text-center border border-dashed border-white/5 rounded-3xl flex flex-col items-center bg-white/[0.01]">
                    <p className="text-slate-700 font-black uppercase tracking-[0.6em] text-[10px]">No active sessions</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Skipped Patients Archive (1/4) */}
          <div className="flex flex-col gap-8 bg-black/20 border border-white/5 rounded-[3rem] p-6 backdrop-blur-sm">
             <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4">
               Missed Calls
               <span className="bg-white/5 text-slate-400 border border-white/5 px-3 py-0.5 rounded-full text-[9px] font-black">{queue.filter(p => p.status === 'Skipped' && isRelevant(p.serviceType, selectedDoor)).length}</span>
             </h2>
            
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {queue.filter(p => p.status === 'Skipped' && isRelevant(p.serviceType, selectedDoor)).map((p) => (
                  <motion.div 
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white/[0.03] p-5 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-rose-500/40 hover:bg-white/[0.06] transition-all duration-500 relative overflow-hidden"
                  >
                     <div className="min-w-0 relative z-10">
                       <div className="text-2xl font-black text-white tracking-tighter mb-1 leading-none group-hover:text-indigo-400 transition-colors duration-500">{p.queueNumber}</div>
                       <div className="text-[9px] font-black text-slate-500 uppercase truncate max-w-[120px] italic">{p.patientName}</div>
                    </div>
                    <button 
                      onClick={() => handleCall(p.id)}
                      disabled={loading}
                      className="w-14 h-14 bg-white/5 group-hover:bg-rose-500 text-zinc-400 group-hover:text-white rounded-2xl transition-all duration-500 shadow-xl flex items-center justify-center relative z-10"
                      title="Recall Patient"
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                     <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
                  </motion.div>
                ))}
                {queue.filter(p => p.status === 'Skipped' && isRelevant(p.serviceType, selectedDoor)).length === 0 && (
                  <div className="py-20 text-center opacity-10">
                    <Clock size={32} className="mx-auto mb-4" />
                    <p className="text-[8px] font-black uppercase tracking-widest">No missed calls</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Section: Data Streams (Departmental Queues) */}
        <div className="w-full flex flex-col gap-6 pb-20">
          <div className="flex items-center justify-between bg-white/[0.02] px-8 py-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <Filter size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Queue Streams</h2>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1">Direct System Feed</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div className="w-px h-10 bg-white/5 mx-4 hidden md:block"></div>
              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-0.5">Aggregate Pending</p>
                <div className="flex items-center justify-end gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <p className="text-4xl font-black text-white tracking-tighter">{filteredQueue.length}</p>
                </div>
              </div>
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
                  <div key={service} className="w-[380px] flex flex-col bg-white/[0.01] rounded-[3rem] p-8 border border-white/5 backdrop-blur-3xl hover:bg-white/[0.02] transition-all duration-700">
                    <div className="flex items-center justify-between mb-8 px-2">
                      <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]"></div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white truncate max-w-[180px] italic">{service}</h3>
                      </div>
                      <span className="text-[9px] font-black bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl text-indigo-400 italic">{serviceQueue.length} PENDING</span>
                    </div>
                    
                    <div className="space-y-3 flex-1 overflow-y-visible">
                      <AnimatePresence mode="popLayout">
                        {serviceQueue.slice(0, 10).map((p) => (
                          <motion.div 
                            key={p.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-4 relative z-10">
                              <div className="flex-1 min-w-0">
                                <div className="text-2xl font-black text-white tracking-tighter mb-0.5 leading-none group-hover:text-indigo-400 transition-colors duration-500">{p.queueNumber}</div>
                                <div className="font-black text-slate-500 text-[10px] truncate uppercase italic tracking-wider">
                                  {p.patientName}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleCall(p.id)}
                                disabled={loading}
                                className="w-12 h-12 bg-white/5 text-white rounded-xl hover:bg-white hover:text-black transition-all duration-500 flex items-center justify-center group-hover:scale-105"
                              >
                                <Play size={18} fill="currentColor" />
                              </button>
                            </div>
                            <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent"></div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {serviceQueue.length > 10 && (
                        <div className="text-center py-6">
                           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic">+{serviceQueue.length - 10} more in stream</p>
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

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-[3rem] p-12 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <Settings2 size={160} />
              </div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-10 flex items-center justify-between">
                   <div>
                      <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Display Console</h2>
                      <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Media & Broadcast Infrastructure</p>
                   </div>
                   <button 
                      onClick={() => { setNewVideoUrl('PLAYLIST_ALL'); handleSaveSettings(); }}
                      className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-4"
                   >
                      <Play size={16} fill="currentColor" /> Play All Local Media
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                  <div className="space-y-12">
                    {/* Local Video Library */}
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                         <label className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] ml-2">Local Media Library</label>
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{localVideos.length} Files Found</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6">
                        {localVideos.map((video) => (
                           <button 
                             key={video.url}
                             onClick={() => setNewVideoUrl(video.url)}
                             className={`group relative aspect-video rounded-3xl overflow-hidden border-2 transition-all duration-500 ${newVideoUrl === video.url ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-white/10 hover:border-white/30'}`}
                           >
                             <video 
                               src={video.url} 
                               className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                               onMouseEnter={e => e.target.play()}
                               onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                               muted
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                             <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                                <span className="text-[10px] font-black text-white uppercase tracking-wider truncate mr-4">{video.name}</span>
                                {newVideoUrl === video.url && (
                                   <div className="shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                                      <Check size={14} strokeWidth={4} />
                                   </div>
                                )}
                             </div>
                           </button>
                        ))}
                        {localVideos.length === 0 && (
                           <div className="col-span-full py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center opacity-40">
                              <Play size={32} className="mb-4" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-center">No local videos found in /public folder</p>
                           </div>
                        )}
                      </div>
                    </div>

                    {/* Advanced Source */}
                    <div className="flex flex-col gap-6">
                      <label className="text-xs font-black text-amber-400 uppercase tracking-[0.4em] ml-2">External Stream Source (YouTube)</label>
                      <div className="relative group">
                        <input 
                          type="text" 
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          placeholder="Paste YouTube embed URL here..."
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-5 text-white font-medium focus:outline-none focus:border-amber-500/50 transition-all group-hover:bg-black/60"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 mt-10 border-t border-white/5 flex items-center gap-6">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
                  >
                    {isSaving ? 'Synchronizing_Broadcast...' : 'Push Configuration to Display'}
                  </button>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-12 bg-white/5 hover:bg-white/10 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-black uppercase tracking-widest">Initializing_System...</div>}>
      <StaffContent />
    </Suspense>
  );
}
