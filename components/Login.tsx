import React, { useState } from 'react';
import { STUDENTS_DATA, TEACHERS_DATA } from '../constants';
import { Teacher, User, Student } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  schoolName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, schoolName }) => {
  const [step, setStep] = useState<'role' | 'login'>('role');
  const [role, setRole] = useState<'admin' | 'teacher' | 'student' | null>(null);
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getTeachers = (): Teacher[] => {
    try {
      const saved = localStorage.getItem('teachers');
      return saved ? JSON.parse(saved) : TEACHERS_DATA;
    } catch { return TEACHERS_DATA; }
  };

  const getStudents = (): Student[] => {
    try {
      const saved = localStorage.getItem('students');
      return saved ? JSON.parse(saved) : STUDENTS_DATA;
    } catch { return STUDENTS_DATA; }
  };

  const handleRoleSelect = (selectedRole: 'admin' | 'teacher' | 'student') => {
    setRole(selectedRole);
    setStep('login');
    if (selectedRole === 'admin') {
      setUserId('admin');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
        let user: User | undefined;

        if (role === 'admin') {
            const savedAdminRaw = localStorage.getItem('currentUser');
            let adminPassword = 'admin123';
            if (savedAdminRaw) {
                const savedAdmin = JSON.parse(savedAdminRaw);
                if (savedAdmin.role === 'admin' && savedAdmin.password) {
                    adminPassword = savedAdmin.password;
                }
            }
            if (userId.toLowerCase() === 'admin' && password === adminPassword) {
                user = { role: 'admin', id: 'admin', name: 'Admin User', imageUrl: 'https://picsum.photos/seed/admin/200', password: adminPassword };
            }
        } else if (role === 'teacher') {
            const teacher = getTeachers().find(t => t.id.toLowerCase() === userId.toLowerCase());
            if (teacher && teacher.password === password) {
                user = { ...teacher, role: 'teacher' };
            }
        } else if (role === 'student') {
            const student = getStudents().find(s => s.id.toLowerCase() === userId.toLowerCase());
            if (student && student.password === password) {
                user = { ...student, role: 'student' };
            }
        }

        if (user) {
            onLogin(user);
        } else {
            setError('Invalid ID or password.');
            setLoading(false);
        }
    }, 1000);
  };
  
  const handleBack = () => {
    setStep('role');
    setRole(null);
    setError('');
    setUserId('');
    setPassword('');
  }

  const renderRoleSelection = () => (
     <div className="animate-fade-in space-y-4">
        <style>{`
            @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
        <h2 className="text-xl font-semibold text-center text-slate-700">Select Your Role</h2>
        <button onClick={() => handleRoleSelect('admin')} className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition">
            <i className="fa-solid fa-user-shield mr-3"></i>
            Login as Admin
        </button>
        <button onClick={() => handleRoleSelect('teacher')} className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-sky-600 hover:bg-sky-700 transition">
            <i className="fa-solid fa-chalkboard-user mr-3"></i>
            Login as Teacher
        </button>
        <button onClick={() => handleRoleSelect('student')} className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition">
            <i className="fa-solid fa-user-graduate mr-3"></i>
            Login as Student
        </button>
    </div>
  );

  const renderLoginForm = () => {
    const isTeacher = role === 'teacher';
    const isAdmin = role === 'admin';
    const color = isAdmin ? 'indigo' : isTeacher ? 'sky' : 'emerald';
    
    return (
      <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
        <div>
            <label htmlFor="userId" className="block text-sm font-medium text-slate-700">{isAdmin ? 'Admin ID' : isTeacher ? 'Teacher ID' : 'Student ID'}</label>
            <div className="mt-1 relative">
            <i className={`fa-solid ${isAdmin ? 'fa-user-shield' : 'fa-id-card'} absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`}></i>
            <input id="userId" name="userId" type="text" required value={userId} onChange={(e) => setUserId(e.target.value)} readOnly={isAdmin} className={`w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-${color}-500 focus:border-${color}-500 transition ${isAdmin ? 'bg-slate-100 cursor-not-allowed' : ''}`} placeholder={isTeacher ? 'e.g., T01' : 'e.g., S001'} />
            </div>
        </div>
        <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <div className="mt-1 relative">
                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-${color}-500 focus:border-${color}-500 transition`} placeholder="••••••••" />
            </div>
            {!isAdmin && <p className="text-xs text-slate-400 mt-1 text-center">Default password is 'password123'</p>}
             {isAdmin && <p className="text-xs text-slate-400 mt-1 text-center">Default password is 'admin123'</p>}
        </div>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm font-medium text-white bg-${color}-600 hover:bg-${color}-700 disabled:bg-slate-400`}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Login'}
        </button>
      </form>
    )
  }

  const getTitle = () => {
    if (step === 'role') return 'Welcome!';
    if (role === 'admin') return 'Admin Login';
    if (role === 'teacher') return 'Teacher Portal';
    if (role === 'student') return 'Student Portal';
    return 'Login';
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <i className="fa-solid fa-school text-5xl text-sky-500"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">{getTitle()}</h1>
            <p className="mt-2 text-slate-500">{schoolName}</p>
        </div>
        
        {step === 'role' && renderRoleSelection()}
        {step === 'login' && renderLoginForm()}

        {step === 'login' && (
          <div className="text-center pt-4 border-t border-slate-200">
            <button type="button" onClick={handleBack} className="text-sm font-medium text-slate-600 hover:text-slate-800">
              &larr; Back to role selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;