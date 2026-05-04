'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Printer, CheckCircle, Search, ShieldCheck, LogOut, Clock, LayoutGrid, Check, ArrowRight } from 'lucide-react';

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [confirming, setConfirming] = useState(null); // { id, type, title, message, action }

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const newRecords = data.records || [];
      setRecords(newRecords);
    } catch (error) {
      console.error('Failed to fetch records data');
    }
  };

  useEffect(() => {
    // SSE Connection
    const eventSource = new EventSource('/api/events');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && Array.isArray(data)) {
          setRecords(data);
        }
      } catch (err) {
        console.error('SSE Error:', err);
      }
    };

    fetchData(); // Initial load
    return () => eventSource.close();
  }, [authUser]);

  const handleMarkPrinted = (id) => {
    setConfirming({
      id,
      type: 'print',
      title: 'Confirm Print',
      message: 'Are you sure this document is already printed?',
      action: async () => {
        const idToProcess = id;
        // Optimistic Update
        const updatedRecords = records.map(r => 
          Number(r.id) === Number(idToProcess) ? { ...r, recordStatus: 'Printed', recordRetrievedBy: authUser?.user_name } : r
        );
        setRecords(updatedRecords);
        setLoading(true);

        try {
          const res = await fetch('/api/records', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: idToProcess, 
              recordStatus: 'Printed',
              recordRetrievedBy: authUser?.user_name
            }),
          });
          
          if (!res.ok) throw new Error('API update failed');
          await fetchData();
        } catch (error) {
          console.error('Update failed:', error);
          alert('Failed to update record: ' + error.message);
          await fetchData();
        } finally {
          setLoading(false);
          setConfirming(null);
        }
      }
    });
  };

  const handleMarkReady = (id) => {
    setConfirming({
      id,
      type: 'retrieve',
      title: 'Confirm Retrieval',
      message: 'Are you sure this document has been retrieved?',
      action: async () => {
        const idToProcess = id;
        // Optimistic Update
        const updatedRecords = records.map(r => 
          Number(r.id) === Number(idToProcess) ? { ...r, recordStatus: 'Ready' } : r
        );
        setRecords(updatedRecords);
        setLoading(true);

        try {
          const res = await fetch('/api/records', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: idToProcess, 
              recordStatus: 'Ready',
              recordRetrievedBy: authUser?.user_name
            }),
          });
          
          if (!res.ok) throw new Error('API update failed');
          await fetchData();
        } catch (error) {
          console.error('Update failed:', error);
          alert('Failed to update record: ' + error.message);
          await fetchData();
        } finally {
          setLoading(false);
          setConfirming(null);
        }
      }
    });
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

  // Filter out completed/no-show patients first
  const activeRecords = filteredRecords.filter(r => {
    const qStat = (r.status || '').trim();
    return qStat !== 'Completed' && qStat !== 'No Show';
  });

  // Split lists for the dual-column view
  const pendingQueue = activeRecords.filter(r => {
    const rStat = (r.recordStatus || '').trim();
    return rStat === 'Pending' || rStat === '';
  });

  const retrievalHub = activeRecords.filter(r => {
    const rStat = (r.recordStatus || '').trim();
    return rStat === 'Printed';
  });

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirming && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirming(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                 {confirming.type === 'print' ? <Printer size={150} /> : <CheckCircle size={150} />}
              </div>

              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">{confirming.title}</h3>
                <p className="text-zinc-400 font-bold text-sm leading-relaxed mb-10">{confirming.message}</p>
                
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setConfirming(null)}
                     className="py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={() => confirming.action()}
                     className="py-5 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
                   >
                     Yes, Confirm
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="bg-black/40 border-b border-white/5 sticky top-0 z-50 backdrop-blur-2xl">
        <header className="max-w-screen-2xl mx-auto px-10 py-6 flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-6 hover:opacity-80 transition-all group">
            <div className="relative">
              <div className="absolute -inset-2 bg-emerald-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-xl">
                <FileText size={26} className="text-emerald-500" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white italic uppercase">QURE <span className="text-emerald-500">RECORDS</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Logistics Node Active</p>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-8">
             <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hidden md:block">
               Authenticated: {authUser?.actual_name || authUser?.user_name}
             </div>
             <button 
               onClick={handleLogout}
               className="p-3.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-2xl text-zinc-500 hover:text-red-500 transition-all duration-500"
               title="Secure Logout"
             >
               <LogOut size={20} />
             </button>
          </div>
        </header>
      </div>

      <main className="max-w-screen-2xl mx-auto p-10 flex gap-10 flex-1 overflow-hidden">
        {/* Lane 1: Intake Queue */}
        <div className="flex-1 flex flex-col gap-8 h-full">
           <div className="flex items-center justify-between">
             <div className="flex flex-col">
               <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 Intake Queue
               </h2>
               <p className="text-3xl font-black text-white italic tracking-tighter uppercase">Pending Charts</p>
             </div>
             <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={16} />
               <input 
                 type="text"
                 placeholder="Search..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl w-48 text-white focus:border-emerald-500/50 outline-none transition-all font-bold text-[10px]"
               />
             </div>
           </div>

           <div className="flex-1 overflow-y-auto pr-4 space-y-4 scrollbar-hide">
             <AnimatePresence mode="popLayout">
               {pendingQueue.map((p, idx) => (
                 <motion.div 
                   key={p.id}
                   layout
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-500"
                 >
                   <div className="flex items-center gap-6">
                      <div className="text-4xl font-black text-white italic tracking-tighter w-24 group-hover:text-emerald-500 transition-colors">{p.queueNumber}</div>
                      <div>
                         <div className="font-black text-white text-lg italic tracking-tight mb-1 flex items-center gap-3">
                           {p.patientName}
                           {p.status === 'Calling' && (
                             <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
                           )}
                         </div>
                         <div className="flex items-center gap-3">
                           <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">HPER: {p.hpercode || 'N/A'}</span>
                           <span className="text-[9px] font-black text-emerald-500/30 uppercase tracking-widest">{p.serviceType}</span>
                         </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleMarkPrinted(p.id)}
                     disabled={loading}
                     className="p-5 bg-white text-black rounded-2xl hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-xl active:scale-95"
                   >
                     <Printer size={20} />
                   </button>
                 </motion.div>
               ))}
               {pendingQueue.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-10">
                   <LayoutGrid size={60} />
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4">Queue_Clear</p>
                 </div>
               )}
             </AnimatePresence>
           </div>
        </div>

        {/* Lane 2: Retrieval Hub */}
        <div className="flex-1 flex flex-col gap-8 h-full">
           <div className="flex items-center justify-between">
             <div className="flex flex-col">
               <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                 Retrieval Hub
               </h2>
               <p className="text-3xl font-black text-white italic tracking-tighter uppercase">Printed & Ready</p>
             </div>
             <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                <Clock size={14} className="text-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Action Required</span>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto pr-4 space-y-4 scrollbar-hide">
             <AnimatePresence mode="popLayout">
               {retrievalHub.map((p, idx) => (
                 <motion.div 
                   key={p.id}
                   layout
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.9, x: 40 }}
                   className="bg-amber-500/5 p-6 rounded-[2rem] border border-amber-500/20 flex items-center justify-between group hover:bg-amber-500/10 transition-all duration-500"
                 >
                   <div className="flex items-center gap-6">
                      <div className="text-4xl font-black text-amber-500 italic tracking-tighter w-24">{p.queueNumber}</div>
                      <div>
                         <div className="font-black text-white text-lg italic tracking-tight mb-1">{p.patientName}</div>
                         <div className="flex items-center gap-3">
                           <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Node: {p.recordRetrievedBy}</span>
                           <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest italic">Awaiting Retrieval</span>
                         </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleMarkReady(p.id)}
                     disabled={loading}
                     className="px-6 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all duration-500 shadow-xl shadow-amber-500/20 active:scale-95"
                   >
                     Complete
                   </button>
                 </motion.div>
               ))}
               {retrievalHub.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-[0.03]">
                   <FileText size={100} />
                 </div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </main>
    </div>
  );
}
