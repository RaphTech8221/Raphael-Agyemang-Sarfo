import React, { useState, useMemo, useEffect } from 'react';
import { Assessment, User, Student, Course } from '../types';

const assessmentTypes: Assessment['type'][] = ['Quiz', 'Test', 'Homework', 'Project'];

interface AssessmentsProps {
  currentUser: User;
  students: Student[];
  assessments: Assessment[];
  setAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  courses: Course[];
}

const Assessments: React.FC<AssessmentsProps> = ({ currentUser, students, assessments, setAssessments, courses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [newAssessment, setNewAssessment] = useState({
    id: '',
    studentName: '',
    courseName: '',
    type: 'Quiz' as Assessment['type'],
    date: '',
    score: '',
  });

  const uniqueCourses = useMemo(() => {
    const courseNames = assessments.map(a => a.courseName).sort();
    return [...new Set(courseNames)];
  }, [assessments]);

  const handleOpenModal = () => {
    setNewAssessment({
      id: `A${(assessments.length + 1).toString().padStart(3, '0')}`,
      studentName: '',
      courseName: '',
      type: 'Quiz',
      date: new Date().toISOString().split('T')[0],
      score: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAssessment(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleAddAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssessment.studentName && newAssessment.courseName && newAssessment.type && newAssessment.date && newAssessment.score) {
       const assessmentToAdd: Assessment = {
        ...newAssessment,
        score: parseInt(newAssessment.score, 10),
        type: newAssessment.type as Assessment['type'],
      };
      setAssessments(prev => [...prev, assessmentToAdd]);
      handleCloseModal();
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCourse('');
    setSelectedType('');
    setStartDate('');
    setEndDate('');
  };

  const filteredAssessments = useMemo(() => {
    let data = assessments;
    if (currentUser.role === 'student') {
        data = assessments.filter(a => a.studentName === currentUser.name);
    }

    return data.filter(assessment => {
        const searchMatch = assessment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            assessment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            assessment.id.toLowerCase().includes(searchTerm.toLowerCase());
        const courseMatch = selectedCourse ? assessment.courseName === selectedCourse : true;
        const typeMatch = selectedType ? assessment.type === selectedType : true;
        
        const assessmentDate = new Date(assessment.date);
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        const dateMatch = 
            (!startDateObj || assessmentDate >= startDateObj) &&
            (!endDateObj || assessmentDate <= endDateObj);

        return searchMatch && courseMatch && typeMatch && dateMatch;
    })
  }, [assessments, searchTerm, selectedCourse, selectedType, currentUser, startDate, endDate]);


  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-700">Student Assessments</h3>
          {currentUser.role === 'admin' && (
            <button
                onClick={handleOpenModal}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
                <i className="fa-solid fa-plus mr-2"></i>
                Add Assessment
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="relative flex-grow sm:flex-grow-0">
             <label htmlFor="search" className="block text-xs font-medium text-slate-500 mb-1">Search</label>
            <div className="relative">
                 <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  id="search"
                  type="text"
                  placeholder="Student, course, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition"
                />
            </div>
          </div>
          <div className="relative flex-grow sm:flex-grow-0">
             <label htmlFor="courseFilter" className="block text-xs font-medium text-slate-500 mb-1">Course</label>
            <select
              id="courseFilter"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition appearance-none pr-8 bg-white"
            >
              <option value="">All Courses</option>
              {uniqueCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 bottom-3 text-slate-400 pointer-events-none"></i>
          </div>
          <div className="relative flex-grow sm:flex-grow-0">
             <label htmlFor="typeFilter" className="block text-xs font-medium text-slate-500 mb-1">Type</label>
            <select
              id="typeFilter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition appearance-none pr-8 bg-white"
            >
              <option value="">All Types</option>
              {assessmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 bottom-3 text-slate-400 pointer-events-none"></i>
          </div>
           <div className="relative flex-grow sm:flex-grow-0">
                <label htmlFor="startDate" className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-40 px-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition"
                />
            </div>
            <div className="relative flex-grow sm:flex-grow-0">
                <label htmlFor="endDate" className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-40 px-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition"
                />
            </div>
          <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition self-end h-[42px]">
            Reset Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">Assessment ID</th>
                <th scope="col" className="px-6 py-3">Student Name</th>
                <th scope="col" className="px-6 py-3">Course</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Score (%)</th>
                {currentUser.role === 'admin' && <th scope="col" className="px-6 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((assessment) => (
                <tr key={assessment.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{assessment.id}</td>
                  <td className="px-6 py-4">{assessment.studentName}</td>
                  <td className="px-6 py-4">{assessment.courseName}</td>
                  <td className="px-6 py-4">{assessment.type}</td>
                  <td className="px-6 py-4">{assessment.date}</td>
                  <td className="px-6 py-4">{assessment.score}</td>
                  {currentUser.role === 'admin' && (
                    <td className="px-6 py-4 text-center">
                      <a href="#" className="font-medium text-rose-600 hover:underline">Edit</a>
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
              <h3 className="text-2xl font-bold text-slate-800">Add New Assessment</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>
            <form onSubmit={handleAddAssessment} className="space-y-4">
              <div>
                <label htmlFor="assessmentId" className="block text-sm font-medium text-slate-700 mb-1">Assessment ID</label>
                <input id="assessmentId" name="id" type="text" value={newAssessment.id} readOnly className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed" />
              </div>
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                <select id="studentName" name="studentName" value={newAssessment.studentName} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition">
                  <option value="" disabled>Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.name}>{student.name}</option>
                  ))}
                </select>
              </div>
               <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                <select id="courseName" name="courseName" value={newAssessment.courseName} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition">
                  <option value="" disabled>Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Assessment Type</label>
                <select id="type" name="type" value={newAssessment.type} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition">
                  <option value="Quiz">Quiz</option>
                  <option value="Test">Test</option>
                  <option value="Homework">Homework</option>
                  <option value="Project">Project</option>
                </select>
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input id="date" name="date" type="date" value={newAssessment.date} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition" />
              </div>
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-slate-700 mb-1">Score (%)</label>
                <input id="score" name="score" type="number" min="0" max="100" value={newAssessment.score} onChange={handleInputChange} placeholder="e.g., 85" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition" />
              </div>
              <div className="flex justify-end pt-4 space-x-4">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-rose-500 hover:bg-rose-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-75">Add Assessment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Assessments;