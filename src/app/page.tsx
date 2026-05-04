import Link from 'next/link';
import { Hospital, LayoutGrid, Monitor, UserRound, DoorOpen, ArrowRight, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-[120px] -z-10 animate-pulse delay-1000"></div>

      <main className="max-w-6xl mx-auto px-8 py-20 min-h-screen flex flex-col">
        <header className="flex items-center gap-4 mb-16">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
            <Hospital size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight"><span className="text-blue-600">Q</span>URE</h1>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400">Hospital Queue Engine</p>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-2xl mb-16">
            <h2 className="text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8">
              Streamlining <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Patient Flow</span> with precision.
            </h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              A high-fidelity queue management system built for modern medical facilities. 
              Real-time synchronization, beautiful displays, and effortless management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/triage" className="group">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <UserRound size={28} />
                </div>
                <h3 className="text-xl font-black mb-3">Triage Portal</h3>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">
                  Efficiently pick patients from the EMR active list and assign queue numbers.
                </p>
              </div>
            </Link>

            <Link href="/records" className="group">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileText size={28} />
                </div>
                <h3 className="text-xl font-black mb-3">Records Portal</h3>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">
                  Manage physical records retrieval, printing, and officer grading.
                </p>
              </div>
            </Link>

            <Link href="/staff" className="group">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <LayoutGrid size={28} />
                </div>
                <h3 className="text-xl font-black mb-3">Staff Station</h3>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">
                  Control center for doctors and nurses to manage station-specific patient calls.
                </p>
              </div>
            </Link>

            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Monitor size={100} className="text-white" />
                </div>
                <div>
                  <div className="w-14 h-14 bg-white/10 text-white rounded-3xl flex items-center justify-center mb-6">
                    <Monitor size={28} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">Waiting Area</h3>
                  <p className="text-gray-400 font-medium text-sm leading-relaxed mb-6">
                    Stunning public dashboards for main areas or specific doors.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Link href="/display" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-bold transition-all group">
                    <span>Main Unified Board</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/display/door1" className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all">
                      Door 1
                    </Link>
                    <Link href="/display/door2" className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all">
                      Door 2
                    </Link>
                  </div>
                </div>
            </div>
          </div>
        </div>

        <footer className="mt-auto pt-16 flex justify-between items-center text-gray-400 font-bold text-xs uppercase tracking-widest">
          <div>© 2026 Qure Medical Systems</div>
          <div className="flex gap-8">
            <span className="text-green-500">MSSQL Connected</span>
            <span>Next.js Engine</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
