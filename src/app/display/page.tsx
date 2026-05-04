'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, Users, Clock, Hospital, Bell, DoorOpen, 
  LayoutGrid, UserCheck, ArrowRight, ShieldCheck, 
  Activity, Zap, Info, MapPin, Search
} from 'lucide-react';

export default function DisplayPage() {
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1&mute=1&loop=1&playlist=5qap5aO4i9A&controls=0&showinfo=0&rel=0&modestbranding=1");
  const [videoList, setVideoList] = useState([]);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const prevStatesRef = useRef([]);

  const staticDoors = ['Door 1', 'Door 2', 'Door 3', 'Door 4', 'Door 5'];
  const doorServices = {
    'Door 1': 'Surgery, ENT, Ortho, Urology, ABTC',
    'Door 2': 'Medical, Pediatrics, Nephro',
    'Door 3': 'OB-Gynecology',
    'Door 4': 'Ophthalmology, Dermatology',
    'Door 5': 'Psychiatry / Psych Cases'
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`;
    }
    return url;
  };

  const maskName = (name) => {
    if (!name) return '';
    return name.split(' ').map(word => {
      if (word.length <= 1) return word;
      return word.charAt(0) + '*'.repeat(word.length - 1);
    }).join(' ');
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const processData = (data) => {
      if (Array.isArray(data)) {
        setQueue(data);
        const serving = data.filter(p => p.status === 'Calling' && p.door);
        const currentStates = serving.map(p => `${p.id}|${p.updatedAt || ''}`);
        const prevStates = prevStatesRef.current;
        const newStates = currentStates.filter(state => !prevStates.includes(state));
        
        if (newStates.length > 0 && prevStates.length > 0) {
           if ('speechSynthesis' in window) {
               window.speechSynthesis.cancel();
           }
           newStates.forEach(state => {
               const id = parseInt(state.split('|')[0], 10);
               const p = serving.find(x => x.id === id);
               if (p && 'speechSynthesis' in window) {
                   setIsSpeaking(true);
                   const safeNumber = p.queueNumber.replace(/-/g, ' ');
                   const msg = new SpeechSynthesisUtterance(`Calling patient number ${safeNumber}, to ${p.door}`);
                   msg.rate = 0.85;
                   msg.pitch = 1.1;
                   msg.onend = () => setIsSpeaking(false);
                   window.speechSynthesis.speak(msg);
               }
           });
        }
        prevStatesRef.current = currentStates;
        setNowServing(serving);
        setUpcoming(data.filter(p => p.status === 'Pending').slice(0, 8));
      }
    };

    const fetchInitial = async () => {
      try {
        const res = await fetch('/api/queue');
        const data = await res.json();
        processData(data);
        
        // Fetch Video URL from settings
        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        if (settingsData.video_url) {
           setVideoUrl(settingsData.video_url);
           if (settingsData.video_url === 'PLAYLIST_ALL') {
              const videoRes = await fetch('/api/videos');
              const videoData = await videoRes.json();
              if (Array.isArray(videoData)) setVideoList(videoData);
           }
        }
      } catch (e) {}
    };

    fetchInitial();

    // SSE Connection
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        processData(data);
      } catch (e) {}
    };

    return () => eventSource.close();
  }, []);

  return (
    <div className="h-screen bg-[#020204] text-white font-sans overflow-hidden flex flex-col selection:bg-indigo-500/30">
      {/* Dynamic Background Noise/Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Top Header Overhaul */}
      <header className="h-20 px-10 flex justify-between items-center bg-black/40 backdrop-blur-2xl border-b border-white/[0.05] z-50 relative shrink-0">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-5">
             <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-xl">
                  <Hospital size={26} className="text-indigo-500" strokeWidth={2.5} />
                </div>
             </div>
             <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-[-0.03em] uppercase italic text-white flex items-center gap-3">
                  QURE <span className="text-indigo-500 not-italic font-medium tracking-[0.2em] text-xl opacity-80">CENTRAL</span>
                </h1>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-0.5">Medical Command Center V3.4</span>
             </div>
          </div>

          <div className="h-8 w-px bg-white/10"></div>

          <div className="flex items-center gap-10">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                   <Activity size={18} className="text-green-500 animate-pulse" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">System Status</span>
                   <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Optimal Performance</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                   <Users size={18} className="text-indigo-500" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active Patients</span>
                   <span className="text-xs font-bold text-white uppercase tracking-widest">{queue.length} Total</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex flex-col items-end">
              <div className="flex items-center gap-4 px-6 py-2.5 bg-white/5 rounded-2xl border border-white/10 shadow-inner group transition-all hover:bg-white/10 cursor-default">
                 <div className="flex flex-col items-end">
                    <span className="text-2xl font-black tabular-nums tracking-tight leading-none">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1">
                      {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                 </div>
                 <div className="w-px h-10 bg-white/10 mx-1"></div>
                 <Clock size={24} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
              </div>
           </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden relative">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[200px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px] pointer-events-none"></div>

        {/* Left Section: Infotainment & Upcoming Queue */}
        <div className="col-span-7 flex flex-col border-r border-white/5 bg-black relative overflow-hidden">
           {/* Broadcast Container */}
           <div className="flex-[4] flex flex-col relative group">
              <div className="flex-1 relative overflow-hidden bg-black">
                 {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                    <iframe 
                       className="w-full h-full absolute inset-0"
                       src={getYouTubeEmbedUrl(videoUrl)}
                       title="Hospital Infotainment"
                       frameBorder="0"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                       allowFullScreen
                     ></iframe>
                 ) : (
                    <video 
                       className="w-full h-full absolute inset-0 object-contain"
                       src={videoUrl === 'PLAYLIST_ALL' ? videoList[currentVideoIdx]?.url : videoUrl}
                       autoPlay
                       muted
                       onEnded={() => {
                          if (videoUrl === 'PLAYLIST_ALL' && videoList.length > 0) {
                             setCurrentVideoIdx((prev) => (prev + 1) % videoList.length);
                          }
                       }}
                       loop={videoUrl !== 'PLAYLIST_ALL'}
                       playsInline
                    />
                 )}
                 
                 {/* Premium Overlay HUD */}
                 <div className="absolute inset-0 pointer-events-none border-b border-white/5">
                    <div className="absolute top-8 left-8 flex items-center gap-4 px-6 py-3 bg-black/60 backdrop-blur-3xl border border-white/20 rounded-2xl z-20 shadow-2xl">
                       <div className="relative">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Live Broadcast</span>
                    </div>
                 </div>
              </div>

              {/* Seamless Ticker */}
              <div className="h-20 bg-black border-t border-white/5 flex items-center overflow-hidden relative">
                 <div className="flex items-center gap-24 whitespace-nowrap animate-marquee px-12 relative z-10">
                    <span className="text-2xl font-black uppercase tracking-[0.2em] text-white italic">Welcome to Conner District Hospital</span>
                    <span className="text-2xl font-black uppercase tracking-[0.2em] text-indigo-500 italic">Quality Care for Every Citizen</span>
                    <span className="text-2xl font-black uppercase tracking-[0.2em] text-white italic">Your Health is our Priority</span>
                 </div>
              </div>
           </div>

           {/* Upcoming Queue Section (Moved from Right) */}
           <div className="flex-1 bg-black/40 border-t border-white/5 p-8 flex flex-col min-h-0 relative">
              <div className="flex items-center justify-between mb-6 px-4">
                 <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em] flex items-center gap-4">
                    <Clock size={16} className="text-indigo-500" /> Upcoming Stream
                 </h2>
                 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{upcoming.length} Patients Pending</span>
              </div>

              <div className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-6 px-4">
                 {upcoming.map((item, idx) => (
                   <motion.div 
                     key={item.id} 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     transition={{ delay: idx * 0.05 }}
                     className="shrink-0 bg-white/[0.03] p-5 rounded-2xl flex items-center gap-6 border border-white/5 hover:bg-white/5 transition-all min-w-[280px]"
                   >
                     <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                       {item.queueNumber.split('-')[1] || item.queueNumber}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-wide truncate w-32">{maskName(item.patientName)}</span>
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">{item.serviceType}</span>
                     </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Section: Stations */}
        <div className="col-span-5 flex flex-col bg-black/40 backdrop-blur-xl relative overflow-hidden">
           <div className="flex-1 flex flex-col p-8 gap-4 overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                 <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em] flex items-center gap-4">
                    <LayoutGrid size={16} className="text-indigo-500" /> Active Stations
                 </h2>
                 <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-[8px] font-black uppercase text-indigo-500 tracking-[0.2em]">Monitoring</span>
                 </div>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                {staticDoors.map((doorName) => {
                  const doorPatients = nowServing.filter(p => p.door && p.door.trim().toLowerCase() === doorName.toLowerCase());

                  return (
                    <div key={doorName} className="flex-1 flex flex-col gap-2 min-h-0">
                        <div className="flex items-center gap-3 px-2">
                           <span className="text-sm font-black text-white italic uppercase tracking-tighter">{doorName}</span>
                           <div className="flex-1 h-px bg-white/5"></div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
                           <AnimatePresence mode="popLayout">
                             {(() => {
                               const priorityPats = doorPatients.filter(p => p.classification !== 'Regular');
                               const regularPats = doorPatients.filter(p => p.classification === 'Regular');
                               
                               const displayPats = [];
                               if (priorityPats.length > 0) {
                                 displayPats.push({ ...priorityPats[0], type: 'priority' });
                                 if (regularPats.length > 0) {
                                   displayPats.push({ ...regularPats[0], type: 'regular' });
                                 }
                               } else {
                                 if (regularPats.length > 0) {
                                   displayPats.push({ ...regularPats[0], type: 'regular' });
                                   if (regularPats.length > 1) {
                                     displayPats.push({ ...regularPats[1], type: 'regular' });
                                   }
                                 }
                               }

                               if (displayPats.length === 0) {
                                 return (
                                   <motion.div 
                                     initial={{ opacity: 0 }}
                                     animate={{ opacity: 1 }}
                                     className="col-span-full h-full bg-white/[0.02] border border-white/5 border-dashed rounded-2xl flex items-center justify-center min-h-[100px]"
                                   >
                                      <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Station Available</span>
                                   </motion.div>
                                 );
                               }

                               return displayPats.map((p) => (
                                 <motion.div 
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className={`relative overflow-hidden p-4 rounded-2xl border-2 shadow-lg flex flex-col justify-between ${
                                      p.type === 'priority' 
                                      ? 'bg-gradient-to-br from-amber-500/20 to-transparent border-amber-500/50' 
                                      : 'bg-gradient-to-br from-indigo-500/20 to-transparent border-indigo-500/50'
                                    } ${displayPats.length === 1 ? 'col-span-2' : ''}`}
                                 >
                                    <div className="flex items-center justify-between mb-1">
                                       <span className={`text-[8px] font-black uppercase tracking-[0.4em] flex items-center gap-2 ${
                                         p.type === 'priority' ? 'text-amber-500' : 'text-indigo-400'
                                       }`}>
                                          {p.type === 'priority' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>}
                                          {p.type === 'priority' ? 'Priority' : 'Regular'}
                                       </span>
                                       <UserCheck size={14} className={p.type === 'priority' ? 'text-amber-500' : 'text-indigo-400'} />
                                    </div>
                                    <h3 className="text-5xl font-black text-white tabular-nums leading-none tracking-tighter">{p.queueNumber}</h3>
                                    <p className="text-[10px] font-black text-white uppercase truncate">{maskName(p.patientName)}</p>
                                 </motion.div>
                               ));
                             })()}
                           </AnimatePresence>
                        </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 50s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(300%); opacity: 0; }
        }
        .animate-scan {
          animation: scan 5s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
