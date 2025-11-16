import React, { useMemo } from 'react';
import { User, Assessment, Course } from '../types';

interface StatCardProps {
    icon: string;
    label: string;
    value: number | string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center w-full text-left">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                <i className={`fa-solid ${icon} text-white text-2xl`}></i>
            </div>
            <div className="ml-4">
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
};

interface StudentDashboardProps {
    currentUser: User;
    assessments: Assessment[];
    courses: Course[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser, assessments: allAssessments, courses: allCourses }) => {
    if (currentUser.role !== 'student') return null;

    const assessments = useMemo<Assessment[]>(() => {
        return allAssessments.filter(a => a.studentName === currentUser.name);
    }, [currentUser, allAssessments]);

    const courses = useMemo<Course[]>(() => {
        const studentCourseNames = [...new Set(assessments.map(a => a.courseName))];
        return allCourses.filter(c => studentCourseNames.includes(c.name));
    }, [assessments, allCourses]);

    const averageScore = useMemo(() => {
        if (assessments.length === 0) return 'N/A';
        const total = assessments.reduce((sum, a) => sum + a.score, 0);
        const average = Math.round(total / assessments.length);
        return isNaN(average) ? 'N/A' : average;
    }, [assessments]);

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-slate-800">Welcome, {currentUser.name.split(' ')[0]}!</h2>
                <p className="text-slate-500 mt-1">Here's a summary of your academic progress.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon="fa-book" label="Enrolled Courses" value={courses.length} color="bg-emerald-500" />
                <StatCard icon="fa-file-signature" label="Completed Assessments" value={assessments.length} color="bg-rose-500" />
                <StatCard icon="fa-graduation-cap" label="Average Score" value={averageScore === 'N/A' ? 'N/A' : `${averageScore}%`} color="bg-sky-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-slate-700 mb-4">My Courses</h3>
                    {courses.length > 0 ? (
                        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {courses.map(course => (
                                <li key={course.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-800">{course.name}</p>
                                        <p className="text-sm text-slate-500">{course.teacher}</p>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">{course.credits} Credits</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500">You are not yet enrolled in any courses.</p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-slate-700 mb-4">Recent Assessments</h3>
                    {assessments.length > 0 ? (
                        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {assessments.slice(0, 5).map(assessment => (
                                <li key={assessment.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-800">{assessment.courseName} - {assessment.type}</p>
                                        <p className="text-sm text-slate-500">{assessment.date}</p>
                                    </div>
                                    <span className={`text-lg font-bold ${assessment.score >= 80 ? 'text-green-600' : assessment.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{assessment.score}%</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500">No assessments recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;