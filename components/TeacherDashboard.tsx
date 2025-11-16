import React, { useMemo } from 'react';
import { ASSESSMENTS_DATA } from '../constants';
import { View, User, Student, Course } from '../types';

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

interface TeacherDashboardProps {
    setCurrentView: (view: View) => void;
    currentUser: User;
    students: Student[];
    courses: Course[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({setCurrentView, currentUser, students: allStudents, courses: allCourses}) => {

  const courses = useMemo(() => {
    if (currentUser.role !== 'teacher') return [];
    return allCourses.filter(c => c.teacher === currentUser.name);
  }, [currentUser, allCourses]);

  const students = useMemo(() => {
     try {
        const savedAssessments = localStorage.getItem('assessments');
        const allAssessments = savedAssessments ? JSON.parse(savedAssessments) : ASSESSMENTS_DATA;

        const teacherCourseNames = courses.map(c => c.name);
        const studentNamesInCourses = new Set(
            allAssessments.filter((a: any) => teacherCourseNames.includes(a.courseName)).map((a: any) => a.studentName)
        );
        return allStudents.filter((s: any) => studentNamesInCourses.has(s.name));
    } catch { 
        return [];
    }
  }, [courses, allStudents]);


  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-slate-800">Welcome back, {currentUser.name.split(' ')[0]}!</h2>
        <p className="text-slate-500 mt-1">Here's a summary of your portal.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatCard icon="fa-user-graduate" label="My Students" value={students.length} color="bg-sky-500" onClick={() => setCurrentView(View.Students)} />
        <StatCard icon="fa-book" label="My Courses" value={courses.length} color="bg-emerald-500" onClick={() => setCurrentView(View.Courses)} />
      </div>

       <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center">
        <i className="fa-solid fa-lightbulb text-5xl text-amber-300 mb-4"></i>
        <h3 className="text-xl font-bold mb-2">AI Lesson Planner</h3>
        <p className="text-sm text-slate-300 mb-6">
          Craft engaging and structured lesson plans in minutes.
        </p>
        <button
          onClick={() => setCurrentView(View.LessonPlanner)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75">
          Launch Planner
        </button>
      </div>

    </div>
  );
};

export default TeacherDashboard;