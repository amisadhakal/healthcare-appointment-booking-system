import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/70 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-sm font-bold tracking-widest text-white uppercase">HABS // CORE</span>
      </div>
      <div className="flex gap-6 text-xs tracking-wider uppercase text-slate-400 font-medium">
        <a href="#book" className="hover:text-white transition-colors">Book Appointment</a>
        <a href="#dashboard" className="hover:text-white transition-colors">Portal</a>
        <span className="text-slate-600">|</span>
        <span className="text-indigo-400 cursor-pointer">Amisa Profile</span>
      </div>
    </nav>
  );
}