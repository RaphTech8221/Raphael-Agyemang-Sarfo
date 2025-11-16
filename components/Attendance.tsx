import React, { useState, useMemo, useEffect } from 'react';
import { AttendanceRecord, Teacher } from '../types';

const attendanceStatuses: AttendanceRecord['status'][] = ['Present', 'Absent', 'Checked Out'];

interface AttendanceProps {
  teachers: Teacher[];
}

const Attendance: React.FC<AttendanceProps> = ({ teachers }) => {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `attendance_${today}`;

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const savedAttendance = localStorage.getItem(storageKey);
      if (savedAttendance) {
        return JSON.parse(savedAttendance);
      }
    } catch (error) {
        console.error("Error parsing attendance from localStorage", error);
    }
    
    return teachers.map(teacher => ({
      teacherId: teacher.id,
      teacherName: teacher.name,
      status: 'Absent' as 'Absent',
      checkInTime: null,
      checkOutTime: null,
    }));
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(attendance));
  }, [attendance, storageKey]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleRefreshList = () => {
    setAttendance(currentAttendance => {
        const attendanceMap = new Map<string, AttendanceRecord>();
        currentAttendance.forEach(record => {
            attendanceMap.set(record.teacherId, record);
        });

        const newAttendanceList = teachers.map(teacher => {
            const existingRecord = attendanceMap.get(teacher.id);
            if (existingRecord) {
                return existingRecord; // Keep existing record if teacher is still here
            }
            // Add a new record for a newly added teacher
            return {
                teacherId: teacher.id,
                teacherName: teacher.name,
                status: 'Absent' as 'Absent',
                checkInTime: null,
                checkOutTime: null,
            };
        });
        
        return newAttendanceList;
    });
  };

  const handleCheckIn = (teacherId: string) => {
    setAttendance(prev =>
      prev.map(record =>
        record.teacherId === teacherId
          ? {
              ...record,
              status: 'Present',
              checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            }
          : record
      )
    );
  };

  const handleCheckOut = (teacherId: string) => {
    setAttendance(prev =>
      prev.map(record =>
        record.teacherId === teacherId
          ? {
              ...record,
              status: 'Checked Out',
              checkOutTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            }
          : record
      )
    );
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
  };

  const filteredAttendance = useMemo(() => attendance.filter(record => {
    const searchMatch = record.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        record.teacherId.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = selectedStatus ? record.status === selectedStatus : true;
    return searchMatch && statusMatch;
  }), [attendance, searchTerm, selectedStatus]);

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Present</span>;
      case 'Absent':
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Absent</span>;
      case 'Checked Out':
        return <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-200 rounded-full">Checked Out</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h3 className="text-xl font-bold text-slate-700">Teacher Attendance Log</h3>
        <p className="text-sm text-slate-500">Today's Date: {new Date().toLocaleDateString()}</p>
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
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </div>
          <div className="relative flex-grow sm:flex-grow-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition appearance-none pr-8 bg-white"
            >
              <option value="">All Statuses</option>
              {attendanceStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
          </div>
          <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
            Reset Filters
          </button>
          <button
            onClick={handleRefreshList}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition flex items-center"
          >
            <i className="fa-solid fa-sync-alt mr-2"></i>
            Refresh List
          </button>
        </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Teacher ID</th>
              <th scope="col" className="px-6 py-3">Teacher Name</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Check-in Time</th>
              <th scope="col" className="px-6 py-3">Check-out Time</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map(record => (
              <tr key={record.teacherId} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4">
                  <code className="bg-slate-100 text-slate-800 font-mono font-semibold px-2 py-1 rounded-md text-sm">
                    {record.teacherId}
                  </code>
                </td>
                <td className="px-6 py-4">{record.teacherName}</td>
                <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                <td className="px-6 py-4">{record.checkInTime || '--:--'}</td>
                <td className="px-6 py-4">{record.checkOutTime || '--:--'}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => handleCheckIn(record.teacherId)}
                    disabled={record.status !== 'Absent'}
                    className="font-medium text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-xs disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                  >
                    Check In
                  </button>
                  <button
                    onClick={() => handleCheckOut(record.teacherId)}
                    disabled={record.status !== 'Present'}
                    className="font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-xs disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                  >
                    Check Out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;