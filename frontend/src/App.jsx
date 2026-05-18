import React, { useState } from 'react';

// ==========================================
// 1. AUTH MODAL (POPUP PORTAL) COMPONENT
// ==========================================
function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register views
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isLogin) {
        // Save token and user details to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Login successful!');
        setTimeout(() => { onClose(); }, 1500);
      } else {
        setMessage('Registration successful! Shifting to login...');
        setTimeout(() => {
          setIsLogin(true);
          setMessage('');
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl p-8 z-10 shadow-2xl" style={{ border: '2px solid #000000' }}>
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-black cursor-pointer transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black tracking-tight text-black">
            {isLogin ? 'Welcome Back Portal' : 'Create Portal Account'}
          </h2>
          <p className="text-xs font-bold text-slate-600 mt-1">
            {isLogin ? 'Access your personal health platform configurations.' : 'Register to synchronize with our specialist grid.'}
          </p>
        </div>

        {error && <div className="p-3 mb-4 text-xs font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl text-center">{error}</div>}
        {message && <div className="p-3 mb-4 text-xs font-bold text-emerald-600 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-black">Full Name</label>
              <input 
                type="text" name="name" required value={formData.name} onChange={handleChange}
                className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none"
                style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
                placeholder="Amisa Dhakal"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-black">Email Address</label>
            <input 
              type="email" name="email" required value={formData.email} onChange={handleChange}
              className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none"
              style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
              placeholder="example@healthcare.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-black">Password</label>
            <input 
              type="password" name="password" required value={formData.password} onChange={handleChange}
              className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none"
              style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-black">User Account Type</label>
              <select 
                name="role" value={formData.role} onChange={handleChange}
                className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none cursor-pointer" 
                style={{ backgroundColor: '#ffffff', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
              >
                <option value="patient">Patient Portal</option>
                <option value="doctor">Medical Practitioner / Doctor</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full mt-2 text-white text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl cursor-pointer bg-black font-black">
            {isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-bold text-slate-500">
          {isLogin ? (
            <p>Don't have a portal account? {' '}
              <button onClick={() => { setIsLogin(false); setError(''); }} className="text-indigo-600 font-black hover:underline cursor-pointer">Register here</button>
            </p>
          ) : (
            <p>Already have an active account? {' '}
              <button onClick={() => { setIsLogin(true); setError(''); }} className="text-indigo-600 font-black hover:underline cursor-pointer">Log in</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. NAVBAR COMPONENT
// ==========================================
function Navbar({ onOpenAuth }) {
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
          onClick={onOpenAuth}
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

// ==========================================
// 3. BOOKING FORM COMPONENT
// ==========================================
function BookingForm({ onOpenAuth }) {
  // Check if a user session exists in localStorage
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  
  const [formData, setFormData] = useState({
    // Auto-fill the patient name if they are logged in, otherwise leave blank
    patient_name: loggedInUser ? loggedInUser.name : '',
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

    // 1. FRONTEND BLOCKER: Check if the token exists
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please sign in to your portal account to book slots.');
      
      // Automatically pop open the login portal to help them out after a brief delay
      if (onOpenAuth) {
        setTimeout(() => {
          onOpenAuth();
        }, 1200);
      }
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        // Reset fields but keep the logged-in user's name populated
        setFormData({ 
          patient_name: loggedInUser ? loggedInUser.name : '', 
          doctor_name: '', 
          date: '' 
        });
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

      {message && <div className="p-3 mb-4 text-xs font-bold text-emerald-600 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-center">{message}</div>}
      {error && <div className="p-3 mb-4 text-xs font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl text-center">{error}</div>}

      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Full Name</label>
          <input 
            type="text" 
            name="patient_name" 
            value={formData.patient_name} 
            onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed" 
            style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
            placeholder={loggedInUser ? loggedInUser.name : "e.g. John Doe"} 
            required 
            disabled={!!loggedInUser} // Locks the text field if they are logged in
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

        <button type="submit" className="w-full mt-2 text-white text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl cursor-pointer bg-black font-black">
          {loggedInUser ? 'Request Slot' : 'Log In to Request Slot'}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 4. MAIN APP WRAPPER EXPORT
// ==========================================
export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.05),rgba(255,255,255,0))] text-slate-900 font-sans antialiased">
      {/* Pass the toggle trigger to Navbar */}
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

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

      {/* Auth Portal Element injected globally */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <footer className="w-full text-center py-6 text-[10px] uppercase tracking-widest text-slate-400 border-t border-slate-100">
        &copy; 2026 Healthcare Appointment Booking System. All rights reserved.
      </footer>
    </div>
  );
}