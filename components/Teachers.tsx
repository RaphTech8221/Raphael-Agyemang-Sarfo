import React, { useState, useMemo } from 'react';
import { Teacher } from '../types';

interface TeachersProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
}

const Teachers: React.FC<TeachersProps> = ({ teachers, setTeachers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [emailError, setEmailError] = useState('');
  const [currentTeacher, setCurrentTeacher] = useState<Omit<Teacher, 'id'> & { id: string; }>({
    id: '',
    name: '',
    subject: '',
    hireDate: '',
    email: '',
    imageUrl: '',
    phone: '',
    qualifications: '',
  });

  const uniqueSubjects = useMemo(() => {
    const subjects = teachers.map(t => t.subject).sort();
    return [...new Set(subjects)];
  }, [teachers]);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentTeacher({
      id: '',
      name: '',
      subject: '',
      hireDate: new Date().toISOString().split('T')[0],
      email: '',
      imageUrl: '',
      phone: '',
      qualifications: '',
    });
    setEmailError('');
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (teacher: Teacher) => {
      setIsEditMode(true);
      setCurrentTeacher(teacher);
      setEmailError('');
      setIsModalOpen(true);
  };

  const handleOpenScheduleModal = (teacher: Teacher) => {
    setViewingTeacher(teacher);
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setViewingTeacher(null);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmailError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value) && value) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
    }
    setCurrentTeacher(prevState => ({ ...prevState, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target && typeof loadEvent.target.result === 'string') {
          setCurrentTeacher(prevState => ({ ...prevState, imageUrl: loadEvent.target.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentTeacher.email)) {
        setEmailError('Please enter a valid email address.');
        return;
    }

    if (currentTeacher.id && currentTeacher.name && currentTeacher.subject && currentTeacher.hireDate && currentTeacher.email && !emailError) {
      if (isEditMode) {
        setTeachers(prev => prev.map(t => t.id === currentTeacher.id ? currentTeacher : t));
      } else {
        setTeachers(prev => [...prev, currentTeacher]);
      }
      handleCloseModal();
    }
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
  };

  const filteredTeachers = useMemo(() => teachers.filter(teacher => {
    const searchMatch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        teacher.id.toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = selectedSubject ? teacher.subject === selectedSubject : true;
    return searchMatch && subjectMatch;
  }), [teachers, searchTerm, selectedSubject]);

  const handleExport = () => {
    if (filteredTeachers.length === 0) return;

    const headers = ['id', 'name', 'subject', 'hireDate', 'email', 'phone', 'qualifications'];
    
    const csvContent = [
      headers.join(','),
      ...filteredTeachers.map(teacher => 
        headers.map(header => {
          let value = teacher[header as keyof Teacher];
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
    link.setAttribute('download', 'teachers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-700">Teacher Directory</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={filteredTeachers.length === 0}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center disabled:bg-slate-300 disabled:cursor-not-allowed">
                <i className="fa-solid fa-file-export mr-2"></i>
                Export CSV
            </button>
            <button
              onClick={handleOpenAddModal}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
              <i className="fa-solid fa-plus mr-2"></i>
              Add Teacher
            </button>
          </div>
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
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div className="relative flex-grow sm:flex-grow-0">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none pr-8 bg-white"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
          </div>
          <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
            Reset Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <img src={teacher.imageUrl || 'https://via.placeholder.com/80'} alt={teacher.name} className="w-20 h-20 rounded-full object-cover border-4 border-slate-100" />
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-800">{teacher.name}</h4>
                    <p className="text-sm font-medium text-indigo-600">{teacher.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">Hired: {teacher.hireDate}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <h5 className="font-semibold text-slate-600">Qualifications</h5>
                    <p className="text-slate-500 text-xs">{teacher.qualifications}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-600">Contact</h5>
                    <p className="text-slate-500 flex items-center text-xs"><i className="fa-solid fa-envelope w-4 mr-2 text-slate-400"></i>{teacher.email}</p>
                    <p className="text-slate-500 flex items-center mt-1 text-xs"><i className="fa-solid fa-phone w-4 mr-2 text-slate-400"></i>{teacher.phone}</p>
                  </div>
                </div>
              </div>
              <div className="mt-auto p-4 bg-slate-50 rounded-b-xl border-t border-slate-200 flex justify-end space-x-2">
                <button onClick={() => handleOpenScheduleModal(teacher)} className="font-medium text-sm text-sky-600 hover:text-sky-800 bg-sky-100 hover:bg-sky-200 px-3 py-1.5 rounded-md transition">
                    <i className="fa-solid fa-calendar-days mr-1.5"></i>View Schedule
                </button>
                <button onClick={() => handleOpenEditModal(teacher)} className="font-medium text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-md transition">
                    <i className="fa-solid fa-pencil mr-1.5"></i>Edit
                </button>
              </div>
            </div>
          ))}
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
              <h3 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Edit Teacher Details' : 'Add New Teacher'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-slate-700 mb-1">Teacher ID</label>
                <input id="teacherId" name="id" type="text" value={currentTeacher.id} onChange={handleInputChange} placeholder="e.g., T05" required className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition ${isEditMode ? 'bg-slate-100 cursor-not-allowed' : ''}`} readOnly={isEditMode} />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input id="name" name="name" type="text" value={currentTeacher.name} onChange={handleInputChange} placeholder="e.g., Mr. John Smith" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input id="subject" name="subject" type="text" value={currentTeacher.subject} onChange={handleInputChange} placeholder="e.g., Mathematics" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>
              <div>
                <label htmlFor="hireDate" className="block text-sm font-medium text-slate-700 mb-1">Hire Date</label>
                <input id="hireDate" name="hireDate" type="date" value={currentTeacher.hireDate} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={currentTeacher.email}
                  onChange={handleInputChange}
                  placeholder="e.g., j.smith@raphtech.edu"
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition ${emailError ? 'border-red-500 focus:border-red-500' : 'border-slate-300'}`}
                />
                 {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
              </div>
               <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input id="phone" name="phone" type="tel" value={currentTeacher.phone} onChange={handleInputChange} placeholder="e.g., 555-123-4567" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>
              <div>
                <label htmlFor="qualifications" className="block text-sm font-medium text-slate-700 mb-1">Qualifications</label>
                <input id="qualifications" name="qualifications" type="text" value={currentTeacher.qualifications} onChange={handleInputChange} placeholder="e.g., M.Ed. in Subject" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>
              <div>
                <label htmlFor="photoUpload" className="block text-sm font-medium text-slate-700 mb-1">Teacher Photo</label>
                <input
                  id="photoUpload"
                  name="photoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
               {currentTeacher.imageUrl && (
                <div className="text-center">
                    <img src={currentTeacher.imageUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover inline-block border-4 border-slate-200" />
                </div>
              )}
              <div className="flex justify-end pt-4 space-x-4">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75">{isEditMode ? 'Save Changes' : 'Add Teacher'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isScheduleModalOpen && viewingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center overflow-y-auto" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl m-4 transform transition-all duration-300 ease-out animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                  <h3 className="text-2xl font-bold text-slate-800">Weekly Schedule</h3>
                  <p className="text-slate-500">{viewingTeacher.name} - {viewingTeacher.subject}</p>
              </div>
              <button onClick={handleCloseScheduleModal} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 border-collapse">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                          <th scope="col" className="px-4 py-3 border border-slate-200">Time</th>
                          <th scope="col" className="px-4 py-3 border border-slate-200">Monday</th>
                          <th scope="col" className="px-4 py-3 border border-slate-200">Tuesday</th>
                          <th scope="col" className="px-4 py-3 border border-slate-200">Wednesday</th>
                          <th scope="col" className="px-4 py-3 border border-slate-200">Thursday</th>
                          <th scope="col" className="px-4 py-3 border border-slate-200">Friday</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr className="bg-white">
                          <td className="px-4 py-3 font-medium text-slate-900 border border-slate-200">09:00 - 10:00</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 8 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Planning Period</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 8 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 9 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 8 Class</td>
                      </tr>
                      <tr className="bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900 border border-slate-200">10:00 - 11:00</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 9 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 8 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 9 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Planning Period</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 9 Class</td>
                      </tr>
                      <tr className="bg-white">
                          <td className="px-4 py-3 font-medium text-slate-900 border border-slate-200">11:00 - 12:00</td>
                          <td className="px-4 py-3 border border-slate-200">Study Hall</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 9 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Study Hall</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 8 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Staff Meeting</td>
                      </tr>
                      <tr className="bg-slate-50">
                          <td colSpan={6} className="px-4 py-3 text-center font-semibold text-slate-600 border border-slate-200">12:00 - 13:00 LUNCH</td>
                      </tr>
                      <tr className="bg-white">
                          <td className="px-4 py-3 font-medium text-slate-900 border border-slate-200">13:00 - 14:00</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 7 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 7 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 7 Class</td>
                          <td className="px-4 py-3 border border-slate-200">Office Hours</td>
                          <td className="px-4 py-3 border border-slate-200">Grade 7 Class</td>
                      </tr>
                  </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-6">
              <button type="button" onClick={handleCloseScheduleModal} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Teachers;