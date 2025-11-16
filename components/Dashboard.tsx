import React from 'react';
import { View, Student, Teacher, SchoolEvent, Course } from '../types';
import { ANNOUNCEMENTS_DATA } from '../constants';

interface StatCardProps {
    icon: string;
    label: string;
    value: number | string;
    color: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, onClick }) => {
    const isClickable = !!onClick;
    const baseClasses = "bg-white p-6 rounded-xl shadow-md flex items-center w-full text-left transition-all duration-300";
    const clickableClasses = "cursor-pointer transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
    const focusColor = color.replace('bg-', 'focus:ring-');


    return (
        <button
            onClick={onClick}
            disabled={!isClickable}
            className={`${baseClasses} ${isClickable ? `${clickableClasses} ${focusColor}` : ''}`}
            aria-label={`View ${label}`}
        >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                <i className={`fa-solid ${icon} text-white text-2xl`}></i>
            </div>
            <div className="ml-4">
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
        </button>
    );
};

interface DashboardProps {
    setCurrentView: (view: View) => void;
    students: Student[];
    teachers: Teacher[];
    events: SchoolEvent[];
    courses: Course[];
}

const Dashboard: React.FC<DashboardProps> = ({setCurrentView, students, teachers, events, courses}) => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="fa-user-graduate" label="Total Students" value={students.length} color="bg-sky-500" onClick={() => setCurrentView(View.Students)} />
        <StatCard icon="fa-chalkboard-user" label="Total Teachers" value={teachers.length} color="bg-indigo-500" onClick={() => setCurrentView(View.Teachers)} />
        <StatCard icon="fa-book" label="Total Courses" value={courses.length} color="bg-emerald-500" onClick={() => setCurrentView(View.Courses)} />
        <StatCard icon="fa-calendar-check" label="Upcoming Events" value={events.length} color="bg-amber-500" onClick={() => setCurrentView(View.Events)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-slate-700 mb-4">Recent Announcements</h3>
          <div className="space-y-4">
            {ANNOUNCEMENTS_DATA.map(announcement => (
              <div key={announcement.id} className="p-4 border-l-4 border-sky-400 bg-sky-50 rounded-r-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-slate-800">{announcement.title}</h4>
                  <span className="text-xs text-slate-500">{announcement.date}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{announcement.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tool Card */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-700 to-slate-900 text-white">
          <i className="fa-solid fa-wand-magic-sparkles text-5xl text-sky-300 mb-4"></i>
          <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
          <p className="text-sm text-slate-300 mb-6">
            Generate insightful and professional report card comments in seconds.
          </p>
          <button 
            onClick={() => setCurrentView(View.ReportCardGenerator)}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75">
            Try the Generator
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;