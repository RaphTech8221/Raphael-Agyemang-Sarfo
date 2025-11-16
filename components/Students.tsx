import React, { useState, useMemo } from 'react';
import { COURSES_DATA, ASSESSMENTS_DATA } from '../constants';
import { Student, User, View } from '../types';

interface StudentsProps {
  currentUser: User;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  onPrintRequest: (student: Student) => void;
}

const Students: React.FC<StudentsProps> = ({ currentUser, students: allStudents, setStudents: setAllStudents, onPrintRequest }) => {

  const courses = useMemo(() => {
    try {
        const saved = localStorage.getItem('courses');
        return saved ? JSON.parse(saved) : COURSES_DATA;
    } catch { return COURSES_DATA; }
  }, []);
  
  const assessments = useMemo(() => {
      try {
          const saved = localStorage.getItem('assessments');
          return saved ? JSON.parse(saved) : ASSESSMENTS_DATA;
      } catch { return ASSESSMENTS_DATA; }
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [currentStudent, setCurrentStudent] = useState({
    id: '',
    name: '',
    grade: '',
    className: '',
    enrollmentDate: '',
    guardian: '',
    imageUrl: '',
    dateOfBirth: '',
    address: '',
    guardianPhone: '',
  });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const isPrivilegedUser = currentUser.role === 'admin' || currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const students = useMemo(() => {
    if (isAdmin || currentUser.role !== 'teacher') {
        return allStudents;
    }
    const teacherCourses = courses.filter(c => c.teacher === currentUser.name).map(c => c.name);
    const studentNamesInCourses = new Set(
        assessments.filter(a => teacherCourses.includes(a.courseName)).map(a => a.studentName)
    );
    return allStudents.filter(s => studentNamesInCourses.has(s.name));
  }, [currentUser, allStudents, courses, assessments, isAdmin]);

  const uniqueGrades = useMemo(() => {
    const grades = students.map(s => s.grade).sort((a, b) => a - b);
    return [...new Set(grades)];
  }, [students]);

  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setIsEditMode(false);
    
    const highestIdNum = allStudents.reduce((max, student) => {
        const idNum = parseInt(student.id.substring(1), 10);
        return idNum > max ? idNum : max;
    }, 0);
    const newId = `S${(highestIdNum + 1).toString().padStart(3, '0')}`;

    setCurrentStudent({
        id: newId,
        name: '',
        grade: '',
        className: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        guardian: '',
        imageUrl: '',
        dateOfBirth: '',
        address: '',
        guardianPhone: '',
    });
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (student: Student) => {
    if (!isAdmin) return;
    setIsEditMode(true);
    // FIX: Explicitly map `Student` properties to the form state to avoid a type mismatch.
    // The `Student` type has optional `imageUrl` and `password` properties, while the `currentStudent`
    // state requires `imageUrl` and has no `password`. Spreading `student` directly caused an error.
    setCurrentStudent({
        id: student.id,
        name: student.name,
        grade: student.grade.toString(),
        className: student.className,
        enrollmentDate: student.enrollmentDate,
        guardian: student.guardian,
        imageUrl: student.imageUrl || '',
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        guardianPhone: student.guardianPhone,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleOpenDeleteModal = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setStudentToDelete(null);
    setIsDeleteModalOpen(false);
  };
  
  const handleConfirmDelete = () => {
    if (studentToDelete) {
      setAllStudents(prevStudents => prevStudents.filter(s => s.id !== studentToDelete.id));
      handleCloseDeleteModal();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentStudent(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target && typeof loadEvent.target.result === 'string') {
          setCurrentStudent(prevState => ({ ...prevState, imageUrl: loadEvent.target.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStudent.id && currentStudent.name && currentStudent.grade && currentStudent.className && currentStudent.enrollmentDate && currentStudent.guardian && currentStudent.dateOfBirth && currentStudent.address && currentStudent.guardianPhone) {
      const studentToSave: Student = {
        ...currentStudent,
        grade: parseInt(currentStudent.grade, 10),
      };

      if (isEditMode) {
          setAllStudents(prevStudents => prevStudents.map(s => s.id === studentToSave.id ? studentToSave : s));
      } else {
          setAllStudents(prevStudents => [...prevStudents, studentToSave]);
      }
      handleCloseModal();
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGrade('');
  };

  const filteredStudents = useMemo(() => students.filter(student => {
    const searchMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const gradeMatch = selectedGrade ? student.grade.toString() === selectedGrade : true;

    return searchMatch && gradeMatch;
  }), [students, searchTerm, selectedGrade]);

  const handleExport = () => {
    if (filteredStudents.length === 0) return;

    const headers = ['id', 'name', 'grade', 'className', 'enrollmentDate', 'guardian', 'dateOfBirth', 'address', 'guardianPhone'];
    
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => 
        headers.map(header => {
          let value = student[header as keyof Student];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-700">{!isAdmin ? 'My Students' : 'Student Roster'}</h3>
          {isAdmin && (
            <div className="flex items-center gap-2">
                <button
                onClick={handleExport}
                disabled={filteredStudents.length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center disabled:bg-slate-300 disabled:cursor-not-allowed">
                    <i className="fa-solid fa-file-export mr-2"></i>
                    Export CSV
                </button>
                <button
                onClick={handleOpenAddModal}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Student
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
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          <div className="relative flex-grow sm:flex-grow-0">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition appearance-none pr-8 bg-white"
            >
              <option value="">All Grades</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
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
                <th scope="col" className="px-6 py-3">Photo</th>
                <th scope="col" className="px-6 py-3">Student ID</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Grade</th>
                <th scope="col" className="px-6 py-3">Class</th>
                <th scope="col" className="px-6 py-3">Date of Birth</th>
                <th scope="col" className="px-6 py-3">Address</th>
                <th scope="col" className="px-6 py-3">Guardian Phone</th>
                <th scope="col" className="px-6 py-3">Guardian</th>
                {isPrivilegedUser && <th scope="col" className="px-6 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <img src={student.imageUrl || 'https://via.placeholder.com/40'} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{student.id}</td>
                  <td className="px-6 py-4">{student.name}</td>
                  <td className="px-6 py-4">{student.grade}</td>
                  <td className="px-6 py-4">{student.className}</td>
                  <td className="px-6 py-4">{student.dateOfBirth}</td>
                  <td className="px-6 py-4">{student.address}</td>
                  <td className="px-6 py-4">{student.guardianPhone}</td>
                  <td className="px-6 py-4">{student.guardian}</td>
                  {isPrivilegedUser && (
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center space-x-4">
                        <button onClick={(e) => { e.preventDefault(); onPrintRequest(student); }} className="font-medium text-emerald-600 hover:underline">
                          <i className="fa-solid fa-print mr-1"></i>Report
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={(e) => { e.preventDefault(); handleOpenEditModal(student); }} className="font-medium text-sky-600 hover:underline">Edit</button>
                            <button onClick={() => handleOpenDeleteModal(student)} className="font-medium text-red-600 hover:underline">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center overflow-y-auto" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 ease-out animate-fade-in-up">
            <style>{`
              @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Edit Student Details' : 'Add New Student'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                <input
                  id="studentId"
                  name="id"
                  type="text"
                  value={currentStudent.id}
                  required
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition bg-slate-100 cursor-not-allowed"
                  aria-label="Student ID"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={currentStudent.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
                  <input
                    id="grade"
                    name="grade"
                    type="number"
                    min="1"
                    max="12"
                    value={currentStudent.grade}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="className" className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                  <input
                    id="className"
                    name="className"
                    type="text"
                    value={currentStudent.className}
                    onChange={handleInputChange}
                    placeholder="e.g., 5A"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                  />
                </div>
              </div>
               <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={currentStudent.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label htmlFor="guardian" className="block text-sm font-medium text-slate-700 mb-1">Guardian's Name</label>
                <input
                  id="guardian"
                  name="guardian"
                  type="text"
                  value={currentStudent.guardian}
                  onChange={handleInputChange}
                  placeholder="e.g., Jane Doe"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
               <div>
                <label htmlFor="guardianPhone" className="block text-sm font-medium text-slate-700 mb-1">Guardian's Phone</label>
                <input
                  id="guardianPhone"
                  name="guardianPhone"
                  type="tel"
                  value={currentStudent.guardianPhone}
                  onChange={handleInputChange}
                  placeholder="e.g., 555-123-4567"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
               <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={currentStudent.address}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g., 123 Main St, Anytown, USA"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label htmlFor="enrollmentDate" className="block text-sm font-medium text-slate-700 mb-1">Enrollment Date</label>
                <input
                  id="enrollmentDate"
                  name="enrollmentDate"
                  type="date"
                  value={currentStudent.enrollmentDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
               <div>
                <label htmlFor="photoUpload" className="block text-sm font-medium text-slate-700 mb-1">Student Photo</label>
                <input
                  id="photoUpload"
                  name="photoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>
              {currentStudent.imageUrl && (
                <div className="text-center">
                    <img src={currentStudent.imageUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover inline-block border-4 border-slate-200" />
                </div>
              )}
              <div className="flex justify-end pt-4 space-x-4">
                  <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                  <button type="submit" className="px-6 py-2 rounded-lg text-white bg-sky-500 hover:bg-sky-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75">{isEditMode ? 'Save Changes' : 'Add Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 ease-out animate-fade-in-up">
            <style>{`
              @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <i className="fa-solid fa-triangle-exclamation text-2xl text-red-600"></i>
              </div>
              <h3 className="text-lg leading-6 font-bold text-slate-900 mt-5">Delete Student</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete <span className="font-semibold">{studentToDelete.name}</span>? This action is permanent and cannot be undone.
                </p>
              </div>
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition font-semibold"
                >
                  Delete Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Students;