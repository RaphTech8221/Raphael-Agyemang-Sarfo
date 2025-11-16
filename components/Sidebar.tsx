import React from 'react';
import { View, User } from '../types';
import { NAVIGATION_ITEMS, TEACHER_NAVIGATION_ITEMS, STUDENT_NAVIGATION_ITEMS } from '../constants';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
  currentUser: User;
  schoolName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout, currentUser, schoolName }) => {
  let navItems;
  if (currentUser.role === 'admin') {
    navItems = NAVIGATION_ITEMS;
  } else if (currentUser.role === 'teacher') {
    navItems = TEACHER_NAVIGATION_ITEMS;
  } else {
    navItems = STUDENT_NAVIGATION_ITEMS;
  }

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-center h-20 border-b border-slate-700 px-4">
        <i className="fa-solid fa-school text-3xl text-sky-400"></i>
        <h1 className="ml-3 text-xl font-bold text-center">{schoolName}</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.view}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView(item.view);
                }}
                className={`flex items-center py-3 px-4 my-1 rounded-lg transition-colors duration-200 ${
                  currentView === item.view
                    ? 'bg-sky-500 text-white font-semibold shadow-md'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <i className={`${item.icon} w-6 text-center`}></i>
                <span className="ml-4">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700">
         <button
            onClick={onLogout}
            className="w-full flex items-center justify-center py-3 px-4 my-1 rounded-lg transition-colors duration-200 text-slate-300 hover:bg-red-500 hover:text-white"
          >
            <i className="fa-solid fa-right-from-bracket w-6 text-center"></i>
            <span className="ml-4">Logout</span>
          </button>
          <p className="text-xs text-slate-500 text-center mt-4">© 2024 {schoolName}</p>
      </div>
    </div>
  );
};

export default Sidebar;