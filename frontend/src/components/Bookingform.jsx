import React, { useState } from 'react';

export default function BookingForm() {
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
    <div className="w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-8 shadow-2xl shadow-black/40">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">Schedule Consultation</h2>
        <p className="text-xs text-slate-400 mt-1">Enter your medical details to reserve a private session.</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Full Name</label>
          <input 
            type="text" name="patient_name" value={formData.patient_name} onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all" 
            placeholder="e.g. John Doe" required 
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Medical Specialist</label>
          <select 
            name="doctor_name" value={formData.doctor_name} onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500/50 transition-all" required
          >
            <option value="" className="text-slate-500">-- Select a Practitioner --</option>
            <option value="Dr. Smith (Cardiologist)">Dr. Smith (Cardiologist)</option>
            <option value="Dr. Davis (Dermatologist)">Dr. Davis (Dermatologist)</option>
            <option value="Dr. Vance (Neurologist)">Dr. Vance (Neurologist)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Preferred Date & Time</label>
          <input 
            type="text" name="date" value={formData.date} onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all" 
            placeholder="YYYY-MM-DD HH:MM (e.g. 2026-05-20 14:30)" required 
          />
        </div>

        <button type="submit" className="w-full mt-2 bg-white text-slate-950 font-semibold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl hover:bg-slate-200 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-white/5">
          Request Slot
        </button>
      </form>

      {message && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-xs font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center text-xs font-medium">
          {error}
        </div>
      )}
    </div>
  );
}