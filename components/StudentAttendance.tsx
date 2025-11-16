import React, { useState, useMemo } from 'react';
import { User, Student, ClassAssignment, StudentAttendanceRecord } from '../types';

type AttendanceStatus = 'Present' | 'Absent' | 'Late';

interface StudentAttendanceProps {
  currentUser: User;
  students: Student[];
  classAssignments: ClassAssignment;
  studentAttendance: StudentAttendanceRecord[];
  setStudentAttendance: React.Dispatch<React.SetStateAction<StudentAttendanceRecord[]>>;
}

const StudentAttendance: React.FC<StudentAttendanceProps> = ({ currentUser, students, classAssignments, studentAttendance, setStudentAttendance }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const assignedClass = useMemo(() => {
    if (currentUser.role !== 'teacher') return null;
    const entry = Object.entries(classAssignments).find(([_, teacherId]) => teacherId === currentUser.id);
    return entry ? entry[0] : null;
  }, [classAssignments, currentUser]);

  const classStudents = useMemo(() => {
    if (!assignedClass) return [];
    return students.filter(student => student.className === assignedClass).sort((a,b) => a.name.localeCompare(b.name));
  }, [students, assignedClass]);

  const attendanceForDate = useMemo(() => {
    const records = new Map<string, AttendanceStatus>();
    studentAttendance
      .filter(rec => rec.date === selectedDate)
      .forEach(rec => records.set(rec.studentId, rec.status));
    return records;
  }, [studentAttendance, selectedDate]);

  const handleMarkAttendance = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendance(prev => {
        const existingIndex = prev.findIndex(rec => rec.studentId === studentId && rec.date === selectedDate);
        
        if (existingIndex > -1) {
            // Update existing record
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], status };
            return updated;
        } else {
            // Add new record
            return [...prev, { studentId, date: selectedDate, status }];
        }
    });
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setStudentAttendance(prev => {
        const updatedAttendance = [...prev];
        const studentIdsInClass = new Set(classStudents.map(s => s.id));
        
        // Create a map of existing records for the selected date for efficient lookup
        const existingRecordsMap = new Map<string, StudentAttendanceRecord>();
        updatedAttendance.forEach(rec => {
            if (rec.date === selectedDate && studentIdsInClass.has(rec.studentId)) {
                existingRecordsMap.set(rec.studentId, rec);
            }
        });
        
        classStudents.forEach(student => {
            const existingRecord = existingRecordsMap.get(student.id);
            if (existingRecord) {
                existingRecord.status = status;
            } else {
                updatedAttendance.push({ studentId: student.id, date: selectedDate, status });
            }
        });
        
        return updatedAttendance;
    });
  };
  
  const attendanceSummary = useMemo(() => {
    const summary = { Present: 0, Absent: 0, Late: 0, Unmarked: 0 };
    classStudents.forEach(student => {
        const status = attendanceForDate.get(student.id);
        if (status) {
            summary[status]++;
        } else {
            summary.Unmarked++;
        }
    });
    return summary;
  }, [classStudents, attendanceForDate]);

  if (!assignedClass) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <i className="fa-solid fa-circle-info text-4xl text-sky-500 mb-4"></i>
        <h3 className="text-xl font-bold text-slate-700">No Class Assigned</h3>
        <p className="text-slate-500 mt-2">You have not been assigned as a class teacher. Please contact an administrator.</p>
      </div>
    );
  }

  const getStatusButtonStyle = (studentId: string, status: AttendanceStatus) => {
    const currentStatus = attendanceForDate.get(studentId);
    if (currentStatus === status) {
        switch(status) {
            case 'Present': return 'bg-green-500 text-white';
            case 'Absent': return 'bg-red-500 text-white';
            case 'Late': return 'bg-yellow-500 text-white';
        }
    }
    return 'bg-slate-200 text-slate-700 hover:bg-slate-300';
  }


  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
                <h3 className="text-2xl font-bold text-slate-800">Class Attendance</h3>
                <p className="text-slate-500">You are the assigned teacher for Class <span className="font-semibold text-indigo-600">{assignedClass}</span>.</p>
            </div>
            <div className="flex items-center gap-4">
                 <label htmlFor="attendance-date" className="font-medium text-slate-700">Date:</label>
                <input
                    id="attendance-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
            </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-slate-700">Summary:</span>
                <span className="text-green-600">Present: {attendanceSummary.Present}</span>
                <span className="text-red-600">Absent: {attendanceSummary.Absent}</span>
                <span className="text-yellow-600">Late: {attendanceSummary.Late}</span>
                <span className="text-slate-500">Unmarked: {attendanceSummary.Unmarked}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => handleMarkAll('Present')} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md transition">Mark All Present</button>
                <button onClick={() => handleMarkAll('Absent')} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition">Mark All Absent</button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Student Photo</th>
                        <th scope="col" className="px-6 py-3">Student ID</th>
                        <th scope="col" className="px-6 py-3">Student Name</th>
                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {classStudents.map(student => (
                        <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-3">
                                <img src={student.imageUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover"/>
                            </td>
                            <td className="px-6 py-3 font-medium text-slate-900">{student.id}</td>
                            <td className="px-6 py-3">{student.name}</td>
                            <td className="px-6 py-3">
                                <div className="flex justify-center items-center gap-2">
                                    <button onClick={() => handleMarkAttendance(student.id, 'Present')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${getStatusButtonStyle(student.id, 'Present')}`}>Present</button>
                                    <button onClick={() => handleMarkAttendance(student.id, 'Absent')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${getStatusButtonStyle(student.id, 'Absent')}`}>Absent</button>
                                    <button onClick={() => handleMarkAttendance(student.id, 'Late')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${getStatusButtonStyle(student.id, 'Late')}`}>Late</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default StudentAttendance;
