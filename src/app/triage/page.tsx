'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, UserPlus, CheckCircle, Hospital, ArrowRight,
  RefreshCcw, LayoutGrid, ListFilter, Clock, Printer,
  X, LogOut, ShieldCheck, Check
} from 'lucide-react';

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
    const d = new Date();
    const z = d.getTimezoneOffset() * 60 * 1000;
    const local = new Date(d - z);
    return local.toISOString().split('T')[0];
  }); // Default to local YYYY-MM-DD

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
    } catch (e) { }
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
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.serviceType?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none"></div>

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
      <div className="bg-black/40 border-b border-white/5 sticky top-0 z-50 backdrop-blur-2xl">
        <header className="max-w-screen-2xl mx-auto px-10 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-6 hover:opacity-80 transition-all group">
            <div className="relative">
              <div className="absolute -inset-2 bg-indigo-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-xl">
                <Hospital size={26} className="text-indigo-500" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white italic">QURE <span className="text-indigo-500">TRIAGE</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Live EMR Uplink Active</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <label className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.4em] mb-2">Clinic Operations Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-2 text-xs font-bold text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer hover:bg-white/10"
              />
            </div>

            <div className="h-10 w-px bg-white/5"></div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden xl:block">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Triage Officer</p>
                <p className="text-xs font-black text-white uppercase tracking-tighter">{authUser?.actual_name || authUser?.user_name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-3.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-2xl text-zinc-500 hover:text-red-500 transition-all duration-500 group"
                title="Secure Logout"
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <button
                onClick={fetchEmrList}
                disabled={loading}
                className="p-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white transition-all duration-500 shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                <RefreshCcw size={22} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </header>
      </div>

      <main className="max-w-screen-2xl mx-auto px-10 py-10 flex gap-10 overflow-hidden flex-1">
        <div className="flex-1 flex flex-col gap-8">
          <section className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h2 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-1 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                  Clinical Registration
                </h2>
                <p className="text-3xl font-black text-white italic tracking-tighter">PATIENT SELECTION</p>
              </div>
              <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {filteredList.length} <span className="text-zinc-700 mx-1">/</span> Records Found
              </div>
            </div>

            <div className="relative group mb-10">
              <div className="absolute inset-0 bg-indigo-600/5 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" size={28} />
              <input
                type="text"
                placeholder="Search patient name, hospital ID, or clinic department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-20 pr-10 py-8 bg-white/5 border border-white/10 rounded-[2rem] text-2xl font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all duration-500 placeholder:text-zinc-700"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-4 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {!error && filteredList.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.02 }}
                    className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between hover:bg-white/[0.06] hover:border-indigo-500/30 group transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity">
                      <UserPlus size={100} />
                    </div>

                    <div className="flex items-center gap-8 relative z-10">
                      <div className="w-20 h-20 bg-black/40 rounded-3xl flex items-center justify-center text-indigo-500 font-black text-3xl border border-white/5 group-hover:border-indigo-500/50 transition-colors shadow-2xl">
                        {p.patientName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-3xl font-black text-white italic tracking-tighter group-hover:text-indigo-400 transition-colors">{p.patientName}</div>
                        <div className="flex items-center gap-5 mt-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                            {p.serviceType}
                          </span>
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                            HPER: {p.patientId}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                            <Clock size={12} className="text-indigo-500/50" />
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
                      className="relative px-10 py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-indigo-500 hover:text-white transition-all duration-500 shadow-xl group/btn active:scale-95"
                    >
                      Process Assignment <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Status Display */}
        <div className="w-96 flex flex-col gap-8">
          <div className="flex flex-col mb-2">
            <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Command Feedback
            </h3>
            <p className="text-2xl font-black text-white italic tracking-tighter uppercase">Last Processed</p>
          </div>

          <AnimatePresence mode="wait">
            {lastQueued ? (
              <motion.div
                key={lastQueued.id}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -30 }}
                className="bg-white rounded-[3rem] p-12 text-black shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                  <CheckCircle size={180} />
                </div>

                <div className="relative z-10 text-center">
                  <div className="inline-flex p-4 bg-emerald-500 text-white rounded-[1.5rem] mb-10 shadow-xl shadow-emerald-500/30">
                    <CheckCircle size={32} />
                  </div>
                  <p className="text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px] mb-6">Patient Successfully Assigned</p>

                  <div className="mb-8">
                    <h3 className="text-7xl font-black tracking-tighter italic leading-none mb-4">
                      {lastQueued.queueNumber}
                    </h3>
                    <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
                  </div>

                  <p className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-10">{lastQueued.patientName}</p>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-5 bg-black text-white rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all duration-300 active:scale-95"
                  >
                    <Printer size={20} /> Force Re-Print Stub
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 opacity-30"
              >
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8">
                  <LayoutGrid size={32} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] leading-relaxed">System Ready<br />Awaiting Transaction</p>
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
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 border border-white/10 p-12"
            >
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Assign Classification</h2>
                  <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em]">{selectedPatient?.patientName}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/5 rounded-2xl transition-colors text-zinc-500">
                  <X size={32} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {classifications.map(c => {
                  const isRegular = c === 'Regular';
                  return (
                    <button
                      key={c}
                      disabled={loading}
                      onClick={() => addToQueue(c)}
                      className={`group relative p-8 rounded-[2rem] text-left border-2 transition-all duration-500 overflow-hidden active:scale-95 ${isRegular
                          ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                          : 'bg-indigo-600/10 border-indigo-600/20 hover:bg-indigo-600 hover:border-indigo-600'
                        }`}
                    >
                      <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isRegular ? 'text-zinc-500' : 'text-indigo-400 group-hover:text-indigo-200'}`}>
                        {isRegular ? 'Standard Queue' : 'Priority Access'}
                      </div>
                      <div className={`text-xl font-black italic tracking-tighter uppercase ${isRegular ? 'text-white' : 'text-indigo-500 group-hover:text-white'}`}>
                        {c}
                      </div>

                      {!isRegular && (
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                          <ShieldCheck size={40} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Note: Priority assignments automatically receive a 'P-' designation.</p>
              </div>

              {loading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md">
                  <div className="flex flex-col items-center gap-6">
                    <RefreshCcw size={60} className="text-indigo-500 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-[0.5em] text-white animate-pulse">Processing_Queue_Entry...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
