import React, { useState, useMemo, useEffect } from 'react';
import { ASSESSMENTS_DATA } from '../constants';
import { Course, User, Assessment, Teacher } from '../types';

interface CoursesProps {
  currentUser: User;
  teachers: Teacher[];
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const Courses: React.FC<CoursesProps> = ({ currentUser, teachers, courses: allCourses, setCourses: setAllCourses }) => {

  const assessments = useMemo<Assessment[]>(() => {
    try {
      const savedAssessments = localStorage.getItem('assessments');
      return savedAssessments ? JSON.parse(savedAssessments) : ASSESSMENTS_DATA;
    } catch (error) {
      console.error("Error parsing assessments from localStorage", error);
      return ASSESSMENTS_DATA;
    }
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCredits, setSelectedCredits] = useState('');
  const [currentCourse, setCurrentCourse] = useState({
    id: '',
    name: '',
    code: '',
    teacher: '',
    credits: '',
  });
  
  const isAdmin = currentUser.role === 'admin';

  const courses = useMemo(() => {
    if (currentUser.role === 'admin') {
      return allCourses;
    }
    if (currentUser.role === 'teacher') {
      return allCourses.filter(c => c.teacher === currentUser.name);
    }
    if (currentUser.role === 'student') {
      const studentAssessments = assessments.filter(a => a.studentName === currentUser.name);
      const courseNames = [...new Set(studentAssessments.map(a => a.courseName))];
      return allCourses.filter(c => courseNames.includes(c.name));
    }
    return allCourses;
  }, [currentUser, allCourses, assessments]);

  const uniqueTeachers = useMemo(() => {
    const teachers = [...new Set(allCourses.map(c => c.teacher))].sort();
    return teachers;
  }, [allCourses]);

  const uniqueCredits = useMemo(() => {
    const credits = [...new Set(allCourses.map(c => c.credits))].sort((a,b) => Number(a) - Number(b));
    return credits;
  }, [allCourses]);

  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setIsEditMode(false);
    setCurrentCourse({
      id: `C${(allCourses.length + 101).toString()}`,
      name: '',
      code: '',
      teacher: '',
      credits: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    if (!isAdmin) return;
    setIsEditMode(true);
    setCurrentCourse({
      ...course,
      credits: course.credits.toString(),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentCourse(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCourse.name && currentCourse.code && currentCourse.teacher && currentCourse.credits) {
       const courseToSave: Course = {
        ...currentCourse,
        credits: parseInt(currentCourse.credits, 10),
      };

      if (isEditMode) {
        setAllCourses(prev => prev.map(c => c.id === courseToSave.id ? courseToSave : c));
      } else {
        setAllCourses(prev => [...prev, courseToSave]);
      }
      handleCloseModal();
    }
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTeacher('');
    setSelectedCredits('');
  };

  const filteredCourses = useMemo(() => courses.filter(course => {
    const searchMatch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const teacherMatch = selectedTeacher ? course.teacher === selectedTeacher : true;
    const creditsMatch = selectedCredits ? course.credits.toString() === selectedCredits : true;
    return searchMatch && teacherMatch && creditsMatch;
  }), [courses, searchTerm, selectedTeacher, selectedCredits]);

  const handleExport = () => {
    if (filteredCourses.length === 0) return;
    
    const headers = ['id', 'name', 'code', 'teacher', 'credits'];
    
    const csvContent = [
      headers.join(','),
      ...filteredCourses.map(course => 
        headers.map(header => {
          let value = course[header as keyof Course];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'courses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-700">{!isAdmin ? 'My Courses' : 'Course Catalog'}</h3>
          {isAdmin && (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleExport}
                    disabled={filteredCourses.length === 0}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center disabled:bg-slate-300 disabled:cursor-not-allowed">
                    <i className="fa-solid fa-file-export mr-2"></i>
                    Export CSV
                </button>
                <button
                onClick={handleOpenAddModal}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
                <i className="fa-solid fa-plus mr-2"></i>
                Add Course
                </button>
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-grow sm:flex-grow-0">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          {isAdmin && (
            <div className="relative flex-grow sm:flex-grow-0">
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none pr-8 bg-white"
              >
                <option value="">All Teachers</option>
                {uniqueTeachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          )}
          <div className="relative flex-grow sm:flex-grow-0">
            <select
              value={selectedCredits}
              onChange={(e) => setSelectedCredits(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none pr-8 bg-white"
            >
              <option value="">All Credits</option>
              {uniqueCredits.map(credit => (
                <option key={credit} value={credit}>{credit} Credits</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
          </div>
          <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
            Reset Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">Course Code</th>
                <th scope="col" className="px-6 py-3">Course Name</th>
                <th scope="col" className="px-6 py-3">Teacher</th>
                <th scope="col" className="px-6 py-3">Credits</th>
                {isAdmin && <th scope="col" className="px-6 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{course.code}</td>
                  <td className="px-6 py-4">{course.name}</td>
                  <td className="px-6 py-4">{course.teacher}</td>
                  <td className="px-6 py-4">{course.credits}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-center">
                      <a href="#" onClick={(e) => { e.preventDefault(); handleOpenEditModal(course); }} className="font-medium text-emerald-600 hover:underline">Edit</a>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 ease-out animate-fade-in-up">
             <style>{`
              @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Edit Course Details' : 'Add New Course'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-slate-700 mb-1">Course ID</label>
                <input id="courseId" name="id" type="text" value={currentCourse.id} readOnly className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed" />
              </div>
               <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
                <input id="code" name="code" type="text" value={currentCourse.code} onChange={handleInputChange} placeholder="e.g., CHEM-101" required className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition ${isEditMode ? 'bg-slate-100 cursor-not-allowed' : ''}`} readOnly={isEditMode} />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                <input id="name" name="name" type="text" value={currentCourse.name} onChange={handleInputChange} placeholder="e.g., Introduction to Chemistry" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition" />
              </div>
               <div>
                <label htmlFor="teacher" className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
                <select id="teacher" name="teacher" value={currentCourse.teacher} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition">
                  <option value="" disabled>Select a teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-slate-700 mb-1">Credits</label>
                <input id="credits" name="credits" type="number" min="1" max="5" value={currentCourse.credits} onChange={handleInputChange} placeholder="e.g., 3" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition" />
              </div>
              <div className="flex justify-end pt-4 space-x-4">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75">{isEditMode ? 'Save Changes' : 'Add Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Courses;