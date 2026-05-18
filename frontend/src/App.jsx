import React from 'react';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-white font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* Navigation Layout */}
      <Navbar />

      {/* Hero Container & Booking Interface */}
      <main className="pt-32 pb-16 px-6 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center max-w-xl mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 mb-4">
            Healthcare, Refined.
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
            Welcome to the luxury booking dashboard for HABS. Experience instant, seamless scheduling coordination with premium specialist networks.
          </p>
        </div>

        {/* Render Booking Form Interface */}
        <div id="book" className="w-full flex justify-center">
          <BookingForm />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full text-center py-6 text-[10px] uppercase tracking-widest text-neutral-600 border-t border-white/[0.02]">
        &copy; 2026 Healthcare Appointment Booking System. All rights reserved.
      </footer>
    </div>
  );
}