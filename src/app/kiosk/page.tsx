'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CheckCircle, Hospital } from 'lucide-react';

export default function KioskPage() {
  const [name, setName] = useState('');
  const [type, setType] = useState('General');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName: name, serviceType: type }),
      });
      const data = await res.json();
      setTicket(data);
      setName('');
      setTimeout(() => setTicket(null), 10000); // Clear after 10s
    } catch (error) {
      alert('Failed to get ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl p-12 overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-blue-600 rounded-2xl text-white">
            <Hospital size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Hospital Queue Kiosk</h1>
            <p className="text-gray-500 font-medium">Please enter your details to get a number</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!ticket ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Patient Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-xl outline-none transition-all duration-300 shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Service Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {['General', 'Emergency', 'Laboratory', 'Pharmacy'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setType(s)}
                      className={`py-4 px-6 rounded-2xl text-lg font-semibold transition-all duration-300 border-2 ${
                        type === s 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-black text-white py-6 rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all duration-300 active:scale-[0.98]"
              >
                {loading ? 'Processing...' : (
                  <>
                    <UserPlus /> Get My Number
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="ticket"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-8"
            >
              <div className="inline-flex p-6 bg-green-100 text-green-600 rounded-full mb-4">
                <CheckCircle size={64} />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-medium text-gray-500">Your Queue Number is</p>
                <h2 className="text-8xl font-black text-black tracking-tighter">{ticket.queueNumber}</h2>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl inline-block border border-gray-100">
                <p className="text-gray-600 font-semibold">{ticket.patientName}</p>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mt-1">{ticket.serviceType}</p>
              </div>
              <p className="text-gray-400 font-medium">Please wait for your number to be called.</p>
              <button 
                onClick={() => setTicket(null)}
                className="text-blue-600 font-bold hover:underline"
              >
                Back to Start
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
