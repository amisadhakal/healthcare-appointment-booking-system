import React, { useState } from 'react';


function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50 px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-indigo-600 animate-pulse" />
        <span className="text-sm font-bold tracking-widest text-slate-900 uppercase">HABS // CORE</span>
      </div>
      
      
      <div className="flex gap-6 text-xs tracking-wider uppercase text-slate-900 font-black items-center">
        <a href="#book" className="hover:text-indigo-600 transition-colors">Book Appointment</a>
        <a href="#dashboard" className="hover:text-indigo-600 transition-colors">Portal</a>
        <span className="text-slate-300 font-normal">|</span>
        
        
        <button 
          aria-label="User Portal" 
          className="p-1 rounded-full hover:bg-slate-100 text-slate-900 hover:text-indigo-600 transition-all cursor-pointer"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}


function BookingForm() {
  const [formData, setFormData] = useState({
    patient_name: '',
    doctor_name: '',
    date: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setFormData({ patient_name: '', doctor_name: '', date: '' });
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Cannot connect to backend server right now.');
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: '#ffffff', border: '2px solid #000000' }}>
      <div className="mb-6">
        <h2 className="text-2xl tracking-tight" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Schedule Consultation</h2>
        <p className="text-xs mt-1" style={{ color: '#000000', fontWeight: '700', display: 'block' }}>Enter your medical details to reserve a private session.</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Full Name</label>
          <input 
            type="text" name="patient_name" value={formData.patient_name} onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none" 
            style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
            placeholder="e.g. John Doe" required 
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Medical Specialist</label>
          <select 
            name="doctor_name" value={formData.doctor_name} onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none" 
            style={{ backgroundColor: '#ffffff', border: '2px solid #000000', color: '#000000', fontWeight: '900' }} required
          >
            <option value="" style={{ color: '#000000' }}>-- Select a Practitioner --</option>
            <option value="Dr. Smith (Cardiologist)">Dr. Smith (Cardiologist)</option>
            <option value="Dr. Davis (Dermatologist)">Dr. Davis (Dermatologist)</option>
            <option value="Dr. Vance (Neurologist)">Dr. Vance (Neurologist)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Preferred Date & Time</label>
          <input 
            type="text" name="date" value={formData.date} onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none" 
            style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
            placeholder="2026-05-20 14:30" required 
          />
        </div>

        <button type="submit" className="w-full mt-2 text-white text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl cursor-pointer" style={{ backgroundColor: '#000000', fontWeight: '900' }}>
          Request Slot
        </button>
      </form>
    </div>
  );
}

//main page
export default function App() {
  return (
    <div className="min-h-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.05),rgba(255,255,255,0))] text-slate-900 font-sans antialiased">
      <Navbar />

      <main className="pt-32 pb-16 px-6 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center max-w-xl mb-12">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
            Healthcare Appointment System
          </h1>
          <p className="text-sm sm:text-base text-slate-700 font-bold leading-relaxed">
            Welcome to the dashboard for Healthcare Appointment System. Experience instant, seamless scheduling coordination with premium specialist networks. "Connect and book appointments for Specific Cases".
          </p>
        </div>

        <div id="book" className="w-full flex justify-center">
          <BookingForm />
        </div>
      </main>

      <footer className="w-full text-center py-6 text-[10px] uppercase tracking-widest text-slate-400 border-t border-slate-100">
        &copy; 2026 Healthcare Appointment Booking System. All rights reserved.
      </footer>
    </div>
  );
}