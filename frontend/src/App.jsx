import React, { useState, useEffect } from 'react';

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
      // FIXED: Switched from localhost to 127.0.0.1 to pass your strict backend CORS rules!
      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isLogin) {
        // Save token and user details to localStorage cleanly
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Login successful!');
        setTimeout(() => { onClose(); window.location.reload(); }, 1200);
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
              <label htmlFor="modal_name" className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-black">Full Name</label>
              <input 
                type="text" 
                id="modal_name"
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange}
                className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none"
                style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
                placeholder="Amisa Dhakal"
              />
            </div>
          )}

          <div>
            <label htmlFor="modal_email" className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-black">Email Address</label>
            <input 
              type="email" 
              id="modal_email"
              name="email" 
              required 
              value={formData.email} 
              onChange={handleChange}
              className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none"
              style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
              placeholder="example@healthcare.com"
            />
          </div>

          <div>
            <label htmlFor="modal_password" className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-black">Password</label>
            <input 
              type="password" 
              id="modal_password"
              name="password" 
              required 
              value={formData.password} 
              onChange={handleChange}
              className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none"
              style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="modal_role" className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-black">User Account Type</label>
              <select 
                id="modal_role"
                name="role" 
                value={formData.role} 
                onChange={handleChange}
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
  // 1. Core user state tracking from the login session frame
  const [user, setUser] = useState(null);
  
  // 2. Updated state structure to track email and password credentials
  const [formData, setFormData] = useState({
    patient_email: '',
    password: '',
    doctor_name: '',
    date: ''
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 3. Sync profile states on initial runtime mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Auto-populate the email field if they already logged into the platform portal
      setFormData(prev => ({ 
        ...prev, 
        patient_email: parsedUser.email || '',
        password: '••••••••' // Placeholder visual masking for pre-authenticated states
      }));
    } else {
      setUser(null);
      setFormData(prev => ({ ...prev, patient_email: '', password: '' }));
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    let token = localStorage.getItem('token');
    
    // IF NO TOKEN: Automatically log them in using the custom form fields
    if (!token) {
      try {
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.patient_email, password: formData.password }),
        });
        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
          throw new Error(loginData.error || 'Login failed before booking.');
        }
        
        // Save the freshly generated token
        token = loginData.token;
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    // NOW WE HAVE A TOKEN! Proceed with booking safely:
    console.log("--- BOOKING REQUEST DEBUGGER ---");
    console.log("Token value:", token ? `${token.substring(0, 15)}...` : "MISSING/NULL");
    console.log("Payload data object:", {
      patient_email: formData.patient_email,
      doctor_name: formData.doctor_name,
      date: formData.date
    });
    console.log("--------------------------------");

    try {
      const response = await fetch('http://127.0.0.1:5000/api/appointments/book', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          patient_email: formData.patient_email, 
          doctor_name: formData.doctor_name,     
          date: formData.date                    
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message || 'Consultation slot successfully requested!');
        setFormData(prev => ({ ...prev, doctor_name: '', date: '' }));
        setTimeout(() => { window.location.reload(); }, 1000); 
      } else {
        console.error("Backend Error Response Details:", data);
        setError(data.error || data.msg || 'Validation failed on server.');
      }
    } catch (err) {
      setError('Cannot connect to backend server right now.');
    }
  }; // <--- THIS WAS THE BRACKET MISSING IN YOUR PREVIOUS CODE SNIPPET!

  return (
    <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: '#ffffff', border: '2px solid #000000' }}>
      <div className="mb-6">
        <h2 className="text-2xl tracking-tight" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Schedule Consultation</h2>
        <p className="text-xs mt-1" style={{ color: '#000000', fontWeight: '700', display: 'block' }}>Enter your medical details to reserve a private session.</p>
      </div>

      {message && <div className="p-3 mb-4 text-xs font-bold text-emerald-600 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-center">{message}</div>}
      {error && <div className="p-3 mb-4 text-xs font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl text-center">{error}</div>}

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* EMAIL TRACKING INPUT */}
        <div>
          <label htmlFor="booking_email" className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Portal Email Address</label>
          <input 
            type="email" 
            id="booking_email"
            name="patient_email" 
            value={formData.patient_email} 
            onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed" 
            style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
            placeholder="e.g. patient@gmail.com"
            required 
            disabled={!!user} 
          />
        </div>

        {/* PASSWORD VALIDATION INPUT */}
        <div>
          <label htmlFor="booking_password" className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Account Password</label>
          <input 
            type="password" 
            id="booking_password"
            name="password" 
            value={formData.password} 
            onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed" 
            style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
            placeholder="••••••••"
            required 
            disabled={!!user} 
          />
        </div>

        {/* MEDICAL SPECIALIST SELECT */}
        <div>
          <label htmlFor="booking_specialist" className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Medical Specialist</label>
          <select 
            id="booking_specialist"
            name="doctor_name" 
            value={formData.doctor_name} 
            onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none" 
            style={{ backgroundColor: '#ffffff', border: '2px solid #000000', color: '#000000', fontWeight: '900' }} 
            required
          >
            <option value="" style={{ color: '#000000' }}>-- Select a Practitioner --</option>
            <option value="Dr. Smith (Cardiologist)">Dr. Smith (Cardiologist)</option>
            <option value="Dr. Davis (Dermatologist)">Dr. Davis (Dermatologist)</option>
            <option value="Dr. Vance (Neurologist)">Dr. Vance (Neurologist)</option>
          </select>
        </div>

        {/* DATE AND TIME INPUT */}
        <div>
          <label htmlFor="booking_date" className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#000000', fontWeight: '900', display: 'block' }}>Preferred Date & Time</label>
          <input 
            type="datetime-local" 
            id="booking_date"
            name="date" 
            value={formData.date} 
            onChange={handleInputChange}
            className="w-full text-sm px-4 py-3 rounded-xl focus:outline-none cursor-pointer" 
            style={{ backgroundColor: '#f8fafc', border: '2px solid #000000', color: '#000000', fontWeight: '900' }}
            required 
          />
        </div>

        <button type="submit" className="w-full mt-2 text-white text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl cursor-pointer bg-black font-black">
          {user ? 'Request Slot' : 'Log In & Request Slot'}
        </button>
      </form>
    </div>
  );
}



// ==========================================
// 4. PORTAL / DASHBOARD PANELS COMPONENT
// ==========================================
function DashboardPortal() {
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/appointments/my-slots', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setAppointments(data);
        } else {
          setError(data.error || 'Failed to load dashboard data.');
        }
      } catch (err) {
        setError('Could not connect to server to fetch portal records.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/update/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setAppointments(appointments.map(app => 
          app._id === appointmentId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      alert('Error updating consultation status.');
    }
  };

  if (!token || !loggedInUser) {
    return (
      <div id="dashboard" className="w-full max-w-4xl text-center p-12 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 mt-16">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Portal Dashboard Locked</h3>
        <p className="text-xs font-bold text-slate-500 mt-1">Please use the profile icon in the top right to sign in to your custom clinical account profile.</p>
      </div>
    );
  }

  const isDoctor = loggedInUser.role === 'doctor';

  return (
    <div id="dashboard" className="w-full max-w-5xl px-4 mt-16">
      {/* Account Control Metadata Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-2 border-black bg-white p-6 rounded-2xl mb-8 shadow-xl">
        <div>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
            {isDoctor ? 'Practitioner Access Grid' : 'Patient Health Summary'}
          </span>
          <h2 className="text-2xl font-black text-black mt-2">Welcome back, {loggedInUser.name}</h2>
          <p className="text-xs font-bold text-slate-500">{loggedInUser.email}</p>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="mt-4 sm:mt-0 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-600 border-2 border-red-600 rounded-xl hover:bg-red-50 cursor-pointer transition-colors"
        >
          Disconnect Portal
        </button>
      </div>

      {/* Main Database Render Box */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-black uppercase tracking-tight text-black mb-4">
          {isDoctor ? 'Your Scheduled Medical Consultations' : 'Your Booked Session Requests'}
        </h3>

        {loading && <p className="text-xs font-bold text-slate-500 animate-pulse">Synchronizing records data map...</p>}
        {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        
        {!loading && appointments.length === 0 && (
          <p className="text-xs font-bold text-slate-400 py-2">No logged appointment objects discovered under this session framework.</p>
        )}

        <div className="space-y-4">
          {appointments.map((app) => (
            <div key={app._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-2 border-slate-200 hover:border-black rounded-xl transition-all bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-black">
                    {isDoctor ? `Patient: ${app.patient_name}` : `Specialist: ${app.doctor_name}`}
                  </span>
                  <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded border ${
                    app.status === 'Approved' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                    app.status === 'Completed' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                    'bg-amber-50 border-amber-300 text-amber-700'
                  }`}>
                    {app.status || 'pending'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600">Scheduled Target Slot: <span className="text-black font-black">{app.date}</span></p>
              </div>

              {/* Action controller block conditional on user role */}
              {isDoctor && app.status !== 'Completed' && (
                <div className="flex gap-2 mt-4 sm:mt-0">
                  {app.status !== 'Approved' && (
                    <button 
                      onClick={() => handleUpdateStatus(app._id, 'Approved')}
                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors"
                    >
                      Accept Slot
                    </button>
                  )}
                  <button 
                    onClick={() => handleUpdateStatus(app._id, 'Completed')}
                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                  >
                    Mark Done
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. MAIN APP WRAPPER EXPORT
// ==========================================
// ==========================================
// 5. MAIN APP WRAPPER EXPORT (UPDATED)
// ==========================================
export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // 'home' represents the main booking landing page, 'portal' is the separate page view
  const [currentView, setCurrentView] = useState('home'); 

  return (
    <div className="min-h-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.05),rgba(255,255,255,0))] text-slate-900 font-sans antialiased flex flex-col justify-between">
      
      {/* Dynamic Navigation Header */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="h-3 w-3 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-sm font-bold tracking-widest text-slate-900 uppercase">HABS // CORE</span>
        </div>
        
        <div className="flex gap-6 text-xs tracking-wider uppercase text-slate-900 font-black items-center">
          <button 
            onClick={() => setCurrentView('home')} 
            className={`cursor-pointer transition-colors hover:text-indigo-600 ${currentView === 'home' ? 'text-indigo-600 underline underline-offset-4 decoration-2' : 'text-slate-900'}`}
          >
            Book Appointment
          </button>
          <button 
            onClick={() => setCurrentView('portal')} 
            className={`cursor-pointer transition-colors hover:text-indigo-600 ${currentView === 'portal' ? 'text-indigo-600 underline underline-offset-4 decoration-2' : 'text-slate-900'}`}
          >
            Portal
          </button>
          <span className="text-slate-300 font-normal">|</span>
          
          <button 
            onClick={() => setIsAuthOpen(true)}
            aria-label="User Portal" 
            className="p-1 rounded-full hover:bg-slate-100 text-slate-900 hover:text-indigo-600 transition-all cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Dynamic View Switcher */}
      <main className="pt-32 pb-16 px-6 flex flex-col items-center justify-center flex-grow">
        {currentView === 'home' ? (
          /* ================= LANDING / BOOKING VIEW ================= */
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="text-center max-w-xl mb-12">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
                Healthcare Appointment System
              </h1>
              <p className="text-sm sm:text-base text-slate-700 font-bold leading-relaxed">
                Welcome to the dashboard for Healthcare Appointment System. Experience instant, seamless scheduling coordination with premium specialist networks. "Connect and book appointments for Specific Cases".
              </p>
            </div>

            <div id="book" className="w-full flex justify-center">
              <BookingForm onOpenAuth={() => setIsAuthOpen(true)} />
            </div>
          </div>
        ) : (
          /* ================= DEDICATED PORTAL VIEW ================= */
          <div className="w-full flex justify-center animate-fadeIn">
            <DashboardPortal />
          </div>
        )}
      </main>

      {/* Auth Portal Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Persistent System Footer */}
      <footer className="w-full text-center py-6 text-[10px] uppercase tracking-widest text-slate-400 border-t border-slate-100">
        &copy; 2026 Healthcare Appointment Booking System. All rights reserved.
      </footer>
    </div>
  );
}
