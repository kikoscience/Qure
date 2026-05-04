'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Printer, CheckCircle, Search, ShieldCheck, LogOut, Clock } from 'lucide-react';

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      // First verify auth
      if (!authUser) {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (authData.authenticated) {
          setAuthUser(authData.user);
        } else {
          router.push('/login');
          return;
        }
      }

      const res = await fetch('/api/records');
      const data = await res.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error('Failed to fetch records data');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, [authUser]);

  const handleMarkPrinted = async (id) => {
    if (!authUser) return;
    setLoading(true);
    try {
      await fetch('/api/records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          recordStatus: 'Printed',
          recordRetrievedBy: authUser.user_name
        }),
      });
      fetchData();
    } catch (error) {
      alert('Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async (id) => {
    if (!authUser) return;
    setLoading(true);
    try {
      await fetch('/api/records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          recordStatus: 'Ready',
          recordRetrievedBy: authUser.user_name
        }),
      });
      fetchData();
    } catch (error) {
      alert('Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const filteredRecords = records.filter(p => 
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.queueNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.hpercode?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingRecords = filteredRecords.filter(r => r.recordStatus === 'Pending' || !r.recordStatus);
  const retrievalRecords = filteredRecords.filter(r => r.recordStatus === 'Printed' || r.recordStatus === 'Ready');

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-emerald-100">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <header className="px-10 py-5 flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <FileText size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900"><span className="text-emerald-600">Qure</span> | Records Portal</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Chart Management Center</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 hidden md:block">
               Officer: {authUser?.actual_name || authUser?.user_name}
             </div>
             <button 
               onClick={handleLogout}
               className="p-3 bg-slate-50 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all duration-300"
               title="Logout"
             >
               <LogOut size={20} />
             </button>
          </div>
        </header>
      </div>

      <main className="flex-1 p-10 grid grid-cols-12 gap-10 w-full">
        {/* Left: Pending Requests */}
        <div className="col-span-12 xl:col-span-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
             <div>
               <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                 Pending Requests <span className="bg-emerald-100 text-emerald-600 px-4 py-1 rounded-full text-xs">{pendingRecords.length}</span>
               </h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">New calls requiring record retrieval</p>
             </div>
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text"
                 placeholder="Search charts..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-64 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-bold text-sm"
               />
             </div>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-4 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {pendingRecords.map((p) => (
                <motion.div 
                  key={p.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-500 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="text-6xl font-black text-slate-900 w-44 tracking-tighter group-hover:text-emerald-600 transition-colors duration-500">{p.queueNumber}</div>
                      <div className="h-16 w-[1px] bg-slate-100"></div>
                      <div>
                         <div className="font-black text-slate-900 text-xl flex items-center gap-4">
                           {p.patientName}
                           {p.classification !== 'Regular' && (
                             <span className="px-4 py-1 bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-rose-200">{p.classification}</span>
                           )}
                         </div>
                         <div className="flex items-center gap-4 mt-3">
                           <span className="text-sm font-black text-slate-500 tracking-widest uppercase bg-slate-50 px-4 py-1 rounded-lg border border-slate-200">ID: {p.hpercode || 'N/A'}</span>
                           <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                             {p.serviceType}
                           </span>
                         </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleMarkPrinted(p.id)}
                      disabled={loading}
                      className="p-6 bg-slate-900 text-white rounded-3xl hover:bg-emerald-600 transition-all shadow-xl hover:scale-105 active:scale-95 group-hover:shadow-emerald-200"
                      title="Mark as Printed"
                    >
                      <Printer size={24} />
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {pendingRecords.length === 0 && (
                <div className="p-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">All Records Processed</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Retrieval Area */}
        <div className="col-span-12 xl:col-span-6 flex flex-col h-full">
           <div className="flex items-center justify-between mb-10">
             <div>
               <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                 Retrieval Pipeline <span className="bg-slate-200 text-slate-600 px-4 py-1 rounded-full text-xs">{retrievalRecords.length}</span>
               </h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Charts currently in transition</p>
             </div>
             <div className="flex items-center gap-3">
               <ShieldCheck className="text-emerald-500" size={24} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Retrieval</span>
             </div>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-4 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {retrievalRecords.map((p) => (
                <motion.div 
                  key={p.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-8 rounded-[2.5rem] border transition-all duration-500 group flex items-center justify-between ${
                    p.recordStatus === 'Ready' 
                    ? 'bg-emerald-50 border-emerald-100 shadow-xl shadow-emerald-100/50' 
                    : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-8">
                    <div className="text-6xl font-black text-slate-900 w-44 tracking-tighter">{p.queueNumber}</div>
                    <div>
                       <div className="font-black text-slate-900 text-xl">{p.patientName}</div>
                       <div className="flex items-center gap-3 mt-3">
                         <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                           p.recordStatus === 'Ready' 
                           ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                           : 'bg-amber-100 text-amber-700 border border-amber-200'
                         }`}>
                           {p.recordStatus === 'Ready' ? <CheckCircle size={12} /> : <Clock size={12} />}
                           {p.recordStatus === 'Ready' ? 'CHART_READY' : 'SEARCHING_FILES'}
                         </span>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">BY: {p.recordRetrievedBy}</span>
                       </div>
                    </div>
                  </div>
                  
                  {p.recordStatus !== 'Ready' && (
                    <button 
                      onClick={() => handleMarkReady(p.id)}
                      disabled={loading}
                      className="px-8 py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl hover:scale-105"
                    >
                      Chart Ready
                    </button>
                  )}
                </motion.div>
              ))}
              
              {retrievalRecords.length === 0 && (
                <div className="p-32 text-center opacity-10">
                   <FileText size={64} className="mx-auto" />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
