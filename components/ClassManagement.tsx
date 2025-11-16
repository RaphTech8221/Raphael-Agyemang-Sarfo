import React, { useState, useMemo } from 'react';
import { Student, Teacher, ClassAssignment } from '../types';

interface ClassManagementProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  teachers: Teacher[];
  classAssignments: ClassAssignment;
  setClassAssignments: React.Dispatch<React.SetStateAction<ClassAssignment>>;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ students: allStudents, setStudents: setAllStudents, teachers, classAssignments, setClassAssignments }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [targetGrade, setTargetGrade] = useState<number | string>('');
  const [targetClassName, setTargetClassName] = useState('');
  
  const [expandedGrade, setExpandedGrade] = useState<number | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  // State for CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);


  const studentsByGradeAndClass = useMemo(() => {
    return allStudents.reduce((acc, student) => {
      if (!acc[student.grade]) {
        acc[student.grade] = {};
      }
      if (!acc[student.grade][student.className]) {
        acc[student.grade][student.className] = [];
      }
      acc[student.grade][student.className].push(student);
      return acc;
    }, {} as Record<number, Record<string, Student[]>>);
  }, [allStudents]);

  const sortedGrades = useMemo(() => Object.keys(studentsByGradeAndClass).map(Number).sort((a, b) => a - b), [studentsByGradeAndClass]);
  const possibleGrades = [...Array(12).keys()].map(i => i + 1);

  const uniqueClasses = useMemo(() => {
    const classMap = allStudents.reduce((acc, student) => {
        if (!acc[student.className]) {
            acc[student.className] = { className: student.className, studentCount: 0, grade: student.grade };
        }
        acc[student.className].studentCount++;
        return acc;
    }, {} as Record<string, { className: string, studentCount: number, grade: number }>);
    return Object.values(classMap).sort((a, b) => a.grade - b.grade || a.className.localeCompare(b.className));
  }, [allStudents]);

  const handleOpenModal = (student: Student) => {
    setSelectedStudent(student);
    setTargetGrade(student.grade);
    setTargetClassName(student.className);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setTargetGrade('');
    setTargetClassName('');
  };

  const handleAssignmentChange = () => {
    if (selectedStudent && targetGrade && targetClassName) {
      setAllStudents(prevStudents =>
        prevStudents.map(s =>
          s.id === selectedStudent.id ? { ...s, grade: Number(targetGrade), className: targetClassName.trim() } : s
        )
      );
      handleCloseModal();
    }
  };

  const handleAssignTeacher = (className: string, teacherId: string) => {
    setClassAssignments(prev => {
        const newAssignments = {...prev};
        if (teacherId === "") {
            // Unassign if "Select Teacher" is chosen
            delete newAssignments[className];
        } else {
            newAssignments[className] = teacherId;
        }
        return newAssignments;
    });
  };

  const toggleGradeExpansion = (grade: number) => {
    setExpandedGrade(prevGrade => (prevGrade === grade ? null : grade));
  };
  
  const toggleClassExpansion = (grade: number, className: string) => {
    const key = `${grade}-${className}`;
    setExpandedClass(prevClass => (prevClass === key ? null : key));
  };
  
  // --- CSV Import Functions ---

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
    setImportFile(null);
    setImportErrors([]);
    setImportSuccess(false);
    setIsProcessing(false);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'text/csv') {
        setImportErrors(['Invalid file type. Please upload a .csv file.']);
        setImportFile(null);
        e.target.value = ''; // Reset file input
      } else {
        setImportFile(file);
        setImportErrors([]);
        setImportSuccess(false);
      }
    }
  };

  const handleProcessImport = () => {
    if (!importFile) return;

    setIsProcessing(true);
    setImportErrors([]);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').map(row => row.trim()).filter(row => row);
        const headerRow = rows.shift();
        
        if (!headerRow) throw new Error("CSV file is empty.");
        
        const header = headerRow.trim().split(',').map(h => h.trim());

        if (header.length !== 3 || header[0] !== 'student_id' || header[1] !== 'new_grade' || header[2] !== 'new_class_name') {
          throw new Error('Invalid CSV header. Expected columns: student_id, new_grade, new_class_name');
        }
        
        const errors: string[] = [];
        const updates: { studentId: string; newGrade: number; newClassName: string }[] = [];
        const studentIdSet = new Set(allStudents.map(s => s.id));

        rows.forEach((row, index) => {
          const rowNumber = index + 2; // +1 for header, +1 for 0-based index
          let rowIsValid = true;
          
          const values = row.split(',');
          if (values.length !== 3) {
            errors.push(`Row ${rowNumber}: Invalid number of columns. Expected 3, got ${values.length}.`);
            return;
          }

          const [studentId, newGradeStr, newClassName] = values.map(v => v.trim());
          
          if (!studentId) {
            errors.push(`Row ${rowNumber}: 'student_id' cannot be empty.`);
            rowIsValid = false;
          } else if (!studentIdSet.has(studentId)) {
            errors.push(`Row ${rowNumber}: Student ID "${studentId}" not found.`);
            rowIsValid = false;
          }
          
          const newGrade = parseInt(newGradeStr, 10);
          if (!newGradeStr) {
            errors.push(`Row ${rowNumber}: 'new_grade' cannot be empty.`);
            rowIsValid = false;
          } else if (isNaN(newGrade) || newGrade < 1 || newGrade > 12) {
            errors.push(`Row ${rowNumber}: Invalid grade "${newGradeStr}". Must be a number between 1 and 12.`);
            rowIsValid = false;
          }

          if (!newClassName) {
            errors.push(`Row ${rowNumber}: 'new_class_name' cannot be empty.`);
            rowIsValid = false;
          }

          if (rowIsValid) {
            updates.push({ studentId, newGrade, newClassName });
          }
        });

        if (errors.length > 0) {
          setImportErrors(errors);
        } else {
          let updatedStudents = [...allStudents];
          updates.forEach(update => {
            updatedStudents = updatedStudents.map(student =>
              student.id === update.studentId
                ? { ...student, grade: update.newGrade, className: update.newClassName }
                : student
            );
          });
          setAllStudents(updatedStudents);
          setImportSuccess(true);
          setTimeout(() => {
            handleCloseImportModal();
          }, 3000);
        }
      } catch (e: any) {
        setImportErrors([e.message || 'An unexpected error occurred while processing the file.']);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setImportErrors(['Failed to read the file.']);
      setIsProcessing(false);
    };

    reader.readAsText(importFile);
  };


  return (
    <div className="space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-slate-700 mb-4">Class Teacher Assignments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">Class</th>
                <th scope="col" className="px-6 py-3">Assigned Teacher</th>
                <th scope="col" className="px-6 py-3">Assign / Change</th>
              </tr>
            </thead>
            <tbody>
              {uniqueClasses.map(({ className, grade }) => {
                const assignedTeacherId = classAssignments[className];
                const assignedTeacher = teachers.find(t => t.id === assignedTeacherId);
                return (
                  <tr key={className} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      Class {className} <span className="text-xs text-slate-500">(Grade {grade})</span>
                    </td>
                    <td className="px-6 py-4">
                      {assignedTeacher ? (
                        <div className="flex items-center">
                          <img src={assignedTeacher.imageUrl} alt={assignedTeacher.name} className="w-8 h-8 rounded-full object-cover mr-3" />
                          <span>{assignedTeacher.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={assignedTeacherId || ''}
                        onChange={(e) => handleAssignTeacher(className, e.target.value)}
                        className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition appearance-none pr-8 bg-white"
                        aria-label={`Assign teacher for Class ${className}`}
                      >
                        <option value="">-- Select Teacher --</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-700">Student Class Assignments</h3>
          <button
            onClick={handleOpenImportModal}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <i className="fa-solid fa-file-csv mr-2"></i>
            Bulk Re-assign Students
          </button>
        </div>
        <div className="space-y-2">
          {sortedGrades.map(grade => (
            <div key={grade} className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleGradeExpansion(grade)}
                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 focus:outline-none"
              >
                <h4 className="font-bold text-slate-800 text-lg">Grade {grade}</h4>
                <i className={`fa-solid fa-chevron-down text-slate-500 transition-transform duration-300 ${expandedGrade === grade ? 'rotate-180' : ''}`}></i>
              </button>
              {expandedGrade === grade && (
                <div className="bg-white p-4 space-y-2 animate-fade-in">
                  <style>{`
                    @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                    .animate-fade-in { animation: fade-in 0.5s ease-out; }
                  `}</style>
                  {Object.keys(studentsByGradeAndClass[grade]).sort().map(className => (
                    <div key={className} className="border border-slate-200 rounded-md overflow-hidden">
                      <button 
                        onClick={() => toggleClassExpansion(grade, className)}
                        className="w-full flex justify-between items-center p-3 bg-slate-100 hover:bg-slate-200 focus:outline-none text-left"
                      >
                         <h5 className="font-semibold text-slate-700">
                            Class {className}
                            <span className="ml-3 text-xs font-medium text-white bg-sky-500 px-2 py-0.5 rounded-full">
                                {studentsByGradeAndClass[grade][className].length} Students
                            </span>
                         </h5>
                         <i className={`fa-solid fa-chevron-down text-slate-500 transition-transform duration-200 text-xs ${expandedClass === `${grade}-${className}` ? 'rotate-180' : ''}`}></i>
                      </button>
                      {expandedClass === `${grade}-${className}` && (
                        <div className="p-2 animate-fade-in">
                           <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                  <th scope="col" className="px-4 py-2">Photo</th>
                                  <th scope="col" className="px-4 py-2">Student ID</th>
                                  <th scope="col" className="px-4 py-2">Name</th>
                                  <th scope="col" className="px-4 py-2 text-center">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {studentsByGradeAndClass[grade][className].map(student => (
                                  <tr key={student.id} className="border-b last:border-b-0 hover:bg-slate-50">
                                    <td className="px-4 py-2">
                                      <img src={student.imageUrl || 'https://via.placeholder.com/40'} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-slate-900">{student.id}</td>
                                    <td className="px-4 py-2">{student.name}</td>
                                    <td className="px-4 py-2 text-center">
                                      <button
                                        onClick={() => handleOpenModal(student)}
                                        className="font-medium text-sky-600 hover:underline text-xs"
                                      >
                                        Change Assignment
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 ease-out animate-fade-in-up">
            <style>{`
              @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Change Assignment</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-slate-600">
                Editing assignment for <span className="font-semibold text-slate-800">{selectedStudent.name}</span>.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gradeSelect" className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
                  <select
                    id="gradeSelect"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                  >
                    {possibleGrades.map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
                 <div>
                  <label htmlFor="classNameInput" className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                  <input
                    id="classNameInput"
                    type="text"
                    value={targetClassName}
                    onChange={(e) => setTargetClassName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                    placeholder="e.g., 5A"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignmentChange}
                  className="px-6 py-2 rounded-lg text-white bg-sky-500 hover:bg-sky-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center overflow-y-auto" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 ease-out animate-fade-in-up">
                 <style>{`
                  @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                  .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                `}</style>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Bulk Re-assign Students</h3>
                    <button onClick={handleCloseImportModal} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>
                
                {isProcessing ? (
                    <div className="text-center p-8">
                        <i className="fa-solid fa-spinner fa-spin text-4xl text-teal-500"></i>
                        <p className="mt-4 text-slate-600">Processing file, please wait...</p>
                    </div>
                ) : importSuccess ? (
                    <div className="text-center p-8">
                        <i className="fa-solid fa-circle-check text-5xl text-green-500 mb-4"></i>
                        <h4 className="text-xl font-bold text-slate-800">Import Successful!</h4>
                        <p className="text-slate-600 mt-2">Student assignments have been updated.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                            <p className="font-semibold text-slate-700 mb-2">Instructions:</p>
                            <ul className="list-disc list-inside text-slate-600 space-y-1">
                                <li>Upload a CSV file with exactly three columns.</li>
                                <li>The required header row must be: <code className="bg-slate-200 px-1 rounded text-xs">student_id,new_grade,new_class_name</code></li>
                                <li>Each row should contain a valid Student ID, a grade (1-12), and the new class name.</li>
                            </ul>
                        </div>
                        <div>
                            <label htmlFor="csv-upload" className="block text-sm font-medium text-slate-700 mb-1">CSV File</label>
                            <input 
                                id="csv-upload"
                                type="file" 
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                            />
                        </div>

                        {importErrors.length > 0 && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-h-40 overflow-y-auto">
                                <p className="font-semibold text-red-700 mb-2">Validation Errors Found:</p>
                                <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                                    {importErrors.map((error, index) => <li key={index}>{error}</li>)}
                                </ul>
                            </div>
                        )}
                        
                        <div className="flex justify-end pt-4 space-x-4">
                            <button onClick={handleCloseImportModal} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
                            <button onClick={handleProcessImport} disabled={!importFile} className="px-6 py-2 rounded-lg text-white bg-teal-500 hover:bg-teal-600 transition font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed">
                                <i className="fa-solid fa-upload mr-2"></i>
                                Import
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;