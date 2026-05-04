'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, CheckCircle, Hospital, ArrowRight, RefreshCcw, LayoutGrid, ListFilter, Clock, Printer, X, LogOut } from 'lucide-react';

export default function TriagePage() {
  const [emrList, setEmrList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastQueued, setLastQueued] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  }); // Default to YYYY-MM-DD for native picker

  const maskName = (name) => {
    if (!name) return '';
    return name.split(' ').map(word => {
      if (word.length <= 1) return word;
      return word.charAt(0) + '*'.repeat(word.length - 1);
    }).join(' ');
  };

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

  const classifications = [
    'Regular', 'Senior Citizen', 'Pregnant Women', 'PWD', 
    'Breast Feeding Moms', 'Infants', 'Immno Compromised Patients', 'CDH Employees'
  ];

  const fetchEmrList = async () => {
    setLoading(true);
    setError(null);
    try {
      // Format YYYY-MM-DD to MM-DD-YYYY for the API
      const [y, m, d] = selectedDate.split('-');
      const apiDate = `${m}-${d}-${y}`;
      
      const res = await fetch(`/api/emr?date=${apiDate}`); 
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEmrList(data);
    } catch (error) {
      console.error('Fetch failed', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  useEffect(() => {
    fetchEmrList();
  }, [selectedDate]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const addToQueue = async (classification) => {
    setLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientName: selectedPatient.patientName, 
          serviceType: selectedPatient.serviceType,
          classification: classification,
          emrId: selectedPatient.id,
          hpercode: selectedPatient.patientId
        }),
      });
      const data = await res.json();
      setLastQueued(data);
      setIsModalOpen(false);
      setSelectedPatient(null);
      await fetchEmrList();
      
      // Auto print trigger
      setTimeout(() => window.print(), 500);
    } catch (error) {
      alert('Failed to queue patient');
    } finally {
      setLoading(false);
    }
  };

  const filteredList = Array.isArray(emrList) ? emrList.filter(p => 
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.serviceType.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* Print Overlay (Only visible when printing) */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-ticket, #print-ticket * { visibility: visible; }
          #print-ticket { position: absolute; left: 0; top: 0; width: 80mm; padding: 10px; }
        }
      `}</style>

      {lastQueued && (
        <div id="print-ticket" className="hidden print:block text-center font-mono">
          {/* Patient Stub */}
          <div className="mb-10 pb-10 border-b-2 border-dashed border-black">
            <h2 className="text-sm font-bold uppercase leading-tight">Conner District Hospital</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Patient Stub</p>
            <hr className="my-2 border-dashed border-black" />
            <h3 className="text-6xl font-black my-4">{lastQueued.queueNumber}</h3>
            <p className="text-sm font-bold uppercase">{lastQueued.classification}</p>
            <hr className="my-2 border-dashed border-black" />
            <p className="text-lg font-bold">{maskName(lastQueued.patientName)}</p>
            <p className="text-xs">{lastQueued.serviceType}</p>
            <p className="text-[8px] mt-4 font-bold">{new Date().toLocaleString()}</p>
            <p className="text-[8px] mt-2 italic font-bold">--- CUT HERE ---</p>
          </div>

          {/* Records Attachment */}
          <div className="mt-4">
            <h2 className="text-sm font-bold uppercase leading-tight">Conner District Hospital</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Records Attachment</p>
            <hr className="my-2 border-dashed border-black" />
            <h3 className="text-6xl font-black my-4">{lastQueued.queueNumber}</h3>
            <p className="text-sm font-bold uppercase">{lastQueued.classification}</p>
            <hr className="my-2 border-dashed border-black" />
            <p className="text-lg font-bold">{maskName(lastQueued.patientName)}</p>
            <p className="text-[9px] font-bold">ID: {lastQueued.hpercode}</p>
            <p className="text-xs">{lastQueued.serviceType}</p>
            <p className="text-[8px] mt-4 font-bold">{new Date().toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Qure Standard Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <header className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Hospital size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900"><span className="text-indigo-600">Qure</span> | Triage</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Live EMR Connection</p>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-4">
               <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Clinic Date</label>
               <input 
                 type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none focus:border-indigo-600 transition-all cursor-pointer"
               />
             </div>
             <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100 hidden md:block">
               {authUser?.actual_name || authUser?.user_name}
             </div>
             <button 
               onClick={handleLogout}
               className="p-3 bg-slate-50 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all duration-300 flex items-center gap-2"
               title="Logout"
             >
               <LogOut size={20} />
             </button>
             <button 
              onClick={fetchEmrList}
              disabled={loading}
              className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-indigo-500 hover:text-indigo-600 transition-all duration-300"
            >
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <ListFilter size={16} /> Patient Selection
               </h2>
               <div className="text-xs font-bold text-slate-400">
                 {filteredList.length} patients available for queueing
               </div>
            </div>
            
            <div className="relative group mb-8">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
              <input 
                type="text"
                placeholder="Search patient name, HPER code, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-white border border-slate-200 rounded-3xl text-xl font-medium outline-none shadow-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all duration-300"
              />
            </div>

            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {!error && filteredList.map((p, idx) => (
                  <motion.div 
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: idx * 0.03 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center justify-between hover:border-indigo-600 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-black text-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-500">
                        {p.patientName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900 tracking-tight">{p.patientName}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {p.serviceType}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            ID: {p.patientId}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 border-l border-slate-200 pl-3">
                            <Clock size={10} />
                            {new Date(p.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedPatient(p);
                        setIsModalOpen(true);
                      }}
                      className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-slate-200"
                    >
                      Assign Number <ArrowRight size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Status Display */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <AnimatePresence>
            {lastQueued && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden"
              >
                <div className="relative z-10 text-center">
                  <div className="inline-flex p-3 bg-green-500 rounded-xl mb-6">
                     <CheckCircle size={24} />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Patient Queued Successfully</p>
                  <h3 className="text-8xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                    {lastQueued.queueNumber}
                  </h3>
                  <p className="text-xl font-bold mb-8 text-white">{lastQueued.patientName}</p>
                  <button 
                    onClick={() => window.print()}
                    className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all"
                  >
                    <Printer size={18} /> Print Ticket Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Classification Picker Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                   <h2 className="text-xl font-black text-slate-900">Select Classification</h2>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedPatient?.patientName}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 grid grid-cols-2 gap-4">
                {classifications.map(c => (
                  <button
                    key={c}
                    disabled={loading}
                    onClick={() => addToQueue(c)}
                    className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300"
                  >
                    {c}
                  </button>
                ))}
              </div>
              {loading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                   <RefreshCcw size={40} className="text-indigo-600 animate-spin" />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
